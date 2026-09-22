import { card } from "./config.js";
import { buildVCard } from "./vcard.js";
import { deliveryPlan } from "./save-strategy.js";

/* ────────────────────────────────────────────────────────────
   介面文字（三語）。名片內容在 config.js，這裡只放介面用語。
   ──────────────────────────────────────────────────────────── */
const UI = {
  zh: {
    htmlLang: "zh-Hant", langAria: "語言切換",
    phone: "電話", website: "網站", research: "產業研究",
    contactAria: "聯絡方式", expertiseAria: "核心專長",
    portraitAlt: "呂建興 Lucas Lu 個人照片",
    lineTitle: "加入 Lucas Lu 為好友",
    lineDesc: "點擊按鈕直接開啟 LINE，或使用另一支手機掃描 QR Code。",
    lineButton: "開啟 LINE 加好友",
    lineQrAria: "開啟 LINE 加入 Lucas Lu 為好友",
    saveStep: "儲存名片", memoryTitle: "留下這次相識的線索",
    memoryIntro: "以下資料只用於即時產生聯絡人檔案，不建立資料庫紀錄，也不會提供給 Lucas Lu。",
    occasion: "相識場合", note: "交流備註", optional: "選填",
    occasionPlaceholder: "例如：先進製造技術論壇",
    notePlaceholder: "例如：討論智慧製造與產業合作",
    locationTitle: "相識地點",
    locationHint: "選填，只用於即時產生 VCF，不建立資料庫紀錄",
    locationLoading: "正在取得位置…",
    locationDenied: "未取得位置（仍可儲存名片）",
    locationAdd: "加入目前位置", locationUpdate: "重新定位",
    saveButton: "儲存 Lucas Lu 到聯絡人", saveOpening: "正在開啟聯絡人…",
    footDefault: "手機會先開啟分享選單；請選擇「聯絡人」。若沒有此選項，可先「儲存到檔案」再開啟 VCF。",
    footDownloaded: "已下載 Lucas-Lu.vcf，開啟該檔案即可加入聯絡人。",
    footIosInApp: "此 App 內建瀏覽器不支援分享聯絡人檔案。請點右下角的指南針圖示，以 Safari 開啟本頁後再試一次。",
    footError: "無法自動開啟聯絡人。請長按下方連結另存檔案，再點開它加入通訊錄。",
    manual: "長按這裡另存聯絡人檔案",
    resultTitle: "已下載 Lucas-Lu.vcf",
    resultBody: "檔案已存到手機的「下載」資料夾。點下方按鈕開啟它，手機就會問你要不要加入聯絡人。",
    resultAction: "開啟檔案並加入聯絡人",
    shareTitle: "呂建興 Lucas Lu 聯絡人名片",
    paperStep: "紙本名片", paperTitle: "這張名片的紙本",
    paperFrontAlt: "呂建興 工業技術研究院 產業科技國際策略發展所 資深研究員，中文名片正面",
    paperBackAlt: "Lucas Lu, Senior Researcher, Industrial Technology Research Institute — English side of the card",
    paperShowingFront: "點一下翻面 · 目前顯示中文面",
    paperShowingBack: "點一下翻面 · 目前顯示英文面",
    paperFlipToBack: "翻面檢視英文面", paperFlipToFront: "翻面檢視中文面",
  },
  en: {
    htmlLang: "en", langAria: "Language",
    phone: "Phone", website: "Website", research: "Research",
    contactAria: "Contact details", expertiseAria: "Core expertise",
    portraitAlt: "Portrait of Lucas Lu",
    lineTitle: "Connect with Lucas Lu on LINE",
    lineDesc: "Tap the button to open LINE, or scan the QR code with another device.",
    lineButton: "Add on LINE",
    lineQrAria: "Open LINE to connect with Lucas Lu",
    saveStep: "SAVE CONTACT", memoryTitle: "Remember where we met",
    memoryIntro: "These details are used only to generate your contact file. No database record is created or shared with Lucas Lu.",
    occasion: "Occasion", note: "Notes", optional: "Optional",
    occasionPlaceholder: "e.g. Advanced Manufacturing Forum",
    notePlaceholder: "e.g. Discussed smart manufacturing collaboration",
    locationTitle: "Meeting location",
    locationHint: "Optional. Used only to generate the vCard; no database record is created.",
    locationLoading: "Getting your location…",
    locationDenied: "Location unavailable (you can still save the contact)",
    locationAdd: "Add current location", locationUpdate: "Update location",
    saveButton: "Save Lucas Lu to Contacts", saveOpening: "Opening contact…",
    footDefault: "On mobile, choose Contacts in the share sheet. If it is unavailable, save the VCF to Files and open it.",
    footDownloaded: "Lucas-Lu.vcf has been downloaded. Open the file to add the contact.",
    footIosInApp: "This in-app browser cannot share contact files. Tap the compass icon at the bottom right to open this page in Safari, then try again.",
    footError: "Could not open the contact automatically. Long-press the link below to save the file, then open it.",
    manual: "Long-press here to save the contact file",
    resultTitle: "Lucas-Lu.vcf downloaded",
    resultBody: "The file is in your Downloads folder. Open it below and your phone will offer to add the contact.",
    resultAction: "Open the file to add the contact",
    shareTitle: "Contact card for Lucas Lu",
    paperStep: "PRINTED CARD", paperTitle: "The printed card",
    paperFrontAlt: "Chinese side of Lucas Lu's ITRI business card",
    paperBackAlt: "English side of Lucas Lu's ITRI business card",
    paperShowingFront: "Tap to flip · showing the Chinese side",
    paperShowingBack: "Tap to flip · showing the English side",
    paperFlipToBack: "Flip to the English side", paperFlipToFront: "Flip to the Chinese side",
  },
  ja: {
    htmlLang: "ja", langAria: "言語切り替え",
    phone: "電話", website: "サイト", research: "リサーチ",
    contactAria: "連絡先", expertiseAria: "専門分野",
    portraitAlt: "Lucas Lu（呂建興）の顔写真",
    lineTitle: "LINE で友だち追加",
    lineDesc: "ボタンをタップして LINE を開くか、別の端末で QR コードを読み取ってください。",
    lineButton: "LINE で友だち追加",
    lineQrAria: "LINE を開いて Lucas Lu を友だち追加",
    saveStep: "名刺を保存", memoryTitle: "出会いの記録を残す",
    memoryIntro: "以下の内容は連絡先ファイルの生成にのみ使用します。データベースには保存されず、Lucas Lu に送信されることもありません。",
    occasion: "出会った場面", note: "交流メモ", optional: "任意",
    occasionPlaceholder: "例：先端製造技術フォーラム",
    notePlaceholder: "例：スマート製造と産業連携について議論",
    locationTitle: "出会った場所",
    locationHint: "任意。VCF の生成にのみ使用し、データベースには保存しません",
    locationLoading: "位置情報を取得中…",
    locationDenied: "位置情報を取得できません（連絡先は保存できます）",
    locationAdd: "現在地を追加", locationUpdate: "位置を再取得",
    saveButton: "Lucas Lu を連絡先に保存", saveOpening: "連絡先を開いています…",
    footDefault: "モバイルでは共有メニューが開きます。「連絡先」を選択してください。表示されない場合は、VCF をファイルに保存してから開いてください。",
    footDownloaded: "Lucas-Lu.vcf をダウンロードしました。ファイルを開くと連絡先に追加できます。",
    footIosInApp: "このアプリ内ブラウザは連絡先ファイルを共有できません。右下のコンパスアイコンから Safari で開いて、もう一度お試しください。",
    footError: "連絡先を自動で開けませんでした。下のリンクを長押しして保存し、開いてください。",
    manual: "長押しして連絡先ファイルを保存",
    resultTitle: "Lucas-Lu.vcf をダウンロードしました",
    resultBody: "ファイルは「ダウンロード」フォルダに保存されました。下のボタンから開くと、連絡先に追加するかどうかの確認画面が表示されます。",
    resultAction: "ファイルを開いて連絡先に追加",
    shareTitle: "Lucas Lu（呂建興）の連絡先カード",
    paperStep: "紙の名刺", paperTitle: "この名刺の実物",
    paperFrontAlt: "Lucas Lu（呂建興）の ITRI 名刺・中国語面",
    paperBackAlt: "Lucas Lu（呂建興）の ITRI 名刺・英語面",
    paperShowingFront: "タップで裏返す · 中国語面を表示中",
    paperShowingBack: "タップで裏返す · 英語面を表示中",
    paperFlipToBack: "英語面を表示", paperFlipToFront: "中国語面を表示",
  },
};

