import { GET } from "../app/api/orders/route";

async function test() {
    try {
        console.log("Calling GET for orders...");
        const response = await GET();
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Data keys:", Object.keys(data));
        console.log("Data success:", data.success);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
