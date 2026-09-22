/**
 * 运费计算器 - 核心逻辑测试
 * 用 Node.js 运行：node test.js
 */

// 复制 app.js 中的核心数据和函数
const REGIONS = [
  "舟山", "延安",
  "北京", "天津", "上海", "重庆",
  "河北", "山西", "辽宁", "吉林", "黑龙江",
  "江苏", "浙江", "安徽", "福建", "江西", "山东",
  "河南", "湖北", "湖南", "广东", "海南",
  "四川", "贵州", "云南", "陕西", "甘肃", "青海",
  "内蒙古", "广西", "宁夏", "新疆", "西藏",
  "香港", "澳门", "台湾",
];

const NO_SHIP = new Set(["新疆", "西藏"]);

const SPECIAL_RATE = new Map([
  ["海南", 4], ["甘肃", 2.5], ["青海", 2.5],
  ["云南", 2], ["宁夏", 2],
  ["四川", 1.8], ["福建", 1.8], ["吉林", 1.8],
  ["舟山", 1.8], ["延安", 1.8],
  ["广西", 1.8], ["贵州", 1.8],
]);

const COMMON_UPTO12_HIGH = new Set([
  "甘肃", "宁夏", "云南", "广西", "青海", "贵州", "海南", "内蒙古",
]);

const REGION_ALIASES = new Map([
  ["内蒙", "内蒙古"], ["内蒙古自治区", "内蒙古"],
  ["广西自治区", "广西"], ["广西壮族自治区", "广西"],
  ["宁夏自治区", "宁夏"], ["宁夏回族自治区", "宁夏"],
  ["新疆维吾尔自治区", "新疆"], ["西藏自治区", "西藏"],
  ["香港特别行政区", "香港"], ["澳门特别行政区", "澳门"],
  ["北京市", "北京"], ["天津市", "天津"],
  ["上海市", "上海"], ["重庆市", "重庆"],
]);

