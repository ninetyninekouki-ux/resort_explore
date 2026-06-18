// Procedural island data for the Resort Explore prototype.
// Coordinates use Three.js world space: x = east/west, z = north/south, y = height.

export const WORLD_BOUNDS = {
  minX: -320,
  maxX: 320,
  minZ: -320,
  maxZ: 320
};

// Hand-authored outline used by terrain generation and minimap drawing.
// This is not a 1:1 asset copy. It is a Wuhu-style landmark layout: volcano north-east,
// town south/south-east, lake center, wind turbines west, lighthouse west/south-west.
export const islandOutline = [
  { x: -255, z:  92 },
  { x: -232, z:  158 },
  { x: -168, z:  218 },
  { x: -72,  z:  246 },
  { x:  42,  z:  238 },
  { x:  130, z:  205 },
  { x:  206, z:  142 },
  { x:  258, z:  42 },
  { x:  236, z: -58 },
  { x:  188, z: -116 },
  { x:  118, z: -168 },
  { x:  42,  z: -210 },
  { x: -48,  z: -224 },
  { x: -126, z: -190 },
  { x: -202, z: -126 },
  { x: -260, z: -50 }
];

export const zones = {
  volcano: { x: 142, z: 118, radius: 108, height: 112 },
  crater: { x: 148, z: 124, radius: 28 },
  lake: { x: 0, z: 26, radiusX: 68, radiusZ: 42 },
  town: { x: 86, z: -132, radius: 54 },
  beach: { x: 10, z: -205, radiusX: 170, radiusZ: 42 },
  windHill: { x: -176, z: 76, radius: 72 },
  lighthouseCape: { x: -230, z: -74, radius: 44 },
  ruins: { x: -36, z: 132, radius: 38 },
  marina: { x: 145, z: -188, radius: 42 },
  smallIsland: { x: 252, z: -222, radius: 42 }
};

export const landmarks = [
  { id: 'resort_town', name: 'リゾートタウン', area: 'town', x: 86, y: 8, z: -132, radius: 26, description: '南側に広がるリゾートの中心地。広場・住宅・桟橋が集まる。' },
  { id: 'central_plaza', name: '中央広場', area: 'town', x: 68, y: 8, z: -128, radius: 18, description: '町の中心にある円形広場。今後は噴水やカフェを追加する。' },
  { id: 'marina', name: 'マリーナ', area: 'town', x: 145, y: 5, z: -188, radius: 22, description: '海に面した小さな港。ボートや浮き桟橋を追加予定。' },
  { id: 'white_beach', name: '白砂ビーチ', area: 'beach', x: -20, y: 4, z: -214, radius: 32, description: '南岸の長い白砂。低空飛行の練習に向く。' },
  { id: 'sunset_point', name: 'サンセット岬', area: 'beach', x: -176, y: 13, z: -136, radius: 24, description: '西の海に向いた岬。夕方モードの目印になる場所。' },
  { id: 'duckling_lake', name: '中央湖', area: 'lake', x: 0, y: 9, z: 26, radius: 32, description: '島中央の湖。周囲の山から水が流れ込む。' },
  { id: 'lake_falls', name: '湖の滝', area: 'lake', x: 38, y: 18, z: 72, radius: 20, description: '高地から中央湖に落ちる滝。水しぶき演出を追加予定。' },
  { id: 'red_bridge', name: '赤い橋', area: 'lake', x: -38, y: 12, z: -2, radius: 18, description: '湖の南側にかかる赤い橋。リングコースの基準点。' },
  { id: 'maka_peak', name: '火山山頂', area: 'volcano', x: 148, y: 104, z: 124, radius: 28, description: '島で最も高い火山の山頂。全景を見渡せる。' },
  { id: 'crater', name: '火口', area: 'volcano', x: 148, y: 110, z: 124, radius: 18, description: '火山の中心にある火口。今後は煙・赤熱表現を追加する。' },
  { id: 'lava_tube', name: '溶岩洞入口', area: 'volcano', x: 92, y: 46, z: 126, radius: 20, description: '火山の側面にある洞窟入口。上級リングコースの入口候補。' },
  { id: 'wind_hill', name: '風車の丘', area: 'wind', x: -176, y: 38, z: 76, radius: 28, description: '西側の丘に並ぶ風車群。上昇気流ギミックを追加予定。' },
  { id: 'lighthouse', name: '灯台', area: 'cape', x: -230, y: 24, z: -74, radius: 24, description: '西南の岬に立つ灯台。遠距離からでも目印になる。' },
  { id: 'cliff_cave', name: '海食洞', area: 'cape', x: -214, y: 12, z: -18, radius: 22, description: '崖下に開いた海食洞。狭い飛行ルートの候補。' },
  { id: 'ancient_ruins', name: '古代遺跡', area: 'ruins', x: -36, y: 30, z: 132, radius: 28, description: '北寄りの高台にある古代遺跡。石柱と門を追加予定。' },
  { id: 'forest_monument', name: '森の記念碑', area: 'forest', x: -90, y: 26, z: 118, radius: 22, description: '森の奥に立つ記念碑。木の密度で隠し要素にする。' },
  { id: 'mountain_cabins', name: '山荘エリア', area: 'mountain', x: -62, y: 54, z: 188, radius: 26, description: '北側斜面の山荘。高所の休憩地点。' },
  { id: 'arch_rock', name: '岩のアーチ', area: 'coast', x: 212, y: 24, z: 10, radius: 26, description: '東海岸にある自然の岩門。リングを通すと映える。' },
  { id: 'small_island', name: '離島', area: 'island', x: 252, y: 8, z: -222, radius: 28, description: '本島の南東に浮かぶ小島。探索報酬を置く場所。' },
  { id: 'training_rings', name: 'リング訓練場', area: 'beach', x: -86, y: 20, z: -206, radius: 24, description: '初心者用のリング練習場。' }
];

export const ringCourses = [
  {
    id: 'beach_intro',
    name: 'ビーチ練習コース',
    description: '白砂ビーチ沿いの低空リング。操作確認用。',
    rings: [
      { x: -118, y: 22, z: -210 },
      { x: -72, y: 26, z: -218 },
      { x: -24, y: 26, z: -216 },
      { x: 34, y: 28, z: -202 },
      { x: 88, y: 30, z: -184 }
    ]
  },
  {
    id: 'lake_loop',
    name: '湖一周コース',
    description: '中央湖の周囲を回るリング。',
    rings: [
      { x: -68, y: 34, z: 16 },
      { x: -42, y: 40, z: 68 },
      { x: 12, y: 42, z: 84 },
      { x: 62, y: 38, z: 42 },
      { x: 54, y: 34, z: -14 },
      { x: -12, y: 32, z: -34 }
    ]
  }
];
