// 
"use strict";

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


let scene;
let camera;
let renderer;
let control;

start();
function start() {
    scene = new THREE.Scene();
    // camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera = new THREE.OrthographicCamera();
    
    camera.left = window.innerWidth / -2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = window.innerHeight / -2;
    camera.near = 0.001;
    camera.far = 1500;
    // camera.left = -1;
    // camera.right = 1;
    // camera.top = 1;
    // camera.bottom = -1;
    // camera.near = 0.001;
    // camera.far = 1500;
    // // camera.zoom = 100

    console.log(camera);
    camera.updateProjectionMatrix();
    console.log(camera);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000, 1.0);

   
    camera.position.x = -140;
    camera.position.y = 120;
    camera.position.z = 100;
    camera.lookAt(scene.position);
    //scene.add(new THREE.GridHelper(100, 300));
    
    control = new function () {
        this.left = camera.left;
        this.right = camera.right;
        this.top = camera.top;
        this.bottom = camera.bottom;
        this.far = camera.far;
        this.near = camera.near;

        this.updateCamera = function () {
            camera.left = control.left;
            camera.right = control.right;
            camera.top = control.top;
            camera.bottom = control.bottom;
            camera.far = control.far;
            camera.near = control.near;

            camera.updateProjectionMatrix();
        };
    };

    
    let spotLight = new THREE.DirectionalLight(0xffffff);
    spotLight.position.set(-500, 200, 300);
    spotLight.castShadow = true;
    spotLight.intensity = 2;
    scene.add(spotLight);

    let ambiLight = new THREE.AmbientLight(0x333333);
    scene.add(ambiLight);

    loadModel();

    document.body.appendChild( renderer.domElement );

    addControls(control);

    animate();
}

function loadModel() {
    const loader = new GLTFLoader();
    loader.load( './public/untitled3.glb', function ( gltf ) {
        gltf.scene.scale.set(500, 500, 500);
        console.log(gltf);
    scene.add( gltf.scene );
    animate();
    }, undefined, function ( error ) {
        console.error( error );
    } );


}

function animate() {
    //camera.lookAt(scene.position);
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
}


function addControls(controlObject) {
    var gui = new dat.GUI();
    gui.add(controlObject, 'left', -1000, 0).onChange(controlObject.updateCamera);
    gui.add(controlObject, 'right', 0, 1000).onChange(controlObject.updateCamera);
    gui.add(controlObject, 'top', 0, 1000).onChange(controlObject.updateCamera);
    gui.add(controlObject, 'bottom', -1000, 0).onChange(controlObject.updateCamera);
    gui.add(controlObject, 'far', 100, 2000).onChange(controlObject.updateCamera);
    gui.add(controlObject, 'near', 0, 200).onChange(controlObject.updateCamera);
}

// let rotateX = document.getElementById("rotateX");
// rotateX.value = camera.position.x;
// rotateX.oninput = function() {
//     camera.position.x = rotateX.value
//     requestAnimationFrame( animate );
// }
// let rotateY = document.getElementById("rotateY");
// rotateY.value = camera.position.y;
// rotateY.oninput = function() {
//     camera.position.y = rotateY.value
//     requestAnimationFrame( animate );
// }
// let rotateZ = document.getElementById("rotateZ");
// rotateZ.value = camera.position.z;
// rotateZ.oninput = function() {
//     camera.position.z = rotateZ.value
//     requestAnimationFrame( animate );
// }

    // var cubeGeometry = new THREE.BoxGeometry(50, 50, 50);
    // var cubeMaterial = new THREE.MeshLambertMaterial();
    // cubeMaterial.color = new THREE.Color(0xffffff * Math.random())
    // cubeMaterial.transparent = true;
    // var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // cube.name = 'cube';
    // cube.position.x = 0;
    // cube.position.y = 0;
    // cube.position.z = 0;
    // scene.add(cube);
