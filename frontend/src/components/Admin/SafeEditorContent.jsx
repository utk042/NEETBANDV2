import React, { useEffect, useRef, useState } from 'react';

const SafeEditorContent = ({ editor, className, ...rest }) => {
    const editorContentRef = useRef(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!editor || editor.isDestroyed || !editorContentRef.current) {
            return;
        }

        const element = editorContentRef.current;

        // Clean any existing content
        element.innerHTML = '';
        
        // Append the editor view dom
        if (editor.view.dom) {
            element.appendChild(editor.view.dom);
        }

        setInitialized(true);

        return () => {
            if (!editor || editor.isDestroyed) return;
            // The editor will handle its own cleanup when destroyed
        };
    }, [editor]);

    return (
        <div ref={editorContentRef} className={className} {...rest} />
    );
};

export default React.memo(SafeEditorContent);
