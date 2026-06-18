import * as THREE from 'three';
import { WORLD_BOUNDS, islandOutline, secondaryIslands, zones, pathRoutes, landmarks, ringCourses } from '../data/islandData.js';

const canvasHost = document.body;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86c9ff);
scene.fog = new THREE.Fog(0x86c9ff, 320, 920);

const camera = new THREE.PerspectiveCamera(64, window.innerWidth / window.innerHeight, 0.1, 1800);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
canvasHost.appendChild(renderer.domElement);

// UI
const altitudeEl = document.getElementById('altitude');
const speedEl = document.getElementById('speed');
const discoveredEl = document.getElementById('discovered');
const totalLandmarksEl = document.getElementById('totalLandmarks');
const messageEl = document.getElementById('message');
const startOverlay = document.getElementById('startOverlay');
const startButton = document.getElementById('startButton');
const minimapCanvas = document.getElementById('minimap');
const mini = minimapCanvas.getContext('2d');

// Lights
const hemi = new THREE.HemisphereLight(0xbfe8ff, 0x4b6b3d, 1.55);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 2.3);
sun.position.set(-190, 360, 120);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -420;
sun.shadow.camera.right = 420;
sun.shadow.camera.top = 420;
sun.shadow.camera.bottom = -420;
scene.add(sun);

// Materials + light procedural textures. These do not use copyrighted assets; they only add natural variation.
function makeNoiseTexture(base, fleck, size = 96, density = 220) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < density; i++) {
    const a = Math.random() * 0.22 + 0.04;
    ctx.fillStyle = `rgba(${fleck[0]},${fleck[1]},${fleck[2]},${a})`;
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = Math.random() * 1.8 + 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(18, 18);
  return tex;
}

function makeRoofTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c95b3a'; ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(90,35,20,.35)'; ctx.lineWidth = 2;
  for (let y = 0; y < 128; y += 16) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(128, y); ctx.stroke(); }
  for (let x = 0; x < 128; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 12, 128); ctx.stroke(); }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1.6, 1.6);
  return tex;
}

const grassTex = makeNoiseTexture('#4da85b', [34, 90, 38], 128, 500);
const sandTex = makeNoiseTexture('#eadb9c', [175, 150, 92], 128, 420);
const rockTex = makeNoiseTexture('#766b61', [44, 40, 36], 128, 460);
const wallTex = makeNoiseTexture('#e8ddc6', [110, 100, 78], 96, 260);
const roofTex = makeRoofTexture();
const waterTex = makeNoiseTexture('#1f91d5', [180, 235, 255], 128, 160);
waterTex.repeat.set(10, 10);

const matWater = new THREE.MeshStandardMaterial({ color: 0x1f91d5, map: waterTex, roughness: 0.18, metalness: 0.02, transparent: true, opacity: 0.78 });
const matSand = new THREE.MeshStandardMaterial({ color: 0xf3df9f, map: sandTex, roughness: 0.88 });
const matRock = new THREE.MeshStandardMaterial({ color: 0x7a6d61, map: rockTex, roughness: 0.96 });
const matGrass = new THREE.MeshStandardMaterial({ color: 0x55a64b, map: grassTex, roughness: 0.93 });
const matTown = new THREE.MeshStandardMaterial({ color: 0xf2e6ca, map: wallTex, roughness: 0.78 });
const matRoof = new THREE.MeshStandardMaterial({ color: 0xd86642, map: roofTex, roughness: 0.78 });
const matWhite = new THREE.MeshStandardMaterial({ color: 0xf2f4f2, roughness: 0.72 });
const matWood = new THREE.MeshStandardMaterial({ color: 0x8c5e33, roughness: 0.86 });
const matRing = new THREE.MeshStandardMaterial({ color: 0xffd24a, emissive: 0x9a5b00, emissiveIntensity: 0.45, roughness: 0.45 });
const matPath = new THREE.MeshStandardMaterial({ color: 0xdcc98d, roughness: 0.92 });
const matPlaza = new THREE.MeshStandardMaterial({ color: 0xcaa574, roughness: 0.82 });
const matRoad = new THREE.MeshStandardMaterial({ color: 0x8a7b61, roughness: 0.92 });
const matBridgeRed = new THREE.MeshStandardMaterial({ color: 0xb8332b, roughness: 0.78 });

