import { contextBridge, ipcRenderer } from "electron";

export interface ElectronAPI {
  openFile: () => Promise<string | null>;
  saveFile: (content: string) => Promise<string | null>;
  notify: (title: string, body: string) => void;
  getPlatform: () => Promise<string>;
  getTheme: () => Promise<"dark" | "light">;
  onOpenChat: (callback: () => void) => () => void;
  onOpenQuickChat: (callback: () => void) => () => void;
}

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  saveFile: (content: string) => ipcRenderer.invoke("dialog:saveFile", content),
  notify: (title: string, body: string) =>
    ipcRenderer.send("notification", title, body),
  getPlatform: () => ipcRenderer.invoke("get-platform"),
  getTheme: () => ipcRenderer.invoke("get-theme"),

  onOpenChat: (callback: () => void) => {
    ipcRenderer.on("open-chat", callback);
    return () => ipcRenderer.removeListener("open-chat", callback);
  },
  onOpenQuickChat: (callback: () => void) => {
    ipcRenderer.on("open-quick-chat", callback);
    return () => ipcRenderer.removeListener("open-quick-chat", callback);
  },
} satisfies ElectronAPI);
