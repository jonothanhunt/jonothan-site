"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { EffectComposer } from "@react-three/postprocessing";
import { N8AO } from "@react-three/postprocessing";
import { usePathname } from 'next/navigation';
import Model from "./Model";

const Experience = () => {
    const pathname = usePathname();
    const [eventSource, setEventSource] = useState(null);

    useEffect(() => {
        const rootElement = document.getElementById("root");
        if (rootElement) {
            setEventSource(rootElement);
        }
    }, []);

    return (
        <>
            {eventSource && (
                <Canvas
                    className={`${pathname === "/" ? "" : "hidden"}`}
                    eventSource={eventSource}
                    eventPrefix="client"
                    linear
                    camera={{
                        near: 0.1,
                        far: 1000,
                        fov: 20,
                        position: [-1.4, 1.4, 3],
                        rotation: [-0.4, -0.4, -0.1],
                    }}
                    dpr={[1, 2]}
                    flat
                >
                    <Suspense fallback={null}>
                        <Model />
                    </Suspense>
                    <Environment preset="city" />
                    <EffectComposer>
                        <N8AO
                            aoRadius={100}
                            distanceFalloff={0.4}
                            intensity={4}
                            screenSpaceRadius
                        />
                    </EffectComposer>
                </Canvas>
            )}
        </>
    );
};

export default Experience;
