import { View, Text, ScrollView, TouchableOpacity, Linking, useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

export default function AboutScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const openLink = async (url: string) => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Linking.openURL(url);
    };

    const features = [
        { icon: '📖', text: 'Open & View PDFs' },
        { icon: '📷', text: 'Scan Documents' },
        { icon: '🔗', text: 'Merge PDFs' },
        { icon: '✂️', text: 'Split Pages' },
        { icon: '🔀', text: 'Reorder Pages' },
        { icon: '🖼️', text: 'Images to PDF' },
        { icon: '📦', text: 'Compress PDFs' },
        { icon: '🔐', text: 'Password Protection' },
        { icon: '💧', text: 'Add Watermarks' },
        { icon: '📄', text: 'Extract Text' },
    ];

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
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
                className="pt-24 pb-10 px-6 items-center"
                style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
            >
                <Text className="text-5xl mb-3">🧘</Text>
                <Text className="text-white text-3xl font-bold">PDF Mantra</Text>
                <Text className="text-white/60 text-sm mt-1">Version 1.1.0</Text>
                <View className="flex-row items-center mt-3 bg-white/20 px-4 py-2 rounded-full">
                    <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2" />
                    <Text className="text-white/90 text-xs font-medium">
                        Privacy First • 100% Offline
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Features Grid */}
                <View className={`mt-6 p-5 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}
                >
                    <Text className={`text-sm font-semibold tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        FEATURES
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {features.map((feature, i) => (
                            <View
                                key={i}
                                className={`flex-row items-center px-3 py-2 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}
                            >
                                <Text className="mr-2">{feature.icon}</Text>
                                <Text className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                    {feature.text}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Developer Card */}
                <View className={`mt-4 p-5 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}
                >
                    <Text className={`text-sm font-semibold tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        DEVELOPER
                    </Text>
                    <View className="flex-row items-center mb-4">
                        <View className={`w-12 h-12 rounded-full items-center justify-center ${isDark ? 'bg-indigo-900/50' : 'bg-indigo-100'}`}>
                            <Text className="text-xl">👨‍💻</Text>
                        </View>
                        <View className="ml-3">
                            <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                @revanthsaii
                            </Text>
                            <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                Aetherium Labs
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => openLink('https://github.com/revanthsaii/PDF-Mantra')}
                        className="bg-slate-900 p-4 rounded-2xl flex-row items-center justify-center"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 }}
                    >
                        <Text className="text-white font-semibold">⭐  Star on GitHub</Text>
                    </TouchableOpacity>
                </View>

                {/* Tech Stack */}
                <View className={`mt-4 p-5 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}
                >
                    <Text className={`text-sm font-semibold tracking-wider mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        BUILT WITH
                    </Text>
                    <View className="flex-row flex-wrap gap-2">
                        {['React Native', 'Expo', 'TypeScript', 'pdf-lib', 'NativeWind'].map((tech, i) => (
                            <View
                                key={i}
                                className={`px-4 py-2 rounded-full ${isDark ? 'bg-indigo-900/30' : 'bg-indigo-50'}`}
                            >
                                <Text className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-600'}`}>
                                    {tech}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer */}
                <View className="mt-8 items-center">
                    <Text className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Made with ❤️ for the open source community
                    </Text>
                    <Text className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        © 2024 PDF Mantra • MIT License
                    </Text>
                </View>
            </ScrollView>

            {/* Floating Back Button */}
            <View className="absolute bottom-0 left-0 right-0 p-4">
                <TouchableOpacity
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                    className={`p-4 rounded-2xl flex-row items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 10,
                        elevation: 10,
                    }}
                >
                    <Text className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        ← Back to Home
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
