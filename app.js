/* 运费计算器（离线 H5） */

// 说明：
// - REGIONS 既用于下拉建议，也用于“识别输入地址属于哪个地区”
// - 为了覆盖“输入完整地址”的场景，这里包含中国所有省级行政区（含港澳台）
// - 另外加入“舟山/延安”（来自你的计费规则，属于特殊地区价）
const REGIONS = [
  // 规则里出现的特殊地区（优先匹配）
  "舟山",
  "延安",

  // 省级行政区
  "北京",
  "天津",
  "上海",
  "重庆",
  "河北",
  "山西",
  "辽宁",
  "吉林",
  "黑龙江",
  "江苏",
  "浙江",
  "安徽",
  "福建",
  "江西",
  "山东",
  "河南",
  "湖北",
  "湖南",
  "广东",
  "海南",
  "四川",
  "贵州",
  "云南",
  "陕西",
  "甘肃",
  "青海",

  // 自治区
  "内蒙古",
  "广西",
  "宁夏",
  "新疆",
  "西藏",

  // 港澳台
  "香港",
  "澳门",
  "台湾",
];

const NO_SHIP = new Set(["新疆", "西藏"]);

// 特殊地区价（优先级最高）
const SPECIAL_RATE = new Map([
  ["海南", 4],
  ["甘肃", 2.5],
  ["青海", 2.5],
  ["云南", 2],
  ["宁夏", 2],
  ["四川", 1.8],
  ["福建", 1.8],
  ["吉林", 1.8],
  ["舟山", 1.8],
  ["延安", 1.8],
  ["广西", 1.8],
  ["贵州", 1.8],
]);

// 常规地址：12kg(含)以内的“高单价地区”
const COMMON_UPTO12_HIGH = new Set(["甘肃", "宁夏", "云南", "广西", "青海", "贵州", "海南", "内蒙古"]);

const REGION_ALIASES = new Map([
  ["内蒙", "内蒙古"],
  ["内蒙古自治区", "内蒙古"],
  ["广西自治区", "广西"],
  ["广西壮族自治区", "广西"],
  ["宁夏自治区", "宁夏"],
  ["宁夏回族自治区", "宁夏"],
  ["新疆维吾尔自治区", "新疆"],
  ["西藏自治区", "西藏"],
  ["香港特别行政区", "香港"],
  ["澳门特别行政区", "澳门"],
  ["北京市", "北京"],
  ["天津市", "天津"],
  ["上海市", "上海"],
  ["重庆市", "重庆"],
]);

function formatMoney(n) {
  // 避免 1.999999 等浮点误差
  const fixed = Math.round((n + Number.EPSILON) * 100) / 100;
  return fixed.toFixed(2);
}

function normalizeRegion(raw) {
  if (!raw) return "";
  let t = String(raw).trim();
  if (!t) return "";

  // 清理空格
  t = t.replace(/\s+/g, "");

  // 先处理全称别名
  if (REGION_ALIASES.has(t)) return REGION_ALIASES.get(t);

  // 如果输入的是完整地址（包含省/市/区等），尝试从中“抽取”省份/地区
  // 匹配顺序：先匹配“舟山/延安”，再匹配省级行政区，避免“浙江舟山”被识别成“浙江”
  const matchOrder = [...REGIONS].sort((a, b) => b.length - a.length);
  for (const key of matchOrder) {
    if (t.includes(key)) return key;
    // 兼容“广东省”“北京市”等：包含 key + 后缀
    if (t.includes(key + "省")) return key;
    if (t.includes(key + "市")) return key;
    if (t.includes(key + "自治区")) return key;
    if (t.includes(key + "特别行政区")) return key;
  }

  // 去掉常见后缀后再试一次（输入可能是“广东省”这种）
  const t2 = t.replace(/(省|市|自治区|特别行政区)$/g, "");
  if (REGION_ALIASES.has(t2)) return REGION_ALIASES.get(t2);
  if (REGIONS.includes(t2)) return t2;

  // 允许返回原始值，让上层给出更明确的提示
  return t2 || t;
}

