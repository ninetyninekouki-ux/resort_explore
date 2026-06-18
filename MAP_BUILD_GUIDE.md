# MAP BUILD GUIDE v0.6

## v0.6の基準

今回の地形は、ユーザー提供の参照画像のうち、3枚目のシルエットマップを最優先にした。4〜6枚目の俯瞰画像は起伏・標高・ランドマーク配置の参考にした。

## 主要ファイル

```text
data/islandData.js   # 輪郭・エリア・ランドマーク・リング
src/main.js          # 地形生成・描画・操作・ミニマップ
```

## 輪郭の修正場所

```js
export const islandOutline = [
  { x: -206, z: 248 },
  ...
];
```

v0.6ではこの配列が島の実形状の基準になる。`src/main.js` 側では、各地形頂点からこのポリゴン外周までの距離を計算して海岸線を作る。

## 起伏の修正場所

```js
export const zones = {
  volcano,
  volcanoShoulder,
  lake,
  upperLake,
  river,
  town,
  beach,
  windHill,
  lighthouseCape
};
```

`src/main.js` の `heightAt(x, z)` が実際の標高を作る。

優先順位は以下。

```text
1. islandOutline内かどうか
2. 海岸からの距離で海岸線を落とす
3. 火山・山腹を盛る
4. 湖・川を削る
5. 町・港・砂浜を平坦化
6. 森・風車丘・灯台岬を盛る
```

## 次に改善する場合

1. 火山の縦筋・岩肌を追加
2. 町のホテル・広場・道を追加
3. 斜面に段々畑状のラインを追加
4. 西側の断崖をさらに高くする
5. 浅瀬の色を濃淡で分ける
