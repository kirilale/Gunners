import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token: string;
}

interface GoogleUserInfo {
  sub: string; // Google user ID
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
}

/**
 * Google OAuth callback endpoint
 * Handles the OAuth response from Google and creates/logs in the user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle OAuth errors
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(
        new URL(`/auth/login?error=oauth_failed`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/auth/login?error=missing_code", request.url)
      );
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/google/callback`;

    if (!googleClientId || !googleClientSecret) {
      console.error("Google OAuth not configured");
      return NextResponse.redirect(
        new URL("/auth/login?error=oauth_not_configured", request.url)
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Failed to exchange code for token:", await tokenResponse.text());
      return NextResponse.redirect(
        new URL("/auth/login?error=token_exchange_failed", request.url)
      );
    }

    const tokens: GoogleTokenResponse = await tokenResponse.json();

    // Get user info from Google
    const userInfoResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!userInfoResponse.ok) {
      console.error("Failed to get user info:", await userInfoResponse.text());
      return NextResponse.redirect(
        new URL("/auth/login?error=user_info_failed", request.url)
      );
    }

    const googleUser: GoogleUserInfo = await userInfoResponse.json();

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (user) {
      // User exists, log them in
      await createSession(user.id);

      // Redirect to home or complete profile if needed
      if (!user.username || user.username.startsWith("user_")) {
        return NextResponse.redirect(
          new URL("/auth/complete-profile", request.url)
        );
      }

      return NextResponse.redirect(new URL("/", request.url));
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          username: `user_${Date.now()}`, // Temporary username
          displayName: googleUser.name,
          profilePhoto: googleUser.picture,
        },
      });

      // Create session
      await createSession(user.id);

      // Redirect to complete profile
      return NextResponse.redirect(
        new URL("/auth/complete-profile", request.url)
      );
    }
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_callback_failed", request.url)
    );
  }
}
