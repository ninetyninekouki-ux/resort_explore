import * as THREE from 'three';
import { WORLD_BOUNDS, islandOutline, secondaryIslands, zones, pathRoutes, landmarks, ringCourses } from '../data/islandData.js';

const canvasHost = document.body;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x86c9ff);
scene.fog = new THREE.Fog(0x86c9ff, 260, 760);

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

// Materials
const matWater = new THREE.MeshStandardMaterial({ color: 0x1f91d5, roughness: 0.32, metalness: 0.05, transparent: true, opacity: 0.78 });
const matSand = new THREE.MeshStandardMaterial({ color: 0xf3df9f, roughness: 0.85 });
const matRock = new THREE.MeshStandardMaterial({ color: 0x7a6d61, roughness: 0.92 });
const matGrass = new THREE.MeshStandardMaterial({ color: 0x55a64b, roughness: 0.9 });
const matTown = new THREE.MeshStandardMaterial({ color: 0xf2e6ca, roughness: 0.7 });
const matRoof = new THREE.MeshStandardMaterial({ color: 0xd86642, roughness: 0.75 });
const matWhite = new THREE.MeshStandardMaterial({ color: 0xf2f4f2, roughness: 0.72 });
const matWood = new THREE.MeshStandardMaterial({ color: 0x8c5e33, roughness: 0.86 });
const matRing = new THREE.MeshStandardMaterial({ color: 0xffd24a, emissive: 0x9a5b00, emissiveIntensity: 0.45, roughness: 0.45 });
const matPath = new THREE.MeshStandardMaterial({ color: 0xdcc98d, roughness: 0.92 });
const matPlaza = new THREE.MeshStandardMaterial({ color: 0xcaa574, roughness: 0.82 });

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

  let h = 4 + island * 12;
  h += noise2(x, z) * 4.0 * island;

  // Separate small islands: low, mostly beach/grass, not giant cliffs.
  const secondary = secondaryIslandFactor(x, z);
  if (secondary > 0.03 && !pointInPolygon(x, z, islandOutline)) {
    h = 3.8 + secondary * 8 + noise2(x, z) * 1.8;
  }

  // Volcano north-east, kept high and readable from far away.
  const vd = ellipseDistance(x, z, zones.volcano.x, zones.volcano.z, zones.volcano.radiusX, zones.volcano.radiusZ);
  const volcano = Math.max(0, 1 - vd);
  h += Math.pow(volcano, 2.25) * zones.volcano.height;

  // Broad volcanic shoulder and high plateau. This prevents the mountain from looking like a single cone.
  const vsd = ellipseDistance(x, z, zones.volcanoShoulder.x, zones.volcanoShoulder.z, zones.volcanoShoulder.radiusX, zones.volcanoShoulder.radiusZ);
  h += Math.max(0, 1 - vsd) * zones.volcanoShoulder.height;

  // Crater depression.
  const cd = distance2(x, z, zones.crater.x, zones.crater.z) / zones.crater.radius;
  if (cd < 1) h -= (1 - cd) * 34;

  // Western wind hill.
  const wh = ellipseDistance(x, z, zones.windHill.x, zones.windHill.z, zones.windHill.radiusX, zones.windHill.radiusZ);
  h += Math.max(0, 1 - wh) * 30;

  // Northern cabins hill.
  const nh = distance2(x, z, zones.mountainCabins.x, zones.mountainCabins.z) / zones.mountainCabins.radius;
  h += Math.max(0, 1 - nh) * 40;

  // Upper lake / main lake carved down to waterlines.
  const uld = ellipseDistance(x, z, zones.upperLake.x, zones.upperLake.z, zones.upperLake.radiusX, zones.upperLake.radiusZ);
  if (uld < 1) h = Math.min(h, 22.5 - (1 - uld) * 3.5);

  const ld = ellipseDistance(x, z, zones.lake.x, zones.lake.z, zones.lake.radiusX, zones.lake.radiusZ);
  if (ld < 1) h = Math.min(h, 5.5 - (1 - ld) * 3.2);

  // River/waterfall corridor from upper lake to central lake.
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
    if (d < zones.river.width) h = Math.min(h, 9.0 + t * 8.0);
  });

  // Beaches flatten low and sandy.
  const bd = ellipseDistance(x, z, zones.beach.x, zones.beach.z, zones.beach.radiusX, zones.beach.radiusZ);
  if (bd < 1.1) h = Math.min(h, 5.6 + bd * 3.2);
  const sed = ellipseDistance(x, z, zones.southEastBeach.x, zones.southEastBeach.z, zones.southEastBeach.radiusX, zones.southEastBeach.radiusZ);
  if (sed < 1.1) h = Math.min(h, 5.2 + sed * 3.0);
  const snd = ellipseDistance(x, z, zones.sandbarNeck.x, zones.sandbarNeck.z, zones.sandbarNeck.radiusX, zones.sandbarNeck.radiusZ);
  if (snd < 1.05) h = Math.min(h, 5.0 + snd * 2.5);

  // Town, plaza and marina flattening.
  const td = ellipseDistance(x, z, zones.town.x, zones.town.z, zones.town.radiusX, zones.town.radiusZ);
  if (td < 1) h = h * 0.38 + 7.0 * 0.62;
  const pd = distance2(x, z, zones.plaza.x, zones.plaza.z) / zones.plaza.radius;
  if (pd < 1) h = h * 0.22 + 7.0 * 0.78;
  const md = distance2(x, z, zones.marina.x, zones.marina.z) / zones.marina.radius;
  if (md < 1) h = h * 0.45 + 5.6 * 0.55;

  return h;
}

