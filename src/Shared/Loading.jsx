import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-[300px]">
      <div className="w-16 h-16 border-4 border-cyan-500 border-dashed rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
