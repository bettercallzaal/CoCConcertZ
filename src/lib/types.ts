export type UserRole = "admin" | "artist" | "fan";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  walletAddress?: string;
  invitedBy?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface Event {
  id: string;
  name: string;
  number: number;
  date: Date;
  venue: { spatialLink: string; streamLink?: string };
  rsvpLink: string;
  status: "upcoming" | "live" | "completed";
  flyerUrl?: string;
  bannerUrl?: string;
  description: string;
  announcement?: string;
  artists: EventArtist[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventArtist {
  artistId: string;
  order: number;
  setTime?: string;
}

export interface Artist {
  id: string;
  userId: string;
  stageName: string;
  slug: string;
  bio: string;
  profilePhoto?: string;
  socialLinks: {
    twitter?: string;
    farcaster?: string;
    audius?: string;
    spotify?: string;
    youtube?: string;
    website?: string;
  };
  cardCustomization: {
    primaryColor?: string;
    backgroundColor?: string;
    backgroundImage?: string;
    featuredMedia?: string;
  };
  linkedEvents: string[];
  walletAddress?: string;
  createdAt: Date;
}

export interface SetItem {
  id: string;
  artistId: string;
  eventId: string;
  songs: Song[];
  videos: Video[];
  notes?: string;
  order: number;
}

export interface Song {
  title: string;
  platform: "youtube" | "audius" | "spotify" | "soundcloud" | "other";
  url: string;
  videoId?: string;
}

export interface Video {
  title: string;
  url: string;
  platform: "youtube" | "twitch" | "other";
}

export interface Invite {
  id: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  status: "pending" | "accepted" | "revoked";
  createdAt: Date;
  acceptedAt?: Date;
}

// Archive types
export type UploadType = "simple" | "atomic_asset" | "show_bundle";
export type ArchiveFileType = "image" | "video" | "audio" | "document";

export interface UDLLicense {
  preset: "community-share" | "collectible" | "premium" | "open";
  commercialUse?: boolean;
  derivativeWorks?: boolean;
  attribution?: boolean;
}

export interface ArchiveUpload {
  id: string;
  arweave_tx_id: string;
  upload_type: UploadType;
  file_type: ArchiveFileType;
  file_size_bytes: number;
  title: string;
  description: string;
  tags: string[];
  show_id: string | null;
  artist_slugs: string[];
  uploaded_by_wallet: string;
  udl_license: UDLLicense | null;
  manifest_children: string[] | null;
  created_at: string;
}

export interface ArchiveFund {
  id: string;
  wallet_address: string;
  balance_ar: number;
  total_spent_ar: number;
  total_uploads: number;
  last_topped_up: string;
}

export interface TokenGateConfig {
  id: string;
  token_address: string;
  chain_id: number;
  min_balance: string;
  gate_type: string;
  active: boolean;
}
