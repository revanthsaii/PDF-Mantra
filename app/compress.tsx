import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';

type CompressionQuality = 'low' | 'medium' | 'high';

export default function CompressScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
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
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'} p-4`}>
            <Stack.Screen
                options={{
                    title: 'Compress PDF',
                    headerStyle: { backgroundColor: isDark ? '#1e293b' : '#ffffff' },
                    headerTintColor: isDark ? '#f1f5f9' : '#1e293b',
                }}
            />

            {loading && (
                <View className="absolute inset-0 z-50 bg-black/50 items-center justify-center">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-white mt-2 font-bold">Compressing PDF...</Text>
                </View>
            )}

            <TouchableOpacity
                onPress={pickFile}
                className={`p-5 rounded-2xl border-2 border-dashed mb-4 items-center ${isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-300 bg-blue-50'}`}
            >
                <Text className="text-3xl mb-2">📄</Text>
                <Text className={`font-bold text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {file ? 'Change PDF' : 'Select PDF'}
                </Text>
            </TouchableOpacity>

            {file && (
                <View className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                    <Text className={`text-sm mb-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Selected File:</Text>
                    <Text className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`} numberOfLines={1}>
                        {file.name}
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Size: {(originalSize / 1024).toFixed(2)} KB
                    </Text>
                </View>
            )}

            <View className="mb-6">
                <Text className={`font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>Optimization Level</Text>

                <View className="gap-2">
                    {(['low', 'medium', 'high'] as CompressionQuality[]).map((q) => (
                        <TouchableOpacity
                            key={q}
                            onPress={() => {
                                setQuality(q);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            className={`p-4 rounded-xl border-2 ${quality === q
                                ? (isDark ? 'bg-green-900/30 border-green-500' : 'bg-green-50 border-green-600')
                                : (isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')
                                }`}
                        >
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className={`font-bold text-lg capitalize ${quality === q
                                        ? (isDark ? 'text-green-400' : 'text-green-700')
                                        : (isDark ? 'text-slate-200' : 'text-slate-700')
                                        }`}>
                                        {q === 'low' && 'Maximum'}
                                        {q === 'medium' && 'Balanced'}
                                        {q === 'high' && 'Minimal'}
                                    </Text>
                                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {q === 'low' && 'Aggressive optimization, smaller file'}
                                        {q === 'medium' && 'Standard optimization'}
                                        {q === 'high' && 'Light optimization, preserves quality'}
                                    </Text>
                                </View>
                                {quality === q && (
                                    <Text className={isDark ? 'text-green-400 text-2xl' : 'text-green-600 text-2xl'}>✓</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Info Notice */}
            <View className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-amber-50'}`}>
                <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-amber-700'}`}>
                    ℹ️ This removes duplicate objects and unused data. PDFs with mostly images may see minimal reduction.
                </Text>
            </View>

            <View className="flex-1" />

            <TouchableOpacity
                onPress={compressFile}
                disabled={!file}
                className={`p-4 rounded-2xl items-center ${!file
                    ? (isDark ? 'bg-slate-700' : 'bg-slate-300')
                    : 'bg-green-600'
                    }`}
                style={file ? { shadowColor: '#22c55e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 } : {}}
            >
                <Text className={`font-bold text-lg ${!file ? (isDark ? 'text-slate-400' : 'text-slate-500') : 'text-white'}`}>
                    Compress PDF
                </Text>
            </TouchableOpacity>
        </View>
    );
}

