"use client";

import { useEffect, useRef, useState } from "react";
import { PlayIcon, PauseIcon } from "@phosphor-icons/react";

type AudioPlayButtonProps = {
  src: string;
  onPlayChange?: (playing: boolean) => void;
  onTimeUpdate?: (current: number, duration: number) => void;
  className?: string;
};

/* 🔥 GLOBAL (shared across ALL instances) */
let activeAudio: HTMLAudioElement | null = null;

export default function AudioPlayButton({
  src,
  onTimeUpdate,
  onPlayChange,
  className = "",
}: AudioPlayButtonProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);

  /* 🔁 reset when src changes */
  useEffect(() => {
    setIsPlaying(false);
    setIsReady(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src]);

  /* 🧹 cleanup on unmount */
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();

        if (activeAudio === audioRef.current) {
          activeAudio = null;
        }
      }
    };
  }, []);

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio || !isReady) return;

    try {
      if (audio.paused) {
        /* 🔥 stop previous audio */
        if (activeAudio && activeAudio !== audio) {
          activeAudio.pause();
        }

        /* 🔁 restart if ended */
        if (audio.currentTime >= audio.duration) {
          audio.currentTime = 0;
        }

        await audio.play();

        /* ✅ mark as active */
        activeAudio = audio;
      } else {
        audio.pause();

        if (activeAudio === audio) {
          activeAudio = null;
        }
      }
    } catch (err) {
      console.error("Audio play failed:", err);
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => {
          setIsReady(true);

          if (audioRef.current) {
            const duration = audioRef.current.duration;

            if (!isNaN(duration) && isFinite(duration)) {
              onTimeUpdate?.(0, duration);
            }
          }
        }}
        onPlay={() => {
          setIsPlaying(true);
          onPlayChange?.(true);
        }}
        onPause={() => {
          setIsPlaying(false);
          onPlayChange?.(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          onPlayChange?.(false);

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }

          if (activeAudio === audioRef.current) {
            activeAudio = null;
          }
        }}
        onTimeUpdate={() => {
          if (!audioRef.current) return;

          const current = audioRef.current.currentTime;
          const duration = audioRef.current.duration;

          if (!isNaN(duration)) {
            onTimeUpdate?.(current, duration);
          }
        }}
      />

      <button
        onClick={toggleAudio}
        disabled={!isReady}
        className={`p-3 bg-white/50 backdrop-blur-md rounded-[99px] outline outline-1 outline-white shadow ${
          !isReady ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        {isPlaying ? (
          <PauseIcon size={24} weight="fill" className="text-primary" />
        ) : (
          <PlayIcon size={24} weight="fill" className="text-primary" />
        )}
      </button>
    </>
  );
}