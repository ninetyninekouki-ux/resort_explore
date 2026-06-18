// Resort Explore v0.6 terrain data.
// Coordinates: x = east/west, z = north/south, y = height.
// v0.6 priority: coastline + relief first.
// The outline below is reference-traced from the user-provided blue Wuhu Island map image,
// then converted into the local Three.js coordinate system. It is an authored approximation
// for a fan/prototype map, not extracted official geometry.

export const WORLD_BOUNDS = {
  minX: -430,
  maxX: 430,
  minZ: -390,
  maxZ: 380
};

// Main island outline. This replaces the earlier round/ellipse-like outline.
// Shape targets:
// - sharp west cape
// - north/northwest volcano mass
// - central waist and lake basin
// - large curved east/southeast arm
// - long southern beach belt
export const islandOutline = [
  { x: -206, z: 248 },
  { x: -229, z: 202 },
  { x: -226, z: 110 },
  { x: -249, z:  74 },
  { x: -318, z:  32 },
  { x: -342, z:  -9 },
  { x: -246, z:  20 },
  { x: -226, z:   1 },
  { x: -229, z: -25 },
  { x: -187, z: -25 },
  { x: -160, z: -78 },
  { x:  -97, z: -99 },
  { x:  -93, z:-113 },
  { x:  -67, z:-112 },
  { x:  -57, z: -65 },
  { x:  -12, z: -62 },
  { x:    6, z: -83 },
  { x:   25, z: -57 },
  { x:   87, z: -68 },
  { x:  165, z: -58 },
  { x:  226, z:-161 },
  { x:  191, z:-228 },
  { x:  152, z:-238 },
  { x:  146, z:-286 },
  { x:  107, z:-323 },
  { x:  136, z:-341 },
  { x:  229, z:-332 },
  { x:  289, z:-300 },
  { x:  336, z:-203 },
  { x:  338, z:-132 },
  { x:  287, z: -30 },
  { x:  215, z:  38 },
  { x:  177, z: 149 },
  { x:  119, z: 167 },
  { x:   97, z: 188 },
  { x:  103, z: 248 },
  { x:   39, z: 260 },
  { x:   39, z: 331 },
  { x:   12, z: 341 },
  { x:  -57, z: 304 },
  { x:  -72, z: 248 },
  { x: -170, z: 258 }
];

// Secondary land masses from the reference map.
// Wedge Island is southwest of the main island, not southeast.
export const secondaryIslands = [
  { id: 'wedge_island', x: -327, z: -292, radiusX: 92, radiusZ: 72, height: 16, type: 'sand_grass' },
  { id: 'private_islet', x: -378, z: 277, radiusX: 32, radiusZ: 44, height: 10, type: 'grass' },
  { id: 'north_reef_chain', x: -160, z: 356, radiusX: 66, radiusZ: 16, height: 9, type: 'rock' },
  { id: 'northwest_rock', x: -274, z: 355, radiusX: 24, radiusZ: 18, height: 10, type: 'rock' },
  { id: 'inner_south_reef', x: -150, z: -261, radiusX: 34, radiusZ: 16, height: 7, type: 'sand' },
  { id: 'west_sea_rocks', x: -408, z: -12, radiusX: 20, radiusZ: 12, height: 9, type: 'rock' },
  { id: 'east_reef', x: 354, z: 6, radiusX: 22, radiusZ: 12, height: 7, type: 'rock' }
];

export const zones = {
  // Large conical mountain read from the aerial references: north / north-west side.
  volcano: { x: -148, z: 214, radiusX: 118, radiusZ: 126, height: 188 },
  volcanoShoulder: { x: -126, z: 162, radiusX: 186, radiusZ: 164, height: 58 },
  crater: { x: -150, z: 262, radius: 25 },
  lavaTube: { x: -82, z: 156, radius: 28 },

  // Central water system: upper pond -> falls -> main lake.
  lake: { x: -42, z: 42, radiusX: 78, radiusZ: 55 },
  upperLake: { x: -142, z: 142, radiusX: 38, radiusZ: 24 },
  river: {
    points: [
      { x: -142, z: 142 },
      { x: -126, z: 112 },
      { x: -96, z: 86 },
      { x: -64, z: 62 },
      { x: -42, z: 42 }
    ],
    width: 10
  },

  // Town / beach / marina are south-west to south.
  town: { x: -108, z: -152, radiusX: 78, radiusZ: 62 },
  plaza: { x: -92, z: -144, radius: 26 },
  marina: { x: -148, z: -212, radius: 58 },
  beach: { x: 6, z: -244, radiusX: 232, radiusZ: 52 },
  southEastBeach: { x: 240, z: -236, radiusX: 110, radiusZ: 68 },
  sandbarNeck: { x: 214, z: -146, radiusX: 116, radiusZ: 42 },

  // Western side landmarks from reference: lighthouse + wind turbines.
  windHill: { x: -272, z: -58, radiusX: 92, radiusZ: 104 },
  lighthouseCape: { x: -326, z: -86, radius: 48 },
  westCape: { x: -330, z: 0, radius: 62 },

  // Higher ground / forests / featured rock areas.
  ruins: { x: 84, z: 138, radius: 50 },
  mountainCabins: { x: -198, z: 230, radius: 56 },
  eastForest: { x: 146, z: 8, radius: 92 },
  northForest: { x: -70, z: 134, radius: 92 },
  archRock: { x: -286, z: 44, radius: 42 },
  golfIsland: { x: -327, z: -292, radius: 56 }
};

