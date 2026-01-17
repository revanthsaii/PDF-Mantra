import { View, Text, ScrollView, useColorScheme, Alert, ActivityIndicator } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable, FadeInView } from '../components/common';

type Position = 'Bottom Center' | 'Bottom Right' | 'Bottom Left' | 'Top Center' | 'Top Right' | 'Top Left';

export default function PageNumbersScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [position, setPosition] = useState<Position>('Bottom Center');

    const positions: Position[] = [
        'Top Left', 'Top Center', 'Top Right',
        'Bottom Left', 'Bottom Center', 'Bottom Right'
    ];

    const pickFile = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

    const addPageNumbers = async () => {
        if (!file) return;

        setLoading(true);
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const fileContent = await FileSystem.readAsStringAsync(file.uri, {
                encoding: 'base64'
            });

            const pdfDoc = await PDFDocument.load(fileContent, { ignoreEncryption: true });
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const pageCount = pages.length;

            for (let i = 0; i < pageCount; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const fontSize = 12;
                const text = `${i + 1}`;
                const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
                const textHeight = helveticaFont.heightAtSize(fontSize);

                let x = 0;
                let y = 0;
                const margin = 20;

                switch (position) {
                    case 'Bottom Center':
                        x = width / 2 - textWidth / 2;
                        y = margin;
                        break;
                    case 'Bottom Right':
                        x = width - margin - textWidth;
                        y = margin;
                        break;
                    case 'Bottom Left':
                        x = margin;
                        y = margin;
                        break;
                    case 'Top Center':
                        x = width / 2 - textWidth / 2;
                        y = height - margin - textHeight;
                        break;
                    case 'Top Right':
                        x = width - margin - textWidth;
                        y = height - margin - textHeight;
                        break;
                    case 'Top Left':
                        x = margin;
                        y = height - margin - textHeight;
                        break;
                }

                page.drawText(text, {
                    x,
                    y,
                    size: fontSize,
                    font: helveticaFont,
                    color: rgb(0, 0, 0),
                });
            }

            const base64 = await pdfDoc.saveAsBase64();
            const uri = FileSystem.documentDirectory + 'numbered_' + file.name;
            await FileSystem.writeAsStringAsync(uri, base64, { encoding: 'base64' });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Success', 'Page numbers added!');
            }
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to add page numbers');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

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
                colors={isDark ? ['#1e3a8a', '#172554'] : ['#3b82f6', '#60a5fa']}
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
                    Page Numbers
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 }}>
                    Add numbering to your PDF pages
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
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={{ color: isDark ? '#fff' : '#334155', marginTop: 12, fontWeight: '600' }}>Processing...</Text>
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
                            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                            padding: 20,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderStyle: 'dashed',
                            borderColor: isDark ? '#3b82f6' : '#93c5fd',
                            alignItems: 'center',
                            marginBottom: 24,
                        }}
                    >
                        <Text style={{ fontSize: 32, marginBottom: 8 }}>📄</Text>
                        <Text style={{ color: isDark ? '#93c5fd' : '#3b82f6', fontWeight: '600', fontSize: 16 }}>
                            {file ? 'Change PDF' : 'Select PDF'}
                        </Text>
                        {file && <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, marginTop: 4 }}>{file.name}</Text>}
                    </AnimatedPressable>
                </FadeInView>

                {/* Settings */}
                {file && (
                    <FadeInView delay={200}>
                        <Text style={{
                            fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 12, marginLeft: 4,
                            color: isDark ? '#94a3b8' : '#64748b'
                        }}>
                            POSITION
                        </Text>

                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                            {positions.map((pos) => (
                                <AnimatedPressable
                                    key={pos}
                                    onPress={() => setPosition(pos)}
                                    scaleValue={0.96}
                                    style={{
                                        width: '48%',
                                        padding: 12,
                                        borderRadius: 12,
                                        backgroundColor: position === pos
                                            ? (isDark ? '#3b82f6' : '#3b82f6')
                                            : (isDark ? '#1e293b' : '#fff'),
                                        borderWidth: 1,
                                        borderColor: position === pos
                                            ? '#3b82f6'
                                            : (isDark ? '#334155' : '#e2e8f0'),
                                        alignItems: 'center',
                                    }}
                                >
                                    <Text style={{
                                        fontWeight: '500',
                                        color: position === pos ? '#fff' : (isDark ? '#e2e8f0' : '#475569')
                                    }}>
                                        {pos}
                                    </Text>
                                </AnimatedPressable>
                            ))}
                        </View>

                        <AnimatedPressable
                            onPress={addPageNumbers}
                            scaleValue={0.97}
                            style={{
                                backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                                padding: 16,
                                borderRadius: 16,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                shadowColor: '#3b82f6',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5,
                            }}
                        >
                            <Text style={{ fontSize: 18, marginRight: 8 }}>✨</Text>
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                Add Page Numbers
                            </Text>
                        </AnimatedPressable>
                    </FadeInView>
                )}
            </ScrollView>
        </View>
    );
}
