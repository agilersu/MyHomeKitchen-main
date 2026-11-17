/**
 * 「苏大厨与吃货配置 · 本地纯净版」纯本地存储与业务引擎
 * 零远程后端依赖：支持微信小程序 StorageSync，并在 Node 测试环境下自动回退内存存储
 */

const STORAGE_KEY = 'CHUSHEN_LOCAL_DB_V1';
const DB_VERSION = 1;

const memoryFallback = new Map();

function readStorage(key) {
  if (typeof wx !== 'undefined' && typeof wx.getStorageSync === 'function') {
    try {
      return wx.getStorageSync(key);
    } catch (e) {
      return null;
    }
  }
  return memoryFallback.has(key) ? memoryFallback.get(key) : null;
}

function writeStorage(key, value) {
  if (typeof wx !== 'undefined' && typeof wx.setStorageSync === 'function') {
    wx.setStorageSync(key, value);
    return;
  }
  memoryFallback.set(key, JSON.parse(JSON.stringify(value)));
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function formatDate(dateObj) {
  const d = dateObj || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function addDays(baseDateStr, offsetDays) {
  const base = baseDateStr ? new Date(baseDateStr.replace(/-/g, '/')) : new Date();
  base.setDate(base.getDate() + offsetDays);
  return formatDate(base);
}

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[\s()（）【】[\]·.,，。:：]/g, '');
}

const THEME_PRESETS = [
  {
    id: 'orange',
    name: '暖阳橙',
    primary: '#FF6B35',
    gradient: 'linear-gradient(135deg, #FF8A5B 0%, #FF5A1F 100%)',
    softBg: '#FFF0E8',
    textOnPrimary: '#FFFFFF'
  },
  {
    id: 'green',
    name: '森系绿',
    primary: '#22A06B',
    gradient: 'linear-gradient(135deg, #34C38F 0%, #1E8E5A 100%)',
    softBg: '#E8F8F0',
    textOnPrimary: '#FFFFFF'
  },
  {
    id: 'coffee',
    name: '奶油咖',
    primary: '#8B5E3C',
    gradient: 'linear-gradient(135deg, #B07D56 0%, #734B2D 100%)',
    softBg: '#F6EFE8',
    textOnPrimary: '#FFFFFF'
  },
  {
    id: 'pink',
    name: '樱花粉',
    primary: '#E85D75',
    gradient: 'linear-gradient(135deg, #F47C91 0%, #D94862 100%)',
    softBg: '#FDECEE',
    textOnPrimary: '#FFFFFF'
  }
];

const MEAL_TYPES = [
  { id: 'breakfast', name: '早餐', icon: '/static/breakfast.svg', emoji: '🌅' },
  { id: 'lunch', name: '午餐', icon: '/static/lunch.svg', emoji: '☀️' },
  { id: 'tea', name: '下午茶', icon: '/static/afternoon_tea.svg', emoji: '🍵' },
  { id: 'dinner', name: '晚餐', icon: '/static/moon.svg', emoji: '🌙' }
];

const STORAGE_ZONES = [
  { id: 'cold', name: '冷藏保鲜', emoji: '❄️' },
  { id: 'frozen', name: '冷冻囤货', emoji: '🧊' },
  { id: 'dry', name: '常温干货', emoji: '🌾' },
  { id: 'seasoning', name: '调料酱汁', emoji: '🧂' }
];

const RECIPE_COVER_COLORS = [
  '#FFE5D9',
  '#E3F2FD',
  '#E8F5E9',
  '#FFF8E1',
  '#FCE4EC',
  '#F3E5F5'
];

