"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { DeleteAccountModal } from "@/components/settings/delete-account-modal";

interface UserSettings {
  emailNotifications: {
    matchReminders: boolean;
    badgeEarned: boolean;
    achievementUnlocked: boolean;
    weeklyRecap: boolean;
    fixtureUpdates: boolean;
  };
  pushNotifications: {
    matchReminders: boolean;
    badgeEarned: boolean;
    achievementUnlocked: boolean;
    liveMatchUpdates: boolean;
  };
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  spoilerMode: boolean;
  profileVisibility: "PUBLIC" | "FRIENDS" | "PRIVATE";
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
    fetchUserProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/user/settings");
      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }
      const data = await response.json();
      setSettings(data.settings);
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserEmail(data.profile.email);
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setSaveMessage("Settings saved successfully!");
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage("Failed to save settings. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      setSaveMessage("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/delete", {
        method: "POST",
      });

      if (response.ok) {
        // Redirect to homepage after account deletion
        router.push("/");
      } else {
        throw new Error("Failed to delete account");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      throw error;
    }
  };

  const handleExportData = async () => {
    try {
      const response = await fetch("/api/user/export");

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      // Download the JSON file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `arsenal-fan-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
      setSaveMessage("Failed to export data. Please try again.");
    }
  };

  const updateEmailNotification = (key: string, value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      emailNotifications: {
        ...settings.emailNotifications,
        [key]: value,
      },
    });
  };

  const updatePushNotification = (key: string, value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      pushNotifications: {
        ...settings.pushNotifications,
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arsenal-red to-arsenal-navy flex items-center justify-center">
        <div className="text-white text-2xl">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-arsenal-red to-arsenal-navy flex items-center justify-center">
        <div className="text-white text-2xl">Failed to load settings</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-arsenal-red via-arsenal-red to-arsenal-navy">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
            <p className="text-white/80">Manage your preferences and account</p>
          </div>
          <Button
            onClick={() => router.push("/profile")}
            variant="outline"
            className="text-white border-white hover:bg-white/20"
          >
            Back to Profile
          </Button>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow">
            <p className={saveMessage.includes("success") ? "text-green-600" : "text-red-600"}>
              {saveMessage}
            </p>
          </div>
        )}

        {/* Email Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Choose what updates you want to receive via email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-match-reminders" className="font-medium">Match Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified before upcoming matches</p>
              </div>
              <Switch
                id="email-match-reminders"
                checked={settings.emailNotifications.matchReminders}
                onCheckedChange={(checked) => updateEmailNotification("matchReminders", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-badge" className="font-medium">Badge Earned</Label>
                <p className="text-sm text-muted-foreground">Get notified when you earn a new badge</p>
              </div>
              <Switch
                id="email-badge"
                checked={settings.emailNotifications.badgeEarned}
                onCheckedChange={(checked) => updateEmailNotification("badgeEarned", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-achievement" className="font-medium">Achievement Unlocked</Label>
                <p className="text-sm text-muted-foreground">Get notified when you unlock achievements</p>
              </div>
              <Switch
                id="email-achievement"
                checked={settings.emailNotifications.achievementUnlocked}
                onCheckedChange={(checked) => updateEmailNotification("achievementUnlocked", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-weekly" className="font-medium">Weekly Recap</Label>
                <p className="text-sm text-muted-foreground">Receive weekly summaries of your activity</p>
              </div>
              <Switch
                id="email-weekly"
                checked={settings.emailNotifications.weeklyRecap}
                onCheckedChange={(checked) => updateEmailNotification("weeklyRecap", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-fixtures" className="font-medium">Fixture Updates</Label>
                <p className="text-sm text-muted-foreground">Get notified about schedule changes</p>
              </div>
              <Switch
                id="email-fixtures"
                checked={settings.emailNotifications.fixtureUpdates}
                onCheckedChange={(checked) => updateEmailNotification("fixtureUpdates", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Push Notifications</CardTitle>
            <CardDescription>Manage real-time notifications (requires permission)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-3 rounded text-sm text-blue-800 mb-4">
              Push notifications are currently in development and will be available soon.
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div>
                <Label htmlFor="push-match-reminders" className="font-medium">Match Reminders</Label>
                <p className="text-sm text-muted-foreground">Get push notifications before matches</p>
              </div>
              <Switch
                id="push-match-reminders"
                checked={settings.pushNotifications.matchReminders}
                onCheckedChange={(checked) => updatePushNotification("matchReminders", checked)}
                disabled
              />
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div>
                <Label htmlFor="push-badge" className="font-medium">Badge Earned</Label>
                <p className="text-sm text-muted-foreground">Get instant push when earning badges</p>
              </div>
              <Switch
                id="push-badge"
                checked={settings.pushNotifications.badgeEarned}
                onCheckedChange={(checked) => updatePushNotification("badgeEarned", checked)}
                disabled
              />
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div>
                <Label htmlFor="push-achievement" className="font-medium">Achievement Unlocked</Label>
                <p className="text-sm text-muted-foreground">Get push when unlocking achievements</p>
              </div>
              <Switch
                id="push-achievement"
                checked={settings.pushNotifications.achievementUnlocked}
                onCheckedChange={(checked) => updatePushNotification("achievementUnlocked", checked)}
                disabled
              />
            </div>

            <div className="flex items-center justify-between opacity-50">
              <div>
                <Label htmlFor="push-live" className="font-medium">Live Match Updates</Label>
                <p className="text-sm text-muted-foreground">Get real-time score updates during matches</p>
              </div>
              <Switch
                id="push-live"
                checked={settings.pushNotifications.liveMatchUpdates}
                onCheckedChange={(checked) => updatePushNotification("liveMatchUpdates", checked)}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quiet Hours</CardTitle>
            <CardDescription>Set times when you don't want to receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quiet-start">Start Time</Label>
                <Input
                  id="quiet-start"
                  type="time"
                  value={settings.quietHoursStart || ""}
                  onChange={(e) => setSettings({ ...settings, quietHoursStart: e.target.value || null })}
                />
              </div>
              <div>
                <Label htmlFor="quiet-end">End Time</Label>
                <Input
                  id="quiet-end"
                  type="time"
                  value={settings.quietHoursEnd || ""}
                  onChange={(e) => setSettings({ ...settings, quietHoursEnd: e.target.value || null })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              During quiet hours, you won't receive any notifications except for urgent match updates.
            </p>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Privacy & Display</CardTitle>
            <CardDescription>Control your privacy and how others see your activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="spoiler-mode" className="font-medium">Spoiler Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Hide match scores until you've watched the game
                </p>
              </div>
              <Switch
                id="spoiler-mode"
                checked={settings.spoilerMode}
                onCheckedChange={(checked) => setSettings({ ...settings, spoilerMode: checked })}
              />
            </div>

            <div>
              <Label className="font-medium mb-3 block">Profile Visibility</Label>
              <div className="space-y-2">
                <button
                  onClick={() => setSettings({ ...settings, profileVisibility: "PUBLIC" })}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                    settings.profileVisibility === "PUBLIC"
                      ? "border-arsenal-red bg-arsenal-red/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Public</div>
                      <div className="text-sm text-muted-foreground">
                        Anyone can see your profile and stats
                      </div>
                    </div>
                    {settings.profileVisibility === "PUBLIC" && (
                      <Badge variant="arsenal">Active</Badge>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, profileVisibility: "FRIENDS" })}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                    settings.profileVisibility === "FRIENDS"
                      ? "border-arsenal-red bg-arsenal-red/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Friends Only</div>
                      <div className="text-sm text-muted-foreground">
                        Only your friends can see your profile (Coming soon)
                      </div>
                    </div>
                    {settings.profileVisibility === "FRIENDS" && (
                      <Badge variant="arsenal">Active</Badge>
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setSettings({ ...settings, profileVisibility: "PRIVATE" })}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                    settings.profileVisibility === "PRIVATE"
                      ? "border-arsenal-red bg-arsenal-red/10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Private</div>
                      <div className="text-sm text-muted-foreground">
                        Your profile is hidden from everyone
                      </div>
                    </div>
                    {settings.profileVisibility === "PRIVATE" && (
                      <Badge variant="arsenal">Active</Badge>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mb-6">
          <Button
            onClick={handleSave}
            disabled={saving}
            size="lg"
            className="w-full bg-arsenal-red hover:bg-arsenal-red/90 text-white"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>

        {/* Data & Privacy */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Manage your personal data and GDPR rights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Download My Data</h4>
                <p className="text-sm text-muted-foreground">
                  Export all your data in JSON format (GDPR Article 15)
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleExportData}
              >
                Download Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 mb-12">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions - proceed with caution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-red-600">Delete Account</h4>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          userEmail={userEmail}
        />
      )}
    </main>
  );
}
