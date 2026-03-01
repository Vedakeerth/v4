import fs from 'fs';
import path from 'path';

export interface Order {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    date: string;
    totalAmount: string;
    status: "Pending" | "Processing" | "Completed" | "Cancelled";
    items: any[];
    address: string;
    notes?: string;
}

const ordersFilePath = path.join(process.cwd(), 'data', 'orders.json');

export function getOrders(): Order[] {
    try {
        if (!fs.existsSync(ordersFilePath)) {
            const dir = path.dirname(ordersFilePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(ordersFilePath, JSON.stringify([], null, 2), 'utf8');
            return [];
        }
        const fileContent = fs.readFileSync(ordersFilePath, 'utf8');
        return JSON.parse(fileContent) as Order[];
    } catch (error) {
        console.error("Error reading orders:", error);
        return [];
    }
}

export function saveOrders(orders: Order[]): void {
    try {
        const dir = path.dirname(ordersFilePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
    } catch (error) {
        console.error("Error saving orders:", error);
    }
}

export function addOrder(order: Order): void {
    const orders = getOrders();
    orders.unshift(order); // Add new orders at the top
    saveOrders(orders);
}

export function updateOrder(id: string, updates: Partial<Order>): boolean {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
        orders[index] = { ...orders[index], ...updates };
        saveOrders(orders);
        return true;
    }
    return false;
}
