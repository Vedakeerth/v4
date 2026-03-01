export interface Project {
    id: number;
    title: string;
    description: string;
    image: string;
    images: string[];
    category: string;
    status: 'Ongoing' | 'Completed' | 'Conceptual';
    date: string;
    client?: string;
}

export async function getProjects(): Promise<Project[]> {
    if (typeof window === 'undefined') {
        try {
            const fs = await import('fs/promises');
            const path = await import('path');
            const projectsFile = path.join(process.cwd(), 'data', 'projects.json');
            const fileContents = await fs.readFile(projectsFile, 'utf8');
            return JSON.parse(fileContents);
        } catch (error) {
            return [];
        }
    } else {
        const res = await fetch('/api/projects');
        const data = await res.json();
        return data.projects || [];
    }
}

export async function saveProjects(projects: Project[]) {
    if (typeof window === 'undefined') {
        const fs = await import('fs/promises');
        const path = await import('path');
        const projectsFile = path.join(process.cwd(), 'data', 'projects.json');
        await fs.writeFile(projectsFile, JSON.stringify(projects, null, 2));
    }
}

export async function getProjectById(id: number): Promise<Project | undefined> {
    const projects = await getProjects();
    return projects.find((project) => project.id === id);
}

export async function addProject(project: Omit<Project, 'id'>): Promise<Project> {
    const projects = await getProjects();
    const newProject = { ...project, id: Date.now() };
    projects.push(newProject);
    await saveProjects(projects);
    return newProject;
}

export async function updateProject(id: number, updatedProject: Partial<Project>): Promise<Project | null> {
    const projects = await getProjects();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return null;

    projects[index] = { ...projects[index], ...updatedProject };
    await saveProjects(projects);
    return projects[index];
}

export async function deleteProject(id: number): Promise<boolean> {
    const projects = await getProjects();
    const filteredProjects = projects.filter((p) => p.id !== id);
    if (filteredProjects.length === projects.length) return false;

    await saveProjects(filteredProjects);
    return true;
}
