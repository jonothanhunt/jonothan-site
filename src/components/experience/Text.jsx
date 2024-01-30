import { Center, Text3D } from "@react-three/drei";
import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

import vertexShader from '../../shaders/overlay/vertex.glsl'
import fragmentShader from '../../shaders/overlay/fragment.glsl'

import { Vector2 } from 'three'

function Text(props)
{
    const { size } = useThree()

    const mesh = useRef();
    const creativeTechnologistText = useRef();
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
            uOpacity: {
                value: 0.0,
            }
        }),
        []
    );

    useFrame((state) =>
    {
        const { clock } = state;
        mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
        mesh.current.material.uniforms.uOpacity.value = props.groupVisibilityProgress.current;
        creativeTechnologistText.current.material.opacity = props.groupVisibilityProgress.current;
        // console.log(props.textVisibilityProgress.current)
    });

    return (
        <group {...props}>
            <group rotation={[Math.PI * - 0.25, 0, 0]} >
                <Center position={[0, 0, 0]}>
                    <Text3D
                        rotation={[0, 0, .4]}
                        // curveSegments={32}
                        // bevelEnabled
                        // bevelSize={0.04}
                        // bevelThickness={0.1}
                        // lineHeight={0.5}
                        // letterSpacing={-0.06}
                        ref={mesh}

                        height={1.2}
                        size={2.6}

                        font="/fonts/atkinson.json"

                    >
                        {`JONOTHAN`}
                        <shaderMaterial
                            fragmentShader={fragmentShader}
                            vertexShader={vertexShader}
                            uniforms={uniforms}
                            // transparent
                        />
                        {/* <meshBasicMaterial wireframe/> */}
                    </Text3D>
                </Center>
                <Center position={[.6, -4, 0]}>
                    <Text3D
                        ref={creativeTechnologistText}
                        rotation={[0, 0, .4]}
                        height={0}
                        size={.5}
                        font="/fonts/atkinson.json"
                    >
                        {`Creative developer`}
                        <meshBasicMaterial transparent opacity={0}/>
                    </Text3D>
                </Center>
            </group>
        </group>
    );
}

export default Text