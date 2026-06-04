const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.RECAPTCHA_API_KEY;
const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const projectId = process.env.GOOGLE_PROJECT_ID;
const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

console.log("Keys loaded:");
console.log("- RECAPTCHA_API_KEY:", apiKey ? `${apiKey.substring(0, 8)}...` : 'undefined');
console.log("- NEXT_PUBLIC_RECAPTCHA_SITE_KEY:", siteKey ? `${siteKey.substring(0, 8)}...` : 'undefined');
console.log("- GOOGLE_PROJECT_ID:", projectId);
console.log("- NEXT_PUBLIC_FIREBASE_API_KEY:", firebaseApiKey ? `${firebaseApiKey.substring(0, 8)}...` : 'undefined');

async function testEnterprise(keyToUse) {
  console.log(`\n--- Testing Enterprise Assessments API using key: ${keyToUse ? keyToUse.substring(0, 8) : 'undefined'}... ---`);
  const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectId}/assessments?key=${keyToUse}`;
  try {
    const response = await globalThis.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: {
          token: "dummy_token_for_testing",
          expectedAction: "SUBMIT",
          siteKey: siteKey,
        }
      })
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

async function testClassic() {
  console.log("\n--- Testing Classic Siteverify API ---");
  const url = "https://www.google.com/recaptcha/api/siteverify";
  try {
    const response = await globalThis.fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: apiKey || '',
        response: 'dummy_token_for_testing'
      })
    });
    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

async function run() {
  await testEnterprise(apiKey);
  await testEnterprise(firebaseApiKey);
  await testClassic();
}

run();
