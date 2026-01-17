import { View, Text, ScrollView, Linking, useColorScheme } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable, FadeInView } from '../components/common';

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
                    paddingBottom: 40,
                    paddingHorizontal: 24,
                    alignItems: 'center',
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                }}
            >
                <Animated.View entering={FadeInDown.delay(100).springify()} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 56, marginBottom: 8 }}>🧘</Text>
                    <Text style={{ color: '#fff', fontSize: 32, fontWeight: 'bold' }}>PDF Mantra</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>Version 1.1.0</Text>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 12,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                    }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#34d399', marginRight: 8 }} />
                        <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '500' }}>
                            Privacy First • 100% Offline
                        </Text>
                    </View>
                </Animated.View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16 }}
                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Features Grid */}
                <FadeInView delay={200}>
                    <View style={{
                        marginTop: 24,
                        padding: 20,
                        borderRadius: 24,
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                        elevation: 3,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            letterSpacing: 1,
                            marginBottom: 16,
                            color: isDark ? '#64748b' : '#64748b',
                        }}>
                            FEATURES
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {features.map((feature, i) => (
                                <View
                                    key={i}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        paddingHorizontal: 12,
                                        paddingVertical: 8,
                                        borderRadius: 12,
                                        backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : '#f1f5f9',
                                    }}
                                >
                                    <Text style={{ marginRight: 6 }}>{feature.icon}</Text>
                                    <Text style={{ fontSize: 13, color: isDark ? '#cbd5e1' : '#475569' }}>
                                        {feature.text}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </FadeInView>

                {/* Developer Card */}
                <FadeInView delay={300}>
                    <View style={{
                        marginTop: 16,
                        padding: 20,
                        borderRadius: 24,
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                        elevation: 3,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            letterSpacing: 1,
                            marginBottom: 16,
                            color: isDark ? '#64748b' : '#64748b',
                        }}>
                            DEVELOPER
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <View style={{
                                width: 48,
                                height: 48,
                                borderRadius: 24,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#eef2ff',
                            }}>
                                <Text style={{ fontSize: 22 }}>👨‍💻</Text>
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={{ fontWeight: '600', color: isDark ? '#fff' : '#1e293b' }}>
                                    @revanthsaii
                                </Text>
                                <Text style={{ fontSize: 13, color: isDark ? '#64748b' : '#64748b' }}>
                                    Revanth Sai
                                </Text>
                            </View>
                        </View>
                        <AnimatedPressable
                            onPress={() => openLink('https://github.com/revanthsaii/PDF-Mantra')}
                            scaleValue={0.98}
                            style={{
                                backgroundColor: '#1e293b',
                                padding: 16,
                                borderRadius: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 5,
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600' }}>⭐  Star on GitHub</Text>
                        </AnimatedPressable>
                    </View>
                </FadeInView>

                {/* Tech Stack */}
                <FadeInView delay={400}>
                    <View style={{
                        marginTop: 16,
                        padding: 20,
                        borderRadius: 24,
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                        elevation: 3,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            fontWeight: '600',
                            letterSpacing: 1,
                            marginBottom: 16,
                            color: isDark ? '#64748b' : '#64748b',
                        }}>
                            BUILT WITH
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {['React Native', 'Expo', 'TypeScript', 'pdf-lib', 'Reanimated'].map((tech, i) => (
                                <View
                                    key={i}
                                    style={{
                                        paddingHorizontal: 16,
                                        paddingVertical: 8,
                                        borderRadius: 20,
                                        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : '#eef2ff',
                                    }}
                                >
                                    <Text style={{ fontSize: 13, fontWeight: '500', color: isDark ? '#a5b4fc' : '#6366f1' }}>
                                        {tech}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </FadeInView>

                {/* Footer */}
                <FadeInView delay={500} style={{ marginTop: 24, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: isDark ? '#64748b' : '#94a3b8' }}>
                        Made with ❤️ for the open source community
                    </Text>
                    <Text style={{ fontSize: 12, marginTop: 4, color: isDark ? '#475569' : '#cbd5e1' }}>
                        © 2024 PDF Mantra • MIT License
                    </Text>
                </FadeInView>
            </ScrollView>

            {/* Floating Back Button */}
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 }}>
                <AnimatedPressable
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        router.back();
                    }}
                    scaleValue={0.98}
                    style={{
                        padding: 16,
                        borderRadius: 16,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDark ? '#1e293b' : '#fff',
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
