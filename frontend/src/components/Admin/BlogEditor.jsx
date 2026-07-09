import React, { useState, useEffect, useMemo } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Youtube from '@tiptap/extension-youtube';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import CodeMirror, { EditorView } from '@uiw/react-codemirror';
import { html } from '@codemirror/lang-html';
import { githubDark } from '@uiw/codemirror-theme-github';
import { html as beautifyHtml } from 'js-beautify';
import { 
    Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, Quote, Heading1, Heading2, Heading3, 
    AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, Video, Link as LinkIcon, 
    Undo, Redo, Code, Eye, Monitor, FileCode, Check, ChevronDown, Eraser, X, UploadCloud, Loader2
} from 'lucide-react';
import { uploadFile } from '../../services/api';
import { useDialog } from '../../contexts/DialogContext';

import SafeEditorContent from './SafeEditorContent';

const MenuButton = ({ onClick, isActive, disabled, children, title, className = "" }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`editor-btn ${isActive ? 'active' : ''} ${className}`}
        title={title}
    >
        {children}
    </button>
);

const ToolbarDivider = () => <div className="editor-toolbar-divider" />;

const ImageUploadModal = ({ isOpen, onClose, onConfirm }) => {
    const { toast } = useDialog();
    const [url, setUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    
    if (!isOpen) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const res = await uploadFile(file, 'image');
            const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const finalUrl = res.url.startsWith('http') ? res.url : `${backendUrl}${res.url}`;
            setUrl(finalUrl);
            onConfirm(finalUrl);
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload failed. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (url) {
            onConfirm(url);
        }
    };

    return (
        <div className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-surface border border-outline-variant/30 rounded-2xl p-5 md:p-6 w-full max-w-md shadow-2xl relative overflow-y-auto max-h-[90vh]">
                <button 
                    onClick={onClose}
                    type="button"
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors"
                >
                    <X size={18} />
                </button>
                
                <h3 className="text-lg font-semibold text-on-surface mb-6">Add Image</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Image URL</label>
                        <input 
                            type="url" 
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSubmit(e); } }}
                            placeholder="https://example.com/image.jpg"
                            className="w-full px-3 py-2 rounded-xl bg-background border border-outline-variant/40 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder:text-on-surface-variant/40"
                        />
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px bg-outline-variant/30"></div>
                        <span className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">OR</span>
                        <div className="flex-1 h-px bg-outline-variant/30"></div>
                    </div>
                    
                    <div>
                        <label className="text-xs font-medium text-on-surface-variant mb-1.5 block">Upload Image</label>
                        <div className="relative">
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className={`w-full px-4 py-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-colors ${
                                isUploading ? 'border-primary/50 bg-primary/5' : 'border-outline-variant/40 hover:border-primary/50 hover:bg-surface-variant/30'
                            }`}>
                                {isUploading ? (
                                    <>
                                        <Loader2 size={24} className="text-primary animate-spin" />
                                        <span className="text-sm font-medium text-on-surface-variant">Uploading...</span>
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={24} className="text-on-surface-variant" />
                                        <span className="text-sm font-medium text-on-surface-variant">Click or drag image to upload</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-sm font-medium text-on-surface hover:bg-surface-variant transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={!url && !isUploading}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            Confirm Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BlogEditor = ({ content, setContent }) => {
    const [mode, setMode] = useState('visual');
    const [htmlValue, setHtmlValue] = useState(content || '');
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    const extensions = useMemo(() => [
        StarterKit,
        Image,
        Youtube.configure({ width: 840, height: 472.5 }),
        Link.configure({ openOnClick: false }),
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: 'Start writing your story...' }),
        TextStyle,
        Color,
        FontFamily,
        Underline,
        Highlight.configure({ multicolor: true }),
    ], []);

    const editor = useEditor({
        extensions,
        content: content || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (mode !== 'html') {
                setHtmlValue(html);
            }
            setContent(html);
        },
        editorProps: {
            attributes: {
                class: 'tiptap-editor-content focus:outline-none min-h-[300px] md:min-h-[500px] h-full w-full !p-4 md:!p-6',
                style: 'min-height: 300px; height: 100%; width: 100%;'
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    const handleModeChange = (newMode) => {
        if (newMode === 'html') {
            const currentHtml = editor?.getHTML() || htmlValue;
            const formatted = beautifyHtml(currentHtml, {
                indent_size: 2,
                wrap_line_length: 0,
                preserve_newlines: true,
            });
            setHtmlValue(formatted);
        } else if (mode === 'html' && newMode === 'visual') {
            editor?.commands.setContent(htmlValue);
        }
        setMode(newMode);
    };

    const addImage = () => {
        setIsImageModalOpen(true);
    };

    const handleImageConfirm = (url) => {
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
        setIsImageModalOpen(false);
    };

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    if (!editor) return null;

    return (
        <div className="modern-editor-container" style={{
            border: "1px solid rgba(var(--color-outline) / 0.2)",
            borderRadius: "var(--rounded-lg)",
            overflow: "hidden",
            background: "rgb(var(--color-surface-container-lowest))",
            marginTop: "24px"
        }}>
            {/* Main Sticky Toolbar Area */}
            <div className="editor-toolbar-container" style={{
                position: "sticky",
                top: 0,
                zIndex: 40
            }}>
                <div className="editor-toolbar-scroll no-scrollbar">
                    <div className="editor-toolbar-inner">
                        {/* History Group */}
                        <div className="editor-toolbar-group">
                            <MenuButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={18}/></MenuButton>
                        </div>
                        <div className="editor-toolbar-divider" />

                        {/* Text Formatting Group */}
                        <div className="editor-toolbar-group">
                            <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} title="Clear Formatting"><Eraser size={18}/></MenuButton>
                        </div>
                        <div className="editor-toolbar-divider" />

                        {/* Headings Group */}
                        <div className="editor-toolbar-group">
                            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="H1"><Heading1 size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2"><Heading2 size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="H3"><Heading3 size={18}/></MenuButton>
                        </div>
                        <div className="editor-toolbar-divider" />

                        {/* Lists Group */}
                        <div className="editor-toolbar-group">
                            <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote"><Quote size={18}/></MenuButton>
                        </div>
                        <div className="editor-toolbar-divider" />

                        {/* Alignment Group */}
                        <div className="editor-toolbar-group">
                            <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={18}/></MenuButton>
                            <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={18}/></MenuButton>
                        </div>
                        <div className="editor-toolbar-divider" />

                        {/* Media Group */}
                        <div className="editor-toolbar-group">
                            <MenuButton onClick={addImage} title="Add Image"><ImageIcon size={18}/></MenuButton>
                            <MenuButton onClick={setLink} isActive={editor.isActive('link')} title="Add Link"><LinkIcon size={18}/></MenuButton>
                        </div>
                    </div>
                </div>

                {/* View Switcher */}
                <div className="flex items-center justify-between md:justify-start w-full md:w-auto bg-surface-container-low p-1 rounded-lg border border-outline-variant/30 shrink-0">
                    {[
                        { id: 'visual', label: 'Visual', icon: Monitor },
                        { id: 'html', label: 'HTML', icon: FileCode },
                        { id: 'preview', label: 'Preview', icon: Eye }
                    ].map((item) => (
                        <button 
                            key={item.id}
                            type="button" 
                            onClick={() => handleModeChange(item.id)} 
                            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-3 py-2 md:py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                                mode === item.id 
                                    ? 'bg-primary text-on-primary shadow-sm' 
                                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50'
                            }`}
                        >
                            <item.icon size={14} />
                            <span className={mode === item.id ? '' : 'hidden md:inline'}>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Scrollable Content Area */}
            <div className={`editor-view-container min-h-[300px] md:min-h-[500px] ${mode === 'html' ? 'editor-mode-html' : ''}`}>
                {mode === 'visual' && (
                    <div className="visual-editor-root min-h-[300px] md:min-h-[500px] h-full w-full">
                        <SafeEditorContent editor={editor} className="min-h-[300px] md:min-h-[500px] h-full w-full" />
                    </div>
                )}
                
                {mode === 'html' && (
                    <div className="html-editor-root">
                        <CodeMirror
                            value={htmlValue}
                            height="500px"
                            theme={githubDark}
                            extensions={[html(), EditorView.lineWrapping, EditorView.theme({
                                "&": { fontSize: "14px" },
                                ".cm-content": { fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }
                            })]}
                            onChange={(value) => {
                                setHtmlValue(value);
                                setContent(value);
                            }}
                        />
                    </div>
                )}

                {mode === 'preview' && (
                    <div className="preview-container editor-preview-active">
                        <div className="preview-content-inner">
                            <div className="tiptap-editor-content" dangerouslySetInnerHTML={{ __html: htmlValue }} />
                        </div>
                    </div>
                )}
            </div>
            
            <ImageUploadModal 
                isOpen={isImageModalOpen} 
                onClose={() => setIsImageModalOpen(false)} 
                onConfirm={handleImageConfirm} 
            />
        </div>
    );
};

export default BlogEditor;

