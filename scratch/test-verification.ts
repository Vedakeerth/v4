import dotenv from 'dotenv';
import path from 'path';
import { verifyRecaptchaEnterprise } from '../lib/recaptcha';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Temporarily set NODE_ENV to production to avoid local bypass check
process.env.NODE_ENV = 'production';

async function run() {
  console.log("Running backend verification test with current keys...");
  console.log("NODE_ENV is set to:", process.env.NODE_ENV);
  
  // Call verifyRecaptchaEnterprise with a dummy token
  const result = await verifyRecaptchaEnterprise("dummy-test-token", "SUBMIT");
  
  console.log("Verification result:", result);
  console.log("If the terminal output shows: '[RECAPTCHA] Verifying token using Classic siteverify API.' and '[RECAPTCHA] Classic validation failed: [ \"invalid-input-response\" ]', then the classic verification logic was triggered correctly and successfully contacted Google reCAPTCHA servers!");
}

run();
