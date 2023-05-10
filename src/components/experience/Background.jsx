import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

import vertexShader from '../../shaders/overlay_plane/vertex.glsl'
import fragmentShader from '../../shaders/overlay_plane/fragment.glsl'

import { Vector2 } from 'three'


function Background(props)
{
    const { size } = useThree()

    const mesh = useRef();
    const uniforms = useMemo(
        () => ({
            uTime: {
                value: 0.0,
            },
            uScale: {
                value: 1,
            },
            uResolution: {
                value: new Vector2(size.height, size.height)
            },
            uOffset: {
                value: 0
            }
        }),
        []
    );

    let smoothedWindowScrollY = 0;
    useFrame((state) =>
    {
        const { clock } = state;
        mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();

        const windowScrollY = window.scrollY
        smoothedWindowScrollY = lerp(smoothedWindowScrollY, windowScrollY, 0.1)
        mesh.current.material.uniforms.uOffset.value = smoothedWindowScrollY * 0.001
    });

    return (
        <group {...props}>
            <mesh position={[0, 0, 0]} rotation={[Math.PI * - 0.25, 0, 0]} ref={mesh}>
                <planeGeometry args={[2, 2, 1, 1]} />
                <shaderMaterial
                    fragmentShader={fragmentShader}
                    vertexShader={vertexShader}
                    uniforms={uniforms}
                />
            </mesh>
        </group>
    );
}

const lerp = function (start, end, amt)
{
    return (1 - amt) * start + amt * end
}

export default Background