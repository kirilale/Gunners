"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckInModal } from "@/components/match/check-in-modal";
import { PredictionModal } from "@/components/match/prediction-modal";
import { GlobalFanMap } from "@/components/match/global-fan-map";
import { formatMatchDate, getTimeUntilMatch, isCheckInWindowOpen } from "@/lib/utils";

interface Match {
  id: string;
  opponentName: string;
  opponentLogo?: string;
  competitionName: string;
  homeAway: string;
  venueName?: string;
  kickoffTime: string;
  matchState: string;
  arsenalScore?: number;
  opponentScore?: number;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [liveMatch, setLiveMatch] = useState<Match | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const [hasPredicted, setHasPredicted] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchMatches();

    // Poll for match updates every 30 seconds
    const interval = setInterval(fetchMatches, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (user && nextMatch) {
      checkUserStatus(nextMatch.id);
    }
  }, [user, nextMatch]);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    try {
      // Check for live match
      const liveResponse = await fetch("/api/matches?status=live");
      const liveData = await liveResponse.json();
      if (liveData.matches && liveData.matches.length > 0) {
        setLiveMatch(liveData.matches[0]);
      } else {
        setLiveMatch(null);
      }

      // Get next match
      const upcomingResponse = await fetch("/api/matches?status=upcoming");
      const upcomingData = await upcomingResponse.json();
      if (upcomingData.matches && upcomingData.matches.length > 0) {
        setNextMatch(upcomingData.matches[0]);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    }
  };

  const checkUserStatus = async (matchId: string) => {
    if (!user) return;

    try {
      // Check if user has checked in
      const checkInResponse = await fetch(`/api/check-ins?matchId=${matchId}`);
      if (checkInResponse.ok) {
        const checkInData = await checkInResponse.json();
        setHasCheckedIn(checkInData.checkIns && checkInData.checkIns.length > 0);
      }

      // Check if user has predicted
      const predictionResponse = await fetch(`/api/predictions?matchId=${matchId}`);
      if (predictionResponse.ok) {
        const predictionData = await predictionResponse.json();
        setHasPredicted(!!predictionData.prediction);
      }
    } catch (error) {
      console.error("Failed to check user status:", error);
    }
  };

  const handleCheckInSuccess = () => {
    setHasCheckedIn(true);
    fetchMatches();
  };

  const handlePredictionSuccess = () => {
    setHasPredicted(true);
  };

  const displayMatch = liveMatch || nextMatch;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arsenal-red to-arsenal-navy flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-arsenal-red via-arsenal-red to-arsenal-navy">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Arsenal Fan Platform</h1>
          <div className="flex gap-2">
            {user ? (
              <>
                <Button onClick={() => router.push("/profile")} variant="outline" className="text-white border-white hover:bg-white/20">
                  Profile
                </Button>
                <Button onClick={() => router.push("/fixtures")} variant="outline" className="text-white border-white hover:bg-white/20">
                  Fixtures
                </Button>
                <Button onClick={() => router.push("/leaderboards")} variant="outline" className="text-white border-white hover:bg-white/20">
                  Leaderboards
                </Button>
              </>
            ) : (
              <Button onClick={() => router.push("/auth/login")} variant="outline" className="text-white border-white hover:bg-white/20">
                Log In
              </Button>
            )}
          </div>
        </div>

        {/* Match Hero Section */}
        {displayMatch ? (
          <Card className="mb-8">
            <CardContent className="p-8">
              {liveMatch ? (
                // Live Match Display
                <div className="space-y-6">
                  <div className="text-center">
                    <Badge variant="destructive" className="mb-4 text-lg px-4 py-2">
                      🔴 LIVE
                    </Badge>
                    <h2 className="text-4xl font-bold mb-4">
                      Arsenal vs {liveMatch.opponentName}
                    </h2>
                    <div className="text-6xl font-bold mb-4">
                      {liveMatch.arsenalScore !== null ? liveMatch.arsenalScore : "-"}
                      {" - "}
                      {liveMatch.opponentScore !== null ? liveMatch.opponentScore : "-"}
                    </div>
                    <p className="text-xl text-muted-foreground mb-4">
                      {liveMatch.competitionName}
                    </p>
                  </div>

                  {/* Live Match Actions */}
                  {user && (
                    <div className="flex gap-4 justify-center">
                      {!hasCheckedIn && isCheckInWindowOpen(liveMatch.kickoffTime) && (
                        <Button
                          onClick={() => setShowCheckInModal(true)}
                          variant="arsenal"
                          size="lg"
                          className="text-xl px-8 py-6 animate-pulse"
                        >
                          CHECK IN NOW 🔥
                        </Button>
                      )}
                      {hasCheckedIn && (
                        <Badge variant="default" className="text-lg px-6 py-3">
                          ✅ Checked In
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Global Map for Live Match */}
                  <div className="mt-6">
                    <GlobalFanMap matchId={liveMatch.id} />
                  </div>
                </div>
              ) : nextMatch ? (
                // Next Match Display
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-sm uppercase text-muted-foreground mb-2">Next Match</h3>
                    <h2 className="text-4xl font-bold mb-4">
                      Arsenal vs {nextMatch.opponentName}
                    </h2>
                    <Badge variant={nextMatch.homeAway === "HOME" ? "arsenal" : "outline"} className="mb-4">
                      {nextMatch.homeAway}
                    </Badge>
                    <p className="text-xl mb-2">{nextMatch.competitionName}</p>
                    <p className="text-lg text-muted-foreground mb-4">
                      {formatMatchDate(nextMatch.kickoffTime)}
                    </p>
                    <div className="text-3xl font-bold text-arsenal-red mb-6">
                      ⏰ {getTimeUntilMatch(nextMatch.kickoffTime)}
                    </div>
                  </div>

                  {/* Match Actions */}
                  {user ? (
                    <div className="flex gap-4 justify-center flex-wrap">
                      {isCheckInWindowOpen(nextMatch.kickoffTime) ? (
                        <>
                          {!hasCheckedIn ? (
                            <Button
                              onClick={() => setShowCheckInModal(true)}
                              variant="arsenal"
                              size="lg"
                              className="text-xl px-8 py-6 animate-pulse"
                            >
                              CHECK IN NOW 🔥
                            </Button>
                          ) : (
                            <Badge variant="default" className="text-lg px-6 py-3">
                              ✅ Checked In
                            </Badge>
                          )}

                          {!hasPredicted && new Date() < new Date(nextMatch.kickoffTime) && (
                            <Button
                              onClick={() => setShowPredictionModal(true)}
                              variant="outline"
                              size="lg"
                              className="text-xl px-8 py-6"
                            >
                              🔮 Predict Score
                            </Button>
                          )}
                          {hasPredicted && (
                            <Badge variant="secondary" className="text-lg px-6 py-3">
                              ✅ Predicted
                            </Badge>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            Check-in opens 5 minutes before kickoff
                          </p>
                          {!hasPredicted && new Date() < new Date(nextMatch.kickoffTime) && (
                            <Button
                              onClick={() => setShowPredictionModal(true)}
                              variant="arsenal"
                              size="lg"
                            >
                              🔮 Predict the Score
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Button
                        onClick={() => router.push("/auth/login")}
                        variant="arsenal"
                        size="lg"
                        className="text-xl px-8 py-6"
                      >
                        Log In to Check In
                      </Button>
                    </div>
                  )}

                  {/* Show map if check-in window is open */}
                  {isCheckInWindowOpen(nextMatch.kickoffTime) && (
                    <div className="mt-6">
                      <GlobalFanMap matchId={nextMatch.id} />
                    </div>
                  )}
                </div>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">No upcoming matches</h2>
              <p className="text-muted-foreground">Check back soon for the next fixture!</p>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/fixtures")}>
            <CardHeader>
              <CardTitle className="text-2xl">📅 Fixtures</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">View upcoming Arsenal matches and set reminders</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/results")}>
            <CardHeader>
              <CardTitle className="text-2xl">📊 Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">See recent match results and your check-ins</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/leaderboards")}>
            <CardHeader>
              <CardTitle className="text-2xl">🏆 Leaderboards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Compete with fans worldwide</p>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold text-white mb-6 text-center">
            Platform Features
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-white">
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-xl font-semibold mb-2">✅ Virtual Match Check-ins</h4>
              <p className="text-white/80">Check in from anywhere in the world, 5 minutes before kickoff</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-xl font-semibold mb-2">🗺️ Global Fan Map</h4>
              <p className="text-white/80">See Arsenal fans worldwide in real-time on an interactive map</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-xl font-semibold mb-2">🏅 Badges & Achievements</h4>
              <p className="text-white/80">Collect unique badges for every match and unlock achievements</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-xl font-semibold mb-2">🔮 Match Predictions</h4>
              <p className="text-white/80">Predict scores before kickoff and earn points</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-xl font-semibold mb-2">📈 Personal Stats</h4>
              <p className="text-white/80">Track your journey with detailed stats and lucky charm tracking</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <h4 className="text-xl font-semibold mb-2">🏆 Leaderboards</h4>
              <p className="text-white/80">Compete globally, regionally, or with friends</p>
            </div>
          </div>

          {!user && (
            <div className="text-center mt-8">
              <Button onClick={() => router.push("/auth/login")} variant="arsenal" size="lg" className="text-xl px-8 py-6">
                Get Started - It's Free!
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCheckInModal && nextMatch && (
        <CheckInModal
          matchId={nextMatch.id}
          opponent={nextMatch.opponentName}
          onClose={() => setShowCheckInModal(false)}
          onSuccess={handleCheckInSuccess}
        />
      )}

      {showPredictionModal && nextMatch && (
        <PredictionModal
          matchId={nextMatch.id}
          opponent={nextMatch.opponentName}
          onClose={() => setShowPredictionModal(false)}
          onSuccess={handlePredictionSuccess}
        />
      )}
    </main>
  );
}
