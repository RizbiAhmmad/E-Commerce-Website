import React from "react";
import { useTheme } from "@/components/theme-provider";
import { Sun, Moon, MonitorSmartphone } from "lucide-react";

function ThemeChange() {
  const { theme, setTheme } = useTheme();
  const themes = ["light", "dark"];

  const handleThemeChange = () => {
    const newTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(newTheme);
  };
  return (
    <span className="flex items-center justify-center p-2 m-2 rounded-full bg-popover text-popover-foreground w-fit">
      <button onClick={handleThemeChange}>
        {theme === "dark" && (
          <h1>
            <Moon></Moon>
          </h1>
        )}
        {theme === "light" && (
          <h1>
            <Sun></Sun>
          </h1>
        )}
        {theme === "system" && (
          <h1>
            <MonitorSmartphone></MonitorSmartphone>
          </h1>
        )}
      </button>
    </span>
  );
}

export default ThemeChange;