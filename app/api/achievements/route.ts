import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getUserAchievements, checkAndAwardAchievements } from "@/lib/achievements/tracker";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Check for new achievements
    await checkAndAwardAchievements(user.id);

    // Get user's achievements
    const achievements = await getUserAchievements(user.id);

    return NextResponse.json({ achievements });
  } catch (error) {
    console.error("Get achievements error:", error);
    return NextResponse.json(
      { error: "Failed to get achievements" },
      { status: 500 }
    );
  }
}
