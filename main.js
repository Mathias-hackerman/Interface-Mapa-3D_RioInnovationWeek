import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Cena, câmera e renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(10, 20, 10);  // X, Y, Z



const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Luz
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Plano (chão)
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Cubo
let personagem = null;

const loader = new GLTFLoader();
loader.load('personagem.glb', (gltf) => {
  personagem = gltf.scene;
  personagem.scale.set(1, 1, 1); // Escala parecida com o cubo
  personagem.position.set(0, 0, 0.5); // Mesmo local que o cubo
  scene.add(personagem);
});

camera.lookAt(personagem.position);

// Controles de movimento
const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// Lógica de movimento
const speed = 0.1;

// Responsividade
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// JOYSTICK: suporte touch + mouse
let joystick = {
  active: false,
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0
};

const stick = document.getElementById("joystick-stick");
const base = document.getElementById("joystick-base");

function startJoystick(clientX, clientY) {
  joystick.active = true;
  joystick.startX = clientX;
  joystick.startY = clientY;
}

function moveJoystick(clientX, clientY) {
  if (!joystick.active) return;

  const dx = clientX - joystick.startX;
  const dy = clientY - joystick.startY;

  const maxDist = 40;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  const limitedDist = Math.min(dist, maxDist);
  const limitedX = Math.cos(angle) * limitedDist;
  const limitedY = Math.sin(angle) * limitedDist;

  stick.style.transform = `translate(${limitedX}px, ${limitedY}px)`;

  joystick.deltaX = limitedX / maxDist;
  joystick.deltaY = limitedY / maxDist;
}

function endJoystick() {
  joystick.active = false;
  joystick.deltaX = 0;
  joystick.deltaY = 0;
  stick.style.transform = `translate(0px, 0px)`;
}

// Touch
base.addEventListener("touchstart", e => startJoystick(e.targetTouches[0].clientX, e.targetTouches[0].clientY));
base.addEventListener("touchmove", e => {
  moveJoystick(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
  e.preventDefault();
});
base.addEventListener("touchend", endJoystick);

// Mouse
base.addEventListener("mousedown", e => startJoystick(e.clientX, e.clientY));
window.addEventListener("mousemove", e => {
  if (joystick.active) moveJoystick(e.clientX, e.clientY);
});
window.addEventListener("mouseup", endJoystick);


function animate() {
  requestAnimationFrame(animate);

  let moveX = 0;
  let moveZ = 0;
  
  // Movimento com teclado
  if (keys.w) moveZ -= 1;
  if (keys.s) moveZ += 1;
  if (keys.a) moveX -= 1;
  if (keys.d) moveX += 1;
  
  // Movimento com joystick (touch ou mouse)
  moveX += joystick.deltaX;
  moveZ += joystick.deltaY;
  
  // Aplicar movimento ao cubo
  if (personagem) {
    personagem.position.x += moveX * speed;
    personagem.position.z += moveZ * speed;
  
    // Rotação do personagem
    if (moveX !== 0 || moveZ !== 0) {
      const angle = Math.atan2(moveX, moveZ); // invertido para alinhar com Z
      personagem.rotation.y = angle;
    }
  
      // Câmera isométrica seguindo personagem
      camera.position.set(
        personagem.position.x + 10,
        personagem.position.y + 20,
        personagem.position.z + 10
      );
      camera.lookAt(personagem.position);
  }


  renderer.render(scene, camera);
}

animate();

