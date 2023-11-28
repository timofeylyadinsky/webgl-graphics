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
  
  let worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
  let worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
  let colorLocation = gl.getUniformLocation(program, "u_color");
  let lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition[0]");
  let lightWorldPositionLocation2 = gl.getUniformLocation(program, "u_lightWorldPosition[1]");
  let viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
  let worldLocation = gl.getUniformLocation(program, "u_world");
  let shininessLocation = gl.getUniformLocation(program, "u_shininess");
  let textureLocation = gl.getUniformLocation(program, "u_texture");
  let lightColorLocation = gl.getUniformLocation(program, "u_lightColor[0]");
  let specularColorLocation = gl.getUniformLocation(program, "u_specularColor[0]");
  let lightColorLocation2 = gl.getUniformLocation(program, "u_lightColor[1]");
  let specularColorLocation2 = gl.getUniformLocation(program, "u_specularColor[1]");
  // Buffers
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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 255, 255]));
  // Asynchronously load an image
  let image = new Image();
  image.src = "./texture7.jpg";
  image.crossOrigin = "anonymous";
  image.addEventListener('load', function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

  //let translation = [-150, 0, -360];
  let rotation = [degToRad(40), degToRad(40), degToRad(40)];
  let fieldOfViewRadians = degToRad(60);
  let rotationSpeed = [1.2, 0.9];

  fieldOfView.value = radToDeg(fieldOfViewRadians);
  fieldOfView.min = -720;
  fieldOfView.max = 720;

  let then = 0;
  drawScene(then)
  document.addEventListener('keydown', function(event){
    console.log(event.key)
    if(event.key === 'Enter' || event.key === ' ') {
      console.log(event.key)
      //then = 0;
      if(!animationKey)
        requestAnimationFrame(drawScene);
      animationKey = !animationKey;
    } else if (event.key === 'ArrowLeft') {
      rotation[0] -= degToRad(3);
      requestAnimationFrame(drawScene);
    }
    else if (event.key === 'ArrowRight') {
      rotation[0] += degToRad(3);
      requestAnimationFrame(drawScene);
    }
    else if (event.key === 'ArrowUp') {
      rotation[1] += degToRad(3);
      requestAnimationFrame(drawScene);
    }
    else if (event.key === 'ArrowDown') {
      rotation[1] -= degToRad(3);
      requestAnimationFrame(drawScene);
    }
  })

  function drawScene(now) {
    now*=0.001
    let delta = now - then;
    console.log("now: " + now + "\n then: " + then);
    then = now;
    if(animationKey){
      //console.log("1: " + rotation);
      rotation[0] += rotationSpeed[1] * delta;
      rotation[1] += rotationSpeed[0] * delta;
      //console.log("2: " + rotation);
    }
    //console.log(rotation);
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
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

    var camera = [100, 150, 300];
    var target = [0, 35, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(camera, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    // Compute a view projection matrix
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    let worldMatrix = m4.xRotation(rotation[0]);
    worldMatrix = m4.yRotate(worldMatrix, rotation[1]);
    worldMatrix = m4.zRotate(worldMatrix, rotation[2]);
  
    let worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    let worldInverseMatrix = m4.inverse(worldMatrix);
    let worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    gl.uniform4fv(colorLocation, [0.1, 1, 0.1, 1]);

    //gl.uniform3fv(lightWorldPositionLocation, [100, 150, 20]);
    // gl.uniform3fv(lightWorldPositionLocation, [0, 30, 100]);
    // gl.uniform3fv(lightWorldPositionLocation2, [90, 30, 110]);

    gl.uniform3fv(lightWorldPositionLocation, [0, 30, 100]);
    gl.uniform3fv(lightWorldPositionLocation2, [60, 60, 260]);

    gl.uniform3fv(lightColorLocation, m4.normalize([0.1, 0.1, 1]));
    gl.uniform3fv(specularColorLocation, m4.normalize([0.1, 0.1, 1]));

    gl.uniform3fv(lightColorLocation2, m4.normalize([1, 0.1, 0.1]));
    gl.uniform3fv(specularColorLocation2, m4.normalize([1, 0.1, 0.1]));

    gl.uniform3fv(viewWorldPositionLocation, camera);
    gl.uniform1f(shininessLocation, 200);
    gl.uniform1i(textureLocation, 0);

    // Draw the geometry.
    let primitiveType = gl.TRIANGLES;
    let count = choords.length/2;
    gl.drawArrays(primitiveType, offset, count);
    if(animationKey){
      requestAnimationFrame(drawScene);
    }
  }
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
    120, 30, 0,//1
    120, 0, 0,//2
    90, 30, 0,//3
    //6
    120, 0, 0,
    90, 0, 0,
    90, 30, 0,



    //LEFT FRONT O
    //7
    90,150, 0,
    90,0, 0,
    60,150, 0,

    //8
    90,0, 0, //1
    60,0, 0, //2
    60,150, 0, //3


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

    //Top
    //5
    90, 0, 30,//1
    120, 0, 30,//2
    90, 30, 30,//3
    //6
    90, 30, 30,
    120, 0, 30,
    120, 30, 30,
    //left back outer
    //8
    60,0, 30,
    90,0, 30,
    60,150, 30,
    //7
    60,150, 30,//1
    90,0, 30,//2
    90,150, 30,//3

    //Bottom
    //9
    90,120, 30,
    120,120, 30,
    90,150, 30,
    //10
    90,150, 30,
    120,120, 30,
    120,150, 30,
    //Right
    //11
    120,0, 30,
    150,0, 30,
    120,150, 30,
    //12
    120,150, 30,//1
    150,0, 30,//2
    150,150, 30,//3


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
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,
        // first bottom
        0, 1,
        1, 0,
        0, 0,
        0, 1,
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
        1, 0,
        0, 1,
        1, 1,
        0, 1,
        1, 0,

        // Left vertical O outer
        0, 0,
        0, 1,
        1, 0,
        1, 1,
        1, 0,
        0, 1,

        // right Vertical O outer
        0, 0,
        1, 0,
        0, 1,
        1, 1,
        0, 1,
        1, 0,

        // Middle Bottom
        0, 1,
        1, 0,
        0, 0,
        0, 1,
        1, 0,
        1, 1,

        // Middle Top
        0, 1,
        0, 0,
        1, 0,
        1, 0,
        1, 1,
        0, 1,
        // Last Bottom O outer
        1, 1,
        1, 0,
        0, 0,
        0, 0,
        0, 1,
        1, 1,

        // Last Top O outer
        1, 1,
        0, 0,
        1, 0,
        0, 0,
        1, 1,
        0, 1,

        // Left O Inner
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        //Right O Inner
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,


        //Bottom O inner
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,

        // Top O inner
        0, 0,
        0, 1,
        1, 0,
        0, 1,
        1, 1,
        1, 0,
]),
      gl.STATIC_DRAW);
}
