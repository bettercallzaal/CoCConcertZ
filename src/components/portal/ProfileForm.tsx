"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { uploadFile } from "@/lib/storage";
import type { Artist } from "@/lib/types";
import { Input, Textarea, Button, FileUpload } from "@/components/ui";

interface ProfileFormProps {
  artist: Artist | null;
  onSaved?: (artist: Artist) => void;
}

function makeSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const sectionLabelStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color: "var(--text-dim)",
  marginBottom: "12px",
  paddingBottom: "8px",
  borderBottom: "1px solid var(--border)",
};

export function ProfileForm({ artist, onSaved }: ProfileFormProps) {
  const { artistSlug } = useAuth();
  const [stageName, setStageName] = useState(artist?.stageName ?? "");
  const [bio, setBio] = useState(artist?.bio ?? "");
  // Social links
  const [twitter, setTwitter] = useState(artist?.socialLinks?.twitter ?? "");
  const [farcaster, setFarcaster] = useState(artist?.socialLinks?.farcaster ?? "");
  const [audius, setAudius] = useState(artist?.socialLinks?.audius ?? "");
  const [spotify, setSpotify] = useState(artist?.socialLinks?.spotify ?? "");
  const [youtube, setYoutube] = useState(artist?.socialLinks?.youtube ?? "");
  const [website, setWebsite] = useState(artist?.socialLinks?.website ?? "");

  // Wallet
  const [walletAddress, setWalletAddress] = useState(artist?.walletAddress ?? "");

  // Profile photo
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(artist?.profilePhoto);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = stageName.trim();
    if (!trimmedName) {
      setError("Stage name is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const slug = makeSlug(trimmedName);

      // Upload new photo if selected
      let resolvedPhoto = profilePhoto;
      if (photoFile) {
        resolvedPhoto = await uploadFile(photoFile, "coc-concertz/artists");
        setProfilePhoto(resolvedPhoto);
      }

      const data: Omit<Artist, "id" | "createdAt"> = {
        userId: artist?.userId ?? artistSlug ?? "passcode-user",
        stageName: trimmedName,
        slug,
        bio: bio.trim(),
        profilePhoto: resolvedPhoto,
        socialLinks: {
          twitter: twitter.trim() || undefined,
          farcaster: farcaster.trim() || undefined,
          audius: audius.trim() || undefined,
          spotify: spotify.trim() || undefined,
          youtube: youtube.trim() || undefined,
          website: website.trim() || undefined,
        },
        cardCustomization: artist?.cardCustomization ?? {},
        linkedEvents: artist?.linkedEvents ?? [],
        walletAddress: walletAddress.trim() || undefined,
      };

      if (artist) {
        const res = await fetch("/api/artists", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artistId: artist.id, ...data }),
        });
        if (!res.ok) throw new Error(await res.text());
        onSaved?.({ ...artist, ...data });
      } else {
        const res = await fetch("/api/artists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error(await res.text());
        const created = await res.json();
        onSaved?.(created);
      }

      setSuccess(true);
    } catch (err) {
      console.error("Failed to save profile", err);
      setError("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Core info */}
      <div>
        <div style={sectionLabelStyle}>Artist Info</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Input
            label="Stage Name *"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            placeholder="Your artist name"
            required
          />
          <Textarea
            label="Bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell the crowd about yourself..."
            style={{ minHeight: "120px" }}
          />
          <div style={{ maxWidth: "360px" }}>
            <FileUpload
              label="Profile Photo"
              accept="image/*"
              currentUrl={profilePhoto}
              onUpload={(file) => setPhotoFile(file)}
            />
          </div>
        </div>
      </div>

      {/* Social links */}
      <div>
        <div style={sectionLabelStyle}>Social Links</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          <Input
            label="Twitter / X"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
            placeholder="https://twitter.com/yourhandle"
            type="url"
          />
          <Input
            label="Farcaster"
            value={farcaster}
            onChange={(e) => setFarcaster(e.target.value)}
            placeholder="https://warpcast.com/yourhandle"
            type="url"
          />
          <Input
            label="Audius"
            value={audius}
            onChange={(e) => setAudius(e.target.value)}
            placeholder="https://audius.co/yourhandle"
            type="url"
          />
          <Input
            label="Spotify"
            value={spotify}
            onChange={(e) => setSpotify(e.target.value)}
            placeholder="https://open.spotify.com/artist/..."
            type="url"
          />
          <Input
            label="YouTube"
            value={youtube}
            onChange={(e) => setYoutube(e.target.value)}
            placeholder="https://youtube.com/@yourchannel"
            type="url"
          />
          <Input
            label="Website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yoursite.com"
            type="url"
          />
        </div>
      </div>

      {/* Wallet */}
      <div>
        <div style={sectionLabelStyle}>Wallet</div>
        <Input
          label="ETH Wallet Address"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          placeholder="0x..."
          containerStyle={{ maxWidth: "480px" }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <Button
          type="submit"
          variant="outline"
          disabled={saving}
          style={{ borderColor: "var(--cyan)", color: "var(--cyan)" }}
        >
          {saving ? "Saving..." : artist ? "Save Changes" : "Create Profile"}
        </Button>

        {error && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "#ef4444",
            }}
          >
            {error}
          </span>
        )}

        {success && !error && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--cyan)",
            }}
          >
            {artist ? "Profile updated." : "Profile created."}
          </span>
        )}
      </div>
    </form>
  );
}

export default ProfileForm;
