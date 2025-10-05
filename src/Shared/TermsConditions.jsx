import React, { useEffect, useState } from "react";
import axios from "axios";

const TermsConditions = () => {
  const [policy, setPolicy] = useState(null);

  useEffect(() => {
    axios
      .get("https://e-commerce-server-api.onrender.com/policies")
      .then((res) => {
        const activePolicy = res.data.find(
          (p) => p.title === "Terms & Conditions" && p.status === "active"
        );
        setPolicy(activePolicy);
      })
      .catch((err) => console.error("❌ Terms Policy Fetch Error:", err));
  }, []);

  if (!policy) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] text-gray-500">
        No active Terms & Conditions available.
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

export default TermsConditions;