// World groups
const terrainGroup = new THREE.Group();
const propGroup = new THREE.Group();
const landmarkGroup = new THREE.Group();
const ringGroup = new THREE.Group();
scene.add(terrainGroup, propGroup, landmarkGroup, ringGroup);

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}
function distance2(x, z, cx, cz) {
  const dx = x - cx; const dz = z - cz;
  return Math.sqrt(dx * dx + dz * dz);
}
function ellipseDistance(x, z, cx, cz, rx, rz) {
  const dx = (x - cx) / rx; const dz = (z - cz) / rz;
  return Math.sqrt(dx * dx + dz * dz);
}
function pointInPolygon(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, zi = poly[i].z;
    const xj = poly[j].x, zj = poly[j].z;
    const intersect = ((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi + 0.00001) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointSegmentDistance(px, pz, ax, az, bx, bz) {
  const vx = bx - ax;
  const vz = bz - az;
  const wx = px - ax;
  const wz = pz - az;
  const len2 = vx * vx + vz * vz;
  const t = len2 > 0 ? clamp((wx * vx + wz * vz) / len2, 0, 1) : 0;
  const cx = ax + vx * t;
  const cz = az + vz * t;
  return distance2(px, pz, cx, cz);
}

function distanceToPolygonEdge(x, z, poly) {
  let best = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    best = Math.min(best, pointSegmentDistance(x, z, a.x, a.z, b.x, b.z));
  }
  return best;
}

function mainIslandFactor(x, z) {
  if (!pointInPolygon(x, z, islandOutline)) return 0;
  // This is the key v0.5 fix: coastline height now follows the polygon outline itself.
  // v0.4 used an ellipse, which made the island look round even if the outline data was irregular.
  const shore = distanceToPolygonEdge(x, z, islandOutline);
  return smoothstep(0, 42, shore);
}

function secondaryIslandFactor(x, z) {
  let best = 0;
  secondaryIslands.forEach((isle) => {
    const d = ellipseDistance(x, z, isle.x, isle.z, isle.radiusX, isle.radiusZ);
    best = Math.max(best, 1 - smoothstep(0.70, 1.06, d));
  });
  return clamp(best, 0, 1);
}

function isLand(x, z) {
  return pointInPolygon(x, z, islandOutline) || secondaryIslandFactor(x, z) > 0.03;
}

function edgeFalloff(x, z) {
  const main = mainIslandFactor(x, z);
  const secondary = secondaryIslandFactor(x, z);
  return clamp(Math.max(main, secondary), 0, 1);
}

function noise2(x, z) {
  return (
    Math.sin(x * 0.031 + z * 0.017) * 0.5 +
    Math.sin(x * 0.064 - z * 0.021) * 0.26 +
    Math.sin((x + z) * 0.047) * 0.18
  );
}

export function heightAt(x, z) {
  const island = edgeFalloff(x, z);
  if (island <= 0.02) return -2.8;

  let h = 4 + island * 11;
  h += noise2(x, z) * 3.4 * island;

  // Secondary islands: low, mostly sand/grass, with the southwest island larger but not mountainous.
  const secondary = secondaryIslandFactor(x, z);
  if (secondary > 0.03 && !pointInPolygon(x, z, islandOutline)) {
    h = 3.6 + secondary * 10 + noise2(x, z) * 1.8;
    const golfD = distance2(x, z, zones.golfIsland.x, zones.golfIsland.z) / zones.golfIsland.radius;
    if (golfD < 1.5) h += Math.max(0, 1 - golfD / 1.5) * 9;
  }

  // Main volcano on the north/east side.
  const vd = ellipseDistance(x, z, zones.volcano.x, zones.volcano.z, zones.volcano.radiusX, zones.volcano.radiusZ);
  const volcano = Math.max(0, 1 - vd);
  h += Math.pow(volcano, 1.58) * zones.volcano.height;

  // Broad shoulder prevents a simple cone and creates the huge foot seen in reference images.
  const vsd = ellipseDistance(x, z, zones.volcanoShoulder.x, zones.volcanoShoulder.z, zones.volcanoShoulder.radiusX, zones.volcanoShoulder.radiusZ);
  const shoulder = Math.max(0, 1 - vsd);
  h += Math.pow(shoulder, 0.86) * zones.volcanoShoulder.height;
  h += shoulder * (Math.sin((x - 60) * 0.050) * 2.1 + Math.sin((z - 100) * 0.045) * 1.9);

  // Crater depression.
  const cd = distance2(x, z, zones.crater.x, zones.crater.z) / zones.crater.radius;
  if (cd < 1) h -= (1 - cd) * 42;

  // West-of-volcano raised plateau containing lake/castle/forest.
  const pd = ellipseDistance(x, z, zones.westPlateau.x, zones.westPlateau.z, zones.westPlateau.radiusX, zones.westPlateau.radiusZ);
  const plateau = Math.max(0, 1 - pd);
  h += Math.pow(plateau, 0.78) * zones.westPlateau.height;
  if (plateau > 0.05) h = Math.max(h, 34 + plateau * 18 + noise2(x, z) * 2.2);

  // Castle pad is flattened on the plateau.
  const castleD = distance2(x, z, zones.castle.x, zones.castle.z) / zones.castle.radius;
  if (castleD < 1.15) h = h * 0.45 + (48 + castleD * 2.5) * 0.55;

  // West lighthouse / windmill cliff shelf.
  const wh = ellipseDistance(x, z, zones.windHill.x, zones.windHill.z, zones.windHill.radiusX, zones.windHill.radiusZ);
  h += Math.max(0, 1 - wh) * 30;
  const capeD = distance2(x, z, zones.lighthouseCape.x, zones.lighthouseCape.z) / zones.lighthouseCape.radius;
  if (capeD < 1.35) h += Math.max(0, 1 - capeD / 1.35) * 22;

  // Ruins north of volcano.
  const rd = distance2(x, z, zones.ruins.x, zones.ruins.z) / zones.ruins.radius;
  if (rd < 1.3) h += Math.max(0, 1 - rd / 1.3) * 20;

  // East arm is mostly rolling grass, not a vertical cliff.
  const eastArmD = ellipseDistance(x, z, 245, -122, 156, 148);
  if (eastArmD < 1) h += (1 - eastArmD) * 7;

  // High plateau lake and small lower pool carved to waterlines.
  const ld = ellipseDistance(x, z, zones.lake.x, zones.lake.z, zones.lake.radiusX, zones.lake.radiusZ);
  if (ld < 1) h = Math.min(h, 50.0 - (1 - ld) * 5.0);

  const uld = ellipseDistance(x, z, zones.upperLake.x, zones.upperLake.z, zones.upperLake.radiusX, zones.upperLake.radiusZ);
  if (uld < 1) h = Math.min(h, 39.0 - (1 - uld) * 3.0);

  // Waterfall / river corridor down from the plateau to the cave.
  zones.river.points.forEach((p, idx) => {
    if (idx === 0) return;
    const a = zones.river.points[idx - 1];
    const b = p;
    const vx = b.x - a.x;
    const vz = b.z - a.z;
    const wx = x - a.x;
    const wz = z - a.z;
    const len2 = vx * vx + vz * vz;
    const t = clamp((wx * vx + wz * vz) / len2, 0, 1);
    const px = a.x + vx * t;
    const pz = a.z + vz * t;
    const d = distance2(x, z, px, pz);
    if (d < zones.river.width) {
      const target = 50 - idx * 8 - t * 6;
      h = Math.min(h, target + d * 0.08);
    }
  });

  // Cave shelf at the waterfall foot.
  const caveD = distance2(x, z, zones.fallsCave.x, zones.fallsCave.z) / zones.fallsCave.radius;
  if (caveD < 1.2) h = h * 0.64 + (22 + caveD * 2) * 0.36;

  // Main beaches + southeast C-shaped sandbar. Lagoon cuts a water hole into the sandbar.
  const bd = ellipseDistance(x, z, zones.beach.x, zones.beach.z, zones.beach.radiusX, zones.beach.radiusZ);
  if (bd < 1.1) h = Math.min(h, 5.7 + bd * 2.7);
  const sed = ellipseDistance(x, z, zones.southEastBeach.x, zones.southEastBeach.z, zones.southEastBeach.radiusX, zones.southEastBeach.radiusZ);
  if (sed < 1.15) h = Math.min(h, 5.3 + sed * 2.6);
  const snd = ellipseDistance(x, z, zones.sandbarNeck.x, zones.sandbarNeck.z, zones.sandbarNeck.radiusX, zones.sandbarNeck.radiusZ);
  if (snd < 1.1) h = Math.min(h, 5.0 + snd * 2.4);
  const csd = ellipseDistance(x, z, zones.cSandbar.x, zones.cSandbar.z, zones.cSandbar.radiusX, zones.cSandbar.radiusZ);
  if (csd < 1.05) h = Math.min(h, 5.0 + csd * 2.2);
  const lagoonD = ellipseDistance(x, z, zones.cLagoon.x, zones.cLagoon.z, zones.cLagoon.radiusX, zones.cLagoon.radiusZ);
  if (lagoonD < 1) h = Math.min(h, 2.2 - (1 - lagoonD) * 1.2);

  // Town, plaza, bridge and marina flattening.
  const td = ellipseDistance(x, z, zones.town.x, zones.town.z, zones.town.radiusX, zones.town.radiusZ);
  if (td < 1) h = h * 0.38 + 7.2 * 0.62;
  const redD = distance2(x, z, zones.redBridge.x, zones.redBridge.z) / zones.redBridge.radius;
  if (redD < 1.1) h = h * 0.55 + 8.4 * 0.45;
  const pld = distance2(x, z, zones.plaza.x, zones.plaza.z) / zones.plaza.radius;
  if (pld < 1) h = h * 0.22 + 7.0 * 0.78;
  const md = distance2(x, z, zones.marina.x, zones.marina.z) / zones.marina.radius;
  if (md < 1) h = h * 0.45 + 5.6 * 0.55;

  return h;
}

function varyColor(hex, x, z, amount = 0.08) {
  const c = new THREE.Color(hex);
  const n = noise2(x * 1.7, z * 1.7) * amount;
  c.offsetHSL(0, 0, n);
  return c;
}

function terrainColorAt(x, z, y) {
  const lakeD = ellipseDistance(x, z, zones.lake.x, zones.lake.z, zones.lake.radiusX, zones.lake.radiusZ);
  const upperLakeD = ellipseDistance(x, z, zones.upperLake.x, zones.upperLake.z, zones.upperLake.radiusX, zones.upperLake.radiusZ);
  const lagoonD = ellipseDistance(x, z, zones.cLagoon.x, zones.cLagoon.z, zones.cLagoon.radiusX, zones.cLagoon.radiusZ);
  const beachD = ellipseDistance(x, z, zones.beach.x, zones.beach.z, zones.beach.radiusX, zones.beach.radiusZ);
  const southBeachD = ellipseDistance(x, z, zones.southEastBeach.x, zones.southEastBeach.z, zones.southEastBeach.radiusX, zones.southEastBeach.radiusZ);
  const sandbarD = ellipseDistance(x, z, zones.sandbarNeck.x, zones.sandbarNeck.z, zones.sandbarNeck.radiusX, zones.sandbarNeck.radiusZ);
  const cSandD = ellipseDistance(x, z, zones.cSandbar.x, zones.cSandbar.z, zones.cSandbar.radiusX, zones.cSandbar.radiusZ);
  const volcanoD = ellipseDistance(x, z, zones.volcano.x, zones.volcano.z, zones.volcano.radiusX, zones.volcano.radiusZ);
  const townD = ellipseDistance(x, z, zones.town.x, zones.town.z, zones.town.radiusX, zones.town.radiusZ);
  const plateauD = ellipseDistance(x, z, zones.westPlateau.x, zones.westPlateau.z, zones.westPlateau.radiusX, zones.westPlateau.radiusZ);
  const secondary = secondaryIslandFactor(x, z);

  if (lakeD < 1 || upperLakeD < 1 || lagoonD < 1) return varyColor(0x2e8ccb, x, z, 0.05);
  if (beachD < 1.1 || southBeachD < 1.15 || sandbarD < 1.1 || cSandD < 1.05 || y < 6.8) return varyColor(0xeadb9c, x, z, 0.075);
  if (secondary > .28 && y < 12) return varyColor(0xdedb92, x, z, 0.08);
  if (volcanoD < 0.98 && y > 42) return varyColor(0x74695f, x, z, 0.08);
  if (townD < 1.05) return varyColor(0x8fbd69, x, z, 0.045);
  if (plateauD < 1.05) return varyColor(0x4f9252, x, z, 0.08);
  if (y > 82) return varyColor(0x6b655f, x, z, 0.07);
  if (y > 36) return varyColor(0x5b9851, x, z, 0.08);
  return varyColor(0x4aaa5d, x, z, 0.075);
}

function createTerrain() {
  const size = 840;
  const segments = 232;
  const half = size / 2;
  const positions = [];
  const colors = [];
  const uvs = [];
  const indices = [];

  for (let iz = 0; iz <= segments; iz++) {
    const z = -half + (iz / segments) * size;
    for (let ix = 0; ix <= segments; ix++) {
      const x = -half + (ix / segments) * size;
      const inside = isLand(x, z);
      let y = heightAt(x, z);
      if (!inside) y = -2.4;
      positions.push(x, y, z);
      const c = terrainColorAt(x, z, y);
      if (!inside) c.set(0x2679a8);
      colors.push(c.r, c.g, c.b);
      uvs.push(ix / segments, iz / segments);
    }
  }

  for (let iz = 0; iz < segments; iz++) {
    for (let ix = 0; ix < segments; ix++) {
      const a = iz * (segments + 1) + ix;
      const b = a + 1;
      const c = a + (segments + 1);
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: grassTex, roughness: 0.9, metalness: 0.02 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  terrainGroup.add(mesh);
}

function createWater() {
  const geo = new THREE.CircleGeometry(900, 96);
  const sea = new THREE.Mesh(geo, matWater);
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = 2.0;
  sea.receiveShadow = true;
  scene.add(sea);

  const lakeGeo = new THREE.CircleGeometry(1, 64);
  const lake = new THREE.Mesh(lakeGeo, matWater.clone());
  lake.scale.set(zones.lake.radiusX, zones.lake.radiusZ, 1);
  lake.rotation.x = -Math.PI / 2;
  lake.position.set(zones.lake.x, 50.4, zones.lake.z);
  terrainGroup.add(lake);

  const upperLake = new THREE.Mesh(lakeGeo.clone(), matWater.clone());
  upperLake.scale.set(zones.upperLake.radiusX, zones.upperLake.radiusZ, 1);
  upperLake.rotation.x = -Math.PI / 2;
  upperLake.position.set(zones.upperLake.x, 39.2, zones.upperLake.z);
  terrainGroup.add(upperLake);

  const lagoon = new THREE.Mesh(lakeGeo.clone(), matWater.clone());
  lagoon.scale.set(zones.cLagoon.radiusX, zones.cLagoon.radiusZ, 1);
  lagoon.rotation.x = -Math.PI / 2;
  lagoon.position.set(zones.cLagoon.x, 2.6, zones.cLagoon.z);
  terrainGroup.add(lagoon);

  // Waterfall strip: visual ribbon from plateau lake to cave.
  const riverMat = matWater.clone();
  zones.river.points.forEach((pt, idx) => {
    if (idx === 0) return;
    const a = zones.river.points[idx - 1];
    const b = pt;
    const mx = (a.x + b.x) / 2;
    const mz = (a.z + b.z) / 2;
    const len = distance2(a.x, a.z, b.x, b.z);
    const y = Math.max(heightAt(mx, mz) + 0.7, 4.2);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(zones.river.width * 1.15, 0.35, len), riverMat);
    strip.position.set(mx, y, mz);
    strip.rotation.y = Math.atan2(b.x - a.x, b.z - a.z);
    terrainGroup.add(strip);
  });
}

function addCylinder(name, radiusTop, radiusBottom, height, mat, position) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 20);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  propGroup.add(mesh);
  return mesh;
}

