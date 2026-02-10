"use client";
import React, { useState } from "react";
import { ToastContainer } from "@/src/components/custom/modules/dashboard/my-attendance/ToastNotification";

interface ToastNotification {
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "error";
  duration?: number;
}

function ToastTestPage() {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addToast = (type: "info" | "warning" | "success" | "error", duration?: number) => {
    const messages = {
      info: {
        title: "Information ℹ️",
        message: "This is an informational message. It will auto-dismiss in 5 seconds.",
      },
      warning: {
        title: "Warning ⚠️",
        message: "Your shift ends in 5 minutes. Time to wrap up!",
      },
      success: {
        title: "Success ✅",
        message: "Your punch-out was recorded successfully!",
      },
      error: {
        title: "Overtime Alert! 🚨",
        message: "You've worked past your scheduled time. Please punch out now!",
      },
    };

    const newToast: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random()}`,
      title: messages[type].title,
      message: messages[type].message,
      type,
      duration: duration !== undefined ? duration : (type === "error" ? undefined : 5000),
    };

    setNotifications((prev) => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setNotifications((prev) => prev.filter((toast) => toast.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const addMultipleToasts = () => {
    addToast("info");
    setTimeout(() => addToast("warning"), 500);
    setTimeout(() => addToast("success"), 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Toast Container */}
      <ToastContainer notifications={notifications} onDismiss={dismissToast} />

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Toast Notification Tester
          </h1>
          <p className="text-gray-600 mb-8">
            Test different types of toast notifications and their behaviors
          </p>

          {/* Status Display */}
          <div className="bg-gray-50 rounded-lg p-4 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Active Notifications
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {notifications.length}
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Test Buttons */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Basic Toast Types
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => addToast("info")}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Info Toast
                </button>
                <button
                  onClick={() => addToast("warning")}
                  className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Warning Toast
                </button>
                <button
                  onClick={() => addToast("success")}
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Success Toast
                </button>
                <button
                  onClick={() => addToast("error")}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-md hover:shadow-lg"
                >
                  Error Toast
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Custom Duration Tests
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => addToast("info", 2000)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Quick (2s)
                </button>
                <button
                  onClick={() => addToast("warning", 10000)}
                  className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
                >
                  Medium (10s)
                </button>
                <button
                  onClick={() => addToast("error", undefined)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  No Auto-Dismiss
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Advanced Tests
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={addMultipleToasts}
                  className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  Multiple Toasts
                </button>
                <button
                  onClick={() => {
                    for (let i = 0; i < 5; i++) {
                      setTimeout(() => {
                        addToast(
                          ["info", "warning", "success", "error"][
                            Math.floor(Math.random() * 4)
                          ] as any
                        );
                      }, i * 300);
                    }
                  }}
                  className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium"
                >
                  Spam Test (5 Toasts)
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              💡 Testing Instructions
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Basic Types:</strong> Test each color and icon style
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Auto-Dismiss:</strong> Info, Warning, Success auto-dismiss after 5s
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Manual Dismiss:</strong> Click the X button to close any toast
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Error Toasts:</strong> Red error toasts don't auto-dismiss (require manual close)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Stacking:</strong> Multiple toasts stack vertically in top-right corner
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>
                  <strong>Animations:</strong> Watch for smooth slide-in and slide-out effects
                </span>
              </li>
            </ul>
          </div>

          {/* Active Toasts List */}
          {notifications.length > 0 && (
            <div className="mt-8 bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Active Toasts ({notifications.length})
              </h3>
              <div className="space-y-2">
                {notifications.map((toast, index) => (
                  <div
                    key={toast.id}
                    className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {toast.type === "info" && "ℹ️"}
                        {toast.type === "warning" && "⚠️"}
                        {toast.type === "success" && "✅"}
                        {toast.type === "error" && "🚨"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {toast.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {toast.duration ? `${toast.duration / 1000}s auto-dismiss` : "Manual dismiss only"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => dismissToast(toast.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ToastTestPage;