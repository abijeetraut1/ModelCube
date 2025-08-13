// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from 'electron';
import { downloadPreload } from './preload/downloadModels';
import { chatLLMPreload } from './preload/chatLLM';
import { trainModel } from './preload/TrainModel.ts';

contextBridge.exposeInMainWorld('electronAPI', {
    openModelFile: () => ipcRenderer.invoke('open-file-dialog'),

    // chat llm preload
    // ...chatLLMPreload,
    setPrompt: (prompt) => ipcRenderer.send('set-prompt', prompt),
    onChatID: (chatId) => ipcRenderer.send("set-chat-id", chatId),

    onChat: (callback) => {
        // Remove all existing listeners first
        ipcRenderer.removeAllListeners("on-chat");
        ipcRenderer.on("on-chat", (event, data) => {
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
    ...downloadPreload,
    // ipcRenderer: {
    //     send: (channel, data) => ipcRenderer.send(channel, data),
    //     on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
    //     removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel), // ✅ Add this
    //     removeListener: (channel, func) => ipcRenderer.removeListener(channel, func) // Optional
    // },
    // startDownload: (url, filename) => {
    //     return ipcRenderer.invoke('start-download', { url, filename });
    // },

    // train model
    ...trainModel,

});