function createSeedData() {
  const today = formatDate(new Date());
  const k1 = 'kitchen_home';
  const k2 = 'kitchen_light';

  return {
    version: DB_VERSION,
    profile: {
      nickName: '家庭大厨',
      role: 'chef', // chef | foodie
      avatar: '/static/default_avatar.jpg',
      signature: '好好吃饭，用心生活'
    },
    currentKitchenId: k1,
    kitchens: [
      {
        id: k1,
        name: '苏大厨的房间',
        notice: '欢迎来到苏大厨的房间点单！少油少盐可提前备注，晚饭 18:30 开饭~',
        themeId: 'orange',
        createdAt: today
      },
      {
        id: k2,
        name: '减脂轻食屋',
        notice: '高蛋白低脂日常菜单，支持一键算缺口去买菜',
        themeId: 'green',
        createdAt: today
      }
    ],
    categories: [
      { id: 'cat_hot', kitchenId: k1, name: '招牌硬菜', sort: 1 },
      { id: 'cat_home', kitchenId: k1, name: '家常小炒', sort: 2 },
      { id: 'cat_veg', kitchenId: k1, name: '清爽时蔬', sort: 3 },
      { id: 'cat_soup', kitchenId: k1, name: '汤羹主食', sort: 4 },
      { id: 'cat_drink', kitchenId: k1, name: '自制饮品', sort: 5 },
      { id: 'cat_salad', kitchenId: k2, name: '能量碗/沙拉', sort: 1 },
      { id: 'cat_protein', kitchenId: k2, name: '低脂高蛋白', sort: 2 }
    ],
    recipes: [
      {
        id: 'rec_cola_wing',
        kitchenId: k1,
        categoryId: 'cat_hot',
        name: '可乐鸡翅',
        description: '外皮微焦甜香，肉质软嫩脱骨，家庭点单率第一名',
        coverImage: '',
        coverBg: '#FFE5D9',
        emoji: '🍗',
        cookTime: 25,
        difficulty: '简单',
        cookCount: 12,
        specs: ['原味微甜', '加辣开胃', '多汁收浓'],
        ingredients: [
          { name: '鸡中翅', amount: 10, unit: '个' },
          { name: '可乐', amount: 1, unit: '罐' },
          { name: '生姜', amount: 3, unit: '片' },
          { name: '生抽', amount: 2, unit: '勺' },
          { name: '料酒', amount: 1, unit: '勺' }
        ],
        steps: [
          '鸡中翅洗净两面划斜刀，冷水下锅加姜片和料酒焯水2分钟后捞出沥干。',
          '热锅少油，放入鸡翅小火煎至两面金黄微焦。',
          '倒入生抽翻炒上色，倒入一整罐可乐没过鸡翅。',
          '中小火加盖焖煮12分钟，最后开大火收汁撒白芝麻出锅。'
        ]
      },
      {
        id: 'rec_braised_pork',
        kitchenId: k1,
        categoryId: 'cat_hot',
        name: '家常红烧肉',
        description: '肥而不腻、入口即化，配米饭能吃两大碗',
        coverImage: '',
        coverBg: '#FFF8E1',
        emoji: '🥩',
        cookTime: 50,
        difficulty: '中等',
        cookCount: 7,
        specs: ['经典甜口', '微辣版', '加鹌鹑蛋'],
        ingredients: [
          { name: '五花肉', amount: 500, unit: '克' },
          { name: '冰糖', amount: 20, unit: '克' },
          { name: '生抽', amount: 2, unit: '勺' },
          { name: '老抽', amount: 1, unit: '勺' },
          { name: '生姜', amount: 4, unit: '片' }
        ],
        steps: [
          '五花肉切麻将块，冷水下锅加姜片焯水撇净浮沫后捞出。',
          '锅中放少量油和冰糖，小火炒出琥珀色糖色后下五花肉翻炒上色。',
          '加入生抽、老抽炒香，倒入开水没过肉块。',
          '小火慢炖40分钟至软烂，转大火收浓汤汁即可。'
        ]
      },
      {
        id: 'rec_tomato_egg',
        kitchenId: k1,
        categoryId: 'cat_home',
        name: '番茄炒蛋',
        description: '国民下饭菜，酸甜浓郁带汤汁，十分钟快手搞定',
        coverImage: '',
        coverBg: '#FCE4EC',
        emoji: '🍅',
        cookTime: 10,
        difficulty: '简单',
        cookCount: 24,
        specs: ['酸甜多汁', '少糖咸鲜', '嫩滑鸡蛋'],
        ingredients: [
          { name: '西红柿', amount: 2, unit: '个' },
          { name: '鸡蛋', amount: 3, unit: '个' },
          { name: '小葱', amount: 1, unit: '根' },
          { name: '番茄酱', amount: 1, unit: '勺' }
        ],
        steps: [
          '鸡蛋打散加少许盐和清水；西红柿划十字开水烫去外皮切块。',
          '热锅多油滑炒鸡蛋至刚凝固即盛出，保持嫩滑。',
          '留底油炒软西红柿出沙，加一勺番茄酱和少许白糖调味。',
          '倒回鸡蛋快速翻匀裹上茄汁，撒葱花出锅。'
        ]
      },
      {
        id: 'rec_mapo_tofu',
        kitchenId: k1,
        categoryId: 'cat_home',
        name: '麻婆豆腐',
        description: '麻辣鲜香烫嫩，超下饭经典川味家常菜',
        coverImage: '',
        coverBg: '#FFE5D9',
        emoji: '🌶️',
        cookTime: 15,
        difficulty: '简单',
        cookCount: 9,
        specs: ['微辣鲜香', '地道麻辣', '素版免肉末'],
        ingredients: [
          { name: '嫩豆腐', amount: 1, unit: '盒' },
          { name: '肉末', amount: 80, unit: '克' },
          { name: '郫县豆瓣酱', amount: 1, unit: '勺' },
          { name: '小葱', amount: 2, unit: '根' }
        ],
        steps: [
          '嫩豆腐切小方块，淡盐水焯水2分钟去除豆腥味并防碎。',
          '热锅炒香肉末，加入豆瓣酱和蒜末炒出红油。',
          '加适量清水煮沸，轻轻推入豆腐小火煮5分钟入味。',
          '分两次淋入水淀粉勾芡至汤汁亮滑，撒花椒粉和葱花。'
        ]
      },
      {
        id: 'rec_garlic_broccoli',
        kitchenId: k1,
        categoryId: 'cat_veg',
        name: '蒜蓉清炒西蓝花',
        description: '脆嫩爽口不油腻，保留蔬菜清甜与营养',
        coverImage: '',
        coverBg: '#E8F5E9',
        emoji: '🥦',
        cookTime: 10,
        difficulty: '简单',
        cookCount: 15,
        specs: ['清淡蒜香', '加蚝油鲜香'],
        ingredients: [
          { name: '西蓝花', amount: 1, unit: '颗' },
          { name: '大蒜', amount: 4, unit: '瓣' },
          { name: '胡萝卜', amount: 0.5, unit: '根' }
        ],
        steps: [
          '西蓝花切小朵盐水浸泡洗净，水开加少许盐和油焯水1分钟捞出。',
          '热锅下蒜末小火爆香，加入胡萝卜片翻炒。',
          '倒入西蓝花大火快炒1分钟，加盐和少许鸡精调味出锅。'
        ]
      },
      {
        id: 'rec_sea_bass',
        kitchenId: k1,
        categoryId: 'cat_soup',
        name: '清蒸鲈鱼',
        description: '鲜嫩低脂无腥味，家宴与周末晚餐必备硬菜',
        coverImage: '',
        coverBg: '#E3F2FD',
        emoji: '🐟',
        cookTime: 18,
        difficulty: '中等',
        cookCount: 5,
        specs: ['经典蒸鱼豉油', '清淡少油'],
        ingredients: [
          { name: '海鲈鱼', amount: 1, unit: '条' },
          { name: '生姜', amount: 4, unit: '片' },
          { name: '小葱', amount: 2, unit: '根' },
          { name: '蒸鱼豉油', amount: 2, unit: '勺' }
        ],
        steps: [
          '鲈鱼处理干净两面改花刀，用姜片葱段和料酒腌制10分钟。',
          '水开后上锅大火蒸8分钟，关火虚蒸2分钟后倒掉盘中腥水。',
          '铺上新鲜葱丝姜丝，淋蒸鱼豉油，浇一勺热油激香。'
        ]
      },
      {
        id: 'rec_lemon_tea',
        kitchenId: k1,
        categoryId: 'cat_drink',
        name: '手打暴打柠檬茶',
        description: '解腻清爽一百分，在家复刻奶茶店爆款',
        coverImage: '',
        coverBg: '#FFF8E1',
        emoji: '🍋',
        cookTime: 8,
        difficulty: '简单',
        cookCount: 11,
        specs: ['少冰三分糖', '正常冰五分糖', '鸭屎香茶底'],
        ingredients: [
          { name: '香水柠檬', amount: 1, unit: '个' },
          { name: '红茶包', amount: 1, unit: '包' },
          { name: '冰块', amount: 150, unit: '克' }
        ],
        steps: [
          '茶包用150ml热水泡3分钟滤出茶汤，放凉备用。',
          '香水柠檬切片去籽，与冰块一起用力捶打出柠檬香气。',
          '倒入茶汤和适量糖浆摇匀即可享用。'
        ]
      },
      {
        id: 'rec_chicken_salad',
        kitchenId: k2,
        categoryId: 'cat_salad',
        name: '黑椒香煎鸡胸能量碗',
        description: '嫩而不柴的鸡胸肉搭配时蔬杂粮，饱腹感满分',
        coverImage: '',
        coverBg: '#E8F5E9',
        emoji: '🥗',
        cookTime: 15,
        difficulty: '简单',
        cookCount: 6,
        specs: ['油醋汁', '焙煎芝麻酱'],
        ingredients: [
          { name: '鸡胸肉', amount: 150, unit: '克' },
          { name: '生菜', amount: 100, unit: '克' },
          { name: '鸡蛋', amount: 1, unit: '个' },
          { name: '黑胡椒', amount: 1, unit: '小勺' }
        ],
        steps: [
          '鸡胸肉片薄，用黑胡椒、少许生抽和橄榄油腌制10分钟。',
          '平底锅少油中火每面煎3分钟至微焦熟透，切片。',
          '碗底铺生菜与水煮蛋，摆上鸡胸肉淋酱汁即可。'
        ]
      },
      {
        id: 'rec_shrimp_egg',
        kitchenId: k2,
        categoryId: 'cat_protein',
        name: '虾仁滑蛋',
        description: '双倍优质蛋白，滑嫩鲜甜少油健康',
        coverImage: '',
        coverBg: '#E3F2FD',
        emoji: '🍤',
        cookTime: 10,
        difficulty: '简单',
        cookCount: 4,
        specs: ['原味鲜香', '加黑胡椒'],
        ingredients: [
          { name: '大虾仁', amount: 120, unit: '克' },
          { name: '鸡蛋', amount: 3, unit: '个' },
          { name: '小葱', amount: 1, unit: '根' }
        ],
        steps: [
          '虾仁开背去虾线，加少许料酒胡椒粉抓匀腌5分钟。',
          '锅中煎熟虾仁后倒入蛋液，小火轻轻推炒至蛋液半凝固即关火。',
          '利用余温推匀，撒葱花出锅。'
        ]
      }
    ],
    fridgeItems: [
      {
        id: 'fr_egg',
        name: '鸡蛋',
        zone: 'cold',
        qty: 8,
        unit: '个',
        expireDate: addDays(today, 10),
        note: '散养土鸡蛋'
      },
      {
        id: 'fr_tomato',
        name: '西红柿',
        zone: 'cold',
        qty: 3,
        unit: '个',
        expireDate: addDays(today, 2),
        note: '沙瓤大番茄，尽快吃完'
      },
      {
        id: 'fr_broccoli',
        name: '西蓝花',
        zone: 'cold',
        qty: 1,
        unit: '颗',
        expireDate: addDays(today, 3),
        note: '绿花菜'
      },
      {
        id: 'fr_wing',
        name: '鸡中翅',
        zone: 'frozen',
        qty: 12,
        unit: '个',
        expireDate: addDays(today, 45),
        note: '冷冻独立分装'
      },
      {
        id: 'fr_shrimp',
        name: '大虾仁',
        zone: 'frozen',
        qty: 200,
        unit: '克',
        expireDate: addDays(today, 30),
        note: '冷冻净虾仁'
      },
      {
        id: 'fr_scallion',
        name: '小葱',
        zone: 'cold',
        qty: 2,
        unit: '根',
        expireDate: addDays(today, 1),
        note: '记得优先使用'
      },
      {
        id: 'fr_soy',
        name: '生抽',
        zone: 'seasoning',
        qty: 1,
        unit: '瓶',
        expireDate: addDays(today, 180),
        note: '特级生抽'
      },
      {
        id: 'fr_ginger',
        name: '生姜',
        zone: 'dry',
        qty: 1,
        unit: '块',
        expireDate: addDays(today, 14),
        note: '老姜'
      },
      {
        id: 'fr_garlic',
        name: '大蒜',
        zone: 'dry',
        qty: 6,
        unit: '瓣',
        expireDate: addDays(today, 20),
        note: '紫皮蒜'
      }
    ],
    carts: {
      [k1]: [],
      [k2]: []
    },
    orders: [
      {
        id: 'ord_demo_1',
        kitchenId: k1,
        kitchenName: '温馨家庭小馆',
        mealDate: today,
        mealType: 'dinner',
        ordererName: '吃货小宝',
        remark: '鸡翅多焖一会，番茄炒蛋多留汁拌饭~',
        status: 'pending',
        createdAt: `${today} 10:30`,
        items: [
          {
            recipeId: 'rec_cola_wing',
            name: '可乐鸡翅',
            emoji: '🍗',
            spec: '原味微甜',
            qty: 1,
            cookTime: 25
          },
          {
            recipeId: 'rec_tomato_egg',
            name: '番茄炒蛋',
            emoji: '🍅',
            spec: '酸甜多汁',
            qty: 1,
            cookTime: 10
          }
        ],
        workImage: '',
        workNote: '',
        completedAt: ''
      },
      {
        id: 'ord_demo_2',
        kitchenId: k1,
        kitchenName: '温馨家庭小馆',
        mealDate: addDays(today, -1),
        mealType: 'lunch',
        ordererName: '家庭大厨',
        remark: '少油少盐',
        status: 'completed',
        createdAt: `${addDays(today, -1)} 11:20`,
        items: [
          {
            recipeId: 'rec_garlic_broccoli',
            name: '蒜蓉清炒西蓝花',
            emoji: '🥦',
            spec: '清淡蒜香',
            qty: 1,
            cookTime: 10
          }
        ],
        workImage: '',
        workNote: '焯水1分钟再炒特别脆嫩，光盘啦！',
        completedAt: `${addDays(today, -1)} 12:15`
      }
    ],
    mealPlans: {
      [today]: {
        breakfast: ['rec_tomato_egg'],
        lunch: ['rec_garlic_broccoli'],
        tea: ['rec_lemon_tea'],
        dinner: ['rec_cola_wing', 'rec_sea_bass']
      }
    },
    shoppingChecks: {},
    stockedShoppingSources: {},
    customShoppingItems: [
      { id: 'shop_custom_1', name: '可乐', amountText: '2罐', checked: false }
    ],
    timers: [
      {
        id: 'tm_1',
        name: '溏心水煮蛋',
        durationSec: 360,
        remainingSec: 360,
        status: 'idle',
        endTime: null
      },
      {
        id: 'tm_2',
        name: '清蒸鲈鱼',
        durationSec: 480,
        remainingSec: 480,
        status: 'idle',
        endTime: null
      }
    ]
  };
}

