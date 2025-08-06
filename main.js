// Cena, câmera e renderizador
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd1e5);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 5, 10);

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
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.y = 0.5;
scene.add(cube);

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

function animate() {
  requestAnimationFrame(animate);

  let moveX = 0;
  let moveZ = 0;
  
  if (keys.w) moveZ -= 1;
  if (keys.s) moveZ += 1;
  if (keys.a) moveX -= 1;
  if (keys.d) moveX += 1;
  
  // Joystick (normalizado)
  moveX += joystick.deltaX;
  moveZ += joystick.deltaY;
  
  cube.position.x += moveX * speed;
  cube.position.z += moveZ * speed;


  renderer.render(scene, camera);
}

animate();

// Responsividade
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let joystick = {
  active: false,
  startX: 0,
  startY: 0,
  deltaX: 0,
  deltaY: 0
};

const stick = document.getElementById("joystick-stick");
const base = document.getElementById("joystick-base");

base.addEventListener("touchstart", (e) => {
  joystick.active = true;
  const touch = e.targetTouches[0];
  joystick.startX = touch.clientX;
  joystick.startY = touch.clientY;
}, false);

base.addEventListener("touchmove", (e) => {
  if (!joystick.active) return;

  const touch = e.targetTouches[0];
  const dx = touch.clientX - joystick.startX;
  const dy = touch.clientY - joystick.startY;

  // Limite o deslocamento do stick
  const maxDist = 40;
  const dist = Math.hypot(dx, dy);
  const angle = Math.atan2(dy, dx);

  const limitedDist = Math.min(dist, maxDist);
  const limitedX = Math.cos(angle) * limitedDist;
  const limitedY = Math.sin(angle) * limitedDist;

  stick.style.transform = `translate(${limitedX}px, ${limitedY}px)`;

  joystick.deltaX = limitedX / maxDist;
  joystick.deltaY = limitedY / maxDist;

  e.preventDefault();
}, false);

base.addEventListener("touchend", () => {
  joystick.active = false;
  joystick.deltaX = 0;
  joystick.deltaY = 0;
  stick.style.transform = `translate(0px, 0px)`;
}, false);

