import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'

import vertexShader from '../../shaders/bubble_3/vertex.glsl'
import fragmentShader from '../../shaders/bubble_3/fragment.glsl'

import { Object3D, sRGBEncoding } from 'three'

const Bubbles = (props) =>
{
    const { size } = useThree();

    const instancedBubblesRef = useRef()

    const count = 5

    const uniforms = useMemo(
        () => ({
            uTexture: {
                value: null
            },
            uScale: {
                value: 0.0
            },
            uSize: {
                value: size.width / 10,
            },
        }),
    );

    useEffect(() =>
    {
        const bubble = new Object3D()
        // Set positions
        for (let i = 0; i < count; i++)
        {
            bubble.position.set(
                (i / count - 0.5) * 16 + ((Math.random() - 0.5) * 2),
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            )
            const randomScale = 0.3 + (Math.random() * 1.2)
            bubble.scale.set(randomScale, randomScale, randomScale)

            bubble.updateMatrix()
            instancedBubblesRef.current.setMatrixAt(i, bubble.matrix)
        }
        // Update the instance
        instancedBubblesRef.current.instanceMatrix.needsUpdate = true
    }, [])

    const mainRenderTarget = useFBO({ width: size.width / 4, height: size.height / 4, encoding: sRGBEncoding, stencilBuffer: false });
    
    useFrame((state) =>
    {
        // console.log(props.groupVisibilityProgress.current)
        instancedBubblesRef.current.visible = false;
        
        const { gl, scene, camera } = state;
        gl.setRenderTarget(mainRenderTarget);
        gl.render(scene, camera);
        instancedBubblesRef.current.material.uniforms.uTexture.value = mainRenderTarget.texture
        instancedBubblesRef.current.material.uniforms.uScale.value = props.groupVisibilityProgress.current;

        instancedBubblesRef.current.visible = true;
        instancedBubblesRef.current.material.needsUpdate = true;
        gl.setRenderTarget(null);
    })

    return (
        <group {...props}>
            <instancedMesh frustumCulled={false} ref={instancedBubblesRef} args={[null, null, count]}>
                <planeGeometry args={[2, 2, 1, 1]} />
                <shaderMaterial
                    fragmentShader={fragmentShader}
                    vertexShader={vertexShader}
                    uniforms={uniforms}
                    depthTest={false}
                    writeTest={false}
                    // transparent
                />
            </instancedMesh>
        </group>
    )
}

export default Bubbles