function terrainColorAt(x, z, y) {
  const lakeD = ellipseDistance(x, z, zones.lake.x, zones.lake.z, zones.lake.radiusX, zones.lake.radiusZ);
  const upperLakeD = ellipseDistance(x, z, zones.upperLake.x, zones.upperLake.z, zones.upperLake.radiusX, zones.upperLake.radiusZ);
  const beachD = ellipseDistance(x, z, zones.beach.x, zones.beach.z, zones.beach.radiusX, zones.beach.radiusZ);
  const southBeachD = ellipseDistance(x, z, zones.southEastBeach.x, zones.southEastBeach.z, zones.southEastBeach.radiusX, zones.southEastBeach.radiusZ);
  const sandbarD = ellipseDistance(x, z, zones.sandbarNeck.x, zones.sandbarNeck.z, zones.sandbarNeck.radiusX, zones.sandbarNeck.radiusZ);
  const volcanoD = ellipseDistance(x, z, zones.volcano.x, zones.volcano.z, zones.volcano.radiusX, zones.volcano.radiusZ);
  const townD = ellipseDistance(x, z, zones.town.x, zones.town.z, zones.town.radiusX, zones.town.radiusZ);
  const secondary = secondaryIslandFactor(x, z);

  if (lakeD < 1 || upperLakeD < 1) return new THREE.Color(0x2e8ccb);
  if (beachD < 1.1 || southBeachD < 1.1 || sandbarD < 1.05 || y < 6.8) return new THREE.Color(0xeadb9c);
  if (secondary > .28 && y < 12) return new THREE.Color(0xdedb92);
  if (volcanoD < 0.95 && y > 32) return new THREE.Color(0x74695f);
  if (townD < 1.05) return new THREE.Color(0x8fbd69);
  if (y > 74) return new THREE.Color(0x6b655f);
  if (y > 34) return new THREE.Color(0x5c964d);
  return new THREE.Color(0x49aa5c);
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

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0.02 });
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
  lake.position.set(zones.lake.x, 6.0, zones.lake.z);
  terrainGroup.add(lake);

  const upperLake = new THREE.Mesh(lakeGeo.clone(), matWater.clone());
  upperLake.scale.set(zones.upperLake.radiusX, zones.upperLake.radiusZ, 1);
  upperLake.rotation.x = -Math.PI / 2;
  upperLake.position.set(zones.upperLake.x, 22.7, zones.upperLake.z);
  terrainGroup.add(upperLake);
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

