import { useState, useEffect, useRef } from "react";

// ──────────────────────────────────────────────
//  地図の差し替え値
// ──────────────────────────────────────────────
const googleMyMapsEmbedUrl = "https://www.google.com/maps/d/embed?mid=1lQA7BZeqi_aqZd-PTpQuJLdqvd2j0RA&ehbc=2E312F";
const googleMyMapsShareUrl = "https://www.google.com/maps/d/viewer?mid=1lQA7BZeqi_aqZd-PTpQuJLdqvd2j0RA";
const isPlaceholder = (url) => !url || url.startsWith("GOOGLE_MY_MAPS");
// ※ 自分のサイト（GCP/Vercel等）に設置する場合は true。地図が埋め込み表示されます。
const enableInlineMapEmbed = true;

// ──────────────────────────────────────────────
//  パレット / フォント
// ──────────────────────────────────────────────
const c = {
  cream: "#F7F1E6", paper: "#FFFDF8", ink: "#3A352E", inkSoft: "#8B8275",
  sage: "#AEC196", sageBg: "#E4ECD9", beige: "#EBE0CE", gold: "#BE9E63", line: "#E5DBC9",
};
const serif = "'Shippori Mincho', 'Hiragino Mincho ProN', serif";
const sans = "'Zen Kaku Gothic New', system-ui, sans-serif";
const latin = "'Cormorant Garamond', serif";

const catMeta = {
  pan: { label: "パン", color: "#D7A75C" },
  gohan: { label: "ご飯", color: "#D6795C" },
  okashi: { label: "お菓子", color: "#D98FB0" },
  wagashi: { label: "和菓子", color: "#C98F6A" },
  cafe: { label: "カフェ・お茶", color: "#B07E54" },
  takeout: { label: "テイクアウト", color: "#9BB47E" },
  night: { label: "夜・音楽", color: "#857FAE" },
  zakka: { label: "雑貨・本", color: "#8AA1B8" },
  nature: { label: "自然・公園", color: "#7BAE8E" },
  culture: { label: "文化・美術館", color: "#A98AB8" },
  venue: { label: "イベント会場", color: "#BE9E63" },
};
const pinToCat = {
  "パン": "pan", "ご飯": "gohan", "お菓子": "okashi", "和菓子": "wagashi",
  "お茶・カフェ": "cafe", "テイクアウト": "takeout", "夜・音楽": "night",
  "雑貨・文具": "zakka", "雑貨・本": "zakka", "自然・公園": "nature", "文化・美術館": "culture", "イベント会場": "venue",
};

