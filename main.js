const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    transparent: false,
    backgroundColor: "#0d1117",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: "hidden",
    title: "Cleanup Tool",
  });

  // Dev or production
  if (process.argv.includes("--dev")) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());

// ── Window controls ─────────────────────────────────────────────────────────
ipcMain.on("window:minimize", () => mainWindow?.minimize());
ipcMain.on("window:maximize", () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on("window:close", () => mainWindow?.close());

// ── Run commands ────────────────────────────────────────────────────────────
const TASKS = {
  flushDns: {
    cmds: [{ cmd: "ipconfig", args: ["/flushdns"], label: "Flushing DNS cache" }],
  },
  resetWinsock: {
    cmds: [{ cmd: "netsh", args: ["winsock", "reset"], label: "Resetting Winsock catalog" }],
  },
  resetIp: {
    cmds: [{ cmd: "netsh", args: ["int", "ip", "reset"], label: "Resetting TCP/IP stack" }],
  },
  releaseRenew: {
    cmds: [
      { cmd: "ipconfig", args: ["/release"], label: "Releasing IP address" },
      { cmd: "ipconfig", args: ["/renew"], label: "Renewing IP address" },
    ],
  },
  flushArp: {
    cmds: [
      { cmd: "netsh", args: ["interface", "ip", "delete", "arpcache"], label: "Clearing ARP cache" },
      { cmd: "arp", args: ["-d", "*"], label: "Deleting ARP entries" },
    ],
  },
  clearTemp: {
    cmds: [
      {
        cmd: "powershell",
        args: [
          "-NoProfile", "-Command",
          `$count = 0; @($env:TEMP, "$env:WINDIR\\Temp", "$env:WINDIR\\Prefetch") | ForEach-Object { if (Test-Path $_) { Get-ChildItem $_ -Force -ErrorAction SilentlyContinue | ForEach-Object { try { Remove-Item $_.FullName -Recurse -Force -ErrorAction Stop; $count++ } catch {} } } }; Write-Output "Cleaned $count items"`,
        ],
        label: "Clearing temp & prefetch files",
      },
    ],
  },
  secureWipe: {
    cmds: [
      { cmd: "cipher", args: ["/w:C:\\"], label: "Secure wiping free space (3 passes)", long: true },
    ],
  },
  fullNetwork: {
    cmds: [
      { cmd: "ipconfig", args: ["/flushdns"], label: "Flushing DNS cache" },
      { cmd: "netsh", args: ["winsock", "reset"], label: "Resetting Winsock catalog" },
      { cmd: "netsh", args: ["int", "ip", "reset"], label: "Resetting TCP/IP stack" },
      { cmd: "netsh", args: ["interface", "ip", "delete", "arpcache"], label: "Clearing ARP cache" },
      { cmd: "ipconfig", args: ["/release"], label: "Releasing IP address" },
      { cmd: "ipconfig", args: ["/renew"], label: "Renewing IP address" },
    ],
  },
  fullCleanup: {
    cmds: [
      { cmd: "ipconfig", args: ["/flushdns"], label: "Flushing DNS cache" },
      { cmd: "netsh", args: ["winsock", "reset"], label: "Resetting Winsock catalog" },
      { cmd: "netsh", args: ["int", "ip", "reset"], label: "Resetting TCP/IP stack" },
      { cmd: "netsh", args: ["interface", "ip", "delete", "arpcache"], label: "Clearing ARP cache" },
      { cmd: "ipconfig", args: ["/release"], label: "Releasing IP address" },
      { cmd: "ipconfig", args: ["/renew"], label: "Renewing IP address" },
      {
        cmd: "powershell",
        args: [
          "-NoProfile", "-Command",
          `$count = 0; @($env:TEMP, "$env:WINDIR\\Temp", "$env:WINDIR\\Prefetch") | ForEach-Object { if (Test-Path $_) { Get-ChildItem $_ -Force -ErrorAction SilentlyContinue | ForEach-Object { try { Remove-Item $_.FullName -Recurse -Force -ErrorAction Stop; $count++ } catch {} } } }; Write-Output "Cleaned $count items"`,
        ],
        label: "Clearing temp & prefetch files",
      },
    ],
  },
};

// Track running processes so we can cancel
const runningProcesses = new Map();

ipcMain.handle("task:run", async (event, taskId) => {
  const task = TASKS[taskId];
  if (!task) return { error: "Unknown task" };

  const { cmds } = task;
  const totalSteps = cmds.length;

  for (let i = 0; i < cmds.length; i++) {
    const step = cmds[i];
    const stepNum = i + 1;

    mainWindow.webContents.send("task:step", {
      taskId,
      step: stepNum,
      total: totalSteps,
      label: step.label,
    });

    try {
      await new Promise((resolve, reject) => {
        const proc = spawn(step.cmd, step.args, { windowsHide: true });
        runningProcesses.set(taskId, proc);

        let output = "";

        proc.stdout?.on("data", (data) => {
          const text = data.toString();
          output += text;
          mainWindow.webContents.send("task:output", { taskId, text });
        });

        proc.stderr?.on("data", (data) => {
          const text = data.toString();
          output += text;
          mainWindow.webContents.send("task:output", { taskId, text });
        });

        proc.on("close", (code) => {
          runningProcesses.delete(taskId);
          if (code === 0 || code === null) {
            resolve(output);
          } else {
            // Still resolve (some commands return non-zero but still work)
            resolve(output);
          }
        });

        proc.on("error", (err) => {
          runningProcesses.delete(taskId);
          reject(err);
        });
      });
    } catch (err) {
      mainWindow.webContents.send("task:output", {
        taskId,
        text: `Error: ${err.message}\n`,
      });
    }
  }

  mainWindow.webContents.send("task:done", { taskId });
  return { success: true };
});

ipcMain.on("task:cancel", (event, taskId) => {
  const proc = runningProcesses.get(taskId);
  if (proc) {
    proc.kill();
    runningProcesses.delete(taskId);
    mainWindow.webContents.send("task:done", { taskId, cancelled: true });
  }
});