const $ = (id) => document.getElementById(id);

// 預先產生的純聯絡人 vCard（不含相識紀錄）。由 npm test 確保它與 config.js 同步。
const STATIC_VCARD = "Lucas-Lu.vcf";
const isIOS = () =>
  /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// 紙本名片預設翻到與介面語言相符的那一面：中文介面看中文面，英文與日文介面看英文面。
// 沒有日文名片，而英文面的羅馬字姓名與地址對日本訪客比中文面實用。
const defaultPaperFace = (lang) => lang !== "zh";

let language = "zh";
let paperBack = defaultPaperFace("zh");
let location_ = null;
let locationState = "idle";
let lastBlobUrl = null;

/* ────────────────────────────────────────────────────────────
   語言切換
   ──────────────────────────────────────────────────────────── */
function locationText(t) {
  if (locationState === "loading") return t.locationLoading;
  if (locationState === "denied") return t.locationDenied;
  if (location_) return `${location_.latitude.toFixed(6)}, ${location_.longitude.toFixed(6)}`;
  return t.locationHint;
}

function render() {
  const t = UI[language];
  const p = card.person;

  document.documentElement.lang = t.htmlLang;
  $("card").lang = t.htmlLang;

  $("name-main").textContent = p.name[language];
  $("name-sub").textContent = p.nameSub[language];
  $("role").textContent = language === "en"
    ? p.title.en
    : `${p.title[language]} · ${p.title.en}`;
  $("domain").textContent = p.domain[language];
  $("org").innerHTML = "";
  p.organization[language].forEach((line, i) => {
    if (i > 0) $("org").appendChild(document.createElement("br"));
    $("org").appendChild(document.createTextNode(line));
  });

  $("portrait").alt = t.portraitAlt;
  $("lang-group").setAttribute("aria-label", t.langAria);
  $("contact-details").setAttribute("aria-label", t.contactAria);
  document.querySelector('[data-t="phoneLabel"]').textContent = t.phone;
  document.querySelector('[data-t="websiteLabel"]').textContent = t.website;
  document.querySelector('[data-t="researchLabel"]').textContent = t.research;
  $("research-link").textContent = p.research.label[language];

  $("expertise-title").textContent = card.expertise.heading[language];
  $("bio").textContent = card.expertise.bio[language];
  $("advisory").textContent = card.expertise.advisory[language];
  $("expertise-list").setAttribute("aria-label", t.expertiseAria);
  $("expertise-list").innerHTML = "";
  card.expertise.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item[language];
    $("expertise-list").appendChild(li);
  });

  $("line-title").textContent = t.lineTitle;
  $("line-desc").textContent = t.lineDesc;
  $("line-button").textContent = t.lineButton;
  $("line-qr-link").setAttribute("aria-label", t.lineQrAria);

  $("save-step").textContent = t.saveStep;
  $("memory-title").textContent = t.memoryTitle;
  $("memory-intro").textContent = t.memoryIntro;
  $("occasion-label").innerHTML = "";
  $("occasion-label").append(`${t.occasion} `);
  const os = document.createElement("small"); os.textContent = t.optional;
  $("occasion-label").appendChild(os);
  $("occasion").placeholder = t.occasionPlaceholder;
  $("note-label").innerHTML = "";
  $("note-label").append(`${t.note} `);
  const ns = document.createElement("small"); ns.textContent = t.optional;
  $("note-label").appendChild(ns);
  $("note").placeholder = t.notePlaceholder;

  $("location-title").textContent = t.locationTitle;
  $("location-status").textContent = locationText(t);
  $("location-button").textContent = location_ ? t.locationUpdate : t.locationAdd;
  $("save-button").textContent = t.saveButton;
  $("manual-fallback").textContent = t.manual;
  $("save-result-title").textContent = t.resultTitle;
  $("save-result-body").textContent = t.resultBody;
  $("save-result-action").textContent = t.resultAction;

  $("paper-step").textContent = t.paperStep;
  $("paper-title").textContent = t.paperTitle;
  $("paper-img-front").alt = t.paperFrontAlt;
  $("paper-img-back").alt = t.paperBackAlt;
  $("paper-flip").setAttribute("aria-pressed", String(paperBack));
  $("paper-flip").setAttribute("aria-label", paperBack ? t.paperFlipToFront : t.paperFlipToBack);
  $("paper-hint").textContent = paperBack ? t.paperShowingBack : t.paperShowingFront;

  document.querySelectorAll("#lang-group button").forEach((b) => {
    const on = b.dataset.lang === language;
    b.classList.toggle("active", on);
    b.setAttribute("aria-pressed", String(on));
  });
}

