import React from "react";

type BadgeVariant = "default" | "live" | "completed" | "upcoming";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  default: {
    background: "var(--yellow)",
    color: "var(--black)",
    border: "1px solid var(--yellow)",
  },
  live: {
    background: "rgba(220, 38, 38, 0.15)",
    color: "#ef4444",
    border: "1px solid #ef4444",
  },
  completed: {
    background: "transparent",
    color: "var(--text-dim)",
    border: "1px solid var(--border)",
  },
  upcoming: {
    background: "rgba(0, 255, 255, 0.08)",
    color: "var(--cyan)",
    border: "1px solid var(--cyan-dim)",
  },
};

export function Badge({ variant = "default", children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        fontFamily: "var(--font-mono)",
        fontSize: "10px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.15em",
        padding: "3px 8px",
        whiteSpace: "nowrap",
        ...variantStyles[variant],
        ...style,
      }}
    >
      {variant === "live" && (
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "#ef4444",
            display: "inline-block",
            animation: "pulse 1.5s infinite",
          }}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
