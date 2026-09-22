/* 运费计算器（离线 H5）v2.5 */

// ==============================
// 常量数据
// ==============================

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

// 城市 → 省份映射
const CITY_TO_PROVINCE = {
  "内蒙古阿拉善高新技术产业开发区": "内蒙古",
  "双江拉祜族佤族布朗族傣族自治县": "云南",
  "积石山保安族东乡族撒拉族自治县": "甘肃",
  "中新苏滁高新技术产业开发区": "安徽",
  "包头稀土高新技术产业开发区": "内蒙古",
  "合肥新站高新技术产业开发区": "安徽",
  "平顶山市城乡一体化示范区": "河南",
  "前郭尔罗斯蒙古族自治县": "吉林",
  "塔什库尔干塔吉克自治县": "新疆",
  "威宁彝族回族苗族自治县": "贵州",
  "孟连傣族拉祜族佤族自治县": "云南",
  "莫力达瓦达斡尔族自治旗": "内蒙古",
  "喀喇沁左翼蒙古族自治县": "辽宁",
  "克孜勒苏柯尔克孜自治州": "新疆",
  "镇沅彝族哈尼族拉祜族自治县": "云南",
  "元江哈尼族彝族傣族自治县": "云南",
  "积石山保安族东乡族撒拉族": "甘肃",
  "镇沅彝族哈尼族拉祜族自治": "云南",
  "元江哈尼族彝族傣族自治": "云南",
  "双江拉祜族佤族布朗族傣族": "云南",
  "孟连傣族拉祜族佤族自治": "云南",
  "前郭尔罗斯蒙古族自治": "吉林",
  "塔什库尔干塔吉克自治": "新疆",
  "威宁彝族回族苗族自治": "贵州",
  "喀喇沁左翼蒙古族自治": "辽宁",
  "克孜勒苏柯尔克孜自治": "新疆",
  "莫力达瓦达斡尔族自治": "内蒙古",
  "金秀瑶族自治县": "广西", "融水苗族自治县": "广西",
  "三江侗族自治县": "广西", "龙胜各族自治县": "广西",
  "巴马瑶族自治县": "广西", "都安瑶族自治县": "广西",
  "大化瑶族自治县": "广西", "罗城仫佬族自治县": "广西",
  "富川瑶族自治县": "广西", "恭城瑶族自治县": "广西",
  "靖州苗族侗族自治县": "湖南", "麻阳苗族自治县": "湖南",
  "芷江侗族自治县": "湖南", "新晃侗族自治县": "湖南",
  "通道侗族自治县": "湖南", "城步苗族自治县": "湖南",
  "连南瑶族自治县": "广东", "连山壮族瑶族自治县": "广东",
  "乳源瑶族自治县": "广东", "阜新蒙古族自治县": "辽宁",
  "新宾满族自治县": "辽宁", "岫岩满族自治县": "辽宁",
  "清原满族自治县": "辽宁", "本溪满族自治县": "辽宁",
  "桓仁满族自治县": "辽宁", "宽甸满族自治县": "辽宁",
  "长白朝鲜族自治县": "吉林", "伊通满族自治县": "吉林",
  "杜尔伯特蒙古族自治县": "黑龙江",
  "景宁畲族自治县": "浙江", "鄂温克族自治旗": "内蒙古",
  "鄂伦春自治旗": "内蒙古", "阿鲁科尔沁旗": "内蒙古",
  "科尔沁右翼中旗": "内蒙古", "科尔沁右翼前旗": "内蒙古",
  "科尔沁左翼中旗": "内蒙古", "科尔沁左翼后旗": "内蒙古",
  "新巴尔虎右旗": "内蒙古", "新巴尔虎左旗": "内蒙古",
  "乌拉特中旗": "内蒙古", "乌拉特前旗": "内蒙古",
  "乌拉特后旗": "内蒙古", "伊金霍洛旗": "内蒙古",
  "克什克腾旗": "内蒙古", "敖汉旗": "内蒙古",
  "扎赉特旗": "内蒙古", "扎鲁特旗": "内蒙古",
  "苏尼特右旗": "内蒙古", "苏尼特左旗": "内蒙古",
  "奈曼旗": "内蒙古", "阿巴嘎旗": "内蒙古",
  "正镶白旗": "内蒙古", "正蓝旗": "内蒙古",
  "翁牛特旗": "内蒙古", "达拉特旗": "内蒙古",
  "鄂托克前旗": "内蒙古", "鄂托克旗": "内蒙古",
  "杭锦旗": "内蒙古", "乌审旗": "内蒙古",
  "准格尔旗": "内蒙古", "土默特右旗": "内蒙古",
  "土默特左旗": "内蒙古", "陈巴尔虎旗": "内蒙古",
  "镶黄旗": "内蒙古", "太仆寺旗": "内蒙古",
  "东乌旗": "内蒙古", "西乌旗": "内蒙古",
  "阿拉善左旗": "内蒙古", "阿拉善右旗": "内蒙古",
  "额济纳旗": "内蒙古", "额尔古纳": "内蒙古",
  "根河": "内蒙古", "霍林郭勒": "内蒙古",
  "阿尔山": "内蒙古", "二连浩特": "内蒙古",
  "满洲里": "内蒙古", "牙克石": "内蒙古",
  "扎兰屯": "内蒙古", "乌兰浩特": "内蒙古",
  "锡林浩特": "内蒙古", "乌兰察布": "内蒙古",
  "鄂尔多斯": "内蒙古", "呼伦贝尔": "内蒙古",
  "巴彦淖尔": "内蒙古", "呼和浩特": "内蒙古",
  "包头": "内蒙古", "乌海": "内蒙古",
  "赤峰": "内蒙古", "通辽": "内蒙古",
  "阿拉善": "内蒙古", "丰镇": "内蒙古",
  // 省直辖县市简写
  "乌鲁木齐": "新疆", "喀什": "新疆", "克拉玛依": "新疆",
  "吐鲁番": "新疆", "哈密": "新疆", "伊犁": "新疆",
  "阿克苏": "新疆", "库尔勒": "新疆", "昌吉": "新疆",
  "石河子": "新疆", "和田": "新疆", "塔城": "新疆",
  "阿勒泰": "新疆", "博乐": "新疆", "伊宁": "新疆",
  "库车": "新疆", "奎屯": "新疆", "阜康": "新疆",
  "阿拉尔": "新疆", "图木舒克": "新疆", "五家渠": "新疆",
  "北屯": "新疆", "铁门关": "新疆", "双河": "新疆",
  "可克达拉": "新疆", "昆玉": "新疆", "胡杨河": "新疆",
  "新星": "新疆",
  "拉萨": "西藏", "日喀则": "西藏", "昌都": "西藏",
  "林芝": "西藏", "山南": "西藏", "那曲": "西藏", "阿里": "西藏",
  "北京": "北京", "上海": "上海", "天津": "天津", "重庆": "重庆",
};
const SPECIAL_CITIES = new Set(["舟山", "延安"]);

