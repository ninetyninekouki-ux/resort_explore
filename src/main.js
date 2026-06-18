import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import { LANDMARKS, RINGS } from '../data/landmarks.js';

const canvas = document.getElementById('game');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x78c7ff);
scene.fog = new THREE.Fog(0x78c7ff, 170, 520);

const camera = new THREE.PerspectiveCamera(68, window.innerWidth / window.innerHeight, 0.1, 1200);

const hemi = new THREE.HemisphereLight(0xdff5ff, 0x506842, 2.0);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 2.35);
sun.position.set(-120, 180, 90);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -260;
sun.shadow.camera.right = 260;
sun.shadow.camera.top = 260;
sun.shadow.camera.bottom = -260;
scene.add(sun);

const world = new THREE.Group();
scene.add(world);

const MAP_SIZE = 360;
const HALF = MAP_SIZE / 2;
const keys = Object.create(null);
const discovered = new Set(JSON.parse(localStorage.getItem('resortExploreDiscovered') || '[]'));
let started = false;
let messageTimer = 0;
let ringCount = 0;

const ui = {
  speed: document.getElementById('speed'),
  altitude: document.getElementById('altitude'),
  found: document.getElementById('found'),
  fuelBar: document.getElementById('fuelBar'),
  message: document.getElementById('message'),
  startPanel: document.getElementById('startPanel'),
  minimap: document.getElementById('minimap'),
};
const mapCtx = ui.minimap.getContext('2d');

const player = {
  position: new THREE.Vector3(-70, 24, 104),
  velocity: new THREE.Vector3(0, 0, 0),
  yaw: -0.25,
  pitch: -0.08,
  fuel: 100,
  maxFuel: 100,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

function gaussian(x, z, cx, cz, sx, sz, height) {
  const dx = (x - cx) / sx;
  const dz = (z - cz) / sz;
  return height * Math.exp(-(dx * dx + dz * dz));
}

function mainIslandMask(x, z) {
  // Composite ellipses to roughly match a resort-island silhouette.
  const e1 = Math.hypot((x + 20) / 125, (z - 10) / 112);
  const e2 = Math.hypot((x - 62) / 92, (z + 42) / 92);
  const e3 = Math.hypot((x + 93) / 60, (z - 18) / 70);
  const e4 = Math.hypot((x - 40) / 58, (z - 92) / 45);
  const e5 = Math.hypot((x + 55) / 58, (z + 102) / 48);
  const m = Math.min(e1, e2, e3, e4, e5);
  return 1 - smoothstep(0.92, 1.08, m);
}

function smallIslandMask(x, z) {
  const e = Math.hypot((x - 140) / 48, (z - 142) / 54);
  return 1 - smoothstep(0.88, 1.08, e);
}

function islandMask(x, z) {
  return Math.max(mainIslandMask(x, z), smallIslandMask(x, z));
}

function terrainHeight(x, z) {
  const mask = islandMask(x, z);
  if (mask <= 0.02) return -2;

  let h = 2;
  h += gaussian(x, z, 92, -75, 36, 38, 56); // volcano
  h += gaussian(x, z, -86, -46, 42, 42, 19); // west hills
  h += gaussian(x, z, -6, -126, 50, 34, 20); // north ridge
  h += gaussian(x, z, 52, -12, 46, 36, 14); // central ruins ridge
  h += gaussian(x, z, 2, 38, 30, 28, -7); // lake depression
  h += gaussian(x, z, 5, -12, 40, 28, -7); // lake depression
  h += gaussian(x, z, -54, 92, 44, 34, -3); // town flat
  h += gaussian(x, z, 94, 82, 54, 30, -4); // beach flat
  return h * mask;
}

function terrainColor(x, z, h) {
  const mask = islandMask(x, z);
  if (mask < 0.08) return new THREE.Color(0x158bc7);
  const edge = mask < 0.45;
  const lake = Math.hypot((x - 6) / 42, (z + 8) / 30) < 1 || Math.hypot((x - 2) / 24, (z - 39) / 20) < 1;
  const beach = z > 48 && x > 20 && x < 145;
  const town = x > -86 && x < -22 && z > 68 && z < 124;
  const wind = x < -65 && z < -15;
  if (lake) return new THREE.Color(0x1a8fd4);
  if (beach || edge) return new THREE.Color(0xf4e7b3);
  if (town) return new THREE.Color(0xd7c38f);
  if (h > 38) return new THREE.Color(0x806a46);
  if (h > 22) return new THREE.Color(0x9a814e);
  if (wind) return new THREE.Color(0x6bbc4c);
  return new THREE.Color(0x62bd4a);
}

function createTerrain() {
  const segments = 160;
  const geometry = new THREE.PlaneGeometry(MAP_SIZE, MAP_SIZE, segments, segments);
  const pos = geometry.attributes.position;
  const colors = [];

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getY(i);
    const h = terrainHeight(x, z);
    pos.setZ(i, h);
    const c = terrainColor(x, z, h);
    colors.push(c.r, c.g, c.b);
  }

  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  geometry.rotateX(-Math.PI / 2);

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.02,
  });

  const terrain = new THREE.Mesh(geometry, material);
  terrain.receiveShadow = true;
  world.add(terrain);
}

