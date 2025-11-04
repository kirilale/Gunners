import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const season = searchParams.get("season");
    const competition = searchParams.get("competition");

    const where: any = { userId: user.id };

    if (season) {
      where.match = {
        season: parseInt(season),
      };
    }

    if (competition) {
      where.competition = competition;
    }

    const badges = await prisma.badge.findMany({
      where,
      include: {
        match: true,
      },
      orderBy: {
        earnedTimestamp: "desc",
      },
    });

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Get badges error:", error);
    return NextResponse.json(
      { error: "Failed to get badges" },
      { status: 500 }
    );
  }
}
