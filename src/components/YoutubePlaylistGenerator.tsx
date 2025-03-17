"use client";

import React, { useState } from 'react';

interface Question {
  id: string;
  text: string;
  options: string[];
}

interface VideoItem {
  id: { videoId: string };
  uniqueId: string;
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
    };
  };
}

const questions: Question[] = [
  {
    id: 'genre',
    text: 'What genre do you prefer?',
    options: ['Rock', 'Pop', 'Hip Hop', 'Electronic', 'Metal', 'Jazz', 'Classical']
  },
  {
    id: 'mood',
    text: 'What mood are you in?',
    options: ['Energetic', 'Relaxed', 'Happy', 'Melancholic', 'Focus', 'Party']
  },
  {
    id: 'era',
    text: 'Which era do you prefer?',
    options: ['60s', '70s', '80s', '90s', '2000s', 'Modern']
  }
];

export default function YoutubePlaylistGenerator() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [playlists, setPlaylists] = useState<VideoItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnswer = async (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setLoading(true);
      setError(null);
      try {
        const query = `${newAnswers.genre} ${newAnswers.mood} ${newAnswers.era}`;
        const response = await fetch(`/api/youtube/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Error fetching playlists');
        }

        if (!data.items || data.items.length === 0) {
          throw new Error('No playlists found for your selection. Try different options.');
        }

        setPlaylists(data.items);
      } catch (err: any) {
        setError(err.message);
        setPlaylists([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const resetQuestions = () => {
    setCurrentQuestionIndex(0);
    setAnswers({});
    setPlaylists([]);
    setError(null);
  };

  const currentQuestion = questions[currentQuestionIndex];

  const getPlaylistUrl = (playlistId: string) => {
    return `https://www.youtube.com/playlist?list=${playlistId}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {error ? (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <p>{error}</p>
          <button
            onClick={resetQuestions}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : playlists.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Found Playlists</h2>
            <button
              onClick={resetQuestions}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              New Search
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div
                key={playlist.uniqueId}
                className="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="relative pb-[56.25%]">
                  <img
                    src={playlist.snippet.thumbnails.medium.url}
                    alt={playlist.snippet.title}
                    className="absolute top-0 left-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                    {playlist.snippet.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[4.5rem]">
                    {playlist.snippet.description}
                  </p>
                  <a
                    href={getPlaylistUrl(playlist.id.videoId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors inline-flex items-center"
                  >
                    <span>Open in YouTube</span>
                    <svg className="w-4 h-4 ml-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">YouTube Playlist Generator</h1>
            <p className="text-gray-600">Answer 3 questions to find your perfect playlist</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">{currentQuestion.text}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option}
                  onClick={() => handleAnswer(currentQuestion.id, option)}
                  disabled={loading}
                  className={`p-4 text-center rounded-lg border-2 transition-all duration-200
                    ${loading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'hover:border-blue-500 hover:text-blue-500 hover:shadow-md active:bg-blue-50'
                    }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {loading && (
              <div className="mt-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-gray-600">Searching for the perfect playlists...</p>
              </div>
            )}
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                {[...Array(questions.length)].map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      index === currentQuestionIndex
                        ? 'bg-blue-500 w-4'
                        : index < currentQuestionIndex
                        ? 'bg-blue-300'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}