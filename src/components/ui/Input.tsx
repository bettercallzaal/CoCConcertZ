"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerStyle?: React.CSSProperties;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  containerStyle?: React.CSSProperties;
}

const fieldBaseStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--text)",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  padding: "10px 14px",
  outline: "none",
  transition: "border-color 0.15s",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.15em",
  color: "var(--text-dim)",
  marginBottom: "6px",
};

const errorStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  color: "#ff4444",
  marginTop: "4px",
};

export function Input({ label, error, containerStyle, style, onFocus, onBlur, ...props }: InputProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", ...containerStyle }}>
      {label && <label style={labelStyle}>{label}</label>}
      <input
        className="clip-corner"
        style={{
          ...fieldBaseStyle,
          borderColor: error ? "#ff4444" : focused ? "var(--yellow)" : "var(--border)",
          ...style,
        }}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        {...props}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}

export function Textarea({ label, error, containerStyle, style, onFocus, onBlur, ...props }: TextareaProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", ...containerStyle }}>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        className="clip-corner"
        style={{
          ...fieldBaseStyle,
          borderColor: error ? "#ff4444" : focused ? "var(--yellow)" : "var(--border)",
          resize: "vertical",
          minHeight: "100px",
          ...style,
        }}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        {...props}
      />
      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}

export default Input;