/* ────────────────────────────────────────────────────────────
   定位（一律由使用者主動授權；拒絕不影響儲存名片）
   ──────────────────────────────────────────────────────────── */
function requestLocation() {
  if (!navigator.geolocation) { locationState = "denied"; render(); return; }
  locationState = "loading";
  $("location-button").disabled = true;
  render();
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      location_ = { latitude: coords.latitude, longitude: coords.longitude };
      locationState = "idle";
      $("location-button").disabled = false;
      render();
    },
    () => { locationState = "denied"; $("location-button").disabled = false; render(); },
    { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
  );
}

/* ────────────────────────────────────────────────────────────
   儲存聯絡人
   —— 這裡是 v1.2.1 的 bug 所在。舊版把一般下載關在 `!isMobile`
   後面，手機一旦分享失敗就是死路：Android 使用者不是看到 iOS 專用的
   Safari 指南針提示，就是看到「無法開啟聯絡人」而毫無退路。
   現在改成一條會逐級降級的鏈，任何一層失敗都往下一層走。
   ──────────────────────────────────────────────────────────── */
function setFootnote(kind) {
  const t = UI[language];
  const el = $("save-footnote");
  el.classList.remove("error", "warning");
  if (kind === "error")      { el.classList.add("error");   el.textContent = t.footError; }
  else if (kind === "iosInApp") { el.classList.add("warning"); el.textContent = t.footIosInApp; }
  else if (kind === "downloaded") { el.textContent = t.footDownloaded; }
  else { el.textContent = t.footDefault; }
}

