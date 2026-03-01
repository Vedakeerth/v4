"use client";

import { useEffect } from "react";

export default function FaviconSwitcher() {
  useEffect(() => {
    const updateFavicon = () => {
      // Check if we're in dark mode (system preference or class on html)
      const isDarkMode =
        (window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches) ||
        document.documentElement.classList.contains("dark");

      // Find existing favicon link or create one
      let faviconLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      
      if (!faviconLink) {
        faviconLink = document.createElement("link");
        faviconLink.rel = "icon";
        document.head.appendChild(faviconLink);
      }

      // Set the appropriate favicon based on theme
      if (isDarkMode) {
        faviconLink.href = "/images/tag-w.png";
      } else {
        faviconLink.href = "/images/tag-b.png";
      }
    };

    // Set initial favicon
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
