// 聯絡人交付策略。
//
// 抽成獨立模組是為了「可被測試」。v1.2.1 的 Android bug 之所以能在
// 8 項測試全過的情況下上線，是因為那些測試只用正規表示式比對原始碼有沒有
// 出現某段字，等於把當時的錯誤行為當成正確答案鎖了起來。
//
// 這裡改成回傳一份「依序嘗試的步驟清單」，測試可以針對每一種裝置組合
// 直接驗證：分享永遠不會是死路，後面一定還有退路。
//
// 各步驟的可行性以雙平台實機測試決定，不靠推論（2026-09-14）：
//   iOS Safari 導航到同網域 .vcf → 直接顯示聯絡人卡片，比分享選單少一步
//   Android 則三種導航方式一律變成下載，intent:// 完全無反應——
//   平台沒有開放讓網頁直接開啟新增聯絡人的介面，只能走下載。
export function deliveryPlan({ canShareFiles, isIOS, hasMemoryFields = false }) {
  const steps = [];

  // ① iOS 且沒有即時資訊要帶：直接導航到預先產生的靜態 .vcf。
  //    Safari 會直接顯示聯絡人卡片，使用者按「加入聯絡人」即可，最省事。
  //    以 canShareFiles 作為「是否為 Safari」的判準——App 內建瀏覽器
  //    （LINE／FB）在此為 false，而它們連導航到 .vcf 都會失敗，
  //    走這條路只會讓使用者卡在沒有回饋的畫面。
  //    靜態檔塞不進相識時間／場合／GPS，所以有填資料時不能走這條。
  if (!hasMemoryFields && isIOS && canShareFiles) steps.push("direct-vcf");

  // ② 系統分享選單：帶得動即時產生的檔案，iOS 可選「聯絡人」
  if (canShareFiles) steps.push("share");

  // ③ iOS 無法分享，代表身處 App 內建瀏覽器：這類瀏覽器連下載都會被擋，
  //    硬試只會再失敗一次，直接給正確指引。
  //    其他平台則走一般下載——Android 與桌面瀏覽器都支援。
  steps.push(isIOS ? "ios-in-app-guidance" : "download");

  // ④ 最後一道退路：亮出可長按另存的連結，永遠不讓使用者卡在死路
  steps.push("manual-link");

  return steps;
}

export default deliveryPlan;
