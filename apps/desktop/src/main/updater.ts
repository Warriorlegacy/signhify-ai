import { autoUpdater, UpdateInfo } from "electron-updater";
import { BrowserWindow, dialog } from "electron";

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info: UpdateInfo) => {
    mainWindow.webContents.send("update-available", {
      version: info.version,
      releaseDate: info.releaseDate,
    });
  });

  autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
    dialog
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
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on("error", (err) => {
    console.error("Auto-updater error:", err);
  });

  // Check for updates on launch
  autoUpdater.checkForUpdatesAndNotify();

  // Check every 4 hours
  setInterval(
    () => {
      autoUpdater.checkForUpdatesAndNotify();
    },
    4 * 60 * 60 * 1000,
  );
}
