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
    });

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
