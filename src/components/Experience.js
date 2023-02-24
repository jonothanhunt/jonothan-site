import './Experience.css'

import { useEffect, useRef } from "react";
import * as THREE from 'three'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { Perf } from 'r3f-perf'
import
{
    useProgress,
    useGLTF,
    useTexture,
    Float,
    Sparkles
} from '@react-three/drei'

const Experience = (props) =>
{

    return (

        // canvas wrapper for css fade in
        <div className={useProgress().loaded == 6 ? "experience active" : "experience"}>

            {/* R3F canvas */}
            <Canvas
                eventSource={props.appRoot} // event source set to app div for mouse movement
                eventPrefix="client" // to get global mouse movement
                linear // to avoid R3F default colour changing to keep css colours the same
                flat // sets toneMapping to THREE.NoToneMapping
                orthographic // creates orthographic camera
                camera={{ position: [-10, 4, 20], rotation: [-.3, -.45, -.16], zoom: 70 }} // sets camera values
            >
                {/* debug if /#debug in URL */}
                {
                    window.location.href.indexOf("#debug") > -1 && <Perf position={"top-left"} />
                }

                {/* sets scene background (mostly to avoid plane edge being visisble in physical material refraction) */}
                <color attach="background" args={[0, 59 / 255, 73 / 255]} />

                {/* All 3D objects in group with movement effects on scroll and mouse move */}
                <Scene />

            </Canvas>

        </div>

    )
}

// Imported glb of text with baked texture
function Text({ color, ...props })
{
    const texture = useTexture(require('../resources/dark_mode_jonothan.jpg'))
    texture.flipY = false
    const { nodes, materials } = useGLTF(require("../resources/jonothan.glb"));

    const textMaterial = new THREE.MeshBasicMaterial({ map: texture })

    return (
        <group {...props} >
            <mesh geometry={nodes.Plane.geometry} material={textMaterial} />
            <mesh geometry={nodes.Text.geometry} material={textMaterial} />
        </group >
    );
}

// Instanced bubbles
function Bubbles({ count = 6, bubble = new THREE.Object3D(), ...props })
{
    const instancedBubblesRef = useRef()

    const hdrEquirect = useTexture(require('../resources/gradient.jpg'))
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

    useEffect(() =>
    {
        // Set positions
        for (let i = 0; i < count; i++)
        {
            bubble.position.set(
                (i / count - 0.5) * 10 + ((Math.random() - 0.5) * 2),
                Math.random() * 5,
                (Math.random() - 0.5) * 10
            )
            const randomScale = 0.3 + (Math.random() * 1.2)
            bubble.scale.set(randomScale, randomScale, randomScale)

            bubble.updateMatrix()
            instancedBubblesRef.current.setMatrixAt(i, bubble.matrix)
        }
        // Update the instance
        instancedBubblesRef.current.instanceMatrix.needsUpdate = true
    }, [])

    return (
        <group {...props}>
            <instancedMesh ref={instancedBubblesRef} args={[null, null, count]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshPhysicalMaterial
                    roughness={0}
                    transmission={1}
                    thickness={1}
                    depthTest={false}
                    depthWrite={false}
                    envMapIntensity={5}
                    ior={1.2}
                    envMap={hdrEquirect}
                />
            </instancedMesh>
        </group>
    )
}

// Preload textures
useGLTF.preload(require("../resources/jonothan.glb"));
useGLTF.preload(require('../resources/gradient.jpg'))

// All 3D objects in group with movement effects on scroll and mouse move
function Scene()
{
    const { viewport } = useThree()
    const sceneRef = useRef(null)

    const textRef = useRef(null)
    const bubblesRef = useRef(null)

    const { size } = useThree()
    const resizedFromX = size.width * 0.0008

    let mouseX = 0
    let mouseY = 0

    let smoothedMouseX = 0
    let smoothedMouseY = 0

    let smoothedWindowScrollY = 0


    useFrame(({ mouse }) =>
    {

        const windowScrollY = window.scrollY
        smoothedWindowScrollY = lerp(smoothedWindowScrollY, windowScrollY, 0.05)

        mouseX = (mouse.x * viewport.width) / 2
        mouseY = - (mouse.y * viewport.height) / 2
        smoothedMouseX = lerp(smoothedMouseX, mouseX, 0.05)
        smoothedMouseY = lerp(smoothedMouseY, mouseY, 0.05)

        sceneRef.current.rotation.y = smoothedMouseX * 0.01
        sceneRef.current.rotation.x = smoothedMouseY * 0.01
        sceneRef.current.rotation.z = smoothedMouseY * 0.01
        sceneRef.current.scale.set(resizedFromX, resizedFromX, resizedFromX)
        sceneRef.current.position.y = (size.height / size.width) * 2 - 2.6

        textRef.current.rotation.x = windowScrollY / -2400
        textRef.current.rotation.z = windowScrollY / -4000

        textRef.current.position.y = (windowScrollY / 60) * (1000 / size.width)

        bubblesRef.current.rotation.x = smoothedWindowScrollY * 0.002

    })

    const lerp = function (start, end, amt)
    {
        return (1 - amt) * start + amt * end
    }

    return (
        <group ref={sceneRef}>
            <Float
                floatIntensity={10}
                floatingRange={5}

            >
                <group ref={bubblesRef}>
                    <Bubbles />
                </group>
            </Float>

            <group ref={textRef} scale={[14, 14, 14]} rotation={[0, 0, 0]} position={[0, 0, 0]}>
                <Text color="#fef4ef" />
                <Sparkles position={[0, .5, 0]} count={40} speed={1} size={10} scale={1} noise={0.006} />
            </group>

        </group>
    )

}

export default Experience