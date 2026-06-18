# Resort Explore v0.6 - Reference-aligned Island Terrain Prototype

GitHub Pagesで動くThree.js製の探索プロトタイプです。v0.6では、ユーザー提供の参照画像を基に、まず**輪郭と起伏**を優先して作り直しています。

公式素材の抽出・流用ではなく、公開参考画像を見ながら手続き型の地形データとして再構築しています。

## v0.6の目的

- 本家マップに近い島の輪郭へ寄せる
- 丸い島に見える問題を解消する
- 北西寄りの大きな火山と広い山腹を作る
- 中央湖、上流池、滝、町、港、灯台、風車、離島の位置関係を見直す
- 今後、町・道・段々斜面・浅瀬・岩肌を追加しやすい構造にする

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

島の設計データです。

```js
islandOutline      // 島の輪郭
secondaryIslands   // ウェッジ島・小島・岩礁
zones              // 火山、湖、町、砂浜、灯台など
pathRoutes         // 道・湖畔道・海岸道
landmarks          // 発見ポイント
ringCourses        // リングコース
```

### `src/main.js`

地形生成、描画、操作、ミニマップ、ランドマーク判定を管理します。

特に重要なのは以下です。

```js
mainIslandFactor()
edgeFalloff()
heightAt(x, z)
terrainColorAt(x, z, y)
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

```text
resort_explore/
├─ index.html
├─ README.md
├─ IMPLEMENTATION_STEPS.md
├─ MAP_BUILD_GUIDE.md
├─ PHASE2_REVIEW.md
├─ data/
│  └─ islandData.js
└─ src/
   ├─ main.js
   └─ styles.css
```

アップロード後、以下を開いて確認します。

```text
https://ninetyninekouki-ux.github.io/resort_explore/
```

反映されない場合は `Command + Shift + R` で強制更新してください。
