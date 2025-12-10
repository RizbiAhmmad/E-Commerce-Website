import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const GTMPageView = () => {
  const location = useLocation();

  useEffect(() => {
    if (!window.dataLayer) window.dataLayer = [];

    window.dataLayer.push({
      event: "page_view",
      page_path: location.pathname,
      page_title: document.title
    });
  }, [location]);

  return null;
};

export default GTMPageView;
