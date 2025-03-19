import { google } from 'googleapis';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return new Response(JSON.stringify({ error: 'Query parameter is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const youtube = google.youtube('v3');
    const [genre, mood, era] = query.split(' ');
    
    // Construct a search query based on user preferences
    const searchQuery = `${genre} ${mood} music ${era}`;

    const response = await youtube.search.list({
      key: process.env.YOUTUBE_API_KEY,
      part: ['snippet'],
      q: searchQuery,
      maxResults: 10,
      type: ['video'],
      videoCategoryId: '10', // Music category
    });

    if (!response.data.items) {
      throw new Error('No videos found');
    }

    const items = response.data.items.map((item: any) => ({
      id: { videoId: item.id?.videoId },
      uniqueId: item.id?.videoId,
      snippet: {
        title: item.snippet?.title,
        description: item.snippet?.description,
        thumbnails: {
          default: { url: item.snippet?.thumbnails?.default?.url },
          medium: { url: item.snippet?.thumbnails?.medium?.url },
        },
      },
    }));

    return new Response(JSON.stringify({ items }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('YouTube API Error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch videos from YouTube',
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}