export const pathRoutes = [
  {
    id: 'town_to_lake',
    name: '町から中央湖への道',
    width: 7,
    color: 0xdcc98d,
    points: [
      { x: -108, z: -152 }, { x: -98, z: -112 }, { x: -76, z: -68 }, { x: -58, z: -10 }, { x: -42, z: 42 }
    ]
  },
  {
    id: 'lake_loop_path',
    name: '湖畔の周回路',
    width: 5,
    color: 0xe8d79a,
    points: [
      { x: -124, z: 36 }, { x: -98, z: 90 }, { x: -40, z: 110 }, { x: 30, z: 76 }, { x: 46, z: 20 }, { x: 8, z: -20 }, { x: -62, z: -18 }, { x: -124, z: 36 }
    ]
  },
  {
    id: 'volcano_ridge_path',
    name: '火山登山道',
    width: 5,
    color: 0xbfae7d,
    points: [
      { x: -70, z: 82 }, { x: -98, z: 126 }, { x: -124, z: 172 }, { x: -150, z: 230 }
    ]
  },
  {
    id: 'wind_lighthouse_path',
    name: '灯台と風車の道',
    width: 5,
    color: 0xd7c286,
    points: [
      { x: -316, z: -92 }, { x: -296, z: -46 }, { x: -278, z: -2 }, { x: -250, z: 36 }, { x: -210, z: 78 }
    ]
  },
  {
    id: 'coastal_beach_path',
    name: '南岸の海岸道',
    width: 6,
    color: 0xeadba6,
    points: [
      { x: -180, z: -202 }, { x: -112, z: -230 }, { x: -18, z: -246 }, { x: 78, z: -252 }, { x: 160, z: -238 }, { x: 238, z: -214 }, { x: 292, z: -168 }
    ]
  },
  {
    id: 'east_arm_path',
    name: '東の岬道',
    width: 5,
    color: 0xd9c88f,
    points: [
      { x: 58, z: -42 }, { x: 130, z: -50 }, { x: 196, z: -78 }, { x: 248, z: -126 }, { x: 292, z: -190 }
    ]
  }
];

