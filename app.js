/* 运费计算器（离线 H5） */

const REGIONS = [
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
  "广西",
  "海南",
  "四川",
  "贵州",
  "云南",
  "陕西",
  "甘肃",
  "青海",
  "宁夏",
  "内蒙古",
  "舟山",
  "延安",
  "新疆",
  "西藏",
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

function formatMoney(n) {
  // 避免 1.999999 等浮点误差
  const fixed = Math.round((n + Number.EPSILON) * 100) / 100;
  return fixed.toFixed(2);
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
  const w0 = parseWeight(weightInput);
  if (w0 == null || w0 <= 0) {
    return { ok: false, message: "请输入正确的重量（kg）。", meta: "", money: null };
  }
  if (!region) {
    return { ok: false, message: "请选择地域。", meta: "", money: null };
  }
  if (NO_SHIP.has(region)) {
    return { ok: false, message: `${region} 不发快递。`, meta: "规则：新疆/西藏不发快递", money: null };
  }

  const w = ceilWeight ? Math.ceil(w0) : w0;

  // 1) 特殊地区优先
  if (SPECIAL_RATE.has(region)) {
    const rate = SPECIAL_RATE.get(region);
    const money = w * rate;
    return {
      ok: true,
      money,
      message: `运费：¥${formatMoney(money)}`,
      meta: `命中特殊地区价：${region} = 重量 × ${rate}；计费重量=${w}`,
    };
  }

  // 2) 常规地址
  // 2.1 12kg(含)以内
  if (w <= 12) {
    const rate = COMMON_UPTO12_HIGH.has(region) ? 5.5 : 3;
    const money = w * rate;
    return {
      ok: true,
      money,
      message: `运费：¥${formatMoney(money)}`,
      meta: `常规地址≤12kg：${COMMON_UPTO12_HIGH.has(region) ? "指定地区" : "其他地区"} = 重量 × ${rate}；计费重量=${w}`,
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
  const sel = $("region");
  for (const r of REGIONS) {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    sel.appendChild(opt);
  }
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
  const regionEl = $("region");
  const ceilEl = $("ceilWeight");
  const btn = $("calcBtn");

  const doCalc = () => {
    const region = regionEl.value;
    const w0 = (weightEl.value ?? "").trim();
    const ceilWeight = !!ceilEl.checked;
    const payload = calcShipping({ weightInput: w0, region, ceilWeight });

    const wParsed = parseWeight(w0);
    const wUsed = wParsed == null ? null : (ceilWeight ? Math.ceil(wParsed) : wParsed);
    renderResult(payload, { region, w0: wParsed ?? "-", wUsed, ceilWeight });
  };

  btn.addEventListener("click", doCalc);
  regionEl.addEventListener("change", doCalc);
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

