import test from "node:test";
import assert from "node:assert/strict";
import { deliveryPlan } from "../card/save-strategy.js";
import { buildVCard } from "../card/vcard.js";
import { card } from "../card/config.js";
import { readFileSync } from "node:fs";

const DEVICES = [
  { name: "Android Chrome（可分享）",   canShareFiles: true,  isIOS: false },
  { name: "Android 舊版（不可分享）",   canShareFiles: false, isIOS: false },
  { name: "iOS Safari（可分享）",       canShareFiles: true,  isIOS: true  },
  { name: "iOS App 內建瀏覽器",         canShareFiles: false, isIOS: true  },
  { name: "桌面瀏覽器",                 canShareFiles: false, isIOS: false },
];

/* ── 交付策略：v1.2.1 的 Android bug 就發生在這裡 ── */

test("分享永遠不是死路：每種裝置在分享之後都還有後續步驟", () => {
  for (const d of DEVICES) {
    const plan = deliveryPlan(d);
    const i = plan.indexOf("share");
    if (i !== -1) {
      assert.ok(i < plan.length - 1, `${d.name}：share 之後沒有退路 → ${plan.join(" → ")}`);
    }
  }
});

test("每種裝置最後都保有手動另存連結", () => {
  for (const d of DEVICES) {
    assert.equal(deliveryPlan(d).at(-1), "manual-link", `${d.name} 缺少最終退路`);
  }
});

test("Android 可分享時，分享失敗後必須落到一般下載（v1.2.1 回歸測試）", () => {
  // 舊版把 window.location.assign('/Lucas-Lu.vcf') 關在 !isMobile 後面，
  // Android 分享一失敗就顯示「無法開啟聯絡人」而毫無退路。
  assert.deepEqual(
    deliveryPlan({ canShareFiles: true, isIOS: false }),
    ["share", "download", "manual-link"],
  );
});

test("Android 不該看到 iOS 專用的 Safari 指南針指引", () => {
  for (const d of DEVICES.filter((x) => !x.isIOS)) {
    assert.ok(
      !deliveryPlan(d).includes("ios-in-app-guidance"),
      `${d.name} 出現了 iOS 專用指引`,
    );
  }
});

test("iOS 無法分享時給 App 內建瀏覽器指引，而不是註定失敗的下載", () => {
  assert.deepEqual(
    deliveryPlan({ canShareFiles: false, isIOS: true }),
    ["ios-in-app-guidance", "manual-link"],
  );
});

test("桌面瀏覽器直接走下載", () => {
  assert.deepEqual(
    deliveryPlan({ canShareFiles: false, isIOS: false }),
    ["download", "manual-link"],
  );
});

test("iOS 未填相識資訊時走靜態 .vcf，可直接跳出聯絡人卡片（2026-09-14 雙平台實測）", () => {
  assert.deepEqual(
    deliveryPlan({ canShareFiles: true, isIOS: true, hasMemoryFields: false }),
    ["direct-vcf", "share", "ios-in-app-guidance", "manual-link"],
  );
});

test("填了相識資訊就不得走靜態 .vcf——那個檔帶不動時間／場合／GPS", () => {
  for (const d of DEVICES) {
    const plan = deliveryPlan({ ...d, hasMemoryFields: true });
    assert.ok(!plan.includes("direct-vcf"), `${d.name}：有填資料卻走了靜態檔，內容會遺失`);
  }
});

test("Android 不得走靜態 .vcf——實測一律變成下載，沒有直接開啟聯絡人的路", () => {
  for (const d of DEVICES.filter((x) => !x.isIOS)) {
    for (const mem of [true, false]) {
      assert.ok(
        !deliveryPlan({ ...d, hasMemoryFields: mem }).includes("direct-vcf"),
        `${d.name} 出現了 direct-vcf`,
      );
    }
  }
});

test("iOS App 內建瀏覽器不得走靜態 .vcf——它連導航都會失敗且毫無回饋", () => {
  assert.ok(
    !deliveryPlan({ canShareFiles: false, isIOS: true, hasMemoryFields: false })
      .includes("direct-vcf"),
  );
});

/* ── vCard 格式 ── */

const AT = new Date("2026-09-13T08:00:00.000Z");

test("產出 vCard 3.0，CRLF 換行、無 UTF-8 BOM", () => {
  const v = buildVCard({ language: "zh", timestamp: AT });
  assert.ok(v.startsWith("BEGIN:VCARD\r\n"));
  assert.ok(v.includes("VERSION:3.0\r\n"));
  assert.ok(v.trimEnd().endsWith("END:VCARD"));
  assert.ok(!v.includes("﻿"));
  assert.ok(!/[^\r]\n/.test(v), "出現了沒有搭配 CR 的 LF");
});

