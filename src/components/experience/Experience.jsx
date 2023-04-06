import './Experience.css'

import React, { useRef, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'

import Background from './Background'
import Header from './Header'
import { Center } from '@react-three/drei'

import { Perf } from 'r3f-perf'
import Planes from './Planes'
import Stickers from './Stickers'

function Experience(props)
{
  const experienceRef = useRef(null)

  return (

    <div ref={experienceRef} className="experience">

      <Suspense>
        <Canvas
          eventSource={props.appRoot} // event source set to app div for mouse movement
          eventPrefix="client" // to get global mouse movement
          linear // to avoid R3F default colour changing to keep css colours the same
          flat // sets toneMapping to THREE.NoToneMapping
          orthographic // creates orthographic camera
          camera={{ zoom: 60, position: [0, 0, 40] }} // sets camera values 60
          dpr={[0.5, 1]}

          resize={{ scroll: true, debounce: { scroll: 50, resize: 0 } }}

          onCreated={() => { experienceRef.current.classList.add('in') }}
        >
          {/* debug if /#debug in URL */}
          {
            window.location.href.indexOf("#debug") > -1 && <Perf position={"top-left"} />
          }

          <TransformGroup />

        </Canvas>
      </Suspense>
    </div>
  )
}

function TransformGroup(props)
{
  const { viewport } = useThree()

  const transformGroup = useRef(null)

  const { width, height } = useThree((state) => state.viewport)
  let windowScrollY = window.scrollY

  let smoothedMouseX = 0
  let smoothedMouseY = 0
  let smoothedWindowScrollY = 0

  useFrame((state) =>
  {
    // MOUSE
    const { mouse } = state;
    const mouseX = (mouse.x * width) / 2
    const mouseY = - (mouse.y * height) / 2

    smoothedMouseX = lerp(smoothedMouseX, mouseX, 0.05)
    smoothedMouseY = lerp(smoothedMouseY, mouseY, 0.05)

    // SCROLL
    windowScrollY = window.scrollY
    smoothedWindowScrollY = lerp(smoothedWindowScrollY, windowScrollY, 0.1)

    transformGroup.current.rotation.x = smoothedMouseY * 0.014 + (smoothedWindowScrollY * 0.001)
    transformGroup.current.rotation.y = smoothedMouseX * 0.01
    transformGroup.current.rotation.z = - smoothedWindowScrollY * 0.0005

    transformGroup.current.position.y = (smoothedWindowScrollY * 0.02) * (viewport.height / viewport.width) * 2, 20
  });

  return (
    <>
      <Background />

      <Center onCentered={({ container, height, width }) => { container.scale.setScalar([(Math.min(viewport.width / width * 1, 1))]) }} bottom position={[0, 7.4 - (1 / (viewport.width / viewport.height)), 0]} >
        <group ref={transformGroup}>
          <Header />
          <Stickers />
          <Planes />

        </group>
      </Center>
    </>
  )

}

const lerp = function (start, end, amt)
{
  return (1 - amt) * start + amt * end
}


export default Experience