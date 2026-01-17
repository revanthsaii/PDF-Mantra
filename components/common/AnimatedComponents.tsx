import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedPressableProps extends TouchableOpacityProps {
    children: React.ReactNode;
    onPress?: () => void;
    scaleValue?: number;
    haptic?: boolean;
    style?: ViewStyle;
    className?: string;
}

/**
 * Premium press animation with spring physics - iOS-like feel
 */
export function AnimatedPressable({
    children,
    onPress,
    scaleValue = 0.97,
    haptic = true,
    style,
    className,
    ...props
}: AnimatedPressableProps) {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(scaleValue, {
            damping: 15,
            stiffness: 400,
        });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 400,
        });
    };

    const handlePress = () => {
        if (haptic) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress?.();
    };

    return (
        <AnimatedTouchable
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            style={[animatedStyle, style]}
            className={className}
            {...props}
        >
            {children}
        </AnimatedTouchable>
    );
}

interface FadeInViewProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    style?: ViewStyle;
    className?: string;
}

/**
 * Fade-in animation for entrance effects
 */
export function FadeInView({
    children,
    delay = 0,
    duration = 400,
    style,
    className,
}: FadeInViewProps) {
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(20);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            opacity.value = withTiming(1, { duration });
            translateY.value = withSpring(0, {
                damping: 20,
                stiffness: 200,
            });
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay, duration]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View style={[animatedStyle, style]} className={className}>
            {children}
        </Animated.View>
    );
}

interface ScaleInViewProps {
    children: React.ReactNode;
    delay?: number;
    style?: ViewStyle;
    className?: string;
}

/**
 * Scale-in animation for cards and icons
 */
export function ScaleInView({
    children,
    delay = 0,
    style,
    className,
}: ScaleInViewProps) {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        const timeout = setTimeout(() => {
            scale.value = withSpring(1, {
                damping: 12,
                stiffness: 200,
            });
            opacity.value = withTiming(1, { duration: 300 });
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay]);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[animatedStyle, style]} className={className}>
            {children}
        </Animated.View>
    );
}

interface StaggeredListProps {
    children: React.ReactNode[];
    staggerDelay?: number;
}

/**
 * Staggered animation for list items
 */
export function StaggeredList({ children, staggerDelay = 50 }: StaggeredListProps) {
    return (
        <>
            {React.Children.map(children, (child, index) => (
                <FadeInView delay={index * staggerDelay}>
                    {child}
                </FadeInView>
            ))}
        </>
    );
}
