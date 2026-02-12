"use client";
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/src/providers/LanguageProvider";

export interface NotificationSettings {
  enabled: boolean;
  browserNotifications: boolean;
  soundEnabled: boolean;
  notificationTimes: number[];
}

interface NotificationSettingsProps {
  onSettingsChange?: (settings: NotificationSettings) => void;
  initialSettings?: Partial<NotificationSettings>;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  enabled: true,
  browserNotifications: true,
  soundEnabled: true,
  notificationTimes: [30, 15, 5],
};

function NotificationSettingsPanel({
  onSettingsChange,
  initialSettings,
}: NotificationSettingsProps) {
  const { translations } = useLanguage();
  const t = translations?.modules?.settings || {};

  const [settings, setSettings] = useState<NotificationSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");

  useEffect(() => {
    const saved = localStorage.getItem("punchNotificationSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
  }, []);

  const updateSettings = (updates: Partial<NotificationSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem("punchNotificationSettings", JSON.stringify(newSettings));
    onSettingsChange?.(newSettings);
  };

  const toggleTime = (minutes: number) => {
    const newTimes = settings.notificationTimes.includes(minutes)
      ? settings.notificationTimes.filter((t) => t !== minutes)
      : [...settings.notificationTimes, minutes].sort((a, b) => b - a);

    updateSettings({ notificationTimes: newTimes });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        updateSettings({ browserNotifications: false });
      }
      return permission;
    }
    return Notification.permission;
  };

  const testNotification = async () => {
    setTestStatus("testing");

    if (!("Notification" in window)) {
      alert("Your browser doesn't support notifications");
      setTestStatus("error");
      setTimeout(() => setTestStatus("idle"), 2000);
      return;
    }

    try {
      let permission = Notification.permission;
      
      if (permission === "default") {
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        const timestamp = Date.now();
        const notification = new Notification("Test Notification ✅", {
          body: "This is how your punch-out reminders will look!",
          icon: "/clock-icon.png",
          badge: "/badge-icon.png",
          tag: `test-notification-${timestamp}`,
          requireInteraction: false,
        });

        setTimeout(() => {
          notification.close();
        }, 5000);

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        setTestStatus("success");
        setTimeout(() => setTestStatus("idle"), 2000);

      } else if (permission === "denied") {
        alert(
          "Notifications are blocked. Please enable them in your browser settings:\n\n" +
          "Chrome/Edge: Settings → Privacy → Site Settings → Notifications\n" +
          "Firefox: Settings → Privacy → Permissions → Notifications\n" +
          "Safari: Preferences → Websites → Notifications"
        );
        setTestStatus("error");
        setTimeout(() => setTestStatus("idle"), 2000);
      }
    } catch (error) {
      console.error("Notification error:", error);
      setTestStatus("error");
      setTimeout(() => setTestStatus("idle"), 2000);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:text-primary-100 transition-colors"
        aria-label="Notification Settings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t?.notification_settings || "Notification Settings"}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {t?.enable_notifications || "Enable Notifications"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t?.receive_reminders || "Receive punch-out reminders"}
                  </p>
                </div>
                <button
                  onClick={() => updateSettings({ enabled: !settings.enabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enabled ? "bg-blue-600" : "bg-gray-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {settings.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t?.browser_notifications || "Browser Notifications"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t?.show_desktop_notifications || "Show desktop notifications"}
                      </p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!settings.browserNotifications) {
                          await requestNotificationPermission();
                        }
                        updateSettings({
                          browserNotifications: !settings.browserNotifications,
                        });
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.browserNotifications ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.browserNotifications ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t?.sound_notifications || "Sound Notifications"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t?.play_sound || "Play sound with notifications"}
                      </p>
                    </div>
                    <button
                      onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.soundEnabled ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.soundEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-3">
                      {t?.notify_before || "Notify me before punch-out"}
                    </p>
                    <div className="space-y-2">
                      {[30, 15, 10, 5].map((minutes) => (
                        <label
                          key={minutes}
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={settings.notificationTimes.includes(minutes)}
                            onChange={() => toggleTime(minutes)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">
                            {minutes} {t?.minutes || "minutes"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={testNotification}
                    disabled={testStatus === "testing"}
                    className={`w-full px-4 py-2 text-sm rounded-lg transition-all ${
                      testStatus === "success"
                        ? "bg-green-50 text-green-700 border border-green-600"
                        : testStatus === "error"
                        ? "bg-red-50 text-red-700 border border-red-600"
                        : testStatus === "testing"
                        ? "bg-gray-100 text-gray-400 border border-gray-300 cursor-not-allowed"
                        : "text-blue-600 border border-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    {testStatus === "testing" && "Sending..."}
                    {testStatus === "success" && "✓ Notification Sent!"}
                    {testStatus === "error" && "✗ Failed"}
                    {testStatus === "idle" && (t?.test_notification || "Test Notification")}
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default NotificationSettingsPanel;

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem("punchNotificationSettings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        console.error("Failed to parse settings:", e);
      }
    }
  }, []);

  return settings;
}