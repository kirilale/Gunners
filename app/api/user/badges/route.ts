import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    const badges = await prisma.badge.findMany({
      where: { userId: user.id },
      include: {
        match: {
          select: {
            opponentName: true,
            competitionName: true,
            kickoffTime: true,
          },
        },
      },
      orderBy: { earnedTimestamp: "desc" },
      take: limit ? parseInt(limit) : undefined,
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
