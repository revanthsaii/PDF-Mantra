import { View, Text, TouchableOpacity, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

type PageItem = {
    key: string;
    originalIndex: number;
    label: string;
};

export default function ReorderScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loading, setLoading] = useState(false);

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
                const count = pdf.getPageCount();

                const newPages = Array.from({ length: count }, (_, i) => ({
                    key: `page-${i}`,
                    originalIndex: i,
                    label: `Page ${i + 1}`
                }));
                setPages(newPages);
                setLoading(false);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to load file');
            setLoading(false);
        }
    };

    const saveReordered = async () => {
        if (!file || pages.length === 0) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);
        try {
            const content = await FileSystem.readAsStringAsync(file.uri, {
                encoding: FileSystem.EncodingType.Base64
            });
            const srcPdf = await PDFDocument.load(content);
            const newPdf = await PDFDocument.create();

            const indices = pages.map(p => p.originalIndex);
            const copiedPages = await newPdf.copyPages(srcPdf, indices);
            copiedPages.forEach((page) => newPdf.addPage(page));

            const base64 = await newPdf.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'reordered.pdf';
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Success', 'Saved!');
            }
        } catch (err) {
            console.error(err);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item, drag, isActive }: RenderItemParams<PageItem>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        drag();
                    }}
                    disabled={isActive}
                    className={`p-4 mb-2 rounded-xl flex-row items-center ${isActive
                        ? (isDark ? 'bg-teal-800 border-2 border-teal-400' : 'bg-teal-100 border-2 border-teal-500')
                        : (isDark ? 'bg-slate-800' : 'bg-white border border-slate-200')
                        }`}
                    style={isActive ? { transform: [{ scale: 1.02 }] } : {}}
                >
                    <Text className="text-2xl mr-3">📄</Text>
                    <View className="flex-1">
                        <Text className={`font-semibold text-lg ${isActive
                            ? (isDark ? 'text-teal-300' : 'text-teal-700')
                            : (isDark ? 'text-white' : 'text-slate-800')
                            }`}>
                            {item.label}
                        </Text>
                        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Original: Page {item.originalIndex + 1}
                        </Text>
                    </View>
                    <Text className={`text-lg ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>☰</Text>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <GestureHandlerRootView className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <Stack.Screen
                options={{
                    title: 'Reorder Pages',
                    headerShown: true,
                    headerStyle: { backgroundColor: isDark ? '#1e293b' : '#ffffff' },
                    headerTintColor: isDark ? '#f1f5f9' : '#1e293b',
                }}
            />

            {/* Loading state is now inline in button */}

            <View className="flex-1 p-4">
                {!file ? (
                    <TouchableOpacity
                        onPress={pickFile}
                        className={`p-8 rounded-2xl border-2 border-dashed items-center justify-center ${isDark ? 'border-teal-500 bg-teal-900/20' : 'border-teal-300 bg-teal-50'
                            }`}
                        style={{ minHeight: 200 }}
                    >
                        <Text className="text-5xl mb-4">🔄</Text>
                        <Text className={`font-bold text-xl ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                            Select PDF to Reorder
                        </Text>
                        <Text className={`text-sm mt-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Long press and drag pages to reorder
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View className="flex-1">
                        {/* File Info & Actions */}
                        <View className={`flex-row items-center justify-between p-3 rounded-xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                            <View className="flex-row items-center flex-1">
                                <Text className="text-xl mr-2">📄</Text>
                                <Text
                                    className={`font-medium flex-1 ${isDark ? 'text-white' : 'text-slate-800'}`}
                                    numberOfLines={1}
                                >
                                    {file.name}
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setFile(null);
                                    setPages([]);
                                }}
                                className={`px-3 py-1.5 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}
                            >
                                <Text className={`font-medium text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Change</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Instructions */}
                        <View className={`flex-row items-center p-3 rounded-xl mb-4 ${isDark ? 'bg-teal-900/30' : 'bg-teal-50'}`}>
                            <Text className="text-lg mr-2">💡</Text>
                            <Text className={`flex-1 text-sm ${isDark ? 'text-teal-300' : 'text-teal-700'}`}>
                                Long press a page and drag to reorder
                            </Text>
                        </View>

                        {/* Page List */}
                        <DraggableFlatList
                            data={pages}
                            onDragEnd={({ data }) => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setPages(data);
                            }}
                            keyExtractor={(item) => item.key}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 100 }}
                        />

                        {/* Save Button */}
                        <View
                            className={`absolute bottom-0 left-0 right-0 p-4 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}
                            style={{ marginLeft: -16, marginRight: -16 }}
                        >
                            <TouchableOpacity
                                onPress={saveReordered}
                                disabled={loading}
                                className={`p-4 rounded-2xl items-center flex-row justify-center ${loading ? (isDark ? 'bg-slate-700' : 'bg-slate-300') : 'bg-teal-500'}`}
                                style={!loading ? { shadowColor: '#14b8a6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 } : {}}
                            >
                                {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />}
                                <Text className={`font-bold text-lg ${loading ? (isDark ? 'text-slate-400' : 'text-slate-500') : 'text-white'}`}>
                                    {loading ? 'Saving...' : 'Save Reordered PDF'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </GestureHandlerRootView>
    );
}