const DEFAULT_WEIGHT_SHORTCUTS = [1, 3, 5, 10, 20];
const STORAGE_KEY_SHORTCUTS = "shipping_weight_shortcuts";
const STORAGE_KEY_LIB = "shipping_weight_lib";

// ==============================
// 工具函数
// ==============================

function formatMoney(n) {
  const fixed = Math.round((n + Number.EPSILON) * 100) / 100;
  return fixed.toFixed(2);
}

function parseWeight(raw) {
  const t = String(raw ?? "").trim().replace(/，/g, ".").replace(/[^\d.-]/g, "");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`缺少元素：#${id}`);
  return el;
}

// ---------- 地址识别 ----------

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

function getRegionSuggestions(raw, limit) {
  const q0 = String(raw ?? "").trim().replace(/\s+/g, "");
  if (!q0) return typeof limit === "number" ? REGIONS.slice(0, limit) : [...REGIONS];
  const q = q0.replace(/(省|市|自治区|特别行政区)$/g, "");
  const out = [];
  const push = (x) => { if (!out.includes(x)) out.push(x); };
  const norm = normalizeRegion(q);
  if (REGIONS.includes(norm)) push(norm);
  for (const r of REGIONS) {
    if (typeof limit === "number" && out.length >= limit) break;
    if (r.includes(q) || q.includes(r)) push(r);
  }
  return typeof limit === "number" ? out.slice(0, limit) : out;
}

