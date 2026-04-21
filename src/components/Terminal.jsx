import React, { useEffect, useRef } from "react";

export default function Terminal({ logs, onClear }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="terminal-panel">
      <div className="terminal-header">
        <span>Run Output</span>
        <button className="terminal-clear" onClick={onClear}>
          Clear
        </button>
      </div>
      <div className="terminal-body" ref={bodyRef}>
        {logs.length === 0 ? (
          <div className="terminal-empty">
            Select a task to start. Command output appears here.
          </div>
        ) : (
          logs.map((log, i) =>
            log.type === "divider" ? (
              <hr key={i} className="log-divider" />
            ) : (
              <div key={i} className={`log-line ${log.type}`}>
                {log.text}
              </div>
            )
          )
        )}
      </div>
    </div>
  );
}
