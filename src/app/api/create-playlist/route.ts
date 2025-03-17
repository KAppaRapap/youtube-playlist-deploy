import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const { accessToken, userId, name, description, trackUris } = await request.json();

  try {
    const playlistResponse = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      {
        name,
        description,
        public: false,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const playlistId = playlistResponse.data.id;

    await axios.post(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      { uris: trackUris },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({ playlistId, name });
  } catch (error: any) {
    return NextResponse.json({ error: error.response?.data }, { status: 400 });
  }
}