// ---------- 重量快捷键 ----------

function loadWeightShortcuts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SHORTCUTS);
    if (saved) {
      const arr = JSON.parse(saved);
      if (Array.isArray(arr) && arr.length >= 3 && arr.every((v) => typeof v === "number" && v > 0)) return arr;
    }
  } catch {}
  return [...DEFAULT_WEIGHT_SHORTCUTS];
}

function saveWeightShortcuts(arr) {
  try { localStorage.setItem(STORAGE_KEY_SHORTCUTS, JSON.stringify(arr)); } catch {}
}

// ---------- 重量库 ----------

function loadWeightLib() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LIB);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {};
}

function saveWeightLib(lib) {
  try { localStorage.setItem(STORAGE_KEY_LIB, JSON.stringify(lib)); } catch {}
}

function getLibCount() {
  return Object.keys(loadWeightLib()).length;
}

// ---------- 订单解析 ----------

function parseOrderText(text) {
  const lines = text.split("\n");
  const items = []; // { model, qty, rawLine }
  let currentModel = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // 找货号: 颜色: xxx货号: XXXX
    const m = trimmed.match(/货号:\s*(\S+)/);
    if (m) {
      currentModel = m[1].replace(/[色\s]/g, ""); // 去掉颜色后缀
      // 提取字母数字部分作为型号
      const modelMatch = currentModel.match(/^([A-Za-z0-9]+[-]?[A-Za-z0-9]*)/);
      if (modelMatch) currentModel = modelMatch[1];
    }

    // 找数量: 元/件 或 元/个 后面的数字（价格在前，数量在后）
    const qtyMatch = trimmed.match(/元\/(?:件|个)\s*(\d+)/);
    if (qtyMatch && currentModel) {
      const qty = parseInt(qtyMatch[1], 10);
      items.push({ model: currentModel.toLowerCase(), qty });
      currentModel = null;
    }
  }

  return items;
}

// ---------- 运费计算 ----------

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
    return { ok: false, message: "未识别到省份/地区。", meta: `你输入的是：${region}`, money: null, rate: null };
  }
  if (NO_SHIP.has(regionNorm)) {
    return { ok: false, message: `${regionNorm} 不发快递。`, meta: "规则：新疆/西藏不发快递", money: null, rate: null };
  }

  const w = ceilWeight ? Math.ceil(w0) : w0;

  if (w <= 12) {
    if (COMMON_UPTO12_HIGH.has(regionNorm)) {
      const rate = 5.5;
      return { ok: true, money: w * rate, rate, message: `运费：¥${formatMoney(w * rate)}`, meta: `≤12kg高单价：${regionNorm} = 重量 × ${rate}；计费重量=${w}` };
    }
    const rate = 3;
    return { ok: true, money: w * rate, rate, message: `运费：¥${formatMoney(w * rate)}`, meta: `≤12kg普通价：${regionNorm} = 重量 × ${rate}；计费重量=${w}` };
  }

  if (SPECIAL_RATE.has(regionNorm)) {
    const rate = SPECIAL_RATE.get(regionNorm);
    const money = w * rate + 10;
    return { ok: true, money, rate, message: `运费：¥${formatMoney(money)}`, meta: `>12kg特殊地区价：${regionNorm} = 重量 × ${rate} + 10；计费重量=${w}` };
  }

  const wForBand = ceilWeight ? w : (w > 12 && w < 13 ? 13 : w);
  let money = 0, meta = "", rate = 1.5;

  if (wForBand >= 13 && wForBand <= 15) {
    money = 15 * 1.5 + 10;
    meta = ">12kg阶梯价：13–15kg 按15kg计费 = 15×1.5+10";
  } else if (wForBand >= 16 && wForBand <= 20) {
    money = 20 * 1.5 + 10;
    meta = ">12kg阶梯价：16–20kg 按20kg计费 = 20×1.5+10";
  } else if (wForBand >= 21 && wForBand <= 89) {
    money = wForBand * 1.5 + 10;
    meta = `>12kg阶梯价：21–89kg = 重量×1.5+10；计费重量=${wForBand}`;
  } else if (wForBand >= 90) {
    money = wForBand * 1.5;
    meta = `>12kg阶梯价：≥90kg = 重量×1.5；计费重量=${wForBand}`;
  } else {
    money = wForBand * 1.5 + 10;
    meta = `>12kg阶梯价：兜底使用 重量×1.5+10；计费重量=${wForBand}`;
  }

  return { ok: true, money, rate, message: `运费：¥${formatMoney(money)}`, meta };
}

