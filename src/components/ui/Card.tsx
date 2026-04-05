import React from "react";

interface CardProps {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, hoverable = false, className = "", style, onClick }: CardProps) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      className={`clip-corner ${className}`}
      onClick={onClick}
      onMouseEnter={hoverable ? () => setHovered(true) : undefined}
      onMouseLeave={hoverable ? () => setHovered(false) : undefined}
      style={{
        background: "var(--card)",
        border: `1px solid ${hoverable && hovered ? "var(--yellow)" : "var(--border)"}`,
        transition: "border-color 0.2s",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Card;
