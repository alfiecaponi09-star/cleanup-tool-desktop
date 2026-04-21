import React from "react";

export default function TitleBar() {
  return (
    <div className="titlebar">
      <span className="titlebar-title">cleanup-tool</span>
      <div className="titlebar-controls">
        <button
          className="titlebar-btn minimize"
          onClick={() => window.api?.minimize()}
        />
        <button
          className="titlebar-btn maximize"
          onClick={() => window.api?.maximize()}
        />
        <button
          className="titlebar-btn close"
          onClick={() => window.api?.close()}
        />
      </div>
    </div>
  );
}