function createOcean() {
  const geometry = new THREE.PlaneGeometry(1400, 1400, 1, 1);
  geometry.rotateX(-Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({
    color: 0x0c83c9,
    roughness: 0.5,
    metalness: 0.1,
    transparent: true,
    opacity: 0.94,
  });
  const ocean = new THREE.Mesh(geometry, material);
  ocean.position.y = -1.4;
  ocean.receiveShadow = true;
  world.add(ocean);
}

function createCylinder(radius, height, color, position) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius, height, 24),
    new THREE.MeshStandardMaterial({ color, roughness: 0.72 })
  );
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  world.add(mesh);
  return mesh;
}

function createBox(w, h, d, color, position) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  world.add(mesh);
  return mesh;
}

function createCone(radius, height, color, position) {
  const mesh = new THREE.Mesh(
    new THREE.ConeGeometry(radius, height, 32),
    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
  );
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  world.add(mesh);
  return mesh;
}

function addLandmarkLabel(text, x, y, z) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(4, 14, 28, 0.72)';
  roundRect(ctx, 12, 22, 488, 76, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.28)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 61);
  const texture = new THREE.CanvasTexture(canvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.position.set(x, y, z);
  sprite.scale.set(34, 8.5, 1);
  world.add(sprite);
  return sprite;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function createLandmarks() {
  for (const lm of LANDMARKS) {
    const h = terrainHeight(lm.x, lm.z);
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(3.4, 20, 20),
      new THREE.MeshStandardMaterial({ color: discovered.has(lm.id) ? 0x64f08a : 0xffd257, emissive: 0x1a1605, roughness: 0.35 })
    );
    marker.position.set(lm.x, Math.max(h, lm.y) + 7, lm.z);
    marker.userData.landmarkId = lm.id;
    marker.castShadow = true;
    world.add(marker);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(lm.radius, 0.25, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22 })
    );
    ring.position.set(lm.x, Math.max(h, lm.y) + 0.4, lm.z);
    ring.rotation.x = Math.PI / 2;
    world.add(ring);

    addLandmarkLabel(lm.name, lm.x, Math.max(h, lm.y) + 18, lm.z);
  }
}

function createRings() {
  for (const ringData of RINGS) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(ringData.r, 0.5, 12, 64),
      new THREE.MeshStandardMaterial({ color: 0xffb637, emissive: 0x442000, roughness: 0.28 })
    );
    ring.position.set(ringData.x, ringData.y, ringData.z);
    ring.rotation.y = Math.PI / 2;
    ring.castShadow = true;
    ring.userData.challengeRing = true;
    world.add(ring);
  }
}

function createTown() {
  const buildingColors = [0xffcf6d, 0xf3f0d7, 0xb5d8ff, 0xff9f8f, 0xd9c4ff];
  let i = 0;
  for (let x = -78; x <= -30; x += 16) {
    for (let z = 78; z <= 118; z += 14) {
      const h = terrainHeight(x, z);
      const height = 6 + ((i * 7) % 10);
      const b = createBox(9, height, 9, buildingColors[i % buildingColors.length], new THREE.Vector3(x, h + height / 2, z));
      const roof = createCone(7, 4, 0xb6573e, new THREE.Vector3(x, h + height + 2, z));
      roof.rotation.y = Math.PI / 4;
      i++;
    }
  }
  createCylinder(5, 1.4, 0x5db4e8, new THREE.Vector3(-54, terrainHeight(-54, 94) + 0.8, 94));
}

