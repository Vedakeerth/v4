"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";

interface RecaptchaProps {
  onChange: (token: string | null) => void;
  className?: string;
  action?: string;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function Recaptcha({ onChange, className, action = 'SUBMIT' }: RecaptchaProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const isEnterprise = process.env.NEXT_PUBLIC_RECAPTCHA_IS_ENTERPRISE === 'true';
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || !scriptLoaded) return;
    
    let interval: NodeJS.Timeout;
    
    const executeRecaptcha = async () => {
      try {
        if (window.grecaptcha) {
          if (isEnterprise && window.grecaptcha.enterprise) {
            window.grecaptcha.enterprise.ready(async () => {
              const token = await window.grecaptcha.enterprise.execute(siteKey, { action });
              onChange(token);
            });
          } else if (!isEnterprise) {
            window.grecaptcha.ready(async () => {
              const token = await window.grecaptcha.execute(siteKey, { action });
              onChange(token);
            });
          }
        }
      } catch (error) {
        console.error("reCAPTCHA execution error:", error);
      }
    };

    // Execute immediately once loaded
    executeRecaptcha();
    
    // Refresh token every 110 seconds (tokens expire in 120s)
    interval = setInterval(executeRecaptcha, 110000);

    return () => clearInterval(interval);
  }, [siteKey, scriptLoaded, action, onChange, isEnterprise]);

  if (!siteKey) {
    console.error("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is missing in environment variables.");
    return (
      <div className="text-red-500 text-sm font-semibold p-2 border border-red-500 rounded bg-red-50 dark:bg-red-950/20">
        reCAPTCHA Configuration Error: Missing Site Key
      </div>
    );
  }

  const scriptSrc = isEnterprise
    ? `https://www.google.com/recaptcha/enterprise.js?render=${siteKey}`
    : `https://www.google.com/recaptcha/api.js?render=${siteKey}`;

  return (
    <div className={className}>
      <Script 
        src={scriptSrc}
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div className="text-[10px] text-slate-400 mt-2 text-center font-medium">
        Protected by {isEnterprise ? "reCAPTCHA Enterprise" : "reCAPTCHA v3"}
      </div>
    </div>
  );
}
