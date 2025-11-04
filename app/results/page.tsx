"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMatchDate } from "@/lib/utils";

interface Match {
  id: string;
  opponentName: string;
  competitionName: string;
  homeAway: string;
  kickoffTime: string;
  arsenalScore: number;
  opponentScore: number;
  result: string;
}

export default function ResultsPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch("/api/matches?status=completed");
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "WIN":
        return "bg-green-100 border-green-500 text-green-800";
      case "DRAW":
        return "bg-yellow-100 border-yellow-500 text-yellow-800";
      case "LOSS":
        return "bg-red-100 border-red-500 text-red-800";
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Results</h1>
        <p className="text-muted-foreground">Arsenal's recent matches</p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No completed matches yet this season.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className={getResultColor(match.result)}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <Badge variant={match.result === "WIN" ? "default" : "outline"}>
                        {match.result}
                      </Badge>
                      <h3 className="text-xl font-bold">
                        Arsenal vs {match.opponentName}
                      </h3>
                    </div>
                    <div className="text-sm space-y-1">
                      <p>
                        <strong>{match.competitionName}</strong>
                      </p>
                      <p>{formatMatchDate(match.kickoffTime)}</p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-4xl font-bold">
                      {match.arsenalScore} - {match.opponentScore}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Full Time
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
