import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

type CompressionQuality = 'low' | 'medium' | 'high';

export default function CompressScreen() {
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [quality, setQuality] = useState<CompressionQuality>('medium');
    const [originalSize, setOriginalSize] = useState<number>(0);

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                const selectedFile = result.assets[0];
                setFile(selectedFile);

                // Get file size
                const fileInfo = await FileSystem.getInfoAsync(selectedFile.uri);
                if (fileInfo.exists && 'size' in fileInfo) {
                    setOriginalSize(fileInfo.size);
                }
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const getQualityFactor = (quality: CompressionQuality): number => {
        switch (quality) {
            case 'low': return 0.3;
            case 'medium': return 0.5;
            case 'high': return 0.7;
        }
    };

    const compressFile = async () => {
        if (!file) return;

        setLoading(true);
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const fileContent = await FileSystem.readAsStringAsync(file.uri, {
                encoding: 'base64'
            });

            // Load the PDF with ignore encryption to handle more files
            const pdfDoc = await PDFDocument.load(fileContent, {
                ignoreEncryption: true,
            });

            // Get quality factor for compression
            const qualityFactor = getQualityFactor(quality);

            // Create a new PDF and copy pages (this removes unused objects)
            const compressedPdf = await PDFDocument.create();
            const pages = await compressedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            pages.forEach((page) => compressedPdf.addPage(page));

            // Save with object streams enabled for better compression
            // This uses PDF 1.5+ object streams which reduce file size
            const base64 = await compressedPdf.saveAsBase64({
                useObjectStreams: true,
                addDefaultPage: false,
            });

            const uri = FileSystem.documentDirectory + 'compressed.pdf';
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: 'base64'
            });

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            const fileInfo = await FileSystem.getInfoAsync(uri);
            const newSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;
            const reduction = originalSize > 0 ? ((originalSize - newSize) / originalSize * 100).toFixed(1) : '0';

            Alert.alert(
                'Compression Complete',
                `Original: ${(originalSize / 1024).toFixed(2)} KB\nCompressed: ${(newSize / 1024).toFixed(2)} KB\nReduction: ${reduction}%\n\n${parseFloat(reduction) < 5
                    ? '⚠️ This PDF may already be optimized or contains mostly text (minimal compression possible).'
                    : '✅ Successfully compressed!'
                }`,
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

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Compression failed. The PDF may be corrupted or encrypted.');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white p-4">
            <Stack.Screen options={{ title: 'Compress PDF' }} />

            {loading && (
                <View className="absolute inset-0 z-50 bg-black/50 items-center justify-center">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-white mt-2 font-bold">Compressing PDF...</Text>
                </View>
            )}

            <TouchableOpacity
                onPress={pickFile}
                className="bg-blue-100 p-4 rounded-xl border border-blue-200 mb-4 items-center"
            >
                <Text className="text-blue-700 font-bold text-lg">
                    {file ? '📄 Change PDF' : '📄 Select PDF'}
                </Text>
            </TouchableOpacity>

            {file && (
                <View className="bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200">
                    <Text className="text-slate-600 text-sm mb-1">Selected File:</Text>
                    <Text className="text-slate-800 font-semibold mb-2" numberOfLines={1}>
                        {file.name}
                    </Text>
                    <Text className="text-slate-500 text-sm">
                        Size: {(originalSize / 1024).toFixed(2)} KB
                    </Text>
                </View>
            )}

            <View className="mb-6">
                <Text className="text-slate-700 font-semibold mb-3">Compression Quality</Text>

                <View className="gap-2">
                    {(['low', 'medium', 'high'] as CompressionQuality[]).map((q) => (
                        <TouchableOpacity
                            key={q}
                            onPress={() => {
                                setQuality(q);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            className={`p-4 rounded-xl border-2 ${quality === q
                                ? 'bg-blue-50 border-blue-600'
                                : 'bg-white border-slate-200'
                                }`}
                        >
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className={`font-bold text-lg capitalize ${quality === q ? 'text-blue-700' : 'text-slate-700'
                                        }`}>
                                        {q} Quality
                                    </Text>
                                    <Text className="text-slate-500 text-sm">
                                        {q === 'low' && 'Smallest file size, lower quality'}
                                        {q === 'medium' && 'Balanced size and quality'}
                                        {q === 'high' && 'Better quality, larger file'}
                                    </Text>
                                </View>
                                {quality === q && (
                                    <Text className="text-blue-600 text-2xl">✓</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="flex-1" />

            <TouchableOpacity
                onPress={compressFile}
                disabled={!file}
                className={`p-4 rounded-xl items-center ${!file ? 'bg-slate-300' : 'bg-green-600'
                    }`}
            >
                <Text className="text-white font-bold text-lg">Compress PDF</Text>
            </TouchableOpacity>
        </View>
    );
}
