import React from 'react';
import { View, Text, useColorScheme } from 'react-native';

interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    color?: 'blue' | 'green' | 'red' | 'purple';
}

export function ProgressBar({
    progress,
    label,
    showPercentage = true,
    color = 'blue'
}: ProgressBarProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const colorClasses = {
        blue: 'bg-blue-600',
        green: 'bg-green-600',
        red: 'bg-red-600',
        purple: 'bg-purple-600',
    };

    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <View className="w-full">
            {(label || showPercentage) && (
                <View className="flex-row justify-between mb-2">
                    {label && (
                        <Text className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {label}
                        </Text>
                    )}
                    {showPercentage && (
                        <Text className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            {Math.round(clampedProgress)}%
                        </Text>
                    )}
                </View>
            )}
            <View className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}>
                <View
                    className={`h-full rounded-full ${colorClasses[color]}`}
                    style={{ width: `${clampedProgress}%` }}
                />
            </View>
        </View>
    );
}
