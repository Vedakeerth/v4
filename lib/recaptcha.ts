export async function verifyRecaptchaEnterprise(token: string, action: string = 'SUBMIT') {
  // Use a dedicated RECAPTCHA_API_KEY if available, otherwise fallback to the Firebase API key
  const apiKey = process.env.RECAPTCHA_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY; 
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const projectId = process.env.GOOGLE_PROJECT_ID || 'react-website-1776871293274';

  if (!apiKey || !siteKey) {
    console.error("[RECAPTCHA] Missing API keys in environment variables");
    return false;
  }

  // Bypass for local development to prevent blocking the checkout flow
  if (process.env.NODE_ENV === 'development') {
    console.log("[RECAPTCHA] Development mode detected: Bypassing strict verification for testing.");
    return true; 
  }

  try {
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: {
          token: token,
          expectedAction: action,
          siteKey: siteKey,
        }
      })
    });

    const data = await response.json();
    
    // Check if the token is valid
    if (data.tokenProperties?.valid) {
       // Typically, you might also want to check data.riskAnalysis.score >= 0.5
       const score = data.riskAnalysis?.score || 1.0;
       if (score < 0.3) {
         console.warn(`[RECAPTCHA] Low trust score: ${score} for action: ${action}`);
         // We allow it for now but log the warning
       }
       return true;
    } else {
       console.error("[RECAPTCHA] Validation failed:", data.tokenProperties?.invalidReason, data.error?.message || "");
       return false;
    }
  } catch (error) {
     console.error("[RECAPTCHA] Verification request error:", error);
     return false;
  }
}
