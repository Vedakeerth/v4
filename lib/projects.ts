import { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin';

export interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
    images: string[];
    category: string;
    status: 'Ongoing' | 'Completed' | 'Conceptual';
    date: string;
    client?: string;
    createdAt?: string;
}

export async function getProjects(): Promise<Project[]> {
    if (typeof window === 'undefined') {
        try {
            const snapshot = await adminDb.collection('projects').orderBy('createdAt', 'desc').get();
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
}

export async function getProjectById(id: string): Promise<Project | undefined> {
    if (typeof window === 'undefined') {
        const doc = await adminDb.collection('projects').doc(id).get();
        if (!doc.exists) return undefined;
        return { id: doc.id, ...doc.data() } as Project;
    } else {
        const res = await fetch(`/api/projects/${id}`);
        const data = await res.json();
        return data.project;
    }
}
// Note: POST/PUT/DELETE are handled by the API routes now
