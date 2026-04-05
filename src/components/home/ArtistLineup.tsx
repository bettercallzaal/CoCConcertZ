"use client";

import { useState, useCallback } from "react";

interface Song {
  vid: string;
  num: string;
  title: string;
}

interface Artist {
  name: string;
  role: string;
  bio: string;
  link?: { url: string; label: string };
  hostTag?: string;
  videoId?: string;
  songs?: Song[];
  image?: { src: string; alt: string };
  fullWidth?: boolean;
}

interface Concert {
  id: string;
  label: string;
  artists: Artist[];
}

const concerts: Concert[] = [
  {
    id: "concert1",
    label: "CONCERTZ #1",
    artists: [
      {
        name: "ATTABOTTY",
        role: "Performer",
        bio: "Composer, multi-instrumentalist, and audiovisual storyteller. Fuses EDM, lo-fi, and cinematic orchestra with 2D/3D animation.",
        link: { url: "https://www.thezao.com/community/attabotty", label: "AttaBotty on The ZAO" },
        videoId: "-ggYAdu4KRE",
        songs: [
          { vid: "-ggYAdu4KRE", num: "\u25B6", title: "Intro" },
          { vid: "E0xE65RRKI0", num: "1", title: "Attabotty Flyin" },
          { vid: "v_Vhbx9exgo", num: "2", title: "Altered Pathways" },
          { vid: "lyyx-jEY94k", num: "3", title: "Stay Based" },
          { vid: "aNPEq5UslMU", num: "4", title: "Eternal Rhythms #3" },
          { vid: "rbKY61E2SqM", num: "5", title: "Eternal Rhythms #4" },
          { vid: "JO4gwfHX1RI", num: "6", title: "Eternal Rhythms #5" },
          { vid: "rFKN-WobG9Y", num: "7", title: "Outro" },
        ],
      },
      {
        name: "CLEJAN",
        role: "Performer",
        bio: 'Rapper, singer, songwriter, and classically trained violinist from Atlanta. Creator of the signature "Trap Violin" sound.',
        link: { url: "https://www.thezao.com/community/clejan", label: "Clejan on The ZAO" },
        videoId: "4n1dFs5T4T4",
        songs: [
          { vid: "4n1dFs5T4T4", num: "\u25B6", title: "Intro" },
          { vid: "M04SiX3stEE", num: "1", title: "Let's Go" },
          { vid: "rwSbB9JTZx0", num: "2", title: "Drive Fast" },
          { vid: "7BSUzE2LM64", num: "3", title: "My Favorite Strings" },
          { vid: "gyj0Nvcy0Lo", num: "4", title: "Gummy" },
          { vid: "SuJrihWBO6I", num: "5", title: "Sepira" },
          { vid: "w-q9ZY5GnnY", num: "6", title: "Look at Me Now" },
          { vid: "dqOA3HpjgAY", num: "7", title: "Dance with the Devil" },
          { vid: "oonC8uKBaMo", num: "8", title: "Candy" },
          { vid: "gYqud1Dbzog", num: "9", title: "I Did It" },
          { vid: "JTy_guyHfrA", num: "10", title: "Shakedown" },
          { vid: "65lclQWx24A", num: "11", title: "Lolipop" },
          { vid: "vajSBpNjmj4", num: "12", title: "Run It Up" },
          { vid: "0MIJ0YSVe5s", num: "13", title: "She Likes the Way That I Fiddle" },
        ],
      },
    ],
  },
  {
    id: "concert2",
    label: "CONCERTZ #2",
    artists: [
      {
        name: "TOM FELLENZ",
        role: "Performer",
        bio: "Opening act with a 30-minute live set in the SaltyVerse Auditorium.",
        videoId: "zYm3g_YUYjE",
      },
      {
        name: "STILO WORLD",
        role: "DJ \u00b7 WaveWarZ",
        bio: "DJing WaveWarZ — an extended set blending beats and Web3 culture live on Spatial.",
        link: { url: "https://www.thezao.com/community/stilo", label: "Stilo World on The ZAO" },
        videoId: "-nx9gZtK8ug",
      },
      {
        name: "ATTABOTTY",
        role: "Performer",
        bio: "Returning with a 30-minute closing set of immersive audiovisual performance.",
        link: { url: "https://www.thezao.com/community/attabotty", label: "AttaBotty on The ZAO" },
        videoId: "YYyBFasvkuM",
      },
    ],
  },
  {
    id: "concert3",
    label: "CONCERTZ #3",
    artists: [
      {
        name: "D\u00daO D\u00d8 MUSICA",
        role: "Headline Act",
        bio: "Opening live set from 4:15 \u2013 4:45 PM EST.",
      },
      {
        name: "JOSEPH GOATS",
        role: "Headline Act",
        bio: "Live set from 4:45 \u2013 5:15 PM EST.",
      },
      {
        name: "STILO WORLD",
        role: "Headline Act \u00b7 WaveWarZ",
        bio: "Live set from 5:15 \u2013 5:45 PM EST in StiloWorld, plus an English vs Spanish WaveWarZ Community Battle.",
        link: { url: "https://www.thezao.com/community/stilo", label: "Stilo World on The ZAO" },
        image: { src: "/images/wavewarz-battle.jpeg", alt: "WaveWarZ English vs Spanish Community Battle" },
        fullWidth: true,
      },
    ],
  },
  {
    id: "concert4",
    label: "CONCERTZ #4",
    artists: [
      {
        name: "JOSEPH GOATS",
        role: "Performer",
        bio: "Community artist from The ZAO, performing live at COC ConcertZ #4.",
      },
      {
        name: "STILO",
        role: "Performer \u00b7 Venue Host",
        bio: "Host of StiloWorld and 150+ consecutive weekly VR concerts. Returning for his third COC ConcertZ appearance.",
        link: { url: "https://www.thezao.com/community/stilo", label: "Stilo on The ZAO" },
      },
      {
        name: "TOM FELLENZ",
        role: "Performer",
        bio: "ZAO community member and returning performer — previously opened ConcertZ #2 with a live set in the SaltyVerse Auditorium.",
      },
    ],
  },
];

