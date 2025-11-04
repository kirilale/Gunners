"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatMatchDate, getTimeUntilMatch } from "@/lib/utils";

interface Match {
  id: string;
  opponentName: string;
  opponentLogo?: string;
  competitionName: string;
  homeAway: string;
  venueName?: string;
  kickoffTime: string;
  matchStatus: string;
}

export default function FixturesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFixtures();
  }, []);

  const fetchFixtures = async () => {
    try {
      const response = await fetch("/api/matches?status=upcoming");
      const data = await response.json();
      setMatches(data.matches || []);
    } catch (error) {
      console.error("Failed to fetch fixtures:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading fixtures...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Upcoming Fixtures</h1>
        <p className="text-muted-foreground">Arsenal's next matches - don't miss a check-in!</p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No upcoming fixtures at the moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-2xl font-bold">
                        Arsenal vs {match.opponentName}
                      </h3>
                      <Badge variant={match.homeAway === "HOME" ? "arsenal" : "outline"}>
                        {match.homeAway}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <strong>{match.competitionName}</strong>
                      </p>
                      <p>{formatMatchDate(match.kickoffTime)}</p>
                      {match.venueName && <p>{match.venueName}</p>}
                      <p className="text-arsenal-red font-semibold">
                        {getTimeUntilMatch(match.kickoffTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button variant="arsenal" size="lg">
                      Set Reminder
                    </Button>
                    <Button variant="outline" size="lg">
                      Add to Calendar
                    </Button>
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
