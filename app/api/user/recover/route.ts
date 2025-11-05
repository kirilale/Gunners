import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth/session";

/**
 * Recover a soft-deleted account within 24-hour grace period
 * PRD: User can log in with email to recover account
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user with deletedAt timestamp
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email" },
        { status: 404 }
      );
    }

    if (!user.deletedAt) {
      return NextResponse.json(
        { error: "This account is not scheduled for deletion" },
        { status: 400 }
      );
    }

    // Check if 24-hour grace period has passed
    const deletedTime = user.deletedAt.getTime();
    const now = Date.now();
    const hoursPassed = (now - deletedTime) / (1000 * 60 * 60);

    if (hoursPassed > 24) {
      return NextResponse.json(
        { error: "Recovery period has expired. Account has been permanently deleted." },
        { status: 410 } // 410 Gone
      );
    }

    // Restore account by removing deletedAt timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: {
        deletedAt: null,
      },
    });

    // Create new session for the recovered account
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      message: "Account recovered successfully! Welcome back.",
      hoursRemaining: Math.round(24 - hoursPassed),
    });
  } catch (error) {
    console.error("Account recovery error:", error);
    return NextResponse.json(
      { error: "Failed to recover account" },
      { status: 500 }
    );
  }
}