const CITY_TO_PROVINCE = {
  "北京": "北京", "朝阳": "北京", "海淀": "北京", "丰台": "北京",
  "东城": "北京", "西城": "北京", "通州": "北京", "大兴": "北京",
  "昌平": "北京", "顺义": "北京", "房山": "北京", "石景山": "北京",
  "上海": "上海", "浦东": "上海", "静安": "上海", "黄埔": "上海",
  "徐汇": "上海", "长宁": "上海", "普陀": "上海", "虹口": "上海",
  "杨浦": "上海", "宝山": "上海", "闵行": "上海", "松江": "上海",
  "嘉定": "上海", "奉贤": "上海", "青浦": "上海",
  "天津": "天津", "滨海": "天津", "和平": "天津", "河西": "天津",
  "南开": "天津", "河东": "天津", "河北": "天津",
  "重庆": "重庆", "渝中": "重庆", "江北": "重庆", "南岸": "重庆",
  "九龙坡": "重庆", "沙坪坝": "重庆", "渝北": "重庆",
  "合肥": "安徽", "芜湖": "安徽", "蚌埠": "安徽", "淮南": "安徽",
  "马鞍山": "安徽", "淮北": "安徽", "铜陵": "安徽", "安庆": "安徽",
  "黄山": "安徽", "滁州": "安徽", "阜阳": "安徽", "宿州": "安徽",
  "六安": "安徽", "亳州": "安徽", "池州": "安徽", "宣城": "安徽",
  "巢湖": "安徽", "桐城": "安徽", "天长": "安徽", "宁国": "安徽",
  "明光": "安徽", "界首": "安徽",
  "福州": "福建", "厦门": "福建", "莆田": "福建", "三明": "福建",
  "泉州": "福建", "漳州": "福建", "南平": "福建", "龙岩": "福建",
  "宁德": "福建", "晋江": "福建", "石狮": "福建", "南安": "福建",
  "福清": "福建", "福鼎": "福建",
  "兰州": "甘肃", "嘉峪关": "甘肃", "金昌": "甘肃", "白银": "甘肃",
  "天水": "甘肃", "武威": "甘肃", "张掖": "甘肃", "平凉": "甘肃",
  "酒泉": "甘肃", "庆阳": "甘肃", "定西": "甘肃", "陇南": "甘肃",
  "临夏": "甘肃", "合作": "甘肃", "玉门": "甘肃", "敦煌": "甘肃",
  "广州": "广东", "深圳": "广东", "珠海": "广东", "汕头": "广东",
  "佛山": "广东", "韶关": "广东", "湛江": "广东", "肇庆": "广东",
  "江门": "广东", "茂名": "广东", "惠州": "广东", "梅州": "广东",
  "汕尾": "广东", "河源": "广东", "阳江": "广东", "清远": "广东",
  "东莞": "广东", "中山": "广东", "潮州": "广东", "揭阳": "广东",
  "云浮": "广东", "东莞": "广东",
  "南宁": "广西", "柳州": "广西", "桂林": "广西", "梧州": "广西",
  "北海": "广西", "防城港": "广西", "钦州": "广西", "贵港": "广西",
  "玉林": "广西", "百色": "广西", "贺州": "广西", "河池": "广西",
  "来宾": "广西", "崇左": "广西",
  "贵阳": "贵州", "六盘水": "贵州", "遵义": "贵州", "安顺": "贵州",
  "毕节": "贵州", "铜仁": "贵州",
  "海口": "海南", "三亚": "海南", "三沙": "海南", "儋州": "海南",
  "琼海": "海南", "文昌": "海南", "万宁": "海南", "东方": "海南",
  "五指山": "海南",
  "石家庄": "河北", "唐山": "河北", "秦皇岛": "河北", "邯郸": "河北",
  "邢台": "河北", "保定": "河北", "张家口": "河北", "承德": "河北",
  "沧州": "河北", "廊坊": "河北", "衡水": "河北",
  "郑州": "河南", "开封": "河南", "洛阳": "河南", "平顶山": "河南",
  "安阳": "河南", "鹤壁": "河南", "新乡": "河南", "焦作": "河南",
  "濮阳": "河南", "许昌": "河南", "漯河": "河南", "三门峡": "河南",
  "南阳": "河南", "商丘": "河南", "信阳": "河南", "周口": "河南",
  "驻马店": "河南", "济源": "河南",
  "哈尔滨": "黑龙江", "齐齐哈尔": "黑龙江", "鸡西": "黑龙江",
  "鹤岗": "黑龙江", "双鸭山": "黑龙江", "大庆": "黑龙江",
  "伊春": "黑龙江", "佳木斯": "黑龙江", "七台河": "黑龙江",
  "牡丹江": "黑龙江", "黑河": "黑龙江", "绥化": "黑龙江",
  "武汉": "湖北", "黄石": "湖北", "十堰": "湖北", "宜昌": "湖北",
  "襄阳": "湖北", "鄂州": "湖北", "荆门": "湖北", "孝感": "湖北",
  "荆州": "湖北", "黄冈": "湖北", "咸宁": "湖北", "随州": "湖北",
  "仙桃": "湖北", "潜江": "湖北", "天门": "湖北", "恩施": "湖北",
  "长沙": "湖南", "株洲": "湖南", "湘潭": "湖南", "衡阳": "湖南",
  "邵阳": "湖南", "岳阳": "湖南", "常德": "湖南", "张家界": "湖南",
  "益阳": "湖南", "郴州": "湖南", "永州": "湖南", "怀化": "湖南",
  "娄底": "湖南", "湘西": "湖南",
  "南京": "江苏", "无锡": "江苏", "徐州": "江苏", "常州": "江苏",
  "苏州": "江苏", "南通": "江苏", "连云港": "江苏", "淮安": "江苏",
  "盐城": "江苏", "扬州": "江苏", "镇江": "江苏", "泰州": "江苏",
  "宿迁": "江苏", "昆山": "江苏", "常熟": "江苏",
  "南昌": "江西", "景德镇": "江西", "萍乡": "江西", "九江": "江西",
  "新余": "江西", "鹰潭": "江西", "赣州": "江西", "吉安": "江西",
  "宜春": "江西", "抚州": "江西", "上饶": "江西",
  "长春": "吉林", "吉林": "吉林", "四平": "吉林", "辽源": "吉林",
  "通化": "吉林", "白山": "吉林", "松原": "吉林", "白城": "吉林",
  "延边": "吉林",
  "沈阳": "辽宁", "大连": "辽宁", "鞍山": "辽宁", "抚顺": "辽宁",
  "本溪": "辽宁", "丹东": "辽宁", "锦州": "辽宁", "营口": "辽宁",
  "阜新": "辽宁", "辽阳": "辽宁", "盘锦": "辽宁", "铁岭": "辽宁",
  "朝阳": "辽宁", "葫芦岛": "辽宁",
  "呼和浩特": "内蒙古", "包头": "内蒙古", "乌海": "内蒙古",
  "赤峰": "内蒙古", "通辽": "内蒙古", "鄂尔多斯": "内蒙古",
  "呼伦贝尔": "内蒙古", "巴彦淖尔": "内蒙古", "乌兰察布": "内蒙古",
  "银川": "宁夏", "石嘴山": "宁夏", "吴忠": "宁夏", "固原": "宁夏",
  "中卫": "宁夏",
  "西宁": "青海", "海东": "青海", "格尔木": "青海", "德令哈": "青海",
  "济南": "山东", "青岛": "山东", "淄博": "山东", "枣庄": "山东",
  "东营": "山东", "烟台": "山东", "潍坊": "山东", "济宁": "山东",
  "泰安": "山东", "威海": "山东", "日照": "山东", "临沂": "山东",
  "德州": "山东", "聊城": "山东", "滨州": "山东", "菏泽": "山东",
  "太原": "山西", "大同": "山西", "阳泉": "山西", "长治": "山西",
  "晋城": "山西", "朔州": "山西", "晋中": "山西", "运城": "山西",
  "忻州": "山西", "临汾": "山西", "吕梁": "山西",
  "西安": "陕西", "铜川": "陕西", "宝鸡": "陕西", "咸阳": "陕西",
  "渭南": "陕西", "汉中": "陕西", "安康": "陕西", "商洛": "陕西",
  "成都": "四川", "自贡": "四川", "攀枝花": "四川", "泸州": "四川",
  "德阳": "四川", "绵阳": "四川", "广元": "四川", "遂宁": "四川",
  "内江": "四川", "乐山": "四川", "南充": "四川", "眉山": "四川",
  "宜宾": "四川", "广安": "四川", "达州": "四川", "雅安": "四川",
  "巴中": "四川", "资阳": "四川",
  "昆明": "云南", "曲靖": "云南", "玉溪": "云南", "保山": "云南",
  "昭通": "云南", "丽江": "云南", "普洱": "云南", "临沧": "云南",
  "杭州": "浙江", "宁波": "浙江", "温州": "浙江", "嘉兴": "浙江",
  "湖州": "浙江", "绍兴": "浙江", "金华": "浙江", "衢州": "浙江",
  "台州": "浙江", "丽水": "浙江",
  // 新疆（不发快递）
  "乌鲁木齐": "新疆", "喀什": "新疆", "克拉玛依": "新疆", "吐鲁番": "新疆",
  "哈密": "新疆", "伊犁": "新疆", "阿克苏": "新疆", "库尔勒": "新疆",
  "昌吉": "新疆", "石河子": "新疆", "和田": "新疆", "塔城": "新疆",
  "阿勒泰": "新疆", "博乐": "新疆", "库车": "新疆", "奎屯": "新疆",
  // 西藏（不发快递）
  "拉萨": "西藏", "日喀则": "西藏", "昌都": "西藏", "林芝": "西藏",
  "山南": "西藏", "那曲": "西藏", "阿里": "西藏",
  // 港澳台
  "香港": "香港", "澳门": "澳门", "台北": "台湾", "高雄": "台湾",
};

