"use client";

import { useState, useEffect } from "react";
import SlotCounter from "react-slot-counter";

interface LiveTickerProps {
    initialValue: number;
    className?: string;
    formatAsBillions?: boolean;
    suffix?: string;
}

export default function LiveTicker({
    initialValue,
    className = "",
    formatAsBillions = false,
    suffix = "",
}: LiveTickerProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const formatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0,
    });

    const formattedValue = formatAsBillions
        ? `${(initialValue / 1_000_000_000).toFixed(1)}${suffix}`
        : `${formatter.format(Math.floor(initialValue))}${suffix}`;

    if (!mounted) {
        return (
            <span className={className}>
                <span className="relative -top-[0.5px] md:top-[0.5px]">{formattedValue}</span>
            </span>
        );
    }

    return (
        <SlotCounter
            value={formattedValue}
            animateOnVisible={{ triggerOnce: false }}
            containerClassName={className}
            charClassName="font-inherit px-0.5 inline-block leading-none py-1 -my-1 align-baseline relative -top-[0.5px] md:top-[0.5px]"
        />
    );
}
