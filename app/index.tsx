import { View, Text, Alert, ScrollView, useColorScheme, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AnimatedPressable, FadeInView, ScaleInView } from '../components/common';
import { useRecentFiles } from '../hooks';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 3;

interface ToolCardProps {
    title: string;
    icon: string;
    onPress: () => void;
    gradient: readonly [string, string];
    isDark: boolean;
    index: number;
}

function ToolCard({ title, icon, onPress, gradient, isDark, index }: ToolCardProps) {
    return (
        <ScaleInView delay={index * 60} style={{ width: CARD_WIDTH, aspectRatio: 1, marginBottom: 12 }}>
            <AnimatedPressable
                onPress={onPress}
                scaleValue={0.95}
                style={{
                    flex: 1,
                    borderRadius: 20,
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                    alignItems: 'center',
                    justifyContent: 'center',
                    shadowColor: isDark ? '#000' : gradient[0],
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.3 : 0.15,
                    shadowRadius: 12,
                    elevation: 5,
                }}
            >
                <View
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: gradient[0] + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8,
                    }}
                >
                    <Text style={{ fontSize: 24 }}>{icon}</Text>
                </View>
                <Text
                    style={{
                        fontSize: 12,
                        fontWeight: '500',
                        textAlign: 'center',
                        color: isDark ? '#cbd5e1' : '#334155',
                        paddingHorizontal: 4,
                    }}
                    numberOfLines={1}
                >
                    {title}
                </Text>
            </AnimatedPressable>
        </ScaleInView>
    );
}

