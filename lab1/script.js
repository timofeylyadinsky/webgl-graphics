let gl;

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
  
  // lookup uniforms
  let worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
  let worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
  let colorLocation = gl.getUniformLocation(program, "u_color");

  let lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
  let worldLocation = gl.getUniformLocation(program, "u_world");
  
  // Position Buffer
  let positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  setGeometry(gl)
  
  let normalBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
  setNormals(gl);

  //let translation = [-150, 0, -360];
  //let rotation = [degToRad(40), degToRad(25), degToRad(325)];
  let fieldOfViewRadians = degToRad(60);
  let fRotationRadians = 0;


  // let angleX = document.getElementById("angleX");
  // let angleY = document.getElementById("angleY");
  // let angleZ = document.getElementById("angleZ");
  // let positionX = document.getElementById("moveX");
  // let positionY = document.getElementById("moveY");
  // let positionZ = document.getElementById("moveZ");
  // let fieldOfView = document.getElementById("fieldOfView");
  fieldOfView.value = radToDeg(fieldOfViewRadians);
  fieldOfView.min = -360;
  fieldOfView.max = 360;
  // angleX.value = rotation[0];
  // angleX.min = 0;
  // angleX.max = 360;
  // angleY.value = rotation[1];
  // angleY.min = 0;
  // angleY.max = 360;
  // angleZ.value = rotation[2];
  // angleZ.min = 0;
  // angleZ.max = 360;
  // angleX.oninput = function() {
  //   updateAngle(0, angleX)
  // }
  // angleY.oninput = function() {
  //   updateAngle(1, angleY)
  // } 
  // angleZ.oninput = function() {
  //   updateAngle(2, angleZ)
  // }

  // positionX.value = translation[0];
  // positionY.value = translation[1];
  // positionZ.value = translation[2];
  // positionX.min = -200;
  // positionY.min = -200;
  // positionZ.min = -1000;
  // positionX.max = canvas.width;
  // positionY.max = canvas.height;
  // positionZ.max = 0;

  // positionX.oninput = function() {
  //   updatePosition(0, positionX)  
  // }
  // positionY.oninput = function() {
  //   updatePosition(1, positionY)  
  // }
  // positionZ.oninput = function() {
  //   updatePosition(2, positionZ)  
  // }
  fieldOfView.oninput = function() {
    fRotationRadians = degToRad(fieldOfView.value);
    drawScene();
  }

  // function updatePosition(index, ui) {
  //   translation[index] = ui.value;
  //   drawScene();
  // }
  // function updateAngle(index, ui) {
  //   let angleInDegrees = ui.value;
  //   let angleInRadians = angleInDegrees * Math.PI / 180;
  //   rotation[index] = angleInRadians;
  //   drawScene();
  // }



  drawScene();

  function drawScene() {
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
    let type = gl.FLOAT;   // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;        // start at the beginning of the buffer
    
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    gl.enableVertexAttribArray(normalLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);

    size = 3;                 // 3 components per iteration
    type = gl.FLOAT;  // the data is 8bit unsigned values
    normalize = false;         // normalize the data (convert from 0-255 to 0-1)
    stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
    offset = 0;               // start at the beginning of the buffer
    gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);


    
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 2000;
    let projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    // matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    // matrix = m4.xRotate(matrix, rotation[0]);
    // matrix = m4.yRotate(matrix, rotation[1]);
    // matrix = m4.zRotate(matrix, rotation[2]);


    // Compute the camera's matrix
    var camera = [100, 150, 400];
    var target = [0, 35, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(camera, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    // Compute a view projection matrix
    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    var worldMatrix = m4.yRotation(fRotationRadians);

    // Multiply the matrices.
    var worldViewProjectionMatrix = m4.multiply(viewProjectionMatrix, worldMatrix);
    var worldInverseMatrix = m4.inverse(worldMatrix);
    var worldInverseTransposeMatrix = m4.transpose(worldInverseMatrix);

    // Set the matrices
    gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
    gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
    gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

    // Set the color to use
    gl.uniform4fv(colorLocation, [0.9, 1, 0.5, 1]); // green

    gl.uniform3fv(lightWorldPositionLocation, [20, 100, 100]);

    // Draw the geometry.
    let primitiveType = gl.TRIANGLES;
    let count = choords.length/2;
    gl.drawArrays(primitiveType, offset, count);
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
    150, 0, 0,
    60, 0, 0,
    60, 30, 0,
    //6
    60, 30, 0,
    150, 30, 0,
    150, 0, 0,

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
    60,120, 0,
    60,150, 0,
    150,120, 0,
    //10
    60,150, 0,
    150,150, 0,
    150,120, 0,


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
    150, 0, 30,
    60, 30, 30,
    60, 0, 30,
    //6
    60, 30, 30,
    150, 0, 30,
    150, 30, 30,
    //7
    90,0, 30,
    90,150, 30,
    60,150, 30,
    //8
    60,0, 30,
    90,0, 30,
    60,150, 30,
    //9
    60,120, 30,
    150,120, 30,
    60,150, 30,
    //10
    60,150, 30,
    150,120, 30,
    150,150, 30,
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
    0, 150, 0,
    30, 150, 0,
    //4
    0, 150, 30,
    30,150, 0,
    30, 150, 30,
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
    30, 90, 0,
    60, 90, 0,
    //12
    60, 90, 0,
    60, 90, 30,
    30, 90, 30,

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
    60, 150, 0,
    150, 150, 0,
    //16
    60, 150, 0,
    150, 150, 30,
    60, 150, 30,

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
         1, 0, 0,
         1, 0, 0,
         1, 0, 0,
         1, 0, 0,
         1, 0, 0,
         1, 0, 0,  
        //25 26
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,
        0, -1, 0,

      //27 28
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,
        0, 1, 0,

 
]);
  gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
}