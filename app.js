/* 运费计算器（离线 H5）v2 */

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

// 城市 → 省份映射（含地级市 + 知名县级市）
const CITY_TO_PROVINCE = {
  // 北京
  "北京": "北京", "朝阳": "北京", "海淀": "北京", "丰台": "北京",
  "东城": "北京", "西城": "北京", "通州": "北京", "大兴": "北京",
  "昌平": "北京", "顺义": "北京", "房山": "北京", "石景山": "北京",
  // 上海
  "上海": "上海", "浦东": "上海", "静安": "上海", "黄埔": "上海",
  "徐汇": "上海", "长宁": "上海", "普陀": "上海", "虹口": "上海",
  "杨浦": "上海", "宝山": "上海", "闵行": "上海", "松江": "上海",
  "嘉定": "上海", "奉贤": "上海", "青浦": "上海",
  // 天津
  "天津": "天津", "滨海": "天津", "和平": "天津", "河西": "天津",
  "南开": "天津", "河东": "天津", "河北": "天津",
  // 重庆
  "重庆": "重庆", "渝中": "重庆", "江北": "重庆", "南岸": "重庆",
  "九龙坡": "重庆", "沙坪坝": "重庆", "渝北": "重庆",
  // 安徽
  "合肥": "安徽", "芜湖": "安徽", "蚌埠": "安徽", "淮南": "安徽",
  "马鞍山": "安徽", "淮北": "安徽", "铜陵": "安徽", "安庆": "安徽",
  "黄山": "安徽", "滁州": "安徽", "阜阳": "安徽", "宿州": "安徽",
  "六安": "安徽", "亳州": "安徽", "池州": "安徽", "宣城": "安徽",
  "巢湖": "安徽", "桐城": "安徽", "天长": "安徽", "宁国": "安徽",
  "明光": "安徽", "界首": "安徽",
  // 福建
  "福州": "福建", "厦门": "福建", "莆田": "福建", "三明": "福建",
  "泉州": "福建", "漳州": "福建", "南平": "福建", "龙岩": "福建",
  "宁德": "福建", "晋江": "福建", "石狮": "福建", "南安": "福建",
  "福清": "福建", "福鼎": "福建", "邵武": "福建", "武夷山": "福建",
  "建瓯": "福建", "漳平": "福建", "福安": "福建", "永安": "福建",
  // 甘肃
  "兰州": "甘肃", "嘉峪关": "甘肃", "金昌": "甘肃", "白银": "甘肃",
  "天水": "甘肃", "武威": "甘肃", "张掖": "甘肃", "平凉": "甘肃",
  "酒泉": "甘肃", "庆阳": "甘肃", "定西": "甘肃", "陇南": "甘肃",
  "临夏": "甘肃", "合作": "甘肃", "玉门": "甘肃", "敦煌": "甘肃",
  // 广东
  "广州": "广东", "深圳": "广东", "珠海": "广东", "汕头": "广东",
  "佛山": "广东", "韶关": "广东", "湛江": "广东", "肇庆": "广东",
  "江门": "广东", "茂名": "广东", "惠州": "广东", "梅州": "广东",
  "汕尾": "广东", "河源": "广东", "阳江": "广东", "清远": "广东",
  "东莞": "广东", "中山": "广东", "潮州": "广东", "揭阳": "广东",
  "云浮": "广东", "南海": "广东", "顺德": "广东", "三水": "广东",
  "台山": "广东", "开平": "广东", "鹤山": "广东", "恩平": "广东",
  "廉江": "广东", "雷州": "广东", "吴川": "广东", "高州": "广东",
  "化州": "广东", "信宜": "广东", "四会": "广东", "兴宁": "广东",
  "陆丰": "广东", "阳春": "广东", "英德": "广东", "连州": "广东",
  "普宁": "广东", "罗定": "广东",
  // 广西
  "南宁": "广西", "柳州": "广西", "桂林": "广西", "梧州": "广西",
  "北海": "广西", "防城港": "广西", "钦州": "广西", "贵港": "广西",
  "玉林": "广西", "百色": "广西", "贺州": "广西", "河池": "广西",
  "来宾": "广西", "崇左": "广西", "东兴": "广西", "宜州": "广西",
  // 贵州
  "贵阳": "贵州", "六盘水": "贵州", "遵义": "贵州", "安顺": "贵州",
  "毕节": "贵州", "铜仁": "贵州", "凯里": "贵州", "都匀": "贵州",
  "兴义": "贵州", "赤水": "贵州", "仁怀": "贵州", "福泉": "贵州",
  // 海南
  "海口": "海南", "三亚": "海南", "三沙": "海南", "儋州": "海南",
  "琼海": "海南", "文昌": "海南", "万宁": "海南", "东方": "海南",
  "五指山": "海南",
  // 河北
  "石家庄": "河北", "唐山": "河北", "秦皇岛": "河北", "邯郸": "河北",
  "邢台": "河北", "保定": "河北", "张家口": "河北", "承德": "河北",
  "沧州": "河北", "廊坊": "河北", "衡水": "河北", "辛集": "河北",
  "定州": "河北", "任丘": "河北", "涿州": "河北", "高碑店": "河北",
  // 河南
  "郑州": "河南", "开封": "河南", "洛阳": "河南", "平顶山": "河南",
  "安阳": "河南", "鹤壁": "河南", "新乡": "河南", "焦作": "河南",
  "濮阳": "河南", "许昌": "河南", "漯河": "河南", "三门峡": "河南",
  "南阳": "河南", "商丘": "河南", "信阳": "河南", "周口": "河南",
  "驻马店": "河南", "济源": "河南", "巩义": "河南", "新郑": "河南",
  "新密": "河南", "登封": "河南", "荥阳": "河南", "中牟": "河南",
  "永城": "河南", "项城": "河南", "邓州": "河南",
  // 黑龙江
  "哈尔滨": "黑龙江", "齐齐哈尔": "黑龙江", "鸡西": "黑龙江",
  "鹤岗": "黑龙江", "双鸭山": "黑龙江", "大庆": "黑龙江",
  "伊春": "黑龙江", "佳木斯": "黑龙江", "七台河": "黑龙江",
  "牡丹江": "黑龙江", "黑河": "黑龙江", "绥化": "黑龙江",
  "肇东": "黑龙江", "安达": "黑龙江", "海伦": "黑龙江", "铁力": "黑龙江",
  "尚志": "黑龙江", "五常": "黑龙江", "宁安": "黑龙江", "穆棱": "黑龙江",
  // 湖北
  "武汉": "湖北", "黄石": "湖北", "十堰": "湖北", "宜昌": "湖北",
  "襄阳": "湖北", "鄂州": "湖北", "荆门": "湖北", "孝感": "湖北",
  "荆州": "湖北", "黄冈": "湖北", "咸宁": "湖北", "随州": "湖北",
  "仙桃": "湖北", "潜江": "湖北", "天门": "湖北", "恩施": "湖北",
  "大冶": "湖北", "丹江口": "湖北", "宜都": "湖北", "当阳": "湖北",
  "枝江": "湖北", "老河口": "湖北", "枣阳": "湖北", "宜城": "湖北",
  "钟祥": "湖北", "应城": "湖北", "安陆": "湖北", "汉川": "湖北",
  "石首": "湖北", "洪湖": "湖北", "松滋": "湖北", "麻城": "湖北",
  "武穴": "湖北", "赤壁": "湖北", "广水": "湖北", "利川": "湖北",
  // 湖南
  "长沙": "湖南", "株洲": "湖南", "湘潭": "湖南", "衡阳": "湖南",
  "邵阳": "湖南", "岳阳": "湖南", "常德": "湖南", "张家界": "湖南",
  "益阳": "湖南", "郴州": "湖南", "永州": "湖南", "怀化": "湖南",
  "娄底": "湖南", "湘西": "湖南", "浏阳": "湖南", "醴陵": "湖南",
  "湘乡": "湖南", "韶山": "湖南", "耒阳": "湖南", "常宁": "湖南",
  "武冈": "湖南", "汨罗": "湖南", "临湘": "湖南", "津市": "湖南",
  "沅江": "湖南", "资兴": "湖南", "洪江": "湖南", "冷水江": "湖南",
  "涟源": "湖南", "吉首": "湖南",
  // 江苏
  "南京": "江苏", "无锡": "江苏", "徐州": "江苏", "常州": "江苏",
  "苏州": "江苏", "南通": "江苏", "连云港": "江苏", "淮安": "江苏",
  "盐城": "江苏", "扬州": "江苏", "镇江": "江苏", "泰州": "江苏",
  "宿迁": "江苏", "江阴": "江苏", "宜兴": "江苏", "新沂": "江苏",
  "邳州": "江苏", "溧阳": "江苏", "常熟": "江苏", "张家港": "江苏",
  "昆山": "江苏", "太仓": "江苏", "如皋": "江苏", "启东": "江苏",
  "海门": "江苏", "东台": "江苏", "仪征": "江苏", "高邮": "江苏",
  "丹阳": "江苏", "扬中": "江苏", "句容": "江苏", "靖江": "江苏",
  "泰兴": "江苏", "兴化": "江苏",
  // 江西
  "南昌": "江西", "景德镇": "江西", "萍乡": "江西", "九江": "江西",
  "新余": "江西", "鹰潭": "江西", "赣州": "江西", "吉安": "江西",
  "宜春": "江西", "抚州": "江西", "上饶": "江西", "瑞昌": "江西",
  "贵溪": "江西", "瑞金": "江西", "南康": "江西", "井冈山": "江西",
  "丰城": "江西", "樟树": "江西", "高安": "江西", "德兴": "江西",
  "乐平": "江西", "庐山": "江西",
  // 吉林
  "长春": "吉林", "吉林": "吉林", "四平": "吉林", "辽源": "吉林",
  "通化": "吉林", "白山": "吉林", "松原": "吉林", "白城": "吉林",
  "延边": "吉林", "公主岭": "吉林", "梅河口": "吉林", "集安": "吉林",
  "临江": "吉林", "洮南": "吉林", "大安": "吉林", "延吉": "吉林",
  "图们": "吉林", "敦化": "吉林", "珲春": "吉林", "龙井": "吉林",
  "和龙": "吉林",
  // 辽宁
  "沈阳": "辽宁", "大连": "辽宁", "鞍山": "辽宁", "抚顺": "辽宁",
  "本溪": "辽宁", "丹东": "辽宁", "锦州": "辽宁", "营口": "辽宁",
  "阜新": "辽宁", "辽阳": "辽宁", "盘锦": "辽宁", "铁岭": "辽宁",
  "朝阳": "辽宁", "葫芦岛": "辽宁", "瓦房店": "辽宁", "海城": "辽宁",
  "东港": "辽宁", "凤城": "辽宁", "凌海": "辽宁", "北镇": "辽宁",
  "大石桥": "辽宁", "盖州": "辽宁", "灯塔": "辽宁", "调兵山": "辽宁",
  "开原": "辽宁", "凌源": "辽宁", "北票": "辽宁", "兴城": "辽宁",
  // 内蒙古
  "呼和浩特": "内蒙古", "包头": "内蒙古", "乌海": "内蒙古",
  "赤峰": "内蒙古", "通辽": "内蒙古", "鄂尔多斯": "内蒙古",
  "呼伦贝尔": "内蒙古", "巴彦淖尔": "内蒙古", "乌兰察布": "内蒙古",
  "乌兰浩特": "内蒙古", "锡林浩特": "内蒙古", "阿拉善": "内蒙古",
  "满洲里": "内蒙古", "牙克石": "内蒙古", "扎兰屯": "内蒙古",
  "额尔古纳": "内蒙古", "根河": "内蒙古", "丰镇": "内蒙古",
  "霍林郭勒": "内蒙古", "二连浩特": "内蒙古",
  // 宁夏
  "银川": "宁夏", "石嘴山": "宁夏", "吴忠": "宁夏", "固原": "宁夏",
  "中卫": "宁夏", "灵武": "宁夏", "青铜峡": "宁夏",
  // 青海
  "西宁": "青海", "海东": "青海", "格尔木": "青海", "德令哈": "青海",
  "玉树": "青海",
  // 山东
  "济南": "山东", "青岛": "山东", "淄博": "山东", "枣庄": "山东",
  "东营": "山东", "烟台": "山东", "潍坊": "山东", "济宁": "山东",
  "泰安": "山东", "威海": "山东", "日照": "山东", "临沂": "山东",
  "德州": "山东", "聊城": "山东", "滨州": "山东", "菏泽": "山东",
  "章丘": "山东", "胶州": "山东", "平度": "山东", "莱西": "山东",
  "即墨": "山东", "龙口": "山东", "莱阳": "山东", "莱州": "山东",
  "蓬莱": "山东", "招远": "山东", "栖霞": "山东", "海阳": "山东",
  "青州": "山东", "诸城": "山东", "寿光": "山东", "安丘": "山东",
  "高密": "山东", "昌邑": "山东", "曲阜": "山东", "兖州": "山东",
  "邹城": "山东", "新泰": "山东", "肥城": "山东", "乳山": "山东",
  "荣成": "山东", "文登": "山东", "乐陵": "山东", "禹城": "山东",
  "临清": "山东",
  // 山西
  "太原": "山西", "大同": "山西", "阳泉": "山西", "长治": "山西",
  "晋城": "山西", "朔州": "山西", "晋中": "山西", "运城": "山西",
  "忻州": "山西", "临汾": "山西", "吕梁": "山西", "古交": "山西",
  "潞城": "山西", "高平": "山西", "怀仁": "山西", "原平": "山西",
  "侯马": "山西", "霍州": "山西", "孝义": "山西", "汾阳": "山西",
  // 陕西
  "西安": "陕西", "铜川": "陕西", "宝鸡": "陕西", "咸阳": "陕西",
  "渭南": "陕西", "汉中": "陕西", "安康": "陕西", "商洛": "陕西",
  "杨凌": "陕西", "兴平": "陕西", "韩城": "陕西", "华阴": "陕西",
  // 四川
  "成都": "四川", "自贡": "四川", "攀枝花": "四川", "泸州": "四川",
  "德阳": "四川", "绵阳": "四川", "广元": "四川", "遂宁": "四川",
  "内江": "四川", "乐山": "四川", "南充": "四川", "眉山": "四川",
  "宜宾": "四川", "广安": "四川", "达州": "四川", "雅安": "四川",
  "巴中": "四川", "资阳": "四川", "西昌": "四川", "康定": "四川",
  "马尔康": "四川", "都江堰": "四川", "彭州": "四川", "邛崃": "四川",
  "崇州": "四川", "简阳": "四川", "江油": "四川", "峨眉山": "四川",
  "阆中": "四川", "华蓥": "四川", "万源": "四川", "绵竹": "四川",
  "什邡": "四川", "广汉": "四川",
  // 云南
  "昆明": "云南", "曲靖": "云南", "玉溪": "云南", "保山": "云南",
  "昭通": "云南", "丽江": "云南", "普洱": "云南", "临沧": "云南",
  "楚雄": "云南", "红河": "云南", "文山": "云南", "西双版纳": "云南",
  "大理": "云南", "德宏": "云南", "怒江": "云南", "迪庆": "云南",
  "安宁": "云南", "宣威": "云南", "腾冲": "云南", "芒市": "云南",
  "瑞丽": "云南", "香格里拉": "云南",
  // 浙江
  "杭州": "浙江", "宁波": "浙江", "温州": "浙江", "嘉兴": "浙江",
  "湖州": "浙江", "绍兴": "浙江", "金华": "浙江", "衢州": "浙江",
  "台州": "浙江", "丽水": "浙江", "建德": "浙江", "余姚": "浙江",
  "慈溪": "浙江", "瑞安": "浙江", "乐清": "浙江", "海宁": "浙江",
  "平湖": "浙江", "桐乡": "浙江", "诸暨": "浙江", "嵊州": "浙江",
  "江山": "浙江", "龙泉": "浙江", "温岭": "浙江", "临海": "浙江",
  "玉环": "浙江",
  // 新疆（不发快递）
  "乌鲁木齐": "新疆", "喀什": "新疆", "克拉玛依": "新疆", "吐鲁番": "新疆",
  "哈密": "新疆", "伊犁": "新疆", "阿克苏": "新疆", "库尔勒": "新疆",
  "昌吉": "新疆", "石河子": "新疆", "阿拉尔": "新疆", "图木舒克": "新疆",
  "五家渠": "新疆", "和田": "新疆", "塔城": "新疆", "阿勒泰": "新疆",
  "博乐": "新疆", "库车": "新疆", "奎屯": "新疆", "阜康": "新疆",
  "伊宁": "新疆", "北屯": "新疆", "铁门关": "新疆", "双河": "新疆",
  "可克达拉": "新疆", "昆玉": "新疆", "胡杨河": "新疆", "新星": "新疆",
  // 西藏（不发快递）
  "拉萨": "西藏", "日喀则": "西藏", "昌都": "西藏", "林芝": "西藏",
  "山南": "西藏", "那曲": "西藏", "阿里": "西藏",
  // 港澳台
  "香港": "香港", "澳门": "澳门", "台北": "台湾", "高雄": "台湾",
  "台中": "台湾", "台南": "台湾", "新北": "台湾", "桃园": "台湾",
};

