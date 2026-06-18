// Resort Explore v0.4 terrain data.
// Coordinates use Three.js world space: x = east/west, z = north/south, y = height.
// Design goal: closer Wuhu-style geography, not a copied asset.

export const WORLD_BOUNDS = {
  minX: -360,
  maxX: 380,
  minZ: -360,
  maxZ: 340
};

// Main island outline. More points = less circular, closer to the official map impression:
// volcanic north-east mass, southern resort town, western lighthouse/wind hill,
// and a long white-sand south-east coast/peninsula.
export const islandOutline = [
  { x: -282, z:   52 },
  { x: -270, z:  118 },
  { x: -226, z:  185 },
  { x: -160, z:  235 },
  { x:  -74, z:  262 },
  { x:   24, z:  250 },
  { x:  104, z:  230 },
  { x:  180, z:  182 },
  { x:  238, z:  116 },
  { x:  266, z:   38 },
  { x:  252, z:  -34 },
  { x:  214, z:  -86 },
  { x:  250, z: -126 },
  { x:  318, z: -170 },
  { x:  340, z: -230 },
  { x:  308, z: -282 },
  { x:  226, z: -306 },
  { x:  122, z: -292 },
  { x:   34, z: -262 },
  { x:  -58, z: -246 },
  { x: -134, z: -214 },
  { x: -204, z: -158 },
  { x: -266, z:  -82 }
];

// Secondary islands / rocks. Terrain generator treats these as separate land masses.
export const secondaryIslands = [
  { id: 'wedge_island', x: 302, z: -250, radiusX: 58, radiusZ: 42, height: 12, type: 'sand_grass' },
  { id: 'north_rock', x: -210, z: 276, radiusX: 24, radiusZ: 16, height: 18, type: 'rock' },
  { id: 'west_rocks', x: -318, z: -18, radiusX: 18, radiusZ: 12, height: 8, type: 'rock' }
];

export const zones = {
  // Main geography
  volcano: { x: 116, z: 146, radius: 118, height: 128 },
  crater: { x: 122, z: 152, radius: 30 },
  lake: { x: -28, z: 28, radiusX: 74, radiusZ: 48 },
  upperLake: { x: -58, z: 108, radiusX: 42, radiusZ: 24 },
  river: { points: [{ x: -58, z: 102 }, { x: -34, z: 74 }, { x: -28, z: 28 }], width: 10 },

  // Human areas
  town: { x: 20, z: -150, radius: 68 },
  plaza: { x: 18, z: -146, radius: 28 },
  marina: { x: 80, z: -218, radius: 52 },
  beach: { x: 62, z: -250, radiusX: 230, radiusZ: 54 },
  southEastBeach: { x: 236, z: -250, radiusX: 112, radiusZ: 44 },

  // Landmark areas
  windHill: { x: -174, z: 84, radius: 82 },
  lighthouseCape: { x: -246, z: -62, radius: 50 },
  ruins: { x: -72, z: 150, radius: 46 },
  mountainCabins: { x: -110, z: 206, radius: 48 },
  eastForest: { x: 164, z: -10, radius: 78 },
  northForest: { x: -28, z: 142, radius: 76 },
  archRock: { x: 224, z: 16, radius: 34 }
};

// Roads / paths are rendered as flat strips and also serve as design guides.
export const pathRoutes = [
  {
    id: 'town_to_lake',
    name: '町から中央湖への道',
    width: 7,
    color: 0xdcc98d,
    points: [
      { x: 12, z: -160 }, { x: 6, z: -118 }, { x: -4, z: -72 }, { x: -18, z: -16 }
    ]
  },
  {
    id: 'lake_loop_path',
    name: '湖畔の周回路',
    width: 5,
    color: 0xe8d79a,
    points: [
      { x: -92, z: 18 }, { x: -68, z: 72 }, { x: -8, z: 92 }, { x: 52, z: 58 }, { x: 58, z: 0 }, { x: 10, z: -34 }, { x: -54, z: -26 }, { x: -92, z: 18 }
    ]
  },
  {
    id: 'wind_to_ruins',
    name: '西の丘から遺跡への道',
    width: 5,
    color: 0xd7c286,
    points: [
      { x: -188, z: 78 }, { x: -152, z: 118 }, { x: -110, z: 146 }, { x: -72, z: 150 }
    ]
  },
  {
    id: 'coastal_beach_path',
    name: '海岸遊歩道',
    width: 6,
    color: 0xeadba6,
    points: [
      { x: -170, z: -190 }, { x: -80, z: -230 }, { x: 32, z: -244 }, { x: 136, z: -248 }, { x: 248, z: -250 }
    ]
  }
];

