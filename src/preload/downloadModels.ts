import { ipcRenderer } from 'electron';

export const downloadPreload = {
    //   startDownload: (url, filename) => ipcRenderer.invoke('start-download', { url, filename })
    ipcRenderer: {
        send: (channel, data) => ipcRenderer.send(channel, data),
        on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
        removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel), // ✅ Add this
        removeListener: (channel, func) => ipcRenderer.removeListener(channel, func) // Optional
    },
    startDownload: (url, filename) => {
        return ipcRenderer.invoke('start-download', { url, filename });
    },
};