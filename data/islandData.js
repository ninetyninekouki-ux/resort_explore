// Resort Explore v0.5 terrain data.
// Coordinates: x = east/west, z = north/south, y = height.
// Goal: Wuhu-style layout from public map analysis, but implemented with original procedural geometry.
// Key corrections vs v0.4:
// - coastline uses polygon-distance falloff, so the outline no longer collapses into a round island
// - stronger NE volcano, central lake basin, west wind/lighthouse side, south town, and long SE sandbar

export const WORLD_BOUNDS = {
  minX: -390,
  maxX: 420,
  minZ: -380,
  maxZ: 360
};

// Main island outline, traced as a playable low-poly approximation.
// Shape notes:
// - west side has a triangular cape and rugged rocks
// - north side has a raised mountain/volcano mass
// - south side contains the town and wide white beach
// - east/south-east stretches into a long sandy peninsula
export const islandOutline = [
  { x: -320, z:  18 },
  { x: -305, z:  82 },
  { x: -270, z: 126 },
  { x: -232, z: 182 },
  { x: -168, z: 224 },
  { x:  -92, z: 242 },
  { x:  -18, z: 222 },
  { x:   44, z: 246 },
  { x:  118, z: 230 },
  { x:  176, z: 196 },
  { x:  222, z: 144 },
  { x:  248, z:  82 },
  { x:  236, z:  26 },
  { x:  266, z: -26 },
  { x:  330, z: -72 },
  { x:  386, z:-132 },
  { x:  398, z:-202 },
  { x:  360, z:-262 },
  { x:  292, z:-302 },
  { x:  206, z:-318 },
  { x:  118, z:-306 },
  { x:   34, z:-286 },
  { x:  -48, z:-270 },
  { x: -124, z:-236 },
  { x: -174, z:-192 },
  { x: -220, z:-138 },
  { x: -278, z:-106 },
  { x: -344, z: -58 },
  { x: -366, z:  -8 }
];

// Separate land masses used for Wedge-like island, rock stacks, and small reefs.
export const secondaryIslands = [
  { id: 'wedge_island', x: 314, z: -286, radiusX: 70, radiusZ: 46, height: 14, type: 'sand_grass' },
  { id: 'small_south_islet', x: 112, z: -348, radiusX: 26, radiusZ: 16, height: 7, type: 'sand' },
  { id: 'north_rock', x: -214, z: 292, radiusX: 25, radiusZ: 16, height: 20, type: 'rock' },
  { id: 'west_rocks', x: -340, z: 6, radiusX: 22, radiusZ: 13, height: 10, type: 'rock' },
  { id: 'east_reef', x: 368, z: 20, radiusX: 20, radiusZ: 11, height: 8, type: 'rock' }
];

export const zones = {
  // Main geography. Volcano is north-east/center-right; lake is central-lower; town/beach are south.
  volcano: { x: 88, z: 146, radiusX: 128, radiusZ: 114, height: 150 },
  volcanoShoulder: { x: 34, z: 118, radiusX: 170, radiusZ: 104, height: 44 },
  crater: { x: 96, z: 154, radius: 29 },
  lavaTube: { x: 32, z: 118, radius: 25 },

  lake: { x: -44, z: 22, radiusX: 82, radiusZ: 54 },
  upperLake: { x: -76, z: 112, radiusX: 44, radiusZ: 24 },
  river: { points: [{ x: -76, z: 110 }, { x: -60, z: 82 }, { x: -48, z: 52 }, { x: -44, z: 22 }], width: 12 },

  town: { x: -76, z: -176, radiusX: 88, radiusZ: 68 },
  plaza: { x: -62, z: -166, radius: 28 },
  marina: { x: -114, z: -244, radius: 54 },
  beach: { x: 34, z: -268, radiusX: 246, radiusZ: 58 },
  southEastBeach: { x: 270, z: -250, radiusX: 132, radiusZ: 52 },
  sandbarNeck: { x: 204, z: -212, radiusX: 104, radiusZ: 36 },

  windHill: { x: -230, z: 82, radiusX: 88, radiusZ: 92 },
  lighthouseCape: { x: -292, z: -56, radius: 54 },
  westCape: { x: -318, z: -20, radius: 70 },
  ruins: { x: -92, z: 154, radius: 48 },
  mountainCabins: { x: -132, z: 210, radius: 54 },
  eastForest: { x: 178, z: -14, radius: 92 },
  northForest: { x: -32, z: 142, radius: 82 },
  archRock: { x: 250, z: 28, radius: 38 },
  golfIsland: { x: 314, z: -286, radius: 56 }
};