function getRegionSuggestions(raw, limit) {
  const q0 = String(raw ?? "").trim().replace(/\s+/g, "");
  // 不输入时：展示完整列表（与可识别地区保持一致）
  if (!q0) return typeof limit === "number" ? REGIONS.slice(0, limit) : [...REGIONS];
  const q = q0.replace(/(省|市|自治区|特别行政区)$/g, "");

  const out = [];
  const push = (x) => {
    if (!out.includes(x)) out.push(x);
  };

  // 先尝试别名归一
  const norm = normalizeRegion(q);
  if (REGIONS.includes(norm)) push(norm);

  // 再做包含匹配（输入“广”可出“广东/广西”等）
  for (const r of REGIONS) {
    if (typeof limit === "number" && out.length >= limit) break;
    if (r.includes(q) || q.includes(r)) push(r);
  }
  return typeof limit === "number" ? out.slice(0, limit) : out;
}

function parseWeight(raw) {
  const t = String(raw ?? "").trim().replace(/，/g, ".").replace(/[^\d.]/g, "");
  if (!t) return null;
  const n = Number(t);
  if (!Number.isFinite(n)) return null;
  return n;
}

/**
 * 返回：
 * - ok: boolean
 * - message: string（给用户看的主信息）
 * - meta: string（计算过程/命中规则）
 * - money: number | null
 */
function calcShipping({ weightInput, region, ceilWeight }) {
  const regionNorm = normalizeRegion(region);
  const w0 = parseWeight(weightInput);
  if (w0 == null || w0 <= 0) {
    return { ok: false, message: "请输入正确的重量（kg）。", meta: "", money: null };
  }
  if (!regionNorm) {
    return { ok: false, message: "请选择地域。", meta: "", money: null };
  }
  if (!REGIONS.includes(regionNorm)) {
    return {
      ok: false,
      message: "未识别到省份/地区，请输入完整地址或从下拉建议中选择。",
      meta: `你输入的是：${region}`,
      money: null,
    };
  }
  if (NO_SHIP.has(regionNorm)) {
    return { ok: false, message: `${regionNorm} 不发快递。`, meta: "规则：新疆/西藏不发快递", money: null };
  }

  const w = ceilWeight ? Math.ceil(w0) : w0;

  // 1) 特殊地区优先
  if (SPECIAL_RATE.has(regionNorm)) {
    const rate = SPECIAL_RATE.get(regionNorm);
    const money = w * rate;
    return {
      ok: true,
      money,
      message: `运费：¥${formatMoney(money)}`,
      meta: `命中特殊地区价：${regionNorm} = 重量 × ${rate}；计费重量=${w}`,
    };
  }

  // 2) 常规地址
  // 2.1 12kg(含)以内
  if (w <= 12) {
    const rate = COMMON_UPTO12_HIGH.has(regionNorm) ? 5.5 : 3;
    const money = w * rate;
    return {
      ok: true,
      money,
      message: `运费：¥${formatMoney(money)}`,
      meta: `常规地址≤12kg：${COMMON_UPTO12_HIGH.has(regionNorm) ? "指定地区" : "其他地区"} = 重量 × ${rate}；计费重量=${w}`,
    };
  }

  // 2.2 13kg以上（按你给的分段规则）
  // 说明：当不开启“向上取整”且出现 12.x 时，仍按“>12kg”的规则处理，落入 13–15kg 段。
  const wForBand = ceilWeight ? w : (w > 12 && w < 13 ? 13 : w);

  let money = 0;
  let meta = "";

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
    // 理论不会走到这里，兜底
    money = wForBand * 1.5 + 10;
    meta = "常规地址>12kg：兜底使用 重量×1.5+10";
  }

  return {
    ok: true,
    money,
    message: `运费：¥${formatMoney(money)}`,
    meta: `${meta}；计费重量=${wForBand}`,
  };
}

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`缺少元素：#${id}`);
  return el;
}

