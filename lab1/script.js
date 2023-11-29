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
  //console.log(gl.getUniformLocation(program, "u_lightColor[0]"))
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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 0]));
  // Asynchronously load an image
  let image = new Image();
  image.src = "./texture11.jpg";
  image.crossOrigin = "anonymous";
  image.addEventListener('load', choiceTexture)
  //function() {
    // gl.bindTexture(gl.TEXTURE_2D, texture);
    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    // gl.generateMipmap(gl.TEXTURE_2D);
  //});


  function choiceTexture() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  }

  let textureChoice = document.querySelectorAll('.selectTexture');

  textureChoice.forEach(el => el.addEventListener('click', event => {
    console.log(el.value);
    image.src = "./" + el.value + ".jpg";
    image.crossOrigin = "anonymous";
    choiceTexture();
    requestAnimationFrame(drawScene);
  }));

  //let translation = [-150, 0, -360];
  let rotation = [degToRad(40), degToRad(40), degToRad(40)];
  let fieldOfViewRadians = degToRad(60);
  let rotationSpeed = [1.2, 0.9];

  //fieldOfView.value = radToDeg(fieldOfViewRadians);
  //fieldOfView.min = -720;
  //fieldOfView.max = 720;

  let light1Color = [0.1, 0.5, 1];
  let light1ColorPosition = [0, 30, 100];
  let light2ColorPosition = [60, 0, 260];
  let light2Color = [1, 0.1, 0.1];

  let light1ColorPositionX = document.getElementById("light1ColorPositionX");
  light1ColorPositionX.value = light1ColorPosition[0];
  let light1ColorPositionY = document.getElementById("light1ColorPositionY");
  light1ColorPositionY.value = light1ColorPosition[1];
  let light1ColorPositionZ = document.getElementById("light1ColorPositionZ");
  light1ColorPositionZ.value = light1ColorPosition[2];

  let light1ColorR = document.getElementById("light1ColorR");
  light1ColorR.value = light1Color[0];
  let light1ColorG = document.getElementById("light1ColorG");
  light1ColorG.value = light1Color[1];
  let light1ColorB = document.getElementById("light1ColorB");
  light1ColorB.value = light1Color[2];

  let light2ColorR = document.getElementById("light2ColorR");
  light2ColorR.value = light2Color[0];
  let light2ColorG = document.getElementById("light2ColorG");
  light2ColorG.value = light2Color[1];
  let light2ColorB = document.getElementById("light2ColorB");
  light2ColorB.value = light2Color[2];

  light1ColorPositionX.oninput = function() {
    light1ColorPosition[0] = light1ColorPositionX.value;
    requestAnimationFrame(drawScene);
  }
  light1ColorPositionY.oninput = function() {
    light1ColorPosition[1] = light1ColorPositionY.value;
    requestAnimationFrame(drawScene);
  }
  light1ColorPositionZ.oninput = function() {
    light1ColorPosition[2] = light1ColorPositionZ.value;
    requestAnimationFrame(drawScene);
  }


  light1ColorR.oninput = function() {
    //console.log(light1Color)
    //console.log(Math.floor(Math.random()*4))
    light1Color[0] = light1ColorR.value;
    requestAnimationFrame(drawScene);
  }
  light1ColorG.oninput = function() {
    light1Color[1] = light1ColorG.value;
    requestAnimationFrame(drawScene);
  }
  light1ColorB.oninput = function() {
    light1Color[2] = light1ColorB.value;
    requestAnimationFrame(drawScene);
  }
  light2ColorR.oninput = function() {
    light2Color[0] = light2ColorR.value;
    requestAnimationFrame(drawScene);
  }
  light2ColorG.oninput = function() {
    light2Color[1] = light2ColorG.value;
    requestAnimationFrame(drawScene);
  }
  light2ColorB.oninput = function() {
    light2Color[2] = light2ColorB.value;
    requestAnimationFrame(drawScene);
  }


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
    //console.log("now: " + now + "\n then: " + then);
    then = now;
    if(animationKey){
      //console.log("1: " + rotation);
      if (delta > 1) delta = 0;
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

    gl.uniform3fv(lightWorldPositionLocation, light1ColorPosition);
    gl.uniform3fv(lightWorldPositionLocation2, light2ColorPosition);

    gl.uniform3fv(lightColorLocation, m4.normalize(light1Color));
    gl.uniform3fv(specularColorLocation, m4.normalize(light1Color));

    gl.uniform3fv(lightColorLocation2, m4.normalize(light2Color));
    gl.uniform3fv(specularColorLocation2, m4.normalize(light2Color));

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

function setGeometry(gl) {
  let matrix = m4.xRotation(Math.PI);
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
}

function setTextureCoords(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(textureCoords),
      gl.STATIC_DRAW);
}