function getDB() {
  let db = readStorage(STORAGE_KEY);
  if (!db || typeof db !== 'object' || !db.kitchens) {
    db = createSeedData();
    writeStorage(STORAGE_KEY, db);
  }
  return db;
}

function saveDB(db) {
  writeStorage(STORAGE_KEY, db);
  return db;
}

function initStore() {
  return getDB();
}

function resetStore() {
  const seed = createSeedData();
  saveDB(seed);
  return clone(seed);
}

// ---------- 个人身份 ----------
function getProfile() {
  return clone(getDB().profile);
}

function saveProfile(profile) {
  const db = getDB();
  db.profile = Object.assign({}, db.profile, profile);
  saveDB(db);
  return clone(db.profile);
}

// ---------- 厨房与主题 ----------
function getThemeById(themeId) {
  return THEME_PRESETS.find((t) => t.id === themeId) || THEME_PRESETS[0];
}

function getKitchens() {
  const db = getDB();
  return db.kitchens.map((k) => Object.assign({}, k, { theme: getThemeById(k.themeId) }));
}

function getCurrentKitchen() {
  const db = getDB();
  let current = db.kitchens.find((k) => k.id === db.currentKitchenId);
  if (!current && db.kitchens.length > 0) {
    current = db.kitchens[0];
    db.currentKitchenId = current.id;
    saveDB(db);
  }
  return current ? Object.assign({}, current, { theme: getThemeById(current.themeId) }) : null;
}

function switchKitchen(kitchenId) {
  const db = getDB();
  const exists = db.kitchens.some((k) => k.id === kitchenId);
  if (exists) {
    db.currentKitchenId = kitchenId;
    saveDB(db);
  }
  return getCurrentKitchen();
}

function saveKitchen(kitchen) {
  const db = getDB();
  if (kitchen.id) {
    const idx = db.kitchens.findIndex((k) => k.id === kitchen.id);
    if (idx >= 0) {
      db.kitchens[idx] = Object.assign({}, db.kitchens[idx], kitchen);
      saveDB(db);
      return clone(db.kitchens[idx]);
    }
  }
  const newKitchen = {
    id: kitchen.id || uid('kitchen'),
    name: String(kitchen.name || '我的私厨').trim(),
    notice: String(kitchen.notice || '欢迎点单！').trim(),
    themeId: kitchen.themeId || 'orange',
    createdAt: formatDate(new Date())
  };
  db.kitchens.push(newKitchen);
  db.currentKitchenId = newKitchen.id;
  // 为新厨房默认创建一个主分类
  db.categories.push({
    id: uid('cat'),
    kitchenId: newKitchen.id,
    name: '招牌推荐',
    sort: 1
  });
  db.carts[newKitchen.id] = [];
  saveDB(db);
  return clone(newKitchen);
}

function deleteKitchen(kitchenId) {
  const db = getDB();
  if (db.kitchens.length <= 1) {
    return { ok: false, reason: '至少保留一个厨房' };
  }
  db.kitchens = db.kitchens.filter((k) => k.id !== kitchenId);
  db.categories = db.categories.filter((c) => c.kitchenId !== kitchenId);
  db.recipes = db.recipes.filter((r) => r.kitchenId !== kitchenId);
  delete db.carts[kitchenId];
  if (db.currentKitchenId === kitchenId) {
    db.currentKitchenId = db.kitchens[0].id;
  }
  saveDB(db);
  return { ok: true };
}

// ---------- 分类管理 ----------
function getCategories(kitchenId) {
  const db = getDB();
  const targetId = kitchenId || db.currentKitchenId;
  return db.categories
    .filter((c) => c.kitchenId === targetId)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0))
    .map((c) => clone(c));
}

