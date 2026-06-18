import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  nativeTheme,
  Menu,
  Tray,
  nativeImage,
  dialog,
  Notification,
} from "electron";
import path from "path";
import { setupAutoUpdater } from "./updater";

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const IS_DEV = process.env.ELECTRON_DEV === "1";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "Signhify AI",
    titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    show: false,
    backgroundColor: "#0a0a14",
  });

  // Load the web app
  if (IS_DEV) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }

  // Show when ready
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  // Minimize to tray instead of closing
  mainWindow.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function setupTray() {
  // Create a simple tray icon
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  tray.setToolTip("Signhify AI");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Signhify",
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: "Quick Chat",
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send("open-chat");
      },
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    mainWindow?.show();
    mainWindow?.focus();
  });
}

function setupGlobalShortcuts() {
  // Cmd/Ctrl+Shift+A = focus + open chat
  globalShortcut.register("CommandOrControl+Shift+A", () => {
    mainWindow?.show();
    mainWindow?.focus();
    mainWindow?.webContents.send("open-chat");
  });

  // Cmd/Ctrl+Shift+S = quick screenshot-like capture (send current context)
  globalShortcut.register("CommandOrControl+Shift+S", () => {
    mainWindow?.show();
    mainWindow?.focus();
    mainWindow?.webContents.send("open-quick-chat");
  });
}

function setupIPC() {
  // Open file dialog
  ipcMain.handle("dialog:openFile", async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ["openFile"],
    });
    return result.filePaths[0] || null;
  });

  // Save file dialog
  ipcMain.handle("dialog:saveFile", async (_event, content: string) => {
    const result = await dialog.showSaveDialog(mainWindow!, {
      filters: [{ name: "All Files", extensions: ["*"] }],
    });
    if (result.filePath) {
      const fs = await import("fs/promises");
      await fs.writeFile(result.filePath, content);
      return result.filePath;
    }
    return null;
  });

  // Show notification
  ipcMain.handle(
    "notification",
    async (_event, title: string, body: string) => {
      new Notification({ title, body }).show();
    },
  );

  // Get platform info
  ipcMain.handle("get-platform", () => process.platform);

  // Theme detection
  ipcMain.handle("get-theme", () =>
    nativeTheme.shouldUseDarkColors ? "dark" : "light",
  );
}

app.whenReady().then(() => {
  createWindow();
  setupTray();
  setupGlobalShortcuts();
  setupIPC();
  setupAutoUpdater(mainWindow!);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