function addBox(name, sx, sy, sz, mat, position) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), mat);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  propGroup.add(mesh);
  return mesh;
}

function addHouse(x, z, w = 13, d = 11, h = 9, roofColor = matRoof) {
  const y = heightAt(x, z);
  addBox('house', w, h, d, matTown, new THREE.Vector3(x, y + h / 2, z));
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * .75, h * .55, 4), roofColor);
  roof.rotation.y = Math.PI / 4;
  roof.position.set(x, y + h + h * .28, z);
  roof.castShadow = true;
  roof.receiveShadow = true;
  propGroup.add(roof);
}

function addWindmill(x, z) {
  const y = heightAt(x, z);
  const pole = addCylinder('windmill_pole', 1.2, 1.6, 28, matWhite, new THREE.Vector3(x, y + 14, z));
  const hub = new THREE.Mesh(new THREE.SphereGeometry(2.2, 16, 8), matWhite);
  hub.position.set(x, y + 29, z + 0.8);
  hub.castShadow = true;
  propGroup.add(hub);
  for (let i = 0; i < 3; i++) {
    const blade = addBox('windmill_blade', 2, 15, .5, matWhite, new THREE.Vector3(x, y + 29, z + .8));
    blade.rotation.z = i * Math.PI * 2 / 3;
    blade.position.x += Math.cos(blade.rotation.z + Math.PI / 2) * 5;
    blade.position.y += Math.sin(blade.rotation.z + Math.PI / 2) * 5;
  }
  return pole;
}

