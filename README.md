# Resort Explore v0.4 - Wuhu-style Island Reconstruction Prototype

ブラウザで動く、リゾート島ジェットパック探索ゲームのプロトタイプです。

## v0.4 の目的

v0.3 は「島・火山・湖・町・風車・灯台がある」状態でしたが、島全体がまだ丸く、ウーフーアイランドらしい非対称な地形構造が弱い状態でした。

v0.4 では以下を改善しています。

- 島の輪郭を丸型から非対称なリゾート島型に変更
- 南東へ伸びる砂浜・砂州を追加
- 中央湖に加えて上流の池と川・滝導線を追加
- 町を南側に再配置し、建物密度を増加
- 道路・湖畔道・海岸遊歩道を追加
- 風車の丘を西側に整理
- 離島・岩礁を追加
- ミニマップに道・離島・上流の池を表示
- ランドマークを20個から26個に増加
- 火山登山リングコースを追加

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

## 主に触るファイル

### 地形・島の形

```text
data/islandData.js
```

以下を編集します。

```js
islandOutline       // 本島の外形
secondaryIslands    // 離島・岩礁
zones               // 火山・湖・町・砂浜などの領域
pathRoutes          // 道・遊歩道
landmarks           // 発見ポイント
ringCourses         // リングコース
```

### 表示・生成処理

```text
src/main.js
```

以下を編集します。

```js
heightAt(x, z)      // 地形の高さ生成
terrainColorAt()    // 地表色
addProps()          // 建物・木・風車・灯台など
addPathRoutes()     // 道路生成
drawMinimap()       // ミニマップ
```

## GitHub Pagesへの反映

このフォルダの中身を `resort_explore` の直下に上書きアップロードしてください。

```text
index.html
README.md
IMPLEMENTATION_STEPS.md
MAP_BUILD_GUIDE.md
PHASE2_REVIEW.md
data
src
```

アップロード後、以下を開いて強制更新してください。

```text
https://ninetyninekouki-ux.github.io/resort_explore/
```

Mac の強制更新:

```text
Command + Shift + R
```
