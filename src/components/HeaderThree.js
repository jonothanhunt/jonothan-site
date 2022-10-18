import { useEffect, useRef } from "react";

import './HeaderThree.css'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const HeaderThree = (props) =>
{

    const canvasRef = useRef(null);

    useEffect(() =>
    {
        /**
         * Loaders
         */
        // Texture loader
        const textureLoader = new THREE.TextureLoader()

        // Draco loader
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('draco/')

        // GLTF loader
        const gltfLoader = new GLTFLoader()
        gltfLoader.setDRACOLoader(dracoLoader)


        // canvas height
        const canvasRefW = window.innerWidth;
        const canvasRefH = window.innerHeight;

        var scene = new THREE.Scene();

        // camera
        // var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        let aspect = window.innerWidth / window.innerHeight;
        let frustumSize = 1.5

        var camera = new THREE.OrthographicCamera(
            frustumSize * aspect / - 2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            frustumSize / - 2,
            0.1,
            1000
        );

        var renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        renderer.setClearColor(0xf0f0f0);
        renderer.setSize(canvasRefW, canvasRefH);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        canvasRef.current.appendChild(renderer.domElement);

        camera.position.z = 10;
        // camera.position.y = -0.3;

        // Texture
        const bakedTexture = textureLoader.load(require('../resources/baked.jpg'))

        // Material
        const bakedMaterial = new THREE.MeshBasicMaterial({
            map: bakedTexture,
            opacity: 0.5
        })

        bakedTexture.flipY = false

        const group = new THREE.Group()

        // Model
        gltfLoader.load(
            require('../resources/jonothan.glb'),
            (gltf) =>
            {
                gltf.scene.traverse((child) =>
                {
                    child.material = bakedMaterial

                })

                gltf.scene.scale.set(1, 1, 1)

                gltf.scene.rotation.x = 0.4
                gltf.scene.rotation.y = 0.3
                gltf.scene.position.y = -0.2


                group.add(gltf.scene)
                group.scale.set(aspect, aspect, aspect)
                group.position.y = 0.4
                scene.add(group)
                // console.log("loaded")
            }
        )

        const hdrEquirect = textureLoader.load(require('../resources/warehouse.jpg'),
            () =>
            {
                hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
            })

        const geometry = new THREE.SphereGeometry(0.1, 32, 32);
        const material = new THREE.MeshPhysicalMaterial({
            roughness: 0,
            transmission: 1,
            thickness: 0.02,
            depthTest: false,
            envMap: hdrEquirect,
            envMapIntensity: 5
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.scale.set(aspect, aspect, aspect)
        mesh.position.set(0, 0, 0.2)
        group.add(mesh);

        const light = new THREE.AmbientLight({
            color: 0x404040,
            intensity: 10
        }); // soft white light
        scene.add(light);

        console.log(mesh.position)


        window.addEventListener('mousemove', (event) =>
        {
            const mouseX = (event.clientX / window.innerWidth) * 0.3
            const mouseY = - (event.clientY / window.innerHeight) * 0.3
            mesh.position.set(mouseX, mouseY, 0.2)
            // console.log(mesh.position)
        });

        var animate = function ()
        {
            requestAnimationFrame(animate);

            group.rotation.x = - window.scrollY / 700
            group.position.y = 0.4 + (window.scrollY / 1000)

            const newOpacity = Math.max(Math.min(2 - (window.scrollY / 200), 1), 0)

            if (newOpacity !== bakedMaterial.opacity)
            {
                bakedMaterial.opacity = newOpacity
                bakedMaterial.needsUpdate = true
            }

            // mesh.rotateX(0.1)

            renderer.render(scene, camera);

            // console.log("animate")
        };

        let onWindowResize = function ()
        {
            // const orCanvasRefW = window.innerWidth;
            // const orCanvasRefH = window.innerHeight;

            // camera.aspect = orCanvasRefW / orCanvasRefH;
            // camera.updateProjectionMatrix();

            // renderer.setSize(orCanvasRefW, orCanvasRefH);

            aspect = window.innerWidth / window.innerHeight;
            // frustumSize = Math.max(6 * (1 - aspect), 1)

            group.scale.set(aspect, aspect, aspect)

            camera.left = - frustumSize * aspect / 2;
            camera.right = frustumSize * aspect / 2;
            camera.top = frustumSize / 2;
            camera.bottom = - frustumSize / 2;

            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);

            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        };

        window.addEventListener("resize", onWindowResize, false);

        animate();

        const cleanupObject = canvasRef.current

        return () => cleanupObject.removeChild(renderer.domElement);

    }, []);


    return (
        <div className="webgl" ref={canvasRef}></div>
    )

}

export default HeaderThree

