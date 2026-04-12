"use client";

import React, { useEffect, useState, useCallback } from "react";
import type { ArchiveUpload, ArchiveFileType } from "@/lib/types";
import { ArchiveCard } from "./ArchiveCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ArchiveFilters {
  type: ArchiveFileType | "";
  uploadType: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FILE_TYPE_FILTERS: { label: string; value: ArchiveFileType | "" }[] = [
  { label: "All", value: "" },
  { label: "Image", value: "image" },
  { label: "Video", value: "video" },
  { label: "Audio", value: "audio" },
  { label: "Document", value: "document" },
];

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const filterBtnBase: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  padding: "6px 14px",
  background: "transparent",
  cursor: "pointer",
  transition: "border-color 0.15s, color 0.15s",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ArchiveGrid() {
  const [items, setItems] = useState<ArchiveUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ArchiveFilters>({ type: "", uploadType: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filters.type) params.set("type", filters.type);
      if (filters.uploadType) params.set("uploadType", filters.uploadType);

      const res = await fetch(`/api/archive/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");

      const data = await res.json();
      setItems(data.items ?? []);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function handleTypeFilter(value: ArchiveFileType | "") {
    setFilters((prev) => ({ ...prev, type: value }));
    setPage(1);
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      {/* Filter row */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        {FILE_TYPE_FILTERS.map(({ label, value }) => {
          const active = filters.type === value;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleTypeFilter(value)}
              style={{
                ...filterBtnBase,
                border: active
                  ? "1px solid var(--yellow)"
                  : "1px solid var(--border)",
                color: active ? "var(--yellow)" : "var(--text-dim)",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Grid / States */}
      {loading ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-dim)",
            padding: "48px 0",
            textAlign: "center",
          }}
        >
          Loading archive...
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-dim)",
            padding: "48px 0",
            textAlign: "center",
            border: "1px dashed var(--border)",
          }}
        >
          No archive entries yet. Be the first to upload.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "16px",
          }}
        >
          {items.map((item) => (
            <ArchiveCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            justifyContent: "center",
            paddingTop: "8px",
          }}
        >
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{
              ...filterBtnBase,
              border: "1px solid var(--border)",
              color: page <= 1 ? "var(--text-dim)" : "var(--text, #fff)",
              opacity: page <= 1 ? 0.4 : 1,
              cursor: page <= 1 ? "not-allowed" : "pointer",
            }}
          >
            Prev
          </button>

          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-dim)",
            }}
          >
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{
              ...filterBtnBase,
              border: "1px solid var(--border)",
              color: page >= totalPages ? "var(--text-dim)" : "var(--text, #fff)",
              opacity: page >= totalPages ? 0.4 : 1,
              cursor: page >= totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default ArchiveGrid;
