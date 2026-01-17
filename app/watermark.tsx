import { View, Text, TouchableOpacity, Alert, TextInput, ScrollView, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { LoadingOverlay } from '../components/common/LoadingOverlay';
import { ActionButton } from '../components/common/ActionButton';

type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'diagonal';

export default function WatermarkScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
    const [position, setPosition] = useState<WatermarkPosition>('diagonal');
    const [opacity, setOpacity] = useState(0.3);

    const positions: { value: WatermarkPosition; label: string }[] = [
        { value: 'diagonal', label: '↗️ Diagonal' },
        { value: 'center', label: '⊕ Center' },
        { value: 'top-left', label: '↖️ Top Left' },
        { value: 'top-right', label: '↗️ Top Right' },
        { value: 'bottom-left', label: '↙️ Bottom Left' },
        { value: 'bottom-right', label: '↘️ Bottom Right' },
    ];

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

    const applyWatermark = async () => {
        if (!file || !watermarkText.trim()) {
            Alert.alert('Missing Information', 'Please select a file and enter watermark text');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);

        try {
            const fileContent = await FileSystem.readAsStringAsync(file.uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            const pdfDoc = await PDFDocument.load(fileContent);
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();

            for (const page of pages) {
                const { width, height } = page.getSize();
                const fontSize = position === 'diagonal' ? Math.min(width, height) / 10 : 24;
                const textWidth = helveticaFont.widthOfTextAtSize(watermarkText, fontSize);
                const textHeight = fontSize;

                let x: number, y: number, rotate: number = 0;

                switch (position) {
                    case 'center':
                        x = (width - textWidth) / 2;
                        y = (height - textHeight) / 2;
                        break;
                    case 'top-left':
                        x = 20;
                        y = height - textHeight - 20;
                        break;
                    case 'top-right':
                        x = width - textWidth - 20;
                        y = height - textHeight - 20;
                        break;
                    case 'bottom-left':
                        x = 20;
                        y = 20;
                        break;
                    case 'bottom-right':
                        x = width - textWidth - 20;
                        y = 20;
                        break;
                    case 'diagonal':
                    default:
                        x = width / 2 - textWidth / 2;
                        y = height / 2;
                        rotate = -45;
                        break;
                }

                page.drawText(watermarkText, {
                    x,
                    y,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(0.5, 0.5, 0.5),
                    opacity: opacity,
                    rotate: rotate !== 0 ? degrees(rotate) : undefined,
                });
            }

            const base64 = await pdfDoc.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'watermarked_' + file.name;
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64,
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            Alert.alert(
                'Watermark Applied ✓',
                `Added "${watermarkText}" watermark to all ${pages.length} pages`,
                [
                    {
                        text: 'Share',
                        onPress: async () => {
                            if (await Sharing.isAvailableAsync()) {
                                await Sharing.shareAsync(uri);
                            }
                        },
                    },
                    { text: 'OK' },
                ]
            );
        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to apply watermark');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <Stack.Screen
                options={{
                    title: 'Add Watermark',
                    headerStyle: { backgroundColor: isDark ? '#1e293b' : '#ffffff' },
                    headerTintColor: isDark ? '#f1f5f9' : '#1e293b',
                }}
            />

            <LoadingOverlay visible={loading} message="Applying watermark..." />

            <ScrollView className="flex-1 p-4">
                {/* File Picker */}
                <TouchableOpacity
                    onPress={pickFile}
                    className={`p-5 rounded-2xl border-2 border-dashed mb-4 items-center ${isDark ? 'border-purple-500 bg-purple-900/20' : 'border-purple-300 bg-purple-50'
                        }`}
                >
                    <Text className="text-3xl mb-2">📄</Text>
                    <Text className={`font-bold text-lg ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                        {file ? file.name : 'Select PDF'}
                    </Text>
                </TouchableOpacity>

                {/* Watermark Text Input */}
                <View className={`p-4 rounded-2xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Text className={`font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        Watermark Text
                    </Text>
                    <TextInput
                        value={watermarkText}
                        onChangeText={setWatermarkText}
                        placeholder="Enter watermark text"
                        placeholderTextColor={isDark ? '#64748b' : '#94a3b8'}
                        className={`p-4 rounded-xl text-base ${isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-800'
                            }`}
                    />
                </View>

                {/* Position Selection */}
                <View className="mb-4">
                    <Text className={`font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        Position
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {positions.map((pos) => (
                            <TouchableOpacity
                                key={pos.value}
                                onPress={() => {
                                    setPosition(pos.value);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                className={`px-4 py-3 rounded-xl ${position === pos.value
                                    ? (isDark ? 'bg-purple-600' : 'bg-purple-500')
                                    : (isDark ? 'bg-slate-800' : 'bg-slate-100')
                                    }`}
                            >
                                <Text
                                    className={`font-medium ${position === pos.value
                                        ? 'text-white'
                                        : (isDark ? 'text-slate-300' : 'text-slate-600')
                                        }`}
                                >
                                    {pos.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Opacity Selection */}
                <View className="mb-6">
                    <Text className={`font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        Opacity
                    </Text>
                    <View className="flex-row gap-2">
                        {[0.1, 0.3, 0.5, 0.7].map((op) => (
                            <TouchableOpacity
                                key={op}
                                onPress={() => {
                                    setOpacity(op);
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                className={`flex-1 py-3 rounded-xl items-center ${opacity === op
                                    ? (isDark ? 'bg-purple-600' : 'bg-purple-500')
                                    : (isDark ? 'bg-slate-800' : 'bg-slate-100')
                                    }`}
                            >
                                <Text
                                    className={`font-medium ${opacity === op
                                        ? 'text-white'
                                        : (isDark ? 'text-slate-300' : 'text-slate-600')
                                        }`}
                                >
                                    {Math.round(op * 100)}%
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Preview Info */}
                <View className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-amber-50'}`}>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-amber-700'}`}>
                        💡 The watermark will be applied to all pages of the PDF with the selected position and opacity.
                    </Text>
                </View>
            </ScrollView>

            {/* Action Button */}
            <View className="p-4">
                <ActionButton
                    title="Apply Watermark"
                    onPress={applyWatermark}
                    disabled={!file || !watermarkText.trim()}
                    loading={loading}
                    variant="primary"
                />
            </View>
        </View>
    );
}
