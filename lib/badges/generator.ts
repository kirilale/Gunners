import { prisma } from "@/lib/db";
import { emailService } from "@/services/email/resend";

export type BadgeType =
  | "STANDARD"
  | "DERBY"
  | "CLEAN_SHEET"
  | "HIGH_SCORING"
  | "VICTORY"
  | "EUROPEAN"
  | "CUP_FINAL";

export async function generateBadgesForMatch(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: {
      checkIns: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!match || match.arsenalScore === null || match.opponentScore === null) {
    console.error("Cannot generate badges: match not complete");
    return;
  }

  // Determine badge type
  const badgeType = determineBadgeType(match);
  const matchResult =
    match.arsenalScore > match.opponentScore ? "WIN" :
    match.arsenalScore < match.opponentScore ? "LOSS" : "DRAW";

  for (const checkIn of match.checkIns) {
    // Get user's badge count for match number
    const badgeCount = await prisma.badge.count({
      where: { userId: checkIn.userId },
    });

    const matchNumber = badgeCount + 1;

    // Create badge
    await prisma.badge.create({
      data: {
        userId: checkIn.userId,
        matchId: match.id,
        badgeType,
        matchResult,
        matchScore: `${match.arsenalScore}-${match.opponentScore}`,
        competition: match.competitionName,
        checkInLocation: `${checkIn.locationCity}, ${checkIn.locationCountry}`,
        matchNumber,
      },
    });

    // Send email notification
    try {
      await emailService.sendBadgeNotification(
        checkIn.user.email,
        checkIn.user.username,
        {
          opponent: match.opponentName,
          score: `${match.arsenalScore}-${match.opponentScore}`,
          date: match.matchDate.toLocaleDateString(),
        }
      );
    } catch (error) {
      console.error("Failed to send badge notification email:", error);
    }
  }

  // Mark badges as generated
  await prisma.match.update({
    where: { id: matchId },
    data: { badgesGenerated: true },
  });

  console.log(`Generated ${match.checkIns.length} badges for match ${matchId}`);
}

function determineBadgeType(match: any): BadgeType {
  // Derby match (Tottenham)
  if (match.opponentName.toLowerCase().includes("tottenham")) {
    return "DERBY";
  }

  // European competition
  if (match.competitionName.includes("Champions League") ||
      match.competitionName.includes("Europa") ||
      match.competitionName.includes("UEFA")) {
    return "EUROPEAN";
  }

  // Cup final
  if (match.competitionName.includes("Final")) {
    return "CUP_FINAL";
  }

  // Clean sheet (Arsenal didn't concede)
  if (match.opponentScore === 0 && match.arsenalScore! > 0) {
    return "CLEAN_SHEET";
  }

  // High scoring (Arsenal scored 4+)
  if (match.arsenalScore! >= 4) {
    return "HIGH_SCORING";
  }

  // Victory
  if (match.arsenalScore! > match.opponentScore!) {
    return "VICTORY";
  }

  return "STANDARD";
}

export function getBadgeColor(badgeType: BadgeType): string {
  switch (badgeType) {
    case "DERBY":
      return "#FFD700"; // Gold
    case "EUROPEAN":
      return "#0066CC"; // UEFA Blue
    case "CUP_FINAL":
      return "#9C824A"; // Arsenal Gold
    case "CLEAN_SHEET":
      return "#00FF00"; // Green
    case "HIGH_SCORING":
      return "#FF6600"; // Orange
    case "VICTORY":
      return "#EF0107"; // Arsenal Red
    default:
      return "#FFFFFF"; // White
  }
}

export function getBadgeDescription(badgeType: BadgeType): string {
  switch (badgeType) {
    case "DERBY":
      return "North London Derby";
    case "EUROPEAN":
      return "European Competition";
    case "CUP_FINAL":
      return "Cup Final";
    case "CLEAN_SHEET":
      return "Clean Sheet Victory";
    case "HIGH_SCORING":
      return "High Scoring Match (4+ goals)";
    case "VICTORY":
      return "Victory";
    default:
      return "Match Attendance";
  }
}
