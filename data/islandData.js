// Resort Explore v0.7 terrain data.
// Coordinates: x = east/west, z = north/south, y = height.
// v0.7 target: fix east/west orientation and rebuild the map from the reference silhouette.
// Key authored relationships from the user's notes:
// - C-shaped sandbar on the east / southeast side.
// - West of the volcano is a high plateau with lake, castle and forest.
// - The lake drains by waterfall; a cave sits at the foot of the waterfall.
// - Ruins are north of the volcano.
// - A large Wedge-style island is in the southwest sea.
// - A red bridge is immediately east of town.
// - One loop road connects town, red bridge, lighthouse, north volcano and back.
// This is a fan/prototype reconstruction from visible references, not official geometry.

export const WORLD_BOUNDS = {
  minX: -460,
  maxX: 460,
  minZ: -390,
  maxZ: 390
};

// Main island outline, rebuilt to match the reference map direction rather than the previous mirrored version.
// North is +z, east is +x. The east and southeast side contains the large curved arm.
export const islandOutline = [
  { x: -355, z: -115 },
  { x: -372, z:  -55 },
  { x: -342, z:   18 },
  { x: -324, z:   82 },
  { x: -258, z:  138 },
  { x: -214, z:  202 },
  { x: -136, z:  266 },
  { x:  -48, z:  318 },
  { x:   48, z:  314 },
  { x:  124, z:  276 },
  { x:  154, z:  214 },
  { x:  172, z:  144 },
  { x:  212, z:   82 },
  { x:  278, z:   34 },
  { x:  330, z:  -24 },
  { x:  372, z:  -96 },
  { x:  386, z: -166 },
  { x:  358, z: -228 },
  { x:  312, z: -252 },
  { x:  256, z: -248 },
  { x:  218, z: -226 },
  { x:  186, z: -200 },
  { x:  158, z: -198 },
  { x:  166, z: -242 },
  { x:  212, z: -292 },
  { x:  276, z: -328 },
  { x:  252, z: -354 },
  { x:  164, z: -346 },
  { x:   70, z: -330 },
  { x:  -24, z: -314 },
  { x: -112, z: -292 },
  { x: -206, z: -260 },
  { x: -292, z: -214 },
  { x: -348, z: -166 }
];

export const secondaryIslands = [
  // Large island southwest of the main island.
  { id: 'wedge_island', x: -322, z: -318, radiusX: 118, radiusZ: 82, height: 18, type: 'sand_grass' },
  { id: 'wedge_north_cove', x: -260, z: -266, radiusX: 46, radiusZ: 24, height: 9, type: 'sand' },
  // Small offshore rocks/islets.
  { id: 'northwest_rock', x: -330, z: 236, radiusX: 26, radiusZ: 18, height: 11, type: 'rock' },
  { id: 'north_islet', x: -38, z: 362, radiusX: 64, radiusZ: 16, height: 8, type: 'rock' },
  { id: 'east_reef', x: 404, z: -42, radiusX: 22, radiusZ: 13, height: 8, type: 'rock' },
  { id: 'south_reef', x: 80, z: -374, radiusX: 38, radiusZ: 16, height: 7, type: 'sand' }
];

