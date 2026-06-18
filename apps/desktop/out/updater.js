"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAutoUpdater = setupAutoUpdater;
const electron_updater_1 = require("electron-updater");
const electron_1 = require("electron");
function setupAutoUpdater(mainWindow) {
    electron_updater_1.autoUpdater.autoDownload = true;
    electron_updater_1.autoUpdater.autoInstallOnAppQuit = true;
    electron_updater_1.autoUpdater.on("update-available", (info) => {
        mainWindow.webContents.send("update-available", {
            version: info.version,
            releaseDate: info.releaseDate,
        });
    });
    electron_updater_1.autoUpdater.on("update-downloaded", (info) => {
        electron_1.dialog
            .showMessageBox(mainWindow, {
            type: "info",
            title: "Update Ready",
            message: `Signhify AI v${info.version} has been downloaded.`,
            detail: "The update will be installed when you restart the app.",
            buttons: ["Restart Now", "Later"],
            defaultId: 0,
        })
            .then(({ response }) => {
            if (response === 0) {
                electron_updater_1.autoUpdater.quitAndInstall();
            }
        });
    });
    electron_updater_1.autoUpdater.on("error", (err) => {
        console.error("Auto-updater error:", err);
    });
    // Check for updates on launch
    electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    // Check every 4 hours
    setInterval(() => {
        electron_updater_1.autoUpdater.checkForUpdatesAndNotify();
    }, 4 * 60 * 60 * 1000);
}
//# sourceMappingURL=updater.js.map