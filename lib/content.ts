export async function getPageContent(page: string) {
    if (typeof window === 'undefined') {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'data', 'pages', `${page}.json`);

        try {
            if (!fs.existsSync(filePath)) {
                console.warn(`Content file not found: ${filePath}`);
                return null;
            }

            const fileContents = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(fileContents);
        } catch (error) {
            console.error(`Error loading content for ${page}:`, error);
            return null;
        }
    } else {
        // On client, fetch from API
        const res = await fetch(`/api/content/${page}`);
        const data = await res.json();
        return data.content || null;
    }
}
