import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const settingsSchema = z.object({
  emailNotifications: z.object({
    matchReminders: z.boolean().optional(),
    badgeEarned: z.boolean().optional(),
    achievementUnlocked: z.boolean().optional(),
    weeklyRecap: z.boolean().optional(),
    fixtureUpdates: z.boolean().optional(),
  }).optional(),
  pushNotifications: z.object({
    matchReminders: z.boolean().optional(),
    badgeEarned: z.boolean().optional(),
    achievementUnlocked: z.boolean().optional(),
    liveMatchUpdates: z.boolean().optional(),
  }).optional(),
  quietHoursStart: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  quietHoursEnd: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  spoilerMode: z.boolean().optional(),
  profileVisibility: z.enum(["PUBLIC", "FRIENDS", "PRIVATE"]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    let settings = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          emailNotifications: {
            matchReminders: true,
            badgeEarned: true,
            achievementUnlocked: true,
            weeklyRecap: true,
            fixtureUpdates: true,
          },
          pushNotifications: {
            matchReminders: true,
            badgeEarned: true,
            achievementUnlocked: true,
            liveMatchUpdates: false,
          },
          spoilerMode: false,
          profileVisibility: "PUBLIC",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = settingsSchema.parse(body);

    // Ensure settings exist before update
    const existing = await prisma.userSettings.findUnique({
      where: { userId: user.id },
    });

    let settings;
    if (existing) {
      settings = await prisma.userSettings.update({
        where: { userId: user.id },
        data: {
          ...data,
          emailNotifications: data.emailNotifications || existing.emailNotifications,
          pushNotifications: data.pushNotifications || existing.pushNotifications,
        },
      });
    } else {
      settings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          emailNotifications: data.emailNotifications || {
            matchReminders: true,
            badgeEarned: true,
            achievementUnlocked: true,
            weeklyRecap: true,
            fixtureUpdates: true,
          },
          pushNotifications: data.pushNotifications || {
            matchReminders: true,
            badgeEarned: true,
            achievementUnlocked: true,
            liveMatchUpdates: false,
          },
          spoilerMode: data.spoilerMode ?? false,
          profileVisibility: data.profileVisibility || "PUBLIC",
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Update settings error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid settings data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
