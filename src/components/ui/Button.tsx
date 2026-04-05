"use client";

import React from "react";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: "6px 14px", fontSize: "11px" },
  md: { padding: "10px 22px", fontSize: "13px" },
  lg: { padding: "14px 32px", fontSize: "15px" },
};

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--yellow)",
    color: "var(--black)",
    border: "2px solid var(--yellow)",
  },
  outline: {
    background: "transparent",
    color: "var(--yellow)",
    border: "2px solid var(--yellow)",
  },
  ghost: {
    background: "transparent",
    color: "var(--text)",
    border: "2px solid var(--border)",
  },
};

export function Button({
  variant = "primary",
  size = "md",
  disabled,
  style,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className="clip-corner"
      style={{
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.2em",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "opacity 0.15s, background 0.15s, color 0.15s",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        whiteSpace: "nowrap",
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
