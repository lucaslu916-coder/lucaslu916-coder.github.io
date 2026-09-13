# 電子名片頁（純靜態）

自 `Lucas-Lu-Digital-Card-Builder-v1.2.1-Stable` 移植而來。
**沒有建置步驟**——改完 commit，GitHub Pages 約一分鐘後自動生效。

## 檔案

| 檔案 | 內容 |
|---|---|
| `index.html` | 頁面骨架。中文版直接寫在 HTML 裡，JS 失效時名片仍可讀、可撥號、可寄信 |
| `config.js` | **名片內容的單一真相**。姓名、職稱、機構、聯絡方式、專長，中英日三語 |
| `vcard.js` | vCard 3.0 產生器。自 v1.2.1 `lib/vcard.ts` 原樣移植 |
| `save-strategy.js` | 聯絡人交付的降級順序（見下） |
| `app.js` | 語言切換、定位、儲存聯絡人；介面用語三語表也在這裡 |
| `styles.css` | 自 v1.2.1 `app/globals.css` 移植，移除 Tailwind 依賴 |

## 改名片資料

改 `config.js` 即可，頁面與 VCF 會一起跟著變。
每個可翻譯欄位都是 `{ zh, en, ja }`，**三語缺一測試就會擋下**。

## 為什麼 Android 曾經壞掉

v1.2.1 的 `app/page.tsx` 是這樣寫的：

```js
if (isMobile && navigator.canShare?.({ files: [file] })) {
  await navigator.share({ ... });          // Android 在這裡丟例外
  return;
}
if (isMobile) { setSaveState("unsupported"); return; }   // 死路
window.location.assign(`/Lucas-Lu.vcf?...`);             // 手機永遠到不了
```

能正常運作的下載被關在 `!isMobile` 後面，所以 Android 只有兩種結局：
看到 iOS 專用的「請用 Safari 開啟」提示，或看到「無法開啟聯絡人」——兩條都沒有退路。

現在改成 `save-strategy.js` 決定的降級鏈，任何一層失敗都往下一層走：

| 裝置 | 順序 |
|---|---|
| Android／桌面 | 分享 → 下載 → 手動另存連結 |
| iOS Safari | 分享 → 手動另存連結 |
| iOS App 內建瀏覽器 | 內建瀏覽器指引 → 手動另存連結 |

使用者在分享選單自己按取消（`AbortError`）不算失敗，不會誤報錯誤。

## 已知限制：複姓

`vcard.js` 以「中文姓名第一個字為姓」拆分 vCard 的 `N` 欄位。
單姓正確（呂／建興），複姓會拆錯。目前姓名為單姓，不受影響；
若日後以本專案為他人製卡需注意。

## 測試

```
npm test
```

測的是**行為**，不是原始碼字串。v1.2.1 的 8 項測試之所以全過卻讓 Android 壞著上線，
是因為它們用正規表示式比對原始碼有沒有出現某段字，等於把當時的錯誤行為鎖成正確答案。

## 日文用語注意

日文的 `設備` 指廠房、水電、基礎設施；半導體機台一律作 **`装置`**。
測試會擋下日文內容中出現的 `設備`。
