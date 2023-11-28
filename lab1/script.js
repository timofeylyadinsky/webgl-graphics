let gl;
let animationKey = true;

"use strict";

function createShader(gl, type, source) {
  let shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  let program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  let success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}

function initWebGL(canvas) {
  gl = null;
  try {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  } catch (e) {}
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    gl = null;
  }
  return gl;
}



function start() {
  let canvas = document.getElementById("canvas");

  gl = initWebGL(canvas);

  if (gl) {
    gl.clearColor(0.0, 0.2, 0.5, 0.5);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  } else {
    return;
  }


  // Get the strings for our GLSL shaders
  let vertexShaderSource = document.querySelector("#vertex-shader-3d").text;
  let fragmentShaderSource = document.querySelector("#fragment-shader-3d").text;
 
  // create GLSL shaders, upload the GLSL source, compile the shaders
  let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  let program = createProgram(gl, vertexShader, fragmentShader);
  
  let positionLocation = gl.getAttribLocation(program, "a_position");
  let normalLocation = gl.getAttribLocation(program, "a_normal");
  let texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
  
  // lookup uniforms
  let worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
  let worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
  let colorLocation = gl.getUniformLocation(program, "u_color");

  let lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition[0]");
  let lightWorldPositionLocation2 = gl.getUniformLocation(program, "u_lightWorldPosition[1]");
  let viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
  let worldLocation = gl.getUniformLocation(program, "u_world");
  let shininessLocation = gl.getUniformLocation(program, "u_shininess");
  let textureLocation = gl.getUniformLocation(program, "u_texture");

  
  // Position Buffer
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl)
  
  let normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  setNormals(gl);

  let texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  setTextureCoords(gl);

  let texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
  // Asynchronously load an image
  let image = new Image();
  image.src = "./texture3.jpg";
  image.crossOrigin = "anonymous";
  image.addEventListener('load', function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  //let translation = [-150, 0, -360];
  let rotation = [degToRad(40), degToRad(40), degToRad(40)];
  let fieldOfViewRadians = degToRad(60);
  let fRotationRadians = 0;
  let rotationSpeed = 1.2;


  fieldOfView.value = radToDeg(fieldOfViewRadians);
  fieldOfView.min = -720;
  fieldOfView.max = 720;





  let then = 0;
  drawScene(then)
  document.addEventListener('keydown', function(event){
    console.log(event.key)
    if(event.key === 'Enter') {
      console.log(event.key)
      //then = 0;
      if(!animationKey)
        requestAnimationFrame(drawScene);
      animationKey = !animationKey;
    } else if (event.key === 'ArrowLeft') {
      rotation[0] -= degToRad(3);
      requestAnimationFrame(drawScene);
      //drawScene(then)
    }
    else if (event.key === 'ArrowRight') {
      rotation[0] += degToRad(3);
      requestAnimationFrame(drawScene);
      //drawScene(then)
    }
    else if (event.key === 'ArrowUp') {
      rotation[1] += degToRad(3);
      requestAnimationFrame(drawScene);
      //drawScene(then)
    }
    else if (event.key === 'ArrowDown') {
      rotation[1] -= degToRad(3);
      requestAnimationFrame(drawScene);
      //drawScene(then)
    }
  })

  fieldOfView.oninput = function() {
    fRotationRadians = degToRad(fieldOfView.value);
    //requestAnimationFrame(drawScene);
    drawScene(then);
  } 

  function drawScene(now) {
    now*=0.001
    let delta = now - then;
    console.log("now: " + now + "\n then: " + then);
    then = now;
    if(animationKey){
      
      //console.log("1: " + rotation);
      rotation[0] += rotationSpeed * delta;
      rotation[1] += rotationSpeed * delta;
      //console.log("2: " + rotation);
    }
    //console.log(rotation);
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 3;          
    let type = gl.FLOAT;
    let normalize = false;
    let stride = 0;       
    let offset = 0;    
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(normalLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    size = 3; 
    type = gl.FLOAT;
    normalize = false; 
    stride = 0;
    offset = 0;
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);


    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    size = 2;
    type = gl.FLOAT;
    normalize = false;
    stride = 0;
    offset = 0;
    gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);


    
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 2000;
    let projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    // matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    // matrix = m4.xRotate(matrix, rotation[0]);
    // matrix = m4.yRotate(matrix, rotation[1]);
    // matrix = m4.zRotate(matrix, rotation[2]);


    // Compute the camera's matrix
    var camera = [100, 150, 300];
    var target = [0, 35, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(camera, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);
    //console.log("3: " + rotation);


    // Compute a view projection matrix
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    // let worldMatrix = m4.xRotation(fRotationRadians);
    let worldMatrix = m4.xRotation(rotation[0]);
    worldMatrix = m4.yRotate(worldMatrix, rotation[1]);
    worldMatrix = m4.zRotate(worldMatrix, rotation[2]);
  

    //worldMatrix = m4.xRotate(worldMatrix, rotation[0]);

    //worldMatrix = m4.yRotate(worldMatrix, rotation[1]);
 
    //worldMatrix = m4.zRotate(worldMatrix, rotation[2]);
    //console.log(rotation)
    //let worldMatrix = m4.xRotate(worldMatrix, rotation[0]);
    // Multiply the matrices.
    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = m4.inverse(worldMatrix);
    var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);
    //worldInverseTransposeMatrix = m4.xRotate(worldInverseTransposeMatrix, rotation[0])
    // Set the matrices
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    // Set the color to use
    gl.uniform4fv(colorLocation, [0.1, 1, 0.1, 1]);

    //gl.uniform3fv(lightWorldPositionLocation, [100, 150, 20]);
    gl.uniform3fv(lightWorldPositionLocation, [-30, 10, 40]);
    gl.uniform3fv(lightWorldPositionLocation, [150, 20, 160]);

    gl.uniform3fv(viewWorldPositionLocation, camera);
    gl.uniform1f(shininessLocation, 1000);
    gl.uniform1i(textureLocation, 0);

    // Draw the geometry.
    let primitiveType = gl.TRIANGLES;
    let count = choords.length/2;
    gl.drawArrays(primitiveType, offset, count);
    if(animationKey){
      requestAnimationFrame(drawScene);
    }
  }

  console.log("print")
}

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