// 特殊城市（不映射到省份，使用自有费率）
const SPECIAL_CITIES = new Set(["舟山", "延安"]);

// 默认重量快捷键（kg）
const DEFAULT_WEIGHT_SHORTCUTS = [1, 3, 5, 10, 20];

const STORAGE_KEY_SHORTCUTS = "shipping_weight_shortcuts";


// ==============================
// 工具函数
// ==============================

function formatMoney(n) {
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

  // 1) 别名
  if (REGION_ALIASES.has(t)) return REGION_ALIASES.get(t);

  // 2) 精确匹配 REGIONS
  if (REGIONS.includes(t)) return t;

  // 3) 特殊城市优先（舟山/延安有自己的计价规则，不映射到省份）
  for (const sc of SPECIAL_CITIES) {
    if (t.includes(sc)) return sc;
  }

  // 4) 城市 → 省份映射（从长到短匹配，避免"乌兰察布"被"乌兰"提前匹配）
  const cityKeys = Object.keys(CITY_TO_PROVINCE).sort((a, b) => b.length - a.length);
  for (const city of cityKeys) {
    if (t.includes(city)) return CITY_TO_PROVINCE[city];
  }

  // 5) 地址内含省份名
  const matchOrder = [...REGIONS].sort((a, b) => b.length - a.length);
  for (const key of matchOrder) {
    if (t.includes(key)) return key;
    if (t.includes(key + "省")) return key;
    if (t.includes(key + "市")) return key;
    if (t.includes(key + "自治区")) return key;
    if (t.includes(key + "特别行政区")) return key;
  }

  // 6) 去后缀再试
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
      if (Array.isArray(arr) && arr.length >= 3 && arr.every((v) => typeof v === "number" && v > 0)) {
        return arr;
      }
    }
  } catch {}
  return [...DEFAULT_WEIGHT_SHORTCUTS];
}

