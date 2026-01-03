import { View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';

export default function ImageToPdfScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [images, setImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
    const [loading, setLoading] = useState(false);

    const pickImage = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                setImages(prev => [...prev, ...result.assets]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick images');
        }
    };

    const removeImage = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setImages(images.filter((_, idx) => idx !== index));
    };

    const convertToPdf = async () => {
        if (images.length === 0) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setLoading(true);

        try {
            const pdfDoc = await PDFDocument.create();

            for (const img of images) {
                const imgBase64 = await FileSystem.readAsStringAsync(img.uri, {
                    encoding: FileSystem.EncodingType.Base64
                });

                let imageEmbed;
                try {
                    imageEmbed = await pdfDoc.embedJpg(imgBase64);
                } catch (e) {
                    try {
                        imageEmbed = await pdfDoc.embedPng(imgBase64);
                    } catch (e2) {
                        console.log('Skipping unsupported image format');
                        continue;
                    }
                }

                const page = pdfDoc.addPage();
                const { width, height } = imageEmbed.scaleToFit(page.getWidth() - 40, page.getHeight() - 40);
                page.drawImage(imageEmbed, {
                    x: page.getWidth() / 2 - width / 2,
                    y: page.getHeight() / 2 - height / 2,
                    width,
                    height,
                });
            }

            const base64 = await pdfDoc.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'images.pdf';
            await FileSystem.writeAsStringAsync(uri, base64, {
                encoding: FileSystem.EncodingType.Base64
            });

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Success', 'PDF Created!');
            }
        } catch (err) {
            console.error(err);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Error', 'Conversion failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <Stack.Screen
                options={{
                    title: 'Images to PDF',
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
                {/* Add Images Button */}
                <TouchableOpacity
                    onPress={pickImage}
                    className={`p-5 rounded-2xl border-2 border-dashed mb-4 items-center ${isDark ? 'border-pink-500 bg-pink-900/20' : 'border-pink-300 bg-pink-50'
                        }`}
                >
                    <Text className="text-3xl mb-2">🖼️</Text>
                    <Text className={`font-bold text-lg ${isDark ? 'text-pink-400' : 'text-pink-600'}`}>
                        + Add Images
                    </Text>
                    <Text className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        JPG, PNG supported
                    </Text>
                </TouchableOpacity>

                {/* Image Grid */}
                {images.length > 0 && (
                    <View className="mb-4">
                        <Text className={`font-semibold text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            SELECTED IMAGES ({images.length})
                        </Text>
                        <View className="flex-row flex-wrap gap-3">
                            {images.map((img, i) => (
                                <View
                                    key={i}
                                    className="relative"
                                    style={{ width: '30%', aspectRatio: 1 }}
                                >
                                    <Image
                                        source={{ uri: img.uri }}
                                        className="w-full h-full rounded-xl"
                                        style={{ backgroundColor: isDark ? '#334155' : '#e2e8f0' }}
                                    />
                                    <TouchableOpacity
                                        onPress={() => removeImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-7 h-7 items-center justify-center"
                                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 }}
                                    >
                                        <Text className="text-white font-bold text-xs">✕</Text>
                                    </TouchableOpacity>
                                    <View className={`absolute bottom-1 left-1 px-2 py-0.5 rounded ${isDark ? 'bg-black/60' : 'bg-white/80'}`}>
                                        <Text className={`text-xs font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}>
                                            {i + 1}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {/* Empty State */}
                {images.length === 0 && (
                    <View className="items-center py-12">
                        <Text className="text-5xl mb-4">📷</Text>
                        <Text className={`text-lg font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            No images selected
                        </Text>
                        <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            Add images to convert to PDF
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Bottom Action Bar */}
            <View
                className={`absolute bottom-0 left-0 right-0 p-4 ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                style={{ borderTopWidth: 1, borderTopColor: isDark ? '#334155' : '#e2e8f0' }}
            >
                <TouchableOpacity
                    onPress={convertToPdf}
                    disabled={images.length === 0 || loading}
                    className={`p-4 rounded-2xl items-center flex-row justify-center ${images.length === 0 || loading
                            ? (isDark ? 'bg-slate-700' : 'bg-slate-200')
                            : 'bg-pink-500'
                        }`}
                    style={images.length > 0 && !loading ? { shadowColor: '#ec4899', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 } : {}}
                >
                    {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 10 }} />}
                    <Text className={`font-bold text-lg ${images.length === 0 || loading ? (isDark ? 'text-slate-400' : 'text-slate-400') : 'text-white'}`}>
                        {loading ? 'Converting...' : (images.length === 0 ? 'Add Images First' : `Convert ${images.length} Image${images.length > 1 ? 's' : ''} to PDF`)}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