function addTree(x, z, scale = 1) {
  const y = heightAt(x, z);
  const trunk = addCylinder('tree_trunk', .7 * scale, .9 * scale, 5 * scale, matWood, new THREE.Vector3(x, y + 2.5 * scale, z));
  const leaves = new THREE.Mesh(new THREE.ConeGeometry(4.5 * scale, 11 * scale, 10), matGrass);
  leaves.position.set(x, y + 10 * scale, z);
  leaves.castShadow = true;
  leaves.receiveShadow = true;
  propGroup.add(leaves);
}

function addLighthouse() {
  const x = zones.lighthouseCape.x, z = zones.lighthouseCape.z;
  const y = heightAt(x, z);
  addCylinder('lighthouse', 4.2, 5.2, 36, matWhite, new THREE.Vector3(x, y + 18, z));
  const top = addCylinder('lighthouse_top', 5.5, 4.2, 6, new THREE.MeshStandardMaterial({ color: 0xd44c3a }), new THREE.Vector3(x, y + 39, z));
  const light = new THREE.PointLight(0xfff2a6, 1.3, 180);
  light.position.set(x, y + 43, z);
  scene.add(light);
  return top;
}

function addBridge(x1, z1, x2, z2, mat = matWood) {
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const y = Math.max(heightAt(mx, mz), 9) + 2;
  const len = distance2(x1, z1, x2, z2);
  const bridge = addBox('bridge', 5, 2, len, mat, new THREE.Vector3(mx, y, mz));
  bridge.rotation.y = Math.atan2(x2 - x1, z2 - z1);
  return bridge;
}