function saveCategory(cat) {
  const db = getDB();
  const kitchenId = cat.kitchenId || db.currentKitchenId;
  if (cat.id) {
    const idx = db.categories.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      db.categories[idx] = Object.assign({}, db.categories[idx], { name: String(cat.name || '').trim() });
      saveDB(db);
      return clone(db.categories[idx]);
    }
  }
  const sameKitchen = db.categories.filter((c) => c.kitchenId === kitchenId);
  const maxSort = sameKitchen.reduce((m, item) => Math.max(m, item.sort || 0), 0);
  const created = {
    id: uid('cat'),
    kitchenId,
    name: String(cat.name || '新分类').trim(),
    sort: maxSort + 1
  };
  db.categories.push(created);
  saveDB(db);
  return clone(created);
}

function moveCategory(categoryId, direction) {
  const db = getDB();
  const target = db.categories.find((c) => c.id === categoryId);
  if (!target) return [];
  const siblings = db.categories
    .filter((c) => c.kitchenId === target.kitchenId)
    .sort((a, b) => (a.sort || 0) - (b.sort || 0));
  const idx = siblings.findIndex((c) => c.id === categoryId);
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) {
    return siblings.map((c) => clone(c));
  }
  const tmp = siblings[idx];
  siblings[idx] = siblings[swapIdx];
  siblings[swapIdx] = tmp;
  siblings.forEach((item, i) => {
    const origin = db.categories.find((c) => c.id === item.id);
    if (origin) origin.sort = i + 1;
  });
  saveDB(db);
  return getCategories(target.kitchenId);
}

function deleteCategory(categoryId) {
  const db = getDB();
  const target = db.categories.find((c) => c.id === categoryId);
  if (!target) return { ok: false, reason: '分类不存在' };
  const siblings = db.categories.filter((c) => c.kitchenId === target.kitchenId);
  if (siblings.length <= 1) {
    return { ok: false, reason: '每个厨房至少保留一个分类' };
  }
  const fallback = siblings.find((c) => c.id !== categoryId);
  db.recipes.forEach((r) => {
    if (r.categoryId === categoryId && fallback) {
      r.categoryId = fallback.id;
    }
  });
  db.categories = db.categories.filter((c) => c.id !== categoryId);
  saveDB(db);
  return { ok: true };
}

// ---------- 菜谱管理 ----------
function getAllRecipes() {
  return clone(getDB().recipes);
}

function getRecipes(kitchenId) {
  const db = getDB();
  const targetId = kitchenId || db.currentKitchenId;
  return db.recipes.filter((r) => r.kitchenId === targetId).map((r) => clone(r));
}

function getRecipeById(id) {
  const found = getDB().recipes.find((r) => r.id === id);
  return found ? clone(found) : null;
}

function saveRecipe(recipe) {
  const db = getDB();
  const kitchenId = recipe.kitchenId || db.currentKitchenId;
  const cleanIngredients = (recipe.ingredients || [])
    .filter((ing) => ing && String(ing.name || '').trim())
    .map((ing) => ({
      name: String(ing.name).trim(),
      amount: Number(ing.amount) > 0 ? Number(ing.amount) : 1,
      unit: String(ing.unit || '份').trim()
    }));
  const cleanSteps = (recipe.steps || [])
    .map((s) => String(s || '').trim())
    .filter(Boolean);
  const cleanSpecs = (recipe.specs || [])
    .map((s) => String(s || '').trim())
    .filter(Boolean);

  if (recipe.id) {
    const idx = db.recipes.findIndex((r) => r.id === recipe.id);
    if (idx >= 0) {
      db.recipes[idx] = Object.assign({}, db.recipes[idx], {
        categoryId: recipe.categoryId || db.recipes[idx].categoryId,
        name: String(recipe.name || '').trim(),
        description: String(recipe.description || '').trim(),
        coverImage: recipe.coverImage !== undefined ? recipe.coverImage : db.recipes[idx].coverImage,
        emoji: recipe.emoji || db.recipes[idx].emoji || '🍲',
        cookTime: Number(recipe.cookTime) || 15,
        difficulty: recipe.difficulty || '简单',
        specs: cleanSpecs.length ? cleanSpecs : ['默认口味'],
        ingredients: cleanIngredients,
        steps: cleanSteps
      });
      saveDB(db);
      return clone(db.recipes[idx]);
    }
  }

  const cats = getCategories(kitchenId);
  const created = {
    id: uid('rec'),
    kitchenId,
    categoryId: recipe.categoryId || (cats[0] ? cats[0].id : ''),
    name: String(recipe.name || '未命名菜品').trim(),
    description: String(recipe.description || '').trim(),
    coverImage: recipe.coverImage || '',
    coverBg: recipe.coverBg || RECIPE_COVER_COLORS[db.recipes.length % RECIPE_COVER_COLORS.length],
    emoji: recipe.emoji || '🍲',
    cookTime: Number(recipe.cookTime) || 15,
    difficulty: recipe.difficulty || '简单',
    cookCount: 0,
    specs: cleanSpecs.length ? cleanSpecs : ['默认口味'],
    ingredients: cleanIngredients,
    steps: cleanSteps
  };
  db.recipes.push(created);
  saveDB(db);
  return clone(created);
}

function deleteRecipe(recipeId) {
  const db = getDB();
  db.recipes = db.recipes.filter((r) => r.id !== recipeId);
  Object.keys(db.carts).forEach((kId) => {
    db.carts[kId] = (db.carts[kId] || []).filter((item) => item.recipeId !== recipeId);
  });
  saveDB(db);
}

/**
 * 智能菜谱文本解析（支持粘贴小红书/下厨房格式菜谱文本）
 */
function parseRecipeText(rawText) {
  const lines = String(rawText || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { name: '', description: '', ingredients: [], steps: [], cookTime: 15 };
  }

  let name = '';
  let section = 'intro'; // intro | ingredients | steps
  const ingredients = [];
  const steps = [];
  const introLines = [];

  const ingHeaderRe = /^(?:【?\s*(?:食材|用料|主料|辅料|配料|准备材料)\s*】?[:：]?)$/;
  const stepHeaderRe = /^(?:【?\s*(?:步骤|做法|制作方法|烹饪步骤|操作步骤)\s*】?[:：]?)$/;
  const stepLineRe = /^(?:\d+[.、)）]|第[一二三四五六七八九十\d]+步[:：]?|[①②③④⑤⑥⑦⑧⑨⑩])\s*(.+)$/;
  const ingAmountRe = /^([^\d:：\s]+(?:\s*[^\d:：\s]+)?)\s*[:：]?\s*(\d+(?:\.\d+)?)\s*([a-zA-Z\u4e00-\u9fa5]+)?$/;

  lines.forEach((line, idx) => {
    const cleanLine = line.replace(/^[-•*▪]\s*/, '').trim();
    if (ingHeaderRe.test(cleanLine)) {
      section = 'ingredients';
      return;
    }
    if (stepHeaderRe.test(cleanLine)) {
      section = 'steps';
      return;
    }

    if (idx === 0 && !stepLineRe.test(cleanLine) && !ingAmountRe.test(cleanLine)) {
      name = cleanLine.replace(/^[【#\s]+|[】#\s]+$/g, '').slice(0, 24);
      return;
    }

    const stepMatch = cleanLine.match(stepLineRe);
    if (stepMatch) {
      section = 'steps';
      steps.push(stepMatch[1].trim());
      return;
    }

    if (section === 'ingredients') {
      const m = cleanLine.match(ingAmountRe);
      if (m) {
        ingredients.push({
          name: m[1].trim(),
          amount: Number(m[2]) || 1,
          unit: (m[3] || '份').trim()
        });
      } else {
        // 支持 "盐 适量" 或 "生抽少许"
        const parts = cleanLine.split(/[:：\s]+/);
        ingredients.push({
          name: parts[0],
          amount: 1,
          unit: parts[1] || '适量'
        });
      }
      return;
    }

    if (section === 'steps') {
      steps.push(cleanLine);
      return;
    }

    // 未声明分段时，优先判断是否是“食材 数量单位”行
    const m = cleanLine.match(ingAmountRe);
    if (m && cleanLine.length <= 20) {
      ingredients.push({
        name: m[1].trim(),
        amount: Number(m[2]) || 1,
        unit: (m[3] || '份').trim()
      });
    } else {
      introLines.push(cleanLine);
    }
  });

  if (!name && introLines.length > 0) {
    name = introLines.shift().slice(0, 24);
  }
  const description = introLines.join(' ').slice(0, 80);

  // 估算耗时：从步骤中的分钟数累计或默认 20 分钟
  let totalMin = 0;
  steps.forEach((s) => {
    const matches = s.match(/(\d+)\s*分钟/g);
    if (matches) {
      matches.forEach((t) => {
        totalMin += parseInt(t, 10) || 0;
      });
    }
  });

  return {
    name: name || '导入菜谱',
    description,
    ingredients,
    steps,
    cookTime: totalMin > 0 ? Math.min(180, totalMin + 5) : 20
  };
}

// ---------- 冰箱库存与保质期 ----------
function computeExpiryStatus(expireDate) {
  if (!expireDate) {
    return { status: 'fresh', label: '长期/未设', daysLeft: 999 };
  }
  const today = new Date(formatDate(new Date()).replace(/-/g, '/'));
  const target = new Date(String(expireDate).replace(/-/g, '/'));
  const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) {
    return { status: 'expired', label: `已过期${Math.abs(diffDays)}天`, daysLeft: diffDays };
  }
  if (diffDays === 0) {
    return { status: 'soon', label: '今天到期', daysLeft: 0 };
  }
  if (diffDays <= 3) {
    return { status: 'soon', label: `剩${diffDays}天临期`, daysLeft: diffDays };
  }
  return { status: 'fresh', label: `剩${diffDays}天`, daysLeft: diffDays };
}

