import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

const RECENT_FILES_PATH = FileSystem.documentDirectory + 'recent_files.json';

export type RecentFile = {
    id: string;
    name: string;
    uri: string;
    timestamp: number;
    size?: number;
    preview?: string; // Potential for thumbnail
};

export const useRecentFiles = () => {
    const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
    const [loading, setLoading] = useState(true);

    const loadRecentFiles = useCallback(async () => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(RECENT_FILES_PATH);
            if (fileInfo.exists) {
                const content = await FileSystem.readAsStringAsync(RECENT_FILES_PATH);
                setRecentFiles(JSON.parse(content));
            }
        } catch (error) {
            console.error('Failed to load recent files:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const addRecentFile = useCallback(async (file: { name: string; uri: string; size?: number }) => {
        try {
            const newFile: RecentFile = {
                id: Date.now().toString(),
                name: file.name,
                uri: file.uri,
                timestamp: Date.now(),
                size: file.size,
            };

            setRecentFiles((prev) => {
                // Remove duplicates by name/uri and keep only last 10
                const filtered = prev.filter(f => f.name !== file.name);
                const updated = [newFile, ...filtered].slice(0, 10);

                // Persist asynchronously
                FileSystem.writeAsStringAsync(RECENT_FILES_PATH, JSON.stringify(updated))
                    .catch(e => console.error('Failed to save recent files:', e));

                return updated;
            });
        } catch (error) {
            console.error('Failed to add recent file:', error);
        }
    }, []);

    const clearRecentFiles = useCallback(async () => {
        try {
            await FileSystem.deleteAsync(RECENT_FILES_PATH, { idempotent: true });
            setRecentFiles([]);
        } catch (error) {
            console.error('Failed to clear recent files:', error);
        }
    }, []);

    useEffect(() => {
        loadRecentFiles();
    }, [loadRecentFiles]);

    return {
        recentFiles,
        loading,
        addRecentFile,
        clearRecentFiles,
        reload: loadRecentFiles
    };
};
