"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import { useEffect, useRef, useState } from "react";

const ToolbarBtn = ({
    active,
    onClick,
    title,
    children,
}: {
    active?: boolean;
    onClick: () => void;
    title: string;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        title={title}
        onMouseDown={(e) => {
            e.preventDefault();
            onClick();
        }}
        className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
            active
                ? "bg-cyan-500 text-white shadow shadow-cyan-500/30"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
        }`}
    >
        {children}
    </button>
);

const Divider = () => (
    <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5 self-center" />
);

const FONTS = [
    { label: "Default", value: "" },
    { label: "Inter", value: "Inter, sans-serif" },
    { label: "Serif", value: "Georgia, serif" },
    { label: "Mono", value: "Courier New, monospace" },
    { label: "Arial", value: "Arial, sans-serif" },
    { label: "Times New Roman", value: "Times New Roman, serif" },
];

const COLORS = [
    "#0f172a",
    "#64748b",
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#06b6d4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#ffffff",
];

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Write a detailed product description...",
}: RichTextEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const colorRef = useRef<HTMLDivElement>(null);

    const editor = useEditor({
        extensions: [StarterKit, Underline, TextStyle, Color, FontFamily],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none min-h-[120px] focus:outline-none px-4 py-3 text-slate-900 dark:text-white leading-relaxed",
            },
        },
    });

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, false);
        }
    }, [value, editor]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (colorRef.current && !colorRef.current.contains(e.target as Node)) {
                setShowColorPicker(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!editor) return null;

    const currentColor = editor.getAttributes("textStyle").color || "#0f172a";

    return (
        <div className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:border-cyan-500 transition-all">
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
                <ToolbarBtn active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</ToolbarBtn>
                <ToolbarBtn active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</ToolbarBtn>
                <Divider />
                <ToolbarBtn active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold">
                    <strong>B</strong>
                </ToolbarBtn>
                <ToolbarBtn active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic">
                    <em>I</em>
                </ToolbarBtn>
                <ToolbarBtn active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline">
                    <span style={{ textDecoration: "underline" }}>U</span>
                </ToolbarBtn>
                <ToolbarBtn active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough">
                    <span style={{ textDecoration: "line-through" }}>S</span>
                </ToolbarBtn>
                <Divider />
                <ToolbarBtn active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet List">
                    &#8226;&#8212;
                </ToolbarBtn>
                <ToolbarBtn active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Ordered List">
                    1&#8212;
                </ToolbarBtn>
                <Divider />
                <ToolbarBtn active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">
                    &#10077;
                </ToolbarBtn>
                <Divider />
                <select
                    title="Font Family"
                    onChange={(e) => {
                        if (e.target.value) {
                            editor.chain().focus().setFontFamily(e.target.value).run();
                        } else {
                            editor.chain().focus().unsetFontFamily().run();
                        }
                    }}
                    className="text-[10px] font-bold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                >
                    {FONTS.map((f) => (
                        <option key={f.label} value={f.value}>{f.label}</option>
                    ))}
                </select>
                <Divider />
                <div className="relative" ref={colorRef}>
                    <button
                        type="button"
                        title="Text Color"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            setShowColorPicker((v) => !v);
                        }}
                        className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-500 dark:text-slate-400 text-xs font-bold"
                    >
                        A
                        <div className="w-3 h-1.5 rounded-sm" style={{ backgroundColor: currentColor, border: "1px solid #cbd5e1" }} />
                    </button>
                    {showColorPicker && (
                        <div className="absolute top-full left-0 mt-1.5 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 shadow-xl shadow-black/20">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Text Color</p>
                            <div className="grid grid-cols-6 gap-1.5">
                                {COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        title={c}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            editor.chain().focus().setColor(c).run();
                                            setShowColorPicker(false);
                                        }}
                                        className="w-5 h-5 rounded-full border-2 border-transparent hover:border-cyan-400 transition-all"
                                        style={{ backgroundColor: c, boxShadow: c === "#ffffff" ? "inset 0 0 0 1px #cbd5e1" : undefined }}
                                    />
                                ))}
                            </div>
                            <button
                                type="button"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    editor.chain().focus().unsetColor().run();
                                    setShowColorPicker(false);
                                }}
                                className="mt-2 w-full text-[9px] font-black text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors"
                            >
                                Reset Color
                            </button>
                        </div>
                    )}
                </div>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
                    Tx
                </ToolbarBtn>
            </div>

            <div className="relative">
                {editor.isEmpty && (
                    <p className="absolute top-3 left-4 text-slate-400 dark:text-slate-600 text-sm pointer-events-none select-none font-medium">
                        {placeholder}
                    </p>
                )}
                <EditorContent editor={editor} />
            </div>

            <style>{`
                .ProseMirror { min-height: 120px; outline: none; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; }
                .ProseMirror li { margin: 0.25rem 0; }
                .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.25rem; }
                .ProseMirror h3 { font-size: 1.05rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
                .ProseMirror blockquote { border-left: 3px solid #06b6d4; padding-left: 0.75rem; color: #64748b; margin: 0.5rem 0; }
                .ProseMirror p { margin: 0.25rem 0; }
                .ProseMirror strong { font-weight: 700; }
                .ProseMirror em { font-style: italic; }
                .ProseMirror s { text-decoration: line-through; }
                .ProseMirror u { text-decoration: underline; }
            `}</style>
        </div>
    );
}
