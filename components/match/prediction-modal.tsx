"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PredictionModalProps {
  matchId: string;
  opponent: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PredictionModal({ matchId, opponent, onClose, onSuccess }: PredictionModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    predictedArsenalScore: 0,
    predictedOpponentScore: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          ...formData,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit prediction");
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
          <CardTitle>Predict the Score</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-lg font-semibold">Arsenal vs {opponent}</p>
              <p className="text-sm text-muted-foreground">Predict before kickoff!</p>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <label className="block text-sm font-medium mb-2">Arsenal</label>
                <Input
                  type="number"
                  min="0"
                  max="9"
                  value={formData.predictedArsenalScore}
                  onChange={(e) => setFormData({ ...formData, predictedArsenalScore: parseInt(e.target.value) || 0 })}
                  className="w-20 text-center text-2xl font-bold"
                  required
                />
              </div>

              <div className="text-3xl font-bold">-</div>

              <div className="text-center">
                <label className="block text-sm font-medium mb-2">{opponent}</label>
                <Input
                  type="number"
                  min="0"
                  max="9"
                  value={formData.predictedOpponentScore}
                  onChange={(e) => setFormData({ ...formData, predictedOpponentScore: parseInt(e.target.value) || 0 })}
                  className="w-20 text-center text-2xl font-bold"
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded text-sm">
              <p className="font-semibold mb-1">Scoring:</p>
              <ul className="text-xs space-y-1">
                <li>✅ Exact score: <strong>10 points</strong></li>
                <li>✅ Correct outcome (W/D/L): <strong>5 points</strong></li>
                <li>❌ Wrong prediction: <strong>0 points</strong></li>
              </ul>
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
                {loading ? "Submitting..." : "Submit Prediction"}
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
