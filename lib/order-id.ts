import { adminDb } from "./firebaseAdmin";

/**
 * Generate a sequential ID: {PREFIX}{MMYY}-{xxxx}
 * Uses IST (India Standard Time)
 */
export async function generateSequentialId(prefix: string = "VQ") {
  // Convert to IST (UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  
  const mm = String(istDate.getUTCMonth() + 1).padStart(2, '0');
  const yy = String(istDate.getUTCFullYear()).slice(-2);
  const datePrefix = `${mm}${yy}`;

  try {
    const counterRef = adminDb.collection("counters").doc("quotations");
    
    // Use a transaction to ensure atomic increment and sequential numbering
    const newSerial = await adminDb.runTransaction(async (transaction: any) => {
      const counterDoc = await transaction.get(counterRef);
      
      let nextSerial = 1; 
      
      if (counterDoc.exists) {
        const data = counterDoc.data();
        const currentSerial = data?.lastSerial || 0;
        nextSerial = currentSerial + 1;
      }
      
      transaction.set(counterRef, { lastSerial: nextSerial }, { merge: true });
      return nextSerial;
    }) as number;

    const paddedSerial = String(newSerial).padStart(4, '0');
    return `${prefix}${datePrefix}-${paddedSerial}`;
  } catch (error) {
    console.error("Error generating sequential number:", error);
    // Fallback to random if transaction fails
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${datePrefix}-${randomNum}`;
  }
}
