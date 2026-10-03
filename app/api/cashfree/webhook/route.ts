import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { FieldValue, Transaction } from "firebase-admin/firestore";
import crypto from "crypto";
import { decrypt } from "@/lib/crypto";

const CASHFREE_SECRET_KEY = decrypt(process.env.CASHFREE_SECRET_KEY || "");

export async function POST(req: Request) {
    try {
        const bodyText = await req.text();
        const headersList = req.headers;
        const timestamp = headersList.get('x-webhook-timestamp');
        const signature = headersList.get('x-webhook-signature');

        // Allow ping testing from the Cashfree Dashboard
        if (!bodyText || Object.keys(bodyText).length === 0 || bodyText === '{"test":true}') {
            return NextResponse.json({ status: "success", message: "Webhook endpoint reachable" }, { status: 200 });
        }

        if (!timestamp || !signature) {
            return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
        }

        // Verify Signature Manually using HMAC SHA256
        const generatedSignature = crypto
            .createHmac("sha256", CASHFREE_SECRET_KEY)
            .update(timestamp + bodyText)
            .digest("base64");

        if (generatedSignature !== signature) {
            console.error("Signature verification failed");
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        const body = JSON.parse(bodyText);

        const eventType = body?.type;
        const eventData = body?.data;
        const orderInfo = eventData?.order;
        const paymentInfo = eventData?.payment;

        if (!orderInfo || !orderInfo.order_id) {
            return NextResponse.json({ status: "success", message: "Ignored (no order info)" }, { status: 200 });
        }

        const orderId = orderInfo.order_id;
        const orderRef = adminDb.collection("orders").doc(orderId);

        // Run transaction for idempotency
        await adminDb.runTransaction(async (transaction: Transaction) => {
            const orderDoc = (await transaction.get(orderRef)) as any;
            if (!orderDoc.exists) {
                console.log(`Order not found: ${orderId}`);
                return;
            }

            const currentData = orderDoc.data();
            
            // Check if we already processed a success webhook
            if (currentData?.payment?.status === "SUCCESS" || currentData?.paymentStatus === "paid") {
                console.log(`Order ${orderId} already marked as paid.`);
                return;
            }

            const paymentData = {
                provider: "cashfree",
                cashfreeOrderId: orderId,
                cashfreePaymentId: paymentInfo?.cf_payment_id || null,
                amount: paymentInfo?.payment_amount || 0,
                method: paymentInfo?.payment_group || null,
                updatedAt: FieldValue.serverTimestamp()
            };

            switch(eventType) {
                case "PAYMENT_SUCCESS_WEBHOOK":
                    console.log(`Payment Success for order: ${orderId}`);
                    transaction.update(orderRef, {
                        paymentStatus: "paid",
                        status: "CONFIRMED",
                        paymentId: paymentInfo?.cf_payment_id || null,
                        paidAt: new Date().toISOString(),
                        payment: {
                            ...paymentData,
                            status: "SUCCESS"
                        }
                    });
                    break;

                case "PAYMENT_FAILED_WEBHOOK":
                    console.log(`Payment Failed for order: ${orderId}`);
                    transaction.update(orderRef, {
                        payment: {
                            ...paymentData,
                            status: "FAILED"
                        }
                    });
                    break;
                    
                case "PAYMENT_USER_DROPPED_WEBHOOK":
                    console.log(`User Dropped Payment for order: ${orderId}`);
                    transaction.update(orderRef, {
                        payment: {
                            ...paymentData,
                            status: "USER_DROPPED"
                        }
                    });
                    break;
                    
                default:
                    console.log("Received unhandled webhook event:", eventType);
            }
        });

        // Cashfree expects a 200 OK response quickly
        return NextResponse.json({ status: "success" }, { status: 200 });
    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ status: "error", message: "Webhook processing failed" }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ status: "success", message: "Webhook endpoint is active" }, { status: 200 });
}
