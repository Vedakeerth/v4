"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface LikeButtonProps {
    blogId: string;
    initialLikes: number;
}

export default function LikeButton({ blogId, initialLikes }: LikeButtonProps) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const likedBlogs = JSON.parse(localStorage.getItem("likedBlogs") || "[]");
        setIsLiked(likedBlogs.includes(blogId));
    }, [blogId]);

    const handleLike = async () => {
        if (isLoading) return;
        setIsLoading(true);

        const newIsLiked = !isLiked;
        const likedBlogs = JSON.parse(localStorage.getItem("likedBlogs") || "[]");

        try {
            const res = await fetch(`/api/blogs/${blogId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ increment: newIsLiked }),
            });

            const data = await res.json();
            if (data.success) {
                setLikes(data.likes);
                setIsLiked(newIsLiked);

                if (newIsLiked) {
                    localStorage.setItem("likedBlogs", JSON.stringify([...likedBlogs, blogId]));
                } else {
                    localStorage.setItem("likedBlogs", JSON.stringify(likedBlogs.filter((id: string) => id !== blogId)));
                }
            }
        } catch (error) {
            console.error("Failed to update likes:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl border transition-all duration-300 ${isLiked
                    ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
        >
            <motion.div
                animate={isLiked ? { scale: [1, 1.4, 1] } : {}}
                transition={{ duration: 0.3 }}
            >
                <Heart
                    size={20}
                    fill={isLiked ? "currentColor" : "none"}
                    className={isLiked ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" : ""}
                />
            </motion.div>
            <span className="font-bold text-sm tracking-tight">{likes}</span>
            <span className="text-xs uppercase font-black tracking-widest ml-1">
                {isLiked ? "Liked" : "Like"}
            </span>
        </button>
    );
}
