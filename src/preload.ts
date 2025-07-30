// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    openModelFile: () => ipcRenderer.invoke('open-file-dialog'),
    setPrompt: (prompt) => ipcRenderer.send('set-prompt', prompt),
    onChatID: (chatId) => ipcRenderer.send("set-chat-id", chatId),

    onChat: (callback) => {
        // Remove all existing listeners first
        ipcRenderer.removeAllListeners("on-chat");
        ipcRenderer.on("on-chat", (event, data) => {
            console.log(data);
            callback(data);
        });
    },

    onChatEnd: (callback) => {
        // Remove all existing listeners first
        ipcRenderer.removeAllListeners("on-chat-end");
        ipcRenderer.on("on-chat-end", (event, data) => callback(data));
    },

    onChatTerminate: () => ipcRenderer.invoke('terminate-ongoing-chat'),
    onChatRestart: () => ipcRenderer.invoke("restart-chat"),

    removeChatListener: (callback) => ipcRenderer.removeListener("on-chat", callback),
    removeChatEndListener: (callback) => ipcRenderer.removeListener("on-chat-end", callback),


    // on Downlaod
    startDownload: (url, filename) => {
        return ipcRenderer.invoke('start-download', { url, filename });
    }
});
