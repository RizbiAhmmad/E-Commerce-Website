import React from "react";
import Lottie from "lottie-react";
import loading from "../../src/assets/loading.json"
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Lottie animationData={loading} loop={true} />
    </div>
  );
};

export default Loading;
