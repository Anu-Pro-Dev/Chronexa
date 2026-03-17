"use client";

import React from "react";
import { X, CheckCircle } from "lucide-react";

interface PasswordResetSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  autoCloseDelay?: number; // in milliseconds, set to 0 to disable auto-close
}

export default function PasswordResetSuccessModal({
  isOpen,
  onClose,
  email = "support@chronexa.ai",
  autoCloseDelay = 3000,
}: PasswordResetSuccessModalProps) {
  const [isVisible, setIsVisible] = React.useState(isOpen);

  React.useEffect(() => {
    setIsVisible(isOpen);

    if (isOpen && autoCloseDelay > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  const handleBackdropClick = () => {
    handleClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md mx-4 transform transition-all duration-300 animate-in fade-in scale-in">
        <div className="rounded-2xl bg-white shadow-2xl overflow-hidden">
          <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-blue-600" />

          <div className="p-8">
            <button
              onClick={handleClose}
              className="absolute top-5 right-5 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} className="text-gray-600" />
            </button>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
              Password Reset Successful
            </h2>

            <p className="text-center text-gray-600 text-sm mb-6">
              A new password has been generated and sent to the user&apos;s email.
            </p>

            <div className="mb-6 p-4 rounded-lg border-2 border-gray-200 bg-gray-50">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Sent To
              </p>
              <p className="text-sm font-semibold text-gray-900 break-words select-all">
                {email}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full px-4 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors active:scale-[0.98]"
            >
              Done
            </button>

            <p className="text-center text-xs text-gray-400 mt-4">
              The new password has been sent to the registered email address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}