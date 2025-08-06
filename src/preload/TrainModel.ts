import { ipcRenderer } from "electron";

export const trainModel = {
    openDatasetFile: () => ipcRenderer.invoke('open-file-dialog-dataset'),

    ipcRenderer: {
        selectDataset: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel), // ✅ Add this
        removeListener: (channel, func) => ipcRenderer.removeListener(channel, func) // Optional
    }
};
