import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createMagicLinkToken, generateMagicLink } from "@/lib/auth/magic-link";
import { emailService } from "@/services/email/resend";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = loginSchema.parse(body);

    // Check if user exists, if not create them
    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        deletedAt: true,
      },
    });

    // Handle soft-deleted accounts
    if (user?.deletedAt) {
      const deletedTime = user.deletedAt.getTime();
      const now = Date.now();
      const hoursPassed = (now - deletedTime) / (1000 * 60 * 60);

      if (hoursPassed <= 24) {
        // Within 24-hour grace period - offer recovery
        return NextResponse.json({
          success: false,
          requiresRecovery: true,
          message: "This account is scheduled for deletion. Would you like to recover it?",
          hoursRemaining: Math.round(24 - hoursPassed),
          email: user.email,
        }, { status: 403 });
      } else {
        // Beyond 24 hours - should be deleted by cron job
        // Treat as if user doesn't exist
        return NextResponse.json(
          { error: "Account has been permanently deleted." },
          { status: 410 } // 410 Gone
        );
      }
    }

    if (!user) {
      // Create new user - they'll complete profile after verification
      user = await prisma.user.create({
        data: {
          email,
          username: `user_${Date.now()}`, // Temporary, will be updated
        },
      });
    }

    // Create magic link token
    const token = await createMagicLinkToken(email);
    const magicLink = generateMagicLink(token);

    // Send email
    await emailService.sendMagicLink(email, magicLink);

    return NextResponse.json({
      success: true,
      message: "Magic link sent to your email",
    });
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
