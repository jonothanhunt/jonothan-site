"use client";

import { useState, useEffect } from "react";
import SlotCounter from "react-slot-counter";

interface LiveTickerProps {
    initialValue: number;
    className?: string;
}

export default function LiveTicker({
    initialValue,
    className = "",
}: LiveTickerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });

    const formattedValue = formatter.format(Math.floor(initialValue));

    if (!mounted) {
        return (
            <span className={className}>
                {formattedValue}
            </span>
        );
    }

    return (
        <SlotCounter
            value={formattedValue}
            animateOnVisible={{ triggerOnce: false }}
            containerClassName={className}
            charClassName="font-inherit tracking-[-5%] pt-1 pb-0.5"
        />
    );
}
