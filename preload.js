const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  runTask: (taskId) => ipcRenderer.invoke("task:run", taskId),
  cancelTask: (taskId) => ipcRenderer.send("task:cancel", taskId),
  onStep: (cb) => ipcRenderer.on("task:step", (_, data) => cb(data)),
  onOutput: (cb) => ipcRenderer.on("task:output", (_, data) => cb(data)),
  onDone: (cb) => ipcRenderer.on("task:done", (_, data) => cb(data)),
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
});
