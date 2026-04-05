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
