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

interface PlaylistData {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
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
    const [genre, mood, era] = query.split(' ');

    // Playlists reais do YouTube organizadas por gênero
    const playlistsByGenre: Record<string, Array<{id: string, title: string, description: string, thumbnail: string}>> = {
      'Rock': [
        {
          id: 'PLw-VjHDlEOgs658kAHR_LAaILBXb-s6Q5',
          title: 'Classic Rock Hits',
          description: 'The best classic rock songs of all time',
          thumbnail: 'vi/1w7OgIMMRc4'
        },
        {
          id: 'PL4QNnZJr8sRNKjKzArmzTBAlNYBDN2h-J',
          title: 'Rock Anthems',
          description: 'Greatest rock anthems ever made',
          thumbnail: 'vi/btPJPFnesV4'
        }
      ],
      'Pop': [
        {
          id: 'PLDIoUOhQQPlXr63I_vwF9GD8sAKh77dWU',
          title: 'Pop Hits',
          description: 'Best pop songs collection',
          thumbnail: 'vi/JGwWNGJdvx8'
        },
        {
          id: 'PLmjMRs-v1tDBwtnD3yr0VJTD0TqYAbeoX',
          title: 'Pop Classics',
          description: 'Classic pop songs that everyone loves',
          thumbnail: 'vi/fJ9rUzIMcZQ'
        }
      ],
      'Hip Hop': [
        {
          id: 'PLw-VjHDlEOgvtnnnqWlTqByAtC7tXBg6D',
          title: 'Hip Hop Essentials',
          description: 'Essential hip hop tracks',
          thumbnail: 'vi/5qm8PH4xAss'
        },
        {
          id: 'PLC1og_v3eb4hrv_oNYZ0dj_RHz2gCaQi9',
          title: 'Hip Hop Classics',
          description: 'Classic hip hop tracks from the golden era',
          thumbnail: 'vi/TMZi25Pq3T8'
        }
      ],
      'Electronic': [
        {
          id: 'PLw-VjHDlEOgtGf4hj-ZyqThFqFJqY2hQY',
          title: 'Electronic Mix',
          description: 'Best electronic music mix',
          thumbnail: 'vi/y6120QOlsfU'
        },
        {
          id: 'PLFPg_IUxqnZNnACUGsfn50DySIOVSkiKI',
          title: 'EDM Hits',
          description: 'Popular electronic dance music tracks',
          thumbnail: 'vi/gCYcHz2k5x0'
        }
      ],
      'Metal': [
        {
          id: 'PLhQCJTkrHOwSX8LUnIMgaTq3chP1tiTut',
          title: 'Metal Classics',
          description: 'Classic metal songs collection',
          thumbnail: 'vi/WM8bTdBs-cw'
        },
        {
          id: 'PLYwfYGziz-_15VN407Ap_NQXkfdPx52Pz',
          title: 'Metal Anthems',
          description: 'Greatest metal anthems of all time',
          thumbnail: 'vi/CSvFpBOe8eY'
        }
      ],
      'Jazz': [
        {
          id: 'PLT4aBtM_C0rU4dMKjYZ2_ogzM4Rzg0Hf6',
          title: 'Jazz Essentials',
          description: 'Essential jazz tracks',
          thumbnail: 'vi/vmDDOFXSgAs'
        },
        {
          id: 'PLprI2ACOF7mKTJLewa7e_G7FwUv3GgL6p',
          title: 'Jazz Classics',
          description: 'Classic jazz collection',
          thumbnail: 'vi/qJi03NqXfk8'
        }
      ],
      'Classical': [
        {
          id: 'PLVXq77mXV53-Np39jM456si2PeTrEm9Mj',
          title: 'Classical Essentials',
          description: 'Essential classical music pieces',
          thumbnail: 'vi/4Tr0otuiQuU'
        },
        {
          id: 'PL0UfRcvRh6b7RyFCJn0D_7E0gZz7hGZRi',
          title: 'Classical Masterpieces',
          description: 'Greatest classical masterpieces',
          thumbnail: 'vi/Zi8vJ_lMxQI'
        }
      ]
    };

    // Pegar playlists para o gênero selecionado
    const genrePlaylists = playlistsByGenre[genre] || playlistsByGenre['Rock'];

    // Criar os itens de playlist com as informações corretas
    const playlists = genrePlaylists.map((playlist, index) => ({
      id: { videoId: playlist.id },
      uniqueId: `playlist_${index + 1}`,
      snippet: {
        title: `${playlist.title} - ${mood} ${era}`,
        description: `${playlist.description} - Perfect for ${mood} moods from the ${era}`,
        thumbnails: {
          default: { url: `https://i.ytimg.com/${playlist.thumbnail}/default.jpg` },
          medium: { url: `https://i.ytimg.com/${playlist.thumbnail}/mqdefault.jpg` }
        }
      }
    }));

    return new Response(JSON.stringify({ items: playlists }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Error fetching playlists. Please try again.',
      details: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}