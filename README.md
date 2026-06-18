# resort_explore

ブラウザで動く、リゾート島ジェットパック探索ゲームのプロトタイプです。

## 目的

- GitHub Pagesで直接公開できる状態にする
- 島をジェットパックで探索できるようにする
- 火山、湖、町、灯台、風車、ビーチ、小島などのランドマークを配置する
- ランドマーク発見、リング通過、ミニマップ、燃料ゲージを実装する

## ファイル構成

```text
index.html
README.md
UPLOAD_TO_GITHUB.md
data/
  landmarks.js
src/
  main.js
  styles.css
```

## ローカルで動かす方法

### Mac / Windows 共通

このフォルダで以下を実行します。

```bash
python3 -m http.server 5173
```

ブラウザで開きます。

```text
http://localhost:5173
```

Node.jsがある場合は以下でも動きます。

```bash
npx serve .
```

## GitHub Pagesで公開する方法

1. このZIPを解凍します。
2. 中身をGitHubリポジトリ `resort_explore` の直下にアップロードします。
3. `index.html` がリポジトリ直下にあることを確認します。
4. GitHubで `Settings` → `Pages` を開きます。
5. `Build and deployment` を `Deploy from a branch` にします。
6. Branchを `main`、Folderを `/root` にします。
7. Saveを押します。
8. 数分後、GitHub PagesのURLが表示されます。

## 操作

| 操作 | 内容 |
|---|---|
| クリック / タップ | 開始 |
| マウス移動 | 視点操作 |
| W/A/S/D | 移動 |
| Space | 上昇 |
| Shift | 下降 |
| E | ブースト |

スマホでは画面下に簡易ボタンが表示されます。

## 注意

これは既存作品の完全再現ではなく、構造を参考にしたオリジナル実装用プロトタイプです。公開時は地名、島の形、BGM、キャラクター、UIなどをオリジナル化してください。
