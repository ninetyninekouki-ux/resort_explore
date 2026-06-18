# GitHubへ展開してアップロードする手順

今のリポジトリに `wuhu_clone_game.zip` だけがある場合、GitHub Pagesではゲームとして動きません。

このZIPを解凍して、以下のように **index.html がリポジトリ直下にある状態** にしてください。

```text
resort_explore/
├─ index.html
├─ README.md
├─ UPLOAD_TO_GITHUB.md
├─ data/
│  └─ landmarks.js
└─ src/
   ├─ main.js
   └─ styles.css
```

## スマホだけでやる場合

GitHubのスマホ画面ではZIP展開が難しいため、基本はMac推奨です。

どうしてもスマホでやる場合は、GitHubアプリやWeb画面で以下のファイルを1つずつ作成してください。

- `index.html`
- `src/main.js`
- `src/styles.css`
- `data/landmarks.js`
- `README.md`

## Macでやる場合

```bash
git clone https://github.com/ninetyninekouki-ux/resort_explore.git
cd resort_explore
```

このZIPを解凍し、中身を `resort_explore` フォルダの中へコピーします。

```bash
git add .
git commit -m "Add browser prototype"
git push
```

## GitHub Pages設定

1. GitHubで `resort_explore` を開く
2. `Settings` を開く
3. `Pages` を開く
4. Source: `Deploy from a branch`
5. Branch: `main`
6. Folder: `/root`
7. `Save`

数分後、公開URLが表示されます。
