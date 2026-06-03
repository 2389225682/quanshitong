/**
 * 飞飞的知识库 - 模块注册表
 * 新增模块：在 modules 数组末尾追加一条记录即可
 * 删除模块：删除对应记录，或设置 status: 'hidden'
 * 
 * 每个模块独立目录，改了只推那个目录 → 增量更新
 */

const KB_MODULES = [
    /* ========== 历史探索 ========== */
    {
        id: 'quanshitong',
        name: '全史通',
        subtitle: '从零开始，读懂中国千年',
        description: '13个朝代 × 8大维度，用大白话讲述历史制度的来龙去脉，第一人称穿越体验古人的生活。',
        icon: '🏛️',
        cover: 'assets/images/covers/quanshitong.svg',
        path: 'quanshitong.html',
        color: '#c9a227',
        colorRgb: '201,162,39',
        category: 'history',
        stats: [
            { value: '2200+', label: '年跨度' },
            { value: '168', label: '主题页' }
        ],
        tags: ['13朝代', '穿越体验', '制度解读'],
        status: 'active'
    },

    /* ========== 深度阅读 ========== */
    {
        id: 'guns',
        name: '枪炮、病菌与钢铁',
        subtitle: '环境差异决定人类命运',
        description: '为什么是欧亚大陆的人征服了其他大陆？戴蒙德用环境差异解释了人类社会的命运分化。1997年普利策奖。',
        icon: '🌍',
        cover: 'assets/images/covers/guns.svg',
        path: 'guns.html',
        color: '#3498db',
        colorRgb: '52,152,219',
        category: 'reading',
        stats: [
            { value: '33万', label: '字原文' },
            { value: '3版', label: '学习产物' }
        ],
        tags: ['普利策奖', '环境决定论', '整合精读'],
        status: 'active'
    },
    {
        id: 'xixi',
        name: '全嘻嘻频道',
        subtitle: '真实来信，拆解当代人的情感与选择',
        description: 'B站每月回信栏目。从相亲市场到婚姻博弈，从嫉妒心理到自律困境，用真实来信拆解当代人的情感与选择。',
        icon: '💬',
        cover: 'assets/images/covers/xixi.svg',
        path: 'xixi.html',
        color: '#9b59b6',
        colorRgb: '155,89,182',
        category: 'reading',
        stats: [
            { value: '12篇', label: '文稿' },
            { value: '15月', label: '跨度' }
        ],
        tags: ['情感观察', '婚姻博弈', '读后感'],
        status: 'active'
    },

    /* ========== 财经观察 ========== */
    {
        id: 'finance',
        name: '财经观察',
        subtitle: '每周/每月，追踪市场脉搏',
        description: 'A股核心指数追踪、半导体国产替代主题分析、全球宏观动态。每日简报+每周总结+每月趋势。',
        icon: '📈',
        cover: 'assets/images/covers/finance.svg',
        path: 'finance/index.html',
        color: '#e74c3c',
        colorRgb: '231,76,60',
        category: 'finance',
        stats: [
            { value: '每日', label: '简报' },
            { value: '5大', label: '核心指数' }
        ],
        tags: ['A股', '半导体', '宏观'],
        status: 'active'
    },

    /* ========== 个人工具 ========== */
    {
        id: 'notes',
        name: '我的笔记',
        subtitle: '记录想法，留住灵感',
        description: '在知识库任意页面点击右下角 📝 按钮即可记录想法。按分类整理，随时回顾。',
        icon: '📝',
        cover: '',
        path: 'notes/index.html',
        color: '#f59e0b',
        colorRgb: '245,158,11',
        category: 'tools',
        stats: [
            { value: '5类', label: '分类' },
            { value: '本地', label: '存储' }
        ],
        tags: ['金句', '想法', '灵感'],
        status: 'active'
    },

    /* ========== 未来板块占位 ========== */
    {
        id: 'tech-insights',
        name: '科技洞察',
        subtitle: '追踪前沿技术趋势',
        description: 'AI、芯片、新能源……站在技术变革的前沿，理解趋势背后的逻辑。',
        icon: '🔬',
        cover: '',
        path: '#',
        color: '#1abc9c',
        colorRgb: '26,188,156',
        category: 'future',
        stats: [],
        tags: ['AI', '芯片', '新能源'],
        status: 'coming'
    },
    {
        id: 'life-cairo',
        name: '开罗笔记',
        subtitle: '驻埃工程师的异域见闻',
        description: '从尼罗河畔到撒哈拉边缘，记录在埃及生活与工作的真实体验。',
        icon: '🏜️',
        cover: '',
        path: '#',
        color: '#f39c12',
        colorRgb: '243,156,18',
        category: 'future',
        stats: [],
        tags: ['埃及', '生活', '见闻'],
        status: 'coming'
    }
];

/**
 * 分类定义
 * 新增分类：在此追加，然后在 modules 中引用分类 id
 */
const KB_CATEGORIES = [
    { id: 'history',  name: '历史探索', icon: '🏛️' },
    { id: 'reading',  name: '深度阅读', icon: '📖' },
    { id: 'finance',  name: '财经观察', icon: '📈' },
    { id: 'tools',    name: '个人工具', icon: '🛠️' },
    { id: 'future',   name: '即将上线', icon: '🔮' }
];

/**
 * 工具函数
 */
function getActiveModules() {
    return KB_MODULES.filter(m => m.status === 'active');
}

function getComingModules() {
    return KB_MODULES.filter(m => m.status === 'coming');
}

function getModulesByCategory(catId) {
    return KB_MODULES.filter(m => m.category === catId);
}

function searchModules(query) {
    const q = query.toLowerCase();
    return KB_MODULES.filter(m => 
        m.status === 'active' && (
            m.name.toLowerCase().includes(q) ||
            m.subtitle.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.tags.some(t => t.toLowerCase().includes(q))
        )
    );
}