test("每一行都不超過 RFC 2426 的 75 位元組上限", () => {
  for (const lang of ["zh", "en", "ja"]) {
    const v = buildVCard({
      language: lang, timestamp: AT,
      occasion: "先進封裝技術論壇 Advanced Packaging Forum",
      note: "討論矽光子與 AI 檢測導入",
      latitude: 24.7361, longitude: 121.0897,
    });
    for (const line of v.split("\r\n")) {
      const bytes = Buffer.byteLength(line, "utf8");
      assert.ok(bytes <= 75, `${lang}：有一行 ${bytes} 位元組 → ${line}`);
    }
  }
});

test("使用已確認的正式辦公地址", () => {
  const v = buildVCard({ language: "zh", timestamp: AT });
  assert.ok(v.replace(/\r\n /g, "").includes("中興路四段195號10館2樓208室"));
  assert.ok(!v.includes("10館3樓302室"));
});

test("三語的相識紀錄各自使用正確標籤與日期格式", () => {
  const flat = (lang) => buildVCard({
    language: lang, timestamp: AT, occasion: "SEMICON",
  }).replace(/\r\n /g, "");

  assert.ok(flat("zh").includes("相識時間：2026年9月13日"));
  // RFC 2426 要求 TEXT 值中的逗號跳脫為 \, ——英文長日期含逗號，故應為跳脫後的形式
  assert.ok(flat("en").includes("Meeting time：September 13\\, 2026"));
  assert.ok(flat("ja").includes("名刺交換日時：2026年9月13日"));
  assert.ok(flat("ja").includes("出会った場面：SEMICON"));
});

test("日文版職稱使用上席研究員", () => {
  assert.ok(buildVCard({ language: "ja", timestamp: AT }).includes("上席研究員"));
  assert.ok(buildVCard({ language: "zh", timestamp: AT }).includes("資深研究員"));
});

test("未填寫的選填欄位不會留下空標籤", () => {
  const v = buildVCard({ language: "zh", timestamp: AT }).replace(/\r\n /g, "");
  assert.ok(!v.includes("相識場合"));
  assert.ok(!v.includes("交流備註"));
  assert.ok(!v.includes("Google Maps"));
});

test("有座標時才附上位置與 Google Maps 連結", () => {
  const v = buildVCard({
    language: "zh", timestamp: AT, latitude: 24.7361, longitude: 121.0897,
  }).replace(/\r\n /g, "");
  // 逗號依 RFC 2426 跳脫；通訊錄 App 讀入時會還原成一般逗號
  assert.ok(v.includes("相識位置：24.736100\\, 121.089700"));
  assert.ok(v.includes("https://www.google.com/maps?q=24.7361\\,121.0897"));
  assert.ok(!/[^\\],/.test(v.split("NOTE;")[1] ?? ""), "NOTE 內出現未跳脫的逗號");
});

test("拒絕定位仍能產生完整 vCard", () => {
  const v = buildVCard({ language: "ja", timestamp: AT, latitude: null, longitude: null });
  assert.ok(v.includes("BEGIN:VCARD") && v.includes("END:VCARD"));
  assert.ok(!v.includes("Google Maps"));
});

test("靜態 Lucas-Lu.vcf 與 config.js 同步（改了聯絡資料卻忘記重新產生會被擋下）", () => {
  const committed = readFileSync(new URL("../card/Lucas-Lu.vcf", import.meta.url), "utf8");
  const expected = buildVCard({
    language: "zh",
    timestamp: new Date("2026-09-14T00:00:00.000Z"),
    includeMemory: false,
  });
  // REV 是產生當下的時戳，重新產生必然不同，比對時略過
  const stripRev = (v) => v.split("\r\n").filter((l) => !l.startsWith("REV:")).join("\r\n");
  assert.equal(stripRev(committed), stripRev(expected),
    "card/Lucas-Lu.vcf 已過期。請重新產生：見 card/README.md");
});

test("靜態 .vcf 不含相識紀錄欄位", () => {
  const committed = readFileSync(new URL("../card/Lucas-Lu.vcf", import.meta.url), "utf8");
  assert.ok(!committed.includes("NOTE"), "靜態檔不該有 NOTE——它塞不進即時資訊");
});

/* ── 內容設定的結構完整性 ── */