function saveWeightShortcuts(arr) {
  try {
    localStorage.setItem(STORAGE_KEY_SHORTCUTS, JSON.stringify(arr));
  } catch {}
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

  // 1) 特殊地区
  if (SPECIAL_RATE.has(regionNorm)) {
    const rate = SPECIAL_RATE.get(regionNorm);
    const money = w * rate;
    return {
      ok: true, money, rate,
      message: `运费：¥${formatMoney(money)}`,
      meta: `命中特殊地区价：${regionNorm} = 重量 × ${rate}；计费重量=${w}`,
    };
  }

  // 2) 常规地址
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
// UI 渲染
// ==============================

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

function openSuggest() { $("regionSuggest").classList.add("open"); }
function closeSuggest() { $("regionSuggest").classList.remove("open"); }

function renderResult(payload, { region, w0, wUsed, ceilWeight }) {
  const box = $("result");
  const { ok, message, meta, money, rate } = payload;

  if (!ok) {
    box.innerHTML = `
      <div class="bad">${message}</div>
      ${meta ? `<div class="meta">${meta}</div>` : ""}
    `.trim();
    $("copyBtnWrap").innerHTML = "";
    return;
  }

  const moneyText = `¥${formatMoney(money)}`;
  const weightMeta = `输入重量=${w0}${ceilWeight ? "，向上取整" : ""}；地域=${region}`;
  box.innerHTML = `
    <div class="ok"><span class="money">${moneyText}</span></div>
    <div class="meta">${weightMeta}</div>
    ${meta ? `<div class="meta">${meta}</div>` : ""}
  `;

  // 复制按钮
  const regionDisp = normalizeRegion(region) || region;
  const copyText =
`📍 运费明细
省份：${regionDisp}
重量：${wUsed} kg
单价：${rate != null ? formatMoney(rate) : "-"} 元/kg
─────────────
💵 总价：${moneyText} 元`;

  $("copyBtnWrap").innerHTML = `<button id="copyBtn" class="btn-secondary" type="button">📋 复制明细</button>`;
  $("copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(copyText).then(() => {
      const btn = $("copyBtn");
      btn.textContent = "✅ 已复制";
      setTimeout(() => { btn.textContent = "📋 复制明细"; }, 2000);
    }).catch(() => {
      alert("复制失败，请手动复制。");
    });
  });
}

