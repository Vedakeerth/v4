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

        if (typeof window === 'undefined') {
            const { getAdminDb } = await import('./firebaseAdmin');
            const adminDb = await getAdminDb();
            
            // Search in 'projects' by 'hash' field
            const snapshot = await adminDb.collection('projects').where('hash', '==', hashId).limit(1).get();
            if (snapshot.empty) {
                // Fallback to searching by document ID if hashId matches length
                if (hashId.length >= 20) {
                    const doc = await adminDb.collection('projects').doc(hashId).get();
                    if (doc.exists) return { id: doc.id, ...doc.data() } as Project;
                }
                return undefined;
            }
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() } as Project;
        } else {
            const projects = await getProjects();
            return projects.find(p => p.id.endsWith(hashId));
        }
    },
    [`project-seo-${seoSlug}`],
    { revalidate: 60, tags: [`project-${seoSlug}`] } // ISR 60 as requested
)();

export const getProjectById = (id: string) => getProjectBySeoSlug(id);
