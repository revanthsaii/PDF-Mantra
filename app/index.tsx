import { View, Text, TouchableOpacity, Alert, ScrollView, useColorScheme, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

interface ToolCardProps {
    title: string;
    icon: string;
    onPress: () => void;
    gradient: readonly [string, string];
    isDark: boolean;
}

function ToolCard({ title, icon, onPress, gradient, isDark }: ToolCardProps) {
    return (
        <TouchableOpacity
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            activeOpacity={0.7}
            style={{
                width: CARD_WIDTH,
                aspectRatio: 1,
                marginBottom: 12,
            }}
        >
            <View
                className={`flex-1 rounded-2xl items-center justify-center ${isDark ? 'bg-slate-800/80' : 'bg-white'}`}
                style={{
                    shadowColor: isDark ? '#000' : gradient[0],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.15,
                    shadowRadius: 12,
                    elevation: 5,
                }}
            >
                <View
                    className="w-12 h-12 rounded-xl items-center justify-center mb-2"
                    style={{ backgroundColor: gradient[0] + '20' }}
                >
                    <Text className="text-2xl">{icon}</Text>
                </View>
                <Text
                    className={`text-xs font-medium text-center px-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            </View>
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

    const tools = [
        { title: 'Scan', icon: '📷', route: '/scan-document', gradient: ['#6366f1', '#8b5cf6'] as const },
        { title: 'Merge', icon: '🔗', route: '/merge', gradient: ['#8b5cf6', '#a855f7'] as const },
        { title: 'Split', icon: '✂️', route: '/split', gradient: ['#f97316', '#fb923c'] as const },
        { title: 'Reorder', icon: '🔀', route: '/reorder', gradient: ['#14b8a6', '#2dd4bf'] as const },
        { title: 'Images', icon: '🖼️', route: '/image-to-pdf', gradient: ['#ec4899', '#f472b6'] as const },
        { title: 'Compress', icon: '📦', route: '/compress', gradient: ['#22c55e', '#4ade80'] as const },
        { title: 'Protect', icon: '🔐', route: '/protect', gradient: ['#ef4444', '#f87171'] as const },
        { title: 'Watermark', icon: '💧', route: '/watermark', gradient: ['#06b6d4', '#22d3ee'] as const },
        { title: 'Extract', icon: '📄', route: '/extract-text', gradient: ['#6366f1', '#818cf8'] as const },
    ];

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Premium Gradient Header */}
            <LinearGradient
                colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#6366f1', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="pt-16 pb-8 px-6"
                style={{
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                }}
            >
                <View className="items-center">
                    <Text className="text-4xl mb-2">🧘</Text>
                    <Text className="text-white text-3xl font-bold tracking-tight">
                        PDF Mantra
                    </Text>
                    <Text className="text-white/70 text-sm mt-1">
                        Your Privacy-First PDF Toolkit
                    </Text>
                </View>

                {/* Open PDF Button */}
                <TouchableOpacity
                    onPress={pickDocument}
                    activeOpacity={0.9}
                    className="mt-6 bg-white/20 backdrop-blur-lg rounded-2xl p-4 flex-row items-center justify-center"
                    style={{
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.3)',
                    }}
                >
                    <Text className="text-white text-lg font-semibold">
                        📖  Open PDF File
                    </Text>
                </TouchableOpacity>
            </LinearGradient>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Tools Section */}
                <View className="flex-row items-center justify-between mb-4 mt-2">
                    <Text className={`text-sm font-semibold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        TOOLS
                    </Text>
                    <View className={`h-px flex-1 ml-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </View>

                {/* Tools Grid */}
                <View className="flex-row flex-wrap justify-between">
                    {tools.map((tool) => (
                        <ToolCard
                            key={tool.route}
                            title={tool.title}
                            icon={tool.icon}
                            onPress={() => router.push(tool.route as any)}
                            gradient={tool.gradient}
                            isDark={isDark}
                        />
                    ))}
                </View>

                {/* Quick Access */}
                <View className="flex-row items-center justify-between mb-4 mt-4">
                    <Text className={`text-sm font-semibold tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        QUICK ACCESS
                    </Text>
                    <View className={`h-px flex-1 ml-4 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                </View>

                <View className="flex-row gap-3">
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/about');
                        }}
                        className={`flex-1 p-4 rounded-2xl flex-row items-center justify-center ${isDark ? 'bg-slate-800/80' : 'bg-white'}`}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <Text className="text-lg mr-2">ℹ️</Text>
                        <Text className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            About
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            router.push('/settings');
                        }}
                        className={`flex-1 p-4 rounded-2xl flex-row items-center justify-center ${isDark ? 'bg-slate-800/80' : 'bg-white'}`}
                        style={{
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <Text className="text-lg mr-2">⚙️</Text>
                        <Text className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Settings
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="mt-8 items-center">
                    <View className="flex-row items-center gap-2">
                        <View className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} />
                        <Text className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            100% Offline • Privacy First
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