function getFridgeItems() {
  const db = getDB();
  return db.fridgeItems
    .map((item) => Object.assign({}, item, { expiry: computeExpiryStatus(item.expireDate) }))
    .sort((a, b) => a.expiry.daysLeft - b.expiry.daysLeft);
}

function saveFridgeItem(item) {
  const db = getDB();
  const payload = {
    name: String(item.name || '').trim(),
    zone: item.zone || 'cold',
    qty: Math.max(0, Number(item.qty) || 0),
    unit: String(item.unit || '个').trim(),
    expireDate: item.expireDate || addDays(formatDate(new Date()), 7),
    note: String(item.note || '').trim()
  };

  if (item.id) {
    const idx = db.fridgeItems.findIndex((f) => f.id === item.id);
    if (idx >= 0) {
      db.fridgeItems[idx] = Object.assign({}, db.fridgeItems[idx], payload);
      saveDB(db);
      return clone(db.fridgeItems[idx]);
    }
  }
  const created = Object.assign({ id: uid('fr') }, payload);
  db.fridgeItems.push(created);
  saveDB(db);
  return clone(created);
}

function updateFridgeItemQty(id, delta) {
  const db = getDB();
  const idx = db.fridgeItems.findIndex((f) => f.id === id);
  if (idx < 0) return null;
  const nextQty = Math.max(0, Number((Number(db.fridgeItems[idx].qty) + Number(delta)).toFixed(2)));
  db.fridgeItems[idx].qty = nextQty;
  saveDB(db);
  return clone(db.fridgeItems[idx]);
}

function deleteFridgeItem(id) {
  const db = getDB();
  db.fridgeItems = db.fridgeItems.filter((f) => f.id !== id);
  saveDB(db);
}

function findMatchingFridgeItem(fridgeItems, ingredientName) {
  const target = normalizeName(ingredientName);
  if (!target) return null;
  return (
    fridgeItems.find((f) => {
      const fn = normalizeName(f.name);
      return fn && f.qty > 0 && (fn === target || fn.includes(target) || target.includes(fn));
    }) || null
  );
}

function checkRecipeStockStatus(recipe) {
  const fridgeItems = getFridgeItems();
  const ingredients = recipe && recipe.ingredients ? recipe.ingredients : [];
  if (ingredients.length === 0) {
    return { total: 0, availableCount: 0, missingCount: 0, ratioText: '无需备料', allReady: true, details: [] };
  }
  const details = ingredients.map((ing) => {
    const matched = findMatchingFridgeItem(fridgeItems, ing.name);
    return {
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      inFridge: Boolean(matched),
      fridgeQtyText: matched ? `${matched.qty}${matched.unit}` : ''
    };
  });
  const availableCount = details.filter((d) => d.inFridge).length;
  const missingCount = details.length - availableCount;
  return {
    total: details.length,
    availableCount,
    missingCount,
    allReady: missingCount === 0,
    ratioText: missingCount === 0 ? '食材齐备' : `缺${missingCount}样食材`,
    details
  };
}

// ---------- 菜篮子 & 订单 ----------
function getCart(kitchenId) {
  const db = getDB();
  const kId = kitchenId || db.currentKitchenId;
  return clone(db.carts[kId] || []);
}

function addToCart(kitchenId, recipe, specText) {
  const db = getDB();
  const kId = kitchenId || db.currentKitchenId;
  if (!db.carts[kId]) db.carts[kId] = [];
  const spec = specText || (recipe.specs && recipe.specs[0]) || '默认口味';
  const existing = db.carts[kId].find((item) => item.recipeId === recipe.id && item.spec === spec);
  if (existing) {
    existing.qty += 1;
  } else {
    db.carts[kId].push({
      cartItemId: uid('ci'),
      recipeId: recipe.id,
      name: recipe.name,
      emoji: recipe.emoji || '🍲',
      coverImage: recipe.coverImage || '',
      coverBg: recipe.coverBg || '#FFE5D9',
      cookTime: recipe.cookTime || 15,
      spec,
      qty: 1
    });
  }
  saveDB(db);
  return clone(db.carts[kId]);
}

function updateCartQty(kitchenId, cartItemId, delta) {
  const db = getDB();
  const kId = kitchenId || db.currentKitchenId;
  const list = db.carts[kId] || [];
  const idx = list.findIndex((i) => i.cartItemId === cartItemId);
  if (idx >= 0) {
    list[idx].qty += delta;
    if (list[idx].qty <= 0) {
      list.splice(idx, 1);
    }
  }
  db.carts[kId] = list;
  saveDB(db);
  return clone(list);
}

function clearCart(kitchenId) {
  const db = getDB();
  const kId = kitchenId || db.currentKitchenId;
  db.carts[kId] = [];
  saveDB(db);
}

function submitOrder(payload) {
  const db = getDB();
  const kId = payload.kitchenId || db.currentKitchenId;
  const kitchen = db.kitchens.find((k) => k.id === kId);
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const order = {
    id: uid('ord'),
    kitchenId: kId,
    kitchenName: kitchen ? kitchen.name : '我的厨房',
    mealDate: payload.mealDate || formatDate(now),
    mealType: payload.mealType || 'dinner',
    ordererName: String(payload.ordererName || db.profile.nickName || '吃货').trim(),
    remark: String(payload.remark || '').trim(),
    status: 'pending',
    createdAt: `${formatDate(now)} ${hh}:${mm}`,
    items: clone(payload.items || []),
    workImage: '',
    workNote: '',
    completedAt: ''
  };
  db.orders.unshift(order);
  if (payload.clearCart !== false) {
    db.carts[kId] = [];
  }
  saveDB(db);
  return clone(order);
}

function getOrders(kitchenId) {
  const db = getDB();
  const list = kitchenId ? db.orders.filter((o) => o.kitchenId === kitchenId) : db.orders;
  return list.map((o) => {
    const mealMeta = MEAL_TYPES.find((m) => m.id === o.mealType) || MEAL_TYPES[3];
    return Object.assign({}, clone(o), { mealLabel: mealMeta.name, mealEmoji: mealMeta.emoji });
  });
}

