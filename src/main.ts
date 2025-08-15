import { app, BrowserWindow, dialog, ipcMain, globalShortcut, IpcMainInvokeEvent } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';
import DownloadManager from "electron-download-manager"
import fs from "fs";

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


let mainWindow: BrowserWindow | null = null;
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    icon: './assets/icons/appIcon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.maximize();

  // mainWindow.webContents.on('did-finish-load', () => {
  //   mainWindow?.webContents.insertCSS('html, body { overflow: hidden; }');
  // });


  // close dev tools
  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow?.webContents.closeDevTools();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (
      (input.control || input.meta) &&
      (input.key.toLowerCase() === 'i' || input.key.toLowerCase() === 'shift')
    ) {
      event.preventDefault();
    }
  });


  mainWindow.setMenuBarVisibility(false);

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }


  // disable electron reload
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  globalShortcut.register('CommandOrControl+R', () => { });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  globalShortcut.register('F5', () => { });

  // Prevent new windows
  mainWindow.webContents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });

  // Download handler function using electron downloader
  mainWindow.webContents.on("will-download", (event: unknown, item: unknown) => {
    const downloadFilename = item.getFilename();
    item.setSavePath(`/tmp/${downloadFilename}`);

    console.log(downloadFilename)

    mainWindow?.webContents.send("download-start", {
      filename: downloadFilename,
      totalBytes: item.getTotalBytes()
    });

    item.on('updated', () => {
      mainWindow?.webContents.send("download-progress", {
        filename: downloadFilename,
        receivedBytes: item.getReceivedBytes(),
        totalBytes: item.getTotalBytes()
      });
    });

    item.once('done', (_, state) => {
      mainWindow?.webContents.send("download-complete", {
        filename: downloadFilename,
        state
      });
    });
  });


  mainWindow.webContents.openDevTools();
};

// IPC CONNECTIONS
let chatID: unknown = null;
const SamplingParameters = {};

// Store active downloads
// const activeDownloads = new Map();

ipcMain.handle("start-download", async (event: IpcMainInvokeEvent, args: { url: string; filename: string }) => {
  console.log('Starting background download:', args.url);
});

ipcMain.once("set-chat-id", async (event, message) => {
  if (!message.chatId) return;

  chatID = message.chatId;

  console.log(message);
  const session = await createLLMSession(chatID);
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



// train model
let dataset: string;

ipcMain.handle('open-file-dialog-dataset', async () => {
  try {
    const result = await dialog.showOpenDialog({
      title: 'Select Dataset File',
      properties: ['openFile'],
      filters: [
        { name: 'CSV or JSON', extensions: ['csv', 'json'] }
      ]
    });

    if (result.canceled) {
      return { status: 400, message: 'File selection canceled.' };
    }

    dataset = result.filePaths[0];


    return {
      status: 200,
      message: `File selected: ${result.filePaths[0]}`,
      filePath: result.filePaths[0]
    };

  } catch (error) {
    return { status: 500, message: 'Failed to open file dialog.' };
  }
});

/*
ipcMain.handle('show-train-alert', async () => {

  if(!dataset) return {
    status: 400,
    message: "no file selected",
  }
  const fileExtension = dataset?.split(".").pop();

  if (fileExtension === "json") {
    console.log("json file");
  } else if (fileExtension === "csv") {
    console.log("csv file");
  } else {
    console.log(`${fileExtension} file`);
  }


  console.log(dataset)

  const jsonFile = fs.readFileSync(dataset, "utf-8");
  const jsonArrr = JSON.parse(jsonFile)

  jsonArrr.forEach(el => {
    console.log(el.text)
  });

});
*/

ipcMain.on('start-dataset-extration', async (event) => {
  if (!dataset) {
    event.sender.send('training-log', '❌ No file selected.');
    return;
  }

  // const fileExtension = dataset.split(".").pop();
  // event.sender.send('training-log', `📄 File extension: ${fileExtension}`);

  try {
    const jsonFile = fs.readFileSync(dataset, "utf-8");
    const jsonArr = JSON.parse(jsonFile);

    console.log(jsonArr);

    event.sender.send('extract-dataset', {
      status: 200,
      message: `File Extracted Successfull `,
      data: jsonArr
    });
  } catch (error) {
    event.sender.send('extract-dataset', `❌ Error: ${error.message}`);
  }
});


// download 
DownloadManager.register({
  downloadFolder: app.getPath("downloads")
});

let currentProgress: unknown = null;
let fileName: unknown = null;

ipcMain.on("get-download-url", (event, { filename, downloadUrl }) => {

  // mainWindow.getAllWindows().forEach(win =>
  //   win.webContents.send("download-started", {
  //     type: "info",
  //     message: `Downloading started: ${file.fileName}`
  //   })
  // );

  DownloadManager.download({
    url: downloadUrl,
    onProgress: (progress: unknown) => {

      // console.log(progress);
      currentProgress = progress; // ✅ Save latest progress
      fileName = filename;
      BrowserWindow.getAllWindows().forEach(win =>
        win.webContents.send("download-progress", {
          filename,
          progress
        })
      );
    }
  }, (error, info) => {
    currentProgress = null; // ✅ Reset after completionfileName
    filename = null; // ✅ Reset after completionfileName
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
