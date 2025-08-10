import { ipcRenderer } from "electron";

export const trainModel = {
    openDatasetFile: () => ipcRenderer.invoke('open-file-dialog-dataset'),
    trainModel: () => ipcRenderer.invoke('show-train-alert'),
    selectDataset: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => {
        const listener = (event, ...args) => func(...args);
        ipcRenderer.on(channel, listener);
        return () => ipcRenderer.removeListener(channel, listener); // optional unsubscriber
    },
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
};
