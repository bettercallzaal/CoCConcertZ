"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Modal, FileUpload, Button, Input } from "@/components/ui";

interface GalleryPhoto {
  id: string;
  url: string;
  name: string;
  caption?: string;
  eventId?: string;
  createdAt: Date;
}

export default function FanGallery() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Upload form state
  const [fanName, setFanName] = useState("");
  const [caption, setCaption] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchPhotos = useCallback(async () => {
    try {
      const q = query(
        collection(db, "gallery"),
        orderBy("createdAt", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const fetched: GalleryPhoto[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url as string,
          name: data.name as string,
          caption: data.caption as string | undefined,
          eventId: data.eventId as string | undefined,
          createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
        };
      });
      setPhotos(fetched);
    } catch (err) {
      console.error("Failed to load gallery:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
    // Pre-fill name from localStorage (chat history)
    try {
      const stored = localStorage.getItem("coc_fan_name");
      if (stored) setFanName(stored);
    } catch {
      // ignore
    }
  }, [fetchPhotos]);

  const openModal = () => {
    setSubmitError(null);
    setSubmitSuccess(false);
    setPhotoFile(null);
    setCaption("");
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!photoFile) {
      setSubmitError("Please select a photo to upload.");
      return;
    }
    if (!fanName.trim()) {
      setSubmitError("Please enter your name.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Upload via Cloudinary API route
      const formData = new FormData();
      formData.append("file", photoFile);
      formData.append("folder", "coc-concertz/gallery");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();

      // Save to Firestore
      await addDoc(collection(db, "gallery"), {
        url,
        name: fanName.trim(),
        caption: caption.trim() || null,
        createdAt: serverTimestamp(),
      });

      // Save name to localStorage
      try {
        localStorage.setItem("coc_fan_name", fanName.trim());
      } catch {
        // ignore
      }

      setSubmitSuccess(true);
      setPhotoFile(null);
      setCaption("");

      // Refresh gallery
      await fetchPhotos();

      // Auto-close after short delay
      setTimeout(() => {
        setModalOpen(false);
        setSubmitSuccess(false);
      }, 1800);
    } catch (err) {
      console.error("Gallery submit error:", err);
      setSubmitError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "40px",
        }}
      >
        <div>
          <span className="section-label">// Gallery</span>
          <h2>FAN PHOTOS</h2>
        </div>

        <button
          onClick={openModal}
          className="clip-corner"
          style={{
            background: "transparent",
            border: "1px solid var(--yellow)",
            color: "var(--yellow)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            padding: "10px 20px",
            cursor: "pointer",
            transition: "background 0.15s, box-shadow 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,221,0,0.08)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              "0 0 12px rgba(255,221,0,0.2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          + Share a Photo
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "40px 0",
            textAlign: "center",
          }}
        >
          Loading gallery...
        </div>
      ) : photos.length === 0 ? (
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--text-dim)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "60px 0",
            textAlign: "center",
            border: "1px dashed var(--border)",
          }}
        >
          No photos yet — be the first to share one.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="clip-corner reveal"
              style={{
                position: "relative",
                overflow: "hidden",
                background: "var(--card)",
                border: "1px solid var(--border)",
                aspectRatio: "1 / 1",
                transition: "border-color 0.2s, box-shadow 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "var(--yellow)";
                (e.currentTarget as HTMLDivElement).style.boxShadow =
                  "0 0 16px rgba(255,221,0,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.borderColor =
                  "var(--border)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.url}
                alt={photo.caption ?? `Photo by ${photo.name}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Overlay */}
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)",
                  padding: "24px 10px 10px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--yellow)",
                    marginBottom: photo.caption ? "3px" : 0,
                  }}
                >
                  {photo.name}
                </div>
                {photo.caption && (
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "rgba(255,255,255,0.7)",
                      lineHeight: 1.4,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {photo.caption}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Share a Photo"
        maxWidth="480px"
      >
        {submitSuccess ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px 0",
              fontFamily: "var(--font-mono)",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                marginBottom: "12px",
                color: "var(--yellow)",
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                color: "var(--cyan)",
              }}
            >
              Photo uploaded. Thanks!
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Input
              label="Your Name"
              value={fanName}
              onChange={(e) => setFanName(e.target.value)}
              placeholder="How should we credit you?"
            />

            <FileUpload
              label="Your Photo"
              accept="image/*"
              onUpload={(file) => setPhotoFile(file)}
            />

            <Input
              label="Caption (optional)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What's the moment?"
            />

            {submitError && (
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "#ef4444",
                  padding: "10px 14px",
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.06)",
                }}
              >
                {submitError}
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Uploading..." : "Submit Photo"}
            </Button>
          </div>
        )}
      </Modal>
    </section>
  );
}
