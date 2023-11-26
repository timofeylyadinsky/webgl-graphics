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



function start() {
  let canvas = document.getElementById("glcanvas");

  gl = initWebGL(canvas); // инициализация контекста GL

  // продолжать только если WebGL доступен и работает

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
  
  //Attribute
  let positionLocation = gl.getAttribLocation(program, "a_position");
  let colorLocation = gl.getAttribLocation(program, "a_color");
  //Uniform
  let matrixLocation = gl.getUniformLocation(program, "u_matrix");
  //let fudgeLocation = gl.getUniformLocation(program, "u_fudgeFactor");

  //let fudgeFactor = 1
  
  // Position Buffer
  let positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(choords), gl.STATIC_DRAW)
  

  // Create a buffer to put colors in
  let colorBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  // Put geometry data into buffer   
  setColors(gl);

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }


  let translation = [-150, 0, -360];
  let rotation = [degToRad(40), degToRad(25), degToRad(325)];
  let fieldOfViewRadians = degToRad(60);


  let angleX = document.getElementById("angleX");
  let angleY = document.getElementById("angleY");
  let angleZ = document.getElementById("angleZ");
  let positionX = document.getElementById("moveX");
  let positionY = document.getElementById("moveY");
  let positionZ = document.getElementById("moveZ");
  let fieldOfView = document.getElementById("fieldOfView");
  fieldOfView.value = radToDeg(fieldOfViewRadians);
  fieldOfView.min = 1;
  fieldOfView.max = 179;
  angleX.value = rotation[0];
  angleX.min = 0;
  angleX.max = 360;
  angleY.value = rotation[1];
  angleY.min = 0;
  angleY.max = 360;
  angleZ.value = rotation[2];
  angleZ.min = 0;
  angleZ.max = 360;
  angleX.oninput = function() {
    updateAngle(0, angleX)
  }
    
  angleY.oninput = function() {
    updateAngle(1, angleY)
  }
    
  angleZ.oninput = function() {
    updateAngle(2, angleZ)
  }

  positionX.value = translation[0];
  positionY.value = translation[1];
  positionZ.value = translation[2];
  positionX.min = -200;
  positionY.min = -200;
  positionZ.min = -1000;
  positionX.max = canvas.width;
  positionY.max = canvas.height;
  positionZ.max = 0;

  positionX.oninput = function() {
    updatePosition(0, positionX)  
  }
    
  positionY.oninput = function() {
    updatePosition(1, positionY)  
  }

  positionZ.oninput = function() {
    updatePosition(2, positionZ)  
  }
   
  fieldOfView.oninput = function() {
    fieldOfViewRadians = degToRad(fieldOfView.value);
    drawScene();
  }

  function updatePosition(index, ui) {
    translation[index] = ui.value;
    drawScene();
  }

  function updateAngle(index, ui) {
    let angleInDegrees = ui.value;
    let angleInRadians = angleInDegrees * Math.PI / 180;
    rotation[index] = angleInRadians;
    drawScene();
  }



  drawScene();

  function drawScene() {
    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.enable(gl.CULL_FACE);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Задаём fudgeFactor
   //gl.uniform1f(fudgeLocation, fudgeFactor);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    let size = 3;          // 2 components per iteration
    let type = gl.FLOAT;   // the data is 32bit floats
    let normalize = false; // don't normalize the data
    let stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;        // start at the beginning of the buffer
    
    gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

    // Turn on the color attribute
    gl.enableVertexAttribArray(colorLocation);

    // Bind the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    size = 3;                 // 3 components per iteration
    type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
    normalize = true;         // normalize the data (convert from 0-255 to 0-1)
    stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
    offset = 0;               // start at the beginning of the buffer
    gl.vertexAttribPointer(colorLocation, size, type, normalize, stride, offset);


    
    //let matrix = m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400);
    //let matrix = makeZToWMatrix(fudgeFactor);
    let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    let zNear = 1;
    let zFar = 2000;
    let matrix = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    //matrix = m4.multiply(matrix, m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400));
    matrix = m4.translate(matrix, translation[0], translation[1], translation[2]);
    matrix = m4.xRotate(matrix, rotation[0]);
    matrix = m4.yRotate(matrix, rotation[1]);
    matrix = m4.zRotate(matrix, rotation[2]);


    // Set the matrix.
    gl.uniformMatrix4fv(matrixLocation, false, matrix);

    // Draw the geometry.
    let primitiveType = gl.TRIANGLES;
    let count = choords.length/2;
    gl.drawArrays(primitiveType, offset, count);
  }

  console.log("print")
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


  function makeZToWMatrix(fudgeFactor) {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, fudgeFactor,
      0, 0, 0, 1,
    ];
  }


  // Fill the buffer with colors for the 'F'.