let choords = [
    // left column
    //1
    0, 0, 0,
    0, 150, 0,
    30, 0, 0,
    //2
    0, 150, 0,
    30, 150, 0,
    30, 0, 0,

    // middle rung
    //3
    30, 60, 0,
    30, 90, 0,
    60, 60, 0,
    //4
    30, 90, 0,
    60, 90, 0,
    60, 60, 0,

    //Top Front O
    //5
    120, 0, 0,
    90, 0, 0,
    90, 30, 0,
    //6
    90, 30, 0,
    120, 30, 0,
    120, 0, 0,

    //LEFT FRONT O
    //7
    90,0, 0,
    60,150, 0,
    90,150, 0,
    //8
    60,0, 0,
    60,150, 0,
    90,0, 0,

    //Bottom FRONT O
    //9
    90,120, 0,
    90,150, 0,
    120,120, 0,
    //10
    90,150, 0,
    120,150, 0,
    120,120, 0,


    //RIGHT Front O
    //11
    150,150, 0,
    150,0, 0,
    120,150, 0,

    //12
    150,0, 0,
    120,0, 0,
    120,150, 0,

    //3D
    // left column
    //1
    0, 0, 30,
    30, 0, 30,
    0, 150, 30,
    //2
    0, 150, 30,
    30, 0, 30,
    30, 150, 30,
    // middle rung
    //3
    30, 60, 30,
    60, 60, 30,
    30, 90, 30,
    //4
    30, 90, 30,
    60, 60, 30,
    60, 90, 30,

    //Bottom
    //5
    120, 0, 30,
    90, 30, 30,
    90, 0, 30,
    //6
    90, 30, 30,
    120, 0, 30,
    120, 30, 30,
    //7
    90,0, 30,
    90,150, 30,
    60,150, 30,
    //8
    60,0, 30,
    90,0, 30,
    60,150, 30,
    //9
    90,120, 30,
    120,120, 30,
    90,150, 30,
    //10
    90,150, 30,
    120,120, 30,
    120,150, 30,
    //11
    150,150, 30,
    120,150, 30,
    150,0, 30,
    //12
    120,0, 30,
    150,0, 30,
    120,150, 30,

    //Filling
    //First Vertical
    //1
    0, 0, 0,
    0, 0, 30,
    0, 150, 0,
    //2
    0, 0, 30,
    0, 150, 30,
    0, 150, 0,


    //First Bottom First Vertical
    // //3
    0, 150, 30,
    30, 150, 0,
    0, 150, 0,

    //4
    0, 150, 30,
    30, 150, 30,
    30,150, 0,

    //First Top First Vertical
    //3
    0, 0, 30,
    0, 0, 0,
    30, 0, 0,
    //4
    0, 0, 30,
    30, 0, 0,
    30, 0, 30,


    //Second Vertical
    //5
    30, 0, 0,
    30, 150, 0,
    30, 0, 30,

    //6
    30, 150, 30,
    30, 0, 30,
    30, 150, 0,
    //Left Vertical O Outer
    //7
    60, 0, 0,
    60, 0, 30,
    60, 150, 0,
    //8
    60, 150, 30,
    60, 150, 0,
    60, 0, 30,

    //Right Vertical O Outer
    //9
    150, 0, 0,
    150, 150, 0,
    150, 0, 30,
    //10
    150, 150, 30,
    150, 0, 30,
    150, 150, 0,


    //Middle Bottom
    // //11
    30, 90, 30,
    60, 90, 0,
    30, 90, 0,

    //12
    60, 90, 0,
    30, 90, 30,
    60, 90, 30,


    //Middle Top
    //13
    30, 60, 30,
    30, 60, 0,
    60, 60, 0,
    //14
    60, 60, 0,
    60, 60, 30,
    30, 60, 30,


    //Last Bottom O outer
    // //15
    150, 150, 30,
    150, 150, 0,
    60, 150, 0,

    //16
    60, 150, 0,
    60, 150, 30,
    150, 150, 30,


    //Last Top O Outer
    //17
    150, 0, 30,
    60, 0, 0,
    150, 0, 0,
    //18
    60, 0, 0,
    150, 0, 30,
    60, 0, 30,

    //Left O Inner 
    90, 30, 0,
    90, 120, 0,
    90, 30, 30,

    90, 30, 30,
    90, 120, 0,
    90, 120, 30,

    //Right O Inner
    120, 30, 0,
    120, 30, 30,
    120, 120, 0,

    120, 30, 30,
    120, 120, 30,
    120, 120, 0,

    //Bottom 0 Inner
    90, 120, 0,
    120, 120, 0,
    90, 120, 30,

    90, 120, 30,
    120, 120, 0,
    120, 120, 30,


    //Top 0 Inner
    90, 30, 0,
    90, 30, 30,
    120, 30, 0,

    90, 30, 30,
    120, 30, 30,
    120, 30, 0,

]