export const zones = {
  // Volcano on the north/east body. The high plateau lies west of it.
  volcano: { x: 74, z: 188, radiusX: 116, radiusZ: 140, height: 190 },
  volcanoShoulder: { x: 42, z: 134, radiusX: 190, radiusZ: 174, height: 54 },
  crater: { x: 80, z: 258, radius: 25 },
  lavaTube: { x: 40, z: 118, radius: 28 },

  // High plateau west of volcano: lake, castle, forest.
  westPlateau: { x: -112, z: 126, radiusX: 148, radiusZ: 112, height: 46 },
  castle: { x: -168, z: 102, radius: 42 },
  plateauForest: { x: -110, z: 132, radiusX: 96, radiusZ: 86 },

  // Lake and waterfall system: plateau lake -> waterfall -> cave -> lower stream.
  lake: { x: -120, z: 150, radiusX: 58, radiusZ: 38 },
  upperLake: { x: -78, z: 112, radiusX: 28, radiusZ: 18 },
  waterfall: { x: -82, z: 72, width: 20, length: 68 },
  fallsCave: { x: -72, z: 36, radius: 24 },
  river: {
    points: [
      { x: -104, z: 138 },
      { x: -92, z: 104 },
      { x: -82, z: 72 },
      { x: -72, z: 36 },
      { x: -54, z: 4 }
    ],
    width: 9
  },

  // Town and red bridge. Red bridge is immediately east of town.
  town: { x: -72, z: -146, radiusX: 74, radiusZ: 58 },
  plaza: { x: -70, z: -142, radius: 24 },
  marina: { x: -128, z: -210, radius: 54 },
  redBridge: { x: 20, z: -128, radius: 26 },

  // Beaches and the C-shaped sandbar around a lagoon on the east/southeast side.
  beach: { x: -22, z: -248, radiusX: 208, radiusZ: 54 },
  southEastBeach: { x: 230, z: -250, radiusX: 130, radiusZ: 70 },
  sandbarNeck: { x: 182, z: -172, radiusX: 100, radiusZ: 38 },
  cSandbar: { x: 276, z: -226, radiusX: 126, radiusZ: 94 },
  cLagoon: { x: 284, z: -226, radiusX: 70, radiusZ: 50 },

  // Lighthouse, wind turbines and west cape.
  windHill: { x: -248, z: -20, radiusX: 96, radiusZ: 108 },
  lighthouseCape: { x: -326, z: -98, radius: 52 },
  westCape: { x: -338, z: -12, radius: 64 },

  // Ruins north of volcano.
  ruins: { x: 54, z: 314, radius: 54 },
  mountainCabins: { x: 12, z: 246, radius: 56 },
  eastForest: { x: 142, z: -10, radius: 90 },
  northForest: { x: -118, z: 134, radius: 98 },
  archRock: { x: -284, z: 32, radius: 42 },
  golfIsland: { x: -322, z: -318, radius: 74 }
};

export const pathRoutes = [
  {
    id: 'island_loop_road',
    name: '島一周道路',
    width: 7,
    color: 0xc7b276,
    points: [
      { x: -88, z: -154 },
      { x: 20, z: -128 },
      { x: 124, z: -118 },
      { x: 222, z: -150 },
      { x: 278, z: -96 },
      { x: 228, z: -20 },
      { x: 154, z: 64 },
      { x: 104, z: 150 },
      { x: 58, z: 290 },
      { x: -18, z: 288 },
      { x: -138, z: 210 },
      { x: -238, z: 118 },
      { x: -320, z: -86 },
      { x: -244, z: -148 },
      { x: -148, z: -184 },
      { x: -88, z: -154 }
    ]
  },
  {
    id: 'town_to_red_bridge',
    name: '町から赤い橋への道',
    width: 8,
    color: 0xd0b475,
    points: [
      { x: -70, z: -144 },
      { x: -26, z: -134 },
      { x: 20, z: -128 },
      { x: 54, z: -114 }
    ]
  },
  {
    id: 'plateau_castle_road',
    name: '高台・城・森の道',
    width: 6,
    color: 0xd6c184,
    points: [
      { x: -138, z: 210 },
      { x: -160, z: 156 },
      { x: -168, z: 102 },
      { x: -126, z: 84 },
      { x: -82, z: 72 },
      { x: -40, z: 58 }
    ]
  },
  {
    id: 'lake_waterfall_path',
    name: '湖と滝の道',
    width: 5,
    color: 0xe1cd8b,
    points: [
      { x: -150, z: 142 },
      { x: -116, z: 154 },
      { x: -86, z: 124 },
      { x: -82, z: 72 },
      { x: -72, z: 36 }
    ]
  },
  {
    id: 'beach_sandbar_path',
    name: 'C字砂州の道',
    width: 6,
    color: 0xeadba6,
    points: [
      { x: -134, z: -230 },
      { x: -44, z: -250 },
      { x: 84, z: -260 },
      { x: 170, z: -244 },
      { x: 238, z: -206 },
      { x: 318, z: -194 },
      { x: 338, z: -258 },
      { x: 274, z: -318 },
      { x: 194, z: -298 }
    ]
  },
  {
    id: 'volcano_north_road',
    name: '火山北側の道',
    width: 5,
    color: 0xbfae7d,
    points: [
      { x: -18, z: 288 },
      { x: 54, z: 314 },
      { x: 116, z: 276 },
      { x: 104, z: 190 },
      { x: 82, z: 140 }
    ]
  }
];

