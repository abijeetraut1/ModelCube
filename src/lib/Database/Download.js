import IndexedDB from "@/config/IndexedDb";

export const storeDownloadFile = async (file) => {
    const existing = await IndexedDB.downloads
        .where("fileName")
        .equals(file.fileName)
        .first();

    if (!existing) {
        await IndexedDB.downloads.add({
            fileName: file.fileName,
            url: file.downloadUrl,
            progress: file.progress || 0,
            status: file.status || "downloading",
            createdAt: Date.now()
        });
    } else {
        // ✅ Update existing record
        await IndexedDB.downloads.update(existing.id, {
            progress: file.progress,
            status: file.status
        });
    }
};

export const fetchDownloads = async () => {
    const downloads = await IndexedDB.downloads.toArray();
    return {
        stauts: 200,
        message: "Success",
        downloads
    }
};