function createWindFarm() {
  const positions = [[-110, -52], [-90, -48], [-72, -35], [-105, -20]];
  for (const [x, z] of positions) {
    const h = terrainHeight(x, z);
    createCylinder(1.2, 18, 0xf2f2e9, new THREE.Vector3(x, h + 9, z));
    const hub = new THREE.Mesh(new THREE.SphereGeometry(2, 16, 16), new THREE.MeshStandardMaterial({ color: 0xf8f8f8 }));
    hub.position.set(x, h + 18, z);
    hub.castShadow = true;
    world.add(hub);
    for (let a = 0; a < 3; a++) {
      const blade = createBox(1.1, 11, 0.35, 0xffffff, new THREE.Vector3(x, h + 18, z));
      blade.rotation.z = a * Math.PI * 2 / 3;
      blade.position.x += Math.cos(blade.rotation.z) * 4;
      blade.position.y += Math.sin(blade.rotation.z) * 4;
    }
  }
}

function createLighthouse() {
  const x = -116, z = 64, h = terrainHeight(x, z);
  createCylinder(4, 28, 0xffffff, new THREE.Vector3(x, h + 14, z));
  createCylinder(4.6, 3, 0xd74835, new THREE.Vector3(x, h + 29, z));
  const light = new THREE.PointLight(0xfff4bd, 1.5, 90);
  light.position.set(x, h + 32, z);
  world.add(light);
}

function createBridgeAndPier() {
  const bridge = createBox(44, 1.8, 6, 0x8d6c4b, new THREE.Vector3(24, terrainHeight(24, 48) + 7, 48));
  bridge.rotation.y = -0.45;
  const pier = createBox(8, 1.2, 46, 0x8a6240, new THREE.Vector3(-48, terrainHeight(-48, 120) + 1, 137));
  pier.rotation.y = 0.05;
}

function createPlayerModel() {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(1.8, 4.8, 8, 16), new THREE.MeshStandardMaterial({ color: 0x232b36, roughness: 0.42 }));
  body.castShadow = true;
  group.add(body);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(1.65, 20, 20), new THREE.MeshStandardMaterial({ color: 0x0f1824, metalness: 0.2, roughness: 0.25 }));
  helmet.position.y = 3.8;
  helmet.castShadow = true;
  group.add(helmet);
  const pack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 4.4, 1.2), new THREE.MeshStandardMaterial({ color: 0x1f2b34, metalness: 0.28, roughness: 0.35 }));
  pack.position.set(0, 1.4, 1.35);
  pack.castShadow = true;
  group.add(pack);
  for (const x of [-1, 1]) {
    const thruster = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 2.4, 16), new THREE.MeshStandardMaterial({ color: 0x5d6672, metalness: 0.4, roughness: 0.3 }));
    thruster.position.set(x, -1.3, 1.45);
    thruster.rotation.x = Math.PI / 2;
    group.add(thruster);
  }
  world.add(group);
  return group;
}

createOcean();
createTerrain();
createTown();
createWindFarm();
createLighthouse();
createBridgeAndPier();
createLandmarks();
createRings();
const playerModel = createPlayerModel();

function showMessage(title, body) {
  ui.message.innerHTML = `<strong>${title}</strong><br>${body}`;
  ui.message.classList.remove('hidden');
  messageTimer = 3.2;
}

function startGame() {
  started = true;
  ui.startPanel.style.display = 'none';
  if (canvas.requestPointerLock && window.matchMedia('(hover: hover)').matches) {
    canvas.requestPointerLock();
  }
}

ui.startPanel.addEventListener('click', startGame);
canvas.addEventListener('click', () => {
  if (!started) startGame();
});