export const landmarks = [
  { id: 'resort_town', name: 'リゾートタウン', area: 'town', x: -72, y: 8, z: -146, radius: 32, description: '南側の街。ここから東へ進むとすぐ赤い橋に出る。' },
  { id: 'central_plaza', name: '中央広場', area: 'town', x: -70, y: 8, z: -142, radius: 22, description: '街の中心。島一周道路と港への道が交わる。' },
  { id: 'marina', name: 'マリーナ', area: 'town', x: -128, y: 6, z: -210, radius: 26, description: '街の南西にある港。桟橋と船の基準地点。' },
  { id: 'red_bridge', name: '赤い橋', area: 'road', x: 20, y: 12, z: -128, radius: 22, description: '街から東へ歩くとすぐにある赤い橋。' },
  { id: 'white_beach', name: '白砂ビーチ', area: 'beach', x: -22, y: 5, z: -248, radius: 36, description: '南岸の長い白砂。低空飛行の基準エリア。' },
  { id: 'c_sandbar', name: 'C字型の砂州', area: 'beach', x: 282, y: 5, z: -248, radius: 44, description: '東南の海に回り込むC字型の砂州。内側に浅いラグーンがある。' },
  { id: 'sandbar_lagoon', name: '砂州のラグーン', area: 'water', x: 284, y: 5, z: -226, radius: 30, description: 'C字型砂州の内側にできた浅い入り江。' },
  { id: 'plateau_lake', name: '高台の湖', area: 'plateau', x: -120, y: 52, z: 150, radius: 28, description: '火山の西側の大地にある湖。ここから滝が流れ落ちる。' },
  { id: 'waterfall', name: '滝', area: 'plateau', x: -82, y: 38, z: 72, radius: 24, description: '高台の湖から麓へ落ちる滝。' },
  { id: 'falls_cave', name: '滝下の洞窟', area: 'cave', x: -72, y: 18, z: 36, radius: 24, description: '滝の麓にある洞窟。大地の上へ抜ける通路として配置する。' },
  { id: 'castle', name: 'レイクピア・キャッスル', area: 'plateau', x: -168, y: 52, z: 102, radius: 28, description: '火山西側の高台にある城。湖と森の近くに立つ。' },
  { id: 'plateau_forest', name: '高台の森', area: 'forest', x: -110, y: 48, z: 132, radius: 28, description: '城と湖の周囲に広がる森。' },
  { id: 'maka_peak', name: '火山山頂', area: 'volcano', x: 80, y: 164, z: 258, radius: 34, description: '島で最も高い火山の山頂。' },
  { id: 'crater', name: '火口', area: 'volcano', x: 80, y: 150, z: 258, radius: 18, description: '火山の頂上部にある火口。' },
  { id: 'lava_tube', name: '溶岩洞入口', area: 'volcano', x: 40, y: 58, z: 118, radius: 22, description: '火山の側面にある洞窟入口。' },
  { id: 'north_ruins', name: '火山北の遺跡', area: 'ruins', x: 54, y: 38, z: 314, radius: 30, description: '火山の北側に残る古代遺跡。' },
  { id: 'north_road', name: '火山北の一周道路', area: 'road', x: 18, y: 36, z: 284, radius: 24, description: '島を一周する道路の北側区間。' },
  { id: 'wind_hill', name: '風車の丘', area: 'wind', x: -248, y: 36, z: -20, radius: 30, description: '西側の丘に並ぶ風車群。' },
  { id: 'lighthouse', name: 'ジャイアント・キャンドル灯台', area: 'cape', x: -326, y: 24, z: -98, radius: 26, description: '西の岬に立つ灯台。島一周道路の目印。' },
  { id: 'west_cape', name: '西の岬', area: 'cape', x: -338, y: 20, z: -12, radius: 24, description: '西に突き出た岬。崖と海が見える。' },
  { id: 'arch_rock', name: 'イカロスの崖', area: 'coast', x: -284, y: 24, z: 32, radius: 26, description: '西側の崖にある自然地形。' },
  { id: 'east_arm', name: '東の半島', area: 'coast', x: 278, y: 18, z: -96, radius: 28, description: '東へ回り込む大きな半島。' },
  { id: 'wedge_island', name: '南西の大きな離島', area: 'island', x: -322, y: 8, z: -318, radius: 42, description: '本島の南西に浮かぶ大きな離島。' },
  { id: 'north_islet', name: '北の岩礁群', area: 'coast', x: -38, y: 10, z: 362, radius: 22, description: '北の海に浮かぶ細い岩礁。' },
  { id: 'training_rings', name: 'リング訓練場', area: 'beach', x: -20, y: 20, z: -248, radius: 24, description: '初心者用のリング練習場。' },
  { id: 'loop_road', name: '島一周道路', area: 'road', x: -238, y: 24, z: 118, radius: 24, description: '街・灯台・火山北側を通って島を一周する道路。' },
  { id: 'mountain_cabins', name: '北の山荘', area: 'mountain', x: 12, y: 54, z: 246, radius: 24, description: '火山北西側の山荘。' },
  { id: 'east_forest', name: '東の森', area: 'forest', x: 142, y: 18, z: -10, radius: 26, description: '東側の丘に広がる森。' },
  { id: 'volcano_shoulder', name: '火山中腹', area: 'volcano', x: 62, y: 64, z: 162, radius: 26, description: '火山へ登る途中の広い斜面。' },
  { id: 'marina_pier', name: '港の桟橋', area: 'town', x: -158, y: 6, z: -230, radius: 22, description: '街の港から海へ伸びる桟橋。' }
];

