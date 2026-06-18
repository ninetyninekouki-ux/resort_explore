# MAP BUILD GUIDE v0.5

## 方針

ウーフーアイランド風の再現で最初に重要なのは、建物や木の数ではなく、空から見たときの「輪郭」と「起伏」です。v0.5ではこの2つを優先して修正しています。

## 実装方針

### 1. 島の輪郭

`data/islandData.js` の `islandOutline` を島の唯一の基準線として使います。

```js
export const islandOutline = [
  { x: -320, z: 18 },
  ...
];
```

`src/main.js` では、各地形頂点からこの輪郭までの距離を計算します。

```js
function mainIslandFactor(x, z) {
  if (!pointInPolygon(x, z, islandOutline)) return 0;
  const shore = distanceToPolygonEdge(x, z, islandOutline);
  return smoothstep(0, 42, shore);
}
```

これにより、島の外形が円ではなくポリゴン輪郭に従います。

### 2. 地形の高さ

地形の高さは `heightAt(x, z)` に集約します。

優先順位：

```text
海か陸か
↓
海岸線からの距離
↓
火山・丘・山荘エリアの盛り上げ
↓
湖・池・川の削り込み
↓
砂浜・町・港の平坦化
```

### 3. 地形エリア

`zones` は地形加工のための制御点です。

```js
zones.volcano
zones.volcanoShoulder
zones.lake
zones.upperLake
zones.town
zones.beach
zones.southEastBeach
zones.windHill
zones.lighthouseCape
```

## 次に調整する場所

### 島がまだ丸い場合

`mainIslandFactor()` の shore幅を狭めます。

```js
return smoothstep(0, 42, shore);
```

42を小さくすると海岸線が急になります。大きくするとなだらかになります。

### 海岸が角張る場合

`createTerrain()` の `segments` を増やします。

```js
const segments = 232;
```

### 火山をもっと大きくする場合

```js
volcano: { x: 88, z: 146, radiusX: 128, radiusZ: 114, height: 150 }
```

`height` を上げると山が高くなります。`radiusX/radiusZ` を上げると山体が広くなります。

### 砂州を細くする場合

```js
southEastBeach: { x: 270, z: -250, radiusX: 132, radiusZ: 52 }
```

`radiusZ` を小さくすると細くなります。

## v0.6でやるべきこと

1. 公式マップ風に、北西側の小湖と西の湾を追加
2. 火山の火口・洞窟入口をモデルとして追加
3. 南の町に道路網、ホテル、港、灯台側へ向かう道を追加
4. 湖の滝を透明な水メッシュで表示
5. 砂浜の浅瀬・波打ち際を追加
