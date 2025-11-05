"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Achievement {
  id: string;
  achievementType: string;
  achievementName: string;
  achievementDescription: string;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  unlockTimestamp: string;
}

interface AchievementShowcaseProps {
  limit?: number;
}

export function AchievementShowcase({ limit }: AchievementShowcaseProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch("/api/achievements");
      if (response.ok) {
        const data = await response.json();
        const sortedAchievements = data.achievements.sort(
          (a: Achievement, b: Achievement) =>
            new Date(b.unlockTimestamp).getTime() - new Date(a.unlockTimestamp).getTime()
        );
        setAchievements(limit ? sortedAchievements.slice(0, limit) : sortedAchievements);
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    const colors: Record<string, string> = {
      COMMON: "bg-gray-500",
      RARE: "bg-blue-500",
      EPIC: "bg-purple-500",
      LEGENDARY: "bg-yellow-500",
    };
    return colors[rarity] || "bg-gray-500";
  };

  const getRarityEmoji = (rarity: string) => {
    const emojis: Record<string, string> = {
      COMMON: "🥉",
      RARE: "🥈",
      EPIC: "🥇",
      LEGENDARY: "💎",
    };
    return emojis[rarity] || "🏆";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            Loading achievements...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (achievements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-lg mb-2">No achievements unlocked yet</p>
            <p className="text-sm">Keep checking in to matches to unlock achievements!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements ({achievements.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="border rounded-lg p-4 hover:shadow-lg transition-all bg-gradient-to-br from-white to-accent/20"
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl mt-1">
                  {getRarityEmoji(achievement.rarity)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-lg">
                      {achievement.achievementName}
                    </h4>
                    <Badge
                      className={`${getRarityColor(achievement.rarity)} text-white text-xs`}
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.achievementDescription}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    🔓 Unlocked {formatDate(achievement.unlockTimestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
