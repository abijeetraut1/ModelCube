import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import DownloadManager from "electron-download-manager"

import {
  initializeLLM,
  createLLMSession,
  chatWithLLM,
  terminateSession,
  restartSession
} from './llm_service/localLLMService.js';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}


let mainWindow = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    icon: './assets/modelcube.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.setMenuBarVisibility(false);

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }


  // Prevent new windows
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Your existing download handler
  mainWindow.webContents.on("will-download", (event, item) => {
    const downloadFilename = item.getFilename();
    item.setSavePath(`/tmp/${downloadFilename}`);

    console.log(downloadFilename)

    mainWindow.webContents.send("download-start", {
      filename: downloadFilename,
      totalBytes: item.getTotalBytes()
    });

    item.on('updated', () => {
      mainWindow.webContents.send("download-progress", {
        filename: downloadFilename,
        receivedBytes: item.getReceivedBytes(),
        totalBytes: item.getTotalBytes()
      });
    });

    item.once('done', (_, state) => {
      mainWindow.webContents.send("download-complete", {
        filename: downloadFilename,
        state
      });
    });
  });


  // mainWindow.webContents.openDevTools();
};

// IPC CONNECTIONS
let chatID = null;
const SamplingParameters = {};

// Store active downloads
const activeDownloads = new Map();

ipcMain.handle("start-download", async (event, { url, filename }) => {
  console.log('Starting background download:', url);

})

ipcMain.once("set-chat-id", async (event, message) => {
  if (!message.chatId) return;

  chatID = message.chatId;
  const enableDeveloperMode = message.enableDeveloperMode;

  console.log(message);
  const session = await createLLMSession(chatID, enableDeveloperMode);
});

ipcMain.on("on-trigger-page-load", (event, msg) => {
  console.log(msg);
});

ipcMain.on('set-prompt', async (event, prompt) => {
  if (!prompt) return;
  console.log("Prompt received from renderer:", prompt);
  console.log(chatID);

  const chatLLMresponse = await chatWithLLM(chatID, prompt, SamplingParameters, event);
  console.log(chatLLMresponse);
});

ipcMain.handle('terminate-ongoing-chat', async () => {
  terminateSession();
});

ipcMain.handle('restart-chat', async () => {
  restartSession();
});

ipcMain.handle('open-file-dialog', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select a model file',
    filters: [
      { name: 'Model Files', extensions: ['gguf'] }
    ],
    properties: ['openFile']
  });

  if (!result.canceled) {
    const res = await initializeLLM(result.filePaths[0]);
    return res;
  }
});



// download 

DownloadManager.register({
  downloadFolder: app.getPath("downloads")
});

let currentProgress = null;
let fileName = null;

ipcMain.on("get-download-url", (event, file) => {
  DownloadManager.download({
    url: file.downloadUrl,
    onProgress: (progress) => {
      currentProgress = progress; // ✅ Save latest progress
      fileName = file.fileName;
      BrowserWindow.getAllWindows().forEach(win =>
        win.webContents.send("download-progress", progress)
      );
    }
  }, (error, info) => {
    currentProgress = null; // ✅ Reset after completionfileName
    fileName = null; // ✅ Reset after completionfileName
  });
});

// Return current progress when requested
ipcMain.on("get-current-download", (event) => {
  event.sender.send("current-download", { fileName, currentProgress });
});





// Create the app window when ready
app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
