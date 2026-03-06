"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/lib/products";

export interface CartItem extends Product {
    cartId: string;
    selectedColor?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, color?: string, quantity?: number) => void;
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    isCartOpen: boolean;
    setIsCartOpen: (isOpen: boolean) => void;
    appliedCoupon: { code: string; type: "percentage" | "fixed"; value: number } | null;
    applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
    removeCoupon: () => void;
    discountAmount: number;
    finalTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("veda_cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart data", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to local storage whenever items change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("veda_cart", JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addToCart = (product: Product, color?: string, quantity: number = 1) => {
        const cartId = `${product.id}-${color || 'default'}`;
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.cartId === cartId);

            if (existingItem) {
                return prevItems.map((item) =>
                    item.cartId === cartId
                        ? { ...item, quantity: (item.quantity || 1) + quantity }
                        : item
                );
            }

            return [...prevItems, { ...product, cartId, selectedColor: color, quantity }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (cartId: string) => {
        setItems((prevItems) =>
            prevItems.filter((item) => item.cartId !== cartId)
        );
    };

    const updateQuantity = (cartId: string, quantity: number) => {
        if (quantity < 1) return;
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.cartId === cartId
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; type: "percentage" | "fixed"; value: number } | null>(null);

    const applyCoupon = async (code: string) => {
        try {
            const res = await fetch("/api/coupons/validate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code }),
            });
            const data = await res.json();
            if (data.success) {
                setAppliedCoupon(data.coupon);
                return { success: true, message: "Coupon applied successfully!" };
            } else {
                return { success: false, message: data.message || "Invalid coupon code" };
            }
        } catch (error) {
            return { success: false, message: "Error validating coupon" };
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
    };

    const getPrice = (p: string | number) => typeof p === 'string' ? (parseFloat(p.replace(/[^0-9.]/g, "")) || 0) : p;

    const cartTotal = items.reduce((total, item) => {
        return total + getPrice(item.price) * (item.quantity || 1);
    }, 0);

    const discountAmount = appliedCoupon
        ? (appliedCoupon.type === 'percentage'
            ? (cartTotal * appliedCoupon.value) / 100
            : appliedCoupon.value)
        : 0;

    const finalTotal = Math.max(0, cartTotal - discountAmount);

    const cartCount = items.reduce((count, item) => count + (item.quantity || 1), 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                isCartOpen,
                setIsCartOpen,
                appliedCoupon,
                applyCoupon,
                removeCoupon,
                discountAmount,
                finalTotal
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
