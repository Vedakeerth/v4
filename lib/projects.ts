import { unstable_cache } from 'next/cache';

export const getProjects = unstable_cache(
    async (limitCount: number = 10): Promise<Project[]> => {
        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            try {
                const snapshot = await adminDb.collection('projects')
                    .orderBy('createdAt', 'desc')
                    .limit(limitCount)
                    .get();
                return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => ({
                    id: doc.id,
                    ...doc.data()
                } as Project));
            } catch (error) {
                console.error('Error fetching projects from Firestore:', error);
                return [];
            }
        } else {
            const res = await fetch('/api/projects');
            const data = await res.json();
            return data.projects || [];
        }
    },
    ['projects-list'],
    { revalidate: 3600, tags: ['projects'] }
);

export const getProjectById = (id: string) => unstable_cache(
    async (): Promise<Project | undefined> => {
        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            const doc = await adminDb.collection('projects').doc(id).get();
            if (!doc.exists) return undefined;
            return { id: doc.id, ...doc.data() } as Project;
        } else {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            return data.project;
        }
    },
    [`project-${id}`],
    { revalidate: 3600, tags: [`project-${id}`] }
)();
