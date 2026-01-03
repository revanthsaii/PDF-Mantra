import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, useColorScheme, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';

export default function SplitScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [range, setRange] = useState({ start: '1', end: '1' });
    const [loading, setLoading] = useState(false);
    const [pageCount, setPageCount] = useState(0);

    const pickFile = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true
            });

            if (!result.canceled) {
                setLoading(true);
                const asset = result.assets[0];
                setFile(asset);

                const content = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: FileSystem.EncodingType.Base64
                });
                const pdf = await PDFDocument.load(content);
                setPageCount(pdf.getPageCount());
                setRange({ start: '1', end: String(pdf.getPageCount()) });
                setLoading(false);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to load file');
            setLoading(false);
        }
    };

    const splitPdf = async () => {
        if (!file || pageCount === 0) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        try {
            const start = parseInt(range.start) - 1;
            const end = parseInt(range.end) - 1;

            if (isNaN(start) || isNaN(end) || start < 0 || end >= pageCount || start > end) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                Alert.alert('Invalid Range', `Please enter a valid range between 1 and ${pageCount}`);
                setLoading(false);
                return;
            }

            const content = await FileSystem.readAsStringAsync(file.uri, {
                encoding: FileSystem.EncodingType.Base64
            });
            const srcPdf = await PDFDocument.load(content);
            const newPdf = await PDFDocument.create();

            const indices = [];
            for (let i = start; i <= end; i++) indices.push(i);

            const copiedPages = await newPdf.copyPages(srcPdf, indices);
            copiedPages.forEach((page) => newPdf.addPage(page));

            const base64 = await newPdf.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'split.pdf';
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Success', 'Saved to ' + uri);
            }
        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Split failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <Stack.Screen
                options={{
                    title: 'Split PDF',
                    headerShown: true,
                    headerStyle: { backgroundColor: isDark ? '#1e293b' : '#ffffff' },
                    headerTintColor: isDark ? '#f1f5f9' : '#1e293b',
                }}
            />

            {/* Loading state is now inline in button */}

            <ScrollView className="flex-1 p-4">
                {!file ? (
                    <TouchableOpacity
                        onPress={pickFile}
                        className={`p-8 rounded-2xl border-2 border-dashed items-center justify-center ${isDark ? 'border-orange-500 bg-orange-900/20' : 'border-orange-300 bg-orange-50'
                            }`}
                        style={{ minHeight: 200 }}
                    >
                        <Text className="text-5xl mb-4">✂️</Text>
                        <Text className={`font-bold text-xl ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                            Select PDF to Split
                        </Text>
                        <Text className={`text-sm mt-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Choose a PDF file to extract pages from
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View>
                        {/* Selected File Card */}
                        <View className={`p-4 rounded-2xl mb-6 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <View className="flex-row items-center">
                                <Text className="text-3xl mr-3">📄</Text>
                                <View className="flex-1">
                                    <Text
                                        className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                                        numberOfLines={1}
                                    >
                                        {file.name}
                                    </Text>
                                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {pageCount} pages
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setFile(null);
                                    }}
                                    className={`px-4 py-2 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
                                >
                                    <Text className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Change</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Page Range Selection */}
                        <Text className={`font-bold text-lg mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Select Page Range
                        </Text>

                        <View className={`p-4 rounded-2xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <Text className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Enter pages 1 to {pageCount}
                            </Text>

                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Text className={`text-sm mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        From Page
                                    </Text>
                                    <TextInput
                                        value={range.start}
                                        onChangeText={t => setRange(p => ({ ...p, start: t.replace(/[^0-9]/g, '') }))}
                                        keyboardType="numeric"
                                        className={`p-4 rounded-xl text-center text-lg font-bold ${isDark
                                            ? 'bg-slate-700 text-white border border-slate-600'
                                            : 'bg-white text-slate-800 border border-slate-200'
                                            }`}
                                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                                    />
                                </View>

                                <View className="items-center justify-end pb-3">
                                    <Text className={`text-lg font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>to</Text>
                                </View>

                                <View className="flex-1">
                                    <Text className={`text-sm mb-2 font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        To Page
                                    </Text>
                                    <TextInput
                                        value={range.end}
                                        onChangeText={t => setRange(p => ({ ...p, end: t.replace(/[^0-9]/g, '') }))}
                                        keyboardType="numeric"
                                        className={`p-4 rounded-xl text-center text-lg font-bold ${isDark
                                            ? 'bg-slate-700 text-white border border-slate-600'
                                            : 'bg-white text-slate-800 border border-slate-200'
                                            }`}
                                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                                    />
                                </View>
                            </View>
                        </View>

                        {/* Quick Select Buttons */}
                        <View className="flex-row gap-2 mt-4">
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setRange({ start: '1', end: '1' });
                                }}
                                className={`flex-1 p-3 rounded-xl items-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                            >
                                <Text className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>First Page</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setRange({ start: String(pageCount), end: String(pageCount) });
                                }}
                                className={`flex-1 p-3 rounded-xl items-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                            >
                                <Text className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Last Page</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setRange({ start: '1', end: String(pageCount) });
                                }}
                                className={`flex-1 p-3 rounded-xl items-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                            >
                                <Text className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>All Pages</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Split Button */}
                        <TouchableOpacity
                            onPress={splitPdf}
                            disabled={loading}
                            className={`p-4 rounded-2xl items-center mt-8 flex-row justify-center ${loading ? (isDark ? 'bg-slate-700' : 'bg-slate-300') : 'bg-orange-500'}`}
                            style={!loading ? { shadowColor: '#f97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 } : {}}
                        >
                            {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />}
                            <Text className={`font-bold text-lg ${loading ? (isDark ? 'text-slate-400' : 'text-slate-500') : 'text-white'}`}>
                                {loading ? 'Extracting...' : `Extract Pages ${range.start} - ${range.end}`}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