// Roads / paths. These are visual strips and design guides.
export const pathRoutes = [
  {
    id: 'town_to_lake',
    name: '町から中央湖への道',
    width: 7,
    color: 0xdcc98d,
    points: [
      { x: -72, z: -174 }, { x: -66, z: -128 }, { x: -58, z: -72 }, { x: -48, z: -18 }
    ]
  },
  {
    id: 'lake_loop_path',
    name: '湖畔の周回路',
    width: 5,
    color: 0xe8d79a,
    points: [
      { x: -120, z: 16 }, { x: -96, z: 76 }, { x: -34, z: 104 }, { x: 38, z: 70 }, { x: 48, z: 4 }, { x: 2, z: -36 }, { x: -72, z: -32 }, { x: -120, z: 16 }
    ]
  },
  {
    id: 'wind_to_ruins',
    name: '西の丘から遺跡への道',
    width: 5,
    color: 0xd7c286,
    points: [
      { x: -246, z: 74 }, { x: -202, z: 112 }, { x: -154, z: 138 }, { x: -94, z: 154 }
    ]
  },
  {
    id: 'coastal_beach_path',
    name: '海岸遊歩道',
    width: 6,
    color: 0xeadba6,
    points: [
      { x: -196, z: -180 }, { x: -132, z: -222 }, { x: -34, z: -254 }, { x: 82, z: -268 }, { x: 198, z: -260 }, { x: 300, z: -250 }
    ]
  },
  {
    id: 'volcano_ridge_path',
    name: '火山登山道',
    width: 5,
    color: 0xbfae7d,
    points: [
      { x: -10, z: 92 }, { x: 30, z: 120 }, { x: 62, z: 142 }, { x: 94, z: 154 }
    ]
  }
];