function completeOrder(orderId, opts) {
  const db = getDB();
  const order = db.orders.find((o) => o.id === orderId);
  if (!order) return null;
  const options = opts || {};
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');

  if (order.status !== 'completed') {
    order.items.forEach((it) => {
      const rec = db.recipes.find((r) => r.id === it.recipeId);
      if (rec) {
        rec.cookCount = (rec.cookCount || 0) + (it.qty || 1);
        if (options.deductFridge) {
          (rec.ingredients || []).forEach((ing) => {
            const matched = findMatchingFridgeItem(db.fridgeItems, ing.name);
            if (matched && matched.unit === ing.unit) {
              matched.qty = Math.max(0, Number((matched.qty - ing.amount * (it.qty || 1)).toFixed(2)));
            }
          });
        }
      }
    });
  }

  order.status = 'completed';
  order.workImage = options.workImage || order.workImage || '';
  order.workNote = String(options.workNote || order.workNote || '光盘行动完成！').trim();
  order.completedAt = `${formatDate(now)} ${hh}:${mm}`;
  saveDB(db);
  return clone(order);
}

function deleteOrder(orderId) {
  const db = getDB();
  db.orders = db.orders.filter((o) => o.id !== orderId);
  saveDB(db);
}

function encodeOrderSharePayload(order) {
  if (!order || !Array.isArray(order.items)) return '';
  const compact = {
    v: 1,
    kn: String(order.kitchenName || '我的厨房'),
    md: String(order.mealDate || formatDate(new Date())),
    mt: String(order.mealType || 'dinner'),
    on: String(order.ordererName || '吃货'),
    rm: String(order.remark || ''),
    ca: String(order.createdAt || ''),
    it: order.items.map((item) => ({
      id: String(item.recipeId || ''),
      n: String(item.name || ''),
      e: String(item.emoji || '🍲'),
      s: String(item.spec || ''),
      q: Number(item.qty) || 1,
      t: Number(item.cookTime) || 15
    }))
  };
  return JSON.stringify(compact);
}

function parseOrderSharePayload(raw) {
  if (!raw || typeof raw !== 'string') return null;
  let text = raw.trim();
  if (!text) return null;
  for (let i = 0; i < 2; i++) {
    if (text.startsWith('{')) break;
    try {
      text = decodeURIComponent(text);
    } catch (e) {
      break;
    }
  }
  try {
    const parsed = JSON.parse(text);
    if (!parsed || parsed.v !== 1 || !Array.isArray(parsed.it) || parsed.it.length === 0) {
      return null;
    }
    const mealType = String(parsed.mt || 'dinner');
    const mealMeta = MEAL_TYPES.find((m) => m.id === mealType) || MEAL_TYPES[3];
    return {
      kitchenName: String(parsed.kn || '好友厨房'),
      mealDate: String(parsed.md || formatDate(new Date())),
      mealType,
      mealLabel: mealMeta.name,
      mealEmoji: mealMeta.emoji,
      ordererName: String(parsed.on || '微信好友'),
      remark: String(parsed.rm || ''),
      createdAt: String(parsed.ca || ''),
      items: parsed.it
        .filter((it) => it && it.n)
        .map((it) => ({
          recipeId: String(it.id || ''),
          name: String(it.n),
          emoji: String(it.e || '🍲'),
          spec: String(it.s || ''),
          qty: Math.max(1, Number(it.q) || 1),
          cookTime: Math.max(1, Number(it.t) || 15)
        }))
    };
  } catch (e) {
    return null;
  }
}

function importSharedOrder(sharedOrder, targetKitchenId) {
  if (!sharedOrder || !Array.isArray(sharedOrder.items) || sharedOrder.items.length === 0) {
    return null;
  }
  const db = getDB();
  const kId = targetKitchenId || db.currentKitchenId;
  return submitOrder({
    kitchenId: kId,
    mealDate: sharedOrder.mealDate,
    mealType: sharedOrder.mealType,
    ordererName: sharedOrder.ordererName,
    remark: sharedOrder.remark,
    items: sharedOrder.items,
    clearCart: false
  });
}

// ---------- 去买菜 · 智能采购清单 ----------
function getShoppingList(kitchenId) {
  const db = getDB();
  const pendingOrders = db.orders.filter(
    (o) => o.status === 'pending' && (!kitchenId || o.kitchenId === kitchenId)
  );
  const fridgeItems = getFridgeItems();
  const stockedSources = db.stockedShoppingSources || {};
  const shoppingChecks = db.shoppingChecks || {};
  const aggregated = new Map();

  function addIngredientNeed(ing, qtyMultiplier, sourceLabel, sourceToken) {
    const key = normalizeName(ing.name);
    if (!key) return;
    if (sourceToken && stockedSources[key] && stockedSources[key][sourceToken]) {
      return;
    }
    if (!aggregated.has(key)) {
      aggregated.set(key, {
        key,
        name: ing.name,
        amount: 0,
        unit: ing.unit || '份',
        sources: [],
        sourceTokens: [],
        checked: Boolean(shoppingChecks[key])
      });
    }
    const entry = aggregated.get(key);
    const addAmount = (Number(ing.amount) || 1) * (qtyMultiplier || 1);
    if (entry.unit === ing.unit) {
      entry.amount = Number((entry.amount + addAmount).toFixed(2));
    } else {
      entry.amount = Number((entry.amount + addAmount).toFixed(2));
    }
    if (sourceLabel && entry.sources.indexOf(sourceLabel) < 0) {
      entry.sources.push(sourceLabel);
    }
    if (sourceToken && entry.sourceTokens.indexOf(sourceToken) < 0) {
      entry.sourceTokens.push(sourceToken);
    }
  }

  pendingOrders.forEach((order) => {
    order.items.forEach((it, itemIdx) => {
      const rec = db.recipes.find((r) => r.id === it.recipeId);
      if (rec) {
        const sourceToken = `order:${order.id}:${itemIdx}:${it.recipeId}`;
        (rec.ingredients || []).forEach((ing) => {
          addIngredientNeed(ing, it.qty || 1, rec.name, sourceToken);
        });
      }
    });
  });

  // 同时纳入今日与明日尚未转订单的饮食计划菜谱
  const today = formatDate(new Date());
  const planDates = [today, addDays(today, 1)];
  planDates.forEach((d) => {
    const dayPlan = db.mealPlans[d];
    if (!dayPlan) return;
    Object.keys(dayPlan).forEach((mealType) => {
      const recCount = {};
      (dayPlan[mealType] || []).forEach((recId) => {
        const idx = recCount[recId] || 0;
        recCount[recId] = idx + 1;
        const rec = db.recipes.find((r) => r.id === recId);
        if (rec && (!kitchenId || rec.kitchenId === kitchenId)) {
          const sourceToken = `plan:${d}:${mealType}:${recId}:${idx}`;
          (rec.ingredients || []).forEach((ing) => {
            addIngredientNeed(ing, 1, `${rec.name}(计划)`, sourceToken);
          });
        }
      });
    });
  });

  const autoItems = Array.from(aggregated.values()).map((entry) => {
    const matched = findMatchingFridgeItem(fridgeItems, entry.name);
    return {
      key: entry.key,
      name: entry.name,
      amount: entry.amount,
      unit: entry.unit,
      amountText: `${entry.amount}${entry.unit}`,
      sources: entry.sources,
      sourceTokens: entry.sourceTokens,
      inFridge: Boolean(matched),
      fridgeStockText: matched ? `冰箱现有 ${matched.qty}${matched.unit}` : '冰箱暂无',
      checked: entry.checked
    };
  });

  // 缺货的排在前面
  autoItems.sort((a, b) => Number(a.inFridge) - Number(b.inFridge));

  return {
    autoItems,
    customItems: clone(db.customShoppingItems || [])
  };
}