function addFlatSegment(name, x1, z1, x2, z2, width, mat) {
  const mx = (x1 + x2) / 2;
  const mz = (z1 + z2) / 2;
  const len = distance2(x1, z1, x2, z2);
  const y = heightAt(mx, mz) + 0.42;
  const seg = addBox(name, width, 0.32, len, mat, new THREE.Vector3(mx, y, mz));
  seg.rotation.y = Math.atan2(x2 - x1, z2 - z1);
  seg.receiveShadow = true;
  return seg;
}

function addPathRoutes() {
  pathRoutes.forEach((route) => {
    const mat = new THREE.MeshStandardMaterial({ color: route.color, roughness: .92 });
    route.points.forEach((p, idx) => {
      if (idx === 0) return;
      const a = route.points[idx - 1];
      addFlatSegment(`path_${route.id}`, a.x, a.z, p.x, p.z, route.width, mat);
    });
  });
}

function addPier(x1, z1, x2, z2) {
  return addFlatSegment('pier', x1, z1, x2, z2, 8, matWood);
}

function addCastle(x, z) {
  const y = heightAt(x, z);
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xc9c3ad, map: wallTex, roughness: .82 });
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x5c6376, roughness: .78 });
  addBox('castle_keep', 22, 24, 20, wallMat, new THREE.Vector3(x, y + 12, z));
  addBox('castle_hall', 36, 13, 24, wallMat, new THREE.Vector3(x + 8, y + 6.5, z + 18));
  [[-22,-16],[22,-16],[-20,22],[30,24]].forEach(([dx,dz]) => {
    addCylinder('castle_tower', 4.2, 5.0, 26, wallMat, new THREE.Vector3(x + dx, y + 13, z + dz));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 10, 6), roofMat);
    roof.position.set(x + dx, y + 31, z + dz);
    roof.castShadow = true; roof.receiveShadow = true; propGroup.add(roof);
  });
}

function addCaveMouth(x, z) {
  const y = heightAt(x, z);
  const dark = new THREE.MeshStandardMaterial({ color: 0x111316, roughness: .8 });
  addCylinder('cave_left_rock', 4, 6, 15, matRock, new THREE.Vector3(x - 7, y + 7.5, z));
  addCylinder('cave_right_rock', 4, 6, 15, matRock, new THREE.Vector3(x + 7, y + 7.5, z));
  addBox('cave_top_rock', 22, 5, 8, matRock, new THREE.Vector3(x, y + 16, z));
  addBox('cave_dark', 12, 10, 3, dark, new THREE.Vector3(x, y + 8, z - 2));
}

function addWaterfallMist(x, z) {
  const y = heightAt(x, z);
  const mistMat = new THREE.MeshStandardMaterial({ color: 0xd9f7ff, transparent: true, opacity: .55, roughness: .1 });
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(3 + i * .6, 12, 8), mistMat);
    s.position.set(x + (i - 2) * 4, y + 8 + i * 2, z + i * 3);
    propGroup.add(s);
  }
}