function renderWeightShortcuts(shortcuts) {
  const wrap = $("weightShortcuts");
  wrap.innerHTML = shortcuts
    .map((v, i) => `<button class="shortcut-pill" data-index="${i}" type="button">${v}kg</button>`)
    .join("")
    + `<button id="editShortcutsBtn" class="shortcut-edit" type="button" title="自定义快捷键">✎</button>`;
}

function renderEditShortcuts(shortcuts) {
  const wrap = $("weightShortcuts");
  wrap.innerHTML = shortcuts
    .map((v, i) => `<input class="shortcut-input" type="number" step="0.1" min="0.1" value="${v}" data-index="${i}" />`)
    .join("")
    + `<button id="saveShortcutsBtn" class="shortcut-edit active" type="button" title="保存">✔</button>`;
}


// ==============================
// 设置页面
// ==============================

function setup() {
  const weightEl = $("weight");
  const regionEl = $("regionInput");
  const suggestEl = $("regionSuggest");
  const ceilEl = $("ceilWeight");
  const btn = $("calcBtn");
  const resetBtn = $("resetBtn");
  const shortcutsWrap = $("weightShortcuts");

  // 加载重量快捷键
  let weightShortcuts = loadWeightShortcuts();
  renderWeightShortcuts(weightShortcuts);

  // 计算 & 渲染
  const doCalc = () => {
    const region = regionEl.value;
    const w0 = (weightEl.value ?? "").trim();
    const ceilWeight = !!ceilEl.checked;
    const payload = calcShipping({ weightInput: w0, region, ceilWeight });

    const wParsed = parseWeight(w0);
    const wUsed = wParsed == null ? null : (ceilWeight ? Math.ceil(wParsed) : wParsed);
    renderResult(payload, { region: normalizeRegion(region) || region, w0: wParsed ?? "-", wUsed, ceilWeight });
  };

  // ---------- 事件绑定 ----------
  btn.addEventListener("click", doCalc);
  regionEl.addEventListener("change", doCalc);

  regionEl.addEventListener("input", () => {
    window.clearTimeout(setup._r);
    setup._r = window.setTimeout(() => {
      const items = getRegionSuggestions(regionEl.value);
      renderSuggestList(items);
      openSuggest();
      doCalc();
    }, 120);
  });

  regionEl.addEventListener("focus", () => {
    const items = getRegionSuggestions(regionEl.value);
    renderSuggestList(items);
    openSuggest();
  });

  regionEl.addEventListener("blur", () => {
    window.setTimeout(closeSuggest, 120);
  });

  suggestEl.addEventListener("mousedown", (e) => { e.preventDefault(); });
  suggestEl.addEventListener("click", (e) => {
    const item = e.target?.closest?.(".item");
    if (!item) return;
    regionEl.value = item.getAttribute("data-value") || "";
    closeSuggest();
    doCalc();
  });

  ceilEl.addEventListener("change", doCalc);

  weightEl.addEventListener("input", () => {
    window.clearTimeout(setup._t);
    setup._t = window.setTimeout(doCalc, 150);
  });

  // ---------- 重量快捷键 ----------
  shortcutsWrap.addEventListener("click", (e) => {
    const pill = e.target.closest(".shortcut-pill");
    if (pill) {
      const idx = parseInt(pill.dataset.index, 10);
      const val = weightShortcuts[idx];
      if (val != null) {
        weightEl.value = String(val);
        doCalc();
        weightEl.focus();
      }
      return;
    }

    // 编辑按钮
    if (e.target.id === "editShortcutsBtn") {
      renderEditShortcuts(weightShortcuts);
      // 自动聚焦第一个输入
      const firstInput = shortcutsWrap.querySelector(".shortcut-input");
      if (firstInput) setTimeout(() => firstInput.focus(), 50);
      return;
    }

    // 保存按钮
    if (e.target.id === "saveShortcutsBtn") {
      const inputs = shortcutsWrap.querySelectorAll(".shortcut-input");
      const newVals = [];
      let valid = true;
      for (const inp of inputs) {
        const v = parseFloat(inp.value);
        if (!isFinite(v) || v <= 0) { valid = false; break; }
        newVals.push(v);
      }
      if (!valid || newVals.length < 3) {
        alert("请填写有效的正数（至少3个）。");
        return;
      }
      weightShortcuts = newVals;
      saveWeightShortcuts(newVals);
      renderWeightShortcuts(newVals);
      return;
    }
  });

  // 快捷键输入框：回车保存
  shortcutsWrap.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const saveBtn = document.getElementById("saveShortcutsBtn");
      if (saveBtn) saveBtn.click();
    }
  });

  // ---------- 重置 ----------
  resetBtn.addEventListener("click", () => {
    weightEl.value = "";
    regionEl.value = "";
    ceilEl.checked = true;
    $("result").innerHTML = `<div class="meta">请输入重量并选择地域后点击"计算"。</div>`;
    $("copyBtnWrap").innerHTML = "";
    renderSuggestList(getRegionSuggestions(""));
    weightEl.focus();
  });

  // ---------- 初始 ----------
  $("result").innerHTML = `<div class="meta">请输入重量并选择地域后点击"计算"。</div>`;

  // Service Worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

document.addEventListener("DOMContentLoaded", setup);