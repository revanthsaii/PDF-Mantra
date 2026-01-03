import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function AboutScreen() {
    const openLink = async (url: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Linking.openURL(url);
    };

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ title: 'About', headerShown: true }} />

            <ScrollView className="flex-1 p-4">
                {/* App Header */}
                <View className="items-center py-8">
                    <Text className="text-6xl mb-4">📄</Text>
                    <Text className="text-3xl font-bold text-slate-800">PDF Mantra</Text>
                    <Text className="text-slate-500 mt-1">Version 1.0.0</Text>
                    <Text className="text-blue-600 font-semibold mt-2">
                        Your Privacy-First PDF Toolkit
                    </Text>
                </View>

                {/* Features */}
                <View className="bg-slate-50 rounded-2xl p-4 mb-4">
                    <Text className="text-slate-700 font-bold text-lg mb-3">✨ Features</Text>
                    <View className="gap-2">
                        {[
                            '📖 Open & View PDFs',
                            '📷 Scan Documents to PDF',
                            '🔗 Merge Multiple PDFs',
                            '✂️ Split PDF Pages',
                            '🔄 Reorder PDF Pages',
                            '🖼️ Convert Images to PDF',
                            '📦 Compress PDFs',
                            '🔒 Password Protection (UI)',
                            '📝 Extract Text (OCR Placeholder)',
                        ].map((feature, i) => (
                            <Text key={i} className="text-slate-600">{feature}</Text>
                        ))}
                    </View>
                </View>

                {/* Privacy */}
                <View className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-200">
                    <Text className="text-green-700 font-bold text-lg mb-2">🔒 Privacy First</Text>
                    <Text className="text-green-600">
                        All processing happens on your device. Your files never leave your phone.
                        No cloud uploads, no tracking, no accounts required.
                    </Text>
                </View>

                {/* Open Source */}
                <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200">
                    <Text className="text-blue-700 font-bold text-lg mb-2">💻 Open Source</Text>
                    <Text className="text-blue-600 mb-3">
                        PDF Mantra is fully open source. View the code, contribute, or fork it!
                    </Text>
                    <View className="bg-white rounded-xl p-3 mb-3 border border-blue-100">
                        <Text className="text-slate-500 text-xs mb-1">DEVELOPED BY</Text>
                        <Text className="text-slate-800 font-bold text-lg">@revanthsaii</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => openLink('https://github.com/revanthsaii/PDF-Mantra')}
                        className="bg-slate-900 p-3 rounded-xl items-center flex-row justify-center"
                    >
                        <Text className="text-white font-semibold">⭐ View on GitHub</Text>
                    </TouchableOpacity>
                </View>

                {/* Tech Stack */}
                <View className="bg-purple-50 rounded-2xl p-4 mb-4 border border-purple-200">
                    <Text className="text-purple-700 font-bold text-lg mb-2">🛠️ Built With</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {['React Native', 'Expo', 'TypeScript', 'pdf-lib', 'NativeWind'].map((tech, i) => (
                            <View key={i} className="bg-purple-200 px-3 py-1 rounded-full">
                                <Text className="text-purple-700 font-semibold text-sm">{tech}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Credits */}
                <View className="items-center py-6">
                    <Text className="text-slate-400 text-sm">Made with ❤️ for FOSS</Text>
                    <Text className="text-slate-400 text-sm mt-1">© 2024 PDF Mantra</Text>
                </View>
            </ScrollView>

            <TouchableOpacity
                onPress={() => router.back()}
                className="m-4 bg-slate-100 p-4 rounded-xl items-center"
            >
                <Text className="text-slate-700 font-bold text-lg">← Back to Home</Text>
            </TouchableOpacity>
        </View>
    );
}
