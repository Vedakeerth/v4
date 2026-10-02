import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { Project } from '@/types';
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

export const getProjectBySeoSlug = (seoSlug: string) => unstable_cache(
    async (): Promise<Project | undefined> => {
        const { extractIdFromSlug } = await import('./seo-utils');
        const hashId = extractIdFromSlug(seoSlug);
        if (!hashId) return undefined;

        const projects = await getProjects();
        return projects.find(p => p.id && String(p.id).endsWith(hashId));
    },
    [`project-seo-${seoSlug}`],
    { revalidate: 60, tags: [`project-${seoSlug}`] } // ISR 60 as requested
)();

export const getProjectById = (id: string) => getProjectBySeoSlug(id);
