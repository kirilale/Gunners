"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CheckIn {
  id: string;
  locationCountry: string;
  locationCity: string;
  statusMessage?: string;
  checkInTimestamp: string;
  match: {
    opponentName: string;
    matchDate: string;
    arsenalScore?: number;
    opponentScore?: number;
    result?: string;
    competitionName: string;
  };
}

interface CheckInHistoryProps {
  limit?: number;
}

export function CheckInHistory({ limit = 10 }: CheckInHistoryProps) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCheckIns();
  }, []);

  const fetchCheckIns = async () => {
    try {
      const response = await fetch("/api/check-ins");
      if (response.ok) {
        const data = await response.json();
        setCheckIns(data.checkIns.slice(0, limit));
      }
    } catch (error) {
      console.error("Failed to fetch check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getResultBadge = (result?: string) => {
    if (!result) return null;

    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      WIN: "default",
      DRAW: "secondary",
      LOSS: "destructive",
    };

    const colors: Record<string, string> = {
      WIN: "bg-green-500 hover:bg-green-600",
      DRAW: "bg-yellow-500 hover:bg-yellow-600",
      LOSS: "bg-red-500 hover:bg-red-600",
    };

    return (
      <Badge className={`${colors[result]} text-white`}>
        {result}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check-In History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading check-ins...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (checkIns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check-In History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">No check-ins yet</p>
            <p className="text-sm">Check in to your first match to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Check-Ins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {checkIns.map((checkIn) => (
            <div
              key={checkIn.id}
              className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-lg">
                      Arsenal vs {checkIn.match.opponentName}
                    </h4>
                    {getResultBadge(checkIn.match.result)}
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      📅 {formatDate(checkIn.match.matchDate)}
                    </p>
                    <p>
                      📍 {checkIn.locationCity}, {checkIn.locationCountry}
                    </p>
                    <p>
                      🏆 {checkIn.match.competitionName}
                    </p>
                  </div>

                  {checkIn.match.arsenalScore !== undefined &&
                   checkIn.match.opponentScore !== undefined && (
                    <div className="mt-2 text-lg font-bold">
                      {checkIn.match.arsenalScore} - {checkIn.match.opponentScore}
                    </div>
                  )}

                  {checkIn.statusMessage && (
                    <div className="mt-2 text-sm italic text-muted-foreground bg-accent/30 p-2 rounded">
                      "{checkIn.statusMessage}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
