import React, { useState, useEffect } from 'react';

interface TypewriterTextProps {
    text: string;
    speed?: number;
    className?: string;
}

export function TypewriterText({ text, speed = 50, className = "" }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        const chars = Array.from(text);
        let i = 0;
        setDisplayedText('');
        setIsComplete(false);

        const timer = setInterval(() => {
            if (i < chars.length) {
                setDisplayedText((prev) => prev + chars[i]);
                i++;
            } else {
                setIsComplete(true);
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed]);

    return (
        <span className={className}>
            {displayedText}
            {!isComplete && <span className="animate-pulse border-r-2 border-current ml-0.5"></span>}
        </span>
    );
}
