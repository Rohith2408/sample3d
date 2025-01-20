import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';


// Create scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaaaa);
scene.environment = null;
const GLTFloader = new GLTFLoader();
const FBXloader = new FBXLoader();
const layoutDimensions={width:100,height:100}
const playerBoundary={top:50,bottom:50,left:50,right:50};

//sky
const sun = new THREE.Vector3();
const sky = new Sky();
sky.scale.setScalar(450000);
scene.add(sky);
loadSky()

//lighting
const directionalLight = new THREE.DirectionalLight(0xffffff, 10);  // Intensity set to 1 for normal lighting
loadLighting()

// Create camera 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0.5, 0); 
// camera.lookAt(0, 0, 0);

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a ground plane 
const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('./assets/grass.jpg');
grassTexture.repeat.set(30, 30); // 5x5 tiles across the plane (you can adjust this value)
grassTexture.wrapS = THREE.RepeatWrapping;  // Horizontal wrapping (tiled)
grassTexture.wrapT = THREE.RepeatWrapping;  // Vertical wrapping (tiled)
grassTexture.minFilter = THREE.LinearFilter; // Set the filter for texture scaling
grassTexture.magFilter = THREE.LinearFilter;
const material = new THREE.MeshBasicMaterial({
  map: grassTexture,
  side: THREE.DoubleSide // To display texture on both sides of the plane
});
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = material; 
const ground = new THREE.Mesh(groundGeometry);
ground.position.set(0, 0, 0); 
//scene.add(ground);

// Create a cube (green color)
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); 
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, 0, 0); 
//scene.add(cube);

//world
loadWorld()

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

let speed = 0;
let rotation=0;
let speedDelta=0.015;
let rotationDelta=0.006;
const moveDirection = { x: 0, y: 0, z: 0 };
let isMouseDown = false;
let prevMouseX = 0;
let prevMouseY = 0;

document.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'w': 
      case 'ArrowUp': 
        speed=1;
        //moveDirection.y = speed;
        break;
      case 's': 
      case 'ArrowDown': 
        speed=-1;
        //moveDirection.y = -speed;
        break;
      case 'a': 
      case 'ArrowLeft':
        rotation=1;
        //moveDirection.x = -speed;
        break;
      case 'd': 
      case 'ArrowRight': 
        rotation=-1;
        //moveDirection.x = speed;
        break;
    }
  });
  
  document.addEventListener('keyup', (event) => {
    switch (event.key) {
      case 'w':
        case 'ArrowUp': 
        case 's':
        case 'ArrowDown': 
        speed=0;
        break;
      case 'a':
        case 'ArrowLeft':
        case 'd':
        case 'ArrowRight':
        rotation=0;
        break;
    }
  });

  // window.addEventListener('mousedown', (e) => {
  //   isMouseDown = true;
  //   prevMouseX = e.clientX;
  //   prevMouseY = e.clientY;
  // });

  // window.addEventListener('mouseup', () => {
  //     isMouseDown = false;
  // });

  window.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        const deltaX = e.clientX - prevMouseX;
        const deltaY = e.clientY - prevMouseY;
        cube.rotation.y += deltaX * 0.01;  // Rotate around the Y axis
        cube.rotation.x += deltaY * 0.01;  // Rotate around the X axis
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
    }
});

  const offset = new THREE.Vector3(0, 2, 3);

// Render the scene
function animate() {
  requestAnimationFrame(animate);
  //thirdPerson();
  firstPerson();


  // camera.lookAt(cube.position);
  
  // Render the scene and camera
  renderer.render(scene, camera);
}

function firstPerson(){
  camera.rotation.set(0,camera.rotation.y+(3.14*rotationDelta*rotation),0);
  const forwardVector = new THREE.Vector3();  // Default forward vector in local space
  camera.getWorldDirection(forwardVector);  // Transform to world space
  forwardVector.normalize();
  camera.position.add(forwardVector.multiplyScalar(speed*speedDelta));
  checkBoundaries()
  console.log(camera.position);
}

function checkBoundaries(){
  if(camera.position.x<-12)
  {
      camera.position.x=-12;
  }
  if(camera.position.x>12)
  {
      camera.position.x=12;
  }
  if(camera.position.z<-7)
  {
      camera.position.z=-7;
  }
  if(camera.position.z>4)
  {
      camera.position.z=4;
  }
}

function thirdPerson(){
  cube.rotation.set(0,cube.rotation.y+(3.14*rotationDelta*rotation),0);
  const forwardVector = new THREE.Vector3();  // Default forward vector in local space
  cube.getWorldDirection(forwardVector);  // Transform to world space
  forwardVector.normalize();
  cube.position.add(forwardVector.multiplyScalar(speed*speedDelta));
  console.log(speed,rotation);
  camera.position.copy(cube.position).add(offset);
  camera.lookAt(cube.position);
  updateCameraPosition();
}

