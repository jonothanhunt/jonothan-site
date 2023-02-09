import { useEffect, useRef, useState, useMemo, useLayoutEffect } from "react";
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { useControls, button } from 'leva'
import
{
    useGLTF,
    useTexture,
    Environment,
    MeshTransmissionMaterial,
    Float,
    meshPhysicalMaterial
} from '@react-three/drei'

import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import './Experience.css'
// import { MeshPhysicalMaterial } from "three";
import { Bloom, EffectComposer } from '@react-three/postprocessing'

const Experience = (props) =>
{
    return (

        <div className="experience">

            <Canvas linear shadows orthographic camera={{ position: [10, 6, 20], zoom: 80 }} gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.NoToneMapping }}>
                {/* <color attach="background" args={["red"]} /> */}
                {/* orthographic camera={{ position: [10, 6, 20], zoom: 80 }} */}
                {/* <PageCamera /> */}

                <InstancedBubbles />
                {/* <EffectComposer> */}
                <Text color="#fef4ef" scale={[14, 14, 14]} rotation={[0, 0, 0]} position={[0, 1, 0]} />



                {/* <Bloom mipmapBlur intensity={0.1} /> */}

                {/* </EffectComposer> */}
            </Canvas>

        </div>

    )
}

export function Text({ color, ...props })
{
    const texture = useTexture(require('../resources/dark_mode_jonothan.jpg'))
    texture.flipY = false
    const { nodes, materials } = useGLTF(require("../resources/jonothan.glb"));

    const { size } = useThree()
    const resizedFromX = size.width / 100

    const textRef = useRef(null)
    useFrame((state) =>
    {
        const windowScrollY = window.scrollY

        textRef.current.rotation.x = windowScrollY / -1000
        textRef.current.rotation.z = windowScrollY / 2600

        textRef.current.scale.set(resizedFromX, resizedFromX, resizedFromX)
        textRef.current.position.y = - (size.width / 400) + 4 //+ windowScrollY / 130

    })

    return (
        <group ref={textRef} {...props} dispose={null} >
            <mesh geometry={nodes.Plane.geometry}>
                <meshBasicMaterial map={texture} />
            </mesh>
            <mesh geometry={nodes.Text.geometry}>
                <meshBasicMaterial map={texture} />
            </mesh>
        </group >
    );
}

function InstancedBubbles({ count = 7, temp = new THREE.Object3D() })
{
    const ref = useRef()
    useEffect(() =>
    {
        // Set positions
        for (let i = 0; i < count; i++)
        {
            temp.position.set(
                Math.random() * 3,
                Math.random() * 3,
                Math.random() * 3
            )
            temp.scale.set(3, 3, 3)

            temp.updateMatrix()
            ref.current.setMatrixAt(i, temp.matrix)
        }
        // Update the instance
        ref.current.instanceMatrix.needsUpdate = true
    }, [])
    return (
        <instancedMesh ref={ref} args={[null, null, count]}>
            <sphereGeometry />
            <meshPhysicalMaterial
                roughness={0}
                transmission={1}
                thickness={0.035}
                depthTest={false}
                depthWrite={false}
                envMapIntensity={5}
                ior={1}
            />
        </instancedMesh>
    )
}

useGLTF.preload(require("../resources/jonothan.glb"));

export default Experience