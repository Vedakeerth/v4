"use client";

import { useEffect } from "react";

export default function FaviconSwitcher() {
  useEffect(() => {
    const updateFavicon = () => {
      // Check for dark mode
      const isDarkMode =
        (window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches) ||
        document.documentElement.classList.contains("dark");

      const iconPath = isDarkMode
        ? "/images/favicon-wing.png"
        : "/images/favicon-wing-1.png";

      // Find ALL icon link elements (Next.js can create multiple)
      const faviconLinks = document.querySelectorAll(
        "link[rel*='icon'], link[rel='apple-touch-icon']"
      );

      if (faviconLinks.length > 0) {
        faviconLinks.forEach((link) => {
          (link as HTMLLinkElement).href = iconPath;
        });
      } else {
        // Fallback: create one if none found
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = iconPath;
        document.head.appendChild(link);
      }
    };

    // Set initial favicon
    setTimeout(updateFavicon, 500);
    updateFavicon();

    // Listen for theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleThemeChange = () => {
      updateFavicon();
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleThemeChange);
    }

    // Also watch for class changes on html element (in case theme is toggled manually)
    const observer = new MutationObserver(() => {
      updateFavicon();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleThemeChange);
      } else {
        mediaQuery.removeListener(handleThemeChange);
      }
      observer.disconnect();
    };
  }, []);

  return null;
}
