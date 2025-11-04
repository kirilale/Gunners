"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

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

        <div className="text-center text-white mb-12">
          <h2 className="text-6xl font-bold mb-4">
            Unite with Gooners Worldwide 🔴⚪
          </h2>
          <p className="text-2xl mb-8">
            Check in to matches, earn badges, and compete on global leaderboards
          </p>
        </div>

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
    </main>
  );
}