function setColors(gl) {
  console.log(2)
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Uint8Array([
          // left column front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // top rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // middle rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // left column back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // top rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // middle rung back
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,
        80, 70, 200,

          // top
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,
        70, 200, 210,

          // top rung right
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,
        200, 200, 70,

          // under top rung
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,
        210, 100, 70,

          // between top rung and middle
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,
        210, 160, 70,

          // top of middle rung
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,
        70, 180, 210,

          // right of middle rung
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,
        100, 70, 210,

          // bottom of middle rung.
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,
        76, 210, 100,

          // right of bottom
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,
        140, 210, 80,

          // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,

          // left side
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
        160, 160, 220,
                // bottom
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                        // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
                // bottom
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                        // bottom
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
        90, 130, 110,
                // bottom
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                        // left column front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // top rung front
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,
        200,  70, 120,

          // left column front
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
  
            // top rung front
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          // left column front
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
  
            // top rung front
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          // left column front
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
          200,  70, 120,
            ]),
      gl.STATIC_DRAW);
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
    //5
    150, 0, 0,
    60, 30, 0,
    60, 0, 0,

    //6
    60, 30, 0,
    150, 30, 0,
    150, 0, 0,

    //7
    90,0, 0,
    90,150, 0,
    60,150, 0,
    //8
    60,0, 0,
    60,150, 0,
    90,0, 0,

    //9
    60,120, 0,
    60,150, 0,
    150,120, 0,
    //10
    60,150, 0,
    150,120, 0,
    150,150, 0,
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
    0, 150, 30,
    30, 0, 30,

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
    //5
    150, 0, 30,
    60, 0, 30,
    60, 30, 30,
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
    150,0, 30,
    120,0, 30,
    120,150, 30,

    //Filling
    //First Vertical
    //1
    0, 0, 0,
    0, 0, 30,
    0, 150, 0,
    //2
    0, 150, 30,
    0, 0, 30,
    0, 150, 0,
    //First Top
    // //3
    0, 150, 30,
    0, 150, 0,
    30, 150, 0,
    //4
    0, 150, 30,
    30,150, 0,
    30, 150, 30,
    //First Bottom
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
    30, 0, 30,
    30, 150, 0,
    //6
    30, 150, 30,
    30, 0, 30,
    30, 150, 0,
    //Middle Vertical
    //7
    60, 0, 0,
    60, 0, 30,
    60, 150, 0,
    //8
    60, 150, 30,
    60, 0, 30,
    60, 150, 0,
    //Last Vertical
    //9
    150, 0, 0,
    150, 0, 30,
    150, 150, 0,
    //10
    150, 150, 30,
    150, 0, 30,
    150, 150, 0,
    //Middle Top
    // //11
    30, 90, 30,
    30, 90, 0,
    60, 90, 0,
    //12
    60, 90, 0,
    30, 90, 30,
    60, 90, 30,
    //Middle Bottom
    //13
    30, 60, 30,
    30, 60, 0,
    60, 60, 0,
    //14
    60, 60, 0,
    30, 60, 30,
    60, 60, 30,

    //Last Top
    // //15
    150, 150, 30,
    150, 150, 0,
    60, 150, 0,
    //16
    60, 150, 0,
    150, 150, 30,
    60, 150, 30,
    //Last Bottom
    //17
    150, 0, 30,
    150, 0, 0,
    60, 0, 0,
    //18
    60, 0, 0,
    150, 0, 30,
    60, 0, 30,

]