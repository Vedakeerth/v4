"use client";

import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Section {
    id: string;
    title: string;
    subsections?: { id: string; title: string }[];
}

interface PolicySidebarProps {
    sections: Section[];
    currentSection?: string;
}

export default function PolicySidebar({ sections, currentSection }: PolicySidebarProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [activeSection, setActiveSection] = useState<string>(currentSection || "");


    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 200;

            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [sections]);

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(sectionId)) {
                newSet.delete(sectionId);
            } else {
                newSet.add(sectionId);
            }
            return newSet;
        });
    };

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
            setActiveSection(sectionId);
        }
    };

    return (
        <div className="sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
            <nav className="space-y-2 pr-4">
                {sections.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    const isActive = activeSection === section.id;
                    const hasSubsections = section.subsections && section.subsections.length > 0;

                    return (
                        <div key={section.id}>
                            <button
                                onClick={() => {
                                    if (hasSubsections) {
                                        toggleSection(section.id);
                                    }
                                    scrollToSection(section.id);
                                }}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm transition-all",
                                    isActive
                                        ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                                )}
                            >
                                <span className="text-left font-medium">{section.title}</span>
                                {hasSubsections && (
                                    <span className="ml-2">
                                        {isExpanded ? (
                                            <ChevronDown className="h-4 w-4" />
                                        ) : (
                                            <ChevronRight className="h-4 w-4" />
                                        )}
                                    </span>
                                )}
                            </button>
                            {hasSubsections && isExpanded && (
                                <div className="ml-4 mt-2 space-y-1">
                                    {section.subsections?.map((subsection) => {
                                        const isSubActive = activeSection === subsection.id;
                                        return (
                                            <button
                                                key={subsection.id}
                                                onClick={() => scrollToSection(subsection.id)}
                                                className={cn(
                                                    "w-full text-left px-4 py-1.5 rounded text-xs transition-all",
                                                    isSubActive
                                                        ? "text-blue-400 bg-blue-500/10"
                                                        : "text-slate-500 hover:text-slate-300"
                                                )}
                                            >
                                                {subsection.title}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </div>
    );
}
