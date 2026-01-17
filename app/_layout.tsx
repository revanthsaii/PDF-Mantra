import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Layout() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <>
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
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                    },
                    // iOS-like smooth animations
                    animation: 'slide_from_right',
                    animationDuration: 350,
                    gestureEnabled: true,
                    gestureDirection: 'horizontal',
                    fullScreenGestureEnabled: true,
                }}
            />
        </>
    );
}
