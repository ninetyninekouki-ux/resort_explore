# Resort Explore v0.3 - Wuhu-style Island Reconstruction Prototype

GitHub Pagesで動くThree.js製の探索プロトタイプです。公式素材の抽出や流用はせず、公開マップの位置関係を参考にした**手続き型のリゾート島**として再構築しています。

## 目的

- 火山、中央湖、町、砂浜、風車の丘、灯台岬、遺跡、離島を持つ島を作る
- ジェットパックで自由探索できるようにする
- ミニマップと実際の地形を同じ座標データから描く
- 今後、ランドマーク・リング・バルーン・昼夜変化を追加しやすくする

## ファイル構成

```text
index.html
README.md
IMPLEMENTATION_STEPS.md
MAP_BUILD_GUIDE.md
data/
  islandData.js
src/
  main.js
  styles.css
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

## v0.3の重要仕様

- A/Dの左右は修正済み
- ブーストは常時ON相当
- 何も押さないと自由落下
- ミニマップは `data/islandData.js` の島輪郭とランドマーク座標から描画
- 地形は `heightAt(x, z)` で生成
- ランドマークは `landmarks` 配列に追加するだけで画面とミニマップへ反映

## GitHub Pages反映方法

このフォルダの中身を `resort_explore` リポジトリ直下に上書きアップロードしてください。

```text
resort_explore/
├─ index.html
├─ README.md
├─ IMPLEMENTATION_STEPS.md
├─ MAP_BUILD_GUIDE.md
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
