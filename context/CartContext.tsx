"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { Product } from "@/lib/products";
import { parsePrice } from "@/lib/utils";

const availableColors = ['#2563eb', '#ef4444', '#22c55e', '#eab308', '#ffffff', '#000000'];

export interface CartItem extends Product {
    cartId: string;
    selectedColor?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, color?: string, quantity?: number, shouldOpenCart?: boolean) => void;
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    updateItemColor: (oldCartId: string, newColor: string) => void;
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

    const addToCart = useCallback((product: Product, color?: string, quantity: number = 1, shouldOpenCart: boolean = true) => {
        let finalColor = color || product.defaultColor;
        if (!finalColor) {
            const displayColors = product.colors && product.colors.length > 0 ? product.colors : availableColors;
            finalColor = (displayColors.includes('#000000') && product.name.toLowerCase().includes('plant')) ? '#000000' : (displayColors[0] || '#2563eb');
        }

        const cartId = `${product.id}-${finalColor}`;
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.cartId === cartId);

            if (existingItem) {
                return prevItems.map((item) =>
                    item.cartId === cartId
                        ? { ...item, quantity: (item.quantity || 1) + quantity }
                        : item
                );
            }

            return [...prevItems, { ...product, cartId, selectedColor: finalColor, quantity }];
        });
        
        if (shouldOpenCart) {
            setIsCartOpen(true);
        }
    }, []);

    const removeFromCart = useCallback((cartId: string) => {
        setItems((prevItems) =>
            prevItems.filter((item) => item.cartId !== cartId)
        );
    }, []);

    const updateQuantity = useCallback((cartId: string, quantity: number) => {
        if (quantity < 1) return;
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.cartId === cartId
                    ? { ...item, quantity }
                    : item
            )
        );
    }, []);

    const updateItemColor = useCallback((oldCartId: string, newColor: string) => {
        setItems((prevItems) => {
            const itemToUpdate = prevItems.find(item => item.cartId === oldCartId);
            if (!itemToUpdate) return prevItems;

            const newCartId = `${itemToUpdate.id}-${newColor}`;
            const existingItemWithNewColor = prevItems.find(item => item.cartId === newCartId);

            if (existingItemWithNewColor) {
                // If an item with the new color already exists, merge quantities
                return prevItems
                    .map(item => item.cartId === newCartId 
                        ? { ...item, quantity: (item.quantity || 1) + (itemToUpdate.quantity || 1) } 
                        : item)
                    .filter(item => item.cartId !== oldCartId);
            } else {
                // Otherwise, just update the color and cartId
                return prevItems.map(item => 
                    item.cartId === oldCartId 
                        ? { ...item, cartId: newCartId, selectedColor: newColor } 
                        : item
                );
            }
        });
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

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

    const cartTotal = items.reduce((total, item) => {
        return total + parsePrice(item.price) * (item.quantity || 1);
    }, 0);

    const discountAmount = appliedCoupon
        ? (appliedCoupon.type === 'percentage'
            ? (cartTotal * appliedCoupon.value) / 100
            : appliedCoupon.value)
        : 0;

    const finalTotal = Math.max(0, cartTotal - discountAmount);

    const cartCount = items.reduce((count, item) => count + (item.quantity || 1), 0);

    const contextValue = useMemo(() => ({
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemColor,
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
    }), [
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemColor,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        appliedCoupon,
        discountAmount,
        finalTotal
    ]);

    return (
        <CartContext.Provider value={contextValue}>
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