const SPECIAL_CITIES = new Set(["舟山", "延安"]);

// ====== normalizeRegion ======
function normalizeRegion(raw) {
  if (!raw) return "";
  let t = String(raw).trim().replace(/\s+/g, "");
  if (!t) return "";

  if (REGION_ALIASES.has(t)) return REGION_ALIASES.get(t);
  if (REGIONS.includes(t)) return t;

  for (const sc of SPECIAL_CITIES) {
    if (t.includes(sc)) return sc;
  }

  const cityKeys = Object.keys(CITY_TO_PROVINCE).sort((a, b) => {
    const pa = CITY_TO_PROVINCE[a], pb = CITY_TO_PROVINCE[b];
    const aNS = NO_SHIP.has(pa) ? 1 : 0, bNS = NO_SHIP.has(pb) ? 1 : 0;
    if (aNS !== bNS) return bNS - aNS;
    return b.length - a.length;
  });
  for (const city of cityKeys) {
    if (t.includes(city)) return CITY_TO_PROVINCE[city];
  }

  const matchOrder = [...REGIONS].sort((a, b) => b.length - a.length);
  for (const key of matchOrder) {
    if (t.includes(key)) return key;
    if (t.includes(key + "省")) return key;
    if (t.includes(key + "市")) return key;
    if (t.includes(key + "自治区")) return key;
    if (t.includes(key + "特别行政区")) return key;
  }

  const t2 = t.replace(/(省|市|自治区|特别行政区)$/g, "");
  if (REGION_ALIASES.has(t2)) return REGION_ALIASES.get(t2);
  if (REGIONS.includes(t2)) return t2;
  if (CITY_TO_PROVINCE[t2]) return CITY_TO_PROVINCE[t2];

  return t2 || t;
}

