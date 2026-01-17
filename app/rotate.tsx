import { View, Text, TouchableOpacity, Alert, ActivityIndicator, useColorScheme } from 'react-native';
import { Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument, degrees } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { FlatList } from 'react-native';
import Animated from 'react-native-reanimated';
import { AnimatedPressable, FadeInView } from '../components/common';

type PageItem = {
    index: number;
    rotation: number;
};

export default function RotateScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [pages, setPages] = useState<PageItem[]>([]);
    const [loading, setLoading] = useState(false);

    const pickFile = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                setLoading(true);
                const asset = result.assets[0];
                setFile(asset);

                const content = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: 'base64'
                });
                const pdf = await PDFDocument.load(content, { ignoreEncryption: true });
                const pageCount = pdf.getPageCount();

                // Get initial rotation of each page
                const newPages: PageItem[] = [];
                for (let i = 0; i < pageCount; i++) {
                    const page = pdf.getPage(i);
                    const rotation = page.getRotation().angle;
                    newPages.push({ index: i, rotation });
                }
                setPages(newPages);
                setLoading(false);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to load file');
            setLoading(false);
        }
    };

    const rotatePage = (index: number, direction: 'left' | 'right') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setPages(prev => prev.map(p => {
            if (p.index === index) {
                const delta = direction === 'right' ? 90 : -90;
                let newRot = (p.rotation + delta) % 360;
                if (newRot < 0) newRot += 360;
                return { ...p, rotation: newRot };
            }
            return p;
        }));
    };

    const rotateAll = (direction: 'left' | 'right') => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const delta = direction === 'right' ? 90 : -90;
        setPages(prev => prev.map(p => {
            let newRot = (p.rotation + delta) % 360;
            if (newRot < 0) newRot += 360;
            return { ...p, rotation: newRot };
        }));
    };

    const saveRotated = async () => {
        if (!file) return;

        setLoading(true);
        try {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            const content = await FileSystem.readAsStringAsync(file.uri, {
                encoding: 'base64'
            });
            const pdfDoc = await PDFDocument.load(content, { ignoreEncryption: true });
            const pdfPages = pdfDoc.getPages();

            pages.forEach(p => {
                pdfPages[p.index].setRotation(degrees(p.rotation));
            });

            const base64 = await pdfDoc.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'rotated_' + file.name;
            await FileSystem.writeAsStringAsync(uri, base64, { encoding: 'base64' });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Success', 'PDF rotation saved!');
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to save PDF');
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }: { item: PageItem }) => (
        <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff',
            marginBottom: 12,
            padding: 16,
            borderRadius: 16,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 1,
        }}>
            {/* Page Info & Visual */}
            <View style={{
                width: 60, height: 80,
                backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                borderRadius: 8,
                alignItems: 'center', justifyContent: 'center',
                marginRight: 16,
                borderWidth: 1,
                borderColor: isDark ? '#334155' : '#e2e8f0'
            }}>
                <Text style={{ fontSize: 24, transform: [{ rotate: `${item.rotation}deg` }] }}>
                    📄
                </Text>
                <Text style={{
                    position: 'absolute', bottom: 4,
                    fontSize: 10, color: isDark ? '#94a3b8' : '#64748b'
                }}>
                    Page {item.index + 1}
                </Text>
            </View>

            <View style={{ flex: 1 }}>
                <Text style={{
                    fontSize: 16, fontWeight: '600',
                    color: isDark ? '#fff' : '#1e293b', marginBottom: 4
                }}>
                    Rotation: {item.rotation}°
                </Text>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                    <TouchableOpacity
                        onPress={() => rotatePage(item.index, 'left')}
                        style={{
                            padding: 8, borderRadius: 8,
                            backgroundColor: isDark ? '#334155' : '#e2e8f0',
                            flexDirection: 'row', alignItems: 'center'
                        }}
                    >
                        <Text style={{ marginRight: 4 }}>↺</Text>
                        <Text style={{ fontSize: 12, color: isDark ? '#cbd5e1' : '#475569' }}>Left</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => rotatePage(item.index, 'right')}
                        style={{
                            padding: 8, borderRadius: 8,
                            backgroundColor: isDark ? '#334155' : '#e2e8f0',
                            flexDirection: 'row', alignItems: 'center'
                        }}
                    >
                        <Text style={{ marginRight: 4 }}>↻</Text>
                        <Text style={{ fontSize: 12, color: isDark ? '#cbd5e1' : '#475569' }}>Right</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}>
            <Stack.Screen
                options={{
                    title: '',
                    headerShown: true,
                    headerTransparent: true,
                    headerTintColor: '#fff'
                }}
            />

            {/* Gradient Header */}
            <LinearGradient
                colors={isDark ? ['#581c87', '#3b0764'] : ['#a855f7', '#c084fc']}
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
                    Rotate PDF
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
                    Correct the orientation of your pages
                </Text>
            </LinearGradient>

            {loading && (
                <View style={{
                    position: 'absolute', inset: 0, zIndex: 50,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <View style={{
                        backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: 20, padding: 24, alignItems: 'center'
                    }}>
                        <ActivityIndicator size="large" color="#a855f7" />
                        <Text style={{ color: isDark ? '#fff' : '#334155', marginTop: 12, fontWeight: '600' }}>Processing...</Text>
                    </View>
                </View>
            )}

            <View style={{ flex: 1, padding: 16 }}>
                {!file ? (
                    <FadeInView delay={100}>
                        <AnimatedPressable
                            onPress={pickFile}
                            scaleValue={0.98}
                            style={{
                                backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
                                padding: 24,
                                borderRadius: 16,
                                borderWidth: 2,
                                borderStyle: 'dashed',
                                borderColor: isDark ? '#a855f7' : '#d8b4fe',
                                alignItems: 'center',
                                marginTop: 24,
                            }}
                        >
                            <Text style={{ fontSize: 40, marginBottom: 12 }}>🔄</Text>
                            <Text style={{ color: isDark ? '#d8b4fe' : '#a855f7', fontWeight: '600', fontSize: 18 }}>
                                Select PDF to Rotate
                            </Text>
                        </AnimatedPressable>
                    </FadeInView>
                ) : (
                    <>
                        {/* Bulk Actions */}
                        <FadeInView delay={100} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                            <AnimatedPressable
                                onPress={() => rotateAll('left')}
                                scaleValue={0.96}
                                style={{
                                    flex: 1, padding: 12, borderRadius: 12,
                                    backgroundColor: isDark ? '#1e293b' : '#fff',
                                    borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0',
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: isDark ? '#d8b4fe' : '#9333ea', fontWeight: '600' }}>↺ Rotate All Left</Text>
                            </AnimatedPressable>
                            <AnimatedPressable
                                onPress={() => rotateAll('right')}
                                scaleValue={0.96}
                                style={{
                                    flex: 1, padding: 12, borderRadius: 12,
                                    backgroundColor: isDark ? '#1e293b' : '#fff',
                                    borderWidth: 1, borderColor: isDark ? '#334155' : '#e2e8f0',
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={{ color: isDark ? '#d8b4fe' : '#9333ea', fontWeight: '600' }}>↻ Rotate All Right</Text>
                            </AnimatedPressable>
                        </FadeInView>

                        <Animated.FlatList
                            data={pages}
                            renderItem={renderItem}
                            keyExtractor={item => item.index.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                        />

                        {/* Save Button */}
                        <View style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
                            <AnimatedPressable
                                onPress={saveRotated}
                                scaleValue={0.97}
                                style={{
                                    backgroundColor: isDark ? '#a855f7' : '#9333ea',
                                    padding: 16,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    shadowColor: '#a855f7',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 5,
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>💾  Save Changes</Text>
                            </AnimatedPressable>
                        </View>
                    </>
                )}
            </View>
        </View>
    );
}