function addProps() {
  addPathRoutes();

  // Town: south side. Red bridge is immediately east of the town.
  const housePositions = [
    [-118,-180], [-96,-174], [-72,-170], [-48,-164],
    [-122,-152], [-98,-146], [-72,-142], [-46,-134],
    [-108,-122], [-82,-116], [-56,-110],
    [-142,-196], [-124,-214], [-92,-206], [-50,-190], [-28,-164]
  ];
  housePositions.forEach((p, i) => addHouse(p[0], p[1], 9 + (i % 4) * 2, 9 + (i % 3), 7 + (i % 2) * 3));
  addBox('plaza', 42, .7, 42, matPlaza, new THREE.Vector3(zones.plaza.x, heightAt(zones.plaza.x,zones.plaza.z)+.55, zones.plaza.z));
  addCylinder('plaza_fountain', 5.2, 5.2, 1.5, matWater, new THREE.Vector3(zones.plaza.x, heightAt(zones.plaza.x,zones.plaza.z)+1.35, zones.plaza.z));

  // Red bridge just east of town and smaller footbridges around the falls/lake.
  addBridge(-20, -134, 58, -122, matBridgeRed);
  addBridge(-118, 116, -72, 82, matWood);
  addBridge(-80, 56, -50, 20, matWood);
  addPier(-138, -216, -202, -248);
  addPier(-120, -220, -90, -276);

  // Castle, high plateau lake surroundings, cave and waterfall.
  addCastle(zones.castle.x, zones.castle.z);
  addCaveMouth(zones.fallsCave.x, zones.fallsCave.z);
  addWaterfallMist(zones.waterfall.x, zones.waterfall.z);

  // Wind hill and west lighthouse.
  addWindmill(-286, -54);
  addWindmill(-256, -20);
  addWindmill(-232, 18);
  addWindmill(-288, 28);
  addWindmill(-222, 58);
  addLighthouse();

  // Western rock arch / cliff props.
  addCylinder('arch_rock_left', 5, 8, 24, matRock, new THREE.Vector3(-294, heightAt(-294, 32)+12, 32));
  addCylinder('arch_rock_right', 5, 8, 24, matRock, new THREE.Vector3(-274, heightAt(-274, 32)+12, 32));
  addBox('arch_rock_top', 25, 5, 7, matRock, new THREE.Vector3(-284, heightAt(-284,32)+26, 32));

  // Ruins north of the volcano.
  [32, 48, 64, 80].forEach((x, i) => addCylinder('ruin_pillar', 2.2, 3, 18 - (i%2)*3, matRock, new THREE.Vector3(x, heightAt(x, 314)+9, 306 + i*9)));
  addBox('ruin_gate', 30, 5, 4, matRock, new THREE.Vector3(58, heightAt(58,326)+21, 326));
  addHouse(12, 246, 11, 10, 8, new THREE.MeshStandardMaterial({ color: 0x7f5d3a }));
  addHouse(-14, 234, 10, 9, 7, new THREE.MeshStandardMaterial({ color: 0x7f5d3a }));

  // Forest distribution: plateau forest west of volcano, west cliff, east forest, C-sandbar fringe.
  const treeClusters = [
    { cx: zones.plateauForest.x, cz: zones.plateauForest.z, rx: 96, rz: 90, count: 135, minTown: 90 },
    { cx: zones.eastForest.x, cz: zones.eastForest.z, rx: 106, rz: 96, count: 82, minTown: 110 },
    { cx: -252, cz: 12, rx: 78, rz: 96, count: 64, minTown: 120 },
    { cx: 236, cz: -96, rx: 64, rz: 92, count: 38, minTown: 150 },
    { cx: 10, cz: 250, rx: 90, rz: 70, count: 52, minTown: 180 }
  ];
  treeClusters.forEach((cluster) => {
    for (let i = 0; i < cluster.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      const x = cluster.cx + Math.cos(angle) * cluster.rx * r;
      const z = cluster.cz + Math.sin(angle) * cluster.rz * r;
      const lakeClear = distance2(x,z,zones.lake.x,zones.lake.z) > 54 && distance2(x,z,zones.upperLake.x,zones.upperLake.z) > 32;
      if (isLand(x,z) && lakeClear && distance2(x,z,zones.town.x,zones.town.z) > cluster.minTown) {
        addTree(x, z, .62 + Math.random() * .62);
      }
    }
  });

  // Wedge island detail and C-shaped sandbar markers.
  addHouse(-322, -318, 11, 9, 7, new THREE.MeshStandardMaterial({ color: 0x4a9bd8 }));
  addPier(240, -322, 302, -338);
  addCylinder('north_rock_marker', 5, 8, 10, matRock, new THREE.Vector3(-38, heightAt(-38, 362)+5, 362));
}

