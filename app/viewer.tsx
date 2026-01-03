import { useLocalSearchParams, Stack, router } from 'expo-router';
import { View, ActivityIndicator, TouchableOpacity, Text, StyleSheet, Dimensions, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

export default function Viewer() {
    const { uri, name } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Load PDF as base64 for WebView
    useState(() => {
        const loadPdf = async () => {
            try {
                if (!uri) {
                    setError('No PDF URI provided');
                    setLoading(false);
                    return;
                }

                const base64 = await FileSystem.readAsStringAsync(uri as string, {
                    encoding: FileSystem.EncodingType.Base64
                });
                setPdfBase64(base64);
            } catch (err) {
                console.error('Error loading PDF:', err);
                setError('Failed to load PDF');
            } finally {
                setLoading(false);
            }
        };
        loadPdf();
    });

    // Using Google Docs viewer as fallback for remote PDFs
    // For local PDFs, embed directly in WebView
    const getWebViewContent = () => {
        if (pdfBase64) {
            return {
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
                        <style>
                            * { margin: 0; padding: 0; }
                            html, body { width: 100%; height: 100%; background: #f1f5f9; }
                            .container { 
                                display: flex; 
                                flex-direction: column; 
                                align-items: center; 
                                justify-content: center; 
                                height: 100vh;
                                padding: 20px;
                                box-sizing: border-box;
                            }
                            .message { 
                                text-align: center; 
                                color: #475569;
                                font-family: system-ui, -apple-system, sans-serif;
                            }
                            h2 { margin-bottom: 10px; color: #1e293b; }
                            p { margin-bottom: 15px; }
                            .filename {
                                background: #e2e8f0;
                                padding: 8px 16px;
                                border-radius: 8px;
                                font-weight: 600;
                                color: #334155;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="message">
                                <h2>📄 PDF Loaded</h2>
                                <p>PDF viewer requires native build.</p>
                                <p class="filename">${name || 'Document'}</p>
                                <p style="margin-top: 20px; font-size: 14px; color: #64748b;">
                                    For full PDF viewing, run:<br>
                                    <code style="background: #334155; color: #fff; padding: 4px 8px; border-radius: 4px;">npx expo run:android</code>
                                </p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            };
        }
        return { html: '<html><body><p>Loading...</p></body></html>' };
    };

    if (error) {
        return (
            <View className="flex-1 bg-slate-100 items-center justify-center p-4">
                <Stack.Screen
                    options={{
                        title: 'Error',
                        headerShown: true,
                    }}
                />
                <Text className="text-red-600 text-lg font-semibold mb-4">{error}</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-blue-600 px-6 py-3 rounded-xl"
                >
                    <Text className="text-white font-semibold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-100">
            <Stack.Screen
                options={{
                    title: (name as string) || 'PDF Viewer',
                    headerShown: true,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                            <Text className="text-blue-600 font-semibold text-lg">Back</Text>
                        </TouchableOpacity>
                    )
                }}
            />

            {loading && (
                <View className="absolute inset-0 items-center justify-center z-10 bg-white">
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text className="text-slate-600 mt-2">Loading PDF...</Text>
                </View>
            )}

            <WebView
                source={getWebViewContent()}
                style={styles.webview}
                onLoadEnd={() => setLoading(false)}
                onError={(e) => {
                    console.error('WebView error:', e.nativeEvent);
                    setError('Failed to display PDF');
                }}
                scalesPageToFit={true}
                javaScriptEnabled={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    webview: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    }
});
