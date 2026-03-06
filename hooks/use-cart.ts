"use client";

import { useState, useEffect } from "react";
import { Product } from "@/lib/products";

export interface CartItem extends Product {
    cartId: string;
    selectedColor?: string;
}

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem("veda_cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("veda_cart", JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = (product: Product, color?: string) => {
        const cartId = `${product.id}-${color || 'default'}`;
        setCart(prev => {
            const existing = prev.find(item => item.cartId === cartId);
            if (existing) {
                return prev.map(item =>
                    item.cartId === cartId
                        ? { ...item, quantity: (item.quantity || 1) + 1 }
                        : item
                );
            }
            return [...prev, { ...product, cartId, selectedColor: color, quantity: 1 }];
        });
    };

    const removeFromCart = (cartId: string) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, quantity: number) => {
        setCart(prev => prev.map(item =>
            item.cartId === cartId
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
        ));
    };

    const clearCart = () => setCart([]);

    const cartTotal = cart.reduce((total, item) => {
        const price = typeof item.price === 'string' 
            ? parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0
            : item.price || 0;
        return total + (price * (item.quantity || 1));
    }, 0);

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        isLoaded
    };
}