function toggleShoppingItem(keyOrId, isCustom) {
  const db = getDB();
  if (isCustom) {
    const item = (db.customShoppingItems || []).find((c) => c.id === keyOrId);
    if (item) item.checked = !item.checked;
  } else {
    db.shoppingChecks[keyOrId] = !db.shoppingChecks[keyOrId];
  }
  saveDB(db);
}

function setAllShoppingItemsChecked(checked, kitchenId) {
  const list = getShoppingList(kitchenId);
  const db = getDB();
  const nextChecked = !!checked;
  list.autoItems.forEach((it) => {
    db.shoppingChecks[it.key] = nextChecked;
  });
  (db.customShoppingItems || []).forEach((it) => {
    it.checked = nextChecked;
  });
  saveDB(db);
}

function addCustomShoppingItem(name, amountText) {
  const db = getDB();
  const cleanName = String(name || '').trim();
  if (!cleanName) return null;
  const created = {
    id: uid('shop'),
    name: cleanName,
    amountText: String(amountText || '1份').trim(),
    checked: false
  };
  db.customShoppingItems.unshift(created);
  saveDB(db);
  return clone(created);
}

function removeCustomShoppingItem(id) {
  const db = getDB();
  db.customShoppingItems = (db.customShoppingItems || []).filter((c) => c.id !== id);
  saveDB(db);
}

function addMissingIngredientsToShopping(recipe) {
  const status = checkRecipeStockStatus(recipe);
  const missing = status.details.filter((d) => !d.inFridge);
  const db = getDB();
  let added = 0;
  missing.forEach((m) => {
    const exists = (db.customShoppingItems || []).some(
      (c) => normalizeName(c.name) === normalizeName(m.name)
    );
    if (!exists) {
      db.customShoppingItems.unshift({
        id: uid('shop'),
        name: m.name,
        amountText: `${m.amount}${m.unit}`,
        checked: false
      });
      added += 1;
    }
  });
  saveDB(db);
  return added;
}

function stockPurchasedItemsToFridge(kitchenId) {
  const list = getShoppingList(kitchenId);
  const db = getDB();
  const today = formatDate(new Date());
  let stockedCount = 0;

  function upsertIntoFridge(name, amount, unit) {
    const matched = db.fridgeItems.find((f) => normalizeName(f.name) === normalizeName(name));
    if (matched) {
      matched.qty = Number((Number(matched.qty) + Number(amount || 1)).toFixed(2));
      matched.expireDate = addDays(today, 7);
    } else {
      db.fridgeItems.push({
        id: uid('fr'),
        name,
        zone: 'cold',
        qty: Number(amount || 1),
        unit: unit || '份',
        expireDate: addDays(today, 7),
        note: '买菜清单一键入库'
      });
    }
    stockedCount += 1;
  }

  if (!db.shoppingChecks || typeof db.shoppingChecks !== 'object') {
    db.shoppingChecks = {};
  }
  if (!db.stockedShoppingSources || typeof db.stockedShoppingSources !== 'object') {
    db.stockedShoppingSources = {};
  }

  list.autoItems.forEach((it) => {
    if (it.checked) {
      upsertIntoFridge(it.name, it.amount, it.unit);
      delete db.shoppingChecks[it.key];
      if (!db.stockedShoppingSources[it.key]) {
        db.stockedShoppingSources[it.key] = {};
      }
      (it.sourceTokens || []).forEach((token) => {
        db.stockedShoppingSources[it.key][token] = true;
      });
    }
  });

  // 清理已非待做订单或已过期的饮食计划来源记录，避免冗余累积
  const pendingOrderIds = new Set(
    (db.orders || []).filter((o) => o.status === 'pending').map((o) => o.id)
  );
  Object.keys(db.stockedShoppingSources).forEach((key) => {
    const map = db.stockedShoppingSources[key] || {};
    Object.keys(map).forEach((token) => {
      if (token.indexOf('order:') === 0) {
        const orderId = token.split(':')[1];
        if (!pendingOrderIds.has(orderId)) {
          delete map[token];
        }
      } else if (token.indexOf('plan:') === 0) {
        const dateStr = token.split(':')[1];
        if (dateStr && dateStr < today) {
          delete map[token];
        }
      }
    });
    if (Object.keys(map).length === 0) {
      delete db.stockedShoppingSources[key];
    }
  });

  const remainingCustom = [];
  (db.customShoppingItems || []).forEach((it) => {
    if (it.checked) {
      const m = String(it.amountText || '').match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
      const amt = m ? Number(m[1]) : 1;
      const unit = m && m[2] ? m[2] : '份';
      upsertIntoFridge(it.name, amt, unit);
    } else {
      remainingCustom.push(it);
    }
  });
  db.customShoppingItems = remainingCustom;

  saveDB(db);
  return stockedCount;
}

// ---------- 三餐饮食计划 ----------
function getMealPlan(dateStr) {
  const db = getDB();
  const plan = db.mealPlans[dateStr] || { breakfast: [], lunch: [], tea: [], dinner: [] };
  const result = {};
  MEAL_TYPES.forEach((m) => {
    const ids = plan[m.id] || [];
    result[m.id] = ids
      .map((id) => db.recipes.find((r) => r.id === id))
      .filter(Boolean)
      .map((r) => clone(r));
  });
  return result;
}

function getMealPlansMap() {
  return clone(getDB().mealPlans || {});
}

function addDishToMealPlan(dateStr, mealType, recipeId) {
  const db = getDB();
  if (!db.mealPlans[dateStr]) {
    db.mealPlans[dateStr] = { breakfast: [], lunch: [], tea: [], dinner: [] };
  }
  if (!db.mealPlans[dateStr][mealType]) {
    db.mealPlans[dateStr][mealType] = [];
  }
  db.mealPlans[dateStr][mealType].push(recipeId);
  saveDB(db);
  return getMealPlan(dateStr);
}

function removeDishFromMealPlan(dateStr, mealType, index) {
  const db = getDB();
  if (db.mealPlans[dateStr] && db.mealPlans[dateStr][mealType]) {
    db.mealPlans[dateStr][mealType].splice(index, 1);
    saveDB(db);
  }
  return getMealPlan(dateStr);
}

function convertMealPlanToOrder(dateStr, kitchenId, mealType) {
  const db = getDB();
  const plan = db.mealPlans[dateStr];
  if (!plan) return null;
  const targetMeals = mealType ? [mealType] : ['breakfast', 'lunch', 'tea', 'dinner'];
  const items = [];
  targetMeals.forEach((mt) => {
    (plan[mt] || []).forEach((recId) => {
      const rec = db.recipes.find((r) => r.id === recId);
      if (rec) {
        const existing = items.find((i) => i.recipeId === rec.id);
        if (existing) {
          existing.qty += 1;
        } else {
          items.push({
            recipeId: rec.id,
            name: rec.name,
            emoji: rec.emoji || '🍲',
            spec: (rec.specs && rec.specs[0]) || '默认口味',
            qty: 1,
            cookTime: rec.cookTime || 15
          });
        }
      }
    });
  });

  if (items.length === 0) return null;
  return submitOrder({
    kitchenId: kitchenId || db.currentKitchenId,
    mealDate: dateStr,
    mealType: mealType || 'dinner',
    ordererName: db.profile.nickName || '饮食计划',
    remark: `${dateStr} 饮食计划一键生成`,
    items,
    clearCart: false
  });
}

// ---------- 做菜计时器 ----------
function computeTimerRemaining(timer) {
  if (!timer) return 0;
  if (timer.status === 'running' && timer.endTime) {
    const sec = Math.ceil((timer.endTime - Date.now()) / 1000);
    return Math.max(0, sec);
  }
  return Math.max(0, Number(timer.remainingSec) || 0);
}