test("每個可翻譯欄位都齊備中英日三語（新增內容時漏翻會被擋下）", () => {
  const missing = [];
  const walk = (node, path) => {
    if (node === null || typeof node !== "object") return;
    if (typeof node.zh === "string") {
      for (const lang of ["zh", "en", "ja"]) {
        if (typeof node[lang] !== "string" || !node[lang].trim()) missing.push(`${path}.${lang}`);
      }
      return;
    }
    if (Array.isArray(node.zh)) {
      for (const lang of ["zh", "en", "ja"]) {
        if (!Array.isArray(node[lang]) || node[lang].length === 0) missing.push(`${path}.${lang}`);
      }
      return;
    }
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
  };
  walk(card.person, "person");
  walk(card.expertise, "expertise");
  assert.deepEqual(missing, [], `缺少翻譯：${missing.join(", ")}`);
});

test("日文不得把半導體機台誤譯為「設備」（日文的設備指廠房水電）", () => {
  const jaText = [
    card.person.domain.ja,
    card.expertise.heading.ja,
    card.expertise.bio.ja,
    card.expertise.advisory.ja,
    ...card.expertise.items.map((i) => i.ja),
  ].join(" ");
  assert.ok(!jaText.includes("設備"), "日文內容出現「設備」，半導體機台應作「装置」");
  assert.ok(jaText.includes("装置"), "日文內容應使用「装置」");
});

/* ── 紙本名片翻卡 ── */

const paper = card.assets.paperCard;
const readCard = (f) => readFileSync(new URL(`../card/${f}`, import.meta.url), "utf8");

test("紙本名片的四個圖檔都在 repo 裡（兩面 × WebP＋JPEG 後備）", () => {
  for (const face of [paper.front, paper.back]) {
    for (const file of [face.webp, face.jpg]) {
      const bytes = readFileSync(new URL(`../card/${file}`, import.meta.url)).length;
      assert.ok(bytes > 1000, `card/${file} 不存在或過小`);
    }
  }
});

test("圖上印的資料與 config.js 同步（改了聯絡資訊卻忘記重掃名片會被擋下）", () => {
  // 名片圖是點陣檔，不會跟著 config.js 變——與靜態 Lucas-Lu.vcf 同一類問題，
  // 所以用同一套防呆：config 改了、printed 沒跟著改，這裡就失敗。
  const hint = "紙本名片圖已過期。請重掃名片並更新 card/config.js 的 assets.paperCard.printed";
  assert.equal(paper.printed.titleZh, card.person.title.zh, hint);
  assert.equal(paper.printed.titleEn, card.person.title.en, hint);
  assert.equal(paper.printed.phone, card.person.phone.display, hint);
  assert.equal(paper.printed.email, card.person.email, hint);
  assert.equal(paper.printed.address, card.vcard.address[2], hint);
});

test("index.html 引用的檔名與 config.js 宣告的一致", () => {
  const html = readCard("index.html");
  for (const file of [paper.front.webp, paper.front.jpg, paper.back.webp, paper.back.jpg]) {
    assert.ok(html.includes(file), `index.html 沒有引用 ${file}`);
  }
});

test("圖片標好尺寸，避免載入時版面跳動", () => {
  const html = readCard("index.html");
  assert.ok(html.includes(`width="${paper.width}" height="${paper.height}"`),
    "紙本名片的 <img> 缺少與 config 一致的 width/height");
});

test("紙本名片的介面用語齊備中英日三語", () => {
  const app = readCard("app.js");
  const keys = ["paperStep", "paperFrontAlt", "paperBackAlt",
                "paperShowingFront", "paperShowingBack", "paperFlipToBack", "paperFlipToFront"];
  for (const key of keys) {
    const hits = app.split(`${key}:`).length - 1;
    assert.equal(hits, 3, `${key} 應在 zh／en／ja 各出現一次，實際 ${hits} 次`);
  }
});

test("JS 失效時中文正面仍然看得到（不預設藏起來）", () => {
  const html = readCard("index.html");
  const section = html.split('class="paper-card"')[1].split("</section>")[0];
  assert.ok(!/id="paper-front"[^>]*\shidden/.test(section), "正面被預設隱藏了，JS 失效就什麼都看不到");
  assert.ok(section.includes('aria-pressed="false"'), "翻卡初始狀態應為正面");
});

test("翻卡一次只有一面在排版中（2026-09-22 真機 regression）", () => {
  // 初版用 transform-style: preserve-3d 把兩面疊在一起，真機上 3D 失效後
  // 兩面都落回普通排版、疊成一長條。現在改成另一面掛 hidden，完全不參與版面。
  const section = readCard("index.html").split('class="paper-card"')[1].split("</section>")[0];
  const faces = section.match(/<picture[^>]*class="paper-face"[^>]*>/g) ?? [];
  assert.equal(faces.length, 2, "應有正反兩面");
  const visible = faces.filter((f) => !/\shidden/.test(f));
  assert.equal(visible.length, 1, `同時有 ${visible.length} 面在排版中，會疊成一長條`);
  assert.ok(/id="paper-front"/.test(visible[0]), "預設露出的應是中文正面");
});

