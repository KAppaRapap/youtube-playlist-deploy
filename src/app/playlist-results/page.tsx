'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

interface VideoItem {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium?: { url: string };
    };
  };
}

function PlaylistResultsContent() {
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!searchParams) {
      setError('No search parameters found');
      setIsLoading(false);
      return;
    }

    const videoIdsParam = searchParams.get('videos');
    setIsLoading(true);
    setError(null);

    if (!videoIdsParam) {
      setError('No playlist data found');
      setIsLoading(false);
      return;
    }

    try {
      const decodedVideos = JSON.parse(decodeURIComponent(videoIdsParam));
      if (!Array.isArray(decodedVideos) || decodedVideos.length === 0) {
        throw new Error('Invalid playlist data format');
      }
      setVideos(decodedVideos);
    } catch (error) {
      console.error('Error parsing video data:', error);
      setError('Failed to load playlist data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  const generatePlaylistUrl = (videoIds: string[]) => {
    if (!videoIds.length) return '';
    return `https://www.youtube.com/watch_videos?video_ids=${videoIds.join(',')}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
        <button
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const allVideoIds = videos.map(video => video.id.videoId);
  const combinedPlaylistUrl = generatePlaylistUrl(allVideoIds);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Playlists Are Ready!</h1>
      {videos.length > 1 && (
        <div className="mb-6">
          <a
            href={combinedPlaylistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Watch All Videos
          </a>
        </div>
      )}
      <div className="space-y-6">
        {videos.map((video, index) => (
          <div key={video.id.videoId} className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">{video.snippet.title}</h2>
            <div className="aspect-video mb-4">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${video.id.videoId}`}
                title={video.snippet.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-gray-600 mb-4">{video.snippet.description}</p>
            <a
              href={`https://www.youtube.com/watch?v=${video.id.videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Watch on YouTube
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PlaylistResults() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PlaylistResultsContent />
    </Suspense>
  );
}