function setGeometry(gl) {
  let matrix = m4.xRotation(Math.PI);
  //matrix = m4.translate(matrix, -50, -75, -15);
  matrix = m4.translate(matrix, -50, -75, -15);

  for (let ii = 0; ii < choords.length; ii += 3) {
    let vector = m4.transformPoint(matrix, [choords[ii + 0], choords[ii + 1], choords[ii + 2], 1]);
    choords[ii + 0] = vector[0];
    choords[ii + 1] = vector[1];
    choords[ii + 2] = vector[2];
  }

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(choords), gl.STATIC_DRAW)
}


function setNormals(gl) {
  var normals = new Float32Array([
          // 1 2
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
 
          // 3 4
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
 
          // 5 6
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,

          // 7 8
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
 
          // 9 10
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
 
          // 11 12
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,

 
          //3D
          // 1 2
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
 
          // 3 4
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
 
          // 5 6
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          // 7 8
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
 
          // 9 10
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,

          // 11 12
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,
          0, 0, -1,

          //Filling
          //1 2
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,

          //3 4
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,

          //5 6
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,

          //7 8
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,

          //9 10
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,
          -1, 0, 0,

          //11 12
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,
          1, 0, 0,

          //13 14
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,

          //15 16
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,

          //17 18
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,
          0, -1, 0,

        //19 20
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
         //21 22
         -1, 0, 0,
         -1, 0, 0,
         -1, 0, 0,
         -1, 0, 0,
         -1, 0, 0,
         -1, 0, 0,

         //23 24
         -1, 0, 0,
         -1, 0, 0,
         -1, 0, 0,
         -1, 0, 0,
         -1, 0, 0,
         -1, 0, 0,  
         
        //27 28
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        //25 26
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,


 
]);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}

function setTextureCoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        // left column front
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        // middle rung front
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        // top front o
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        // Left front o
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        // Bottom front o
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,

        // Right front o
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,


        // left column back
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        // Middle rung back
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        // Bottom back O
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        // LEft back O
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        // Right back O
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        // Top back O
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        //filling
        // First Vertical
        0, 0,
        1, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 1,

        // first bottom
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // First Top
        0, 0,
        1, 0,
        1, 1,
        0, 0,
        1, 1,
        0, 1,

        // Second Vertical
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // Left vertical O outer
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // right Vertical O outer
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // Middle Bottom
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // Middle Top
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,
        // Last Bottom O outer
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // Last Top O outer
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,

        // Left O Inner
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        //Right O Inner
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,


        //Bottom O inner
        0, 0,
        0, 1,
        1, 1,
        0, 0,
        1, 1,
        1, 0,

        // Top O inner
        0, 0,
        1, 1,
        0, 1,
        0, 0,
        1, 0,
        1, 1,
]),
      gl.STATIC_DRAW);
}