function getTimers() {
  const db = getDB();
  return (db.timers || []).map((t) =>
    Object.assign({}, clone(t), {
      displayRemainingSec: computeTimerRemaining(t)
    })
  );
}

function addTimer(name, durationSec) {
  const db = getDB();
  const sec = Math.max(5, Number(durationSec) || 60);
  const created = {
    id: uid('tm'),
    name: String(name || '做菜计时').trim(),
    durationSec: sec,
    remainingSec: sec,
    status: 'idle',
    endTime: null
  };
  db.timers.unshift(created);
  saveDB(db);
  return getTimers();
}

function toggleTimer(id) {
  const db = getDB();
  const timer = db.timers.find((t) => t.id === id);
  if (!timer) return getTimers();
  if (timer.status === 'running') {
    timer.remainingSec = computeTimerRemaining(timer);
    timer.status = 'paused';
    timer.endTime = null;
  } else {
    const rem = timer.remainingSec > 0 ? timer.remainingSec : timer.durationSec;
    timer.remainingSec = rem;
    timer.status = 'running';
    timer.endTime = Date.now() + rem * 1000;
  }
  saveDB(db);
  return getTimers();
}

function resetTimer(id) {
  const db = getDB();
  const timer = db.timers.find((t) => t.id === id);
  if (timer) {
    timer.remainingSec = timer.durationSec;
    timer.status = 'idle';
    timer.endTime = null;
    saveDB(db);
  }
  return getTimers();
}

function markTimerFinished(id) {
  const db = getDB();
  const timer = db.timers.find((t) => t.id === id);
  if (timer && timer.status === 'running') {
    timer.remainingSec = 0;
    timer.status = 'finished';
    timer.endTime = null;
    saveDB(db);
  }
}

function ackTimerAlert(id) {
  const db = getDB();
  const timer = db.timers.find((t) => t.id === id);
  if (timer && timer.status === 'finished') {
    timer.status = 'idle';
    timer.remainingSec = timer.durationSec;
    timer.endTime = null;
    saveDB(db);
  }
}

function deleteTimer(id) {
  const db = getDB();
  db.timers = db.timers.filter((t) => t.id !== id);
  saveDB(db);
  return getTimers();
}

// ---------- 统计 & 本地导入导出 ----------
function getKitchenStats() {
  const db = getDB();
  const completedOrders = db.orders.filter((o) => o.status === 'completed');
  const pendingOrders = db.orders.filter((o) => o.status === 'pending');
  const totalCookCount = db.recipes.reduce((sum, r) => sum + (r.cookCount || 0), 0);
  const topRecipes = clone(db.recipes)
    .sort((a, b) => (b.cookCount || 0) - (a.cookCount || 0))
    .slice(0, 3);
  const fridgeItems = getFridgeItems();
  const soonOrExpiredCount = fridgeItems.filter(
    (f) => f.expiry.status === 'soon' || f.expiry.status === 'expired'
  ).length;

  return {
    kitchenCount: db.kitchens.length,
    recipeCount: db.recipes.length,
    totalCookCount,
    completedOrderCount: completedOrders.length,
    pendingOrderCount: pendingOrders.length,
    fridgeCount: fridgeItems.length,
    soonOrExpiredCount,
    topRecipes
  };
}

function exportData(scope, kitchenId) {
  const db = getDB();
  if (scope === 'kitchen') {
    const kId = kitchenId || db.currentKitchenId;
    const kitchen = db.kitchens.find((k) => k.id === kId);
    if (!kitchen) return '';
    return JSON.stringify(
      {
        type: 'chushen_kitchen_share',
        version: DB_VERSION,
        exportedAt: formatDate(new Date()),
        kitchen: clone(kitchen),
        categories: db.categories.filter((c) => c.kitchenId === kId),
        recipes: db.recipes.filter((r) => r.kitchenId === kId)
      },
      null,
      2
    );
  }
  return JSON.stringify(
    {
      type: 'chushen_full_backup',
      version: DB_VERSION,
      exportedAt: formatDate(new Date()),
      data: clone(db)
    },
    null,
    2
  );
}

function importData(rawJson) {
  let parsed;
  try {
    parsed = typeof rawJson === 'string' ? JSON.parse(rawJson.trim()) : rawJson;
  } catch (e) {
    return { ok: false, message: '格式错误：请粘贴完整的 JSON 口令内容' };
  }
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, message: '无效的数据结构' };
  }

  if (parsed.type === 'chushen_full_backup' && parsed.data && Array.isArray(parsed.data.kitchens)) {
    saveDB(parsed.data);
    return { ok: true, message: '已恢复全量本地数据！' };
  }

  if (parsed.type === 'chushen_kitchen_share' && parsed.kitchen && Array.isArray(parsed.recipes)) {
    const db = getDB();
    const newKitchenId = uid('kitchen');
    const newKitchen = Object.assign({}, parsed.kitchen, {
      id: newKitchenId,
      name: `${parsed.kitchen.name}(导入)`
    });
    const catMap = {};
    const newCats = (parsed.categories || []).map((c, i) => {
      const nextCatId = uid('cat');
      catMap[c.id] = nextCatId;
      return {
        id: nextCatId,
        kitchenId: newKitchenId,
        name: c.name,
        sort: c.sort || i + 1
      };
    });
    if (newCats.length === 0) {
      newCats.push({ id: uid('cat'), kitchenId: newKitchenId, name: '导入菜品', sort: 1 });
    }
    const newRecipes = parsed.recipes.map((r) =>
      Object.assign({}, r, {
        id: uid('rec'),
        kitchenId: newKitchenId,
        categoryId: catMap[r.categoryId] || newCats[0].id
      })
    );

    db.kitchens.push(newKitchen);
    db.categories.push(...newCats);
    db.recipes.push(...newRecipes);
    db.carts[newKitchenId] = [];
    db.currentKitchenId = newKitchenId;
    saveDB(db);
    return {
      ok: true,
      message: `成功导入厨房「${newKitchen.name}」（共 ${newRecipes.length} 道菜谱）`
    };
  }

  return { ok: false, message: '未识别的备份格式，请确认使用本小程序导出的口令' };
}

module.exports = {
  THEME_PRESETS,
  MEAL_TYPES,
  STORAGE_ZONES,
  formatDate,
  addDays,
  initStore,
  resetStore,
  getProfile,
  saveProfile,
  getThemeById,
  getKitchens,
  getCurrentKitchen,
  switchKitchen,
  saveKitchen,
  deleteKitchen,
  getCategories,
  saveCategory,
  moveCategory,
  deleteCategory,
  getAllRecipes,
  getRecipes,
  getRecipeById,
  saveRecipe,
  deleteRecipe,
  parseRecipeText,
  computeExpiryStatus,
  getFridgeItems,
  saveFridgeItem,
  updateFridgeItemQty,
  deleteFridgeItem,
  checkRecipeStockStatus,
  getCart,
  addToCart,
  updateCartQty,
  clearCart,
  submitOrder,
  getOrders,
  completeOrder,
  deleteOrder,
  encodeOrderSharePayload,
  parseOrderSharePayload,
  importSharedOrder,
  getShoppingList,
  toggleShoppingItem,
  setAllShoppingItemsChecked,
  addCustomShoppingItem,
  removeCustomShoppingItem,
  addMissingIngredientsToShopping,
  stockPurchasedItemsToFridge,
  getMealPlan,
  getMealPlansMap,
  addDishToMealPlan,
  removeDishFromMealPlan,
  convertMealPlanToOrder,
  computeTimerRemaining,
  getTimers,
  addTimer,
  toggleTimer,
  resetTimer,
  markTimerFinished,
  ackTimerAlert,
  deleteTimer,
  getKitchenStats,
  exportData,
  importData
};
