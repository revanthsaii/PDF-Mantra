import { Stack } from 'expo-router';
import { View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Use the exact background colors that match the screens
    const backgroundColor = isDark ? '#020617' : '#f8fafc';

    return (
        <View style={{ flex: 1, backgroundColor }}>
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <Stack
                screenOptions={{
                    headerShown: false,
                    headerStyle: {
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                    },
                    headerTintColor: isDark ? '#f1f5f9' : '#1e293b',
                    headerTitleStyle: {
                        fontWeight: '600',
                    },
                    contentStyle: {
                        backgroundColor: backgroundColor,
                    },
                    // iOS-like smooth animations
                    animation: 'slide_from_right',
                    animationDuration: 350,
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                    fullScreenGestureEnabled: true,
                    presentation: 'card',
                }}
            />
        </View>
    );
}
