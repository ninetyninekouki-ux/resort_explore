# Implementation Steps v0.7

## GitHub反映手順

1. ZIPを解凍
2. 中身を `resort_explore` の直下へアップロード
3. 既存ファイルは上書き
4. Commit changes
5. GitHub Pagesを `Command + Shift + R` で強制更新

## 確認項目

- タイトルが `RESORT EXPLORE v0.7` になっている
- C字型砂州が東〜南東に見える
- 火山西側に高台・湖・城・森がある
- 湖から滝筋が見える
- 滝下に洞窟がある
- 火山北に遺跡がある
- 南西に大きな離島がある
- 街の東に赤い橋がある
- 島一周道路が通っている
- 草原、砂浜、屋根、壁、水にノイズテクスチャが乗っている

## 失敗時の確認

- `data/islandData.js` がv0.7のものか
- `src/main.js` がv0.7のものか
- ブラウザキャッシュを強制更新したか
- GitHub Pagesの反映に数分待ったか
