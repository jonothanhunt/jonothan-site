"use client";
// This file has been replaced by Gif.tsx. Please use Gif instead.
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface AccessibleGifProps {
  src: string;
  alt: string;
}

export default function AccessibleGif({ src, alt }: AccessibleGifProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPreview, setHasPreview] = useState(false);
  const [previewSrc, setPreviewSrc] = useState('');

  useEffect(() => {
    // Try to find a .jpg with the same path as the gif
    const jpgSrc = src.replace(/\.gif$/i, '.jpeg');
    // Create a test image to check if the jpg exists
    const img = new window.Image();
    img.onload = () => {
      setHasPreview(true);
      setPreviewSrc(jpgSrc);
    };
    img.onerror = () => {
      setHasPreview(false);
      setPreviewSrc(src);
    };
    img.src = jpgSrc;
  }, [src]);

  const togglePlay = () => {
    setIsPlaying((prev) => (hasPreview ? !prev : true));
  };

  // If no preview, always show the GIF and hide the button
  const showGif = isPlaying || !hasPreview;
  const imageToShow = showGif ? src : previewSrc;

  return (
    <div className="relative w-full">
      <Image
        width={1200}
        height={0}
        src={imageToShow}
        alt={alt}
        sizes="100vw"
        style={{
          width: '100%',
          height: 'auto',
          opacity: 1
        }}
        onClick={hasPreview ? togglePlay : undefined}
      />
      {hasPreview && (
        <button
          onClick={togglePlay}
          className={`absolute top-4 right-4 bg-purple-950 text-white rounded-full p-2 transition-opacity ${
            isPlaying ? 'opacity-0' : 'opacity-100'
          } hover:opacity-100`}
          aria-label={isPlaying ? 'Pause GIF' : 'Play GIF'}
        >
          {isPlaying ? (
            <PauseIcon className="w-6 h-6" />
          ) : (
            <PlayIcon className="w-6 h-6" />
          )}
        </button>
      )}
    </div>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  );
}
