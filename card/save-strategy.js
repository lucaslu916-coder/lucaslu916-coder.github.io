// 聯絡人交付策略。
//
// 抽成獨立模組是為了「可被測試」。v1.2.1 的 Android bug 之所以能在
// 8 項測試全過的情況下上線，是因為那些測試只用正規表示式比對原始碼有沒有
// 出現某段字，等於把當時的錯誤行為當成正確答案鎖了起來。
//
// 這裡改成回傳一份「依序嘗試的步驟清單」，測試可以針對每一種裝置組合
// 直接驗證：分享永遠不會是死路，後面一定還有退路。
export function deliveryPlan({ canShareFiles, isIOS }) {
  const steps = [];

  // ① 系統分享選單：iOS 唯一能直接進「聯絡人」的路徑
  if (canShareFiles) steps.push("share");

  // ② iOS 無法分享，代表身處 App 內建瀏覽器（LINE／FB 等）：
  //    這類瀏覽器連下載都會被擋，硬試只會再失敗一次，直接給正確指引。
  //    其他平台則走一般下載——Android Chrome 與桌面瀏覽器都支援。
  steps.push(isIOS ? "ios-in-app-guidance" : "download");

  // ③ 最後一道退路：亮出可長按另存的連結，永遠不讓使用者卡在死路
  steps.push("manual-link");

  return steps;
}

export default deliveryPlan;
