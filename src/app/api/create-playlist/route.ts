import { NextResponse } from "next/server";
import { createYoutubePlaylist, addVideosToPlaylist } from "../auth/[...nextauth]/youtube";

/**
 * Cria uma nova playlist no YouTube com base nas informações fornecidas.
 * 
 * @param request - Requisição HTTP com os dados necessários para criar a playlist.
 * @returns Resposta HTTP com o resultado da criação da playlist.
 */
interface Track {
  uri: string;
}

export async function POST(request: Request) {
  try {
    // Obter dados da requisição
    const { accessToken, userId, playlistName, tracks } = await request.json();

    // Validar credenciais
    if (!accessToken || !userId) {
      // Definir mensagem de erro com base na credencial ausente
      const errorMessage = !userId 
        ? "YouTube user ID is missing. Please try logging out and back in."
        : "Missing required credentials.";
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Validar tracks
    if (!tracks?.length) {
      return NextResponse.json(
        { error: "No tracks provided for the playlist" },
        { status: 400 }
      );
    }

    // Criar playlist
    const playlist = await createYoutubePlaylist(
      accessToken,
      playlistName,
      `Generated by YouTube Playlist Maker - Based on your music preferences`
    );

    // Verificar se a playlist foi criada com sucesso
    if (!playlist?.id) {
      throw new Error("Failed to create playlist: Missing playlist ID");
    }

    // Adicionar vídeos à playlist
    const videoIds = tracks.map((track: Track) => track.uri);
    await addVideosToPlaylist(accessToken, playlist.id, videoIds);

    // Retornar resultado
    return NextResponse.json({
      name: playlist.snippet?.title || playlistName,
      playlistId: playlist.id,
      url: `https://www.youtube.com/playlist?list=${playlist.id}`
    });

  } catch (error: any) {
    // Registrar erro
    console.error("YouTube API error:", error);
    
    // Retornar erro
    return NextResponse.json(
      { error: error.message || "Failed to create playlist" },
      { status: error.response?.status || 500 }
    );
  }
}