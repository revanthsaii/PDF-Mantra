import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, useColorScheme, ViewStyle } from 'react-native';

interface ActionButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    style?: ViewStyle;
}

export function ActionButton({
    title,
    onPress,
    disabled = false,
    loading = false,
    variant = 'primary',
    style,
}: ActionButtonProps) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const isDisabled = disabled || loading;

    const variantClasses = {
        primary: isDisabled
            ? (isDark ? 'bg-slate-700' : 'bg-slate-300')
            : 'bg-blue-600',
        secondary: isDark ? 'bg-slate-800' : 'bg-slate-200',
        danger: isDisabled
            ? (isDark ? 'bg-slate-700' : 'bg-slate-300')
            : 'bg-red-500',
        success: isDisabled
            ? (isDark ? 'bg-slate-700' : 'bg-slate-300')
            : 'bg-green-600',
    };

    const textClasses = {
        primary: isDisabled ? (isDark ? 'text-slate-400' : 'text-slate-500') : 'text-white',
        secondary: isDark ? 'text-slate-300' : 'text-slate-700',
        danger: isDisabled ? (isDark ? 'text-slate-400' : 'text-slate-500') : 'text-white',
        success: isDisabled ? (isDark ? 'text-slate-400' : 'text-slate-500') : 'text-white',
    };

    const shadowColors = {
        primary: '#3b82f6',
        secondary: 'transparent',
        danger: '#ef4444',
        success: '#22c55e',
    };

    const shadowStyle = !isDisabled && variant !== 'secondary'
        ? {
            shadowColor: shadowColors[variant],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        }
        : {};

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            className={`p-4 rounded-2xl items-center flex-row justify-center ${variantClasses[variant]}`}
            style={[shadowStyle, style]}
        >
            {loading && <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />}
            <Text className={`font-bold text-lg ${textClasses[variant]}`}>
                {title}
            </Text>
        </TouchableOpacity>
    );
}
