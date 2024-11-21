"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the type for the context value
interface LightModeContextType {
    isLightMode: boolean;
}

// Create the context with a default undefined value
const LightModeContext = createContext<LightModeContextType | undefined>(undefined);

// Props for the Provider component
interface LightModeProviderProps {
    children: ReactNode;
}

// Light Mode Provider
export const LightModeProvider: React.FC<LightModeProviderProps> = ({ children }) => {
    const [isLightMode, setIsLightMode] = useState<boolean>(false);

    useEffect(() => {
        // Function to check if light mode is preferred
        const updateLightMode = () => {
            const prefersLightMode = window.matchMedia("(prefers-color-scheme: light)").matches;
            setIsLightMode(prefersLightMode);
        };

        // Initial setup
        updateLightMode();

        // Listen for changes in the system preference
        const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
        mediaQuery.addEventListener("change", updateLightMode);

        // Cleanup listener on unmount
        return () => {
            mediaQuery.removeEventListener("change", updateLightMode);
        };
    }, []);

    return (
        <LightModeContext.Provider value={{ isLightMode }}>
            {children}
        </LightModeContext.Provider>
    );
};

// Custom hook to access light mode state
export const useLightMode = (): boolean => {
    const context = useContext(LightModeContext);
    if (context === undefined) {
        throw new Error("useLightMode must be used within a LightModeProvider");
    }
    return context.isLightMode;
};
