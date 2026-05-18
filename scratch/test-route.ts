import { GET } from "../app/api/categories/route";

async function test() {
    try {
        console.log("Calling GET...");
        const response = await GET();
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Data:", data);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
