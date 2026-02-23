import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DOWNLOADS_KEY = 'offline_downloads';

export const downloadNote = async (note, onProgress) => {
    try {
        const { id, _id, pdfUrl, title, subject, topper, thumbnail, pageCount } = note;
        const noteId = id || _id;
        
        if (!pdfUrl) {
            const keys = Object.keys(note || {}).join(', ');
            throw new Error(`No PDF URL provided. Available fields: ${keys}`);
        }
        if (!noteId) throw new Error("No note ID provided");

        const fileUri = `${FileSystem.documentDirectory}note_${noteId}.pdf`;
        
        console.log(`Starting download from: ${pdfUrl}`);
        const downloadResumable = FileSystem.createDownloadResumable(
            pdfUrl,
            fileUri,
            {},
            (downloadProgress) => {
                const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                if (onProgress) onProgress(progress);
            }
        );

        const result = await downloadResumable.downloadAsync();
        
        if (result.status !== 200) {
            console.error(`Download failed with status: ${result.status} for URL: ${pdfUrl}`);
            throw new Error(`Download failed with status ${result.status}`);
        }

        console.log(`Download successful: ${fileUri}`);

        // Save metadata locally
        const downloadsStr = await AsyncStorage.getItem(DOWNLOADS_KEY);
        const downloads = downloadsStr ? JSON.parse(downloadsStr) : [];
        
        const newDownload = {
            id: noteId,
            localUri: fileUri,
            title,
            subject,
            topperName: topper?.name || note.topperName || 'Topper',
            thumbnail,
            pageCount,
            downloadedAt: new Date().toISOString()
        };

        const updatedDownloads = [newDownload, ...downloads.filter(d => d.id !== noteId)];
        await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updatedDownloads));
        
        return newDownload;
    } catch (error) {
        console.error("Download Error:", error);
        throw error;
    }
};

export const getDownloadedNotes = async () => {
    try {
        const downloadsStr = await AsyncStorage.getItem(DOWNLOADS_KEY);
        return downloadsStr ? JSON.parse(downloadsStr) : [];
    } catch (error) {
        console.error("Get Downloads Error:", error);
        return [];
    }
};

export const deleteDownloadedNote = async (noteId) => {
    try {
        const fileUri = `${FileSystem.documentDirectory}note_${noteId}.pdf`;
        await FileSystem.deleteAsync(fileUri, { idempotent: true });

        const downloadsStr = await AsyncStorage.getItem(DOWNLOADS_KEY);
        if (downloadsStr) {
            const downloads = JSON.parse(downloadsStr);
            const updatedDownloads = downloads.filter(d => d.id !== noteId);
            await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updatedDownloads));
        }
    } catch (error) {
        console.error("Delete Download Error:", error);
    }
};

export const isNoteDownloaded = async (noteId) => {
    try {
        const downloads = await getDownloadedNotes();
        return downloads.some(d => d.id === noteId);
    } catch (error) {
        return false;
    }
};
