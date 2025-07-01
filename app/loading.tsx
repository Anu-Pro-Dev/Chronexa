"use client";
import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "@/animations/hourglass-blue.json";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center h-dvh items-center">
      <div style={{ width: 50}}>
        <Lottie animationData={loadingAnimation} loop={true} />
      </div>
    </div>
  );
};

export default Loading;
