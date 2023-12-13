// 
"use strict";

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene;
let camera;
let renderer

start();
function start() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000, 1.0);
    camera.position.x = 1;
    camera.position.y = 1;
    camera.position.z = 1;
    camera.lookAt(scene.position);

    // add spotlight for the shadows
    let spotLight = new THREE.DirectionalLight(0xffffff);
    spotLight.position.set(50, 50, 50);
    spotLight.castShadow = true;
    spotLight.intensity = 2;
    scene.add(spotLight);

    let ambiLight = new THREE.AmbientLight(0x333333);
    scene.add(ambiLight);

    loadModel();

    document.body.appendChild( renderer.domElement );

    animate();
}

function loadModel() {
    const loader = new GLTFLoader();
    loader.load( './public/untitled2.glb', function ( gltf ) {
    scene.add( gltf.scene );
    }, undefined, function ( error ) {
        console.error( error );
    } );
}

function animate() {
    requestAnimationFrame( animate );
    loadModel();
    renderer.render( scene, camera );
}

