import { useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

export interface PDFFileInfo {
    asset: DocumentPicker.DocumentPickerAsset;
    size: number;
    sizeFormatted: string;
}

interface UsePDFPickerOptions {
    multiple?: boolean;
    onError?: (error: Error) => void;
}

export function usePDFPicker(options: UsePDFPickerOptions = {}) {
    const [files, setFiles] = useState<PDFFileInfo[]>([]);
    const [loading, setLoading] = useState(false);

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    };

    const pickFile = async () => {
        try {
            setLoading(true);
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
                multiple: options.multiple ?? false,
            });

            if (!result.canceled) {
                const newFiles: PDFFileInfo[] = [];

                for (const asset of result.assets) {
                    const fileInfo = await FileSystem.getInfoAsync(asset.uri);
                    const size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

                    newFiles.push({
                        asset,
                        size,
                        sizeFormatted: formatSize(size),
                    });
                }

                if (options.multiple) {
                    setFiles(prev => [...prev, ...newFiles]);
                } else {
                    setFiles(newFiles);
                }

                return newFiles;
            }
            return null;
        } catch (error) {
            const err = error instanceof Error ? error : new Error('Failed to pick file');
            options.onError?.(err);
            Alert.alert('Error', 'Failed to pick file');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const removeFile = (index: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFiles(files.filter((_, idx) => idx !== index));
    };

    const clearFiles = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setFiles([]);
    };

    const getFile = () => files[0] ?? null;

    return {
        files,
        file: getFile(),
        loading,
        pickFile,
        removeFile,
        clearFiles,
        hasFiles: files.length > 0,
        fileCount: files.length,
    };
}
