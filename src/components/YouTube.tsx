import { FC } from 'react';

interface YouTubeProps {
  url: string;
  startAt?: number;
}

const YouTube: FC<YouTubeProps> = ({ url, startAt }) => {
  // Extract video ID from URL
  const getVideoId = (url: string): string => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : '';
  };

  const videoId = getVideoId(url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&color=white&iv_load_policy=3${
    startAt ? `&start=${startAt}` : ''
  }`;

  return (
    <div className="relative w-full aspect-video mb-5">
      <iframe
        className="absolute top-0 left-0 w-full h-full rounded-lg"
        src={embedUrl}
        title="YouTube video"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default YouTube;
