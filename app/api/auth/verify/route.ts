import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyMagicLinkToken } from "@/lib/auth/magic-link";
import { createSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/auth/login?error=invalid_token", request.url)
      );
    }

    // Verify token and get email
    const email = await verifyMagicLinkToken(token);

    if (!email) {
      return NextResponse.redirect(
        new URL("/auth/login?error=expired_token", request.url)
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.redirect(
        new URL("/auth/login?error=user_not_found", request.url)
      );
    }

    // Create session
    await createSession(user.id);

    // Check if user needs to complete profile
    const needsProfile = user.username.startsWith("user_") || !user.locationCountry;

    if (needsProfile) {
      return NextResponse.redirect(new URL("/auth/complete-profile", request.url));
    }

    // Redirect to dashboard
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(
      new URL("/auth/login?error=verification_failed", request.url)
    );
  }
}
