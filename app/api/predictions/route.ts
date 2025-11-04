import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { z } from "zod";

const predictionSchema = z.object({
  matchId: z.string(),
  predictedArsenalScore: z.number().min(0).max(9),
  predictedOpponentScore: z.number().min(0).max(9),
  predictedFirstScorerId: z.number().optional(),
  predictedFirstScorerName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const data = predictionSchema.parse(body);

    // Get match
    const match = await prisma.match.findUnique({
      where: { id: data.matchId },
    });

    if (!match) {
      return NextResponse.json(
        { error: "Match not found" },
        { status: 404 }
      );
    }

    // Check if match hasn't started yet
    if (new Date() >= match.kickoffTime) {
      return NextResponse.json(
        { error: "Cannot predict after kickoff" },
        { status: 400 }
      );
    }

    // Check if user already predicted
    const existing = await prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId: data.matchId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already predicted for this match" },
        { status: 400 }
      );
    }

    // Create prediction
    const prediction = await prisma.prediction.create({
      data: {
        userId: user.id,
        matchId: data.matchId,
        predictedArsenalScore: data.predictedArsenalScore,
        predictedOpponentScore: data.predictedOpponentScore,
        predictedFirstScorerId: data.predictedFirstScorerId,
        predictedFirstScorerName: data.predictedFirstScorerName,
      },
    });

    return NextResponse.json({ prediction });
  } catch (error) {
    console.error("Prediction error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid prediction data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to submit prediction" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const matchId = searchParams.get("matchId");

    if (matchId) {
      // Get user's prediction for a specific match
      const prediction = await prisma.prediction.findUnique({
        where: {
          userId_matchId: {
            userId: user.id,
            matchId,
          },
        },
      });

      return NextResponse.json({ prediction });
    } else {
      // Get user's prediction history
      const predictions = await prisma.prediction.findMany({
        where: { userId: user.id },
        include: {
          match: true,
        },
        orderBy: { submittedAt: "desc" },
        take: 20,
      });

      return NextResponse.json({ predictions });
    }
  } catch (error) {
    console.error("Get predictions error:", error);
    return NextResponse.json(
      { error: "Failed to get predictions" },
      { status: 500 }
    );
  }
}
