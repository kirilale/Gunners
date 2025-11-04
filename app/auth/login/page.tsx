"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const errorParam = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send magic link");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-arsenal-red to-arsenal-navy flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Arsenal Fan Platform</CardTitle>
          <CardDescription>Sign in to check in to matches and compete with Gooners worldwide</CardDescription>
        </CardHeader>
        <CardContent>
          {errorParam && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errorParam === "invalid_token" && "Invalid or expired magic link"}
              {errorParam === "expired_token" && "Magic link has expired. Please request a new one."}
              {errorParam === "user_not_found" && "User not found"}
              {errorParam === "verification_failed" && "Verification failed. Please try again."}
            </div>
          )}

          {sent ? (
            <div className="text-center space-y-4">
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-2">Check your email!</h3>
                <p className="text-green-700">
                  We've sent a magic link to <strong>{email}</strong>
                </p>
                <p className="text-sm text-green-600 mt-2">
                  Click the link in your email to sign in. The link expires in 15 minutes.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
                className="w-full"
              >
                Send another link
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
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
                {loading ? "Sending..." : "Send Magic Link"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>No password needed! We'll email you a secure link.</p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
