"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { BadgeGallery } from "@/components/profile/badge-gallery";
import { CheckInHistory } from "@/components/profile/check-in-history";
import { AchievementShowcase } from "@/components/profile/achievement-showcase";

interface UserProfile {
  user: {
    username: string;
    displayName?: string;
    email: string;
    profilePhoto?: string;
    locationCountry?: string;
    locationCity?: string;
    favoritePlayer?: string;
    supporterSince?: number;
    bio?: string;
  };
  userStats?: {
    totalCheckIns: number;
    currentStreak: number;
    longestStreak: number;
    totalBadges: number;
    totalAchievements: number;
    totalPredictionPoints: number;
    fanLevel: string;
    luckyCharmPercentage?: number;
    arsenalWinsWhenPresent: number;
    arsenalDrawsWhenPresent: number;
    arsenalLossesWhenPresent: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      const data = await response.json();
      setProfile(data.profile);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center py-8">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="py-8 text-center">
            <p>Profile not found. Please log in.</p>
            <Button onClick={() => router.push("/auth/login")} className="mt-4">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = profile.userStats;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/settings")} variant="outline">
            Settings
          </Button>
          <Button onClick={handleLogout} variant="outline">
            Log Out
          </Button>
        </div>
      </div>

      {/* Profile Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-arsenal-red text-white flex items-center justify-center text-3xl font-bold">
              {profile.user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">
                {profile.user.displayName || profile.user.username}
              </h2>
              <p className="text-muted-foreground">@{profile.user.username}</p>
              {profile.user.locationCity && profile.user.locationCountry && (
                <p className="text-sm">
                  📍 {profile.user.locationCity}, {profile.user.locationCountry}
                </p>
              )}
              {profile.user.favoritePlayer && (
                <p className="text-sm">
                  ⭐ Favorite Player: {profile.user.favoritePlayer}
                </p>
              )}
              {profile.user.supporterSince && (
                <p className="text-sm">
                  🔴⚪ Arsenal Supporter Since {profile.user.supporterSince}
                </p>
              )}
            </div>
            {stats && (
              <Badge variant="gold" className="text-lg px-4 py-2">
                {stats.fanLevel}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {stats && (
        <>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Total Check-ins</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalCheckIns}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Current Streak</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-500">
                  {stats.currentStreak} 🔥
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Badges Earned</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalBadges}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalAchievements}</div>
              </CardContent>
            </Card>
          </div>

          {/* Lucky Charm */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>🍀 Lucky Charm Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <div className="text-6xl font-bold mb-4">
                  {stats.luckyCharmPercentage !== null
                    ? `${stats.luckyCharmPercentage?.toFixed(1)}%`
                    : "🔒"}
                </div>
                <p className="text-lg text-muted-foreground mb-4">
                  {stats.luckyCharmPercentage !== null
                    ? "Arsenal's win rate when you check in"
                    : "Check in to 10 completed matches to unlock"}
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {stats.arsenalWinsWhenPresent}
                    </div>
                    <div className="text-sm text-muted-foreground">Wins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.arsenalDrawsWhenPresent}
                    </div>
                    <div className="text-sm text-muted-foreground">Draws</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {stats.arsenalLossesWhenPresent}
                    </div>
                    <div className="text-sm text-muted-foreground">Losses</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Predictions */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Prediction Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around">
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.totalPredictionPoints}</div>
                  <div className="text-sm text-muted-foreground">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{stats.longestStreak}</div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <div className="mb-6">
            <AchievementShowcase limit={6} />
          </div>

          {/* Check-In History */}
          <div className="mb-6">
            <CheckInHistory limit={10} />
          </div>

          {/* Badge Gallery */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Badge Collection</h2>
            <BadgeGallery limit={12} />
          </div>
        </>
      )}
    </div>
  );
}
