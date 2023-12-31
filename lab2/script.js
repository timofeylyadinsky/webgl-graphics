// 
"use strict";

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';


let scene;
let camera;
let renderer;
let control;
let light;

start();
function start() {
    scene = new THREE.Scene();
    // camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera = new THREE.OrthographicCamera();
    
    // camera.left = window.innerWidth / -2;
    // camera.right = window.innerWidth / 2;
    // camera.top = window.innerHeight / 2;
    // camera.bottom = window.innerHeight / -2;
    // camera.near = 0.001;
    // camera.far = 1500;
    camera.left = -1;
    camera.right = 1;
    camera.top = 1;
    camera.bottom = -1;
    camera.near = 0.001;
    camera.far = 400;
    // // camera.zoom = 100

    console.log(camera);
    camera.updateProjectionMatrix();
    console.log(camera);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.setClearColor(0x000000, 1.0);
    // renderer.shadowMapEnabled = true;
    renderer.shadowMap.enabled = true;
    // renderer.shadowMap.renderReverseSided = false;
    // renderer.shadowMapCullFrontFaces = false;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

   
    camera.position.x = -14;
    camera.position.y = 12;
    camera.position.z = 10;
    camera.lookAt(scene.position);
    //scene.add(new THREE.GridHelper(100, 300));
    
    control = new function () {
        this.left = camera.left;
        this.right = camera.right;
        this.top = camera.top;
        this.bottom = camera.bottom;
        this.far = camera.far;
        this.near = camera.near;

        this.repeatX = 2;
        this.repeatY = 2;
        
        this.updateCamera = function () {
            camera.left = control.left;
            camera.right = control.right;
            camera.top = control.top;
            camera.bottom = control.bottom;
            camera.far = control.far;
            camera.near = control.near;

            let map = scene.getObjectByName('mymodel');
            // console.log(map)
            map.traverse(node => {
                console.log(node);
                if(node.isMesh) {
                    node.material.map.repeat.x = control.repeatX;
                    node.material.map.repeat.y = control.repeatY;
                    
                } 
            });

            camera.updateProjectionMatrix();
            //animate();
        };
    };

    
    light = new THREE.DirectionalLight(0xffffff);
    // light.position.set(-500, 200, 300);
    light.position.set(1, 0, 0);
    light.castShadow = true;
    light.intensity = 2;
    light.shadow.mapSize.width = 1024; // default
    light.shadow.mapSize.height = 1024; // default
    light.shadow.camera.near = 0.5; // default
    light.shadow.camera.far = 500; // default
    scene.add(light);

    let ambiLight = new THREE.AmbientLight(0x333333);
    scene.add(ambiLight);

    loadModel();
    addPlanes();

    const helper = new THREE.CameraHelper( light.shadow.camera );
    scene.add( helper );


    document.body.appendChild( renderer.domElement );

    addControls(control);

    animate();
}

function addPlanes() {
    const planeGeometry = new THREE.BoxGeometry( 1, 1, 0.1);
    const planeMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } )
    const plane = new THREE.Mesh( planeGeometry, planeMaterial );
    // plane.rotation.x = 1.5708;
    plane.rotation.x = Math.PI / 180 * -90;
    plane.position.y = -0.5;
    // plane.rotation.y = Math.PI / 180 * 45;
    plane.castShadow = true;
    plane.receiveShadow = true;
    scene.add( plane );
    const plane2 = new THREE.Mesh( planeGeometry, planeMaterial );
    plane2.castShadow = true;
    plane2.receiveShadow = true;
    plane2.position.z = -0.5;
    scene.add( plane2 );
}

function loadModel() {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('./public/texture9.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    loader.load( './public/untitled3.glb', function ( gltf ) {
        let model = gltf.scene; 
        
        console.log(gltf);
        model.traverse(node => {
            if(node.isMesh) {
                console.log(Array.isArray(node.material));
                node.material.map = texture;
                node.castShadow = true;
                node.receiveShadow = true;
                node.material.map.repeat.x = 2;
                node.material.map.repeat.y = 2;
                node.material.needsUpdate = true;
            } 
        })
        console.log(model);
        model.name = 'mymodel';
        //model.scale.set(400, 400, 400);
        scene.add( gltf.scene );
        animate();
    }, undefined, function ( error ) {
        console.error( error );
    } );
}

function animate() {
    renderer.render( scene, camera );
    requestAnimationFrame( animate );

}


function addControls(controlObject) {
    var gui = new dat.GUI();
    const cameraOrth = gui.addFolder('THREE.OrthographicCamera');
    cameraOrth.add(controlObject, 'left', -2, 0).onChange(controlObject.updateCamera);
    cameraOrth.add(controlObject, 'right', 0, 2).onChange(controlObject.updateCamera);
    cameraOrth.add(controlObject, 'top', 0, 2).onChange(controlObject.updateCamera);
    cameraOrth.add(controlObject, 'bottom', -2, 0).onChange(controlObject.updateCamera);
    cameraOrth.add(controlObject, 'far', 100, 400).onChange(controlObject.updateCamera);
    cameraOrth.add(controlObject, 'near', 0, 200).onChange(controlObject.updateCamera);
    const texture = gui.addFolder('Texture Repeate');
    texture.add(controlObject, 'repeatX', -4, 4).step(0.1).onChange(control.updateCamera);
    texture.add(controlObject, 'repeatY', -4, 4).step(0.1).onChange(control.updateCamera);
    
    const data = {
        color: light.color.getHex(),
        mapsEnabled: true,
        shadowMapSizeWidth: 512,
        shadowMapSizeHeight: 512,
    }
    const lightFolder = gui.addFolder('THREE.Light')
    lightFolder.addColor(data, 'color').onChange(() => {
        light.color.setHex(Number(data.color.toString().replace('#', '0x')))
    });
    lightFolder.add(light, 'intensity', 0, Math.PI * 2, 0.01);
    const directionalLightFolder = gui.addFolder('THREE.DirectionalLight');
    directionalLightFolder.add(light.position, 'x', -10, 10, 0.1);
    directionalLightFolder.add(light.position, 'y', -10, 10, 0.1);
    directionalLightFolder.add(light.position, 'z', -10, 10, 0.1);

}


let rotateX = document.getElementById("rotateX");
rotateX.value = camera.position.x;
rotateX.oninput = function() {
    camera.position.x = rotateX.value;
    camera.lookAt(scene.position);
}
let rotateY = document.getElementById("rotateY");
rotateY.value = camera.position.y;
rotateY.oninput = function() {
    camera.position.y = rotateY.value;
    camera.lookAt(scene.position);
}
let rotateZ = document.getElementById("rotateZ");
rotateZ.value = camera.position.z;
rotateZ.oninput = function() {
    camera.position.z = rotateZ.value;
    camera.lookAt(scene.position);
}

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
