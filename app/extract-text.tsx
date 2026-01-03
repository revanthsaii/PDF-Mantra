import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { PDFDocument } from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';
import { useState } from 'react';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';

export default function ExtractTextScreen() {
    const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [loading, setLoading] = useState(false);
    const [extractedText, setExtractedText] = useState('');

    const pickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                setFile(result.assets[0]);
                setExtractedText(''); // Clear previous extraction
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

            const pdfDoc = await PDFDocument.load(fileContent);

            // Note: pdf-lib does not have built-in text extraction capabilities
            // For production use, consider using:
            // - Native OCR libraries like react-native-tesseract-ocr
            // - Cloud APIs like Google Cloud Vision or AWS Textract
            // - Server-side processing

            // This is a placeholder showing the UI flow
            // Real implementation would require OCR integration

            const pageCount = pdfDoc.getPageCount();

            Alert.alert(
                'OCR Not Available',
                `This PDF has ${pageCount} pages.\n\nText extraction requires OCR integration which is not included in this basic version.\n\nFor production, integrate:\n- Google ML Kit\n- Tesseract OCR\n- Cloud APIs`,
                [{ text: 'OK' }]
            );

            // Placeholder text for demonstration
            setExtractedText(
                `[OCR Feature Placeholder]\n\n` +
                `PDF: ${file.name}\n` +
                `Pages: ${pageCount}\n\n` +
                `To enable text extraction, integrate an OCR library:\n\n` +
                `1. expo-ml-kit (Google ML Kit)\n` +
                `2. react-native-tesseract-ocr\n` +
                `3. Cloud APIs (Google Vision, AWS Textract)\n\n` +
                `This would extract text from each page and display it here.`
            );

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Text extraction failed');
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = async () => {
        if (!extractedText) return;

        await Clipboard.setStringAsync(extractedText);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Copied', 'Text copied to clipboard');
    };

    const exportAsText = async () => {
        if (!extractedText) return;

        try {
            const uri = FileSystem.documentDirectory + 'extracted-text.txt';
            await FileSystem.writeAsStringAsync(uri, extractedText);

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            } else {
                Alert.alert('Success', 'Text file created: ' + uri);
            }

            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
            Alert.alert('Error', 'Failed to export text');
        }
    };

    return (
        <View className="flex-1 bg-white p-4">
            <Stack.Screen options={{ title: 'Extract Text' }} />

            {loading && (
                <View className="absolute inset-0 z-50 bg-black/50 items-center justify-center">
                    <ActivityIndicator size="large" color="#fff" />
                    <Text className="text-white mt-2 font-bold">Extracting text...</Text>
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
                    <Text className="text-slate-800 font-semibold" numberOfLines={1}>
                        {file.name}
                    </Text>
                </View>
            )}

            {!extractedText && (
                <View className="bg-amber-50 p-4 rounded-xl mb-4 border border-amber-200">
                    <Text className="text-amber-800 text-sm">
                        ℹ️ This feature demonstrates the UI for text extraction. Full OCR functionality requires additional libraries (Google ML Kit, Tesseract, or cloud APIs).
                    </Text>
                </View>
            )}

            <TouchableOpacity
                onPress={extractText}
                disabled={!file}
                className={`p-4 rounded-xl items-center mb-4 ${!file ? 'bg-slate-300' : 'bg-purple-600'
                    }`}
            >
                <Text className="text-white font-bold text-lg">Extract Text</Text>
            </TouchableOpacity>

            {extractedText && (
                <>
                    <Text className="text-slate-700 font-semibold mb-2">Extracted Text:</Text>

                    <ScrollView className="flex-1 bg-slate-50 p-4 rounded-xl mb-4 border border-slate-200">
                        <Text className="text-slate-800" selectable>
                            {extractedText}
                        </Text>
                    </ScrollView>

                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={copyToClipboard}
                            className="flex-1 bg-blue-600 p-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold">📋 Copy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={exportAsText}
                            className="flex-1 bg-green-600 p-4 rounded-xl items-center"
                        >
                            <Text className="text-white font-bold">💾 Export TXT</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </View>
    );
}
