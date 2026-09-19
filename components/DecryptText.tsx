"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
const rand = () => CHARS[Math.floor(Math.random() * CHARS.length)];

interface CharState {
    real: string;
    shown: string;
    phase: "scramble-in" | "stable" | "scramble-out" | "gone";
}

interface DecryptTextProps {
    text: string;
    className?: string;
    scrambleFrames?: number;
    frameMs?: number;
    startDelay?: number;
}

export default function DecryptText({
    text,
    className = "",
    scrambleFrames = 6,
    frameMs = 30,
    startDelay = 0,
}: DecryptTextProps) {
    const [chars, setChars] = useState<CharState[]>([]);
    const prevRef = useRef<string>("");
    const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
    const isFirstRender = useRef(true);

    useEffect(() => {
        const prev = prevRef.current;
        prevRef.current = text;

        timers.current.forEach(clearTimeout);
        timers.current = [];

        const currentDelay = isFirstRender.current ? startDelay : 0;
        isFirstRender.current = false;

        const prevLen = prev.length;
        const nextLen = text.length;

        const newStates: CharState[] = [];

        for (let i = 0; i < Math.max(prevLen, nextLen); i++) {
            if (i < nextLen) {
                const targetChar = text[i];
                const wasStable = i < prevLen && prev[i] === targetChar;
                newStates.push({
                    real: targetChar,
                    shown: wasStable ? targetChar : rand(),
                    phase: wasStable ? "stable" : "scramble-in",
                });
            } else {
                newStates.push({ real: "", shown: rand(), phase: "scramble-out" });
            }
        }

        setChars([...newStates]);

        const runScramble = (delay: number) => {
            newStates.forEach((state, i) => {
                if (state.phase === "scramble-in") {
                    for (let f = 0; f < scrambleFrames; f++) {
                        const t = setTimeout(() => {
                            setChars(prev => {
                                const next = [...prev];
                                if (!next[i] || next[i].phase !== "scramble-in") return prev;
                                const isLast = f === scrambleFrames - 1;
                                next[i] = { ...next[i], shown: isLast ? next[i].real : rand(), phase: isLast ? "stable" : "scramble-in" };
                                return next;
                            });
                        }, delay + (f + 1) * frameMs);
                        timers.current.push(t);
                    }
                }
                if (state.phase === "scramble-out") {
                    for (let f = 0; f < scrambleFrames; f++) {
                        const t = setTimeout(() => {
                            setChars(prev => {
                                const next = [...prev];
                                if (!next[i] || next[i].phase !== "scramble-out") return prev;
                                const isLast = f === scrambleFrames - 1;
                                next[i] = { ...next[i], shown: isLast ? "" : rand(), phase: isLast ? "gone" : "scramble-out" };
                                return next;
                            });
                        }, (f + 1) * frameMs);
                        timers.current.push(t);
                    }
                }
            });
        };

        const handlePreloaderFinished = () => runScramble(100);

        if (typeof document !== 'undefined') {
            if (document.body.classList.contains('preloader-finished')) {
                runScramble(currentDelay);
            } else {
                window.addEventListener('preloaderFinished', handlePreloaderFinished, { once: true });
            }
        } else {
            runScramble(currentDelay);
        }

        return () => {
            timers.current.forEach(clearTimeout);
            if (typeof window !== 'undefined') {
                window.removeEventListener('preloaderFinished', handlePreloaderFinished);
            }
        };
    }, [text, scrambleFrames, frameMs]);

    return (
        <span className={className}>
            {chars.filter(c => c.phase !== "gone").map((c, i) => (
                <span key={i}>{c.shown || "\u200b"}</span>
            ))}
        </span>
    );
}