test("版面不得交給 3D 決定：preserve-3d 與絕對定位堆疊在真機上壞過一次", () => {
  // 擋的是「讓 3D 決定兩面會不會分開」這件事，不是擋動畫。
  // rotateY 作用在當下唯一在排版中的那一面，壞掉只是沒動畫，版面不受影響。
  const css = readCard("styles.css");
  // 剝掉註解——說明為什麼不這樣做的那段文字本身會提到這些關鍵字
  const paperCss = css.slice(css.indexOf("/* 紙本名片翻卡")).replace(/\/\*[\s\S]*?\*\//g, "");
  for (const banned of ["preserve-3d", "backface-visibility"]) {
    assert.ok(!paperCss.includes(banned), `紙本名片樣式又出現 ${banned}`);
  }
  assert.ok(!/position:\s*absolute/.test(paperCss),
    "名片面又被絕對定位——兩面就可能同時佔版面");
});

test("紙本名片區塊仍有可及名稱，且不重複同一句話", () => {
  // 原本的 h2「這張名片的紙本」只是把眉標再講一次（英文版更是逐字重複
  // PRINTED CARD / The printed card），拿掉後區塊名稱改由眉標承擔。
  const html = readCard("index.html");
  const section = html.split('class="paper-card"')[1].split("</section>")[0];
  const labelledBy = /aria-labelledby="([^"]+)"/.exec(
    html.slice(html.indexOf('<section class="paper-card"')),
  )?.[1];
  assert.ok(labelledBy, "區塊沒有 aria-labelledby，螢幕閱讀器讀不出名稱");
  assert.ok(new RegExp(`id="${labelledBy}"`).test(section),
    `aria-labelledby 指向 ${labelledBy}，但區塊內沒有這個 id`);
  assert.ok(!/<h2/.test(section), "又出現了與眉標重複的標題");
});

test("翻面動畫有退路：不支援或使用者要求減少動態時直接切換", () => {
  const app = readCard("app.js");
  assert.ok(app.includes("prefers-reduced-motion"), "沒有尊重 prefers-reduced-motion");
  // 動畫路徑之外必須存在「直接設定並 render」的分支
  const fn = app.slice(app.indexOf("function setPaperFace"), app.indexOf("HALF_TURN_MS);"));
  const direct = fn.split("paperBack = next; render(); return;").length - 1;
  assert.ok(direct >= 2, `直接切換的退路只有 ${direct} 條，動畫失效時會卡住`);
});

test("名片圖用 height:auto，不會被壓扁變形", () => {
  const css = readCard("styles.css");
  const rule = css.slice(css.indexOf(".paper-face img"), css.indexOf(".paper-hint"));
  assert.ok(/height:\s*auto/.test(rule), "沒有 height:auto，圖片可能被容器壓扁");
  assert.ok(!/object-fit/.test(rule), "object-fit 會在容器比例不符時裁切名片內容");
});

/* ── LINE QR Code ── */

// 純 node 讀 JPEG 尺寸：掃到 SOF 標記後取出高寬
function jpegSize(buf) {
  let i = 2; // 跳過 SOI
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i += 1; continue; }
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error("找不到 JPEG 的 SOF 標記");
}

test("QR 圖片不得加圓角——角落是定位點，圓角會把它啃掉", () => {
  // 2026-09-22：`.line-qr img` 原本有 border-radius: 9px，而這張 QR 的留白
  // 只有約 1 模組，換算到顯示尺寸僅 3.9px，9px 的圓角直接切進三個角的定位點。
  const css = readCard("styles.css");
  const rule = css.slice(css.indexOf(".line-qr img"), css.indexOf(".memory"));
  assert.ok(!/border-radius/.test(rule),
    "QR 圖片又被加上 border-radius，角落定位點會被切掉");
});

test("index.html 宣告的 QR 尺寸與實際檔案相符", () => {
  const { width, height } = jpegSize(
    readFileSync(new URL("../card/line-qr.jpg", import.meta.url)),
  );
  const html = readCard("index.html");
  const tag = /<img src="line-qr\.jpg"[^>]*>/.exec(html)?.[0] ?? "";
  assert.ok(tag.includes(`width="${width}"`) && tag.includes(`height="${height}"`),
    `QR 實際為 ${width}×${height}，但 index.html 宣告的不是——換圖後忘了改尺寸會造成版面跳動`);
  assert.equal(width, height, "QR 應為正方形");
});
