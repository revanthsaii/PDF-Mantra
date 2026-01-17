import React from 'react';
import { View, Text, ActivityIndicator, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface LoadingOverlayProps {
    visible: boolean;
    message?: string;
}

export function LoadingOverlay({ visible, message = 'Processing...' }: LoadingOverlayProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 0.7, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [visible, pulseAnim]);

    if (!visible) return null;

    return (
        <View className="absolute inset-0 z-50 bg-black/60 items-center justify-center">
            <Animated.View
                style={{ opacity: pulseAnim }}
                className="bg-slate-800 p-6 rounded-2xl items-center"
            >
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="text-white mt-3 font-semibold text-base">{message}</Text>
            </Animated.View>
        </View>
    );
}
