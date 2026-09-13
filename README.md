# 電子名片｜永久入口轉址層

這個 repo 只有一個用途：提供一個**永遠不會變的網址**，讓 NFC 標籤與對外 QR Code 指向它，
再由它轉往當時實際使用的名片網站。

```
NFC / QR  →  https://lucaslu916-coder.github.io/  →  目前的名片網站
             （永不變更，已印出去的都靠它）          （想換就換）
```

## 為什麼需要這一層

名片網站目前掛在 ChatGPT Sites 的平台子網域（`*.chatgpt.site`），那串網址是平台配發的，
本專案無法控制。一旦 NFC 貼紙貼出去、QR 印在紙本名片上，網址就凍結了——但決定它還能不能用的人不是我們。

隔一層自己控制的網址之後，換平台只需要改這裡一行，**所有已經發出去的名片與標籤全部自動生效**。

## 怎麼換目標網站

改 `index.html` 裡的兩個地方，兩處必須一致：

1. `<meta http-equiv="refresh" content="0; url=...">`（也順手更新上面的 `<link rel="canonical">`）
2. JS 裡的 `var TARGET = "...";`

commit 後 GitHub Pages 會自動重新發布，約 1 分鐘生效。
**不需要**重寫 NFC、不需要重印 QR Code。

## 之後如果買了自有網域

把網域 301 指到這個網址即可，或在本 repo 加 `CNAME` 檔改由網域直接服務。
兩種做法都不需要重寫已發出的標籤。

## 設計說明

轉址採三重保險，任何一層失效都還能到達目的地：

1. `<meta http-equiv="refresh">` — 不依賴 JavaScript
2. `location.replace()` — 不留下歷史紀錄，使用者按「上一頁」不會被彈回來
3. 畫面上的手動按鈕 — 前兩者都被擋時的最後退路

網址的 query string 與 hash 會一併帶到目標站，所以日後可以做來源追蹤
（例如 NFC 寫 `?src=nfc`、紙本 QR 寫 `?src=card`，就能分辨掃描來源）。

## 名片頁本體

`card/` 目錄放的是名片頁本身（純靜態，中英日三語）。
目前轉址仍指向 ChatGPT Sites 的舊版；新版驗證完成後，把 `index.html` 的
`TARGET` 改成 `https://lucaslu916-coder.github.io/card/` 即可切換，
**NFC 標籤與已印出的 QR Code 完全不需要變動**。

## 授權

**著作權所有，保留一切權利。** 見 [`LICENSE`](LICENSE)。

本儲存庫公開僅因 GitHub Pages 免費方案的技術要求，**不構成任何授權**。
ITRI 標誌為工業技術研究院商標，不在本著作權利範圍內。

## 相關文件

完整專案脈絡、NFC 寫入指南與發布檢查清單，見 Notion
「🪪 NFC／QR 電子名片專案｜製作流程與維護手冊」。
