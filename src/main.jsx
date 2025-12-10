import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./routes/router.jsx";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import AuthProvider from "./provider/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const GTMProvider = ({ children }) => {

  useEffect(() => {
    fetch("/gtm")
      .then(res => res.json())
      .then(data => {
        if (!data?.enableGtm || !data?.gtmId) return;

        // prevent duplicate load
        if (window.gtmLoaded) return;
        window.gtmLoaded = true;

        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${data.gtmId}`;
        document.head.appendChild(script);

        // optional noscript fallback
        const noscript = document.createElement("noscript");
        noscript.innerHTML = `
          <iframe src="https://www.googletagmanager.com/ns.html?id=${data.gtmId}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        `;
        document.body.appendChild(noscript);
      })
      .catch(err => console.error("GTM Load Error:", err));
  }, []);

  return children;
};


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <GTMProvider>
            <RouterProvider router={router} />
          </GTMProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
