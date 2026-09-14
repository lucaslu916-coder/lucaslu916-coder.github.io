// vCard 3.0 產生器。自 v1.2.1 的 lib/vcard.ts 原樣移植，
// 折行、跳脫與欄位順序完全不變——這些細節決定 iOS/Android 通訊錄認不認得這張卡。
import { card } from "./config.js";

const escapeText = (value) =>
  value
    .replace(/\r\n?/g, "\n")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\;");

// RFC 2426 規定每行最多 75 位元組，續行以一個空格開頭。
// 以位元組而非字元計算，中日文才不會在多位元組字中間被切斷。
const foldLine = (line) => {
  const encoder = new TextEncoder();
  const folded = [];
  let current = "";
  let currentBytes = 0;
  let limit = 75;

  for (const character of line) {
    const characterBytes = encoder.encode(character).length;
    if (current && currentBytes + characterBytes > limit) {
      folded.push(`${folded.length ? " " : ""}${current}`);
      current = character;
      currentBytes = characterBytes;
      limit = 74; // 續行的開頭空格也算一個位元組
    } else {
      current += character;
      currentBytes += characterBytes;
    }
  }

  folded.push(`${folded.length ? " " : ""}${current}`);
  return folded;
};

const NOTE_LABELS = {
  zh: { time: "相識時間", occasion: "相識場合", place: "相識位置", note: "交流備註" },
  en: { time: "Meeting time", occasion: "Occasion", place: "Meeting location", note: "Notes" },
  ja: { time: "名刺交換日時", occasion: "出会った場面", place: "出会った場所", note: "交流メモ" },
};

const LOCALES = { zh: "zh-TW", en: "en-US", ja: "ja-JP" };

// includeMemory=false 產生「純聯絡人」版本：不含相識時間／場合／位置。
// 靜態 .vcf 檔用它——那個檔是預先產生的，塞不進即時資訊。
export const buildVCard = ({
  language = "zh",
  timestamp,
  occasion = "",
  note = "",
  latitude = null,
  longitude = null,
  includeMemory = true,
}) => {
  const lang = NOTE_LABELS[language] ? language : "zh";
  const labels = NOTE_LABELS[lang];
  const formattedMoment = new Intl.DateTimeFormat(LOCALES[lang], {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Taipei",
  }).format(timestamp);

  const hasLocation = latitude !== null && latitude !== undefined
    && longitude !== null && longitude !== undefined;

  const memory = !includeMemory ? "" : [
    `${labels.time}：${formattedMoment}`,
    occasion.trim() ? `${labels.occasion}：${occasion.trim()}` : "",
    hasLocation ? `${labels.place}：${latitude.toFixed(6)}, ${longitude.toFixed(6)}` : "",
    hasLocation ? `Google Maps：https://www.google.com/maps?q=${latitude},${longitude}` : "",
    note.trim() ? `${labels.note}：${note.trim()}` : "",
  ].filter(Boolean).join("\n");

  const familyName = card.person.name.zh.slice(0, 1);
  const givenName = card.person.name.zh.slice(1);
  const prodLang = { zh: "ZH-TW", en: "EN", ja: "JA" }[lang];

  const logicalLines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `PRODID:-//Lucas Lu//Digital Business Card//${prodLang}`,
    `N;CHARSET=UTF-8:${escapeText(familyName)};${escapeText(givenName)};;;`,
    `FN;CHARSET=UTF-8:${escapeText(`${card.person.name.zh} ${card.person.name.en}`)}`,
    `ORG;CHARSET=UTF-8:${card.vcard.organization.map(escapeText).join(";")}`,
    `TITLE;CHARSET=UTF-8:${escapeText(`${card.person.title[lang]} / ${card.person.title.en}`)}`,
    `TEL;TYPE=WORK,VOICE:${card.person.phone.international}`,
    `EMAIL;TYPE=INTERNET,WORK:${card.person.email}`,
    `ADR;TYPE=WORK;CHARSET=UTF-8:${card.vcard.address.map(escapeText).join(";")}`,
    `URL:${card.person.website.url}`,
    `X-SOCIALPROFILE;TYPE=LINE:${card.person.line.url}`,
    ...(memory ? [`NOTE;CHARSET=UTF-8:${escapeText(memory)}`] : []),
    `REV:${timestamp.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")}`,
    "END:VCARD",
  ];

  return `${logicalLines.flatMap(foldLine).join("\r\n")}\r\n`;
};

export default buildVCard;