export const landmarks = [
  { id: 'resort_town', name: 'リゾートタウン', area: 'town', x: 20, y: 8, z: -150, radius: 28, description: '南側に広がるリゾートの中心地。広場・住宅・桟橋が集まる。' },
  { id: 'central_plaza', name: '中央広場', area: 'town', x: 18, y: 8, z: -146, radius: 20, description: '町の中心にある円形広場。噴水と周回路を置く基準点。' },
  { id: 'marina', name: 'マリーナ', area: 'town', x: 80, y: 5, z: -218, radius: 24, description: '海に面した小さな港。桟橋・ボート・リングの発着点。' },
  { id: 'white_beach', name: '白砂ビーチ', area: 'beach', x: 26, y: 4, z: -250, radius: 34, description: '南岸の長い白砂。低空飛行の練習に向く。' },
  { id: 'south_east_spit', name: '南東の砂州', area: 'beach', x: 246, y: 5, z: -252, radius: 32, description: '南東に伸びる細長い砂州。島の輪郭を特徴づける場所。' },
  { id: 'sunset_point', name: 'サンセット岬', area: 'beach', x: -202, y: 14, z: -148, radius: 24, description: '西の海に向いた岬。夕方モードの目印になる場所。' },
  { id: 'duckling_lake', name: '中央湖', area: 'lake', x: -28, y: 9, z: 28, radius: 34, description: '島中央の湖。周囲の山から水が流れ込む。' },
  { id: 'upper_lake', name: '上流の池', area: 'lake', x: -58, y: 26, z: 108, radius: 24, description: '中央湖へ水を送る高地の池。滝の起点。' },
  { id: 'lake_falls', name: '湖の滝', area: 'lake', x: -42, y: 22, z: 78, radius: 22, description: '高地から中央湖に落ちる滝。水しぶき演出を追加予定。' },
  { id: 'red_bridge', name: '赤い橋', area: 'lake', x: -40, y: 12, z: -8, radius: 18, description: '湖の南側にかかる赤い橋。リングコースの基準点。' },
  { id: 'maka_peak', name: '火山山頂', area: 'volcano', x: 122, y: 118, z: 152, radius: 30, description: '島で最も高い火山の山頂。全景を見渡せる。' },
  { id: 'crater', name: '火口', area: 'volcano', x: 122, y: 122, z: 152, radius: 18, description: '火山の中心にある火口。煙・赤熱表現を追加する。' },
  { id: 'lava_tube', name: '溶岩洞入口', area: 'volcano', x: 72, y: 48, z: 130, radius: 22, description: '火山の側面にある洞窟入口。上級リングコースの入口候補。' },
  { id: 'wind_hill', name: '風車の丘', area: 'wind', x: -174, y: 38, z: 84, radius: 30, description: '西側の丘に並ぶ風車群。上昇気流ギミックを追加予定。' },
  { id: 'west_overlook', name: '西の展望台', area: 'wind', x: -214, y: 42, z: 76, radius: 22, description: '風車の丘の端にある展望台。西海岸を一望できる。' },
  { id: 'lighthouse', name: '灯台', area: 'cape', x: -246, y: 24, z: -62, radius: 24, description: '西南の岬に立つ灯台。遠距離からでも目印になる。' },
  { id: 'cliff_cave', name: '海食洞', area: 'cape', x: -224, y: 12, z: -14, radius: 22, description: '崖下に開いた海食洞。狭い飛行ルートの候補。' },
  { id: 'ancient_ruins', name: '古代遺跡', area: 'ruins', x: -72, y: 30, z: 150, radius: 30, description: '北寄りの高台にある古代遺跡。石柱と門を追加予定。' },
  { id: 'forest_monument', name: '森の記念碑', area: 'forest', x: -30, y: 26, z: 142, radius: 22, description: '森の奥に立つ記念碑。木の密度で隠し要素にする。' },
  { id: 'mountain_cabins', name: '山荘エリア', area: 'mountain', x: -110, y: 54, z: 206, radius: 26, description: '北側斜面の山荘。高所の休憩地点。' },
  { id: 'arch_rock', name: '岩のアーチ', area: 'coast', x: 224, y: 24, z: 16, radius: 26, description: '東海岸にある自然の岩門。リングを通すと映える。' },
  { id: 'wedge_island', name: '離島', area: 'island', x: 302, y: 8, z: -250, radius: 28, description: '本島の南東に浮かぶ小島。探索報酬を置く場所。' },
  { id: 'training_rings', name: 'リング訓練場', area: 'beach', x: -86, y: 20, z: -222, radius: 24, description: '初心者用のリング練習場。' },
  { id: 'east_forest', name: '東の森', area: 'forest', x: 160, y: 18, z: -20, radius: 26, description: '東側に広がる森。低空探索でランドマークが見つかる。' },
  { id: 'coastal_road', name: '海岸遊歩道', area: 'beach', x: 132, y: 8, z: -248, radius: 24, description: '南の白砂沿いに続く道。島一周コースの導線。' },
  { id: 'north_rock', name: '北の岩礁', area: 'coast', x: -210, y: 14, z: 276, radius: 18, description: '北の海に浮かぶ小さな岩礁。遠景の目印。' }
];

export const ringCourses = [
  {
    id: 'beach_intro',
    name: 'ビーチ練習コース',
    description: '白砂ビーチ沿いの低空リング。操作確認用。',
    rings: [
      { x: -126, y: 22, z: -220 },
      { x: -74, y: 26, z: -232 },
      { x: -18, y: 26, z: -246 },
      { x: 46, y: 28, z: -246 },
      { x: 112, y: 30, z: -238 },
      { x: 178, y: 34, z: -244 }
    ]
  },
  {
    id: 'lake_loop',
    name: '湖一周コース',
    description: '中央湖の周囲を回るリング。',
    rings: [
      { x: -92, y: 34, z: 16 },
      { x: -68, y: 40, z: 72 },
      { x: -10, y: 42, z: 90 },
      { x: 54, y: 38, z: 48 },
      { x: 50, y: 34, z: -18 },
      { x: -14, y: 32, z: -38 }
    ]
  },
  {
    id: 'volcano_climb',
    name: '火山登山コース',
    description: '湖畔から火山側面を登る中級コース。',
    rings: [
      { x: 42, y: 52, z: 72 },
      { x: 70, y: 74, z: 106 },
      { x: 98, y: 98, z: 132 },
      { x: 126, y: 124, z: 154 }
    ]
  }
];
