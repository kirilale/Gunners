"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    season: number;
  };
}

const BADGE_TYPE_DISPLAY: Record<string, { icon: string; label: string; color: string }> = {
  STANDARD: { icon: "🎖️", label: "Standard", color: "bg-gray-100" },
  DERBY: { icon: "🔥", label: "Derby", color: "bg-red-100" },
  CLEAN_SHEET: { icon: "🧤", label: "Clean Sheet", color: "bg-blue-100" },
  HIGH_SCORING: { icon: "⚽", label: "High Scoring", color: "bg-orange-100" },
  VICTORY: { icon: "✨", label: "Victory", color: "bg-green-100" },
  EUROPEAN: { icon: "⭐", label: "European", color: "bg-purple-100" },
  CUP_FINAL: { icon: "🏆", label: "Cup Final", color: "bg-yellow-100" },
};

const RESULT_COLORS: Record<string, string> = {
  WIN: "text-green-600",
  DRAW: "text-yellow-600",
  LOSS: "text-red-600",
};

export default function BadgesPage() {
  const router = useRouter();
  const [badges, setBadges] = useState<BadgeData[]>([]);
  const [filteredBadges, setFilteredBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSeason, setFilterSeason] = useState<string>("all");
  const [filterCompetition, setFilterCompetition] = useState<string>("all");
  const [filterBadgeType, setFilterBadgeType] = useState<string>("all");

  useEffect(() => {
    fetchBadges();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [badges, filterSeason, filterCompetition, filterBadgeType]);

  const fetchBadges = async () => {
    try {
      const response = await fetch("/api/user/badges");
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
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

  const applyFilters = () => {
    let filtered = [...badges];

    if (filterSeason !== "all") {
      filtered = filtered.filter((badge) => badge.match.season.toString() === filterSeason);
    }

    if (filterCompetition !== "all") {
      filtered = filtered.filter((badge) => badge.match.competitionName === filterCompetition);
    }

    if (filterBadgeType !== "all") {
      filtered = filtered.filter((badge) => badge.badgeType === filterBadgeType);
    }

    setFilteredBadges(filtered);
  };

  const getUniqueSeasons = () => {
    const seasons = [...new Set(badges.map((b) => b.match.season))];
    return seasons.sort((a, b) => b - a);
  };

  const getUniqueCompetitions = () => {
    return [...new Set(badges.map((b) => b.match.competitionName))];
  };

  const getBadgeTypeStats = () => {
    const stats: Record<string, number> = {};
    badges.forEach((badge) => {
      stats[badge.badgeType] = (stats[badge.badgeType] || 0) + 1;
    });
    return stats;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading badges...</div>
      </div>
    );
  }

  const badgeTypeStats = getBadgeTypeStats();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Badge Collection</h1>
          <p className="text-muted-foreground">
            {badges.length} {badges.length === 1 ? "badge" : "badges"} earned
          </p>
        </div>
        <Button onClick={() => router.push("/profile")} variant="outline">
          Back to Profile
        </Button>
      </div>

      {badges.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🎖️</div>
            <h3 className="text-xl font-semibold mb-2">No Badges Yet</h3>
            <p className="text-muted-foreground mb-4">
              Check in to matches to start collecting badges!
            </p>
            <Button onClick={() => router.push("/")}>Go to Matches</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
            {Object.entries(BADGE_TYPE_DISPLAY).map(([type, info]) => (
              <Card key={type} className="text-center">
                <CardContent className="p-4">
                  <div className="text-3xl mb-1">{info.icon}</div>
                  <div className="text-2xl font-bold">{badgeTypeStats[type] || 0}</div>
                  <div className="text-xs text-muted-foreground">{info.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Season</label>
                  <Select value={filterSeason} onValueChange={setFilterSeason}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Seasons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Seasons</SelectItem>
                      {getUniqueSeasons().map((season) => (
                        <SelectItem key={season} value={season.toString()}>
                          {season}/{season + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Competition</label>
                  <Select value={filterCompetition} onValueChange={setFilterCompetition}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Competitions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Competitions</SelectItem>
                      {getUniqueCompetitions().map((comp) => (
                        <SelectItem key={comp} value={comp}>
                          {comp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Badge Type</label>
                  <Select value={filterBadgeType} onValueChange={setFilterBadgeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {Object.entries(BADGE_TYPE_DISPLAY).map(([type, info]) => (
                        <SelectItem key={type} value={type}>
                          {info.icon} {info.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(filterSeason !== "all" || filterCompetition !== "all" || filterBadgeType !== "all") && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterSeason("all");
                      setFilterCompetition("all");
                      setFilterBadgeType("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                  <span className="ml-3 text-sm text-muted-foreground">
                    Showing {filteredBadges.length} of {badges.length} badges
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badge Grid */}
          {filteredBadges.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No badges match your filters</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBadges.map((badge) => {
                const badgeInfo = BADGE_TYPE_DISPLAY[badge.badgeType] || BADGE_TYPE_DISPLAY.STANDARD;
                const resultColor = RESULT_COLORS[badge.matchResult] || "text-gray-600";

                return (
                  <Card key={badge.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className={`${badgeInfo.color} rounded-lg p-4 mb-3 text-center`}>
                        <div className="text-5xl mb-2">{badgeInfo.icon}</div>
                        <Badge variant="secondary" className="text-xs">
                          {badgeInfo.label}
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm">vs {badge.match.opponentName}</h4>
                        <p className={`text-lg font-bold ${resultColor}`}>{badge.matchScore}</p>
                        <p className="text-xs text-muted-foreground">{badge.competition}</p>
                        <p className="text-xs text-muted-foreground">
                          📍 {badge.checkInLocation}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          🗓️ {new Date(badge.earnedTimestamp).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Match #{badge.matchNumber}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
