"use client";
import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "@/src/animations/hourglass-blue.json";

interface LoadingProps {
  message?: string;
  size?: number;
}

const LoadingAnimation: React.FC<LoadingProps> = ({ 
  message = "", 
  size = 30 
}) => (
  <>
    <div style={{ width: size }}>
      <Lottie animationData={loadingAnimation} loop={true} />
    </div>
    {message && (
      <p className="mt-4 text-lg font-semibold text-gray-600">
        {message}
      </p>
    )}
  </>
);

const Loading: React.FC<LoadingProps> = (props) => {
  return (
    <div className="flex flex-col justify-center h-dvh items-center">
      <LoadingAnimation size={30} {...props} />
    </div>
  );
};

export const LoadingOverlay: React.FC<LoadingProps> = (props) => {
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col justify-center items-center">
      <LoadingAnimation size={30} {...props} />
    </div>
  );
};

export const InlineLoading: React.FC<LoadingProps> = (props) => {
  return (
    <div className="flex flex-col justify-center items-center py-8">
      <LoadingAnimation size={30} {...props} />
    </div>
  );
};

export const ButtonLoading: React.FC<{ message?: string }> = ({ 
  message = "Processing..." 
}) => {
  return (
    <div className="flex items-center gap-2">
      <div style={{ width: 30 }}>
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
      <span>{message}</span>
    </div>
  );
};

export default Loading;