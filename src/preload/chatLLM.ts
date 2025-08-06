import { ipcRenderer } from "electron";

export const chatLLMPreload = {
    setPrompt: (prompt) => ipcRenderer.send('set-prompt', prompt),
    onChatID: (chatId) => ipcRenderer.send("set-chat-id", chatId),

    onChat: (callback) => {
        // Remove all existing listeners first
        ipcRenderer.removeAllListeners("on-chat");
        ipcRenderer.on("on-chat", (event, data) => {
            console.log(data);
            // callback(data);
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

}