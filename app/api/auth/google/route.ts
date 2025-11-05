import { NextRequest, NextResponse } from "next/server";

/**
 * Google OAuth initiation endpoint
 * Redirects user to Google's OAuth consent screen
 */
export async function GET(request: NextRequest) {
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/auth/google/callback`;

  if (!googleClientId) {
    return NextResponse.json(
      { error: "Google OAuth is not configured. Please add GOOGLE_CLIENT_ID to environment variables." },
      { status: 500 }
    );
  }

  // Build Google OAuth URL
  const googleOAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

  googleOAuthUrl.searchParams.set("client_id", googleClientId);
  googleOAuthUrl.searchParams.set("redirect_uri", googleRedirectUri);
  googleOAuthUrl.searchParams.set("response_type", "code");
  googleOAuthUrl.searchParams.set("scope", "email profile");
  googleOAuthUrl.searchParams.set("access_type", "offline");
  googleOAuthUrl.searchParams.set("prompt", "consent");

  // Redirect to Google OAuth
  return NextResponse.redirect(googleOAuthUrl.toString());
}