// ==============================
// UI 渲染
// ==============================

function renderSuggestList(items) {
  const box = $("regionSuggest");
  box.innerHTML = !items || items.length === 0
    ? `<div class="empty">未找到匹配项</div>`
    : items.map((x) => `<div class="item" role="option" data-value="${x}">${x}</div>`).join("");
}

function openSuggest() { $("regionSuggest").classList.add("open"); }
function closeSuggest() { $("regionSuggest").classList.remove("open"); }

function renderResult(payload, { region, w0, wUsed, ceilWeight }) {
  const box = $("result");
  if (!payload.ok) {
    box.innerHTML = `<div class="bad">${payload.message}</div>${payload.meta ? `<div class="meta">${payload.meta}</div>` : ""}`;
    $("copyBtnWrap").innerHTML = "";
    return;
  }
  const moneyText = `¥${formatMoney(payload.money)}`;
  box.innerHTML = `<div class="ok"><span class="money">${moneyText}</span></div>
    <div class="meta">输入重量=${w0}${ceilWeight ? "，向上取整" : ""}；地域=${region}</div>
    ${payload.meta ? `<div class="meta">${payload.meta}</div>` : ""}`;

  const copyText =
`📍 运费明细
省份：${region}
重量：${wUsed} kg
单价：${payload.rate != null ? formatMoney(payload.rate) : "-"} 元/kg
─────────────
💵 总价：${moneyText} 元`;

  $("copyBtnWrap").innerHTML = `<button id="copyBtn" class="btn-secondary btn-full" type="button">📋 复制明细</button>`;
  $("copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(copyText).then(() => {
      const btn = $("copyBtn");
      btn.textContent = "✅ 已复制";
      setTimeout(() => { btn.textContent = "📋 复制明细"; }, 2000);
    }).catch(() => alert("复制失败，请手动复制。"));
  });
}

function renderWeightShortcuts(shortcuts) {
  const wrap = $("weightShortcuts");
  wrap.innerHTML = shortcuts
    .map((v, i) => `<button class="shortcut-pill" data-index="${i}" type="button">${v}kg</button>`).join("")
    + `<button id="editShortcutsBtn" class="shortcut-edit" type="button" title="自定义快捷键">✎</button>`;
}

function renderEditShortcuts(shortcuts) {
  const wrap = $("weightShortcuts");
  wrap.innerHTML = shortcuts
    .map((v, i) => `<input class="shortcut-input" type="number" step="0.1" min="0.1" value="${v}" data-index="${i}" />`).join("")
    + `<button id="saveShortcutsBtn" class="shortcut-edit active" type="button" title="保存">✔</button>`;
}

// ---------- 多商品 ----------

function getProductTotal() {
  const rows = document.querySelectorAll(".product-row");
  let total = 0;
  for (const row of rows) {
    const w = parseFloat(row.querySelector(".pw").value);
    const q = parseInt(row.querySelector(".pq").value, 10);
    if (!isNaN(w) && w > 0 && !isNaN(q) && q > 0) total += w * q;
  }
  return total;
}

