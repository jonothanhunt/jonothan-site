import { FC } from 'react';

interface TikTokProps {
  url: string;
}

const TikTok: FC<TikTokProps> = ({ url }) => {
  // Extract video ID from URL
  const getVideoId = (url: string): string => {
    const regExp = /\/video\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : '';
  };

  const videoId = getVideoId(url);
  const embedUrl = `https://www.tiktok.com/player/v1/${videoId}`;

  return (
    <div className="flex justify-center w-full mb-5">
      <div className="relative w-full max-h-96 aspect-video" style={{ aspectRatio: '325/575' }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          src={embedUrl}
          title="TikTok video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default TikTok;