function addLandmarks() {
  landmarks.forEach((lm) => {
    const geo = new THREE.SphereGeometry(3.4, 16, 12);
    const mat = new THREE.MeshStandardMaterial({ color: 0x5ff0ff, emissive: 0x137c98, emissiveIntensity: .85 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.name = lm.id;
    mesh.position.set(lm.x, Math.max(lm.y, heightAt(lm.x, lm.z) + 5), lm.z);
    mesh.userData.landmark = lm;
    mesh.castShadow = true;
    landmarkGroup.add(mesh);
  });
  totalLandmarksEl.textContent = String(landmarks.length);
}

function addRings() {
  ringCourses.forEach((course) => {
    course.rings.forEach((r, idx) => {
      const torus = new THREE.Mesh(new THREE.TorusGeometry(8, 0.8, 12, 32), matRing);
      torus.position.set(r.x, r.y, r.z);
      torus.rotation.y = idx * 0.35 + Math.PI / 2;
      torus.castShadow = true;
      torus.userData.course = course.id;
      ringGroup.add(torus);
    });
  });
}

createWater();
createTerrain();
addProps();
addLandmarks();
addRings();

// Player object
const player = new THREE.Group();
player.position.set(-110, 56, -170);
scene.add(player);
const body = new THREE.Mesh(new THREE.SphereGeometry(3.2, 24, 16), new THREE.MeshStandardMaterial({ color: 0xfff4c8, roughness: .5 }));
body.castShadow = true;
player.add(body);
const backpack = new THREE.Mesh(new THREE.BoxGeometry(3.2, 5.2, 2.2), new THREE.MeshStandardMaterial({ color: 0x2b3e55, roughness: .5 }));
backpack.position.set(0, 0, 3);
backpack.castShadow = true;
player.add(backpack);
const flame = new THREE.Mesh(new THREE.ConeGeometry(1.4, 6, 16), new THREE.MeshStandardMaterial({ color: 0xffa22b, emissive: 0xff5c00, emissiveIntensity: 1.4 }));
flame.rotation.x = Math.PI;
flame.position.set(0, -5.2, 2.2);
player.add(flame);

const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

const playerState = {
  velocity: new THREE.Vector3(0, 0, 0),
  moveAccel: 82,
  maxMoveSpeed: 58,       // Always boosted speed
  verticalThrust: 62,
  downThrust: 36,
  gravity: 28,            // Free-fall baseline
  drag: 0.90,
  airControl: 1.0,
  mouseYaw: 0,
  mousePitch: -0.26,
  cameraDistance: 28,
  cameraHeight: 10,
  started: false
};

function showMessage(text, ms = 2400) {
  messageEl.textContent = text;
  messageEl.classList.remove('hidden');
  clearTimeout(showMessage.timer);
  showMessage.timer = setTimeout(() => messageEl.classList.add('hidden'), ms);
}

startButton.addEventListener('click', startGame);
renderer.domElement.addEventListener('click', () => {
  if (playerState.started && document.pointerLockElement !== renderer.domElement) renderer.domElement.requestPointerLock();
});
function startGame() {
  playerState.started = true;
  startOverlay.style.display = 'none';
  renderer.domElement.requestPointerLock?.();
}

document.addEventListener('mousemove', (e) => {
  if (document.pointerLockElement !== renderer.domElement) return;
  playerState.mouseYaw -= e.movementX * 0.0021;
  playerState.mousePitch -= e.movementY * 0.0016;
  playerState.mousePitch = clamp(playerState.mousePitch, -0.95, 0.42);
});

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const up = new THREE.Vector3(0, 1, 0);
const desiredCamera = new THREE.Vector3();
const lookAt = new THREE.Vector3();

function updatePlayer(dt) {
  // Camera-based movement. A = left, D = right.
  const yaw = playerState.mouseYaw;
  forward.set(Math.sin(yaw), 0, Math.cos(yaw) * -1).normalize();
  right.crossVectors(forward, up).normalize(); // correct: A subtracts right, D adds right.

  const input = new THREE.Vector3();
  if (keys.KeyW) input.add(forward);
  if (keys.KeyS) input.sub(forward);
  if (keys.KeyA) input.sub(right);
  if (keys.KeyD) input.add(right);
  if (input.lengthSq() > 0) input.normalize();

  const accel = input.multiplyScalar(playerState.moveAccel * dt * playerState.airControl);
  playerState.velocity.x += accel.x;
  playerState.velocity.z += accel.z;

  // Free fall always applies. Space adds upward jet thrust; Shift adds controlled descent.
  playerState.velocity.y -= playerState.gravity * dt;
  if (keys.Space) playerState.velocity.y += playerState.verticalThrust * dt;
  if (keys.ShiftLeft || keys.ShiftRight) playerState.velocity.y -= playerState.downThrust * dt;

  // Horizontal drag / speed limit.
  playerState.velocity.x *= Math.pow(playerState.drag, dt * 60);
  playerState.velocity.z *= Math.pow(playerState.drag, dt * 60);
  const horizontalSpeed = Math.hypot(playerState.velocity.x, playerState.velocity.z);
  if (horizontalSpeed > playerState.maxMoveSpeed) {
    const s = playerState.maxMoveSpeed / horizontalSpeed;
    playerState.velocity.x *= s;
    playerState.velocity.z *= s;
  }
  playerState.velocity.y = clamp(playerState.velocity.y, -80, 46);

  player.position.addScaledVector(playerState.velocity, dt);

  // Terrain collision.
  const ground = heightAt(player.position.x, player.position.z) + 4.2;
  if (player.position.y < ground) {
    player.position.y = ground;
    if (playerState.velocity.y < 0) playerState.velocity.y *= -0.12;
    playerState.velocity.x *= 0.75;
    playerState.velocity.z *= 0.75;
  }

  // Keep player near world bounds.
  player.position.x = clamp(player.position.x, WORLD_BOUNDS.minX + 8, WORLD_BOUNDS.maxX - 8);
  player.position.z = clamp(player.position.z, WORLD_BOUNDS.minZ + 8, WORLD_BOUNDS.maxZ - 8);

  // Character faces movement or camera yaw.
  player.rotation.y = yaw;
  flame.visible = keys.Space;
}

function updateCamera(dt) {
  const yaw = playerState.mouseYaw;
  const pitch = playerState.mousePitch;
  const dir = new THREE.Vector3(
    Math.sin(yaw) * Math.cos(pitch),
    Math.sin(pitch),
    -Math.cos(yaw) * Math.cos(pitch)
  ).normalize();

  desiredCamera.copy(player.position)
    .addScaledVector(dir, -playerState.cameraDistance)
    .add(new THREE.Vector3(0, playerState.cameraHeight, 0));

  const ground = heightAt(desiredCamera.x, desiredCamera.z) + 5.5;
  if (desiredCamera.y < ground) desiredCamera.y = ground;

  camera.position.lerp(desiredCamera, 1 - Math.pow(0.035, dt));
  lookAt.copy(player.position).add(new THREE.Vector3(0, 5, 0)).addScaledVector(dir, 18);
  camera.lookAt(lookAt);
}

const discovered = new Set();
function updateLandmarks() {
  landmarkGroup.children.forEach((mesh) => {
    const lm = mesh.userData.landmark;
    const d = player.position.distanceTo(mesh.position);
    mesh.rotation.y += 0.02;
    mesh.position.y += Math.sin(performance.now() * 0.002 + lm.x) * 0.005;
    if (!discovered.has(lm.id) && d < lm.radius) {
      discovered.add(lm.id);
      mesh.material.color.set(0x8cff69);
      mesh.material.emissive.set(0x249117);
      discoveredEl.textContent = String(discovered.size);
      showMessage(`発見！\n${lm.name}\n\n${lm.description}`);
    }
  });
}

function updateRings() {
  ringGroup.children.forEach((ring) => {
    ring.rotation.z += 0.01;
    const d = player.position.distanceTo(ring.position);
    if (d < 9 && !ring.userData.passed) {
      ring.userData.passed = true;
      ring.material = new THREE.MeshStandardMaterial({ color: 0x7cff6b, emissive: 0x1a8b25, emissiveIntensity: .7 });
      showMessage('リング通過！', 900);
    }
  });
}

function worldToMini(x, z, w, h) {
  const u = (x - WORLD_BOUNDS.minX) / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX);
  const v = (z - WORLD_BOUNDS.minZ) / (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ);
  return { x: u * w, y: (1 - v) * h };
}

function drawMinimap() {
  const rectW = minimapCanvas.width;
  const rectH = minimapCanvas.height;
  mini.clearRect(0, 0, rectW, rectH);
  mini.fillStyle = 'rgba(20, 128, 180, .72)';
  mini.fillRect(0, 0, rectW, rectH);

  // grid
  mini.strokeStyle = 'rgba(255,255,255,.12)';
  mini.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const x = rectW * i / 4;
    const y = rectH * i / 4;
    mini.beginPath(); mini.moveTo(x, 0); mini.lineTo(x, rectH); mini.stroke();
    mini.beginPath(); mini.moveTo(0, y); mini.lineTo(rectW, y); mini.stroke();
  }

  // Island outline from same data as terrain.
  mini.beginPath();
  islandOutline.forEach((p, i) => {
    const m = worldToMini(p.x, p.z, rectW, rectH);
    if (i === 0) mini.moveTo(m.x, m.y); else mini.lineTo(m.x, m.y);
  });
  mini.closePath();
  mini.fillStyle = '#5aa851';
  mini.fill();
  mini.strokeStyle = 'rgba(255,255,255,.75)';
  mini.lineWidth = 2;
  mini.stroke();

  // Secondary islands.
  secondaryIslands.forEach((isle) => {
    const m = worldToMini(isle.x, isle.z, rectW, rectH);
    mini.fillStyle = isle.type === 'rock' ? '#74695f' : '#d8d985';
    mini.beginPath();
    mini.ellipse(m.x, m.y, isle.radiusX / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) * rectW, isle.radiusZ / (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ) * rectH, 0, 0, Math.PI * 2);
    mini.fill();
    mini.strokeStyle = 'rgba(255,255,255,.55)';
    mini.stroke();
  });

  // Roads / paths.
  pathRoutes.forEach((route) => {
    mini.strokeStyle = 'rgba(245,230,160,.75)';
    mini.lineWidth = Math.max(1, route.width / 4);
    mini.beginPath();
    route.points.forEach((pt, i) => {
      const m = worldToMini(pt.x, pt.z, rectW, rectH);
      if (i === 0) mini.moveTo(m.x, m.y); else mini.lineTo(m.x, m.y);
    });
    mini.stroke();
  });

  // Lakes.
  const lake = worldToMini(zones.lake.x, zones.lake.z, rectW, rectH);
  mini.fillStyle = '#2e8ccb';
  mini.beginPath();
  mini.ellipse(lake.x, lake.y, zones.lake.radiusX / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) * rectW, zones.lake.radiusZ / (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ) * rectH, 0, 0, Math.PI * 2);
  mini.fill();
  const upperLake = worldToMini(zones.upperLake.x, zones.upperLake.z, rectW, rectH);
  mini.beginPath();
  mini.ellipse(upperLake.x, upperLake.y, zones.upperLake.radiusX / (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX) * rectW, zones.upperLake.radiusZ / (WORLD_BOUNDS.maxZ - WORLD_BOUNDS.minZ) * rectH, 0, 0, Math.PI * 2);
  mini.fill();

  // Landmarks: discovered stronger, undiscovered faint.
  landmarks.forEach((lm) => {
    const m = worldToMini(lm.x, lm.z, rectW, rectH);
    mini.fillStyle = discovered.has(lm.id) ? '#dfff59' : 'rgba(255,255,255,.35)';
    mini.beginPath();
    mini.arc(m.x, m.y, discovered.has(lm.id) ? 3.2 : 2.0, 0, Math.PI * 2);
    mini.fill();
  });

  // Player arrow. Direction matches world forward.
  const p = worldToMini(player.position.x, player.position.z, rectW, rectH);
  const angle = -playerState.mouseYaw + Math.PI; // Three.js forward at yaw=0 is -Z, so add PI for minimap arrow.
  mini.save();
  mini.translate(p.x, p.y);
  mini.rotate(angle);
  mini.fillStyle = '#ff3d3d';
  mini.beginPath();
  mini.moveTo(0, -8);
  mini.lineTo(5, 6);
  mini.lineTo(0, 3);
  mini.lineTo(-5, 6);
  mini.closePath();
  mini.fill();
  mini.restore();
}

function updateHud() {
  const ground = heightAt(player.position.x, player.position.z);
  altitudeEl.textContent = String(Math.max(0, Math.round(player.position.y - ground)));
  speedEl.textContent = String(Math.round(playerState.velocity.length()));
}

let last = performance.now();
function animate(now) {
  const dt = Math.min(0.033, (now - last) / 1000);
  last = now;

  if (playerState.started) {
    updatePlayer(dt);
    updateLandmarks();
    updateRings();
  }
  updateCamera(dt);
  updateHud();
  drawMinimap();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

requestAnimationFrame(animate);
