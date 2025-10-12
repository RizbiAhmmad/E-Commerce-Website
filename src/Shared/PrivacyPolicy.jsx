import React, { useEffect, useState } from "react";
import axios from "axios";

const PrivacyPolicy = () => {
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    axios
      .get("https://api.sports.bangladeshiit.com/policies")
      .then((res) => {
        const activePolicy = res.data.find(
          (p) => p.title === "Privacy Policy" && p.status === "active"
        );
        setPolicy(activePolicy);
      })
      .catch((err) => console.error("❌ Privacy Policy Fetch Error:", err));
  }, []);

  if (!policy) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
        No active Privacy Policy available.
      </div>
    );
  }

  return (
    <div className="max-w-4xl py-24 px-6 mx-auto bg-white rounded-lg shadow">
      <h1 className="mb-4 text-3xl font-bold text-center">{policy.title}</h1>
      <p className="text-gray-700 leading-7 whitespace-pre-line">
        {policy.content}
      </p>
    </div>
  );
};

export default PrivacyPolicy;
