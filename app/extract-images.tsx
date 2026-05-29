import { View, Text, ActivityIndicator, ScrollView, useColorScheme, Alert, Image, TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import { AnimatedPressable, FadeInView } from '../components/common';
import pdfService from '../modules/pdf/PDFService';

export default function ExtractImagesScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [imageCount, setImageCount] = useState<number | null>(null);
    const [extractedImages, setExtractedImages] = useState<string[]>([]);

    const pickFile = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                setFile(result.assets[0]);
                setImageCount(null); // Reset analysis
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const analyzeImages = async () => {
        if (!file) return;

        setLoading(true);
        setExtractedImages([]);
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const uris = await pdfService.extractImages(file.uri);
            setExtractedImages(uris);
            setImageCount(uris.length);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to extract images from PDF');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const saveImages = async () => {
        if (extractedImages.length === 0) return;
        
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (extractedImages.length === 1) {
                if (await Sharing.isAvailableAsync()) {
                    await Sharing.shareAsync(extractedImages[0]);
                }
            } else {
                Alert.alert(
                    'Export Images',
                    `Successfully extracted ${extractedImages.length} images! Tap the share button on each thumbnail to export them.`,
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to share images');
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}>
            <Stack.Screen
                options={{
                    title: '',
                    headerShown: true,
                    headerTransparent: true,
                    headerTintColor: '#fff',
                }}
            />

            {/* Gradient Header */}
            <LinearGradient
                colors={isDark ? ['#881337', '#4c0519'] : ['#f43f5e', '#fb7185']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    paddingTop: 100,
                    paddingBottom: 24,
                    paddingHorizontal: 24,
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                }}
            >
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                    Extract Images
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
                    Find and save images from PDF
                </Text>
            </LinearGradient>

            {loading && (
                <View style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 50,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <View style={{
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        padding: 24,
                        borderRadius: 20,
                        alignItems: 'center',
                    }}>
                        <ActivityIndicator size="large" color="#f43f5e" />
                        <Text style={{ color: isDark ? '#fff' : '#334155', marginTop: 12, fontWeight: '600' }}>
                            Scanning for images...
                        </Text>
                    </View>
                </View>
            )}

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* File Picker */}
                <FadeInView delay={100}>
                    <AnimatedPressable
                        onPress={pickFile}
                        scaleValue={0.98}
                        style={{
                            backgroundColor: isDark ? 'rgba(244, 63, 94, 0.1)' : 'rgba(244, 63, 94, 0.05)',
                            padding: 20,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderStyle: 'dashed',
                            borderColor: isDark ? '#f43f5e' : '#fda4af',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{ fontSize: 32, marginBottom: 8 }}>🖼️</Text>
                        <Text style={{ color: isDark ? '#fda4af' : '#f43f5e', fontWeight: '600', fontSize: 16 }}>
                            {file ? 'Change PDF' : 'Select PDF'}
                        </Text>
                    </AnimatedPressable>
                </FadeInView>

                {/* Selected File */}
                {file && (
                    <FadeInView delay={150}>
                        <View style={{
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff',
                            padding: 16,
                            borderRadius: 16,
                            marginBottom: 16,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }}>
                            <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, marginBottom: 4 }}>
                                SELECTED FILE
                            </Text>
                            <Text style={{ color: isDark ? '#fff' : '#1e293b', fontWeight: '600' }} numberOfLines={1}>
                                {file.name}
                            </Text>
                            <Text style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: 12, marginTop: 4 }}>
                                {(file.size ? (file.size / 1024 / 1024).toFixed(2) : '?')} MB
                            </Text>
                        </View>
                    </FadeInView>
                )}

                {/* Analyze/Extract Button */}
                <FadeInView delay={200}>
                    <AnimatedPressable
                        onPress={analyzeImages}
                        disabled={!file}
                        scaleValue={0.98}
                        style={{
                            backgroundColor: !file ? (isDark ? '#334155' : '#cbd5e1') : '#f43f5e',
                            padding: 16,
                            borderRadius: 16,
                            alignItems: 'center',
                            marginBottom: 16,
                            shadowColor: '#f43f5e',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: file ? 0.3 : 0,
                            shadowRadius: 8,
                            elevation: file ? 5 : 0,
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                            🔍 Find Images
                        </Text>
                    </AnimatedPressable>
                </FadeInView>

                {/* Results */}
                {imageCount !== null && (
                    <FadeInView delay={100}>
                        <View style={{
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff',
                            padding: 20,
                            borderRadius: 24,
                            marginBottom: 16,
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }}>
                            <Text style={{ fontSize: 40, marginBottom: 8 }}>📸</Text>
                            <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 14, marginBottom: 4 }}>
                                IMAGES EXTRACTED
                            </Text>
                            <Text style={{ color: isDark ? '#fff' : '#1e293b', fontSize: 32, fontWeight: 'bold' }}>
                                {imageCount}
                            </Text>
                            <Text style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: 12, marginTop: 8, textAlign: 'center' }}>
                                JPEG images successfully extracted
                            </Text>
                        </View>

                        {/* Extracted Images Grid */}
                        {extractedImages.length > 0 ? (
                            <View style={{ marginBottom: 24 }}>
                                <Text style={{
                                    fontSize: 13,
                                    fontWeight: '600',
                                    letterSpacing: 1,
                                    color: isDark ? '#94a3b8' : '#64748b',
                                    marginBottom: 12,
                                    marginTop: 8
                                }}>
                                    PREVIEW & SHARE
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                    {extractedImages.map((uri, idx) => (
                                        <View
                                            key={uri}
                                            style={{
                                                width: '31%',
                                                aspectRatio: 0.8,
                                                borderRadius: 12,
                                                overflow: 'hidden',
                                                backgroundColor: isDark ? '#1e293b' : '#fff',
                                                borderWidth: 1,
                                                borderColor: isDark ? '#334155' : '#e2e8f0',
                                                marginBottom: 10
                                            }}
                                        >
                                            <Image source={{ uri }} style={{ flex: 1, backgroundColor: isDark ? '#0f172a' : '#f1f5f9' }} resizeMode="cover" />
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                                    if (await Sharing.isAvailableAsync()) {
                                                        await Sharing.shareAsync(uri);
                                                    }
                                                }}
                                                style={{
                                                    paddingVertical: 6,
                                                    backgroundColor: isDark ? '#334155' : '#f1f5f9',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderTopWidth: 1,
                                                    borderTopColor: isDark ? '#475569' : '#e2e8f0'
                                                }}
                                            >
                                                <Text style={{ fontSize: 11, fontWeight: '600', color: isDark ? '#38bdf8' : '#0284c7' }}>
                                                    Share 📤
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : (
                            <View style={{ padding: 24, alignItems: 'center' }}>
                                <Text style={{ color: isDark ? '#94a3b8' : '#64748b', textAlign: 'center' }}>
                                    No JPEG format images were found in this document. Note that only rasterized JPEG images can be directly extracted.
                                </Text>
                            </View>
                        )}

                        {extractedImages.length > 0 && (
                            <AnimatedPressable
                                onPress={saveImages}
                                scaleValue={0.97}
                                style={{
                                    backgroundColor: isDark ? '#1e293b' : '#fff',
                                    padding: 16,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    shadowColor: '#000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.05,
                                    shadowRadius: 8,
                                    elevation: 2,
                                }}
                            >
                                <Text style={{ fontSize: 18, marginRight: 8 }}>📤</Text>
                                <Text style={{ color: isDark ? '#fff' : '#334155', fontWeight: '600' }}>
                                    Export All Images
                                </Text>
                            </AnimatedPressable>
                        )}
                    </FadeInView>
                )}
            </ScrollView>

            {/* Back Button */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
                <AnimatedPressable
                    onPress={() => router.back()}
                    scaleValue={0.98}
                    style={{
                        backgroundColor: isDark ? '#1e293b' : '#fff',
                        padding: 16,
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 10,
                    }}
                >
                    <Text style={{ fontWeight: '600', color: isDark ? '#fff' : '#334155' }}>
                        ← Back to Home
                    </Text>
                </AnimatedPressable>
            </View>
        </View>
    );
}
