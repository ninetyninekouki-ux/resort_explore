# Resort Explore v0.5 - Wuhu-style Island Reconstruction Prototype

GitHub Pagesで動くThree.js製の探索プロトタイプです。公式素材の抽出・流用はせず、公開マップの位置関係を参考にした**手続き型のリゾート島**として再構築しています。

## v0.5の目的

今回は「輪郭と起伏」を優先して修正しました。v0.4では島の輪郭データを持っていても、実際の高さ生成が楕円ベースだったため、空から見ると円形に近く見えていました。v0.5では、ポリゴン輪郭から海岸までの距離を計算して高さを決める方式へ変更しています。

## 主な変更

- 島の外形を西の岬・北側高地・南の町・南東砂州を持つ非対称形へ変更
- `edgeFalloff()` を楕円ベースから「ポリゴン境界距離ベース」に変更
- 火山を円錐単体ではなく、肩・斜面・火口を持つ山体として強化
- 中央湖、上流池、川、滝の位置関係を再調整
- 南の白砂ビーチと南東砂州を拡大
- 町の位置を南側へ再配置し、建物数を増加
- 西側の風車の丘、灯台岬、海食洞をより輪郭に沿うよう再配置
- ランドマークを30個へ増加
- ミニマップも同じ `islandOutline` から描画

## ファイル構成

```text
index.html
README.md
IMPLEMENTATION_STEPS.md
MAP_BUILD_GUIDE.md
PHASE2_REVIEW.md
data/
  islandData.js
src/
  main.js
  styles.css
```

## 重要ファイル

### `data/islandData.js`

島の形・エリア・ランドマーク・リングコースを管理します。

```js
islandOutline      // 島の輪郭
secondaryIslands   // 離島・岩礁
zones              // 火山、湖、町、砂浜、灯台など
pathRoutes         // 道路、湖畔道、海岸道
landmarks          // 発見ポイント
ringCourses        // リングコース
```

### `src/main.js`

地形生成、操作、描画、ミニマップ、ランドマーク判定を管理します。

特に重要なのは以下です。

```js
mainIslandFactor()     // 輪郭に沿った島の高さ補正
edgeFalloff()          // 海岸線の落ち込み
heightAt(x, z)         // 地形の高さ生成
terrainColorAt(x,z,y)  // 砂浜・草地・岩肌の色分け
```

## 操作

| 操作 | 内容 |
|---|---|
| クリック | 開始 / Pointer Lock |
| マウス | 視点操作 |
| W / S | 前進 / 後退 |
| A / D | 左 / 右 |
| Space | 上昇 |
| Shift | 下降 |

## GitHub Pages反映方法

このフォルダの中身を `resort_explore` リポジトリ直下に上書きアップロードしてください。

アップロード後、以下を開いて確認します。

```text
https://ninetyninekouki-ux.github.io/resort_explore/
```

Macで強制更新：

```text
Command + Shift + R
```