function addProps() {
  addPathRoutes();

  // Town: shifted south/south-east with a small plaza and denser houses.
  const housePositions = [
    [-122,-194], [-98,-188], [-74,-184], [-48,-174],
    [-132,-166], [-104,-160], [-76,-154], [-48,-146],
    [-116,-132], [-86,-126], [-56,-120], [-28,-112],
    [-148,-212], [-62,-210], [-18,-190]
  ];
  housePositions.forEach((p, i) => addHouse(p[0], p[1], 9 + (i % 4) * 2, 9 + (i % 3), 7 + (i % 2) * 3));
  addBox('plaza', 42, .7, 42, matPlaza, new THREE.Vector3(zones.plaza.x, heightAt(zones.plaza.x,zones.plaza.z)+.55, zones.plaza.z));
  addCylinder('plaza_fountain', 5.2, 5.2, 1.5, matWater, new THREE.Vector3(zones.plaza.x, heightAt(zones.plaza.x,zones.plaza.z)+1.35, zones.plaza.z));

  // Bridges / piers.
  addBridge(-92, 4, -22, -28);
  addBridge(-72, 82, -48, 52, new THREE.MeshStandardMaterial({ color: 0xb9453a, roughness: .78 }));
  addPier(-118, -232, -174, -274);
  addPier(-66, -236, -34, -286);

  // Wind hill, west side.
  addWindmill(-264, 62);
  addWindmill(-232, 100);
  addWindmill(-198, 78);
  addWindmill(-218, 34);

  // Lighthouse, coast rocks and arch.
  addLighthouse();
  addCylinder('arch_rock_left', 5, 8, 24, matRock, new THREE.Vector3(240, heightAt(240, 28)+12, 28));
  addCylinder('arch_rock_right', 5, 8, 24, matRock, new THREE.Vector3(260, heightAt(260, 28)+12, 28));
  addBox('arch_rock_top', 25, 5, 7, matRock, new THREE.Vector3(250, heightAt(250,28)+26, 28));

  // Ruins and north cabins.
  [-88, -72, -56, -40].forEach((x, i) => addCylinder('ruin_pillar', 2.2, 3, 18 - (i%2)*3, matRock, new THREE.Vector3(x, heightAt(x, 150)+9, 142 + i*8)));
  addBox('ruin_gate', 27, 5, 4, matRock, new THREE.Vector3(-62, heightAt(-62,156)+21, 156));
  addHouse(-120, 208, 11, 10, 8, new THREE.MeshStandardMaterial({ color: 0x7f5d3a }));
  addHouse(-94, 196, 10, 9, 7, new THREE.MeshStandardMaterial({ color: 0x7f5d3a }));

  // Forest distribution: avoid perfect rectangle; use clusters around the lake / east / north.
  const treeClusters = [
    { cx: zones.northForest.x, cz: zones.northForest.z, rx: 92, rz: 88, count: 92, minLake: 64 },
    { cx: zones.eastForest.x, cz: zones.eastForest.z, rx: 104, rz: 104, count: 92, minLake: 70 },
    { cx: -246, cz: 54, rx: 68, rz: 92, count: 42, minLake: 86 }
  ];
  treeClusters.forEach((cluster) => {
    for (let i = 0; i < cluster.count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random());
      const x = cluster.cx + Math.cos(angle) * cluster.rx * r;
      const z = cluster.cz + Math.sin(angle) * cluster.rz * r;
      if (isLand(x,z) && distance2(x,z,zones.lake.x,zones.lake.z) > cluster.minLake && distance2(x,z,zones.town.x,zones.town.z) > 60) {
        addTree(x, z, .62 + Math.random() * .62);
      }
    }
  });

  // Beach objects and small island detail.
  addHouse(314, -286, 10, 9, 7, new THREE.MeshStandardMaterial({ color: 0x4a9bd8 }));
  addCylinder('north_rock_marker', 5, 8, 10, matRock, new THREE.Vector3(-214, heightAt(-214, 292)+5, 292));
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
player.position.set(-40, 56, -190);
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