export const landmarks = [
  { id: 'resort_town', name: 'リゾートタウン', area: 'town', x: -108, y: 8, z: -152, radius: 30, description: '南側に広がるリゾートの中心地。広場・住宅・桟橋が集まる。' },
  { id: 'central_plaza', name: '中央広場', area: 'town', x: -92, y: 8, z: -144, radius: 22, description: '町の中心にある広場。道と海岸の導線が交差する。' },
  { id: 'marina', name: 'マリーナ', area: 'town', x: -148, y: 5, z: -212, radius: 26, description: '町の南西にある港。桟橋・船・発着点を置く基準。' },
  { id: 'white_beach', name: '白砂ビーチ', area: 'beach', x: 0, y: 4, z: -244, radius: 36, description: '南岸の長い白砂。低空飛行とリング練習に向く。' },
  { id: 'east_sand_arm', name: '東の砂浜アーム', area: 'beach', x: 240, y: 5, z: -236, radius: 34, description: '東から南東へ回り込む長い海岸線。島の輪郭を決める場所。' },
  { id: 'sandbar_neck', name: '砂州のくびれ', area: 'beach', x: 214, y: 6, z: -146, radius: 22, description: '本島から東のアームへつながる細い低地。' },
  { id: 'duckling_lake', name: '中央湖', area: 'lake', x: -42, y: 9, z: 42, radius: 36, description: '島中央の湖。火山の斜面から水が流れ込む。' },
  { id: 'upper_lake', name: '上流の池', area: 'lake', x: -142, y: 26, z: 142, radius: 24, description: '火山の麓にある高地の池。滝の起点。' },
  { id: 'lake_falls', name: '湖の滝', area: 'lake', x: -96, y: 22, z: 86, radius: 22, description: '高地から中央湖に落ちる滝。' },
  { id: 'red_bridge', name: '赤い橋', area: 'lake', x: -56, y: 12, z: -6, radius: 18, description: '湖の南側にかかる橋。' },
  { id: 'maka_peak', name: '火山山頂', area: 'volcano', x: -150, y: 150, z: 248, radius: 32, description: '島で最も高い火山の山頂。全景を見渡せる。' },
  { id: 'crater', name: '火口', area: 'volcano', x: -150, y: 148, z: 262, radius: 18, description: '火山の中心にある火口。' },
  { id: 'lava_tube', name: '溶岩洞入口', area: 'volcano', x: -82, y: 58, z: 156, radius: 22, description: '火山の側面にある洞窟入口。' },
  { id: 'wind_hill', name: '風車の丘', area: 'wind', x: -272, y: 38, z: -58, radius: 30, description: '西側の丘に並ぶ風車群。' },
  { id: 'lighthouse', name: '灯台', area: 'cape', x: -326, y: 24, z: -86, radius: 26, description: '西南の岬に立つ灯台。遠距離からでも目印になる。' },
  { id: 'west_cape', name: '西の岬', area: 'cape', x: -330, y: 18, z: 0, radius: 24, description: '島の西に突き出した岩場の岬。' },
  { id: 'arch_rock', name: 'イカロスの崖', area: 'coast', x: -286, y: 24, z: 44, radius: 26, description: '西側の崖にある自然地形。' },
  { id: 'ancient_ruins', name: '古代遺跡', area: 'ruins', x: 84, y: 30, z: 138, radius: 30, description: '火山東側の高台にある遺跡。' },
  { id: 'forest_monument', name: '森の記念碑', area: 'forest', x: -70, y: 26, z: 134, radius: 22, description: '森の奥にある記念碑。' },
  { id: 'mountain_cabins', name: '山荘エリア', area: 'mountain', x: -198, y: 54, z: 230, radius: 26, description: '北側斜面の山荘。' },
  { id: 'east_forest', name: '東の森', area: 'forest', x: 146, y: 18, z: 8, radius: 26, description: '東側の丘に広がる森。' },
  { id: 'east_arm', name: '東の半島', area: 'coast', x: 260, y: 18, z: -120, radius: 28, description: '本家マップで特徴的な東へ回り込む半島。' },
  { id: 'wedge_island', name: 'ウェッジ島', area: 'island', x: -327, y: 8, z: -292, radius: 38, description: '本島の南西に浮かぶ大きな離島。' },
  { id: 'private_islet', name: '北西の小島', area: 'island', x: -378, y: 8, z: 277, radius: 24, description: '北西沖にある小さな島。' },
  { id: 'north_reef_chain', name: '北の岩礁群', area: 'coast', x: -160, y: 10, z: 356, radius: 22, description: '北の海に浮かぶ細い岩礁。' },
  { id: 'training_rings', name: 'リング訓練場', area: 'beach', x: -82, y: 20, z: -228, radius: 24, description: '初心者用のリング練習場。' },
  { id: 'coastal_road', name: '海岸遊歩道', area: 'beach', x: 120, y: 8, z: -238, radius: 24, description: '南岸から東の半島へ続く道。' },
  { id: 'volcano_shoulder', name: '火山中腹', area: 'volcano', x: -108, y: 62, z: 172, radius: 26, description: '火山へ登る途中の広い斜面。' }
];

export const ringCourses = [
  {
    id: 'beach_intro',
    name: 'ビーチ練習コース',
    description: '白砂ビーチ沿いの低空リング。操作確認用。',
    rings: [
      { x: -158, y: 24, z: -212 },
      { x: -100, y: 26, z: -232 },
      { x: -28, y: 28, z: -246 },
      { x: 56, y: 29, z: -248 },
      { x: 142, y: 31, z: -236 },
      { x: 230, y: 34, z: -204 }
    ]
  },
  {
    id: 'lake_loop',
    name: '湖一周コース',
    description: '中央湖の周囲を回るリング。',
    rings: [
      { x: -118, y: 34, z: 36 },
      { x: -96, y: 42, z: 88 },
      { x: -34, y: 44, z: 104 },
      { x: 40, y: 40, z: 62 },
      { x: 42, y: 35, z: -4 },
      { x: -28, y: 32, z: -30 }
    ]
  },
  {
    id: 'volcano_climb',
    name: '火山登山コース',
    description: '湖畔から火山側面を登る中級コース。',
    rings: [
      { x: -78, y: 54, z: 96 },
      { x: -104, y: 82, z: 142 },
      { x: -126, y: 116, z: 190 },
      { x: -150, y: 156, z: 246 }
    ]
  }
];