function renderRegions() {
  // 旧版使用 datalist；现改为自定义下拉，这里保留占位，便于未来扩展
}

function renderSuggestList(items) {
  const box = $("regionSuggest");
  if (!items || items.length === 0) {
    box.innerHTML = `<div class="empty">未找到匹配项</div>`;
    return;
  }
  box.innerHTML = items
    .map((x) => `<div class="item" role="option" data-value="${x}">${x}</div>`)
    .join("");
}

function openSuggest() {
  $("regionSuggest").classList.add("open");
}
function closeSuggest() {
  $("regionSuggest").classList.remove("open");
}

function renderResult(payload, { region, w0, wUsed, ceilWeight }) {
  const box = $("result");

  if (!payload.ok) {
    box.innerHTML = `<div class="bad">${payload.message}</div>${payload.meta ? `<div class="meta">${payload.meta}</div>` : ""}`;
    return;
  }

  const moneyText = `¥${formatMoney(payload.money)}`;
  const metaLine = payload.meta || "";
  const weightMeta = `输入重量=${w0}${ceilWeight ? "，向上取整" : ""}；地域=${region}`;
  box.innerHTML = `
    <div class="ok"><span class="money">${moneyText}</span></div>
    <div class="meta">${weightMeta}</div>
    ${metaLine ? `<div class="meta">${metaLine}</div>` : ""}
  `;
}

function setup() {
  renderRegions();

  const weightEl = $("weight");
  const regionEl = $("regionInput");
  const suggestEl = $("regionSuggest");
  const ceilEl = $("ceilWeight");
  const btn = $("calcBtn");

  const doCalc = () => {
    const region = regionEl.value;
    const w0 = (weightEl.value ?? "").trim();
    const ceilWeight = !!ceilEl.checked;
    const payload = calcShipping({ weightInput: w0, region, ceilWeight });

    const wParsed = parseWeight(w0);
    const wUsed = wParsed == null ? null : (ceilWeight ? Math.ceil(wParsed) : wParsed);
    renderResult(payload, { region: normalizeRegion(region) || region, w0: wParsed ?? "-", wUsed, ceilWeight });
  };

  btn.addEventListener("click", doCalc);
  regionEl.addEventListener("change", doCalc);
  regionEl.addEventListener("input", () => {
    window.clearTimeout(setup._r);
    setup._r = window.setTimeout(() => {
      const items = getRegionSuggestions(regionEl.value); // 输入时：按关键词过滤（不截断）
      renderSuggestList(items);
      openSuggest();
      doCalc();
    }, 120);
  });
  regionEl.addEventListener("focus", () => {
    // 聚焦时：展示完整列表或过滤后的列表（与可识别地区保持一致）
    const items = getRegionSuggestions(regionEl.value);
    renderSuggestList(items);
    openSuggest();
  });
  regionEl.addEventListener("blur", () => {
    // 给点击建议项留时间
    window.setTimeout(closeSuggest, 120);
  });

  suggestEl.addEventListener("mousedown", (e) => {
    // 防止 input blur 过早触发
    e.preventDefault();
  });
  suggestEl.addEventListener("click", (e) => {
    const item = e.target?.closest?.(".item");
    if (!item) return;
    regionEl.value = item.getAttribute("data-value") || "";
    closeSuggest();
    doCalc();
  });

  ceilEl.addEventListener("change", doCalc);
  weightEl.addEventListener("input", () => {
    // 少量延迟，避免输入时频繁刷新
    window.clearTimeout(setup._t);
    setup._t = window.setTimeout(doCalc, 150);
  });

  // 默认结果提示
  $("result").innerHTML = `<div class="meta">请输入重量并选择地域后点击“计算”。</div>`;

  // 注册 Service Worker 以支持离线
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // 静默失败：离线能力不是强依赖（例如 file:// 打开时无法注册）
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", setup);
