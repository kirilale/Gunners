"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  user: {
    username: string;
    displayName?: string;
    profilePhoto?: string;
    locationCountry?: string;
  };
  totalCheckIns?: number;
  currentStreak?: number;
  totalPredictionPoints?: number;
  totalAchievements?: number;
}

export default function LeaderboardsPage() {
  const [type, setType] = useState("check-ins");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [type]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboards?type=${type}&scope=global&limit=50`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatValue = (entry: LeaderboardEntry) => {
    switch (type) {
      case "check-ins":
        return entry.totalCheckIns || 0;
      case "streaks":
        return entry.currentStreak || 0;
      case "predictions":
        return entry.totalPredictionPoints || 0;
      case "achievements":
        return entry.totalAchievements || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Leaderboards</h1>
        <p className="text-muted-foreground">See how you rank against other Gooners</p>
      </div>

      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setType("check-ins")}
          className={`px-4 py-2 rounded-lg font-medium ${
            type === "check-ins"
              ? "bg-arsenal-red text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Most Check-ins
        </button>
        <button
          onClick={() => setType("streaks")}
          className={`px-4 py-2 rounded-lg font-medium ${
            type === "streaks"
              ? "bg-arsenal-red text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Longest Streaks
        </button>
        <button
          onClick={() => setType("predictions")}
          className={`px-4 py-2 rounded-lg font-medium ${
            type === "predictions"
              ? "bg-arsenal-red text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Prediction Masters
        </button>
        <button
          onClick={() => setType("achievements")}
          className={`px-4 py-2 rounded-lg font-medium ${
            type === "achievements"
              ? "bg-arsenal-red text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Most Achievements
        </button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8 text-center">Loading leaderboard...</CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {type === "check-ins" && "Most Check-ins (All-Time)"}
              {type === "streaks" && "Longest Current Streaks"}
              {type === "predictions" && "Prediction Masters (This Season)"}
              {type === "achievements" && "Most Achievements Unlocked"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No data available yet. Be the first!
              </p>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg ${
                      index === 0
                        ? "bg-yellow-100 border-2 border-yellow-500"
                        : index === 1
                        ? "bg-gray-100 border-2 border-gray-400"
                        : index === 2
                        ? "bg-orange-100 border-2 border-orange-400"
                        : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold w-8">#{index + 1}</div>
                      <div>
                        <div className="font-semibold">
                          {entry.user.displayName || entry.user.username}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          @{entry.user.username}
                          {entry.user.locationCountry && ` • ${entry.user.locationCountry}`}
                        </div>
                      </div>
                    </div>
                    <Badge variant="arsenal" className="text-lg px-4 py-2">
                      {getStatValue(entry)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
