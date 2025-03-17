import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export const YOUTUBE_CLIENT_ID = process.env.YOUTUBE_CLIENT_ID!;
export const YOUTUBE_CLIENT_SECRET = process.env.YOUTUBE_CLIENT_SECRET!;
export const YOUTUBE_REDIRECT_URI = new URL('/api/auth/callback/youtube', process.env.NEXTAUTH_URL).toString();

const youtube = google.youtube('v3');

export const youtubeScopes = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/youtubepartner'
];

export const oauth2Client = new OAuth2Client(
  YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET,
  YOUTUBE_REDIRECT_URI
);

export async function createYoutubePlaylist(accessToken: string, playlistName: string, description: string) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });

    const response = await youtube.playlists.insert({
      auth: oauth2Client,
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: playlistName,
          description: description
        },
        status: {
          privacyStatus: 'private'
        }
      }
    });

    if (!response?.data) {
      throw new Error('No data received from YouTube API');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating YouTube playlist:', error);
    throw error;
  }
}

export async function addVideosToPlaylist(accessToken: string, playlistId: string, videoIds: string[]) {
  try {
    oauth2Client.setCredentials({ access_token: accessToken });

    const insertPromises = videoIds.map(videoId =>
      youtube.playlistItems.insert({
        auth: oauth2Client,
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId: playlistId,
            resourceId: {
              kind: 'youtube#video',
              videoId: videoId
            }
          }
        }
      })
    );

    await Promise.all(insertPromises);
  } catch (error) {
    console.error('Error adding videos to playlist:', error);
    throw error;
  }
}

export async function searchYoutubeVideos(accessToken: string, query: string, maxResults = 5) {
  if (!accessToken) {
    throw new Error('Access token is required');
  }

  if (!query) {
    throw new Error('Search query is required');
  }

  try {
    oauth2Client.setCredentials({ access_token: accessToken });

    const response = await youtube.search.list({
      auth: oauth2Client,
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults: maxResults
    });

    if (!response?.data?.items) {
      throw new Error('No videos found');
    }

    return response.data.items;
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
}