function updateCameraPosition() {
  // Get the forward vector of the cube in world space
  const forwardVector = new THREE.Vector3(0, 0, -1);  // Default forward vector in local space
  cube.getWorldDirection(forwardVector);  // Transform to world space

  // Set the camera's position slightly behind the cube (relative to its forward vector)
  const cameraOffset = new THREE.Vector3(0, 2, -5);  // Offset behind and above the cube
  camera.position.copy(cube.position).add(forwardVector.multiplyScalar(cameraOffset.z));
  camera.position.y += cameraOffset.y;

  // Make the camera look at the cube
  camera.lookAt(cube.position);
}

function loadGLTFModel(path,position,rotation,scale){
    GLTFloader.load(
      path, 
      (gltf) => {
        let object=gltf.scene;
        scene.add(object);
        object.position.set(position.x,position.y,position.z);
        rotation?object.rotation.set(rotation.x,rotation.y,rotation.z):null;
        object.scale.set(scale,scale,scale);
      },
      (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded'); 
      },
      (error) => {
        console.error('An error occurred:', error); 
      }
    );
}

function loadFBXModel(path,position,rotation,scale){
  FBXloader.load(
    path, 
    (object) => {
      scene.add(object)
      object.position.set(position.x,position.y,position.z);
      rotation?object.rotation.set(rotation.x,rotation.y,rotation.z):null;
      object.scale.set(scale,scale,scale);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total * 100) + '% loaded'); 
    },
    (error) => {
      console.error('An error occurred:', error); 
    }
  );
}

animate();


function loadTrees(){
  loadFBXModel('./assets/models/Tree/Tree.FBX',{x:-10,y:0,z:-10},{x:-90,y:0,z:0},0.00175)
  loadFBXModel('./assets/models/Tree/Tree.FBX',{x:0,y:0,z:-10},{x:-90,y:0,z:0},0.00175)
  loadFBXModel('./assets/models/Tree/Tree.FBX',{x:10,y:0,z:-10},{x:-90,y:0,z:0},0.001)
  
  // loadFBXModel('./assets/models/Tree/Tree.FBX',{x:-20,y:0,z:-20},undefined,0.00175)
  // loadFBXModel('./assets/models/Tree/Tree.FBX',{x:-10,y:0,z:-40},undefined,0.00175)
  // loadFBXModel('./assets/models/Tree/Tree.FBX',{x:10,y:0,z:-20},undefined,0.00175)
  // loadFBXModel('./assets/models/Tree/Tree.FBX',{x:20,y:0,z:-40},undefined,0.001)
}

function loadCliffs(){
  loadFBXModel('./assets/models/cliffs/cliff1.fbx',{x:0,y:(layoutDimensions.height/2)+10,z:0},{x:3.14/2,y:0,z:0},0.3)
  loadFBXModel('./assets/models/cliffs/cliff1.fbx',{x:-(layoutDimensions.width/2)-20,y:0,z:0},{x:0,y:0,z:-3.14/2},0.3)
  loadFBXModel('./assets/models/cliffs/cliff1.fbx',{x:(layoutDimensions.width/2)+20,y:0,z:0},{x:0,y:0,z:3.14/2},0.3)
  loadFBXModel('./assets/models/cliffs/cliff1.fbx',{x:0,y:-((layoutDimensions.width/2)+20),z:0},{x:3.14/2,y:3.14,z:0},0.3)
}

function loadWorld(){
  //loadCliffs();
  //loadTrees();
  loadGLTFModel('./assets/models/model.gltf',{x:0,y:0,z:0},undefined,1)
  //loadFBXModel('./assets/models/model.fbx',{x:0,y:0,z:0},undefined,0.05)
}

function loadSky(){
// Sky material and light settings
const skyUniforms = sky.material.uniforms;
skyUniforms['turbidity'].value = 10;  // Cloudiness
skyUniforms['rayleigh'].value = 2;    // Rayleigh scattering (affects blue sky color)
skyUniforms['mieCoefficient'].value = 0.005;  // Mie scattering (affects haziness)
skyUniforms['mieDirectionalG'].value = 0.8;   // Sun direct scattering

const theta = Math.PI / 2 - Math.PI / 12;  // Elevation angle (lower for dimmer sun)
const phi = 2 * Math.PI;  // Azimuthal angle (full circle)

sun.x =0
sun.y = 10
sun.z = 10
sky.material.uniforms['sunPosition'].value = sun;
}

function loadLighting(){
  directionalLight.position.set(sun.x, sun.y, sun.z).normalize();
  scene.add(directionalLight);
}

function loadGround(){
  loadFBXModel('./assets/models/plane.fbx',{x:0,y:0,z:10},{x:0,y:0,z:0},1)
}

