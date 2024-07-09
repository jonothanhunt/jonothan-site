import React, { useRef, useEffect, Suspense, memo, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";

import { Perf } from "r3f-perf";
import Stickers from "./Stickers";

import * as THREE from "three";

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
                    camera={{
                        zoom: 30.0,
                        position: [0, 0, 100],
                        near: 0.1,
                        far: 1000,
                    }}
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

                    <Island />

                </Canvas>
            </Suspense>
        </div>
    );
});

const Island = React.memo(() => {
    const { width, height } = useThree((state) => state.viewport);

    const islandRef = useRef(null);
    const islandPlaneRef = useRef(null);

    const islandShapeRandomFloat = useRef(Math.random());

    const islandMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_radius: { value: 0.5 },
            islandShapeRandomFloat: { value: islandShapeRandomFloat.current },
            time: { value: 0 },
        },
        vertexShader: `
            varying vec2 vUv;
            varying float distanceShape;
            varying float vNoise;
            uniform float islandShapeRandomFloat;
            uniform float time;

            #define PI 3.14159265359

            float rand(vec2 co) {
                return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
            }

            float noise(vec2 co) {
                vec2 i = floor(co);
                vec2 f = fract(co);

                float a = rand(i);
                float b = rand(i + vec2(1.0, 0.0));
                float c = rand(i + vec2(0.0, 1.0));
                float d = rand(i + vec2(1.0, 1.0));

                vec2 u = f * f * (3.0 - 2.0 * f);

                return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            void main() {

                vUv = uv;

                vNoise = noise((vUv * vec2(7.0, 24.0)) + time * 0.2) * noise((vUv * vec2(-18.0, 28.0)) + time * 0.5);

                float elevationNoise = noise(vUv * 16.0 + islandShapeRandomFloat * 10.0);

                vec2 center = vec2(0.5);

                distanceShape = distance(vUv, center) + (elevationNoise * 0.05);

                float elevation = smoothstep(0.13, 0.0, distanceShape) * -6.0;;

                vec3 newPosition = position;
                newPosition.z += elevation;


                gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
            }
        `,
        fragmentShader: `
            uniform float u_radius;
            uniform float time;
            varying float distanceShape;
            varying float vNoise;
            
            void main() {

                float dist = distanceShape;

                vec3 noiseColour = mix(vec3(.8, .4, .8), vec3(.5, .4, .8),vNoise);

                vec3 innerColourGradient = mix(vec3(1.0,  0.8, 1.0), vec3(.3,  .6, .3), smoothstep(0.0, 0.1, dist));
                vec3 outerColourGradient = mix(vec3(0.8,  .5, .4), noiseColour, smoothstep(0.1, 0.15, dist));

                vec3 colour = mix(outerColourGradient, innerColourGradient, step(dist, 0.1));

                float wavesMask = smoothstep(0.0, 0.01, distance(dist, .11));

                float rings = step((sin((dist * 1000.0) - time * 3.0) + 1.0) * 0.5, 0.2) * 0.2;

                float maskedRings = mix(rings, 0.0, wavesMask);
        
                float alpha = smoothstep(u_radius, u_radius -.4, dist);
    
                gl_FragColor = vec4(clamp(colour + maskedRings, 0.0, 1.0), alpha);
            }
        `,
        // depthWrite: true,
        // depthTest: false,
        transparent: true,
        polygonOffset: true,
        polygonOffsetFactor: -0.1,
        polygonOffsetUnits: 0.1,
        side: THREE.DoubleSide,
    });

    let smoothedMouseX = useRef(0);
    let smoothedMouseY = useRef(0);
    let smoothedWindowScrollY = useRef(0);

    useFrame((state) => {
        const { mouse } = state;
        const mouseX = (mouse.x * width) / 2;
        const mouseY = -(mouse.y * height) / 2;

        smoothedMouseX.current = lerp(smoothedMouseX.current, mouseX, 0.05);
        smoothedMouseY.current = lerp(smoothedMouseY.current, mouseY, 0.05);

        const windowScrollY = window.scrollY;
        smoothedWindowScrollY.current = lerp(smoothedWindowScrollY.current, windowScrollY, 0.1);

        // islandRef.current.rotation.x = smoothedMouseY * 0.01;
        islandRef.current.rotation.x =
            smoothedWindowScrollY.current * -0.001 + smoothedMouseY.current * 0.005;

        islandPlaneRef.current.rotation.z =
            smoothedWindowScrollY.current * -0.004 + 0 + smoothedMouseX.current * -0.01;

        islandRef.current.position.y = smoothedWindowScrollY.current * 0.04 + 4;

        islandMaterial.uniforms.time.value = state.clock.getElapsedTime();
    });

    return (
        <group ref={islandRef}>
            <mesh
                ref={islandPlaneRef}
                position={[0, 0, 0]}
                rotation={[2, 0, 0]}
                scale={[1, 1, 1]}
                geometry={new THREE.PlaneGeometry(100, 100, 60, 64, 64)}
                material={islandMaterial}
            />
            {window.innerWidth > 800 && <Stickers position={[0, 4, 0]} />}
        </group>
    );
});

const lerp = function (start, end, amt) {
    return (1 - amt) * start + amt * end;
};

export default Experience;
