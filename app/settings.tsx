import { View, Text, TouchableOpacity, ScrollView, Alert, useColorScheme, Linking } from 'react-native';
import { Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import { useState } from 'react';

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
            className={`flex-row items-center p-4 rounded-xl mb-2 ${isDark ? 'bg-slate-800' : 'bg-white'}`}
        >
            <Text className="text-2xl mr-4">{icon}</Text>
            <View className="flex-1">
                <Text className={`font-medium ${danger ? 'text-red-500' : (isDark ? 'text-white' : 'text-slate-800')}`}>
                    {title}
                </Text>
                {subtitle && (
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {subtitle}
                    </Text>
                )}
            </View>
            {showArrow && (
                <Text className={isDark ? 'text-slate-500' : 'text-slate-400'}>›</Text>
            )}
        </TouchableOpacity>
    );
}

export default function SettingsScreen() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [cacheSize, setCacheSize] = useState<string>('Calculating...');

    // Calculate cache size on mount
    useState(() => {
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
    });

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

    const openGitHub = () => {
        Linking.openURL('https://github.com/AetheriumLabs/pdf-mantra');
    };

    const rateApp = () => {
        Alert.alert('Coming Soon', 'App store rating will be available after release');
    };

    const shareApp = () => {
        Alert.alert('Share PDF Mantra', 'Share functionality coming soon!');
    };

    return (
        <View className={`flex-1 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
            <Stack.Screen
                options={{
                    title: 'Settings',
                    headerStyle: { backgroundColor: isDark ? '#1e293b' : '#ffffff' },
                    headerTintColor: isDark ? '#f1f5f9' : '#1e293b',
                }}
            />

            <ScrollView className="flex-1 p-4">
                {/* Storage Section */}
                <Text className={`text-sm font-semibold mb-2 ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    STORAGE
                </Text>
                <View className="mb-6">
                    <SettingItem
                        icon="🗑️"
                        title="Clear Cache"
                        subtitle={`Current usage: ${cacheSize}`}
                        onPress={clearCache}
                        isDark={isDark}
                    />
                </View>

                {/* About Section */}
                <Text className={`text-sm font-semibold mb-2 ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    ABOUT
                </Text>
                <View className="mb-6">
                    <SettingItem
                        icon="📖"
                        title="Version"
                        subtitle="1.1.0"
                        showArrow={false}
                        isDark={isDark}
                    />
                    <SettingItem
                        icon="💻"
                        title="Source Code"
                        subtitle="View on GitHub"
                        onPress={openGitHub}
                        isDark={isDark}
                    />
                    <SettingItem
                        icon="⭐"
                        title="Rate This App"
                        onPress={rateApp}
                        isDark={isDark}
                    />
                    <SettingItem
                        icon="📤"
                        title="Share App"
                        onPress={shareApp}
                        isDark={isDark}
                    />
                </View>

                {/* Legal Section */}
                <Text className={`text-sm font-semibold mb-2 ml-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    LEGAL
                </Text>
                <View className="mb-6">
                    <SettingItem
                        icon="📜"
                        title="Open Source License"
                        subtitle="MIT License"
                        onPress={() => {
                            Alert.alert(
                                'MIT License',
                                'PDF Mantra is open source software licensed under the MIT License. You are free to use, modify, and distribute this software.'
                            );
                        }}
                        isDark={isDark}
                    />
                    <SettingItem
                        icon="🔒"
                        title="Privacy Policy"
                        subtitle="100% Offline - No data collection"
                        onPress={() => {
                            Alert.alert(
                                'Privacy Policy',
                                'PDF Mantra processes all files locally on your device. We do not collect, store, or transmit any of your data. Your PDFs never leave your device.'
                            );
                        }}
                        isDark={isDark}
                    />
                </View>

                {/* Developer Info */}
                <View className={`p-4 rounded-2xl items-center ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                    <Text className="text-4xl mb-2">🧘</Text>
                    <Text className={`font-bold text-lg ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        PDF Mantra
                    </Text>
                    <Text className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Made with ❤️ by Aetherium Labs
                    </Text>
                    <Text className={`text-xs mt-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        Privacy First • Open Source • Offline
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}