const gmap = (name, address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + " " + address)}`;
const mapBtnStyle = { background: c.sageBg, color: c.ink, border: `1px solid ${c.sage}`, fontWeight: 700 };

const navItems = [
  { id: "map", label: "全体MAP" },
  { id: "same-building", label: "同じ建物" },
  { id: "area-mitaka", label: "三鷹駅周辺" },
  { id: "area-inokashira", label: "井の頭公園" },
  { id: "route", label: "さんぽルート" },
];

const Illu = ({ cat, col, s = 30 }) => {
  const p = { fill: "none", stroke: col, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  const dot = { fill: col, stroke: "none" };
  const inner = {
    pan: <g><path {...p} d="M7 20c0-6 4-9 9-9s9 3 9 9v1.5c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2z" /><path {...p} d="M13 13l-1.4 9M18 13l-1 9" /></g>,
    gohan: <g><path {...p} d="M6 16h20l-2.1 7c-.4 1.2-1.5 2-2.7 2H10.8c-1.2 0-2.4-.8-2.7-2z" /><path {...p} d="M6 16h20" /><path {...p} d="M12 9c-.8 1 .8 2 0 3M16 8c-.8 1 .8 2 0 3M20 9c-.8 1 .8 2 0 3" /></g>,
    okashi: <g><path {...p} d="M10.5 16h11l-1.4 8c-.1.9-.9 1.6-1.8 1.6h-4.6c-.9 0-1.7-.7-1.8-1.6z" /><path {...p} d="M9 16c0-2.8 2.8-3.8 2.8-3.8.5-2 2-3.2 4.2-3.2s3.7 1.2 4.2 3.2c0 0 2.8 1 2.8 3.8z" /><path {...p} d="M16 5.5v2" /><circle cx="16" cy="4.6" r="1.1" {...dot} /></g>,
    wagashi: <g><path {...p} d="M7 16c2-4 6-6.2 10-6.2 2.7 0 4.7 1 5.8 2l3-2-.9 6.2.9 6-3-2c-1.1 1-3.1 2-5.8 2-4 0-8-2.2-10-6z" /><circle cx="12" cy="14" r="1" {...dot} /><path {...p} d="M16.5 12c1 1.4 1 6.6 0 8" /></g>,
    cafe: <g><path {...p} d="M8 14h13v5.5c0 2.8-2 4.8-4.8 4.8h-3.4C10 24.3 8 22.3 8 19.5z" /><path {...p} d="M21 15.2h2.5c1.6 0 2.7 1.1 2.7 2.6s-1.1 2.6-2.7 2.6H21" /><path {...p} d="M11 8c-.7 1 .7 2 0 3M16 7c-.7 1 .7 2 0 3" /><path {...p} d="M7 26.5h16" /></g>,
    takeout: <g><path {...p} d="M9 12.5h14l-1 12.5c-.1 1-.9 1.6-1.8 1.6H11.8c-.9 0-1.7-.6-1.8-1.6z" /><path {...p} d="M12.2 12.5c0-2.1 1.7-3.8 3.8-3.8s3.8 1.7 3.8 3.8" /></g>,
    night: <g><path {...p} d="M13 22V9.2l9-2V20" /><ellipse cx="10.6" cy="22.4" rx="2.9" ry="2.2" {...dot} /><ellipse cx="19.6" cy="20.4" rx="2.9" ry="2.2" {...dot} /></g>,
    zakka: <g><path {...p} d="M16 9.5c-2.1-1.4-5.2-2-8.3-1.6v13.7c3.1-.4 6.2.2 8.3 1.6 2.1-1.4 5.2-2 8.3-1.6V7.9c-3.1-.4-6.2.2-8.3 1.6z" /><path {...p} d="M16 9.5v13.7" /></g>,
    nature: <g><path {...p} d="M23 9c0 8.5-5.4 14-13 14 0-8.5 5.4-14 13-14z" /><path {...p} d="M10 23c4-6.2 8.4-10.4 12.6-13.4" /></g>,
    culture: <g><path {...p} d="M6 13l10-5 10 5" /><path {...p} d="M7.5 13v9M11.8 13v9M16 13v9M20.2 13v9M24.5 13v9" /><path {...p} d="M5.5 22.5h21M5.5 25.5h21" /></g>,
    venue: <g><path {...p} d="M16 6l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L16 24.2l-5.6 3 1.1-6.2L7 12.6l6.2-.9z" /></g>,
  };
  return <svg width={s} height={s} viewBox="0 0 32 32" style={{ display: "block" }}>{inner[cat] || inner.cafe}</svg>;
};

const HeroArt = () => {
  const sg = c.sage, gd = c.gold;
  const p = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  return (
    <svg viewBox="0 0 320 96" width="100%" style={{ maxWidth: 320, display: "block", margin: "0 auto" }}>
      <circle cx="276" cy="26" r="12" stroke={gd} strokeWidth="1.6" {...p} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a} x1={276 + 16 * Math.cos(a * Math.PI / 180)} y1={26 + 16 * Math.sin(a * Math.PI / 180)} x2={276 + 20 * Math.cos(a * Math.PI / 180)} y2={26 + 20 * Math.sin(a * Math.PI / 180)} stroke={gd} strokeWidth="1.4" {...p} />
      ))}
      <path d="M18 78c20-6 30 4 52-2s30-14 56-10 36 16 60 8 38-10 50-6" stroke={gd} strokeWidth="1.6" strokeDasharray="2 6" {...p} />
      <g stroke={sg} strokeWidth="1.7" {...p}><path d="M44 78c-7 0-12-5-12-12 0-6 5-11 12-11s12 5 12 11c0 7-5 12-12 12z" /><path d="M44 78v9" /></g>
      <g stroke={sg} strokeWidth="1.7" {...p}><path d="M150 80c-9 0-15-6-15-15 0-8 6-14 15-14s15 6 15 14c0 9-6 15-15 15z" /><path d="M150 80v10" /></g>
      <g stroke={c.gold} strokeWidth="1.7" {...p}><path d="M92 70h13v5c0 3-2 5-5 5h-3c-3 0-5-2-5-5z" /><path d="M105 71h2.4c1.5 0 2.6 1 2.6 2.5S109 76 107.4 76H105" /><path d="M95 65c-.6.9.6 1.8 0 2.7M100 64c-.6.9.6 1.8 0 2.7" /></g>
    </svg>
  );
};

const scool = { name: "三鷹SCOOL", address: "東京都三鷹市下連雀3-33-6 三京ユニオンビル5F", officialUrl: "https://scool.jp/" };

const sameBuilding = {
  title: "ANPU・リトルスターレストラン",
  genre: "カフェバー・カレー・洋食・定食", budget: "1,000〜4,000円目安",
  address: "東京都三鷹市下連雀3-33-6 三京ユニオンビル",
  comment: "SCOOLと同じ三京ユニオンビル内で立ち寄れるご飯・カフェスポット。ANPUはSCOOLの1Fにあるカフェバーで、nanoriの第3回公演の演者のみなさまもここでカレーを食されておりました🍛 リトルスターレストランは3Fの洋食屋さん。人気店ですが、このサイトの作成者は未訪問です💦",
  note: "ANPUとリトルスターレストランで営業時間・定休日が異なります。来店前に各店舗の公式情報・SNSをご確認ください。",
  stores: [
    { name: "ANPU", floor: "1F", genre: "カフェバー・カレー",
      tagline: "SCOOLの1Fにあるカフェバー。ランチ・カフェ・バー利用ができます。",
      hours: "火〜土 11:30〜23:30（L.O.23:00） / 日 11:30〜21:00（L.O.20:30）",
      holiday: "月曜（祝日の場合は翌火曜休みの案内あり）",
      address: "東京都三鷹市下連雀3-33-6 三京ユニオンビル1F",
      officialUrl: "", instagramUrl: "https://www.instagram.com/cafe_anpu/", xUrl: "https://x.com/cafeanpu", tel: "" },
    { name: "リトルスターレストラン", floor: "3F", genre: "洋食・定食・レストラン",
      tagline: "三京ユニオンビル3Fの人気レストラン。",
      hours: "ランチ 11:30〜14:30（L.O.14:00） / ディナー 18:00〜22:00（L.O.21:00）",
      holiday: "月曜・火曜",
      address: "東京都三鷹市下連雀3-33-6 三京ユニオンビル3F",
      officialUrl: "https://little-star.tokyo/", instagramUrl: "https://www.instagram.com/littlestarws/", xUrl: "", tel: "0422-45-3331" },
  ],
};

const shopsRaw = [
  { name: "siro", pinType: "パン", genre: "パン", group: "mitaka", distance: "SCOOLから徒歩圏内",
    comment: "以前もご訪問いただいたベーカリー🍞 イートインも始まりました！",
    tags: ["テイクアウト", "イートインあり", "さっと寄れる"], address: "東京都三鷹市下連雀3-37-28",
    hours: "9:30〜18:00（売り切れ次第終了）", holiday: "日曜・月曜・ほか不定休", budget: "〜1,000円目安",
    officialUrl: "", instagramUrl: "https://www.instagram.com/siro_bakery/", note: "営業日・売り切れ状況はInstagram確認推奨。" },
  { name: "PASTAわざや", pinType: "ご飯", genre: "パスタ・ご飯", group: "mitaka", distance: "SCOOLから徒歩圏内",
    comment: "何を食べてもおいしいです。行列店なので、お昼は15時のラストオーダーかけこみがおすすめ。",
    tags: ["パスタ", "行列店", "友人と"], address: "東京都三鷹市下連雀3-37-40 藤ビル1F",
    hours: "11:30〜15:00 / 18:00〜21:00目安", holiday: "火曜中心・年末年始休みあり", budget: "1,000〜2,000円目安",
    officialUrl: "", instagramUrl: "https://www.instagram.com/pasta_wazaya/", note: "お昼はL.O.15:00目安。営業情報はInstagram確認推奨。" },
  { name: "すず喜 / すず鬼", pinType: "ご飯", genre: "ラーメン・ご飯", group: "mitaka", distance: "SCOOLから徒歩圏内",
    comment: "昼と夜で提供ラーメンが変わる三毛作店🍜 夜は非常に並びます！",
    tags: ["ラーメン", "昼夜で変わる", "イベント後"], address: "東京都三鷹市下連雀3-28-21 B1",
    hours: "すず喜：11:00〜15:00目安 / すず鬼：夜営業中心", holiday: "すず喜：月曜目安 / すず鬼：日曜目安", budget: "1,000〜2,000円目安",
    officialUrl: "https://x.com/suzuki_friends", instagramUrl: "https://www.instagram.com/suzukifriends/", note: "昼『すず喜』と夜『すず鬼』で営業名・時間が異なる場合あり。" },
  { name: "ka ha na -菓葉絆-", pinType: "お菓子", genre: "洋菓子・焼き菓子", group: "mitaka", distance: "SCOOLから少し歩く",
    comment: "最近話題のお菓子屋さん。甘いものや手土産を探したいときに。",
    tags: ["焼き菓子", "話題", "手土産"], address: "東京都三鷹市下連雀4-15-26",
    hours: "11:00〜17:00頃（売り切れ次第終了）", holiday: "木・金・土営業中心。月により変動", budget: "1,000〜2,000円目安",
    officialUrl: "https://lieroyatsu.shop/", instagramUrl: "https://www.instagram.com/kahana_pastry_tokyo/", note: "月ごとに営業日が変動。Instagram確認推奨。" },
  { name: "まほろば珈琲店", pinType: "お茶・カフェ", genre: "コーヒー・カフェ", group: "mitaka", distance: "SCOOLから少し歩く",
    comment: "平日は豆購入者でないとイートインできなくなりました😭 コーヒー好きはぜひ。",
    tags: ["コーヒー", "しずか", "ひとり"], address: "東京都三鷹市下連雀4-16-14",
    hours: "豆販売 11:00〜20:00 / 喫茶 12:00〜18:00目安", holiday: "月曜・その他休業日あり", budget: "〜1,000円目安",
    officialUrl: "", instagramUrl: "https://www.instagram.com/maholoba527/", note: "平日のイートインは豆購入が条件。ピン位置は店名検索で要確認。" },
  { name: "肉のアンデス", pinType: "テイクアウト", genre: "精肉・惣菜", group: "mitaka", distance: "SCOOLから徒歩圏内",
    comment: "前回ご訪問いただいた精肉店。手作りコロッケがおすすめ。",
    tags: ["惣菜", "コロッケ", "さっと寄れる"], address: "東京都三鷹市下連雀3-31-3 三鷹レジデンスあそ1F",
    hours: "9:00〜19:00", holiday: "なし", budget: "〜1,000円目安",
    officialUrl: "", instagramUrl: "", note: "" },
  { name: "Cafe 319 / 319", pinType: "お茶・カフェ", genre: "カフェ", group: "mitaka", distance: "SCOOLから徒歩圏内",
    comment: "超おしゃれ店。ご飯よりデザート系がおすすめ🎂 営業時間が短いので要注意。",
    tags: ["カフェ", "デザート", "おしゃれ"], address: "東京都三鷹市下連雀3-28-23 3F",
    hours: "12:00〜17:00目安。金〜日モーニングあり", holiday: "月曜・火曜目安", budget: "1,000〜2,000円目安",
    officialUrl: "", instagramUrl: "https://www.instagram.com/plus__319/", note: "営業時間が短め。Instagram確認推奨。" },
  { name: "中華銘菜 餃子菜館", pinType: "ご飯", genre: "中華・餃子", group: "mitaka", distance: "SCOOLから徒歩圏内",
    comment: "地元の町中華で、いつも賑わっております。",
    tags: ["町中華", "餃子", "友人と"], address: "東京都三鷹市下連雀3-20-7 浜中ビル1F/101",
    hours: "11:30〜14:00 / 17:00〜21:00目安", holiday: "木曜", budget: "1,000〜2,000円目安",
    officialUrl: "https://saikan.gorp.jp/", instagramUrl: "", note: "休憩時間あり。来店前確認推奨。" },
  { name: "キッチンConro", pinType: "ご飯", genre: "タイ料理・エスニック", group: "mitaka", distance: "SCOOLから徒歩圏内",
    comment: "餃子菜館の下のエスニック。吉祥寺の有名店から独立したお店です。",
    tags: ["エスニック", "タイ料理", "イベント後"], address: "東京都三鷹市下連雀3-20-7 浜中ビル",
    hours: "11:30〜15:00 / 18:00〜21:00〜22:00目安", holiday: "火曜または不定休", budget: "1,000〜3,000円目安",
    officialUrl: "https://www.kiloconro.com/conro/index.html", instagramUrl: "https://www.instagram.com/kitchenconro/", note: "ピン位置は店名検索で要確認。" },
  { name: "グラバー亭", pinType: "ご飯", genre: "長崎ちゃんぽん・皿うどん・町中華", group: "mitaka", distance: "SCOOLから徒歩圏内",
    comment: "長崎直送の食材を使った、ちゃんぽんや皿うどんが地元で人気の町中華。イベント後にしっかり食べたいときに。",
    tags: ["ちゃんぽん", "町中華", "イベント後"], address: "東京都三鷹市下連雀3-25-8",
    hours: "月〜金 11:30〜14:30 / 18:00〜21:00、土・祝 11:30〜14:30", holiday: "日曜", budget: "1,000〜2,000円目安",
    officialUrl: "", instagramUrl: "", xUrl: "https://x.com/gloverteimitaka",
    note: "油のニオイが服につくことがあるため、気になる方はイベント前より後がおすすめ。営業時間・定休日は来店前に確認推奨。" },
  { name: "和菓子 たいやき すえき", pinType: "和菓子", genre: "和菓子・たい焼き", group: "mitaka", distance: "SCOOLから徒歩圏内",
    comment: "三鷹駅南口側で、甘いものや手土産を探したいときに。",
    tags: ["たい焼き", "甘いもの", "手土産"], address: "東京都三鷹市下連雀3-31-10",
    hours: "11:00〜18:00または19:00目安（売り切れ次第終了）", holiday: "月曜・火曜。祝日は営業し翌日休み", budget: "〜1,000円目安",
    officialUrl: "", instagramUrl: "https://www.instagram.com/mitaka_sueki/", note: "営業時間表記に揺れあり。Instagram確認推奨。" },
  { name: "LA CRÊPERIE / Saint-Denis Cafe", pinType: "お菓子", genre: "クレープ・洋菓子・カフェ", group: "mitaka", distance: "SCOOLから少し歩く",
    comment: "クレープや甘いものを楽しみたいときの主力。写真映えも。",
    tags: ["クレープ", "甘いもの", "写真映え"], address: "東京都三鷹市下連雀4-21-18",
    hours: "Cafe 12:00〜20:00/20:30目安。CRÊPERIEは生地売り切れ次第終了", holiday: "日曜・月曜中心", budget: "1,000〜3,000円目安",
    officialUrl: "", instagramUrl: "https://www.instagram.com/lacreperie_stdenis/", note: "2業態で営業日・時間が異なる場合あり。Instagram確認推奨。" },
  { name: "山田文具店", pinType: "雑貨・文具", genre: "文具・雑貨・小物", group: "mitaka", distance: "SCOOLから少し歩く",
    comment: "なつかしの文具や、ちょっとした小物が素敵なお店。散歩中に気軽に立ち寄れる雑貨・文具スポット。",
    tags: ["雑貨", "文具", "さっと寄れる"], address: "東京都三鷹市下連雀4-15-29 ロイヤルハイツ1階",
    hours: "平日 11:00〜18:00 / 土日祝 11:00〜19:00", holiday: "不定休", budget: "〜2,000円目安",
    officialUrl: "https://yamadastationery.jp/", instagramUrl: "https://www.instagram.com/yamadastationery/",
    note: "2025年6月に現在地へ移転。営業時間・休業日は公式サイト/Instagram確認推奨。" },
  { name: "四歩・よもぎBOOKS・Hiker's Depot", pinType: "雑貨・本", genre: "カフェ・雑貨・本・アウトドア", group: "mitaka", distance: "SCOOLから少し歩く",
    comment: "同じ建物内で複数のお店を楽しめる寄り道スポット。人気のカフェ&雑貨「四歩」、こだわりの本「よもぎBOOKS」、軽量ギアの老舗「Hiker's Depot」が集まっています。",
    tags: ["複合スポット", "カフェ", "本", "雑貨"], address: "東京都三鷹市下連雀4-15-33 三鷹プラーザ / 日生三鷹マンション2F",
    hours: "店舗により異なる（下記参照）", holiday: "店舗により異なる", budget: "1,000〜4,000円目安",
    officialUrl: "https://www.sippo-4.com/store/", instagramUrl: "https://www.instagram.com/sippo_4/",
    note: "三鷹プラーザ2Fの複合スポット。各店で営業時間・定休日が異なります。",
    subStores: [
      { name: "四歩 三鷹店 / sononi", genre: "カフェ・日用品・雑貨", hours: "11:00〜20:00", holiday: "定休日なし", officialUrl: "https://www.sippo-4.com/store/", instagramUrl: "https://www.instagram.com/sippo_4/" },
      { name: "よもぎBOOKS", genre: "本屋・新刊書・古書", hours: "平日 12:00〜17:30 / 土日祝 12:00〜18:00", holiday: "不定休", officialUrl: "https://yomogibooks.com/", instagramUrl: "https://www.instagram.com/yomogibooks/" },
      { name: "Hiker's Depot", genre: "アウトドア・ウルトラライトギア", hours: "12:00〜20:00", holiday: "火曜定休", officialUrl: "https://hikersdepot.jp/", instagramUrl: "https://www.instagram.com/hikersdepot/" },
    ] },

  { name: "WAAD", pinType: "お茶・カフェ", genre: "カフェ・バー", group: "inokashira", distance: "井の頭公園駅近く",
    comment: "井の頭線を使われるならおすすめ。ここのホットドッグが超おいしいです。コーヒーとホットドッグを買って公園で朝ごはん→三鷹までのんびり歩くのが◎",
    tags: ["ホットドッグ", "コーヒー", "井の頭公園"], address: "東京都三鷹市井の頭3-31-16",
    hours: "金 15:00〜21:00 / 土日祝 9:00〜18:30目安", holiday: "月〜木中心", budget: "1,000〜3,000円目安",
    officialUrl: "", instagramUrl: "https://www.instagram.com/waad_is_yours/", note: "営業日・時間はInstagram/Googleマップ確認推奨。" },
  { name: "ブルースカイコーヒー", pinType: "お茶・カフェ", genre: "コーヒースタンド", group: "inokashira", distance: "井の頭公園内",
    comment: "井の頭公園散歩の途中に寄れるコーヒースタンド。",
    tags: ["コーヒー", "公園", "テイクアウト"], address: "東京都三鷹市井の頭4-1-1 井の頭公園内",
    hours: "10:00〜18:00", holiday: "水曜中心。花見時期・荒天時など変動あり", budget: "〜1,000円目安",
    officialUrl: "https://blueskycoffee.jp/", instagramUrl: "https://www.instagram.com/blueskycoffee23/", note: "公式・SNSで最新営業情報確認推奨。" },
  { name: "NEPO", pinType: "夜・音楽", genre: "ライブハウス・カフェ/バー", group: "inokashira", distance: "SCOOLから少し歩く / 井の頭公園方面",
    comment: "大竹美希さんも時々演奏されるライブハウス。昼はサンドイッチあり。",
    tags: ["音楽", "夜", "サンドイッチ"], address: "東京都三鷹市下連雀1-17-4 GRATO井の頭公園 B1",
    hours: "イベントにより異なる", holiday: "イベントにより異なる", budget: "",
    officialUrl: "https://nepo.co.jp/", instagramUrl: "", note: "ライブハウス・カフェ/バー系スポット。" },
  { name: "Eucal", pinType: "ご飯", genre: "イタリアン・ビストロ", group: "inokashira", distance: "SCOOLから少し歩く",
    comment: "予算高めのレストランなのですが、超おいしいです。遅刻厳禁店舗ですw",
    tags: ["イタリアン", "ごほうび", "ゆっくり"], address: "東京都三鷹市下連雀1-14-1",
    hours: "水〜金 17:00〜23:00 / 土日 12:00〜15:00・17:00〜22:00目安", holiday: "月曜・火曜", budget: "3,000〜6,000円目安",
    officialUrl: "", instagramUrl: "https://www.instagram.com/eucal_mitaka/", note: "予約・営業時間はInstagram/電話で確認推奨。" },
  { name: "バードサンクチュアリ（小鳥の森）", pinType: "自然・公園", genre: "自然観察・公園スポット", group: "inokashira", distance: "井の頭公園 西園方面（かなり歩く）",
    comment: "井の頭公園の西園と第二公園の間にある、鳥たちのための静かなエリア。森の中には入れませんが、観察窓からそっとのぞけます。お店ではありませんが、井の頭公園方面まで歩くなら少し立ち寄ると散歩感が出て素敵です。",
    tags: ["自然", "野鳥", "静か", "散歩ついで"], address: "東京都三鷹市牟礼4丁目22-38付近",
    hours: "公園内スポットのため常時散策可（観察は明るい時間帯推奨）", holiday: "なし", budget: "無料",
    officialUrl: "https://www.kensetsu.metro.tokyo.lg.jp/jimusho/seibuk/inokashira", instagramUrl: "",
    note: "正式な店舗ではなく自然観察スポット。フェンス内には入らず、静かに観察を。" },
  { name: "三鷹の森ジブリ美術館", pinType: "文化・美術館", genre: "美術館・文化スポット", group: "inokashira", distance: "井の頭公園 西園内（かなり歩く）",
    comment: "井の頭公園 西園内にある文化スポット。入場は日時指定の予約制なので、ふらっと入るというより、外観や周辺の雰囲気も含めて井の頭公園方面の目印に。チケットがあれば、イベント前後の予定に組み込むのも楽しそうです。",
    tags: ["美術館", "ジブリ", "予約制", "写真映え"], address: "東京都三鷹市下連雀1-1-83",
    hours: "10:00〜18:00目安（入場時間指定制）", holiday: "火曜休館中心。長期・臨時休館あり", budget: "大人・大学生 1,000円目安",
    officialUrl: "https://www.ghibli-museum.jp/", instagramUrl: "",
    note: "入場には日時指定チケットが必要。開館日・入場時間・休館日は変更の場合あり。来館前に公式サイトを確認。" },
];

const shops = shopsRaw.map((s, i) => ({ ...s, id: "shop" + i, cat: pinToCat[s.pinType] }));

const groups = [
  { key: "mitaka", en: "Around Mitaka", jp: "三鷹駅・SCOOL周辺" },
  { key: "inokashira", en: "Inokashira Park", jp: "井の頭公園方面" },
];

const route = {
  title: "井の頭公園を抜けてSCOOLへ", time: "約60分",
  desc: "井の頭線で井の頭公園駅へ。WAADでコーヒーとホットドッグを買って公園で朝ごはん、散歩しながらのんびり三鷹SCOOLへ向かうコースです。",
  steps: [
    { label: "井の頭公園駅" },
    { label: "WAAD" },
    { label: "井の頭公園で朝ごはん", note: "ブルースカイコーヒー：WAADでホットドッグだけ買うなら、コーヒーはこちらで。" },
    { label: "NEPO" },
    { label: "三鷹SCOOL" },
  ],
};

function Reveal({ children, delay = 0, as: Tag = "div", className = "", style = {}, id }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el); return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} id={id} className={className} style={{ ...style, opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : "translateY(22px)", transition: `opacity .85s cubic-bezier(.2,.7,.2,1) ${delay}s, transform .85s cubic-bezier(.2,.7,.2,1) ${delay}s` }}>
      {children}
    </Tag>
  );
}

const Pin = ({ color, s = 15 }) => (
  <svg width={s} height={s} viewBox="-12 -12 24 24" style={{ display: "block" }}>
    <path d="M0 -9 C5 -9 8 -6 8 -1 C8 5 0 11 0 11 C0 11 -8 5 -8 -1 C-8 -6 -5 -9 0 -9 Z" fill="none" stroke={color} strokeWidth="2" />
    <circle cx="0" cy="-1" r="2.6" fill={color} />
  </svg>
);
const Ext = ({ color, s = 13 }) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 13v6H5V6h6" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const Insta = ({ color, s = 13 }) => (<svg width={s} height={s} viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="5" fill="none" stroke={color} strokeWidth="2" /><circle cx="12" cy="12" r="4" fill="none" stroke={color} strokeWidth="2" /><circle cx="17.2" cy="6.8" r="1.2" fill={color} /></svg>);
const XIcon = ({ color, s = 13 }) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M4 4l16 16M20 4L4 20" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" /></svg>);
const TelIcon = ({ color, s = 13 }) => (<svg width={s} height={s} viewBox="0 0 24 24"><path d="M6 3h3.2l1.6 4.4-2.3 1.6c.9 2 2.5 3.6 4.5 4.5l1.6-2.3L20 14.8V18c0 1.1-.9 2-2 2C10.8 20 4 13.2 4 5c0-1.1.9-2 2-2z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>);
const Building = ({ col, s = 30 }) => {
  const p = { fill: "none", stroke: col, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" };
  return (<svg width={s} height={s} viewBox="0 0 32 32"><g {...p}>
    <rect x="9" y="8.5" width="14" height="17.5" rx="1" /><path d="M6.5 26h19" />
    <path d="M12.4 12.6h2.2M17.4 12.6h2.2M12.4 16.6h2.2M17.4 16.6h2.2M12.4 20.6h2.2M17.4 20.6h2.2" />
    <path d="M14 26v-2.6h4V26" />
  </g></svg>);
};

function StickyNav() {
  const [active, setActive] = useState(navItems[0].id);
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: "-50% 0px -42% 0px", threshold: 0 });
    navItems.forEach((it) => { const el = document.getElementById(it.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);
  const go = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 30, margin: "0 -20px", padding: "9px 0", background: "rgba(247,241,230,.94)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderBottom: `1px solid ${c.line}`, maxWidth: "100vw" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 7, padding: "0 16px" }}>
        {navItems.map((it) => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => go(it.id)} style={{
              flexShrink: 0, fontFamily: sans, fontSize: 12, fontWeight: on ? 700 : 500,
              color: on ? c.paper : c.ink, background: on ? c.ink : c.paper, border: `1px solid ${on ? c.ink : c.line}`,
              borderRadius: 999, padding: "7px 13px", cursor: "pointer", whiteSpace: "nowrap", transition: "all .25s ease" }}>
              {it.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function Label({ en, jp }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span style={{ fontFamily: latin, fontStyle: "italic", fontSize: 18, color: c.gold, letterSpacing: ".04em" }}>{en}</span>
      <span style={{ width: 26, height: 1, background: c.line }} />
      <span style={{ fontFamily: sans, fontSize: 11.5, color: c.inkSoft, letterSpacing: ".16em" }}>{jp}</span>
    </div>
  );
}

function DetailRow({ k, v }) {
  if (!v) return null;
  return (
    <div className="flex gap-3" style={{ marginBottom: 7 }}>
      <span style={{ fontFamily: sans, fontSize: 11.5, color: c.inkSoft, minWidth: 52, flexShrink: 0 }}>{k}</span>
      <span style={{ fontFamily: sans, fontSize: 12.5, color: c.ink, lineHeight: 1.7 }}>{v}</span>
    </div>
  );
}

function MapPreviewCard() {
  const pins = [[70, 120, "#D7A75C"], [185, 88, "#D6795C"], [150, 205, "#857FAE"], [262, 158, "#B07E54"], [330, 232, "#9BB47E"], [110, 255, "#D98FB0"]];
  return (
    <a href={googleMyMapsShareUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", position: "relative", height: 320, borderRadius: 14, overflow: "hidden", textDecoration: "none", background: `linear-gradient(135deg, ${c.sageBg}, #EAF0E0)` }}>
      <svg viewBox="0 0 400 320" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
        <g stroke="#ffffff" strokeWidth="10" opacity="0.55" strokeLinecap="round">
          <path d="M-20 92 H420" /><path d="M120 -20 V340" /><path d="M-20 232 L200 232 L320 120 L420 120" />
        </g>
        <circle cx="320" cy="245" r="62" fill={c.sage} opacity="0.3" />
        <path d="M40 285C120 225 160 205 200 150S300 85 360 72" fill="none" stroke={c.gold} strokeWidth="2.5" strokeDasharray="2 7" strokeLinecap="round" />
        {pins.map(([x, y, col], i) => (
          <g key={i} transform={`translate(${x},${y})`}>
            <path d="M0 -9 C5 -9 8 -6 8 -1 C8 5 0 11 0 11 C0 11 -8 5 -8 -1 C-8 -6 -5 -9 0 -9 Z" fill={col} stroke="#fff" strokeWidth="1.5" />
            <circle cx="0" cy="-1" r="2.4" fill="#fff" />
          </g>
        ))}
      </svg>
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: c.paper, borderRadius: 16, padding: "18px 22px", textAlign: "center", boxShadow: "0 14px 32px -16px rgba(58,53,46,.5)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><Pin color={c.ink} s={22} /></div>
          <p style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: c.ink, margin: "0 0 4px" }}>三鷹SCOOL 寄り道マップ</p>
          <p style={{ fontFamily: sans, fontSize: 12, color: c.inkSoft, margin: 0 }}>タップでGoogle My Mapsを開く →</p>
        </div>
      </div>
    </a>
  );
}

