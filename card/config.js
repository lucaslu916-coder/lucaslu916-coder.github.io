// 名片內容單一真相。改名片資料只要改這個檔，頁面與 VCF 會一起跟著變。
// 每個可翻譯欄位都是 { zh, en, ja } 三語對照，缺一不可。
export const card = {
  site: {
    publicUrl: "https://lucaslu916-coder.github.io/card/",
    title: "呂建興 Lucas Lu｜儲存電子名片",
    description: "儲存 Lucas Lu 的聯絡資訊，並在手機本機記錄相識時間、場合與地點。",
  },

  person: {
    // 漢字姓名為 vCard 的正式識別，三語共用，不隨介面語言改變
    name: { zh: "呂建興", en: "Lucas Lu", ja: "Lucas Lu" },
    nameSub: { zh: "Lucas Lu", en: "呂建興", ja: "呂建興" },
    title: { zh: "資深研究員", en: "Senior Researcher", ja: "上席研究員" },
    // 日文的「設備」指廠房水電；半導體機台一律作「装置」
    domain: { zh: "高科技設備領域", en: "High-Tech Equipment", ja: "ハイテク装置分野" },
    organization: {
      zh: ["工業技術研究院", "產業科技國際策略發展所"],
      en: ["Industrial Technology Research Institute", "Industry, Science and Technology International Strategy Center (ISTI)"],
      // 日文無「科技」一詞，須作「科学技術」；並轉新字體（産・発・戦）
      ja: ["工業技術研究院（ITRI）", "産業科学技術国際戦略発展研究所（ISTI）"],
    },
    phone: { display: "03 591 7718", international: "+886-3-591-7718" },
    email: "LucasLu@itri.org.tw",
    website: { url: "https://www.itri.org.tw/", label: "www.itri.org.tw" },
    research: {
      url: "https://ieknet.iek.org.tw/",
      label: { zh: "IEK 產業情報網", en: "IEK Industry Intelligence", ja: "IEK 産業情報ネット" },
    },
    line: { url: "https://line.me/ti/p/4d4tXQMUUY" },
  },

  expertise: {
    heading: {
      zh: "設備產業研究與 AI 導入輔導",
      en: "Equipment Industry Research & AI Adoption Advisory",
      ja: "装置産業リサーチと AI 導入支援",
    },
    bio: {
      zh: "專注於半導體設備產業與供應鏈研究，具備晶圓製程、設備開發、先進封裝檢測及高科技製造系統分析經驗。",
      en: "Focused on semiconductor equipment and supply-chain research, with experience in wafer processes, equipment development, advanced-packaging inspection, and high-tech manufacturing systems.",
      ja: "半導体製造装置産業とサプライチェーンの研究を専門とし、ウェーハプロセス、装置開発、先端パッケージ検査、ハイテク製造システム分析の経験を持つ。",
    },
    advisory: {
      zh: "同時參與產業競爭力輔導團，協助設備與製造業者進行 AI 成熟度盤點、流程痛點診斷、可驗證 PoC 規劃，並銜接人才、工具與政策資源。",
      en: "As a member of the Industrial Competitiveness Advisory Team, I help equipment and manufacturing companies assess AI readiness, diagnose process pain points, plan measurable proofs of concept, and connect with talent, tools, and policy resources.",
      ja: "産業競争力支援チームの一員として、装置・製造企業の AI 成熟度評価、工程課題の診断、検証可能な PoC の計画策定を支援し、人材・ツール・政策リソースとの橋渡しを行う。",
    },
    items: [
      { zh: "半導體設備產業分析", en: "Semiconductor Equipment Industry Analysis", ja: "半導体製造装置産業分析" },
      { zh: "晶圓製程與設備開發", en: "Wafer Process & Equipment Development", ja: "ウェーハプロセス・装置開発" },
      { zh: "化合物半導體技術研究", en: "Compound Semiconductor Technology", ja: "化合物半導体技術研究" },
      { zh: "設備業 AI 導入診斷與輔導", en: "AI Adoption Advisory for Equipment Makers", ja: "装置産業向け AI 導入診断・支援" },
    ],
  },

  theme: { primary: "#0a85b8", dark: "#075a91", accent: "#06a89d" },

  assets: {
    logo: "itri-logo.png",
    portrait: "lucas-lu.png",
    lineQr: "line-qr.jpg",
    socialPreview: "og.png",
  },

  // vCard 內的機構與地址固定用中文原文，不隨介面語言切換——
  // 這是聯絡人的正式紀錄，保持單一寫法才不會同一個人存出三種版本。
  vcard: {
    organization: ["工業技術研究院", "產業科技國際策略發展所", "機械與製造系統研究部", "機械與系統研究組"],
    address: ["", "", "中興路四段195號10館2樓208室", "竹東鎮", "新竹縣", "310401", "台灣"],
  },
};

export default card;
