


interface VariableProximityProps extends HTMLAttributes<HTMLSpanElement> {
    label: string;
    fromFontVariationSettings: string;
    toFontVariationSettings: string;
    containerRef: RefObject<HTMLElement | null>;
    radius?: number;
    falloff?: "linear" | "exponential" | "gaussian";
    className?: string;
    onClick?: () => void;
    style?: CSSProperties;
}

import { forwardRef, useMemo, useRef, useEffect, RefObject, CSSProperties, HTMLAttributes } from "react";
import { motion } from "motion/react";


function useMousePositionRef(containerRef: RefObject<HTMLElement | null>) {
    const positionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const updatePosition = (x: number, y: number) => {
            if (containerRef?.current) {
                const rect = containerRef.current.getBoundingClientRect();
                positionRef.current = { x: x - rect.left, y: y - rect.top };
            } else {
                positionRef.current = { x, y };
            }
        };

        const handleMouseMove = (ev: MouseEvent) => updatePosition(ev.clientX, ev.clientY);
        const handleTouchMove = (ev: TouchEvent) => {
            const touch = ev.touches[0];
            updatePosition(touch.clientX, touch.clientY);
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("touchmove", handleTouchMove);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("touchmove", handleTouchMove);
        };
    }, [containerRef]);

    return positionRef;
}

function useAnimationFrame(callback: () => void) {
    useEffect(() => {
        let frameId: number;
        const loop = () => {
            callback();
            frameId = requestAnimationFrame(loop);
        };
        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [callback]);


}

const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>((props, ref) => {
    const {
        label,
        fromFontVariationSettings,
        toFontVariationSettings,
        containerRef,
        radius = 50,
        falloff = "linear",
        className = "",
        onClick,
        style,
        ...restProps
    } = props;

    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
    // On initial render, set all letters to the fromFontVariationSettings (low weight)
    const interpolatedSettingsRef = useRef<string[]>([]);
    // Ensure all letters start with the correct fontVariationSettings inline style (prevents FOUC)
    useEffect(() => {
        if (letterRefs.current.length > 0) {
            letterRefs.current.forEach((letterRef, idx) => {
                if (letterRef) {
                    letterRef.style.fontVariationSettings = fromFontVariationSettings;
                    interpolatedSettingsRef.current[idx] = fromFontVariationSettings;
                }
            });
        }
    }, [fromFontVariationSettings, label]);
    // Only enable proximity effect on non-touch devices (hover-capable)

    // Only disable proximity effect after a real touch event (so Apple Pencil hover works)
    const hasTouchRef = useRef(false);
    useEffect(() => {
        const onTouch = () => {
            hasTouchRef.current = true;
        };
        window.addEventListener('touchstart', onTouch, { passive: true });
        return () => {
            window.removeEventListener('touchstart', onTouch);
        };
    }, []);

    const mousePositionRef = useMousePositionRef(containerRef);
    const lastPositionRef = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

    // Track if the mouse has ever entered the container
    const hasInteractedRef = useRef(false);

    useEffect(() => {
        if (!containerRef?.current) return;
        const node = containerRef.current;
        const handleMouseEnter = () => {
            hasInteractedRef.current = true;
        };
        node.addEventListener('mouseenter', handleMouseEnter);
        return () => {
            node.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [containerRef]);

    const parsedSettings = useMemo(() => {
        const parseSettings = (settingsStr: string) =>
            new Map(
                settingsStr.split(",")
                    .map(s => s.trim())
                    .map(s => {
                        const [name, value] = s.split(" ");
                        return [name.replace(/['"]/g, ""), parseFloat(value)];
                    })
            );

        const fromSettings = parseSettings(fromFontVariationSettings);
        const toSettings = parseSettings(toFontVariationSettings);

        return Array.from(fromSettings.entries()).map(([axis, fromValue]) => ({
            axis,
            fromValue,
            toValue: toSettings.get(axis) ?? fromValue,
        }));
    }, [fromFontVariationSettings, toFontVariationSettings]);

    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) =>
        Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);

    const calculateFalloff = (distance: number) => {
        const norm = Math.min(Math.max(1 - distance / radius, 0), 1);
        switch (falloff) {
            case "exponential": return norm ** 2;
            case "gaussian": return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
            case "linear":
            default: return norm;
        }
    };

    useAnimationFrame(() => {
        if (!containerRef?.current) return;
        if (hasTouchRef.current) {
            // On touch devices, always use the default style
            letterRefs.current.forEach((letterRef) => {
                if (letterRef) {
                    letterRef.style.fontVariationSettings = fromFontVariationSettings;
                }
            });
            return;
        }
        const { x, y } = mousePositionRef.current;
        if (lastPositionRef.current.x === x && lastPositionRef.current.y === y) {
            return;
        }
        lastPositionRef.current = { x, y };
        const containerRect = containerRef.current.getBoundingClientRect();

        letterRefs.current.forEach((letterRef, index) => {
            if (!letterRef) return;

            // If the mouse has never entered, always use the default style
            if (!hasInteractedRef.current) {
                letterRef.style.fontVariationSettings = fromFontVariationSettings;
                return;
            }

            const rect = letterRef.getBoundingClientRect();
            const letterCenterX = rect.left + rect.width / 2 - containerRect.left;
            const letterCenterY = rect.top + rect.height / 2 - containerRect.top;

            const distance = calculateDistance(
                mousePositionRef.current.x,
                mousePositionRef.current.y,
                letterCenterX,
                letterCenterY
            );

            if (distance >= radius) {
                letterRef.style.fontVariationSettings = fromFontVariationSettings;
                return;
            }

            const falloffValue = calculateFalloff(distance);
            const newSettings = parsedSettings
                .map(({ axis, fromValue, toValue }) => {
                    const interpolatedValue = fromValue + (toValue - fromValue) * falloffValue;
                    return `'${axis}' ${interpolatedValue}`;
                })
                .join(", ");

            interpolatedSettingsRef.current[index] = newSettings;
            letterRef.style.fontVariationSettings = newSettings;
        });
    });

    const words = label.split(" ");
    let letterIndex = 0;

    // Render all letters with the correct initial fontVariationSettings inline (prevents FOUC)
    return (
        <span
            ref={ref}
            onClick={onClick}
            style={{
                display: "inline",
                fontFamily: "'LastikVariable', var(--font-lastik), sans-serif",
                ...style,
            }}
            className={className}
            {...restProps}
        >
            {words.map((word, wordIndex) => (
                <span
                    key={wordIndex}
                    className="inline-block whitespace-nowrap"
                >
                    {word.split("").map((letter) => {
                        const currentLetterIndex = letterIndex++;
                        // Always set the initial style to fromFontVariationSettings to prevent FOUC
                        return (
                            <motion.span
                                key={currentLetterIndex}
                                ref={(el) => { letterRefs.current[currentLetterIndex] = el; }}
                                style={{
                                    display: "inline-block",
                                    fontVariationSettings:
                                        interpolatedSettingsRef.current[currentLetterIndex] || fromFontVariationSettings,
                                }}
                                aria-hidden="true"
                            >
                                {letter}
                            </motion.span>
                        );
                    })}
                    {wordIndex < words.length - 1 && (
                        <span className="inline-block">&nbsp;</span>
                    )}
                </span>
            ))}
            <span className="sr-only">{label}</span>
        </span>
    );
});

VariableProximity.displayName = "VariableProximity";
export default VariableProximity;