export const landmarks = [
  { id: 'resort_town', name: 'リゾートタウン', area: 'town', x: -76, y: 8, z: -176, radius: 30, description: '南側に広がるリゾートの中心地。広場・住宅・桟橋が集まる。' },
  { id: 'central_plaza', name: '中央広場', area: 'town', x: -62, y: 8, z: -166, radius: 22, description: '町の中心にある円形広場。噴水と周回路を置く基準点。' },
  { id: 'marina', name: 'マリーナ', area: 'town', x: -114, y: 5, z: -244, radius: 26, description: '海に面した小さな港。桟橋・ボート・リングの発着点。' },
  { id: 'white_beach', name: '白砂ビーチ', area: 'beach', x: 26, y: 4, z: -268, radius: 36, description: '南岸の長い白砂。低空飛行の練習に向く。' },
  { id: 'south_east_spit', name: '南東の砂州', area: 'beach', x: 282, y: 5, z: -252, radius: 34, description: '南東に伸びる細長い砂州。島の輪郭を特徴づける場所。' },
  { id: 'sunset_point', name: 'サンセット岬', area: 'beach', x: -222, y: 14, z: -142, radius: 24, description: '西の海に向いた岬。夕方モードの目印になる場所。' },
  { id: 'duckling_lake', name: '中央湖', area: 'lake', x: -44, y: 9, z: 22, radius: 36, description: '島中央の湖。周囲の山から水が流れ込む。' },
  { id: 'upper_lake', name: '上流の池', area: 'lake', x: -76, y: 26, z: 112, radius: 24, description: '中央湖へ水を送る高地の池。滝の起点。' },
  { id: 'lake_falls', name: '湖の滝', area: 'lake', x: -60, y: 22, z: 82, radius: 22, description: '高地から中央湖に落ちる滝。水しぶき演出を追加予定。' },
  { id: 'red_bridge', name: '赤い橋', area: 'lake', x: -54, y: 12, z: -10, radius: 18, description: '湖の南側にかかる赤い橋。リングコースの基準点。' },
  { id: 'maka_peak', name: '火山山頂', area: 'volcano', x: 96, y: 130, z: 154, radius: 32, description: '島で最も高い火山の山頂。全景を見渡せる。' },
  { id: 'crater', name: '火口', area: 'volcano', x: 96, y: 128, z: 154, radius: 18, description: '火山の中心にある火口。煙・赤熱表現を追加する。' },
  { id: 'lava_tube', name: '溶岩洞入口', area: 'volcano', x: 32, y: 58, z: 118, radius: 22, description: '火山の側面にある洞窟入口。上級リングコースの入口候補。' },
  { id: 'wind_hill', name: '風車の丘', area: 'wind', x: -230, y: 38, z: 82, radius: 30, description: '西側の丘に並ぶ風車群。上昇気流ギミックを追加予定。' },
  { id: 'west_overlook', name: '西の展望台', area: 'wind', x: -270, y: 42, z: 62, radius: 22, description: '風車の丘の端にある展望台。西海岸を一望できる。' },
  { id: 'lighthouse', name: '灯台', area: 'cape', x: -292, y: 24, z: -56, radius: 26, description: '西南の岬に立つ灯台。遠距離からでも目印になる。' },
  { id: 'cliff_cave', name: '海食洞', area: 'cape', x: -300, y: 12, z: -8, radius: 22, description: '崖下に開いた海食洞。狭い飛行ルートの候補。' },
  { id: 'ancient_ruins', name: '古代遺跡', area: 'ruins', x: -92, y: 30, z: 154, radius: 30, description: '北寄りの高台にある古代遺跡。石柱と門を追加予定。' },
  { id: 'forest_monument', name: '森の記念碑', area: 'forest', x: -32, y: 26, z: 142, radius: 22, description: '森の奥に立つ記念碑。木の密度で隠し要素にする。' },
  { id: 'mountain_cabins', name: '山荘エリア', area: 'mountain', x: -132, y: 54, z: 210, radius: 26, description: '北側斜面の山荘。高所の休憩地点。' },
  { id: 'arch_rock', name: '岩のアーチ', area: 'coast', x: 250, y: 24, z: 28, radius: 26, description: '東海岸にある自然の岩門。リングを通すと映える。' },
  { id: 'wedge_island', name: '離島', area: 'island', x: 314, y: 8, z: -286, radius: 30, description: '本島の南東に浮かぶ小島。探索報酬を置く場所。' },
  { id: 'training_rings', name: 'リング訓練場', area: 'beach', x: -86, y: 20, z: -238, radius: 24, description: '初心者用のリング練習場。' },
  { id: 'east_forest', name: '東の森', area: 'forest', x: 172, y: 18, z: -18, radius: 26, description: '東側に広がる森。低空探索でランドマークが見つかる。' },
  { id: 'coastal_road', name: '海岸遊歩道', area: 'beach', x: 132, y: 8, z: -262, radius: 24, description: '南の白砂沿いに続く道。島一周コースの導線。' },
  { id: 'north_rock', name: '北の岩礁', area: 'coast', x: -214, y: 14, z: 292, radius: 18, description: '北の海に浮かぶ小さな岩礁。遠景の目印。' },
  { id: 'west_rocks', name: '西の岩場', area: 'coast', x: -340, y: 10, z: 6, radius: 18, description: '西側の荒い海岸線。岩場と海食洞につながる。' },
  { id: 'sandbar_neck', name: '砂州のくびれ', area: 'beach', x: 204, y: 6, z: -212, radius: 22, description: '本島から南東砂州へつながる細い低地。' },
  { id: 'volcano_shoulder', name: '火山中腹', area: 'volcano', x: 34, y: 62, z: 118, radius: 26, description: '火山へ登る途中の斜面。湖と山頂の中間地点。' },
  { id: 'east_reef', name: '東の岩礁', area: 'coast', x: 368, y: 10, z: 20, radius: 16, description: '東の海上に浮かぶ小岩。外周ルートの目印。' }
];

export const ringCourses = [
  {
    id: 'beach_intro',
    name: 'ビーチ練習コース',
    description: '白砂ビーチ沿いの低空リング。操作確認用。',
    rings: [
      { x: -150, y: 24, z: -224 },
      { x: -96, y: 26, z: -246 },
      { x: -30, y: 28, z: -264 },
      { x: 46, y: 29, z: -268 },
      { x: 128, y: 31, z: -260 },
      { x: 222, y: 34, z: -246 }
    ]
  },
  {
    id: 'lake_loop',
    name: '湖一周コース',
    description: '中央湖の周囲を回るリング。',
    rings: [
      { x: -112, y: 34, z: 14 },
      { x: -92, y: 42, z: 76 },
      { x: -24, y: 44, z: 100 },
      { x: 48, y: 40, z: 54 },
      { x: 42, y: 35, z: -16 },
      { x: -26, y: 32, z: -42 }
    ]
  },
  {
    id: 'volcano_climb',
    name: '火山登山コース',
    description: '湖畔から火山側面を登る中級コース。',
    rings: [
      { x: 20, y: 54, z: 72 },
      { x: 42, y: 76, z: 108 },
      { x: 68, y: 104, z: 134 },
      { x: 96, y: 136, z: 154 }
    ]
  }
];
