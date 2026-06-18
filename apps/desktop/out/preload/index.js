"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    openFile: () => electron_1.ipcRenderer.invoke("dialog:openFile"),
    saveFile: (content) => electron_1.ipcRenderer.invoke("dialog:saveFile", content),
    notify: (title, body) => electron_1.ipcRenderer.send("notification", title, body),
    getPlatform: () => electron_1.ipcRenderer.invoke("get-platform"),
    getTheme: () => electron_1.ipcRenderer.invoke("get-theme"),
    onOpenChat: (callback) => {
        electron_1.ipcRenderer.on("open-chat", callback);
        return () => electron_1.ipcRenderer.removeListener("open-chat", callback);
    },
    onOpenQuickChat: (callback) => {
        electron_1.ipcRenderer.on("open-quick-chat", callback);
        return () => electron_1.ipcRenderer.removeListener("open-quick-chat", callback);
    },
});
//# sourceMappingURL=index.js.map