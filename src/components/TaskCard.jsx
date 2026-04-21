import React from "react";

export default function TaskCard({
  task,
  isRunning,
  isDisabled,
  isCompleted,
  stepInfo,
  onRun,
  onCancel,
}) {
  const classes = [
    "task-card",
    task.featured && "featured",
    isRunning && "running",
    isCompleted && "completed",
    isDisabled && "disabled",
    task.warn && "warn",
  ]
    .filter(Boolean)
    .join(" ");

  const progress =
    isRunning && stepInfo ? (stepInfo.step / stepInfo.total) * 100 : 0;

  return (
    <div
      className={classes}
      style={{ "--card-accent": task.accent }}
      onClick={() => {
        if (!isDisabled && !isRunning) onRun();
      }}
    >
      <div className="task-icon">{task.icon}</div>
      <div className="task-info">
        <div className="task-label">{task.label}</div>
        <div className="task-desc">
          {isRunning && stepInfo ? stepInfo.label : task.desc}
        </div>
      </div>
      <div className="task-status">
        {isRunning && (
          <>
            <span className="task-badge running">
              {stepInfo
                ? `${stepInfo.step}/${stepInfo.total}`
                : "starting"}
            </span>
            <button className="cancel-btn" onClick={(e) => { e.stopPropagation(); onCancel(); }}>
              Cancel
            </button>
          </>
        )}
        {isCompleted && !isRunning && (
          <span className="task-badge done">DONE</span>
        )}
      </div>

      {isRunning && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