// ====== parseWeight ======
function parseWeight(raw) {
  const t = String(raw ?? "").trim().replace(/，/g, ".").replace(/[^\d.-]/g, "");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

// ====== formatMoney ======
function formatMoney(n) {
  const fixed = Math.round((n + Number.EPSILON) * 100) / 100;
  return fixed.toFixed(2);
}

// ====== calcShipping ======
function calcShipping({ weightInput, region, ceilWeight }) {
  const regionNorm = normalizeRegion(region);
  const w0 = parseWeight(weightInput);
  if (w0 == null || w0 <= 0) {
    return { ok: false, message: "请输入正确的重量（kg）。", meta: "", money: null, rate: null };
  }
  if (!regionNorm) {
    return { ok: false, message: "请选择地域。", meta: "", money: null, rate: null };
  }
  if (!REGIONS.includes(regionNorm)) {
    return {
      ok: false,
      message: "未识别到省份/地区，请输入完整地址或从下拉建议中选择。",
      meta: `你输入的是：${region}`,
      money: null, rate: null,
    };
  }
  if (NO_SHIP.has(regionNorm)) {
    return { ok: false, message: `${regionNorm} 不发快递。`, meta: "规则：新疆/西藏不发快递", money: null, rate: null };
  }

  const w = ceilWeight ? Math.ceil(w0) : w0;

  if (SPECIAL_RATE.has(regionNorm)) {
    const rate = SPECIAL_RATE.get(regionNorm);
    const money = w * rate;
    return {
      ok: true, money, rate,
      message: `运费：¥${formatMoney(money)}`,
      meta: `命中特殊地区价：${regionNorm} = 重量 × ${rate}；计费重量=${w}`,
    };
  }

  if (w <= 12) {
    const isHigh = COMMON_UPTO12_HIGH.has(regionNorm);
    const rate = isHigh ? 5.5 : 3;
    const money = w * rate;
    return {
      ok: true, money, rate,
      message: `运费：¥${formatMoney(money)}`,
      meta: `常规地址≤12kg：${isHigh ? "指定地区" : "其他地区"} = 重量 × ${rate}；计费重量=${w}`,
    };
  }

  const wForBand = ceilWeight ? w : (w > 12 && w < 13 ? 13 : w);
  let money = 0, meta = "", rate = 1.5;

  if (wForBand >= 13 && wForBand <= 15) {
    money = 15 * 1.5 + 10;
    meta = "常规地址>12kg：13–15kg 按15kg计费 = 15×1.5+10";
  } else if (wForBand >= 16 && wForBand <= 20) {
    money = 20 * 1.5 + 10;
    meta = "常规地址>12kg：16–20kg 按20kg计费 = 20×1.5+10";
  } else if (wForBand >= 21 && wForBand <= 89) {
    money = wForBand * 1.5 + 10;
    meta = "常规地址>12kg：21–89kg = 重量×1.5+10";
  } else if (wForBand >= 90) {
    money = wForBand * 1.5;
    meta = "常规地址>12kg：≥90kg = 重量×1.5";
  } else {
    money = wForBand * 1.5 + 10;
    meta = "常规地址>12kg：兜底使用 重量×1.5+10";
  }

  return {
    ok: true, money, rate,
    message: `运费：¥${formatMoney(money)}`,
    meta: `${meta}；计费重量=${wForBand}`,
  };
}


// ==============================
// 测试运行
// ==============================

let passed = 0, failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ❌ ${name}: ${e.message}`);
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "断言失败");
}

console.log("\n" + "=".repeat(60));
console.log("🧪 测试 1：normalizeRegion 地址识别");
console.log("=".repeat(60));

test("输入省份名：广东", () => assert(normalizeRegion("广东") === "广东"));
test("输入省份名：内蒙古", () => assert(normalizeRegion("内蒙古") === "内蒙古"));
test("输入别名：内蒙", () => assert(normalizeRegion("内蒙") === "内蒙古"));
test("输入别名：新疆维吾尔自治区", () => assert(normalizeRegion("新疆维吾尔自治区") === "新疆"));
test("输入全地址：安徽省阜阳市临泉县人民东路242号", () => assert(normalizeRegion("安徽省阜阳市临泉县人民东路242号") === "安徽"));
test("输入全地址：广东省深圳市南山区科技园", () => assert(normalizeRegion("广东省深圳市南山区科技园") === "广东"));
test("输入城市名：阜阳（应为安徽）", () => assert(normalizeRegion("阜阳") === "安徽"));
test("输入城市名：青岛（应为山东）", () => assert(normalizeRegion("青岛") === "山东"));
test("输入城市名：敦煌（应为甘肃）", () => assert(normalizeRegion("敦煌") === "甘肃"));
test("输入特殊城市：舟山", () => assert(normalizeRegion("舟山") === "舟山"));
test("输入特殊城市：延安", () => assert(normalizeRegion("延安") === "延安"));
test("输入特殊城市地址：舟山市定海区", () => assert(normalizeRegion("舟山市定海区") === "舟山"));

console.log("\n" + "=".repeat(60));
console.log("🧪 测试 2：不发快递地区识别");
console.log("=".repeat(60));

test("西藏省会：拉萨", () => {
  const r = normalizeRegion("拉萨");
  assert(r === "西藏", `期望"西藏"，实际"${r}"`);
  assert(NO_SHIP.has(r), "应在不发快递列表中");
});
test("西藏城市：日喀则", () => {
  const r = normalizeRegion("日喀则");
  assert(r === "西藏");
  assert(NO_SHIP.has(r));
});
test("西藏城市：林芝", () => {
  const r = normalizeRegion("林芝");
  assert(r === "西藏");
  assert(NO_SHIP.has(r));
});
test("新疆省会：乌鲁木齐", () => {
  const r = normalizeRegion("乌鲁木齐");
  assert(r === "新疆", `期望"新疆"，实际"${r}"`);
  assert(NO_SHIP.has(r));
});
test("新疆城市：喀什", () => {
  const r = normalizeRegion("喀什");
  assert(r === "新疆");
  assert(NO_SHIP.has(r));
});
test("西藏完整地址：拉萨市城关区北京中路", () => {
  const r = normalizeRegion("拉萨市城关区北京中路");
  assert(r === "西藏");
  assert(NO_SHIP.has(r));
});
test("新疆完整地址：乌鲁木齐市天山区中山路", () => {
  const r = normalizeRegion("乌鲁木齐市天山区中山路");
  assert(r === "新疆");
  assert(NO_SHIP.has(r));
});

console.log("\n" + "=".repeat(60));
console.log("🧪 测试 3：运费计算 calcShipping");
console.log("=".repeat(60));

test("广东·5kg·向上取整", () => {
  const r = calcShipping({ weightInput: "5", region: "广东", ceilWeight: true });
  assert(r.ok === true, `期望成功，实际：${r.message}`);
  assert(r.money === 15, `期望15，实际${r.money}`);
  assert(r.rate === 3, `期望3，实际${r.rate}`);
});

test("广东·5.1kg·向上取整=6kg", () => {
  const r = calcShipping({ weightInput: "5.1", region: "广东", ceilWeight: true });
  assert(r.ok === true);
  assert(r.money === 18, `期望18（6×3），实际${r.money}`);
});

test("甘肃·5kg·向上取整（特殊地区×2.5）", () => {
  const r = calcShipping({ weightInput: "5", region: "甘肃", ceilWeight: true });
  assert(r.ok === true);
  assert(r.money === 12.5, `期望12.5（5×2.5），实际${r.money}`);
});

test("甘肃·5kg·常规（≤12kg指定地区×5.5）", () => {
  // 甘肃同时是特殊地区（×2.5）和常规高单价区
  // 特殊地区优先，所以应该命中特殊地区
  const r = calcShipping({ weightInput: "5", region: "甘肃", ceilWeight: true });
  assert(r.rate === 2.5, `期望特殊费率2.5，实际${r.rate}`);
});

test("四川·5kg（特殊地区×1.8）", () => {
  const r = calcShipping({ weightInput: "5", region: "四川", ceilWeight: true });
  assert(r.ok === true);
  assert(r.rate === 1.8, `期望1.8，实际${r.rate}`);
  assert(r.money === 9, `期望9，实际${r.money}`);
});

test("舟山·10kg（特殊地区×1.8）", () => {
  const r = calcShipping({ weightInput: "10", region: "舟山", ceilWeight: true });
  assert(r.ok === true);
  assert(r.rate === 1.8);
  assert(r.money === 18);
});

test("北京·3kg·常规（≤12kg其他×3）", () => {
  const r = calcShipping({ weightInput: "3", region: "北京", ceilWeight: true });
  assert(r.ok === true);
  assert(r.rate === 3);
  assert(r.money === 9);
});

test("广西·8kg（特殊地区价×1.8优先）", () => {
  const r = calcShipping({ weightInput: "8", region: "广西", ceilWeight: true });
  assert(r.ok === true);
  assert(r.rate === 1.8, `期望1.8，实际${r.rate}`);
  assert(r.money === 14.4, `期望14.4，实际${r.money}`);
});

test("内蒙古·8kg·常规≤12kg（指定地区×5.5）", () => {
  // 内蒙古不在特殊地区列表，在常规高单价区
  const r = calcShipping({ weightInput: "8", region: "内蒙古", ceilWeight: true });
  assert(r.ok === true);
  assert(r.rate === 5.5, `期望5.5，实际${r.rate}`);
  assert(r.money === 44, `期望44，实际${r.money}`);
});

test("广东·14kg（13-15kg段：15×1.5+10=32.5）", () => {
  const r = calcShipping({ weightInput: "14", region: "广东", ceilWeight: true });
  assert(r.ok === true);
  assert(r.money === 32.5, `期望32.5，实际${r.money}`);
});

test("广东·18kg（16-20kg段：20×1.5+10=40）", () => {
  const r = calcShipping({ weightInput: "18", region: "广东", ceilWeight: true });
  assert(r.ok === true);
  assert(r.money === 40, `期望40，实际${r.money}`);
});

test("广东·30kg（21-89kg段：30×1.5+10=55）", () => {
  const r = calcShipping({ weightInput: "30", region: "广东", ceilWeight: true });
  assert(r.ok === true);
  assert(r.money === 55, `期望55，实际${r.money}`);
});

test("广东·100kg（≥90kg段：100×1.5=150）", () => {
  const r = calcShipping({ weightInput: "100", region: "广东", ceilWeight: true });
  assert(r.ok === true);
  assert(r.money === 150, `期望150，实际${r.money}`);
});

console.log("\n" + "=".repeat(60));
console.log("🧪 测试 4：错误场景");
console.log("=".repeat(60));

test("新疆：不发快递", () => {
  const r = calcShipping({ weightInput: "5", region: "新疆", ceilWeight: true });
  assert(r.ok === false);
  assert(r.message.includes("不发快递"), `应提示不发快递，实际：${r.message}`);
});

test("西藏：拉萨输入应提示不发快递", () => {
  const r = calcShipping({ weightInput: "5", region: "拉萨", ceilWeight: true });
  assert(r.ok === false, `应失败，实际：${r.message}`);
  assert(r.message.includes("不发快递"), `应提示不发快递，实际：${r.message}`);
});

test("新疆：乌鲁木齐输入应提示不发快递", () => {
  const r = calcShipping({ weightInput: "5", region: "乌鲁木齐", ceilWeight: true });
  assert(r.ok === false);
  assert(r.message.includes("不发快递"));
});

test("空输入：无重量", () => {
  const r = calcShipping({ weightInput: "", region: "广东", ceilWeight: true });
  assert(r.ok === false);
});

test("空输入：无地域", () => {
  const r = calcShipping({ weightInput: "5", region: "", ceilWeight: true });
  assert(r.ok === false);
});

test("负数重量", () => {
  const r = calcShipping({ weightInput: "-5", region: "广东", ceilWeight: true });
  assert(r.ok === false);
});

test("未知输入：测试不存在的地名", () => {
  const r = calcShipping({ weightInput: "5", region: "火星", ceilWeight: true });
  assert(r.ok === false);
  assert(r.message.includes("未识别"), `应提示未识别，实际：${r.message}`);
});

console.log("\n" + "=".repeat(60));
console.log("🧪 测试 5：parseWeight 解析");
console.log("=".repeat(60));

test("整数", () => assert(parseWeight("12") === 12));
test("小数", () => assert(parseWeight("12.6") === 12.6));
test("中文逗号转点", () => assert(parseWeight("12，5") === 12.5));
test("空字符串", () => assert(parseWeight("") === null));
test("非数字", () => assert(parseWeight("abc") === null));

console.log("\n" + "=".repeat(60));
console.log(`📊 测试结果：${passed} 通过，${failed} 失败`);
console.log("=".repeat(60));

if (failed > 0) process.exit(1);