import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("gmfdFeedback", {
  copy: (kind: string, text: string) =>
    ipcRenderer.invoke("feedback:copy", kind, text),
  open: (kind: string, description: string) =>
    ipcRenderer.invoke("feedback:open", kind, description),
  discard: () => ipcRenderer.invoke("feedback:discard"),
});
