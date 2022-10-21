import { useEffect, useRef, useState } from "react";

import './HeaderThree.css'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const HeaderThree = (props) =>
{
    const canvasRef = useRef(null);
    const bubbleImage = useRef(null);

    const [threeVisible, setThreeVisibility] = useState(false);

    useEffect(() =>
    {
        // VARIABLES
        let mouseX = 0
        let mouseY = 0

        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let aspect = window.innerWidth / window.innerHeight;

        const main1Colour = new THREE.Color(0x003b49) // new THREE.Color(0xf0f0f0)


        // LOADERS
        const loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = () =>
        {
            setThreeVisibility(true)
        }
        const textureLoader = new THREE.TextureLoader(loadingManager)
        const gltfLoader = new GLTFLoader(loadingManager)


        // EXPERIENCE VARIABLES
        // Scene setup
        var scene = new THREE.Scene();

        // Groups
        const mainGroup = new THREE.Group()
        mainGroup.scale.set(aspect, aspect, aspect)
        mainGroup.position.y = 0.4
        scene.add(mainGroup)

        const mouseMoveGroup = new THREE.Group()
        mainGroup.add(mouseMoveGroup);

        const jonothanGroup = new THREE.Group()
        mainGroup.add(jonothanGroup)

        // Camera
        let frustumSize = 1.5
        var camera = new THREE.OrthographicCamera(
            frustumSize * aspect / - 2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / - 2,
            0.1,
            1000
        );
        camera.position.z = 10;

        // Renderer
        var renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setClearColor(main1Colour);
        renderer.setSize(windowWidth, windowHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        canvasRef.current.appendChild(renderer.domElement);


        // JONOTHAN 3D
        // Jonothan texture
        const jonothanTextureBaked = textureLoader.load(require('../resources/dark_mode_jonothan.jpg'))
        jonothanTextureBaked.flipY = false

        // Jonothan Material
        const jonothanMaterialBaked = new THREE.MeshBasicMaterial({
            map: jonothanTextureBaked,
        })

        // Jonothan Model
        gltfLoader.load(
            require('../resources/jonothan.glb'),
            // require('../resources/site_dark_combined.glb'),
            (gltf) =>
            {
                gltf.scene.traverse((child) =>
                {
                    child.material = jonothanMaterialBaked
                })

                gltf.scene.scale.set(1, 1, 1)
                gltf.scene.rotation.x = 0.4
                gltf.scene.rotation.y = 0.3
                gltf.scene.position.y = -0.2

                jonothanGroup.add(gltf.scene)
            }
        )


        // PLANE BLOCKER
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: main1Colour,
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity: 0
        })
        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
        planeMesh.renderOrder = 0
        scene.add(planeMesh)

        // BUBBLES
        // HDR import
        const hdrEquirect = textureLoader.load(require('../resources/warehouse.jpg'),
            () =>
            {
                hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
            })

        // Refraction Material
        const refractMaterial = new THREE.MeshPhysicalMaterial({
            roughness: 0,
            transmission: 1,
            thickness: 0.035,
            depthTest: false,
            depthWrite: false,
            envMap: hdrEquirect,
            envMapIntensity: 5,
            // ior: 4
        });

        const geometries = []

        const bubbleCount = 8

        for (let i = 0; i < bubbleCount; i++)
        {
            const miniBubbleX = (Math.random() - 0.5) * 1.25
            const miniBubbleY = (Math.random() - 0.5) * 0.7
            const miniBubbleZ = (i / bubbleCount - 0.5) * 5
            const miniBubbleScale = (miniBubbleZ + 2.5) / 50 + 0.01
            const miniBubbleGeometry = new THREE.SphereGeometry(miniBubbleScale, 16, 16);
            miniBubbleGeometry.translate(miniBubbleX, miniBubbleY, miniBubbleZ)

            if (i == Math.floor(bubbleCount / 2)) // Big bubble
            {
                const bubbleGeometry = new THREE.SphereGeometry(0.18, 32, 32);
                bubbleGeometry.translate(0.1, -0.1, 0.2) // 0.2
                bubbleGeometry.renderOrder = 1
                geometries.push(bubbleGeometry)
            }

            geometries.push(miniBubbleGeometry)
        }

        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
        const bubblesMesh = new THREE.Mesh(mergedGeometry, refractMaterial)
        bubblesMesh.renderOrder = 2
        mouseMoveGroup.add(bubblesMesh)



        // HELPER FUNCTIONS

        const lerp = function (start, end, amt)
        {
            return (1 - amt) * start + amt * end
        }


        // MOUSE MOVE HANDLER

        window.addEventListener('mousemove', (event) =>
        {
            mouseX = (event.clientX / window.innerWidth) * 0.1
            mouseY = - (event.clientY / window.innerHeight) * 0.1
        });


        // WINDOW RESIZE HANDLER

        let onWindowResize = function ()
        {
            const windowWidth = window.innerWidth
            const windowHeight = window.innerHeight

            aspect = windowWidth / windowHeight;
            mainGroup.scale.set(aspect, aspect, aspect)

            camera.left = - frustumSize * aspect / 2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = - frustumSize / 2;
            camera.updateProjectionMatrix();

            renderer.setSize(windowWidth, windowHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        };
        window.addEventListener("resize", onWindowResize, false);


        // ANIMATE
        var animate = function ()
        {
            // Request animation frame
            requestAnimationFrame(animate);

            const windowScrollY = window.scrollY

            // Rotation and position of Jonothan
            jonothanGroup.rotation.x = - windowScrollY / 700
            mainGroup.position.y = 0.4 + (windowScrollY / 1000)

            // Scroll progress
            const firstScrollProgress = 1 - Math.max(Math.min(3 - (windowScrollY / 100), 1), 0)

            // There is a change since last frame
            if (firstScrollProgress !== planeMaterial.opacity)
            {
                const firstScrollProgressEnd = !(firstScrollProgress === 1)

                jonothanGroup.visible = firstScrollProgressEnd
                planeGeometry.visible = firstScrollProgressEnd
                bubblesMesh.visible = firstScrollProgressEnd

                planeMaterial.opacity = firstScrollProgress
                planeMaterial.needsUpdate = true
            }

            // Mouse animation
            const lerpedMouseX = lerp(mouseMoveGroup.position.x, mouseX, 0.1)
            const lerpedMouseY = lerp(mouseMoveGroup.position.y, mouseY, 0.1)

            mouseMoveGroup.position.x = lerpedMouseX
            mouseMoveGroup.position.y = lerpedMouseY
            mouseMoveGroup.rotation.y = lerpedMouseX

            jonothanGroup.rotation.y = lerpedMouseX
            jonothanGroup.rotation.z = lerpedMouseX / 2
            jonothanGroup.rotation.x = - lerpedMouseY - window.scrollY / 700

            // Bubble image transform
            bubbleImage.current.style.transform = `translate(${lerpedMouseX * 400}px, ${- windowScrollY + (- lerpedMouseY * 400)}px)`

            // Render frame
            renderer.render(scene, camera);
        };
        animate();


        // REACT CLEANUP STUFF

        const cleanupObject = canvasRef.current
        return () => cleanupObject.removeChild(renderer.domElement);

    }, []);

    return (
        <>
            <div className={threeVisible ? "webgl active" : "webgl"} ref={canvasRef}></div>
            <img ref={bubbleImage} alt={""} className={threeVisible ? "bubble-image active" : "bubble-image"} src={require('../resources/bubble_dark_mode.png')} />
        </>
    )

}

export default HeaderThree

