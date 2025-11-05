"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BadgeData {
  id: string;
  badgeType: string;
  matchResult: string;
  matchScore: string;
  competition: string;
  checkInLocation: string;
  matchNumber: number;
  earnedTimestamp: string;
  match: {
    opponentName: string;
    competitionName: string;
    kickoffTime: string;
  };
}

const BADGE_TYPE_DISPLAY: Record<string, { icon: string; label: string; color: string }> = {
  STANDARD: { icon: "🎖️", label: "Standard", color: "bg-gray-100" },
  DERBY: { icon: "🔥", label: "Derby", color: "bg-red-100" },
  CLEAN_SHEET: { icon: "🧤", label: "Clean Sheet", color: "bg-blue-100" },
  HIGH_SCORING: { icon: "⚽", label: "High Scoring", color: "bg-orange-100" },
  EUROPEAN: { icon: "⭐", label: "European Night", color: "bg-blue-600 text-white" },
  CUP_FINAL: { icon: "🏆", label: "Cup Final", color: "bg-yellow-600 text-white" },
  VICTORY: { icon: "✅", label: "Victory", color: "bg-green-600 text-white" },
  COMEBACK: { icon: "💪", label: "Comeback", color: "bg-purple-100" },
  TROPHY: { icon: "🏆", label: "Trophy", color: "bg-yellow-100" },
};

const RESULT_COLORS: Record<string, string> = {
  WIN: "text-green-600",
  DRAW: "text-yellow-600",
  LOSS: "text-red-600",
};

interface BadgeGalleryProps {
  userId?: string;
  limit?: number;
}

export function BadgeGallery({ userId, limit = 12 }: BadgeGalleryProps) {
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const url = userId
        ? `/api/user/badges?userId=${userId}`
        : `/api/user/badges`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBadges(data.badges);
      }
    } catch (error) {
      console.error("Failed to fetch badges:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Loading badges...
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="text-6xl mb-4">🎖️</div>
          <h3 className="text-xl font-semibold mb-2">No Badges Yet</h3>
          <p className="text-muted-foreground">
            Check in to matches to start collecting badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayedBadges = showAll ? badges : badges.slice(0, limit);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
        {displayedBadges.map((badge) => {
          const badgeInfo = BADGE_TYPE_DISPLAY[badge.badgeType] || BADGE_TYPE_DISPLAY.STANDARD;
          const resultColor = RESULT_COLORS[badge.matchResult] || "text-gray-600";

          return (
            <Card
              key={badge.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
            >
              <CardContent className="p-4">
                <div className={`${badgeInfo.color} rounded-lg p-4 mb-3 text-center`}>
                  <div className="text-5xl mb-2">{badgeInfo.icon}</div>
                  <Badge variant="secondary" className="text-xs">
                    {badgeInfo.label}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <h4 className="font-semibold text-sm line-clamp-1">
                    vs {badge.match.opponentName}
                  </h4>
                  <p className={`text-lg font-bold ${resultColor}`}>
                    {badge.matchScore}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {badge.competition}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    📍 {badge.checkInLocation}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Match #{badge.matchNumber}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(badge.earnedTimestamp).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {badges.length > limit && (
        <div className="text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-arsenal-red hover:underline font-medium"
          >
            {showAll ? "Show Less" : `Show All ${badges.length} Badges`}
          </button>
        </div>
      )}
    </div>
  );
}
