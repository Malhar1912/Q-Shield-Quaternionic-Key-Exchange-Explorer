import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathRendererProps {
    expression: string;
    inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ expression, inline = true }) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            katex.render(expression, containerRef.current, {
                throwOnError: false,
                displayMode: !inline,
            });
        }
    }, [expression, inline]);

    return <span ref={containerRef} />;
};
