# 對外 QR Code

全部指向**永久入口** `https://lucaslu916-coder.github.io/`，與 NFC 標籤同一個網址。
只要這個網址不變，**這些檔案就永遠不需要重新產生**——換名片內容、換平台、換網域都不用。

| 檔案 | 用途 |
|---|---|
| `site-qr.svg` | **印刷首選**。向量檔，放大縮小都不會糊 |
| `site-qr-print.png` | 高解析點陣（1800px），送印時對方不收 SVG 才用 |
| `site-qr.png` | 900px，螢幕、簡報、電子檔用 |

規格：QR 版本 5（37×37 模組）、**H 級容錯（30%）**、四周 4 格留白。

## 印刷注意

- **四周留白不可裁掉。** 實測把留白裁掉後掃不出來——定位點需要周邊淨空。
- 成品建議至少 **2.5 公分見方**。已實測 2.5cm ＠300dpi 可正常辨識，加上列印雜訊、歪斜 45 度仍可讀。
- 不要在 QR 上壓字或放 logo。H 級容錯雖然容得下，但沒有必要冒險。
- 深色必須夠深、底色必須夠淺，不要用反白或低對比配色。

## 重新產生

只有在**永久入口網址本身改變**時才需要（例如日後改用自有網域）：

```bash
python3 -c "
import segno
qr = segno.make('https://lucaslu916-coder.github.io/', error='h')
qr.save('site-qr.svg', kind='svg', scale=10, border=4, unit='mm')
qr.save('site-qr-print.png', scale=48, border=4)
qr.save('site-qr.png', scale=24, border=4)
"
```

產生後**務必實際掃描驗證**，不要只相信產生器。
