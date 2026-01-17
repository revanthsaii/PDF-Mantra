import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView, useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { AnimatedPressable, FadeInView } from '../components/common';

export default function ExtractTextScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [pageCount, setPageCount] = useState(0);

    const pickFile = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                setFile(result.assets[0]);
                setExtractedText('');
                setPageCount(0);
            }
        } catch (err) {
            Alert.alert('Error', 'Failed to pick file');
        }
    };

    const extractText = async () => {
        if (!file) return;

        setLoading(true);
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            const fileContent = await FileSystem.readAsStringAsync(file.uri, {
                encoding: 'base64'
            });

            const pdfDoc = await PDFDocument.load(fileContent, { ignoreEncryption: true });
            const pages = pdfDoc.getPageCount();
            setPageCount(pages);

            // Extract metadata and any available info
            const title = pdfDoc.getTitle() || 'Untitled';
            const author = pdfDoc.getAuthor() || 'Unknown';
            const subject = pdfDoc.getSubject() || '';
            const creator = pdfDoc.getCreator() || '';
            const producer = pdfDoc.getProducer() || '';
            const creationDate = pdfDoc.getCreationDate();
            const modificationDate = pdfDoc.getModificationDate();

            // Build extracted info text
            let extractedInfo = `📄 PDF Document Analysis\n${'─'.repeat(30)}\n\n`;
            extractedInfo += `📁 File: ${file.name}\n`;
            extractedInfo += `📑 Pages: ${pages}\n\n`;

            extractedInfo += `📋 METADATA\n${'─'.repeat(20)}\n`;
            extractedInfo += `Title: ${title}\n`;
            extractedInfo += `Author: ${author}\n`;
            if (subject) extractedInfo += `Subject: ${subject}\n`;
            if (creator) extractedInfo += `Creator: ${creator}\n`;
            if (producer) extractedInfo += `Producer: ${producer}\n`;
            if (creationDate) extractedInfo += `Created: ${creationDate.toLocaleDateString()}\n`;
            if (modificationDate) extractedInfo += `Modified: ${modificationDate.toLocaleDateString()}\n`;

            // Page dimensions
            extractedInfo += `\n📐 PAGE DIMENSIONS\n${'─'.repeat(20)}\n`;
            for (let i = 0; i < Math.min(pages, 5); i++) {
                const page = pdfDoc.getPage(i);
                const { width, height } = page.getSize();
                extractedInfo += `Page ${i + 1}: ${Math.round(width)} × ${Math.round(height)} pts\n`;
            }
            if (pages > 5) {
                extractedInfo += `... and ${pages - 5} more pages\n`;
            }

            // Note about OCR
            extractedInfo += `\n💡 NOTE\n${'─'.repeat(20)}\n`;
            extractedInfo += `This analysis shows PDF metadata and structure.\n\n`;
            extractedInfo += `For full text extraction from scanned documents,\n`;
            extractedInfo += `OCR (Optical Character Recognition) is required.\n\n`;
            extractedInfo += `The extracted metadata can be copied or exported.`;

            setExtractedText(extractedInfo);
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to analyze PDF');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!extractedText) return;
        await Clipboard.setStringAsync(extractedText);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Copied!', 'Text copied to clipboard');
    };

    const exportAsText = async () => {
        if (!extractedText) return;
        try {
            const fileName = file?.name?.replace('.pdf', '') || 'extracted';
            const uri = FileSystem.documentDirectory + `${fileName}_analysis.txt`;
            await FileSystem.writeAsStringAsync(uri, extractedText);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            }
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            Alert.alert('Error', 'Failed to export text');
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
                colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#6366f1', '#8b5cf6']}
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
                    Extract Text
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
                    Analyze PDF metadata and structure
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
                        <ActivityIndicator size="large" color="#6366f1" />
                        <Text style={{ color: isDark ? '#fff' : '#334155', marginTop: 12, fontWeight: '600' }}>
                            Analyzing PDF...
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
                            backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                            padding: 20,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderStyle: 'dashed',
                            borderColor: isDark ? '#6366f1' : '#a5b4fc',
                            alignItems: 'center',
                            marginBottom: 16,
                        }}
                    >
                        <Text style={{ fontSize: 32, marginBottom: 8 }}>📄</Text>
                        <Text style={{ color: isDark ? '#a5b4fc' : '#6366f1', fontWeight: '600', fontSize: 16 }}>
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
                            {pageCount > 0 && (
                                <Text style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: 12, marginTop: 4 }}>
                                    {pageCount} pages
                                </Text>
                            )}
                        </View>
                    </FadeInView>
                )}

                {/* Extract Button */}
                <FadeInView delay={200}>
                    <AnimatedPressable
                        onPress={extractText}
                        disabled={!file}
                        scaleValue={0.98}
                        style={{
                            backgroundColor: !file ? (isDark ? '#334155' : '#cbd5e1') : '#6366f1',
                            padding: 16,
                            borderRadius: 16,
                            alignItems: 'center',
                            marginBottom: 16,
                            shadowColor: '#6366f1',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: file ? 0.3 : 0,
                            shadowRadius: 8,
                            elevation: file ? 5 : 0,
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                            📝 Analyze PDF
                        </Text>
                    </AnimatedPressable>
                </FadeInView>

                {/* Extracted Text */}
                {extractedText && (
                    <FadeInView delay={100}>
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
                            <Text style={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12, marginBottom: 12 }}>
                                ANALYSIS RESULT
                            </Text>
                            <Text
                                style={{
                                    color: isDark ? '#e2e8f0' : '#334155',
                                    fontSize: 14,
                                    lineHeight: 22,
                                    fontFamily: 'monospace',
                                }}
                                selectable
                            >
                                {extractedText}
                            </Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <AnimatedPressable
                                onPress={copyToClipboard}
                                scaleValue={0.97}
                                style={{
                                    flex: 1,
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
                                <Text style={{ fontSize: 16, marginRight: 8 }}>📋</Text>
                                <Text style={{ color: isDark ? '#fff' : '#334155', fontWeight: '600' }}>Copy</Text>
                            </AnimatedPressable>

                            <AnimatedPressable
                                onPress={exportAsText}
                                scaleValue={0.97}
                                style={{
                                    flex: 1,
                                    backgroundColor: '#22c55e',
                                    padding: 16,
                                    borderRadius: 16,
                                    alignItems: 'center',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                    shadowColor: '#22c55e',
                                    shadowOffset: { width: 0, height: 4 },
                                    shadowOpacity: 0.3,
                                    shadowRadius: 8,
                                    elevation: 5,
                                }}
                            >
                                <Text style={{ fontSize: 16, marginRight: 8 }}>💾</Text>
                                <Text style={{ color: '#fff', fontWeight: '600' }}>Export</Text>
                            </AnimatedPressable>
                        </View>
                    </FadeInView>
                )}
            </ScrollView>

            {/* Floating Back Button */}
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
