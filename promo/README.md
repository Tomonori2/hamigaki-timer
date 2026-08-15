# 配布用の素材（promo/）

| ファイル | 用途 |
| --- | --- |
| `flyer.pdf` | A4チラシ。そのまま印刷して園に配れます（1ページ） |
| `flyer.html` | チラシのもと。文言や連絡先を書きかえたいときはこちらを編集 |
| `qr.png` | アプリURLのQRコード（おたより・掲示物用） |
| `kokuchi.md` | SNS・おたより・紹介メッセージの文面テンプレート |
| `demo.mp4` | 操作のデモ動画（26秒）。X・note・Instagramに添える用 |
| `demo.gif` | 完走〜スタンプ反映のハイライト（8秒）。READMEやブログの埋め込み用 |
| `ogp-source.html` | SNSカード画像（`../ogp.png`）のもと |

## 書きかえるときは

1. **連絡先**：`flyer.html` の一番下、`【ここを書きかえてください】` を差し替え
2. **URL**：公開先を変えた場合は、`flyer.html` / `ogp-source.html` / `../index.html` の og:url・og:image / `qr.png` を更新

## 素材の作り直し

チラシのPDFは、`flyer.html` をブラウザで開いて「印刷」→「PDFに保存」（用紙A4・余白なし・背景のグラフィックON）で作れます。

コマンドで作り直す場合（Node.js + Playwright、リポジトリ直下で `npx http-server -p 8899` を実行した状態で）:

```js
// flyer.pdf
const { chromium } = require('playwright');
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://127.0.0.1:8899/promo/flyer.html', { waitUntil: 'networkidle' });
await p.pdf({ path: 'promo/flyer.pdf', format: 'A4', printBackground: true,
              margin: { top:'0', bottom:'0', left:'0', right:'0' } });

// ogp.png（1200×630）
const p2 = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p2.goto('http://127.0.0.1:8899/promo/ogp-source.html');
await p2.locator('.ogp').screenshot({ path: 'ogp.png' });
```

QRコードの作り直し（Python）:

```bash
pip install qrcode pillow
python3 -c "
import qrcode
qr = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=12, border=2)
qr.add_data('https://tomonori2.github.io/hamigaki-timer/'); qr.make(fit=True)
qr.make_image(fill_color='#5a3a12', back_color='white').save('promo/qr.png')"
```

> チラシの中の画面写真は `../docs/` を参照しています。`flyer.html` 単体をメールで送ると画像が表示されないため、配るときは `flyer.pdf` を使ってください。

## デモ動画の作り直し

`promo/demo-record.js` を Playwright で実行すると webm が録画されます。MP4／GIF への変換は ffmpeg で:

```bash
# MP4（X・note用）
ffmpeg -ss 19 -i video/xxx.webm -vf "setpts=PTS/1.5,scale=720:-2:flags=lanczos,fps=30" \
  -c:v libx264 -pix_fmt yuv420p -crf 23 -movflags +faststart promo/demo.mp4

# GIF（README埋め込み用・ハイライトだけ）
ffmpeg -ss 16.5 -t 8 -i promo/demo.mp4 \
  -vf "fps=12,scale=340:-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse" \
  -loop 0 promo/demo.gif
```
