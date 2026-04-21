import React, { useState, useEffect, useRef, useCallback } from "react";
import TitleBar from "./components/TitleBar";
import TaskCard from "./components/TaskCard";
import Terminal from "./components/Terminal";

const TASKS = [
  {
    id: "fullNetwork",
    label: "Full Network Reset",
    desc: "DNS + Winsock + TCP/IP + ARP + Renew",
    icon: "⚡",
    accent: "#a78bfa",
    featured: true,
  },
  {
    id: "fullCleanup",
    label: "Full Cleanup",
    desc: "Network + Temp files cleanup",
    icon: "🧹",
    accent: "#f472b6",
    featured: true,
  },
  {
    id: "flushDns",
    label: "Flush DNS",
    desc: "Clear DNS resolver cache",
    icon: "🌐",
    accent: "#22d3ee",
  },
  {
    id: "resetWinsock",
    label: "Reset Winsock",
    desc: "Reset Winsock catalog",
    icon: "🔌",
    accent: "#34d399",
  },
  {
    id: "resetIp",
    label: "Reset TCP/IP",
    desc: "Reset TCP/IP stack",
    icon: "📡",
    accent: "#60a5fa",
  },
  {
    id: "releaseRenew",
    label: "Release / Renew IP",
    desc: "Release and renew DHCP lease",
    icon: "🔄",
    accent: "#fbbf24",
  },
  {
    id: "flushArp",
    label: "Flush ARP",
    desc: "Clear ARP table",
    icon: "📋",
    accent: "#a3e635",
  },
  {
    id: "clearTemp",
    label: "Clear Temp Files",
    desc: "Delete temp & prefetch files",
    icon: "🗑️",
    accent: "#fb923c",
  },
  {
    id: "secureWipe",
    label: "Secure Free Wipe",
    desc: "Overwrite free space (cipher /w) — takes a while",
    icon: "🔒",
    accent: "#f87171",
    warn: true,
  },
];

export default function App() {
  const [running, setRunning] = useState(null);
  const [stepInfo, setStepInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [completed, setCompleted] = useState(new Set());
  const logsRef = useRef(logs);
  logsRef.current = logs;

  const addLog = useCallback((text, type = "output") => {
    setLogs((prev) => [...prev, { text, type, time: Date.now() }]);
  }, []);

  useEffect(() => {
    if (!window.api) return;

    window.api.onStep((data) => {
      setStepInfo(data);
      addLog(`[${data.step}/${data.total}] ${data.label}...`, "step");
    });

    window.api.onOutput((data) => {
      if (data.text.trim()) {
        addLog(data.text.trim(), "output");
      }
    });

    window.api.onDone((data) => {
      if (data.cancelled) {
        addLog("Cancelled.", "error");
      } else {
        addLog("✓ Done!", "success");
        setCompleted((prev) => new Set([...prev, data.taskId]));
      }
      setRunning(null);
      setStepInfo(null);
    });
  }, [addLog]);

  const handleRun = async (taskId) => {
    if (running) return;

    const task = TASKS.find((t) => t.id === taskId);
    if (task?.warn) {
      // For dangerous tasks, just add a warning log
      addLog("", "divider");
      addLog(`⚠ Starting: ${task.label}`, "warn");
    } else {
      addLog("", "divider");
      addLog(`Starting: ${task?.label}`, "info");
    }

    setRunning(taskId);
    setCompleted((prev) => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });

    if (window.api) {
      await window.api.runTask(taskId);
    }
  };

  const handleCancel = (taskId) => {
    if (window.api) {
      window.api.cancelTask(taskId);
    }
  };

  return (
    <div className="app">
      <TitleBar />
      <div className="app-content">
        <div className="header">
          <div className="header-glow" />
          <div className="repo-pill">desktop app</div>
          <h1 className="title">Cleanup Tool</h1>
          <p className="subtitle">Windows network reset and maintenance tasks</p>
        </div>

        <div className="layout">
          <div className="tasks-panel">
            <div className="panel-header">
              Available Tasks
            </div>
            <div className="tasks-grid">
              {TASKS.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isRunning={running === task.id}
                  isDisabled={running !== null && running !== task.id}
                  isCompleted={completed.has(task.id)}
                  stepInfo={running === task.id ? stepInfo : null}
                  onRun={() => handleRun(task.id)}
                  onCancel={() => handleCancel(task.id)}
                />
              ))}
            </div>
          </div>

          <Terminal logs={logs} onClear={() => setLogs([])} />
        </div>
      </div>
    </div>
  );
}
