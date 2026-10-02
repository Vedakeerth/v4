"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TiptapImage from "@tiptap/extension-image";
import { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";

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
    // Neutrals
    { hex: "#0f172a", name: "Black" },
    { hex: "#1e293b", name: "Dark" },
    { hex: "#475569", name: "Gray" },
    { hex: "#94a3b8", name: "Light Gray" },
    { hex: "#cbd5e1", name: "Pale" },
    { hex: "#ffffff", name: "White" },
    // Reds / Oranges
    { hex: "#ef4444", name: "Red" },
    { hex: "#f97316", name: "Orange" },
    { hex: "#fb923c", name: "Peach" },
    { hex: "#fbbf24", name: "Amber" },
    { hex: "#eab308", name: "Yellow" },
    { hex: "#a3e635", name: "Lime" },
    // Greens / Teals
    { hex: "#22c55e", name: "Green" },
    { hex: "#10b981", name: "Emerald" },
    { hex: "#14b8a6", name: "Teal" },
    { hex: "#06b6d4", name: "Cyan" },
    { hex: "#0ea5e9", name: "Sky" },
    { hex: "#3b82f6", name: "Blue" },
    // Purples / Pinks
    { hex: "#6366f1", name: "Indigo" },
    { hex: "#8b5cf6", name: "Violet" },
    { hex: "#a855f7", name: "Purple" },
    { hex: "#d946ef", name: "Fuchsia" },
    { hex: "#ec4899", name: "Pink" },
    { hex: "#f43f5e", name: "Rose" },
];

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    /** Optional: context ID used for image uploads (e.g. blog id or project id) */
    uploadContext?: string;
    /** Optional: folder for uploads (e.g. 'blogs', 'projects') */
    uploadFolder?: string;
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = "Write a detailed product description...",
    uploadContext,
    uploadFolder = "content",
}: RichTextEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const colorRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TextStyle,
            Color,
            FontFamily,
            TiptapImage.configure({ inline: false, allowBase64: false }),
        ],
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
            editor.commands.setContent(value, { emitUpdate: false });
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

    const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        setIsUploadingImage(true);
        try {
            const formDataPayload = new FormData();
            formDataPayload.append("file", file);
            const ctx = uploadContext || `content_${Date.now()}`;
            formDataPayload.append("quotationID", ctx);
            formDataPayload.append("rootFolder", uploadFolder);

            const responseData = await new Promise<any>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", "/api/upload-r2", true);
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try { resolve(JSON.parse(xhr.responseText)); } catch { reject(new Error("Invalid response")); }
                    } else { reject(new Error(`Upload failed: ${xhr.status}`)); }
                };
                xhr.onerror = () => reject(new Error("Network error"));
                xhr.send(formDataPayload);
            });

            if (responseData.success) {
                editor.chain().focus().setImage({ src: responseData.data.url, alt: file.name }).run();
                toast.success("Image inserted!");
            } else {
                toast.error("Image upload failed.");
            }
        } catch (err) {
            console.error(err);
            toast.error("Upload failed. Please try again.");
        } finally {
            setIsUploadingImage(false);
            if (imageInputRef.current) imageInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all shadow-sm">
            <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-sm">
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
                {/* Color picker */}
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
                        <div className="absolute top-full left-0 mt-2 z-50 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 shadow-2xl shadow-black/30">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2.5">Text Color</p>
                            <div className="grid grid-cols-6 gap-1.5 mb-3">
                                {COLORS.map((c) => (
                                    <button
                                        key={c.hex}
                                        type="button"
                                        title={c.name}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            editor.chain().focus().setColor(c.hex).run();
                                            setShowColorPicker(false);
                                        }}
                                        className={`w-7 h-7 rounded-lg transition-all hover:scale-110 hover:ring-2 hover:ring-cyan-400 hover:ring-offset-1 hover:ring-offset-white dark:hover:ring-offset-slate-900 ${
                                            currentColor === c.hex ? "ring-2 ring-cyan-400 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 scale-110" : ""
                                        }`}
                                        style={{
                                            backgroundColor: c.hex,
                                            boxShadow: c.hex === "#ffffff" ? "inset 0 0 0 1px #cbd5e1" : undefined
                                        }}
                                    />
                                ))}
                            </div>
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-md flex-shrink-0 border border-slate-200 dark:border-slate-700" style={{ backgroundColor: currentColor }} />
                                    <input
                                        type="color"
                                        value={currentColor.startsWith('#') ? currentColor : '#000000'}
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onChange={(e) => {
                                            editor.chain().focus().setColor(e.target.value).run();
                                        }}
                                        className="flex-1 h-6 w-full cursor-pointer rounded bg-transparent border-0 outline-none"
                                        title="Custom color"
                                    />
                                    <span className="text-[9px] font-mono text-slate-400 w-14 truncate">{currentColor}</span>
                                </div>
                                <button
                                    type="button"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        editor.chain().focus().unsetColor().run();
                                        setShowColorPicker(false);
                                    }}
                                    className="w-full text-[9px] font-black text-slate-400 hover:text-red-400 uppercase tracking-widest transition-colors py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-red-500/10 rounded-lg"
                                >
                                    ✕ Reset Color
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <Divider />
                {/* Inline image upload */}
                <label
                    title="Insert Image"
                    className={`flex items-center gap-1 p-1.5 rounded-lg transition-all cursor-pointer text-xs font-bold ${
                        isUploadingImage
                            ? "text-cyan-400 bg-cyan-500/10"
                            : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                >
                    {isUploadingImage ? (
                        <span className="animate-pulse text-[10px]">Uploading…</span>
                    ) : (
                        <ImageIcon size={14} />
                    )}
                    <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleInlineImageUpload}
                        disabled={isUploadingImage}
                    />
                </label>
                <Divider />
                <ToolbarBtn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting">
                    Tx
                </ToolbarBtn>
            </div>

            <div className="relative p-2">
                {editor.isEmpty && (
                    <p className="absolute top-4 left-4 text-slate-400 dark:text-slate-600 text-sm pointer-events-none select-none font-medium">
                        {placeholder}
                    </p>
                )}
                <EditorContent editor={editor} />
            </div>

            <style>{`
                .ProseMirror { min-height: 120px; outline: none; color: inherit; }
                .ProseMirror p { color: inherit; }
                .ProseMirror ul { list-style-type: disc; padding-left: 1.5rem; }
                .ProseMirror ol { list-style-type: decimal; padding-left: 1.5rem; }
                .ProseMirror li { margin: 0.25rem 0; }
                .ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin: 0.75rem 0 0.25rem; color: inherit; }
                .ProseMirror h3 { font-size: 1.05rem; font-weight: 700; margin: 0.5rem 0 0.25rem; color: inherit; }
                .ProseMirror blockquote { border-left: 3px solid #06b6d4; padding-left: 0.75rem; color: #64748b; margin: 0.5rem 0; }
                .ProseMirror p { margin: 0.25rem 0; }
                .ProseMirror strong { font-weight: 700; color: inherit; }
                .ProseMirror em { font-style: italic; }
                .ProseMirror s { text-decoration: line-through; }
                .ProseMirror u { text-decoration: underline; }
                .ProseMirror img { max-width: 100%; border-radius: 0.75rem; margin: 0.75rem 0; box-shadow: 0 4px 24px rgba(0,0,0,0.10); cursor: default; }
                .ProseMirror img.ProseMirror-selectednode { outline: 3px solid #06b6d4; outline-offset: 2px; }
            `}</style>
        </div>
    );
}
