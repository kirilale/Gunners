import { prisma } from "@/lib/db";
import { calculatePredictionPoints } from "@/lib/utils";

// Function to calculate prediction points after match ends
export async function calculateAllPredictionPoints(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });

  if (!match || match.arsenalScore === null || match.opponentScore === null) {
    return;
  }

  const predictions = await prisma.prediction.findMany({
    where: { matchId },
  });

  for (const prediction of predictions) {
    const result = calculatePredictionPoints(
      {
        arsenal: prediction.predictedArsenalScore,
        opponent: prediction.predictedOpponentScore,
        firstScorer: prediction.predictedFirstScorerName || undefined,
      },
      {
        arsenal: match.arsenalScore,
        opponent: match.opponentScore,
        // TODO: Get actual first scorer from match events
        firstScorer: undefined,
      }
    );

    await prisma.prediction.update({
      where: { id: prediction.id },
      data: {
        pointsEarned: result.points,
        predictionResult: result.result.toUpperCase(),
      },
    });

    // Update user stats
    await prisma.userStats.update({
      where: { userId: prediction.userId },
      data: {
        totalPredictionPoints: {
          increment: result.points,
        },
      },
    });
  }
}