export const ringCourses = [
  {
    id: 'beach_intro',
    name: 'ビーチ練習コース',
    description: '白砂ビーチ沿いの低空リング。操作確認用。',
    rings: [
      { x: -138, y: 24, z: -226 },
      { x: -70, y: 26, z: -246 },
      { x: 8, y: 28, z: -260 },
      { x: 92, y: 30, z: -258 },
      { x: 190, y: 31, z: -246 },
      { x: 278, y: 34, z: -206 }
    ]
  },
  {
    id: 'plateau_lake_loop',
    name: '高台の湖一周コース',
    description: '火山西側の高台湖を回るリング。',
    rings: [
      { x: -172, y: 66, z: 146 },
      { x: -132, y: 70, z: 188 },
      { x: -74, y: 68, z: 164 },
      { x: -70, y: 58, z: 110 },
      { x: -112, y: 56, z: 88 }
    ]
  },
  {
    id: 'volcano_climb',
    name: '火山登山コース',
    description: '高台から火山側面を登る中級コース。',
    rings: [
      { x: -28, y: 58, z: 118 },
      { x: 14, y: 88, z: 156 },
      { x: 48, y: 122, z: 204 },
      { x: 80, y: 166, z: 258 }
    ]
  },
  {
    id: 'sandbar_curve',
    name: 'C字砂州コース',
    description: '東南のC字型砂州をなぞる低空コース。',
    rings: [
      { x: 184, y: 24, z: -206 },
      { x: 258, y: 24, z: -190 },
      { x: 342, y: 26, z: -218 },
      { x: 330, y: 24, z: -296 },
      { x: 242, y: 24, z: -326 }
    ]
  }
];
