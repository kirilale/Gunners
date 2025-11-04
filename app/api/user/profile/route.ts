import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  username: z.string().min(3).max(20).optional(),
  displayName: z.string().max(50).optional(),
  locationCountry: z.string().optional(),
  locationCity: z.string().optional(),
  favoritePlayer: z.string().optional(),
  supporterSince: z.number().min(1886).max(new Date().getFullYear()).optional(),
  bio: z.string().max(200).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userStats: true,
        userSettings: true,
      },
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = profileSchema.parse(body);

    // Check if username is taken
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: {
          username: data.username,
          NOT: { id: user.id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid profile data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
