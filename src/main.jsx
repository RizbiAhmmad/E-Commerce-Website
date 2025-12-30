import { StrictMode, useLayoutEffect } from "react"; 
import { createRoot } from "react-dom/client";
import "./index.css";
import { router } from "./routes/router.jsx";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import AuthProvider from "./provider/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import useAxiosPublic from "@/Hooks/useAxiosPublic";

const queryClient = new QueryClient();

const GTMProvider = ({ children }) => {
  const axiosPublic = useAxiosPublic();

  useLayoutEffect(() => { 
    const loadGTM = async () => {
      try {
        const res = await axiosPublic.get("/gtm");
        const { gtmId, enableGtm } = res.data || {};

        if (!enableGtm || !gtmId) return;

        // prevent duplicate
        if (window.gtmLoaded) return;
        window.gtmLoaded = true;

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          "gtm.start": new Date().getTime(),
          event: "gtm.js",
        });

        // Load GTM script
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
        document.head.appendChild(script);

        // Add noscript fallback
        const noscript = document.createElement("noscript");
        noscript.innerHTML = `
          <iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
          height="0" width="0" style="display:none;visibility:hidden"></iframe>
        `;
        document.body.appendChild(noscript);

      } catch (err) {
        console.error("GTM Load Error:", err);
      }
    };

    loadGTM();
  }, [axiosPublic]);

  return children;
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <GTMProvider>
            <RouterProvider router={router} />
          </GTMProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
