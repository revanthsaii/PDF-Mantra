import { View, Text, TouchableOpacity, Alert, ScrollView, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface FeatureButtonProps {
    title: string;
    emoji: string;
    onPress: () => void;
    bgLight: string;
    bgDark: string;
    textLight: string;
    textDark: string;
    borderLight: string;
    borderDark: string;
    isPrimary?: boolean;
}

function FeatureButton({
    title, emoji, onPress, bgLight, bgDark, textLight, textDark, borderLight, borderDark, isPrimary
}: FeatureButtonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    if (isPrimary) {
        return (
            <TouchableOpacity
                onPress={handlePress}
                className="bg-blue-600 p-5 rounded-2xl items-center shadow-lg active:bg-blue-700"
                style={{ shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
            >
                <Text className="text-white font-bold text-lg">{emoji} {title}</Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            className={`flex-1 p-4 rounded-xl items-center border ${isDark ? bgDark : bgLight} ${isDark ? borderDark : borderLight}`}
            style={{ minWidth: '45%' }}
        >
            <Text className="text-2xl mb-1">{emoji}</Text>
            <Text className={`font-semibold text-sm text-center ${isDark ? textDark : textLight}`} numberOfLines={2}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}

export default function Home() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const pickDocument = async () => {
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            const { uri, name } = result.assets[0];
            router.push({ pathname: '/viewer', params: { uri, name } });
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const features = [
        { title: 'Scan', emoji: '📷', route: '/scan-document', colors: { bgLight: 'bg-slate-100', bgDark: 'bg-slate-800', textLight: 'text-slate-700', textDark: 'text-slate-200', borderLight: 'border-slate-200', borderDark: 'border-slate-700' } },
        { title: 'Merge', emoji: '🔗', route: '/merge', colors: { bgLight: 'bg-purple-50', bgDark: 'bg-purple-900/30', textLight: 'text-purple-700', textDark: 'text-purple-300', borderLight: 'border-purple-200', borderDark: 'border-purple-800' } },
        { title: 'Split', emoji: '✂️', route: '/split', colors: { bgLight: 'bg-orange-50', bgDark: 'bg-orange-900/30', textLight: 'text-orange-700', textDark: 'text-orange-300', borderLight: 'border-orange-200', borderDark: 'border-orange-800' } },
        { title: 'Reorder', emoji: '🔄', route: '/reorder', colors: { bgLight: 'bg-teal-50', bgDark: 'bg-teal-900/30', textLight: 'text-teal-700', textDark: 'text-teal-300', borderLight: 'border-teal-200', borderDark: 'border-teal-800' } },
        { title: 'Images to PDF', emoji: '🖼️', route: '/image-to-pdf', colors: { bgLight: 'bg-pink-50', bgDark: 'bg-pink-900/30', textLight: 'text-pink-700', textDark: 'text-pink-300', borderLight: 'border-pink-200', borderDark: 'border-pink-800' } },
        { title: 'Compress', emoji: '📦', route: '/compress', colors: { bgLight: 'bg-green-50', bgDark: 'bg-green-900/30', textLight: 'text-green-700', textDark: 'text-green-300', borderLight: 'border-green-200', borderDark: 'border-green-800' } },
        { title: 'Protect', emoji: '🔒', route: '/protect', colors: { bgLight: 'bg-red-50', bgDark: 'bg-red-900/30', textLight: 'text-red-700', textDark: 'text-red-300', borderLight: 'border-red-200', borderDark: 'border-red-800' } },
        { title: 'Watermark', emoji: '💧', route: '/watermark', colors: { bgLight: 'bg-cyan-50', bgDark: 'bg-cyan-900/30', textLight: 'text-cyan-700', textDark: 'text-cyan-300', borderLight: 'border-cyan-200', borderDark: 'border-cyan-800' } },
        { title: 'Extract Text', emoji: '📝', route: '/extract-text', colors: { bgLight: 'bg-indigo-50', bgDark: 'bg-indigo-900/30', textLight: 'text-indigo-700', textDark: 'text-indigo-300', borderLight: 'border-indigo-200', borderDark: 'border-indigo-800' } },
    ];

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Header */}
            <View className="items-center pt-14 pb-6 px-4">
                <Text className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    PDF Mantra
                </Text>
                <Text className={`text-lg ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Your Privacy-First PDF Toolkit
                </Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Primary Action */}
                <View className="mb-6">
                    <FeatureButton
                        title="Open PDF"
                        emoji="📖"
                        onPress={pickDocument}
                        isPrimary
                        bgLight="" bgDark="" textLight="" textDark="" borderLight="" borderDark=""
                    />
                </View>

                {/* Feature Grid */}
                <Text className={`font-semibold text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    TOOLS
                </Text>
                <View className="flex-row flex-wrap gap-3">
                    {features.map((feature) => (
                        <FeatureButton
                            key={feature.route}
                            title={feature.title}
                            emoji={feature.emoji}
                            onPress={() => router.push(feature.route as any)}
                            bgLight={feature.colors.bgLight}
                            bgDark={feature.colors.bgDark}
                            textLight={feature.colors.textLight}
                            textDark={feature.colors.textDark}
                            borderLight={feature.colors.borderLight}
                            borderDark={feature.colors.borderDark}
                        />
                    ))}
                </View>

                {/* Footer */}
                <View className="mt-8 items-center gap-3">
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/about');
                            }}
                            className={`px-5 py-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                        >
                            <Text className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                ℹ️ About
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                router.push('/settings');
                            }}
                            className={`px-5 py-2 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}
                        >
                            <Text className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                ⚙️ Settings
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <Text className={`text-xs ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                        100% Offline • Open Source • Privacy First
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
