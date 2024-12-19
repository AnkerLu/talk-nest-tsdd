import { contextBridge, ipcRenderer } from "electron";
import path from "path";

contextBridge.exposeInMainWorld("__POWERED_ELECTRON__", true);

contextBridge.exposeInMainWorld("electron", {
  getResourcePath: (filename: string) => {
    console.log("Resource path:", process.resourcesPath, filename);
    return path.join(process.resourcesPath, filename);
  },
  test: () => console.log("Preload script loaded!"),
});

contextBridge.exposeInMainWorld("ipc", {
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  invoke: (channel: string, ...args: any[]): Promise<any> =>
    ipcRenderer.invoke(channel, ...args),
  on: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.on(channel, listener);
  },
  once: (
    channel: string,
    listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void
  ) => {
    ipcRenderer.once(channel, listener);
  },
});