window.addEventListener('keydown', (e) => {
  keys[e.code.toLowerCase()] = true;
});
window.addEventListener('keyup', (e) => {
  keys[e.code.toLowerCase()] = false;
});
window.addEventListener('mousemove', (e) => {
  if (!started) return;
  const pointerLocked = document.pointerLockElement === canvas;
  if (!pointerLocked && window.matchMedia('(hover: hover)').matches) return;
  player.yaw -= e.movementX * 0.0024;
  player.pitch = clamp(player.pitch - e.movementY * 0.0018, -0.86, 0.46);
});

let lastTouch = null;
window.addEventListener('touchstart', (e) => {
  if (!started) startGame();
  const touch = e.touches[0];
  lastTouch = { x: touch.clientX, y: touch.clientY };
}, { passive: true });
window.addEventListener('touchmove', (e) => {
  if (!started || !lastTouch) return;
  const touch = e.touches[0];
  const dx = touch.clientX - lastTouch.x;
  const dy = touch.clientY - lastTouch.y;
  if (touch.clientX > window.innerWidth * 0.35) {
    player.yaw -= dx * 0.004;
    player.pitch = clamp(player.pitch - dy * 0.003, -0.86, 0.46);
  }
  lastTouch = { x: touch.clientX, y: touch.clientY };
}, { passive: true });

for (const btn of document.querySelectorAll('#mobileControls button')) {
  const code = btn.dataset.key;
  const keyName = code === 'space' ? 'space' : code === 'shift' ? 'shiftleft' : code === 'e' ? 'keye' : 'key' + code;
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); keys[keyName] = true; });
  btn.addEventListener('pointerup', (e) => { e.preventDefault(); keys[keyName] = false; });
  btn.addEventListener('pointercancel', () => { keys[keyName] = false; });
  btn.addEventListener('pointerleave', () => { keys[keyName] = false; });
}

function getInputVector() {
  let x = 0, z = 0, y = 0;
  if (keys['keyw']) z -= 1;
  if (keys['keys']) z += 1;
  if (keys['keya']) x -= 1;
  if (keys['keyd']) x += 1;
  if (keys['space']) y += 1;
  if (keys['shiftleft'] || keys['shiftright']) y -= 1;
  return new THREE.Vector3(x, y, z);
}

function updatePlayer(dt) {
  if (!started) return;

  const input = getInputVector();
  // Phase 1: boost is always enabled. E key is no longer required.
  const boost = true;
  const forward = new THREE.Vector3(Math.sin(player.yaw), 0, Math.cos(player.yaw));
  const right = new THREE.Vector3(Math.cos(player.yaw), 0, -Math.sin(player.yaw));
  const desired = new THREE.Vector3();
  desired.addScaledVector(forward, -input.z);
  // Fix A/D reverse feel: A should move left and D should move right relative to the current camera direction.
  desired.addScaledVector(right, -input.x);
  desired.y += input.y;
  if (desired.lengthSq() > 1) desired.normalize();

  // Free fall is allowed when the player is not actively applying thrust.
  const thrusting = desired.lengthSq() > 0.02;
  const canUseFuel = player.fuel > 0;
  const accel = boost && canUseFuel ? 72 : 38;
  const maxSpeed = boost && canUseFuel ? 54 : 29;

  if (thrusting && canUseFuel) {
    player.velocity.addScaledVector(desired, accel * dt);
    player.fuel = Math.max(0, player.fuel - 22 * dt);
  } else {
    player.fuel = Math.min(player.maxFuel, player.fuel + 10 * dt);
  }

  // Free-fall gravity. Horizontal drag remains, but vertical drag is not applied.
  player.velocity.y -= 16.0 * dt;
  const horizontalDrag = Math.pow(0.965, dt * 60);
  player.velocity.x *= horizontalDrag;
  player.velocity.z *= horizontalDrag;
  if (player.velocity.length() > maxSpeed) player.velocity.setLength(maxSpeed);

  player.position.addScaledVector(player.velocity, dt);
  player.position.x = clamp(player.position.x, -HALF + 4, HALF - 4);
  player.position.z = clamp(player.position.z, -HALF + 4, HALF - 4);

  const ground = terrainHeight(player.position.x, player.position.z) + 4.2;
  if (player.position.y < ground) {
    player.position.y = ground;
    player.velocity.y = Math.max(0, player.velocity.y);
    player.fuel = Math.min(player.maxFuel, player.fuel + 18 * dt);
  }

  playerModel.position.copy(player.position);
  playerModel.rotation.set(0, player.yaw + Math.PI, 0);
  playerModel.rotation.x = clamp(-player.velocity.y * 0.01, -0.25, 0.25);

  const camOffset = new THREE.Vector3(
    -Math.sin(player.yaw) * 15,
    7 - player.pitch * 12,
    -Math.cos(player.yaw) * 15
  );
  camera.position.lerp(player.position.clone().add(camOffset), 0.12);
  const lookAt = player.position.clone().add(new THREE.Vector3(0, 3, 0));
  camera.lookAt(lookAt);

  checkDiscoveries();
  checkRings();
}

