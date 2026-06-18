"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const updater_1 = require("./updater");
let mainWindow = null;
let tray = null;
let isQuitting = false;
const IS_DEV = process.env.ELECTRON_DEV === "1";
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: "Signhify AI",
        titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
        webPreferences: {
            preload: path_1.default.join(__dirname, "../preload/index.js"),
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
    }
    else {
        mainWindow.loadFile(path_1.default.join(__dirname, "../renderer/index.html"));
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
    const icon = electron_1.nativeImage.createEmpty();
    tray = new electron_1.Tray(icon);
    tray.setToolTip("Signhify AI");
    const contextMenu = electron_1.Menu.buildFromTemplate([
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
                electron_1.app.quit();
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
    electron_1.globalShortcut.register("CommandOrControl+Shift+A", () => {
        mainWindow?.show();
        mainWindow?.focus();
        mainWindow?.webContents.send("open-chat");
    });
    // Cmd/Ctrl+Shift+S = quick screenshot-like capture (send current context)
    electron_1.globalShortcut.register("CommandOrControl+Shift+S", () => {
        mainWindow?.show();
        mainWindow?.focus();
        mainWindow?.webContents.send("open-quick-chat");
    });
}
function setupIPC() {
    // Open file dialog
    electron_1.ipcMain.handle("dialog:openFile", async () => {
        const result = await electron_1.dialog.showOpenDialog(mainWindow, {
            properties: ["openFile"],
        });
        return result.filePaths[0] || null;
    });
    // Save file dialog
    electron_1.ipcMain.handle("dialog:saveFile", async (_event, content) => {
        const result = await electron_1.dialog.showSaveDialog(mainWindow, {
            filters: [{ name: "All Files", extensions: ["*"] }],
        });
        if (result.filePath) {
            const fs = await Promise.resolve().then(() => __importStar(require("fs/promises")));
            await fs.writeFile(result.filePath, content);
            return result.filePath;
        }
        return null;
    });
    // Show notification
    electron_1.ipcMain.handle("notification", async (_event, title, body) => {
        new electron_1.Notification({ title, body }).show();
    });
    // Get platform info
    electron_1.ipcMain.handle("get-platform", () => process.platform);
    // Theme detection
    electron_1.ipcMain.handle("get-theme", () => electron_1.nativeTheme.shouldUseDarkColors ? "dark" : "light");
}
electron_1.app.whenReady().then(() => {
    createWindow();
    setupTray();
    setupGlobalShortcuts();
    setupIPC();
    (0, updater_1.setupAutoUpdater)(mainWindow);
    electron_1.app.on("activate", () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
        else {
            mainWindow?.show();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("before-quit", () => {
    isQuitting = true;
});
electron_1.app.on("will-quit", () => {
    electron_1.globalShortcut.unregisterAll();
});
//# sourceMappingURL=index.js.map