function addProductRow() {
  const tbody = document.querySelector("#productTable tbody");
  const row = document.createElement("tr");
  row.className = "product-row";
  row.innerHTML = `<td><input class="pn" type="text" placeholder="选填" autocomplete="off" /></td>
    <td><input class="pw" type="number" step="0.01" min="0" placeholder="0" inputmode="decimal" /></td>
    <td><input class="pq" type="number" min="1" value="1" /></td>
    <td class="ps">0 kg</td>
    <td><button class="del-row" type="button" title="删除">✕</button></td>`;
  tbody.appendChild(row);
  bindRowEvents(row);
  updateProductSummary();
}

function bindRowEvents(row) {
  row.querySelectorAll("input").forEach(inp => inp.addEventListener("input", () => {
    updateRowSubtotal(row);
    updateProductSummary();
  }));
  const del = row.querySelector(".del-row");
  if (del) del.addEventListener("click", () => {
    if (document.querySelectorAll(".product-row").length > 1) { row.remove(); updateProductSummary(); }
  });
}

function updateRowSubtotal(row) {
  const w = parseFloat(row.querySelector(".pw").value);
  const q = parseInt(row.querySelector(".pq").value, 10);
  row.querySelector(".ps").textContent = (!isNaN(w) && w > 0 && !isNaN(q) && q > 0) ? (w * q).toFixed(2) + " kg" : "0 kg";
}

function updateProductSummary() {
  const total = getProductTotal();
  const ceil = $("ceilWeight").checked ? Math.ceil(total) : total;
  const el = $("productTotal");
  if (el) el.textContent = `合计重量：${total.toFixed(2)} kg` + (ceil !== total ? `（向上取整：${ceil} kg）` : "");
}

// ==============================
// 设置页面
// ==============================

function getMode() {
  return document.querySelector(".tab-btn.active")?.dataset?.tab || "single";
}

function switchMode(mode) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === mode));
  ["singleMode", "multiMode", "pasteMode"].forEach(id =>
    document.getElementById(id).classList.toggle("hidden", id.replace("Mode", "") !== mode));
  if (mode === "multi") renderProductRows();
}

function renderProductRows() {
  const tbody = document.querySelector("#productTable tbody");
  if (tbody.querySelectorAll(".product-row").length === 0) addProductRow();
  updateProductSummary();
}

function updateLibStatus() {
  const el = document.getElementById("libCount");
  if (el) el.textContent = getLibCount();
}

