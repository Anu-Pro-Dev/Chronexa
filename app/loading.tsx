import { Spinner } from "@/components/ui/spinner";
import React from "react";

const Loading = () => {
  return (
    <div className="flex flex-col justify-center h-dvh items-center">
      <Spinner />
    </div>
  );
};

export default Loading;
