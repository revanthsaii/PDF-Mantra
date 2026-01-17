import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export type ProcessingStatus = 'idle' | 'processing' | 'success' | 'error';

interface ProcessorState<T> {
    status: ProcessingStatus;
    progress: number;
    result: T | null;
    error: string | null;
}

interface UsePDFProcessorOptions {
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

export function usePDFProcessor<T = any>(options: UsePDFProcessorOptions = {}) {
    const [state, setState] = useState<ProcessorState<T>>({
        status: 'idle',
        progress: 0,
        result: null,
        error: null,
    });

    const startProcessing = useCallback(() => {
        setState({
            status: 'processing',
            progress: 0,
            result: null,
            error: null,
        });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, []);

    const updateProgress = useCallback((progress: number) => {
        setState(prev => ({ ...prev, progress: Math.min(100, Math.max(0, progress)) }));
    }, []);

    const complete = useCallback((result: T) => {
        setState({
            status: 'success',
            progress: 100,
            result,
            error: null,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        options.onSuccess?.();
    }, [options]);

    const fail = useCallback((error: string) => {
        setState({
            status: 'error',
            progress: 0,
            result: null,
            error,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        options.onError?.(error);
    }, [options]);

    const reset = useCallback(() => {
        setState({
            status: 'idle',
            progress: 0,
            result: null,
            error: null,
        });
    }, []);

    const process = useCallback(async <R>(
        operation: (updateProgress: (p: number) => void) => Promise<R>
    ): Promise<R | null> => {
        startProcessing();
        try {
            const result = await operation(updateProgress);
            complete(result as unknown as T);
            return result;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Operation failed';
            fail(message);
            return null;
        }
    }, [startProcessing, updateProgress, complete, fail]);

    return {
        ...state,
        isProcessing: state.status === 'processing',
        isSuccess: state.status === 'success',
        isError: state.status === 'error',
        startProcessing,
        updateProgress,
        complete,
        fail,
        reset,
        process,
    };
}
