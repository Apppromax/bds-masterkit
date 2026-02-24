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
        setDisplayedText('');
        setIsComplete(false);

        let currentIndex = 0;
        const timer = setInterval(() => {
            if (currentIndex < chars.length) {
                // Using slice and join ensures we always have the exact string up to that point
                setDisplayedText(chars.slice(0, currentIndex + 1).join(''));
                currentIndex++;
            } else {
                setIsComplete(true);
                clearInterval(timer);
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, speed]);

    return (
        <span className={`${className} inline-flex items-center`}>
            {displayedText}
            {!isComplete && (
                <span className="w-[2px] h-[1em] bg-current animate-pulse ml-0.5 opacity-70"></span>
            )}
        </span>
    );
}
