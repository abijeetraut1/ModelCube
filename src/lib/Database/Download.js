import IndexedDB from "@/config/IndexedDb";


export const storeDownloadFile = async (file) => {
    console.log(file)

    const existing = await IndexedDB.downloads.get(file.fileName);

    if (!existing) {
        await IndexedDB.downloads.add({
            id: file.fileName,
            url: file.url,
            progress: file.progress,
            status: file.status,
            total: file.total,
            downloaded: 0,
            createdAt: Date.now(),
        })
    } else {
        await IndexedDB.downloads.update(file.fileName, {
            id: file.fileName,
            url: file.url,
            progress: file.progress,
            status: file.status,
            total: file.total,
            downloaded: 0,
            createdAt: Date.now(),
        });
    }
};

export const updateDownload = async (filename, updates) => {
    // console.log(filename, updates);

    const existing = await IndexedDB.downloads.get(filename);

    if (existing) {
        console.log(existing, updates)

        existing['progress'] = updates.progress;
        existing['downloaded'] = updates.downloaded;
        existing['total'] = updates.total;

        // console.log(existing)

        await IndexedDB.downloads.update(filename, {
            ...existing,
            lastUpdated: new Date().toISOString(),
        });
        //     return { status: 200, message: "Download updated", id };
    }
    // else {
    //     return { status: 404, message: "Download not found" };
    // }
};

export const fetchDownloads = async () => {
    const downloads = await IndexedDB.downloads.toArray();
    return {
        stauts: 200,
        message: "Success",
        downloads
    }
};