function ArtistCard({ artist }: { artist: Artist }) {
  const [activeVid, setActiveVid] = useState(artist.videoId || (artist.songs?.[0]?.vid ?? ""));

  const handleSongClick = useCallback((vid: string) => {
    setActiveVid(vid);
  }, []);

  return (
    <div
      className="artist-card"
      style={artist.fullWidth ? { gridColumn: "1 / -1" } : undefined}
    >
      {artist.link && (
        <a
          href={artist.link.url}
          target="_blank"
          rel="noopener"
          className="artist-card-link"
          aria-label={artist.link.label}
        />
      )}
      <div className="artist-name">{artist.name}</div>
      <div className="artist-role">{artist.role}</div>
      <p>{artist.bio}</p>

      {(artist.videoId || artist.songs) && (
        <div className="video-embed-wrap visible">
          <iframe
            className="video-embed"
            src={`https://www.youtube.com/embed/${activeVid}${activeVid !== artist.videoId && activeVid !== artist.songs?.[0]?.vid ? "?autoplay=1" : ""}`}
            allow="autoplay; encrypted-media"
            allowFullScreen
            loading="lazy"
            title={`${artist.name} performance`}
          />
        </div>
      )}

      {artist.songs && (
        <ul className="song-list">
          {artist.songs.map((song) => (
            <li
              key={song.vid}
              className={activeVid === song.vid ? "active" : ""}
              onClick={(e) => {
                e.stopPropagation();
                handleSongClick(song.vid);
              }}
            >
              <span className="song-num">{song.num}</span> {song.title}
            </li>
          ))}
        </ul>
      )}

      {artist.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={artist.image.src}
          alt={artist.image.alt}
          style={{
            width: "100%",
            borderRadius: 4,
            marginTop: 16,
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))",
          }}
        />
      )}
    </div>
  );
}

export default function ArtistLineup() {
  const [activeTab, setActiveTab] = useState("concert4");

  return (
    <section className="reveal" style={{ marginTop: 100 }}>
      <span className="section-label">Lineup</span>
      <h2>ARTISTS</h2>
      <div className="artists-tabs">
        {concerts.map((concert) => (
          <button
            key={concert.id}
            className={`artists-tab${activeTab === concert.id ? " active" : ""}`}
            onClick={() => setActiveTab(concert.id)}
          >
            {concert.label}
          </button>
        ))}
      </div>

      {concerts.map((concert) => (
        <div
          key={concert.id}
          className={`artists-panel${activeTab === concert.id ? " active" : ""}`}
        >
          {concert.artists.map((artist, i) => (
            <ArtistCard key={`${concert.id}-${i}`} artist={artist} />
          ))}
        </div>
      ))}
    </section>
  );
}