export default function Home() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const { recentFiles, addRecentFile, clearRecentFiles } = useRecentFiles();

    const pickDocument = async () => {
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets[0]) {
                const file = result.assets[0];
                addRecentFile({ name: file.name, uri: file.uri, size: file.size });
                router.push({ pathname: '/viewer', params: { uri: file.uri } });
            }
        } catch (err) {
            console.log('Error picking document:', err);
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
        { title: 'Extract Text', icon: '📄', route: '/extract-text', gradient: ['#6366f1', '#818cf8'] as const },
        { title: 'Extract Images', icon: '🖼️', route: '/extract-images', gradient: ['#f43f5e', '#fb7185'] as const },
        { title: 'Page Numbers', icon: '🔢', route: '/page-numbers', gradient: ['#3b82f6', '#60a5fa'] as const },
        { title: 'Rotate', icon: '🔄', route: '/rotate', gradient: ['#a855f7', '#c084fc'] as const },
    ];

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#020617' : '#f8fafc' }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />

            {/* Premium Gradient Header */}
            <LinearGradient
                colors={isDark ? ['#1e1b4b', '#0f172a'] : ['#6366f1', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                    paddingTop: 60,
                    paddingBottom: 32,
                    paddingHorizontal: 24,
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                }}
            >
                <Animated.View entering={FadeInDown.delay(100).springify()} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 40, marginBottom: 8 }}>🧘</Text>
                    <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold', letterSpacing: -0.5 }}>
                        PDF Mantra
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 4 }}>
                        Your Privacy-First PDF Toolkit
                    </Text>
                </Animated.View>

                {/* Open PDF Button */}
                <Animated.View entering={FadeInUp.delay(200).springify()}>
                    <AnimatedPressable
                        onPress={pickDocument}
                        scaleValue={0.98}
                        style={{
                            marginTop: 24,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: 16,
                            padding: 16,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderWidth: 1,
                            borderColor: 'rgba(255,255,255,0.3)',
                        }}
                    >
                        <Text style={{ color: '#fff', fontSize: 17, fontWeight: '600' }}>
                            📖  Open PDF File
                        </Text>
                    </AnimatedPressable>
                </Animated.View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Tools Section */}
                <FadeInView delay={300}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 8 }}>
                        <Text style={{
                            fontSize: 13,
                            fontWeight: '600',
                            letterSpacing: 1,
                            color: isDark ? '#64748b' : '#64748b',
                        }}>
                            TOOLS
                        </Text>
                        <View style={{
                            height: 1,
                            flex: 1,
                            marginLeft: 12,
                            backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                        }} />
                    </View>
                </FadeInView>

                {/* Tools Grid */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {tools.map((tool, index) => (
                        <ToolCard
                            key={tool.route}
                            title={tool.title}
                            icon={tool.icon}
                            onPress={() => router.push(tool.route as any)}
                            gradient={tool.gradient}
                            isDark={isDark}
                            index={index}
                        />
                    ))}
                </View>

                {/* Quick Access */}
                <FadeInView delay={600}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 16 }}>
                        <Text style={{
                            fontSize: 13,
                            fontWeight: '600',
                            letterSpacing: 1,
                            color: isDark ? '#64748b' : '#64748b',
                        }}>
                            QUICK ACCESS
                        </Text>
                        <View style={{
                            height: 1,
                            flex: 1,
                            marginLeft: 12,
                            backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                        }} />
                    </View>
                </FadeInView>

                <FadeInView delay={700} style={{ flexDirection: 'row', gap: 12 }}>
                    <AnimatedPressable
                        onPress={() => router.push('/about')}
                        scaleValue={0.97}
                        style={{
                            flex: 1,
                            padding: 16,
                            borderRadius: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <Text style={{ fontSize: 18, marginRight: 8 }}>ℹ️</Text>
                        <Text style={{ fontWeight: '500', color: isDark ? '#cbd5e1' : '#334155' }}>
                            About
                        </Text>
                    </AnimatedPressable>

                    <AnimatedPressable
                        onPress={() => router.push('/settings')}
                        scaleValue={0.97}
                        style={{
                            flex: 1,
                            padding: 16,
                            borderRadius: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#ffffff',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.05,
                            shadowRadius: 8,
                            elevation: 2,
                        }}
                    >
                        <Text style={{ fontSize: 18, marginRight: 8 }}>⚙️</Text>
                        <Text style={{ fontWeight: '500', color: isDark ? '#cbd5e1' : '#334155' }}>
                            Settings
                        </Text>
                    </AnimatedPressable>
                </FadeInView>

                {/* ... existing Quick Access ... */}

                {/* Recent Files Section */}
                {recentFiles.length > 0 && (
                    <FadeInView delay={800} style={{ marginTop: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{
                                fontSize: 13,
                                fontWeight: '600',
                                letterSpacing: 1,
                                color: isDark ? '#64748b' : '#64748b',
                            }}>
                                RECENT FILES
                            </Text>
                            <View style={{
                                height: 1,
                                flex: 1,
                                marginLeft: 12,
                                backgroundColor: isDark ? '#1e293b' : '#e2e8f0',
                            }} />
                            {recentFiles.length > 0 && (
                                <AnimatedPressable onPress={clearRecentFiles} scaleValue={0.9}>
                                    <Text style={{ fontSize: 12, color: isDark ? '#ef4444' : '#f87171', marginLeft: 8 }}>Clear</Text>
                                </AnimatedPressable>
                            )}
                        </View>

                        {recentFiles.map((file: any, i: number) => (
                            <AnimatedPressable
                                key={file.id}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    // Re-add to move to top
                                    addRecentFile({ name: file.name, uri: file.uri, size: file.size });
                                    router.push({ pathname: '/viewer', params: { uri: file.uri } });
                                }}
                                scaleValue={0.98}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 12,
                                    borderRadius: 12,
                                    marginBottom: 8,
                                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.5)' : '#fff',
                                    borderWidth: 1,
                                    borderColor: isDark ? '#334155' : '#e2e8f0',
                                }}
                            >
                                <View style={{
                                    width: 40, height: 40,
                                    borderRadius: 10,
                                    backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                                    alignItems: 'center', justifyContent: 'center',
                                    marginRight: 12
                                }}>
                                    <Text style={{ fontSize: 20 }}>📄</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: isDark ? '#fff' : '#1e293b', fontWeight: '500' }} numberOfLines={1}>
                                        {file.name}
                                    </Text>
                                    <Text style={{ color: isDark ? '#64748b' : '#94a3b8', fontSize: 11 }}>
                                        {new Date(file.timestamp).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={{ color: isDark ? '#475569' : '#cbd5e1', fontSize: 18 }}>›</Text>
                            </AnimatedPressable>
                        ))}
                    </FadeInView>
                )}

                {/* Footer */}
                <FadeInView delay={900} style={{ marginTop: 32, alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{
                            width: 8,
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: isDark ? '#34d399' : '#10b981',
                            marginRight: 8,
                        }} />
                        <Text style={{ fontSize: 12, color: isDark ? '#475569' : '#94a3b8' }}>
                            100% Offline • Privacy First
                        </Text>
                    </View>
                </FadeInView>
            </ScrollView>
        </View>
    );
}
