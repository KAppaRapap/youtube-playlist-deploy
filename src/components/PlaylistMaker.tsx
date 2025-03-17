'use client';

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import axios from "axios";

interface Track {
  uri: string;
}

interface PlaylistResponse {
  name: string;
}

const genres = [
  "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "blues",
  "classical", "country", "dance", "electronic", "folk", "funk", "hip-hop",
  "house", "indie", "jazz", "latin", "metal", "pop", "r-n-b", "rock", "soul"
];

export default function PlaylistMaker() {
  const { data: session } = useSession();
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["pop"]);
  const [mood, setMood] = useState(0.5);
  const [popularity, setPopularity] = useState(50);
  const [playlistName, setPlaylistName] = useState("My Playlist");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generatePlaylist = async () => {
    if (!session) {
      signIn("spotify");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const recommendations = await axios.post<Track[]>("/api/get-recommendations", {
        accessToken: session.user?.accessToken,
        genres: selectedGenres,
        mood,
        popularity,
      });

      if (!recommendations.data.length) {
        throw new Error("No tracks found for the selected criteria");
      }

      const trackUris = recommendations.data.map((track) => track.uri);

      const response = await axios.post<PlaylistResponse>("/api/create-playlist", {
        accessToken: session.accessToken,
        userId: session.user?.id,
        name: playlistName,
        description: `Generated by Spotify Playlist Maker - Mood: ${mood}, Popularity: ${popularity}`,
        trackUris,
      });

      alert(`Playlist "${response.data.name}" created successfully!`);
    } catch (error) {
      console.error("Error creating playlist:", error);
      setError(error instanceof Error ? error.message : "Error creating playlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold mb-4">Create Your Custom Playlist</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="playlist-name" className="block text-sm font-medium mb-2">Playlist Name</label>
          <input
            id="playlist-name"
            type="text"
            value={playlistName}
            onChange={(e) => setPlaylistName(e.target.value)}
            className="w-full p-2 border rounded-md"
            maxLength={100}
          />
        </div>

        <div>
          <label htmlFor="genres" className="block text-sm font-medium mb-2">Genres (Select multiple)</label>
          <select
            id="genres"
            multiple
            value={selectedGenres}
            onChange={(e) => setSelectedGenres([...e.target.selectedOptions].map(o => o.value))}
            className="w-full p-2 border rounded-md h-32"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre.charAt(0).toUpperCase() + genre.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="mood" className="block text-sm font-medium mb-2">
            Mood (0 = Sad, 1 = Happy): {mood.toFixed(1)}
          </label>
          <input
            id="mood"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={mood}
            onChange={(e) => setMood(parseFloat(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="popularity" className="block text-sm font-medium mb-2">
            Popularity (0 = Underground, 100 = Mainstream): {popularity}
          </label>
          <input
            id="popularity"
            type="range"
            min="0"
            max="100"
            value={popularity}
            onChange={(e) => setPopularity(parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        <button
          onClick={generatePlaylist}
          disabled={isLoading || !playlistName.trim()}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating..." : session ? "Generate Playlist" : "Login with Spotify"}
        </button>
      </div>
    </div>
  );
}