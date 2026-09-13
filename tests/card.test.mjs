import test from "node:test";
import assert from "node:assert/strict";
import { deliveryPlan } from "../card/save-strategy.js";
import { buildVCard } from "../card/vcard.js";
import { card } from "../card/config.js";

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
