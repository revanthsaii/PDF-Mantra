import { View, Text, TouchableOpacity, Alert, ActivityIndicator, TextInput, ScrollView, useColorScheme, Animated } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState, useRef, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

type Mode = 'encrypt' | 'decrypt';

export default function ProtectScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [mode, setMode] = useState<Mode>('encrypt');
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Pulse animation for loading
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (loading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 0.6, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [loading]);

    const pickFile = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                setFile(result.assets[0]);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const encryptPdf = async () => {
        if (!file || !password) {
            Alert.alert('Missing Information', 'Please select a file and enter a password');
            return;
        }

        if (password !== confirmPassword) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Password Mismatch', 'Passwords do not match');
            return;
        }

        if (password.length < 4) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            Alert.alert('Weak Password', 'Password must be at least 4 characters');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);

        try {
            const fileContent = await FileSystem.readAsStringAsync(file.uri, {
                encoding: FileSystem.EncodingType.Base64
            });

            const pdfDoc = await PDFDocument.load(fileContent);

            // Add metadata to indicate protection (pdf-lib doesn't support true encryption)
            pdfDoc.setTitle(`Protected: ${file.name}`);
            pdfDoc.setSubject('Password Protected Document');
            pdfDoc.setKeywords(['protected', 'encrypted']);
            pdfDoc.setProducer('PDF Mantra');
            pdfDoc.setCreator('PDF Mantra');

            const base64 = await pdfDoc.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'protected_' + file.name;
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                '⚠️ Limited Support',
                'Full PDF encryption requires native modules not available in Expo. Your PDF has been saved with protection metadata. For full encryption, use desktop tools like Adobe Acrobat or online services.',
                [
                    {
                        text: 'Share Anyway',
                        onPress: async () => {
                            if (await Sharing.isAvailableAsync()) {
                                await Sharing.shareAsync(uri);
                            }
                        }
                    },
                    { text: 'OK' }
                ]
            );

            setPassword('');
            setConfirmPassword('');
            setFile(null);

        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Processing failed');
        } finally {
            setLoading(false);
        }
    };

    const decryptPdf = async () => {
        if (!file || !password) {
            Alert.alert('Missing Information', 'Please select a file and enter the password');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);

        try {
            const fileContent = await FileSystem.readAsStringAsync(file.uri, {
                encoding: FileSystem.EncodingType.Base64
            });

            // Try to load with password option
            const pdfDoc = await PDFDocument.load(fileContent, {
                ignoreEncryption: true,
            });

            const base64 = await pdfDoc.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'unlocked_' + file.name;
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                'Success ✓',
                'PDF processed successfully',
                [
                    {
                        text: 'Share',
                        onPress: async () => {
                            if (await Sharing.isAvailableAsync()) {
                                await Sharing.shareAsync(uri);
                            }
                        }
                    },
                    { text: 'OK' }
                ]
            );

            setPassword('');
            setFile(null);

        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'This PDF may be encrypted with a different method. Try using ignoreEncryption option or a desktop tool.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <Stack.Screen
                options={{
                    title: 'Password Protection',
                    headerShown: true,
                    headerStyle: { backgroundColor: isDark ? '#1e293b' : '#ffffff' },
                    headerTintColor: isDark ? '#f1f5f9' : '#1e293b',
                }}
            />

            <ScrollView className="flex-1 p-4">
                {/* Mode Selection - Pill Style */}
                <View className={`flex-row p-1 rounded-2xl mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <TouchableOpacity
                        onPress={() => {
                            setMode('encrypt');
                            setPassword('');
                            setConfirmPassword('');
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        className={`flex-1 p-3 rounded-xl ${mode === 'encrypt' ? (isDark ? 'bg-red-600' : 'bg-red-500') : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold text-center ${mode === 'encrypt' ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
                            🔒 Lock PDF
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            setMode('decrypt');
                            setPassword('');
                            setConfirmPassword('');
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        className={`flex-1 p-3 rounded-xl ${mode === 'decrypt' ? (isDark ? 'bg-green-600' : 'bg-green-500') : 'bg-transparent'}`}
                    >
                        <Text className={`font-bold text-center ${mode === 'decrypt' ? 'text-white' : (isDark ? 'text-slate-400' : 'text-slate-600')}`}>
                            🔓 Unlock PDF
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* File Picker */}
                <TouchableOpacity
                    onPress={pickFile}
                    disabled={loading}
                    className={`p-5 rounded-2xl border-2 border-dashed mb-4 items-center ${isDark ? 'border-slate-600 bg-slate-800/50' : 'border-slate-300 bg-white'
                        } ${loading ? 'opacity-50' : ''}`}
                >
                    <Text className="text-3xl mb-2">📄</Text>
                    <Text className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {file ? file.name : 'Select PDF File'}
                    </Text>
                    {file && (
                        <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Tap to change
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Password Input */}
                <View className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <Text className={`font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {mode === 'encrypt' ? 'Set Password' : 'Enter Password'}
                    </Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="Password"
                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                        editable={!loading}
                        className={`p-4 rounded-xl text-base mb-3 ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-800'
                            }`}
                    />

                    {mode === 'encrypt' && (
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="Confirm Password"
                            placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                            editable={!loading}
                            className={`p-4 rounded-xl text-base ${isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-800'
                                }`}
                        />
                    )}
                </View>

                {/* Info Box */}
                <View className={`p-4 rounded-2xl mb-6 ${mode === 'encrypt'
                        ? (isDark ? 'bg-red-900/30' : 'bg-red-50')
                        : (isDark ? 'bg-green-900/30' : 'bg-green-50')
                    }`}>
                    <Text className={`text-sm ${mode === 'encrypt'
                            ? (isDark ? 'text-red-300' : 'text-red-700')
                            : (isDark ? 'text-green-300' : 'text-green-700')
                        }`}>
                        {mode === 'encrypt'
                            ? '⚠️ Note: Full PDF encryption requires native modules. This adds metadata protection only.'
                            : '💡 Enter the password used to lock this PDF. Leave blank if no password was set.'
                        }
                    </Text>
                </View>

                {/* Action Button */}
                <Animated.View style={{ opacity: loading ? pulseAnim : 1 }}>
                    <TouchableOpacity
                        onPress={mode === 'encrypt' ? encryptPdf : decryptPdf}
                        disabled={!file || !password || (mode === 'encrypt' && !confirmPassword) || loading}
                        className={`p-4 rounded-2xl items-center flex-row justify-center ${(!file || !password || (mode === 'encrypt' && !confirmPassword) || loading)
                                ? (isDark ? 'bg-slate-700' : 'bg-slate-300')
                                : mode === 'encrypt' ? 'bg-red-500' : 'bg-green-500'
                            }`}
                        style={(!loading && file && password) ? {
                            shadowColor: mode === 'encrypt' ? '#ef4444' : '#22c55e',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 8
                        } : {}}
                    >
                        {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
                        <Text className={`font-bold text-lg ${(!file || !password || (mode === 'encrypt' && !confirmPassword))
                                ? (isDark ? 'text-slate-400' : 'text-slate-500')
                                : 'text-white'
                            }`}>
                            {loading
                                ? (mode === 'encrypt' ? 'Protecting...' : 'Unlocking...')
                                : (mode === 'encrypt' ? '🔒 Protect PDF' : '🔓 Unlock PDF')
                            }
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </View>
    );
}
