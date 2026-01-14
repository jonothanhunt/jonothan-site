"use client";

import SlotCounter from "react-slot-counter";

interface LiveTickerProps {
    initialValue: number;
    className?: string; // Allow styling from parent
}

export default function LiveTicker({
    initialValue,
    className = "",
}: LiveTickerProps) {
    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });

    const formattedValue = formatter.format(Math.floor(initialValue));

    return (
        <SlotCounter
            value={formattedValue}
            animateOnVisible={{ triggerOnce: false }}
            containerClassName={className}
            charClassName="font-inherit tracking-[-5%] py-1"
        />
    );
}
