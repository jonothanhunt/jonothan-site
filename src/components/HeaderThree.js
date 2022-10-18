import { useEffect, useRef } from "react";

import './HeaderThree.css'

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

const HeaderThree = (props) =>
{
    const canvasRef = useRef(null);

    useEffect(() =>
    {

        const canvasRefW = canvasRef.current.getBoundingClientRect().width;
        const canvasRefH = canvasRef.current.getBoundingClientRect().height;

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(75, canvasRefW / canvasRefH, 0.1, 1000);
        var renderer = new THREE.WebGLRenderer({
            antialias: true
        });

        renderer.setSize(canvasRefW, canvasRefH);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        canvasRef.current.appendChild(renderer.domElement);

        var geometry = new THREE.BoxGeometry(1, 1, 1);
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        var cube = new THREE.Mesh(geometry, material);

        scene.add(cube);
        camera.position.z = 5;

        var animate = function ()
        {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);

            // console.log("animate")
        };

        let onWindowResize = function ()
        {
            const orCanvasRefW = canvasRef.current.getBoundingClientRect().width;
            const orCanvasRefH = canvasRef.current.getBoundingClientRect().height;

            camera.aspect = orCanvasRefW / orCanvasRefH;
            camera.updateProjectionMatrix();

            renderer.setSize(orCanvasRefW, orCanvasRefH);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        };

        window.addEventListener("resize", onWindowResize, false);

        animate();

        return () => canvasRef.current.removeChild(renderer.domElement);

    }, []);


    return (
        <div className="webgl" ref={canvasRef}></div>
    )

}

export default HeaderThree

