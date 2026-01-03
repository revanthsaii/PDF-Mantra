import { View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import * as Haptics from 'expo-haptics';

interface CapturedImage {
    uri: string;
}

export default function ScanDocumentScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [images, setImages] = useState<CapturedImage[]>([]);
    const [showCamera, setShowCamera] = useState(false);
    const [loading, setLoading] = useState(false);
    const cameraRef = useRef<CameraView>(null);

    if (!permission) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 items-center justify-center bg-white p-4">
                <Stack.Screen options={{ title: 'Scan Document' }} />
                <Text className="text-slate-700 text-lg mb-4 text-center">
                    Camera access is required to scan documents
                </Text>
                <TouchableOpacity
                    onPress={requestPermission}
                    className="bg-blue-600 p-4 rounded-xl"
                >
                    <Text className="text-white font-bold text-lg">Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const takePicture = async () => {
        if (cameraRef.current) {
            try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                const photo = await cameraRef.current.takePictureAsync({
                    quality: 0.8,
                });

                if (photo) {
                    setImages(prev => [...prev, { uri: photo.uri }]);
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Error', 'Failed to capture image');
            }
        }
    };

    const convertToPdf = async () => {
        if (images.length === 0) {
            Alert.alert('No Images', 'Please capture at least one image');
            return;
        }

        setLoading(true);
        try {
            const pdfDoc = await PDFDocument.create();

            for (const img of images) {
                const imgBase64 = await FileSystem.readAsStringAsync(img.uri, {
                    encoding: 'base64'
                });

                let imageEmbed;
                try {
                    imageEmbed = await pdfDoc.embedJpg(imgBase64);
                } catch (e) {
                    try {
                        imageEmbed = await pdfDoc.embedPng(imgBase64);
                    } catch (e2) {
                        console.log('Skipping image, not JPG/PNG');
                        continue;
                    }
                }

                const page = pdfDoc.addPage();
                const { width, height } = imageEmbed.scaleToFit(page.getWidth(), page.getHeight());
                page.drawImage(imageEmbed, {
                    x: page.getWidth() / 2 - width / 2,
                    y: page.getHeight() / 2 - height / 2,
                    width,
                    height,
                });
            }

            const base64 = await pdfDoc.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'scanned-document.pdf';
            await FileSystem.writeAsStringAsync(uri, base64, { encoding: 'base64' });

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Success', 'PDF Created!');
            }

            setImages([]);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Conversion failed');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    if (showCamera) {
        return (
            <View className="flex-1 bg-black">
                <Stack.Screen options={{ title: 'Camera', headerShown: false }} />
                <CameraView
                    ref={cameraRef}
                    style={StyleSheet.absoluteFillObject}
                    facing="back"
                />

                {/* Controls */}
                <View className="absolute bottom-0 left-0 right-0 pb-8 px-4">
                    <View className="flex-row items-center justify-between">
                        <TouchableOpacity
                            onPress={() => setShowCamera(false)}
                            className="bg-white/20 p-4 rounded-full"
                        >
                            <Text className="text-white font-bold text-xl">✕</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={takePicture}
                            className="bg-white w-20 h-20 rounded-full items-center justify-center border-4 border-blue-600"
                        >
                            <View className="bg-blue-600 w-16 h-16 rounded-full" />
                        </TouchableOpacity>

                        <View className="bg-white/20 px-4 py-2 rounded-full">
                            <Text className="text-white font-bold text-lg">{images.length}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white p-4">
            <Stack.Screen options={{ title: 'Scan Document' }} />

            {loading && (
                <View className="absolute inset-0 z-50 bg-black/50 items-center justify-center">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-white mt-2 font-bold">Converting to PDF...</Text>
                </View>
            )}

            <TouchableOpacity
                onPress={() => setShowCamera(true)}
                className="bg-blue-600 p-4 rounded-xl mb-4 items-center"
            >
                <Text className="text-white font-bold text-lg">📷 Open Camera</Text>
            </TouchableOpacity>

            <Text className="text-slate-600 font-semibold mb-2">
                Captured Images ({images.length})
            </Text>

            <ScrollView className="flex-1 mb-4">
                <View className="flex-row flex-wrap gap-2">
                    {images.map((img, i) => (
                        <View key={i} className="w-24 h-32 relative">
                            <Image source={{ uri: img.uri }} className="w-full h-full rounded-lg" />
                            <TouchableOpacity
                                onPress={() => {
                                    setImages(images.filter((_, idx) => idx !== i));
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                className="absolute top-1 right-1 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                            >
                                <Text className="text-white font-bold text-xs">✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {images.length === 0 && (
                    <View className="items-center justify-center py-12">
                        <Text className="text-slate-400 text-center">
                            No images captured yet.{'\n'}Tap "Open Camera" to start scanning.
                        </Text>
                    </View>
                )}
            </ScrollView>

            <View className="gap-2">
                {images.length > 0 && (
                    <TouchableOpacity
                        onPress={() => {
                            setImages([]);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        className="bg-slate-200 p-4 rounded-xl items-center"
                    >
                        <Text className="text-slate-700 font-bold text-lg">Clear All</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    onPress={convertToPdf}
                    disabled={images.length === 0}
                    className={`p-4 rounded-xl items-center ${images.length === 0 ? 'bg-slate-300' : 'bg-green-600'
                        }`}
                >
                    <Text className="text-white font-bold text-lg">Convert to PDF</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