function checkDiscoveries() {
  for (const lm of LANDMARKS) {
    if (discovered.has(lm.id)) continue;
    const d = player.position.distanceTo(new THREE.Vector3(lm.x, Math.max(lm.y, terrainHeight(lm.x, lm.z)), lm.z));
    if (d < lm.radius) {
      discovered.add(lm.id);
      localStorage.setItem('resortExploreDiscovered', JSON.stringify([...discovered]));
      showMessage(`${lm.name} を発見`, lm.description);
    }
  }
}

function checkRings() {
  for (const obj of world.children) {
    if (!obj.userData.challengeRing || obj.userData.passed) continue;
    if (player.position.distanceTo(obj.position) < 7.5) {
      obj.userData.passed = true;
      obj.material.color.set(0x64f08a);
      obj.material.emissive.set(0x094d19);
      ringCount++;
      showMessage('リング通過', `チャレンジリング ${ringCount}/${RINGS.length}`);
    }
  }
}

function updateUI(dt) {
  ui.speed.textContent = Math.round(player.velocity.length()).toString();
  ui.altitude.textContent = Math.max(0, Math.round(player.position.y - terrainHeight(player.position.x, player.position.z))).toString();
  ui.found.textContent = `${discovered.size}/${LANDMARKS.length}`;
  ui.fuelBar.style.width = `${Math.round(player.fuel)}%`;
  if (messageTimer > 0) {
    messageTimer -= dt;
    if (messageTimer <= 0) ui.message.classList.add('hidden');
  }
}

function drawMinimap() {
  const ctx = mapCtx;
  const w = ui.minimap.width;
  const h = ui.minimap.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(9, 132, 194, 0.92)';
  ctx.fillRect(0, 0, w, h);

  // World -> minimap conversion.
  // X grows to the right. Z grows upward on the minimap, so the Y pixel is flipped.
  const toMap = (x, z) => [
    ((x + HALF) / MAP_SIZE) * w,
    h - ((z + HALF) / MAP_SIZE) * h,
  ];

  // Draw approximate island silhouette by sampling points.
  const step = 2;
  for (let px = 0; px < w; px += step) {
    for (let py = 0; py < h; py += step) {
      const x = (px / w) * MAP_SIZE - HALF;
      const z = ((h - py) / h) * MAP_SIZE - HALF;
      const mask = islandMask(x, z);
      if (mask > 0.12) {
        ctx.fillStyle = mask < 0.45 ? '#eadfa6' : '#5cc44d';
        ctx.fillRect(px, py, step + 0.5, step + 0.5);
      }
    }
  }

  for (const lm of LANDMARKS) {
    const [mx, my] = toMap(lm.x, lm.z);
    ctx.beginPath();
    ctx.arc(mx, my, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = discovered.has(lm.id) ? '#7cff8f' : '#ffd85e';
    ctx.fill();
  }

  const [px, py] = toMap(player.position.x, player.position.z);
  ctx.save();
  ctx.translate(px, py);
  // Arrow points toward the same direction as the player's world-facing direction.
  ctx.rotate(player.yaw);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(5, 6);
  ctx.lineTo(0, 3);
  ctx.lineTo(-5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;
  updatePlayer(dt);
  updateUI(dt);
  drawMinimap();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

camera.position.set(-70, 36, 132);
camera.lookAt(player.position);
showMessage('準備完了', 'クリックまたはタップで開始。ランドマークとリングを探してください。');
requestAnimationFrame(animate);
