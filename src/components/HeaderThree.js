import { useEffect, useRef, useState } from "react";

import './HeaderThree.css'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'

const HeaderThree = (props) =>
{

    const canvasRef = useRef(null);

    const [threeVisible, setThreeVisibility] = useState(false);

    useEffect(() =>
    {
        // VARIABLES

        let mouseX = 0
        let mouseY = 0

        let mobileWidth = window.innerWidth <= 400

        const main1Colour = new THREE.Color(0xf0f0f0)

        // LOADERS

        const loadingManager = new THREE.LoadingManager();
        loadingManager.onLoad = () =>
        {
            setThreeVisibility(true)
        }

        // Texture loader
        const textureLoader = new THREE.TextureLoader(loadingManager)

        // GLTF loader
        const gltfLoader = new GLTFLoader(loadingManager)


        // EXPERIENCE VARIABLES

        // Canvas dims
        const canvasRefW = window.innerWidth;
        const canvasRefH = window.innerHeight;


        // SETUP

        // Scene setup
        var scene = new THREE.Scene();

        const group = new THREE.Group()

        const mouseMoveGroup = new THREE.Group()
        group.add(mouseMoveGroup);

        scene.add(group)

        // Camera
        let aspect = window.innerWidth / window.innerHeight;
        let frustumSize = 1.5

        // var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
        renderer.setSize(canvasRefW, canvasRefH);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        canvasRef.current.appendChild(renderer.domElement);


        // JONOTHAN 3D

        // Jonothan texture
        const jonothanTextureBaked = textureLoader.load(require('../resources/baked.jpg'))
        jonothanTextureBaked.flipY = false

        // Jonothan Material
        const jonothanMaterialBaked = new THREE.MeshBasicMaterial({
            map: jonothanTextureBaked,
        })

        // Jonothan Model
        const jonothanGroup = new THREE.Group()
        group.add(jonothanGroup)

        gltfLoader.load(
            require('../resources/jonothan.glb'),
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

                group.scale.set(aspect, aspect, aspect)

                group.position.y = 0.4
            }
        )

        // PLANE BLOCKER

        const planeMaterial = new THREE.MeshBasicMaterial({
            color: main1Colour,
            depthTest: false,
            transparent: true,
            opacity: 0
        })

        const planeGeometry = new THREE.PlaneGeometry(10, 10);
        const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial)
        scene.add(planeMesh)


        // IMPORTS FOR OBJECTS

        // HDR import
        const hdrEquirect = textureLoader.load(require('../resources/warehouse.jpg'),
            () =>
            {
                hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
            })

        // DECORATION ELEMENTS

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

        // Non-refraction Material
        const nonRefractMaterial = new THREE.MeshStandardMaterial({
            color: main1Colour,
            envMap: hdrEquirect,
            envMapIntensity: 3,
            roughness: 0,
            transparent: true,
            depthTest: false
        })

        // Top refraction bubble
        const bubbleGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const bubbleMesh = new THREE.Mesh(bubbleGeometry, refractMaterial);
        bubbleMesh.position.set(0.1, -0.1, 0.2) // 0.2
        mouseMoveGroup.add(bubbleMesh)

        // Donut
        const donutGeometry = new THREE.TorusGeometry(0.13, 0.07, 16, 100);
        const donutMesh = new THREE.Mesh(donutGeometry, nonRefractMaterial)
        donutMesh.position.set(-0.3, -0.7, 0.2)
        donutMesh.rotation.set(-0.7, 0.3, 0)
        mouseMoveGroup.add(donutMesh)


        // MINI BUBBLES

        const count = 6
        const geometries = []

        for (let i = 0; i < count; i++)
        {
            const miniBubbleGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            const miniBubbleX = (Math.random() - 0.5) * 1.5
            const miniBubbleY = (Math.random() - 0.5) * 0.7
            const miniBubbleZ = (Math.random() - 0.5) * 5

            miniBubbleGeometry.translate(miniBubbleX, miniBubbleY, miniBubbleZ)

            geometries.push(miniBubbleGeometry)
        }

        const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(geometries)
        const miniBubbleMesh = new THREE.Mesh(mergedGeometry, refractMaterial)
        mouseMoveGroup.add(miniBubbleMesh)

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

            mobileWidth = windowWidth <= 400

            aspect = windowWidth / windowHeight;

            group.scale.set(aspect, aspect, aspect)

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

            // Rotation and position of Jonothan
            jonothanGroup.rotation.x = - window.scrollY / 700
            group.position.y = 0.4 + (window.scrollY / 1000)

            // Opacity of Jonothan
            const newOpacity = 1 - Math.max(Math.min(3 - (window.scrollY / 100), 1), 0)

            if (newOpacity !== planeMaterial.opacity)
            {
                if (newOpacity === 1)
                {
                    jonothanGroup.visible = false
                    bubbleMesh.visible = false
                    planeGeometry.visible = false
                }
                else
                {
                    jonothanGroup.visible = true
                    bubbleMesh.visible = true
                    planeGeometry.visible = true
                }

                planeMaterial.opacity = newOpacity
                planeMaterial.needsUpdate = true

            }

            // Mouse animation

            if (!mobileWidth)
            {
                const lerpedMouseX = lerp(mouseMoveGroup.position.x, mouseX, 0.1)
                const lerpedMouseY = lerp(mouseMoveGroup.position.y, mouseY, 0.1)

                mouseMoveGroup.position.x = lerpedMouseX
                mouseMoveGroup.position.y = lerpedMouseY

                mouseMoveGroup.rotation.y = lerpedMouseX

                jonothanGroup.rotation.y = lerpedMouseX
                jonothanGroup.rotation.z = lerpedMouseX / 2

                jonothanGroup.rotation.x = - lerpedMouseY - window.scrollY / 700
            }

            // Render frame
            renderer.render(scene, camera);

        };
        animate();


        // REACT CLEANUP STUFF

        const cleanupObject = canvasRef.current
        return () => cleanupObject.removeChild(renderer.domElement);

    }, []);

    return (
        <div className={threeVisible ? "webgl active" : "webgl"} ref={canvasRef}></div>
    )

}

export default HeaderThree

