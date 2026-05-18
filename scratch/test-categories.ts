import { getCategories } from "../lib/categories";

async function test() {
    try {
        console.log("Fetching categories...");
        const cats = await getCategories();
        console.log("Categories:", cats);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
