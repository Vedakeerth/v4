export async function verifyRecaptchaEnterprise(token: string, action: string = 'SUBMIT') {
  // Use a dedicated RECAPTCHA_API_KEY if available, otherwise fallback to the Firebase API key
  const apiKey = process.env.RECAPTCHA_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY; 
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const projectId = 'react-website-1776871293274';

  if (!apiKey || !siteKey) {
    console.error("Missing reCAPTCHA API keys");
    return false;
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
       return true;
    } else {
       console.error("reCAPTCHA validation failed:", data.tokenProperties?.invalidReason, data);
       return false;
    }
  } catch (error) {
     console.error("reCAPTCHA verification error:", error);
     return false;
  }
}