// Android 的下載提示常常很不顯眼，使用者會誤以為什麼都沒發生。
// 頁面自己給一張看得見的成功卡片，並捲進視野。
function showDownloadResult(blobUrl) {
  const panel = $("save-result");
  $("save-result-action").href = blobUrl;
  panel.hidden = false;
  $("save-footnote").hidden = true; // 卡片已經說清楚了，別再重複一次
  panel.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideDownloadResult() {
  $("save-result").hidden = true;
  $("save-footnote").hidden = false;
}

async function saveContact() {
  const t = UI[language];
  const button = $("save-button");
  button.disabled = true;
  button.textContent = t.saveOpening;
  $("manual-fallback").hidden = true;
  hideDownloadResult();

  try {
    const vcard = buildVCard({
      language,
      timestamp: new Date(),
      occasion: $("occasion").value,
      note: $("note").value,
      latitude: location_?.latitude ?? null,
      longitude: location_?.longitude ?? null,
    });
    const file = new File([vcard], "Lucas-Lu.vcf", { type: "text/vcard;charset=utf-8" });

    // 備援連結先備好，之後任何一層失敗都能立刻亮出來
    if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
    lastBlobUrl = URL.createObjectURL(file);
    $("manual-fallback").href = lastBlobUrl;

    let canShareFiles = false;
    try { canShareFiles = navigator.canShare?.({ files: [file] }) === true; } catch { /* 舊瀏覽器會直接丟例外 */ }

    // 有填相識資訊就不能走靜態檔——那個檔是預先產生的，塞不進即時內容
    const hasMemoryFields = Boolean(
      $("occasion").value.trim() || $("note").value.trim() || location_,
    );
    const plan = deliveryPlan({ canShareFiles, isIOS: isIOS(), hasMemoryFields });
    let degraded = false;

    for (const step of plan) {
      if (step === "direct-vcf") {
        // iOS Safari 導航到同網域 .vcf 會直接顯示聯絡人卡片，比分享選單少一步。
        // 導航後本頁即被聯絡人預覽接管，後續步驟不會執行——這是預期行為。
        location.assign(STATIC_VCARD);
        return;
      }

      if (step === "share") {
        try {
          await navigator.share({ files: [file], title: t.shareTitle });
          setFootnote("default");
          return;
        } catch (error) {
          if (error?.name === "AbortError") { setFootnote("default"); return; } // 使用者自己取消
          degraded = true; // ← 舊版在這裡就停住了，現在往下一層走
        }
      } else if (step === "ios-in-app-guidance") {
        setFootnote("iosInApp");
        $("manual-fallback").hidden = false;
        return;
      } else if (step === "download") {
        try {
          const anchor = document.createElement("a");
          anchor.href = lastBlobUrl;
          anchor.download = "Lucas-Lu.vcf";
          anchor.rel = "noopener";
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          setFootnote("downloaded");
          showDownloadResult(lastBlobUrl);
          if (degraded) $("manual-fallback").hidden = false; // 前面失敗過，多留一條路
          return;
        } catch {
          degraded = true;
        }
      } else if (step === "manual-link") {
        setFootnote("error");
        $("manual-fallback").hidden = false;
        return;
      }
    }
  } catch {
    setFootnote("error");
    if (lastBlobUrl) $("manual-fallback").hidden = false;
  } finally {
    button.disabled = false;
    button.textContent = UI[language].saveButton;
  }
}

/* ──────────────────────────────────────────────────────────── */
document.querySelectorAll("#lang-group button").forEach((b) => {
  b.addEventListener("click", () => {
    language = b.dataset.lang;
    paperBack = defaultPaperFace(language);
    render();
    setFootnote("default");
    $("manual-fallback").hidden = true;
    hideDownloadResult();
  });
});
$("paper-flip").addEventListener("click", () => { paperBack = !paperBack; render(); });
$("location-button").addEventListener("click", requestLocation);
$("save-button").addEventListener("click", () => { void saveContact(); });
render();