function SameBuilding() {
  const sb = sameBuilding;
  return (
    <Reveal id="same-building" style={{ scrollMarginTop: 64 }}>
      <div style={{ background: c.paper, border: `1px solid ${c.gold}55`, borderRadius: 22, padding: "22px 22px 24px", marginBottom: 56, boxShadow: "0 14px 34px -26px rgba(58,53,46,.4)" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
          <div style={{ width: 50, height: 50, borderRadius: 999, background: `${c.gold}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Building col={c.gold} s={30} /></div>
          <div style={{ minWidth: 0 }}>
            <span style={{ fontFamily: latin, fontStyle: "italic", fontSize: 15, color: c.gold }}>same building</span>
            <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 600, color: c.ink, margin: "1px 0 0", lineHeight: 1.4 }}>SCOOLと同じ建物で寄れる</h3>
          </div>
        </div>
        <p style={{ fontFamily: sans, fontSize: 11.5, color: c.gold, marginBottom: 10 }}>{sb.genre}　/　{sb.budget}</p>
        <p style={{ fontFamily: sans, fontSize: 13.5, lineHeight: 1.85, color: c.ink, marginBottom: 18 }}>{sb.comment}</p>

        <div className="flex flex-col" style={{ gap: 12 }}>
          {sb.stores.map((st, i) => {
            const links = [{ icon: Pin, label: "マップ", url: gmap(st.name, st.address), primary: true }];
            if (st.officialUrl) links.push({ icon: Ext, label: "公式", url: st.officialUrl });
            if (st.instagramUrl) links.push({ icon: Insta, label: "Instagram", url: st.instagramUrl });
            if (st.xUrl) links.push({ icon: XIcon, label: "X", url: st.xUrl });
            if (st.tel) links.push({ icon: TelIcon, label: "電話", url: `tel:${st.tel}` });
            return (
              <div key={i} style={{ background: c.cream, border: `1px solid ${c.line}`, borderRadius: 16, padding: "15px 16px 16px" }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
                  <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: c.paper, background: c.gold, borderRadius: 999, padding: "2px 9px", flexShrink: 0 }}>{st.floor}</span>
                  <h4 style={{ fontFamily: serif, fontSize: 17, fontWeight: 600, color: c.ink, margin: 0 }}>{st.name}</h4>
                </div>
                <p style={{ fontFamily: sans, fontSize: 11, color: c.gold, marginBottom: 8 }}>{st.genre}</p>
                {st.tagline && <p style={{ fontFamily: sans, fontSize: 12.5, color: c.ink, lineHeight: 1.7, marginBottom: 12 }}>{st.tagline}</p>}
                <DetailRow k="営業" v={st.hours} />
                <DetailRow k="定休" v={st.holiday} />
                <div className="flex flex-wrap gap-1.5" style={{ marginTop: 10 }}>
                  {links.map((l) => (
                    <a key={l.label} href={l.url} target={l.url.startsWith("tel:") ? undefined : "_blank"} rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: sans, fontSize: 11.5, fontWeight: 600, borderRadius: 999, padding: "7px 11px", textDecoration: "none", color: c.ink, background: l.primary ? c.sageBg : c.paper, border: `1px solid ${l.primary ? c.sage : c.line}` }}>
                      <l.icon color={c.ink} s={12} /> {l.label}
                    </a>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ fontFamily: sans, fontSize: 11.5, color: c.inkSoft, lineHeight: 1.7, marginTop: 14 }}>※ {sb.note}</p>
      </div>
    </Reveal>
  );
}

function ShopCard({ shop }) {
  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const accent = catMeta[shop.cat].color;

  const links = [];
  if (shop.officialUrl) links.push({ icon: Ext, label: "公式サイト", short: "公式", url: shop.officialUrl });
  if (shop.instagramUrl) links.push({ icon: Insta, label: "Instagram", short: "Insta", url: shop.instagramUrl });
  if (shop.xUrl) links.push({ icon: XIcon, label: "X (旧Twitter)", short: "X", url: shop.xUrl });
  const useShort = links.length >= 3;

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ background: c.paper, border: `1px solid ${c.line}`, borderRadius: 22, overflow: "hidden",
        boxShadow: hover ? "0 22px 40px -24px rgba(58,53,46,.35)" : "0 8px 24px -20px rgba(58,53,46,.22)",
        transform: hover ? "translateY(-4px)" : "none", transition: "transform .4s cubic-bezier(.2,.7,.2,1), box-shadow .4s ease",
        display: "flex", flexDirection: "column" }}>
      <div style={{ height: 5, background: accent }} />
      <div style={{ padding: "20px 20px 22px" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
          <div style={{ width: 50, height: 50, borderRadius: 999, background: `${accent}1f`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Illu cat={shop.cat} col={accent} s={30} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontFamily: sans, fontSize: 11, fontWeight: 700, color: accent, background: `${accent}1c`, padding: "3px 10px", borderRadius: 999 }}>{catMeta[shop.cat].label}</span>
            <div className="flex items-center gap-1" style={{ marginTop: 6, fontFamily: sans, fontSize: 11, color: c.inkSoft }}>
              <Pin color={c.inkSoft} s={11} /> <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shop.distance}</span>
            </div>
          </div>
        </div>

        <h3 style={{ fontFamily: serif, fontSize: 20, fontWeight: 600, color: c.ink, marginBottom: 3, letterSpacing: ".02em", lineHeight: 1.4 }}>{shop.name}</h3>
        <p style={{ fontFamily: sans, fontSize: 11.5, color: c.gold, marginBottom: 10 }}>{shop.genre}{shop.budget ? `　/　${shop.budget}` : ""}</p>
        <p style={{ fontFamily: sans, fontSize: 13.5, lineHeight: 1.85, color: c.ink, marginBottom: 16 }}>{shop.comment}</p>

        <div style={{ height: 1, background: c.line, marginBottom: 14 }} />
        <div className="flex flex-wrap gap-1.5 mb-5">
          {shop.tags.map((t) => (<span key={t} style={{ fontFamily: sans, fontSize: 11, color: c.inkSoft, border: `1px solid ${c.line}`, borderRadius: 999, padding: "4px 10px" }}>{t}</span>))}
        </div>

        <a href={gmap(shop.name, shop.address)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2"
          style={{ ...mapBtnStyle, fontFamily: sans, fontSize: 13.5, borderRadius: 12, padding: "12px", textDecoration: "none", marginBottom: 8 }}>
          <Pin color={c.ink} s={14} /> Googleマップで開く
        </a>

        {links.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(links.length, 3)}, 1fr)`, gap: 8, marginBottom: 8 }}>
            {links.map((l) => (
              <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5"
                style={{ background: c.paper, color: c.ink, fontFamily: sans, fontSize: 12.5, fontWeight: 600, border: `1px solid ${c.line}`, borderRadius: 12, padding: "11px 4px", textDecoration: "none" }}>
                <l.icon color={c.ink} /> {useShort ? l.short : l.label}
              </a>
            ))}
          </div>
        )}

        <button onClick={() => setOpen((v) => !v)} style={{ display: "block", width: "100%", textAlign: "center", background: c.beige, color: c.ink, fontFamily: sans, fontSize: 12.5, fontWeight: 600, borderRadius: 12, padding: "11px", border: "none", cursor: "pointer" }}>
          詳しく見る {open ? "▲" : "▼"}
        </button>

        <div style={{ maxHeight: open ? 640 : 0, overflow: "hidden", transition: "max-height .5s cubic-bezier(.2,.7,.2,1)" }}>
          <div style={{ background: c.cream, borderRadius: 14, padding: "16px 16px 12px", marginTop: 10 }}>
            <DetailRow k="住所" v={shop.address} />
            {shop.subStores ? (
              <>
                <DetailRow k="営業時間" v="店舗ごとに異なります" />
                {shop.subStores.map((ss, i) => (
                  <div key={i} style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${c.line}` }}>
                    <p style={{ fontFamily: serif, fontSize: 14, fontWeight: 600, color: c.ink, marginBottom: 2 }}>{ss.name}</p>
                    <p style={{ fontFamily: sans, fontSize: 11, color: c.gold, marginBottom: 8 }}>{ss.genre}</p>
                    <DetailRow k="営業" v={ss.hours} />
                    <DetailRow k="定休" v={ss.holiday} />
                    <div className="flex gap-3" style={{ marginTop: 4 }}>
                      {ss.officialUrl && <a href={ss.officialUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: sans, fontSize: 11.5, color: c.ink, textDecoration: "underline" }}>公式 ↗</a>}
                      {ss.instagramUrl && <a href={ss.instagramUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: sans, fontSize: 11.5, color: c.ink, textDecoration: "underline" }}>Instagram ↗</a>}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <DetailRow k="営業時間" v={shop.hours} />
                <DetailRow k="定休日" v={shop.holiday} />
                <DetailRow k="予算" v={shop.budget} />
              </>
            )}
            {shop.note && (<p style={{ fontFamily: sans, fontSize: 11.5, color: c.inkSoft, lineHeight: 1.7, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${c.line}` }}>※ {shop.note}</p>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const anchor = { scrollMarginTop: 64 };
  return (
    <div style={{ background: c.cream, color: c.ink, fontFamily: sans, position: "relative", overflowX: "clip" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Zen+Kaku+Gothic+New:wght@400;500;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&display=swap');
        @keyframes floaty { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)} }
        ::selection { background:${c.sage}; color:#fff; }
        .hide-scroll::-webkit-scrollbar{ display:none; }
        .hide-scroll{ -ms-overflow-style:none; scrollbar-width:none; }
        html{ scroll-behavior:smooth; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -150, right: -120, width: 360, height: 360, borderRadius: "50%", background: `radial-gradient(circle at 30% 30%, ${c.sageBg}, transparent 70%)`, filter: "blur(8px)", animation: "floaty 9s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: -130, left: -150, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle at 50% 50%, ${c.beige}, transparent 72%)`, filter: "blur(6px)", animation: "floaty 11s ease-in-out infinite" }} />
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.035, mixBlendMode: "multiply" }}>
          <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" /></filter><rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 560, margin: "0 auto", padding: "0 20px" }}>

        <div className="flex items-center justify-between" style={{ padding: "20px 2px 14px" }}>
          <span style={{ fontFamily: latin, fontStyle: "italic", fontSize: 16, color: c.ink, letterSpacing: ".03em" }}>Mitaka SCOOL</span>
          <span style={{ fontFamily: sans, fontSize: 10.5, color: c.inkSoft, letterSpacing: ".18em" }}>寄り道ガイド</span>
        </div>

        <StickyNav />

        <header style={{ padding: "48px 0 52px", textAlign: "center" }}>
          <Reveal><p style={{ fontFamily: latin, fontStyle: "italic", fontSize: 21, color: c.gold, marginBottom: 18, letterSpacing: ".05em" }}>a little detour guide</p></Reveal>
          <Reveal delay={0.08}>
            <h1 style={{ fontFamily: serif, fontWeight: 600, color: c.ink, lineHeight: 1.55, fontSize: "clamp(28px, 8.5vw, 40px)", letterSpacing: ".04em", margin: "0 0 4px" }}>イベントの前後に、</h1>
            <h1 style={{ fontFamily: serif, fontWeight: 600, color: c.ink, lineHeight: 1.55, fontSize: "clamp(28px, 8.5vw, 40px)", letterSpacing: ".04em", margin: 0 }}>小さな<span style={{ color: c.sage }}>寄り道</span>を。</h1>
          </Reveal>
          <Reveal delay={0.18}><div style={{ margin: "26px 0 22px" }}><HeroArt /></div></Reveal>
          <Reveal delay={0.24}>
            <p style={{ fontFamily: sans, fontSize: 13.5, lineHeight: 2, color: c.inkSoft, margin: "0 auto" }}>地元の人が教えてくれる、三鷹SCOOLのまわりと<br />井の頭公園のちょっといいお店だけを、そっと集めました。</p>
          </Reveal>
          <Reveal delay={0.34}>
            <div style={{ marginTop: 34, display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 7, color: c.inkSoft }}>
              <span style={{ fontFamily: latin, fontStyle: "italic", fontSize: 13 }}>scroll</span>
              <svg width="13" height="20" viewBox="0 0 14 22" style={{ animation: "bob 1.8s ease-in-out infinite" }}><path d="M7 1v18M2 14l5 5 5-5" fill="none" stroke={c.inkSoft} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </Reveal>
        </header>

        <Reveal>
          <div style={{ background: c.paper, border: `1px solid ${c.gold}55`, borderRadius: 22, padding: "20px 22px", marginBottom: 24 }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 12 }}>
              <div style={{ width: 50, height: 50, borderRadius: 999, background: `${c.gold}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Illu cat="venue" col={c.gold} s={30} /></div>
              <div>
                <span style={{ fontFamily: latin, fontStyle: "italic", fontSize: 15, color: c.gold }}>start point</span>
                <h3 style={{ fontFamily: serif, fontSize: 21, fontWeight: 600, color: c.ink, margin: "1px 0 0" }}>三鷹SCOOL</h3>
              </div>
            </div>
            <p style={{ fontFamily: sans, fontSize: 12.5, color: c.inkSoft, lineHeight: 1.7, marginBottom: 14 }}>{scool.address}<br />今回の会場です。ここを起点に、前後の寄り道先を探してください。</p>
            <div className="flex" style={{ gap: 8 }}>
              <a href={gmap(scool.name, scool.address)} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5" style={{ ...mapBtnStyle, flex: 1, fontFamily: sans, fontSize: 12.5, borderRadius: 12, padding: "11px", textDecoration: "none" }}><Pin color={c.ink} s={13} /> マップ</a>
              <a href={scool.officialUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5" style={{ flex: 1, background: c.paper, color: c.ink, fontFamily: sans, fontSize: 12.5, fontWeight: 600, border: `1px solid ${c.line}`, borderRadius: 12, padding: "11px", textDecoration: "none" }}><Ext color={c.ink} /> 公式</a>
            </div>
          </div>
        </Reveal>

        <section id="map" style={{ ...anchor, padding: "0 0 64px" }}>
          <Reveal><Label en="Map" jp="MITAKA SCOOL MAP" /></Reveal>
          <Reveal delay={0.05}>
            <h2 style={{ fontFamily: serif, fontSize: "clamp(21px, 5.5vw, 27px)", fontWeight: 600, color: c.ink, letterSpacing: ".03em", marginBottom: 12 }}>正確な場所はGoogleマップで確認</h2>
            <p style={{ fontFamily: sans, fontSize: 13.5, lineHeight: 1.95, color: c.inkSoft, marginBottom: 22 }}>三鷹SCOOLと、イベント前後に立ち寄りやすいおすすめ店だけをまとめた専用マップです。気になるピンをクリックして、場所や移動感を確認できます。</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ background: c.paper, border: `1px solid ${c.line}`, borderRadius: 22, padding: 10, boxShadow: "0 26px 50px -34px rgba(58,53,46,.4)" }}>
              <div className="flex items-center justify-between" style={{ padding: "3px 6px 10px" }}>
                <span className="flex items-center gap-2" style={{ fontFamily: sans, fontSize: 11.5, color: c.inkSoft, letterSpacing: ".08em" }}><Pin color={c.gold} s={12} /> RECOMMEND MAP</span>
                <span className="flex gap-1.5"><span style={{ width: 7, height: 7, borderRadius: 99, background: c.beige }} /><span style={{ width: 7, height: 7, borderRadius: 99, background: c.sageBg }} /><span style={{ width: 7, height: 7, borderRadius: 99, background: c.line }} /></span>
              </div>
              <div style={{ borderRadius: 14, overflow: "hidden" }}>
                {isPlaceholder(googleMyMapsEmbedUrl) ? (
                  <div style={{ height: 320, background: c.sageBg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 24 }}>
                    <div style={{ marginBottom: 14, animation: "floaty 4s ease-in-out infinite" }}><Pin color={c.sage} s={38} /></div>
                    <p style={{ fontFamily: serif, fontSize: 16, fontWeight: 600, color: c.ink }}>Google My Maps 埋め込みエリア</p>
                  </div>
                ) : enableInlineMapEmbed ? (
                  <iframe src={googleMyMapsEmbedUrl} width="100%" height="460" style={{ border: 0, display: "block" }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="三鷹SCOOL 寄り道マップ" />
                ) : (
                  <MapPreviewCard />
                )}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p style={{ fontFamily: sans, fontSize: 11.5, color: c.inkSoft, marginTop: 14, lineHeight: 1.7 }}>※ 地図をタップすると、Google My Maps（今回のレコメンド店だけを表示）が開きます。<br />※ 営業時間・定休日は変更される場合があるため、来店前に公式情報をご確認ください。</p>
          </Reveal>
        </section>

        <SameBuilding />

        <section style={{ padding: "0 0 56px" }}>
          <Reveal><Label en="Shops" jp="RECOMMEND SHOPS" /></Reveal>
          {groups.map((g) => {
            const list = shops.filter((s) => s.group === g.key);
            if (list.length === 0) return null;
            return (
              <div key={g.key} id={`area-${g.key}`} style={{ ...anchor, marginBottom: 44 }}>
                <Reveal>
                  <div className="flex items-baseline gap-3" style={{ marginBottom: 18 }}>
                    <h3 style={{ fontFamily: serif, fontSize: 19, fontWeight: 600, color: c.ink, whiteSpace: "nowrap" }}>{g.jp}</h3>
                    <span style={{ fontFamily: latin, fontStyle: "italic", fontSize: 14, color: c.inkSoft, whiteSpace: "nowrap" }}>{g.en}</span>
                    <span style={{ flex: 1, height: 1, background: c.line }} />
                  </div>
                </Reveal>
                <div className="flex flex-col" style={{ gap: 16 }}>
                  {list.map((s, i) => (<Reveal key={s.id} delay={(i % 2) * 0.05}><ShopCard shop={s} /></Reveal>))}
                </div>
              </div>
            );
          })}
        </section>

        <section id="route" style={{ ...anchor, padding: "0 0 72px" }}>
          <Reveal><Label en="Route" jp="WALKING ROUTE" /></Reveal>
          <Reveal delay={0.05}>
            <div style={{ background: c.sageBg, border: `1px solid ${c.sage}88`, borderRadius: 22, padding: "24px 22px 26px", position: "relative", overflow: "hidden" }}>
              <div className="flex flex-wrap items-baseline gap-3" style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: sans, fontSize: 10.5, fontWeight: 700, color: c.paper, background: c.sage, borderRadius: 999, padding: "3px 11px", letterSpacing: ".05em" }}>おすすめ</span>
                <span style={{ fontFamily: sans, fontSize: 11.5, color: c.ink, border: `1px solid ${c.sage}`, borderRadius: 999, padding: "3px 11px", background: c.paper }}>{route.time}</span>
              </div>
              <h3 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: c.ink, marginBottom: 10 }}>{route.title}</h3>
              <p style={{ fontFamily: sans, fontSize: 13.5, color: c.ink, lineHeight: 1.9, marginBottom: 22 }}>{route.desc}</p>
              <div style={{ position: "relative" }}>
                {route.steps.map((step, j) => (
                  <div key={j} className="flex items-start gap-3" style={{ position: "relative", paddingBottom: j < route.steps.length - 1 ? 18 : 0 }}>
                    {j < route.steps.length - 1 && (<span style={{ position: "absolute", left: 7, top: 18, bottom: 0, width: 2, background: `repeating-linear-gradient(${c.sage} 0 4px, transparent 4px 9px)` }} />)}
                    <span style={{ width: 16, height: 16, borderRadius: 99, background: c.paper, border: `2px solid ${c.sage}`, marginTop: 2, flexShrink: 0, zIndex: 1 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontFamily: sans, fontSize: 15, color: c.ink, fontWeight: 600 }}>{step.label}</span>
                      {step.note && (<p style={{ fontFamily: sans, fontSize: 12, color: c.inkSoft, lineHeight: 1.7, marginTop: 4, background: c.paper, border: `1px solid ${c.line}`, borderRadius: 10, padding: "8px 11px" }}>{step.note}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        <Reveal>
          <section style={{ background: c.beige, border: `1px solid ${c.line}`, borderRadius: 22, padding: "24px 22px 26px", marginBottom: 56 }}>
            <h2 style={{ fontFamily: serif, fontSize: 16.5, fontWeight: 600, color: c.ink, marginBottom: 14 }}>ご利用にあたって</h2>
            {["掲載店舗は三鷹SCOOL周辺と井の頭公園方面のおすすめをまとめたものです。",
              "営業時間・定休日・メニューは変更される場合があります。来店前に各店の公式情報・SNSをご確認ください。",
              "正確な位置・経路は、ページ上部の全体MAP（My Maps）でご確認ください。"].map((t, i) => (
              <div key={i} className="flex gap-2.5" style={{ marginBottom: 9 }}>
                <span style={{ color: c.sage, fontWeight: 700 }}>—</span>
                <p style={{ fontFamily: sans, fontSize: 12.5, lineHeight: 1.8, color: c.ink, margin: 0 }}>{t}</p>
              </div>
            ))}
          </section>
        </Reveal>

        <footer style={{ textAlign: "center", padding: "20px 0 52px", borderTop: `1px solid ${c.line}` }}>
          <p style={{ fontFamily: latin, fontStyle: "italic", fontSize: 17, color: c.ink, marginBottom: 5 }}>Mitaka SCOOL</p>
          <p style={{ fontFamily: sans, fontSize: 10.5, color: c.inkSoft, letterSpacing: ".18em" }}>寄り道ガイド</p>
        </footer>
      </div>
    </div>
  );
}
