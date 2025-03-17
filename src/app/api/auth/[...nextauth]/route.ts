import NextAuth, { DefaultSession, Account, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt";
import { youtubeScopes } from "./youtube";
import { AuthOptions } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string;
    user?: User & {
      id: string;
      email: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
    error?: string;
    user?: {
      id: string;
      email: string;
      name?: string;
      image?: string;
    };
  }
}

const baseUrl = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NEXTAUTH_URL 
    ? process.env.NEXTAUTH_URL
    : 'http://localhost:3000';

const YouTubeProvider = {
  id: "youtube",
  name: "YouTube",
  type: "oauth",
  version: "2.0",
  authorization: {
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    params: {
      scope: youtubeScopes.join(" "),
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true"
    }
  },
  token: "https://oauth2.googleapis.com/token",
  clientId: process.env.YOUTUBE_CLIENT_ID,
  clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
  redirectUri: `${baseUrl}/api/auth/callback/youtube`,
  profile(profile: { sub: string; name: string; email: string; picture: string }) {
    return {
      id: profile.sub,
      name: profile.name,
      email: profile.email,
      image: profile.picture
    };
  }
};

const authOptions: AuthOptions = {
  providers: [
    {
      ...YouTubeProvider,
      type: "oauth" as const,
    },
  ],
  callbacks: {
    async jwt({ token, account, user }: { token: JWT; account: Account | null; user: User | null }): Promise<JWT> {
      if (account && user) {
        const newToken: JWT = {
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: (account.expires_at ?? Date.now() / 1000) * 1000,
          user: {
            id: user.email ?? '',
            email: user.email ?? '',
            name: user.name ?? undefined,
            image: user.image ?? undefined
          }
        };
        return newToken;
      }

      if (Date.now() < (token.accessTokenExpires ?? 0)) {
        return token;
      }

      if (!token.refreshToken) {
        return {
          ...token,
          error: 'RefreshTokenMissing'
        };
      }

      try {
        const tokens = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            client_id: process.env.YOUTUBE_CLIENT_ID!,
            client_secret: process.env.YOUTUBE_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken,
          }).toString(),
        }).then(r => r.json());

        return {
          ...token,
          accessToken: tokens.access_token,
          accessTokenExpires: Date.now() + (tokens.expires_in ?? 3600) * 1000,
        };
      } catch (error) {
        return {
          ...token,
          error: 'RefreshAccessTokenError',
        };
      }
    },
    async session({ session, token }: { session: Session; token: JWT }): Promise<Session> {
      if (token.user) {
        session.user = token.user;
      }
      session.accessToken = token.accessToken;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
