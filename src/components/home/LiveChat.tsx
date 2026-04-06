"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getEvents } from "@/lib/db";

interface ChatMessage {
  id: string;
  name: string;
  text: string;
  timestamp: Date | null;
}

const STORAGE_KEY = "coc-chat-name";
const RATE_LIMIT_MS = 2000;

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [userName, setUserName] = useState("");
  const [namePrompt, setNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [liveEventId, setLiveEventId] = useState<string | null>(null);
  const [lastSent, setLastSent] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // Check for live event
  useEffect(() => {
    getEvents()
      .then((events) => {
        const live = events.find((e) => e.status === "live");
        if (live) setLiveEventId(live.id);
      })
      .catch((err) => console.warn("LiveChat: failed to check events", err));
  }, []);

  // Load saved name
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setUserName(saved);
    }
  }, []);

  // Listen to messages
  useEffect(() => {
    if (!liveEventId) return;

    const q = query(
      collection(db, "chat", liveEventId, "messages"),
      orderBy("timestamp", "asc"),
      limit(100)
    );

    const unsub = onSnapshot(q, (snap) => {
      const msgs: ChatMessage[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || "Anon",
          text: data.text || "",
          timestamp: data.timestamp
            ? (data.timestamp as Timestamp).toDate()
            : null,
        };
      });
      setMessages(msgs);

      // Track new messages when panel is closed
      if (!wasOpen.current) {
        setNewCount((prev) => prev + 1);
      }
    });

    return () => unsub();
  }, [liveEventId]);

  // Track open state
  useEffect(() => {
    wasOpen.current = open;
    if (open) setNewCount(0);
  }, [open]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || !liveEventId || sending) return;

    // Check name
    if (!userName) {
      setNamePrompt(true);
      return;
    }

    // Rate limit
    const now = Date.now();
    if (now - lastSent < RATE_LIMIT_MS) return;

    setSending(true);
    try {
      await addDoc(collection(db, "chat", liveEventId, "messages"), {
        name: userName,
        text: inputText.trim(),
        timestamp: serverTimestamp(),
      });
      setInputText("");
      setLastSent(Date.now());
    } catch (err) {
      console.error("LiveChat: send failed", err);
    } finally {
      setSending(false);
    }
  }, [inputText, liveEventId, userName, lastSent, sending]);

  const handleSetName = useCallback(() => {
    if (!nameInput.trim()) return;
    const name = nameInput.trim().slice(0, 24);
    setUserName(name);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, name);
    }
    setNamePrompt(false);
  }, [nameInput]);

  function relativeTime(date: Date | null): string {
    if (!date) return "now";
    const secs = Math.floor((Date.now() - date.getTime()) / 1000);
    if (secs < 10) return "now";
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h`;
  }

  // Don't render if no live event
  if (!liveEventId) return null;

  return (
    <>
      <style>{`
        @keyframes chatPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,255,255,0.4); }
          50% { box-shadow: 0 0 0 6px rgba(0,255,255,0); }
        }
        @keyframes chatSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes chatFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 640px) {
          .coc-chat-panel {
            width: 100% !important;
            right: 0 !important;
            border-left: none !important;
          }
        }
      `}</style>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: "80px",
          right: "20px",
          zIndex: 9997,
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          padding: "10px 16px",
          background: open
            ? "rgba(0,255,255,0.15)"
            : "rgba(10,10,10,0.9)",
          color: "var(--cyan, #00ffff)",
          border: "1px solid rgba(0,255,255,0.4)",
          cursor: "pointer",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          animation: newCount > 0 && !open ? "chatPulse 1.5s ease-in-out infinite" : "none",
        }}
      >
        CHAT
        {newCount > 0 && !open && (
          <span
            style={{
              background: "var(--cyan, #00ffff)",
              color: "#000",
              fontSize: "10px",
              fontWeight: 900,
              borderRadius: "50%",
              width: "18px",
              height: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              lineHeight: 1,
            }}
          >
            {newCount > 99 ? "99" : newCount}
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="coc-chat-panel"
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "320px",
            zIndex: 9996,
            background: "rgba(8, 8, 12, 0.95)",
            borderLeft: "1px solid rgba(0,255,255,0.2)",
            backdropFilter: "blur(16px)",
            display: "flex",
            flexDirection: "column",
            animation: "chatSlideIn 0.3s ease-out forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px",
              borderBottom: "1px solid rgba(0,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.2em",
                  color: "var(--cyan, #00ffff)",
                }}
              >
                Live Chat
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--text-dim, #888)",
                }}
              >
                {messages.length} msgs
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-dim, #888)",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                fontSize: "16px",
                padding: "4px 6px",
                lineHeight: 1,
              }}
            >
              x
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            {messages.length === 0 && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  color: "var(--text-dim, #888)",
                  textAlign: "center",
                  padding: "32px 0",
                }}
              >
                No messages yet. Say something!
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  animation: "chatFadeIn 0.2s ease-out",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                    marginBottom: "2px",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: "var(--cyan, #00ffff)",
                    }}
                  >
                    {msg.name}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      color: "var(--text-dim, #555)",
                    }}
                  >
                    {relativeTime(msg.timestamp)}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--text, #ddd)",
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Name prompt overlay */}
          {namePrompt && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(8,8,12,0.95)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                padding: "24px",
                zIndex: 1,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--cyan, #00ffff)",
                }}
              >
                Enter your name
              </span>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSetName();
                }}
                maxLength={24}
                placeholder="Display name..."
                autoFocus
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0,255,255,0.3)",
                  color: "var(--text, #fff)",
                  padding: "10px 14px",
                  outline: "none",
                  width: "100%",
                  maxWidth: "220px",
                  textAlign: "center",
                }}
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleSetName}
                  disabled={!nameInput.trim()}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    padding: "8px 20px",
                    background: "rgba(0,255,255,0.15)",
                    color: "var(--cyan, #00ffff)",
                    border: "1px solid rgba(0,255,255,0.4)",
                    cursor: nameInput.trim() ? "pointer" : "not-allowed",
                    opacity: nameInput.trim() ? 1 : 0.4,
                  }}
                >
                  Join
                </button>
                <button
                  onClick={() => setNamePrompt(false)}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    padding: "8px 20px",
                    background: "transparent",
                    color: "var(--text-dim, #888)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div
            style={{
              padding: "12px 16px",
              borderTop: "1px solid rgba(0,255,255,0.15)",
              display: "flex",
              gap: "8px",
              flexShrink: 0,
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder={userName ? "Type a message..." : "Set name first..."}
              maxLength={280}
              style={{
                flex: 1,
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--text, #fff)",
                padding: "8px 12px",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "8px 14px",
                background:
                  inputText.trim() && !sending
                    ? "rgba(0,255,255,0.15)"
                    : "transparent",
                color:
                  inputText.trim() && !sending
                    ? "var(--cyan, #00ffff)"
                    : "var(--text-dim, #555)",
                border: `1px solid ${
                  inputText.trim() && !sending
                    ? "rgba(0,255,255,0.4)"
                    : "rgba(255,255,255,0.08)"
                }`,
                cursor:
                  inputText.trim() && !sending ? "pointer" : "not-allowed",
                flexShrink: 0,
              }}
            >
              {sending ? "..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
