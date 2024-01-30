import React, { useRef, useEffect, Suspense, memo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import Background from "./Background";
import Text from "./Text";

import { Perf } from "r3f-perf";
import Bubbles from "./Bubbles";
import Stickers from "./Stickers";

const Experience = memo(function Experience({ textVisible }) {
    const experienceRef = useRef(null);

    const [canvasLoaded, setCanvasLoaded] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            setCanvasLoaded(true);
        }, 100);
    }, []);

    return (
        <div
            ref={experienceRef}
            className={`fixed top-0 left-0 outline-none w-full h-screen -z-10 transition-opacity duration-1000 ${
                canvasLoaded ? "opacity-100" : "opacity-0"
            }`}
        >
            <Suspense>
                <Canvas
                    eventSource={document.getElementById("root")} // event source set to app div for mouse movement
                    eventPrefix="client" // to get global mouse movement
                    linear // to avoid R3F default colour changing to keep css colours the same
                    flat // sets toneMapping to THREE.NoToneMapping
                    orthographic // creates orthographic camera
                    camera={{ zoom: 60, position: [0, 0, 40] }} // sets camera values 60
                    dpr={[0.5, 1]}
                    resize={{
                        scroll: true,
                        debounce: { scroll: 50, resize: 0 },
                    }}
                >
                    {/* debug if /#debug in URL */}
                    {window.location.href.indexOf("#debug") > -1 && (
                        <Perf position={"top-left"} />
                    )}
                    {/* <TransformGroup textVisible={textVisible} /> */}
                    <Background />
                </Canvas>
            </Suspense>
        </div>
    );
});

function TransformGroup({ textVisible }) {
    const { viewport } = useThree();

    const transformGroup = useRef(null);

    const { width, height } = useThree((state) => state.viewport);
    let windowScrollY = window.scrollY;

    let smoothedMouseX = 0;
    let smoothedMouseY = 0;
    let smoothedWindowScrollY = 0;

    const groupVisibilityProgress = useRef(0.0);

    useFrame((state) => {
        if (textVisible) {
            // MOUSE
            const { mouse } = state;
            const mouseX = (mouse.x * width) / 2;
            const mouseY = -(mouse.y * height) / 2;

            smoothedMouseX = lerp(smoothedMouseX, mouseX, 0.05);
            smoothedMouseY = lerp(smoothedMouseY, mouseY, 0.05);

            // SCROLL
            windowScrollY = window.scrollY;
            smoothedWindowScrollY = lerp(
                smoothedWindowScrollY,
                windowScrollY,
                0.1
            );

            transformGroup.current.rotation.x =
                smoothedMouseY * 0.014 + smoothedWindowScrollY * 0.001;
            transformGroup.current.rotation.y = smoothedMouseX * 0.01;
            transformGroup.current.rotation.z = -smoothedWindowScrollY * 0.0005;

            transformGroup.current.position.y =
                smoothedWindowScrollY * 0.02 +
                Math.max((viewport.height / viewport.width) * 1.8, 2);

            // SCALE
            const scale = Math.min(width / 25, 1);
            transformGroup.current.scale.x = scale;
            transformGroup.current.scale.y = scale;
            transformGroup.current.scale.z = scale;

          }
            // ANIMATE IN PROGRESS
            groupVisibilityProgress.current = lerp(
                groupVisibilityProgress.current,
                textVisible ? 1 : 0,
                0.1
            );
    });

    return (
        <>
            {/* <Background /> */}
            <group ref={transformGroup}>
                {/* {textVisible && ( */}
                <>
                    <Text groupVisibilityProgress={groupVisibilityProgress} />
                    <Stickers
                        groupVisibilityProgress={groupVisibilityProgress}
                    />
                    {/* <Bubbles
                        groupVisibilityProgress={groupVisibilityProgress}
                    /> */}
                </>
                {/* )} */}
            </group>
        </>
    );
}

const lerp = function (start, end, amt) {
    return (1 - amt) * start + amt * end;
};

export default Experience;
