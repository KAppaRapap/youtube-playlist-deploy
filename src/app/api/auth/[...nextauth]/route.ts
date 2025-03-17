import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import queryString from "query-string";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;

const spotifyScopes = [
  "user-read-private",
  "user-read-email",
  "playlist-modify-public",
  "playlist-modify-private"
].join(",");

const spotifyLoginUrl = `https://accounts.spotify.com/authorize?${queryString.stringify({
  client_id: SPOTIFY_CLIENT_ID,
  response_type: "code",
  redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/spotify",
  scope: spotifyScopes,
})}`;  

const handler = NextAuth({
  providers: [
    SpotifyProvider({
      clientId: SPOTIFY_CLIENT_ID,
      clientSecret: SPOTIFY_CLIENT_SECRET,
      authorization: spotifyLoginUrl,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
});

export { handler as GET, handler as POST };