function setup() {
  const weightEl = $("weight");
  const regionEl = $("regionInput");
  const suggestEl = $("regionSuggest");
  const ceilEl = $("ceilWeight");
  const btn = $("calcBtn");
  const resetBtn = $("resetBtn");
  const shortcutsWrap = $("weightShortcuts");

  let weightShortcuts = loadWeightShortcuts();
  renderWeightShortcuts(weightShortcuts);
  updateLibStatus();

  // 获取有效重量
  const getEffectiveWeight = () => {
    const mode = getMode();
    if (mode === "multi") return getProductTotal();
    if (mode === "paste") return getParseTotal();
    return parseFloat(weightEl.value) || 0;
  };

  // 计算
  const doCalc = () => {
    const region = regionEl.value;
    const ceilWeight = !!ceilEl.checked;
    const mode = getMode();

    if (mode === "multi") {
      const totalW = getProductTotal();
      if (totalW <= 0) { $("result").innerHTML = `<div class="bad">请填写商品重量。</div>`; $("copyBtnWrap").innerHTML = ""; return; }
      const wUsed = ceilWeight ? Math.ceil(totalW) : totalW;
      const payload = calcShipping({ weightInput: String(wUsed), region, ceilWeight: false });
      renderResult(payload, { region: normalizeRegion(region) || region, w0: totalW.toFixed(2), wUsed, ceilWeight: true });
      return;
    }

    if (mode === "paste") {
      const totalW = getParseTotal();
      if (totalW <= 0) { $("result").innerHTML = `<div class="bad">请先解析订单或填写缺失的重量。</div>`; $("copyBtnWrap").innerHTML = ""; return; }
      const wUsed = ceilWeight ? Math.ceil(totalW) : totalW;
      const payload = calcShipping({ weightInput: String(wUsed), region, ceilWeight: false });
      renderResult(payload, { region: normalizeRegion(region) || region, w0: totalW.toFixed(2), wUsed, ceilWeight: true });
      return;
    }

    const w0 = (weightEl.value ?? "").trim();
    const payload = calcShipping({ weightInput: w0, region, ceilWeight });
    const wParsed = parseWeight(w0);
    const wUsed = wParsed == null ? null : (ceilWeight ? Math.ceil(wParsed) : wParsed);
    renderResult(payload, { region: normalizeRegion(region) || region, w0: wParsed ?? "-", wUsed, ceilWeight });
  };

  // 获取解析结果总重
  function getParseTotal() {
    let total = 0;
    document.querySelectorAll("#parseTable tbody tr").forEach(row => {
      const w = parseFloat(row.querySelector(".pw-input")?.value);
      const q = parseInt(row.querySelector(".pq-val")?.textContent, 10);
      if (!isNaN(w) && w > 0 && !isNaN(q) && q > 0) total += w * q;
    });
    return total;
  }

  // ---------- 标签切换 ----------
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      switchMode(btn.dataset.tab);
      $("result").innerHTML = `<div class="meta">请${({single:"输入重量",multi:"填写商品清单",paste:"粘贴订单"})[getMode()]}后点击"计算"。</div>`;
      $("copyBtnWrap").innerHTML = "";
    });
  });

  // ---------- 解析订单 ----------
  document.getElementById("parseOrderBtn").addEventListener("click", () => {
    const text = document.getElementById("orderText").value;
    if (!text.trim()) { alert("请先粘贴订单内容。"); return; }

    // 自动提取地址
    const addrMatch = text.match(/收货地址[：:]\s*(.+)/);
    if (addrMatch) {
      const rawAddr = addrMatch[1].trim();
      const norm = normalizeRegion(rawAddr);
      if (norm) regionEl.value = norm;
    }

    const items = parseOrderText(text);
    if (items.length === 0) { alert("未识别到货号和数量，请确认粘贴内容格式。"); return; }

    const lib = loadWeightLib();
    const tbody = document.querySelector("#parseTable tbody");
    tbody.innerHTML = "";
    let matched = 0, unmatched = 0;

    for (const item of items) {
      const weight = lib[item.model.toLowerCase()];
      const row = document.createElement("tr");
      if (weight != null) {
        matched++;
        row.innerHTML = `<td>${item.model}</td><td class="pq-val">${item.qty}</td>
          <td>${weight}</td><td>${(weight * item.qty).toFixed(2)} kg</td>`;
      } else {
        unmatched++;
        row.innerHTML = `<td>${item.model}</td><td class="pq-val">${item.qty}</td>
          <td><input class="pw-input" type="number" step="0.01" min="0" placeholder="填重量" /></td>
          <td class="ps-calc">-</td>`;
        // 实时计算小计
        row.querySelector(".pw-input").addEventListener("input", () => {
          const w = parseFloat(row.querySelector(".pw-input").value);
          const q = parseInt(row.querySelector(".pq-val").textContent, 10);
          row.querySelector(".ps-calc").textContent = (!isNaN(w) && w > 0 && !isNaN(q)) ? (w * q).toFixed(2) + " kg" : "-";
        });
      }
      tbody.appendChild(row);
    }

    document.getElementById("parseStatus").textContent = `（${items.length} 项，已匹配 ${matched}${unmatched > 0 ? `，${unmatched} 项需手动填重量` : ""}）`;
    document.getElementById("unmatchedHint").textContent = unmatched > 0
      ? `⚠️ ${unmatched} 个货号在重量库中未找到，请在表格中手动填写重量。填完点击"计算"即可。`
      : "✅ 全部匹配成功！";
    document.getElementById("parseResult").classList.remove("hidden");
    updateParseTotal();
    doCalc();
  });

  // 解析结果表格输入实时更新合计
  document.querySelector("#parseTable tbody").addEventListener("input", updateParseTotal);

  function updateParseTotal() {
    const total = getParseTotal();
    const ceil = ceilEl.checked ? Math.ceil(total) : total;
    const el = document.getElementById("parseTotal");
    if (el) el.textContent = total > 0
      ? `合计重量：${total.toFixed(2)} kg` + (ceil !== total ? `（向上取整：${ceil} kg）` : "")
      : "合计重量：0 kg";
  }

  // ---------- 重量库导入 ----------
  document.getElementById("importLibBtn").addEventListener("click", () => {
    document.getElementById("libFileInput").click();
  });

  document.getElementById("libFileInput").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isXLSX = file.name.match(/\.xlsx?$/i);

    const processData = (text) => {
      const lines = text.split("\n").filter(l => l.trim());
      const lib = loadWeightLib();
      let count = 0;
      let sampleModels = [];

      const firstLine = lines[0];
      const commaCount = (firstLine.match(/,/g) || []).length;
      const semicolonCount = (firstLine.match(/;/g) || []).length;
      const sep = semicolonCount > commaCount ? /[;]/ : /[,\t]/;

      const headerLine = lines[0];
      const hasHeader = headerLine.includes("型号") || headerLine.includes("货号") || headerLine.includes("重量");
      const dataLines = hasHeader ? lines.slice(1) : lines;

      for (const line of dataLines) {
        const parts = line.split(sep).map(s => s.trim().replace(/^"|"$/g, ""));
        if (parts.length < 2) continue;
        let modelIdx = -1, weightIdx = -1;
        if (hasHeader) {
          const cols = headerLine.split(sep).map(s => s.trim().replace(/^"|"$/g, ""));
          cols.forEach((c, i) => {
            if (c.includes("型号") || c.includes("货号") || c.includes("产品")) modelIdx = i;
            if (c.includes("重量")) weightIdx = i;
          });
        }
        if (modelIdx < 0) modelIdx = 0;
        if (weightIdx < 0) weightIdx = parts.length - 1;

        const maxIdx = Math.max(modelIdx, weightIdx);
        if (parts.length <= maxIdx) continue; // 跳过列数不够的行
        const model = parts[modelIdx];
        if (!model) continue; // 跳过空型号
        const weight = parseFloat((parts[weightIdx] || "").replace(/[^\d.]/g, ""));
        if (model && !isNaN(weight) && weight > 0) {
          lib[model.toLowerCase()] = weight;
          if (count < 5) sampleModels.push(model);
          count++;
        }
      }

      saveWeightLib(lib);
      updateLibStatus();
      alert(`✅ 导入完成！共导入 ${count} 个货号的重量。${sampleModels.length > 0 ? "\n示例：" + sampleModels.join(", ") : ""}`);
    };

    if (isXLSX && typeof XLSX !== "undefined") {
      // 用 SheetJS 解析 xlsx
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const wb = XLSX.read(ev.target.result, { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const csv = XLSX.utils.sheet_to_csv(ws);
          processData(csv);
        } catch (err) {
          alert(`❌ 解析 Excel 失败：${err.message}\n请尝试另存为 CSV 格式后再导入。`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV：直接读文本，检测编码
      const reader = new FileReader();
      reader.onload = (ev) => processData(ev.target.result);
      reader.readAsText(file);
    }

    e.target.value = "";
  });

  document.getElementById("clearLibBtn").addEventListener("click", () => {
    if (confirm("确定清空所有重量数据？")) {
      saveWeightLib({});
      updateLibStatus();
      document.getElementById("libEntries").classList.add("hidden");
    }
  });

  // 查看库
  document.getElementById("viewLibBtn").addEventListener("click", () => {
    const lib = loadWeightLib();
    const keys = Object.keys(lib);
    const el = document.getElementById("libEntries");
    if (keys.length === 0) {
      el.innerHTML = `<div class="hint">库为空，请导入或手动添加。</div>`;
      el.classList.remove("hidden");
      return;
    }
    let html = `<div class="lib-count-hint">共 ${keys.length} 个货号（显示前 100 个）</div><div class="lib-grid">`;
    const show = keys.slice(0, 100);
    for (const k of show) {
      html += `<span class="lib-tag">${k}: ${lib[k]}kg</span>`;
    }
    html += `</div>`;
    el.innerHTML = html;
    el.classList.remove("hidden");
  });

  // ---------- 事件绑定 ----------
  btn.addEventListener("click", doCalc);
  regionEl.addEventListener("change", doCalc);

  regionEl.addEventListener("input", () => {
    clearTimeout(setup._r);
    setup._r = setTimeout(() => {
      renderSuggestList(getRegionSuggestions(regionEl.value));
      openSuggest();
      doCalc();
    }, 120);
  });
  regionEl.addEventListener("focus", () => {
    renderSuggestList(getRegionSuggestions(regionEl.value));
    openSuggest();
  });
  regionEl.addEventListener("blur", () => setTimeout(closeSuggest, 120));
  suggestEl.addEventListener("mousedown", (e) => e.preventDefault());
  suggestEl.addEventListener("click", (e) => {
    const item = e.target?.closest?.(".item");
    if (!item) return;
    regionEl.value = item.getAttribute("data-value") || "";
    closeSuggest();
    doCalc();
  });

  ceilEl.addEventListener("change", () => {
    if (getMode() === "multi") updateProductSummary();
    if (getMode() === "paste") updateParseTotal();
    doCalc();
  });

  weightEl.addEventListener("input", () => {
    clearTimeout(setup._t);
    setup._t = setTimeout(doCalc, 150);
  });

  document.getElementById("addRowBtn")?.addEventListener("click", addProductRow);

  // 快捷键
  shortcutsWrap.addEventListener("click", (e) => {
    const pill = e.target.closest(".shortcut-pill");
    if (pill) {
      const idx = parseInt(pill.dataset.index, 10);
      const val = weightShortcuts[idx];
      if (val != null) { weightEl.value = String(val); doCalc(); weightEl.focus(); }
      return;
    }
    if (e.target.id === "editShortcutsBtn") {
      renderEditShortcuts(weightShortcuts);
      const fi = shortcutsWrap.querySelector(".shortcut-input");
      if (fi) setTimeout(() => fi.focus(), 50);
      return;
    }
    if (e.target.id === "saveShortcutsBtn") {
      const inputs = shortcutsWrap.querySelectorAll(".shortcut-input");
      const newVals = [];
      for (const inp of inputs) {
        const v = parseFloat(inp.value);
        if (!isFinite(v) || v <= 0) { alert("请填写有效的正数。"); return; }
        newVals.push(v);
      }
      if (newVals.length < 3) { alert("至少3个快捷键。"); return; }
      weightShortcuts = newVals;
      saveWeightShortcuts(newVals);
      renderWeightShortcuts(newVals);
    }
  });

  // 重置
  resetBtn.addEventListener("click", () => {
    weightEl.value = "";
    regionEl.value = "";
    ceilEl.checked = true;
    const tbody = document.querySelector("#productTable tbody");
    if (tbody) { tbody.innerHTML = ""; addProductRow(); }
    document.getElementById("orderText").value = "";
    document.getElementById("parseResult").classList.add("hidden");
    document.querySelector("#parseTable tbody").innerHTML = "";
    document.getElementById("parseTotal").textContent = "";
    $("result").innerHTML = `<div class="meta">请${({single:"输入重量",multi:"填写商品清单",paste:"粘贴订单"})[getMode()]}后点击"计算"。</div>`;
    $("copyBtnWrap").innerHTML = "";
    renderSuggestList(getRegionSuggestions(""));
    weightEl.focus();
  });

  // 初始
  $("result").innerHTML = `<div class="meta">请选择模式后点击"计算"。</div>`;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

document.addEventListener("DOMContentLoaded", setup);