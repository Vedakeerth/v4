import fs from 'fs';
import path from 'path';

export type UserRole = 'SUPER_ADMIN' | 'USER';

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
}

const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

export function getUsers(): User[] {
    try {
        if (!fs.existsSync(usersFilePath)) {
            const dir = path.dirname(usersFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Super Admin should be created via env or manual seeding if file doesn't exist
            // For now, we assume the file is initialized as it was done in our setup.
            return [];
        }
        const fileContent = fs.readFileSync(usersFilePath, 'utf8');
        return JSON.parse(fileContent) as User[];
    } catch (error) {
        console.error("Error reading users:", error);
        return [];
    }
}

export function saveUsers(users: User[]): void {
    try {
        const dir = path.dirname(usersFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving users:", error);
    }
}

export function getUserByEmail(email: string): User | undefined {
    const users = getUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function addUser(user: Omit<User, 'id'>): { success: boolean; error?: string } {
    const users = getUsers();

    // Check if user already exists
    if (users.some(u => u.email.toLowerCase() === user.email.toLowerCase())) {
        return { success: false, error: "User already exists" };
    }

    // Enforce 5 user limit (excluding Super Admin)
    const regularUsers = users.filter(u => u.role === 'USER');
    if (user.role === 'USER' && regularUsers.length >= 5) {
        return { success: false, error: "Maximum limit of 5 users reached" };
    }

    const newUser = {
        ...user,
        id: `u_${Date.now()}`
    };

    users.push(newUser);
    saveUsers(users);
    return { success: true };
}

export function deleteUser(id: string): boolean {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);

    // Don't allow deleting the last Super Admin if we want to be safe, 
    // but here we just follow the command.
    if (index !== -1 && users[index].role !== 'SUPER_ADMIN') {
        users.splice(index, 1);
        saveUsers(users);
        return true;
    }
    return false;
}

export function updateUser(id: string, updates: Partial<User>): boolean {
    const users = getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        // Prevent role change via simple update if not careful? 
        // For now, allow any updates passed.
        users[index] = { ...users[index], ...updates };
        saveUsers(users);
        return true;
    }
    return false;
}
