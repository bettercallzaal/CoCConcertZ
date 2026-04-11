"use client";

import React, { useState } from "react";

export interface GeneratedPosts {
  newsletter: string;
  x: string;
  farcaster: string;
  bluesky: string;
  telegram: string;
  discord: string;
}

interface ContentPreviewProps {
  posts: GeneratedPosts;
}

type TabKey = keyof GeneratedPosts;

interface TabDefinition {
  key: TabKey;
  label: string;
  icon: string;
  maxChars: number | null;
}

const TABS: TabDefinition[] = [
  { key: "newsletter", label: "Newsletter", icon: "✉️", maxChars: null },
  { key: "x",          label: "X",          icon: "𝕏",  maxChars: 280  },
  { key: "farcaster",  label: "Farcaster",  icon: "🟪", maxChars: 1024 },
  { key: "bluesky",    label: "Bluesky",    icon: "🔷", maxChars: 300  },
  { key: "telegram",   label: "Telegram",   icon: "✈️", maxChars: null },
  { key: "discord",    label: "Discord",    icon: "💬", maxChars: null },
];

function getCharCountColor(current: number, max: number | null): string {
  if (max === null) return "var(--text-dim)";
  const ratio = current / max;
  if (ratio > 1) return "#ff4444";
  if (ratio >= 0.9) return "#ffaa00";
  return "var(--text-dim)";
}

function buildCopyAll(posts: GeneratedPosts): string {
  return TABS.map((tab) => `=== ${tab.label.toUpperCase()} ===\n${posts[tab.key]}`).join(
    "\n\n---\n\n"
  );
}

export function ContentPreview({ posts: initialPosts }: ContentPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("newsletter");
  const [posts, setPosts] = useState<GeneratedPosts>({ ...initialPosts });
  const [copied, setCopied] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const currentTab = TABS.find((t) => t.key === activeTab)!;
  const currentText = posts[activeTab];
  const charCount = currentText.length;
  const charColor = getCharCountColor(charCount, currentTab.maxChars);

  function handleTextChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setPosts((prev) => ({ ...prev, [activeTab]: e.target.value }));
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(buildCopyAll(posts));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  }

  // Styles
  const sectionLabelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--text-dim)",
    marginBottom: "12px",
  };

  const tabBarStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "row",
    overflowX: "auto",
    gap: "4px",
    marginBottom: "0",
    paddingBottom: "0",
    scrollbarWidth: "none",
  };

  function getTabStyle(isActive: boolean): React.CSSProperties {
    return {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 14px",
      background: isActive ? "var(--yellow)" : "var(--card)",
      color: isActive ? "var(--black)" : "var(--text-dim)",
      border: "1px solid var(--border)",
      borderBottom: isActive ? "1px solid var(--yellow)" : "1px solid var(--border)",
      cursor: "pointer",
      fontFamily: "var(--font-mono)",
      fontSize: "11px",
      fontWeight: isActive ? 700 : 500,
      textTransform: "uppercase",
      letterSpacing: "0.07em",
      whiteSpace: "nowrap",
      transition: "background 0.12s, color 0.12s",
      flexShrink: 0,
    };
  }

  const contentCardStyle: React.CSSProperties = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderTop: "none",
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: activeTab === "newsletter" ? "300px" : "150px",
    padding: "16px",
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text)",
    fontFamily: activeTab === "newsletter" ? "inherit" : "var(--font-mono)",
    fontSize: activeTab === "newsletter" ? "14px" : "13px",
    lineHeight: 1.6,
    resize: "vertical",
    boxSizing: "border-box",
    display: "block",
  };

  const footerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    borderTop: "1px solid var(--border)",
  };

  const charCountStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    color: charColor,
    letterSpacing: "0.05em",
  };

  const copyBtnStyle: React.CSSProperties = {
    padding: "6px 14px",
    background: copied ? "var(--cyan)" : "transparent",
    border: "1px solid var(--border)",
    color: copied ? "var(--black)" : "var(--text-dim)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    cursor: "pointer",
    transition: "background 0.12s, color 0.12s",
  };

  const copyAllBtnStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    background: copiedAll ? "var(--cyan)" : "transparent",
    border: "1px solid var(--border)",
    color: copiedAll ? "var(--black)" : "var(--text-dim)",
    fontFamily: "var(--font-mono)",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    cursor: "pointer",
    transition: "background 0.12s, color 0.12s",
    textAlign: "center",
  };

  return (
    <div>
      <div style={sectionLabelStyle}>Generated Content</div>

      {/* Tab bar */}
      <div style={tabBarStyle}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={getTabStyle(activeTab === tab.key)}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content card */}
      <div style={contentCardStyle}>
        <textarea
          style={textareaStyle}
          value={currentText}
          onChange={handleTextChange}
          spellCheck={false}
        />

        <div style={footerStyle}>
          {/* Char count */}
          <span style={charCountStyle}>
            {currentTab.maxChars !== null
              ? `${charCount} / ${currentTab.maxChars}`
              : `${charCount} chars`}
          </span>

          {/* Copy button */}
          <button type="button" onClick={handleCopy} style={copyBtnStyle}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Copy all button */}
      <button type="button" onClick={handleCopyAll} style={copyAllBtnStyle}>
        {copiedAll ? "All Copied!" : "Copy All Platforms"}
      </button>
    </div>
  );
}

export default ContentPreview;
