# 実装手順

## Phase 0: 上書き配置

1. `resort_explore_wuhu_v03.zip` を解凍
2. 中身をGitHubの `resort_explore` 直下へアップロード
3. 既存の `index.html`、`src/`、`data/` は上書き
4. GitHub Pages URLを開く
5. ブラウザを強制更新

Mac:

```text
Command + Shift + R
```

## Phase 1: 操作とミニマップ確認

確認項目:

- Aで左、Dで右に動く
- Spaceを押すと上昇する
- Spaceを離すと自由落下する
- Eキーを押さなくても速度が十分出る
- ミニマップ上の矢印が進行方向を向く
- 町、火山、湖、灯台、風車の位置が大きくずれていない

修正対象ファイル:

```text
src/main.js
```

主な調整値:

```js
playerState.moveAccel
playerState.maxMoveSpeed
playerState.verticalThrust
playerState.gravity
playerState.drag
playerState.cameraDistance
playerState.cameraHeight
```

## Phase 2: 島の形を詰める

修正対象:

```text
data/islandData.js
```

最初に調整する配列:

```js
islandOutline
zones
landmarks
```

調整方針:

1. 公式マップを横に開く
2. 火山、湖、町、灯台、風車の位置関係を見る
3. `islandOutline` の点を少しずつ動かす
4. `zones` の中心座標と半径を調整
5. GitHub Pagesに上書きして確認

## Phase 3: 景観密度を上げる

追加対象:

- 町の建物バリエーション
- 桟橋・道路・広場
- ヤシの木・森林
- 火山の岩肌
- 滝の粒子表現
- 灯台のライト回転
- 風車のブレード回転
- 海食洞や岩アーチ

修正対象:

```text
src/main.js
```

関数:

```js
addProps()
addHouse()
addTree()
addWindmill()
addLighthouse()
addBridge()
```

## Phase 4: 遊びを追加

追加ファイル候補:

```text
data/challenges.js
data/balloons.js
src/challengeSystem.js
src/collectibleSystem.js
```

機能:

- リングチャレンジ
- バルーン収集
- タイムアタック
- 昼・夕方・夜の切り替え
- 解禁要素

