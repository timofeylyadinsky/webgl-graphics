"use strict";

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    //const camera = new THREE.OrthographicCamera();
    
    // camera.left = window.innerWidth / -2;
    // camera.right = window.innerWidth / 2;
    // camera.top = window.innerHeight / 2;
    // camera.bottom = window.innerHeight / -2;
    // camera.near = 0.001;
    // camera.far = 1500;

    // camera.updateProjectionMatrix();



    // renderer.shadowMapEnabled = true;
    // renderer.shadowMap.enabled = true;
    // renderer.shadowMap.type = THREE.PCFSoftShadowMap;

   
    camera.position.x = 15;
    camera.position.y = 15;
    camera.position.z = -10;
    camera.lookAt(scene.position);

//Create a WebGLRenderer and turn on shadows in the renderer
const renderer = new THREE.WebGLRenderer();
// renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setClearColor(0x000000, 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

//Create a DirectionalLight and turn on shadows for the light
const light = new THREE.DirectionalLight( 0xff00ff, 1 );
light.position.set( 0, -1, 0 ); //default; light shining from top
light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default

//Create a sphere that cast shadows (but does not receive them)
const sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } );
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.castShadow = true; //default is false
sphere.receiveShadow = false; //default
scene.add( sphere );

//Create a plane that receives shadows (but does not cast them)
const planeGeometry = new THREE.PlaneGeometry( 20, 20, 32, 32 );
const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
scene.add( plane );

//Create a helper for the shadow camera (optional)
const helper = new THREE.CameraHelper( light.shadow.camera );
scene.add( helper );


document.body.appendChild( renderer.domElement );
renderer.render( scene, camera );