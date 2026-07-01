import React, { useEffect, useState } from 'react';
import { Link as LinkIcon, Edit3, Check } from 'lucide-react';

const SlugInput = ({ title, slug, setSlug, prefix = "/blog/" }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [manualSlug, setManualSlug] = useState(slug || '');

    useEffect(() => {
        if (!isEditing && title && !slug) {
            const autoSlug = title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            setSlug(autoSlug);
            setManualSlug(autoSlug);
        }
    }, [title, isEditing, slug, setSlug]);

    useEffect(() => {
        if (slug) setManualSlug(slug);
    }, [slug]);

    const handleSave = () => {
        setSlug(manualSlug);
        setIsEditing(false);
    };

    return (
        <div className="w-full">
            <div className={`flex items-center bg-surface-container border rounded-xl overflow-hidden transition-all duration-200 ${isEditing ? 'border-primary shadow-[0_0_0_1px_rgba(var(--color-primary),1)]' : 'border-outline-variant/30'}`}>
                <div className="flex-1 flex items-center gap-3 px-4 py-3 min-w-0">
                    <span className="text-primary opacity-80 flex-shrink-0">
                        <LinkIcon size={16} />
                    </span>
                    <div className="flex items-center text-sm font-mono flex-1 min-w-0">
                        <span className="text-on-surface-variant flex-shrink-0">{prefix}</span>
                        {isEditing ? (
                            <input 
                                type="text"
                                value={manualSlug}
                                onChange={(e) => setManualSlug(e.target.value)}
                                className="bg-transparent border-none text-on-surface w-full p-0 ml-1 focus:outline-none focus:ring-0 min-w-0"
                                autoFocus
                                onBlur={handleSave}
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                        ) : (
                            <span 
                                className="text-on-surface truncate cursor-pointer hover:bg-on-surface/5 px-1 ml-0.5 rounded transition-colors" 
                                onClick={() => setIsEditing(true)}
                                title="Click to edit"
                            >
                                {slug || manualSlug || 'your-url-slug'}
                            </span>
                        )}
                    </div>
                </div>
                
                <button 
                    type="button"
                    onClick={isEditing ? handleSave : () => setIsEditing(true)}
                    className={`flex items-center justify-center px-4 py-3 border-l transition-colors flex-shrink-0 outline-none ${
                        isEditing 
                            ? 'bg-primary border-primary text-on-primary' 
                            : 'border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-primary/10'
                    }`}
                >
                    {isEditing ? <Check size={16} /> : <Edit3 size={16} />}
                </button>
            </div>
            
            <p className="text-xs text-on-surface-variant/70 mt-2 ml-1">
                Click url to edit slug manually
            </p>
        </div>
    );
};

export default SlugInput;
