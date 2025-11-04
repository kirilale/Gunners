import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    let userStats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    });

    // Create stats if they don't exist
    if (!userStats) {
      userStats = await prisma.userStats.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Get additional data
    const checkIns = await prisma.checkIn.findMany({
      where: { userId: user.id },
      include: { match: true },
    });

    // Calculate countries and cities visited
    const countries = new Set(checkIns.map((c: any) => c.locationCountry));
    const cities = new Set(checkIns.map((c: any) => `${c.locationCity}, ${c.locationCountry}`));

    // Calculate lucky charm percentage
    const matchesWithUser = checkIns.map((c: any) => c.match);
    const winsWithUser = matchesWithUser.filter((m: any) => m.result === "WIN").length;
    const drawsWithUser = matchesWithUser.filter((m: any) => m.result === "DRAW").length;
    const lossesWithUser = matchesWithUser.filter((m: any) => m.result === "LOSS").length;

    const totalWithUser = winsWithUser + drawsWithUser + lossesWithUser;
    const luckyCharmPercentage =
      totalWithUser > 0 ? (winsWithUser / totalWithUser) * 100 : null;

    // Update stats
    await prisma.userStats.update({
      where: { userId: user.id },
      data: {
        countriesCheckedInFrom: Array.from(countries),
        citiesCheckedInFrom: Array.from(cities),
        luckyCharmPercentage,
        arsenalWinsWhenPresent: winsWithUser,
        arsenalDrawsWhenPresent: drawsWithUser,
        arsenalLossesWhenPresent: lossesWithUser,
      },
    });

    // Refetch updated stats
    userStats = await prisma.userStats.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ stats: userStats });
  } catch (error) {
    console.error("Get stats error:", error);
    return NextResponse.json(
      { error: "Failed to get stats" },
      { status: 500 }
    );
  }
}
