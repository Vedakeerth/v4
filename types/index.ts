// Shared interfaces used across client and server

export interface Comment {
    id: string;
    author: string;
    text: string;
    date: string;
}

export interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    content: string;
    image: string;
    category: string;
    author: string;
    date: string;
    readTime: string;
    likes?: number;
    comments?: Comment[];
    hashtags?: string[];
    metaTitle?: string;
    metaDescription?: string;
    createdAt?: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: string | number;
    image: string;
    images: string[];
    category: string;
    inStock: boolean;
    stockCount?: number;
    availabilityStatus?: "In Stock" | "Out of Stock" | "Pre-order";
    isPopular?: boolean;
    quantity?: number; // Used for cart
    colors?: string[]; // Hex codes or names
    likes?: number;
}

export interface Order {
    id: string;
    customerName: string;
    email: string;
    phone: string;
    date: string;
    totalAmount: string;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
    items: any[];
    address: string;
    notes?: string;
    createdAt?: any;
}

export interface SocialLink {
    id: string;
    platform: string;
    url: string;
    icon?: string;
    createdAt?: string;
}

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    company: string;
    rating: number;
    text: string;
    image?: string;
    createdAt?: string;
}

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

export type UserRole = "SUPER_ADMIN" | "USER";

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    createdAt?: string;
}

export interface Coupon {
    id: string;
    code: string;
    type: string;
    value: number;
    expiryDate: string;
    isActive: boolean;
    createdAt?: string;
}

export interface Catalog {
    id: string;
    name: string;
    description: string;
    productIds: string[];
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    order: number;
    createdAt?: string;
}

export interface Announcement {
    id: string;
    text: string;
    imageUrl?: string;
    link?: string;
    active: boolean;
    order: number;
    createdAt?: string;
}

export interface PageSEO {
    title: string;
    description: string;
    keywords: string;
}

export interface SEOData {
    [page: string]: PageSEO;
}
