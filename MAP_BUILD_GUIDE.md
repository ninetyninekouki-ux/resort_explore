# MAP BUILD GUIDE v0.7

## 今回の地形設計

v0.7では、ユーザー指定の空間関係を優先して再配置した。

## 座標ルール

```text
x: 東西。+x が東、-x が西
z: 南北。+z が北、-z が南
y: 高さ
```

## 重要な配置

| 要素 | 位置 | ファイル上の基準 |
|---|---|---|
| 火山 | 北〜北東 | `zones.volcano` |
| 火山西の高台 | 火山の西側 | `zones.westPlateau` |
| 高台の湖 | 高台上 | `zones.lake` |
| 城 | 高台の湖付近 | `zones.castle` |
| 森 | 高台・城・湖の周囲 | `zones.plateauForest` |
| 滝 | 湖から南側へ落下 | `zones.river`, `zones.waterfall` |
| 滝下洞窟 | 滝の麓 | `zones.fallsCave` |
| 遺跡 | 火山の北 | `zones.ruins` |
| 街 | 南側 | `zones.town` |
| 赤い橋 | 街の東 | `zones.redBridge` |
| 灯台 | 西の岬 | `zones.lighthouseCape` |
| C字砂州 | 東〜南東 | `zones.cSandbar`, `zones.cLagoon` |
| 大きな離島 | 南西の海 | `secondaryIslands.wedge_island` |

## 次に詰めるべき点

1. 公式画像を見ながら `islandOutline` の点をさらに微調整する。
2. C字型砂州の内側のラグーンをもっと広げる。
3. 火山西側の高台を階段状・棚田状にする。
4. 滝の見た目をパーティクル/半透明平面で強化する。
5. 道路を地形に沿ったカーブとして滑らかにする。
6. 家・城・灯台・橋を低ポリから専用モデルへ置き換える。
