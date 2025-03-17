import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  const { accessToken, genres, mood, popularity } = await request.json();

  try {
    const response = await axios.get(
      "https://api.spotify.com/v1/recommendations",
      {
        params: {
          seed_genres: genres.join(","),
          target_valence: mood,
          target_popularity: popularity,
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return NextResponse.json(response.data.tracks);
  } catch (error: any) {
    return NextResponse.json({ error: error.response?.data }, { status: 400 });
  }
}