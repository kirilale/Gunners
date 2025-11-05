"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationAutocomplete } from "@/components/ui/location-autocomplete";

interface CheckInModalProps {
  matchId: string;
  opponent: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckInModal({ matchId, opponent, onClose, onSuccess }: CheckInModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    locationCountry: "",
    locationCity: "",
    statusMessage: "",
    locationLat: undefined as number | undefined,
    locationLng: undefined as number | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/check-ins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check in");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Check In to Arsenal vs {opponent}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <LocationAutocomplete
                id="country"
                type="country"
                placeholder="United Kingdom"
                value={formData.locationCountry}
                onChange={(value) => setFormData({ ...formData, locationCountry: value })}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Start typing to search</p>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <LocationAutocomplete
                id="city"
                type="city"
                placeholder="London"
                value={formData.locationCity}
                onChange={(value, lat, lng) =>
                  setFormData({ ...formData, locationCity: value, locationLat: lat, locationLng: lng })
                }
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Start typing to search</p>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Status Message (optional)
              </label>
              <Input
                id="message"
                type="text"
                placeholder="COYG! 🔴⚪"
                value={formData.statusMessage}
                onChange={(e) => setFormData({ ...formData, statusMessage: e.target.value })}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground mt-1">Max 100 characters</p>
            </div>

            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                type="submit"
                variant="arsenal"
                className="flex-1"
                disabled={loading}
              >
                {loading ? "Checking In..." : "Check In"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
