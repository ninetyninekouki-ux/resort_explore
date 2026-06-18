export const LANDMARKS = [
  { id: 'volcano', name: '中央火山', x: 90, z: -72, y: 36, radius: 22, kind: 'peak', description: '島の象徴になる高い火山。遠くからでも見える基準点。' },
  { id: 'crater', name: '火口展望台', x: 104, z: -86, y: 51, radius: 16, kind: 'peak', description: '火口付近の高所。チャレンジリングを置きやすい場所。' },
  { id: 'lake', name: '中央湖', x: 7, z: -12, y: 5, radius: 24, kind: 'water', description: '島の中央にある湖。水面と滝の演出を追加する予定。' },
  { id: 'waterfall', name: '湖の滝', x: 20, z: 18, y: 8, radius: 16, kind: 'water', description: '湖から南側へ落ちる滝。視覚的なランドマーク。' },
  { id: 'town', name: 'リゾートタウン', x: -52, z: 84, y: 3, radius: 28, kind: 'town', description: 'ホテル、港、広場を配置する南側の町エリア。' },
  { id: 'pier', name: '南の桟橋', x: -48, z: 120, y: 2, radius: 16, kind: 'town', description: '海へ伸びる桟橋。チュートリアル開始地点に向いている。' },
  { id: 'beach', name: '白砂ビーチ', x: 88, z: 76, y: 2, radius: 30, kind: 'beach', description: '南東側に広がる白い砂浜。低空飛行の練習に使える。' },
  { id: 'lighthouse', name: '西の灯台', x: -116, z: 64, y: 14, radius: 18, kind: 'tower', description: '島の西側に立つ灯台。夜景モードで光らせる。' },
  { id: 'windfarm', name: '風車の丘', x: -96, z: -38, y: 14, radius: 28, kind: 'field', description: '複数の風車が並ぶ丘。気流・上昇風のギミック候補。' },
  { id: 'bridge', name: '吊り橋', x: 24, z: 48, y: 10, radius: 16, kind: 'bridge', description: '谷を横断する橋。橋下をくぐるリングチャレンジに使える。' },
  { id: 'ruins', name: '古代遺跡', x: 52, z: -28, y: 14, radius: 18, kind: 'ruins', description: '岩場にある遺跡。洞窟入口や隠し収集物を置く候補。' },
  { id: 'north', name: '北の山荘', x: 10, z: -128, y: 18, radius: 20, kind: 'cabin', description: '北側高台の小さな建物群。遠征感を出すエリア。' },
  { id: 'small_isle', name: '南東の小島', x: 145, z: 145, y: 4, radius: 26, kind: 'island', description: '本島から離れた小島。長距離飛行の目標地点。' },
  { id: 'cave', name: '海食洞', x: -132, z: 10, y: 8, radius: 16, kind: 'cave', description: '崖の近くにある洞窟。内部探索を追加する予定。' }
];

export const RINGS = [
  { x: -60, y: 14, z: 42, r: 8 },
  { x: -30, y: 22, z: 20, r: 8 },
  { x: 10, y: 28, z: 4, r: 8 },
  { x: 48, y: 38, z: -18, r: 9 },
  { x: 82, y: 52, z: -54, r: 10 },
  { x: 104, y: 60, z: -86, r: 10 },
  { x: 60, y: 18, z: 68, r: 8 },
  { x: 94, y: 18, z: 98, r: 8 },
  { x: 128, y: 22, z: 126, r: 8 }
];
