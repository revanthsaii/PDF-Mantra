import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import { useState } from 'react';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';

export default function MergeScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [files, setFiles] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
    const [loading, setLoading] = useState(false);

    const pickFile = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
                multiple: true
            });

            if (!result.canceled) {
                setFiles(prev => [...prev, ...result.assets]);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const removeFile = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFiles(files.filter((_, idx) => idx !== index));
    };

    const mergeFiles = async () => {
        if (files.length < 2) {
            Alert.alert('Select at least 2 files');
            return;
        }

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        try {
            const mergedPdf = await PDFDocument.create();

            for (const file of files) {
                const fileContent = await FileSystem.readAsStringAsync(file.uri, {
                    encoding: FileSystem.EncodingType.Base64
                });
                const pdf = await PDFDocument.load(fileContent);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            }

            const base64 = await mergedPdf.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'merged.pdf';
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                router.push({ pathname: '/viewer', params: { uri, name: 'Merged.pdf' } });
            }
        } catch (error) {
            console.error(error);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Merge failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <Stack.Screen
                options={{
                    title: 'Merge PDF',
                    headerShown: true,
                    headerStyle: { backgroundColor: isDark ? '#1e293b' : '#ffffff' },
                    headerTintColor: isDark ? '#f1f5f9' : '#1e293b',
                }}
            />

            {/* Loading state is now inline in button */}

            <ScrollView
                className="flex-1 p-4"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* Add Files Button */}
                <TouchableOpacity
                    onPress={pickFile}
                    className={`p-5 rounded-2xl border-2 border-dashed mb-4 items-center ${isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-300 bg-blue-50'
                        }`}
                >
                    <Text className="text-3xl mb-2">📄</Text>
                    <Text className={`font-bold text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        + Add PDF Files
                    </Text>
                    <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Tap to select PDFs to merge
                    </Text>
                </TouchableOpacity>

                {/* File List */}
                {files.length > 0 && (
                    <View className="mb-4">
                        <Text className={`font-semibold text-sm mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            SELECTED FILES ({files.length})
                        </Text>
                        {files.map((f, i) => (
                            <View
                                key={i}
                                className={`flex-row items-center p-4 rounded-xl mb-2 ${isDark ? 'bg-slate-800' : 'bg-slate-50'
                                    }`}
                            >
                                <Text className={`text-lg mr-3`}>📄</Text>
                                <View className="flex-1">
                                    <Text
                                        className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                                        numberOfLines={1}
                                    >
                                        {f.name}
                                    </Text>
                                    <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                        Position: {i + 1}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => removeFile(i)}
                                    className={`p-2 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}
                                >
                                    <Text className="text-red-500 font-bold">✕</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Empty State */}
                {files.length === 0 && (
                    <View className="items-center py-12">
                        <Text className="text-5xl mb-4">📑</Text>
                        <Text className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            No files selected
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Add at least 2 PDFs to merge
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Action Bar */}
            <View className={`absolute bottom-0 left-0 right-0 p-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                style={{ borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#e2e8f0' }}>
                <TouchableOpacity
                    onPress={mergeFiles}
                    disabled={files.length < 2 || loading}
                    className={`p-4 rounded-2xl items-center flex-row justify-center ${files.length < 2 || loading
                            ? (isDark ? 'bg-slate-700' : 'bg-slate-200')
                            : 'bg-blue-600'
                        }`}
                    style={files.length >= 2 && !loading ? { shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 } : {}}
                >
                    {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />}
                    <Text className={`font-bold text-lg ${files.length < 2 || loading ? (isDark ? 'text-slate-400' : 'text-slate-400') : 'text-white'}`}>
                        {loading ? 'Merging...' : (files.length < 2 ? `Add ${2 - files.length} More File${files.length === 1 ? '' : 's'}` : 'Merge PDFs')}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
