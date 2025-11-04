"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    locationCountry: "",
    locationCity: "",
    favoritePlayer: "",
    supporterSince: new Date().getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-arsenal-red to-arsenal-navy flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription>Tell us about yourself to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="gooner123"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  minLength={3}
                  maxLength={20}
                />
                <p className="text-xs text-muted-foreground mt-1">3-20 characters, unique</p>
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-medium mb-2">
                  Display Name
                </label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  maxLength={50}
                />
              </div>

              <div>
                <label htmlFor="locationCountry" className="block text-sm font-medium mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <Input
                  id="locationCountry"
                  type="text"
                  placeholder="United Kingdom"
                  value={formData.locationCountry}
                  onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                  required
                />
              </div>

              <div>
                <label htmlFor="locationCity" className="block text-sm font-medium mb-2">
                  City
                </label>
                <Input
                  id="locationCity"
                  type="text"
                  placeholder="London"
                  value={formData.locationCity}
                  onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="favoritePlayer" className="block text-sm font-medium mb-2">
                  Favorite Arsenal Player
                </label>
                <Input
                  id="favoritePlayer"
                  type="text"
                  placeholder="Bukayo Saka"
                  value={formData.favoritePlayer}
                  onChange={(e) => setFormData({ ...formData, favoritePlayer: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="supporterSince" className="block text-sm font-medium mb-2">
                  Arsenal Supporter Since
                </label>
                <Input
                  id="supporterSince"
                  type="number"
                  min="1886"
                  max={new Date().getFullYear()}
                  value={formData.supporterSince}
                  onChange={(e) => setFormData({ ...formData, supporterSince: parseInt(e.target.value) })}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="arsenal"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
