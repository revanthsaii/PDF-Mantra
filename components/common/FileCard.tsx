import React from 'react';
import { View, Text, TouchableOpacity, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';

interface FileCardProps {
    name: string;
    size?: string;
    index?: number;
    onRemove?: () => void;
    showIndex?: boolean;
}

export function FileCard({ name, size, index, onRemove, showIndex = false }: FileCardProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleRemove = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onRemove?.();
    };

    return (
        <View className={`flex-row items-center p-4 rounded-xl mb-2 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
            <Text className="text-lg mr-3">📄</Text>
            <View className="flex-1">
                <Text
                    className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                    numberOfLines={1}
                >
                    {name}
                </Text>
                <View className="flex-row items-center mt-1">
                    {showIndex && index !== undefined && (
                        <Text className={`text-xs mr-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            #{index + 1}
                        </Text>
                    )}
                    {size && (
                        <Text className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {size}
                        </Text>
                    )}
                </View>
            </View>
            {onRemove && (
                <TouchableOpacity
                    onPress={handleRemove}
                    className={`p-2 rounded-lg ${isDark ? 'bg-red-900/30' : 'bg-red-50'}`}
                >
                    <Text className="text-red-500 font-bold">✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}
