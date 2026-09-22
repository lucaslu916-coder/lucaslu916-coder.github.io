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
| `card-front-zh.*` | 紙本名片中文面（正面）。WebP 為主、JPEG 為後備 |
| `card-back-en.*` | 紙本名片英文面（背面） |

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

## 儲存聯絡人怎麼分流

按下按鈕後，`save-strategy.js` 依「裝置」與「有沒有填相識資訊」決定順序：

| 情況 | 順序 |
|---|---|
| **iOS Safari・沒填相識資訊** | **導航到靜態 `Lucas-Lu.vcf` → 直接跳出聯絡人卡片** → 分享 → 手動連結 |
| iOS Safari・有填 | 分享（才帶得到時間／場合／GPS） → 手動連結 |
| iOS App 內建瀏覽器 | 內建瀏覽器指引 → 手動連結 |
| Android／桌面 | 分享 → 下載 → 手動連結 |

這些順序不是推論出來的，是 2026-09-14 用 iPhone 與 Android 實機逐項測出來的：

- iOS 導航到同網域 `.vcf`，Safari 直接顯示聯絡人卡片，比分享選單少一步
- **Android 三種導航方式一律變成下載，`intent://` 完全沒反應**——
  平台沒有開放讓網頁直接開啟新增聯絡人的介面，只能走下載，這點無法改善
- iOS App 內建瀏覽器連導航都會失敗，所以用 `canShare` 判斷是否為 Safari

## 更新聯絡資料後要重新產生靜態 .vcf

`Lucas-Lu.vcf` 是預先產生的檔案，**不會自動跟著 `config.js` 變**。
改了姓名、電話、Email、地址之後執行：

```bash
node --input-type=module -e "
import {buildVCard} from './card/vcard.js';
import {writeFileSync} from 'node:fs';
writeFileSync('card/Lucas-Lu.vcf', buildVCard({
  language:'zh', timestamp:new Date(), includeMemory:false }));
"
```

忘記重新產生時 `npm test` 會失敗並提示——不會默默送出過期的聯絡資料。

## 紙本名片翻卡

頁面下半部放了紙本名片的掃描圖，可點一下翻面。**語言切換時會自動翻到對應面**：
中文介面顯示中文面，英文與日文介面顯示英文面——沒有日文名片，而英文面的
羅馬字姓名與地址對日本訪客比中文面實用。JS 失效時仍看得到中文正面，只是不能翻。

檔案在 `config.js` 的 `assets.paperCard` 宣告，圖檔與 `line-qr.jpg` 同層。

### 更新聯絡資料後也要重掃紙本名片

名片圖是點陣檔，**不會跟著 `config.js` 變**——與靜態 `Lucas-Lu.vcf` 完全同一類問題。
所以用同一套防呆：`config.js` 裡 `assets.paperCard.printed` 記著圖上實際印的資料，
`npm test` 會比對它與 `person` 的對應欄位。改了職稱、電話、Email 或地址卻沒重掃名片，
測試就會失敗並指出要更新哪裡。

重新製作時：掃描正反面 → 裁到卡片實際邊界（掃描器會留灰邊）→ 匯出 1057×634 的
WebP（quality 82）與 JPEG（quality 88）→ 覆蓋 `card/` 下的四個檔 →
更新 `printed` → `npm test`。

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
