import { View, Text, ScrollView, Alert, useColorScheme, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import { useState, useEffect } from 'react';
import { AnimatedPressable, FadeInView } from '../components/common';

interface SettingItemProps {
    title: string;
    subtitle?: string;
    icon: string;
    onPress?: () => void;
    showArrow?: boolean;
    isDark: boolean;
    delay?: number;
}

function SettingItem({ title, subtitle, icon, onPress, showArrow = true, isDark, delay = 0 }: SettingItemProps) {
    return (
        <FadeInView delay={delay}>
            <AnimatedPressable
                onPress={onPress}
                disabled={!onPress}
                scaleValue={0.98}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 16,
                    borderRadius: 16,
                    marginBottom: 8,
                    backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 1,
                }}
            >
                <View style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: isDark ? 'rgba(51, 65, 85, 0.5)' : '#f1f5f9',
                }}>
                    <Text style={{ fontSize: 18 }}>{icon}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ fontWeight: '500', color: isDark ? '#fff' : '#1e293b' }}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text style={{ fontSize: 13, marginTop: 2, color: isDark ? '#64748b' : '#64748b' }}>
                            {subtitle}
                        </Text>
                    )}
                </View>
                {showArrow && onPress && (
                    <Text style={{ color: isDark ? '#475569' : '#cbd5e1', fontSize: 18 }}>›</Text>
                )}
            </AnimatedPressable>
        </FadeInView>
    );
}

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [cacheSize, setCacheSize] = useState<string>('Calculating...');

    useEffect(() => {
        const calculateCacheSize = async () => {
            try {
                if (FileSystem.cacheDirectory) {
                    const info = await FileSystem.getInfoAsync(FileSystem.cacheDirectory);
                    if (info.exists && 'size' in info) {
                        const sizeInMB = (info.size / (1024 * 1024)).toFixed(2);
                        setCacheSize(`${sizeInMB} MB`);
                    } else {
                        setCacheSize('0 MB');
                    }
                }
            } catch {
                setCacheSize('Unknown');
            }
        };
        calculateCacheSize();
    }, []);

    const clearCache = async () => {
        Alert.alert(
            'Clear Cache',
            'This will delete all temporary PDF files. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            if (FileSystem.cacheDirectory) {
                                await FileSystem.deleteAsync(FileSystem.cacheDirectory, { idempotent: true });
                                setCacheSize('0 MB');
                                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                                Alert.alert('Success', 'Cache cleared successfully');
                            }
                        } catch {
                            Alert.alert('Error', 'Failed to clear cache');
                        }
                    },
                },
            ]
        );
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
                    paddingBottom: 32,
                    paddingHorizontal: 24,
                    borderBottomLeftRadius: 32,
                    borderBottomRightRadius: 32,
                }}
            >
                <Animated.View entering={FadeInDown.delay(100).springify()}>
                    <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>Settings</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginTop: 4 }}>
                        Customize your experience
                    </Text>
                </Animated.View>
            </LinearGradient>

            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16 }}
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Storage Section */}
                <FadeInView delay={150}>
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        letterSpacing: 1,
                        marginBottom: 12,
                        marginLeft: 4,
                        color: isDark ? '#64748b' : '#64748b',
                    }}>
                        STORAGE
                    </Text>
                </FadeInView>
                <SettingItem
                    icon="🗑️"
                    title="Clear Cache"
                    subtitle={`Current usage: ${cacheSize}`}
                    onPress={clearCache}
                    isDark={isDark}
                    delay={200}
                />

                {/* About Section */}
                <FadeInView delay={250}>
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        letterSpacing: 1,
                        marginBottom: 12,
                        marginLeft: 4,
                        marginTop: 16,
                        color: isDark ? '#64748b' : '#64748b',
                    }}>
                        ABOUT
                    </Text>
                </FadeInView>
                <SettingItem icon="📱" title="Version" subtitle="1.1.0" showArrow={false} isDark={isDark} delay={300} />
                <SettingItem
                    icon="💻"
                    title="Source Code"
                    subtitle="View on GitHub"
                    onPress={() => Linking.openURL('https://github.com/revanthsaii/PDF-Mantra')}
                    isDark={isDark}
                    delay={350}
                />
                <SettingItem
                    icon="⭐"
                    title="Rate This App"
                    onPress={() => Alert.alert('Coming Soon', 'App store rating will be available after release')}
                    isDark={isDark}
                    delay={400}
                />

                {/* Legal Section */}
                <FadeInView delay={450}>
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        letterSpacing: 1,
                        marginBottom: 12,
                        marginLeft: 4,
                        marginTop: 16,
                        color: isDark ? '#64748b' : '#64748b',
                    }}>
                        LEGAL
                    </Text>
                </FadeInView>
                <SettingItem
                    icon="📜"
                    title="License"
                    subtitle="MIT License"
                    onPress={() => Alert.alert('MIT License', 'PDF Mantra is open source software licensed under the MIT License.')}
                    isDark={isDark}
                    delay={500}
                />
                <SettingItem
                    icon="🔒"
                    title="Privacy"
                    subtitle="100% Offline - No data collected"
                    onPress={() => Alert.alert('Privacy', 'All files are processed locally. We never collect or transmit your data.')}
                    isDark={isDark}
                    delay={550}
                />

                {/* Developer Card */}
                <FadeInView delay={600}>
                    <View style={{
                        marginTop: 24,
                        padding: 20,
                        borderRadius: 24,
                        alignItems: 'center',
                        backgroundColor: isDark ? 'rgba(30, 41, 59, 0.8)' : '#fff',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 10,
                        elevation: 3,
                    }}>
                        <Text style={{ fontSize: 36, marginBottom: 8 }}>🧘</Text>
                        <Text style={{ fontWeight: 'bold', fontSize: 18, color: isDark ? '#fff' : '#1e293b' }}>
                            PDF Mantra
                        </Text>
                        <Text style={{ fontSize: 14, color: isDark ? '#64748b' : '#64748b' }}>
                            Made with ❤️ by Revanth Sai
                        </Text>
                    </View>
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
