import { View, Text, TouchableOpacity, ScrollView, Alert, useColorScheme, Linking } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import { useState, useEffect } from 'react';

interface SettingItemProps {
    title: string;
    subtitle?: string;
    icon: string;
    onPress?: () => void;
    showArrow?: boolean;
    isDark: boolean;
    danger?: boolean;
}

function SettingItem({ title, subtitle, icon, onPress, showArrow = true, isDark, danger = false }: SettingItemProps) {
    return (
        <TouchableOpacity
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress?.();
            }}
            disabled={!onPress}
            className={`flex-row items-center p-4 rounded-2xl mb-2 ${isDark ? 'bg-slate-800/80' : 'bg-white'}`}
            style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 1,
            }}
        >
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Text className="text-lg">{icon}</Text>
            </View>
            <View className="flex-1 ml-3">
                <Text className={`font-medium ${danger ? 'text-red-500' : (isDark ? 'text-white' : 'text-slate-800')}`}>
                    {title}
                </Text>
                {subtitle && (
                    <Text className={`text-sm mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {showArrow && onPress && (
                <Text className={isDark ? 'text-slate-500' : 'text-slate-300'}>›</Text>
            )}
        </TouchableOpacity>
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
                className="pt-24 pb-8 px-6"
                style={{ borderBottomLeftRadius: 32, borderBottomRightRadius: 32 }}
            >
                <Text className="text-white text-2xl font-bold">Settings</Text>
                <Text className="text-white/60 text-sm mt-1">
                    Customize your experience
                </Text>
            </LinearGradient>

            <ScrollView
                className="flex-1 px-4"
                contentContainerStyle={{ paddingTop: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Storage Section */}
                <Text className={`text-xs font-semibold tracking-wider mb-3 ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    STORAGE
                </Text>
                <SettingItem
                    icon="🗑️"
                    title="Clear Cache"
                    subtitle={`Current usage: ${cacheSize}`}
                    onPress={clearCache}
                    isDark={isDark}
                />

                {/* About Section */}
                <Text className={`text-xs font-semibold tracking-wider mb-3 ml-1 mt-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    ABOUT
                </Text>
                <SettingItem
                    icon="📱"
                    title="Version"
                    subtitle="1.1.0"
                    showArrow={false}
                    isDark={isDark}
                />
                <SettingItem
                    icon="💻"
                    title="Source Code"
                    subtitle="View on GitHub"
                    onPress={() => Linking.openURL('https://github.com/revanthsaii/PDF-Mantra')}
                    isDark={isDark}
                />
                <SettingItem
                    icon="⭐"
                    title="Rate This App"
                    onPress={() => Alert.alert('Coming Soon', 'App store rating will be available after release')}
                    isDark={isDark}
                />

                {/* Legal Section */}
                <Text className={`text-xs font-semibold tracking-wider mb-3 ml-1 mt-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    LEGAL
                </Text>
                <SettingItem
                    icon="📜"
                    title="License"
                    subtitle="MIT License"
                    onPress={() => Alert.alert('MIT License', 'PDF Mantra is open source software licensed under the MIT License.')}
                    isDark={isDark}
                />
                <SettingItem
                    icon="🔒"
                    title="Privacy"
                    subtitle="100% Offline - No data collected"
                    onPress={() => Alert.alert('Privacy', 'All files are processed locally. We never collect or transmit your data.')}
                    isDark={isDark}
                />

                {/* Developer Card */}
                <View
                    className={`mt-8 p-5 rounded-3xl items-center ${isDark ? 'bg-slate-900' : 'bg-white'}`}
                    style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 }}
                >
                    <Text className="text-3xl mb-2">🧘</Text>
                    <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        PDF Mantra
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Made with ❤️ by Aetherium Labs
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
