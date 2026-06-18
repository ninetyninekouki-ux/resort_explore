# Resort Explore v0.7

Wuhu Island 風のジェットパック探索プロトタイプです。

## v0.7 の主な変更

- 東西反転の修正方針を反映
- 参照マップの形に合わせ、C字型の砂州を東〜南東側に追加
- 火山の西側に高台を追加
- 高台に湖、城、森を配置
- 高台湖から滝が流れ落ちる導線を追加
- 滝の麓に洞窟を追加
- 火山北側に遺跡を配置
- 南西の海に大きな離島を配置
- 街から東へすぐ赤い橋がある構成に変更
- 街、赤い橋、灯台、火山北、東半島を通る島一周道路を追加
- 家、海、草原、屋根、岩の簡易プロシージャルテクスチャを追加

## アップロード方法

このフォルダの中身を GitHub リポジトリ `resort_explore` の直下に上書きアップロードしてください。

```text
index.html
README.md
IMPLEMENTATION_STEPS.md
MAP_BUILD_GUIDE.md
PHASE2_REVIEW.md
data/
src/
```

アップロード後、GitHub Pages を開き、`Command + Shift + R` で強制更新してください。

## 重要ファイル

```text
data/islandData.js   地形・輪郭・ランドマーク・道路・リング
src/main.js          Three.js描画、地形生成、操作、ミニマップ
src/styles.css       HUD/UI
```
