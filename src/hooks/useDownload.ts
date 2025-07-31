// hooks/useDownload.ts
import { useEffect } from 'react';
import { toast } from 'sonner';

declare global {
    interface Window {
        electronAPI: {
            startDownload: (url: string, filename: string) => Promise<{ success: boolean }>;
            onDownloadProgress: (callback: (progress: any) => void) => void;
            onDownloadComplete: (callback: (data: any) => void) => void;
            onDownloadError: (callback: (error: any) => void) => void;
            removeDownloadListeners: () => void;
        };
    }
}

export const useDownload = () => {
    const triggersDownload = async (file: { downloadUrl: string; filename: string }) => {
        try {
            toast.info(`Starting download: ${file.filename}`);

            const result = await window.electronAPI.startDownload(
                file.downloadUrl,
                file.filename
            );

            if (!result.success) {
                throw new Error('Failed to initiate download');
            }
        } catch (error) {
            toast.error('Download failed', {
                description: error.message
            });
        }
    };

    useEffect(() => {
        const handleProgress = (progress: any) => {
            console.log(`Download progress: ${progress.progress}%`);
            // You can update your UI here or use a state management solution
        };

        const handleComplete = (data: any) => {
            toast.success(`Download complete: ${data.filename}`, {
                action: {
                    label: 'Open',
                    onClick: () => window.electronAPI.openPath(data.path)
                }
            });
        };

        const handleError = (error: any) => {
            toast.error('Download error', {
                description: error.error
            });
        };

        window.electronAPI.onDownloadProgress(handleProgress);
        window.electronAPI.onDownloadComplete(handleComplete);
        window.electronAPI.onDownloadError(handleError);

        return () => {
            window.electronAPI.removeDownloadListeners();
        };
    }, []);

    return { triggersDownload };
};