"use client";

import React, { useRef, useState } from "react";

interface FileUploadProps {
  label?: string;
  accept?: string;
  onUpload: (file: File) => void;
  currentUrl?: string;
}

export function FileUpload({ label, accept = "image/*", onUpload, currentUrl }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    onUpload(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {label && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            color: "var(--text-dim)",
          }}
        >
          {label}
        </span>
      )}

      <div
        className="clip-corner"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `1px dashed ${isDragging ? "var(--yellow)" : "var(--border)"}`,
          background: isDragging ? "rgba(255, 221, 0, 0.04)" : "var(--card)",
          transition: "border-color 0.15s, background 0.15s",
          minHeight: "140px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "12px",
          padding: "20px",
          position: "relative",
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Upload preview"
            style={{
              maxWidth: "100%",
              maxHeight: "200px",
              objectFit: "contain",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--text-dim)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Drag & drop or click to upload
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          style={{ display: "none" }}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="clip-corner"
          style={{
            background: "transparent",
            border: "1px solid var(--yellow)",
            color: "var(--yellow)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "6px 16px",
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,221,0,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          {preview ? "Change File" : "Upload File"}
        </button>
      </div>
    </div>
  );
}

export default FileUpload;
