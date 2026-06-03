/**
 * data.js - 博客内容数据
 * 包含所有文章、站长个人信息、分类体系
 */

const BlogData = {
  // 站长信息
  author: {
    name: '林墨',
    nickname: '墨客',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80',
    title: '全栈开发者 / 独立创作者',
    bio: '热爱技术与文字，专注于 Web 开发与用户体验设计。写过 Bug，也写过诗。坚信代码是表达思想的一种方式。',
    email: 'linmo@example.com',
    social: {
      github: 'https://github.com',
      twitter: 'https://twitter.com',
      zhihu: 'https://zhihu.com'
    }
  },

  // 教育背景
  education: [
    { year: '2018 - 2022', school: 'XX 大学', major: '计算机科学与技术', degree: '本科', desc: 'GPA 3.8/4.0，获国家奖学金，ACM 校队成员' },
    { year: '2022 - 2025', school: 'XX 大学', major: '软件工程', degree: '硕士', desc: '研究方向：前端性能优化与 Web 标准' }
  ],

  // 工作经验
  experience: [
    { year: '2022 - 2023', company: '某科技公司', role: '前端开发工程师', desc: '负责核心产品的前端架构设计与开发，使用 React + TypeScript 技术栈，主导了组件库建设。' },
    { year: '2023 - 2024', company: '某互联网大厂', role: '高级前端工程师', desc: '参与百万级用户量的产品开发，负责性能优化和工程化建设，首屏加载时间降低 40%。' },
    { year: '2024 - 至今', company: '自由职业', role: '独立开发者', desc: '独立承接 Web 项目开发，同时运营技术博客，累计发布 50+ 篇文章。' }
  ],

  // 技能清单
  skills: [
    { name: 'JavaScript/TypeScript', level: 95 },
    { name: 'React/Vue', level: 90 },
    { name: 'Node.js', level: 85 },
    { name: 'CSS/SCSS/Tailwind', level: 88 },
    { name: 'Webpack/Vite', level: 82 },
    { name: 'Docker/Linux', level: 75 },
    { name: 'Python', level: 70 },
    { name: '数据库 (MySQL/Mongo)', level: 72 },
    { name: 'GraphQL', level: 68 },
    { name: 'WebGL/Three.js', level: 60 },
    { name: 'Rust', level: 45 },
    { name: 'Flutter', level: 50 }
  ],

  // 分类体系
  categories: [
    { id: 'tech', name: '技术文章', icon: '💻' },
    { id: 'life', name: '生活随笔', icon: '📝' },
    { id: 'project', name: '项目案例', icon: '🚀' }
  ],

  // 文章列表（≥12条）
  posts: [
    {
      id: 1,
      title: '从零搭建现代前端工程化体系',
      summary: '深入浅出地讲解如何从零开始搭建一套完整的前端工程化方案，涵盖构建工具、代码规范、自动化测试等环节。',
      category: 'tech',
      cover: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&q=80',
      date: '2025-12-15',
      readTime: 12,
      content: `
        <h2>为什么要关注前端工程化</h2>
        <p>随着前端项目复杂度不断增加，工程化已成为现代前端开发的必修课。一个良好的工程化体系，能够显著提升开发效率、代码质量和项目可维护性。</p>
        <p>本文将从以下几个方面展开：</p>
        <h3>1. 构建工具选型</h3>
        <p>Vite 作为新一代构建工具，凭借其极快的冷启动速度和热更新能力，已成为 Vue/React 项目的首选。相比 Webpack，Vite 在开发体验上有了质的飞跃。</p>
        <p>但在生产构建方面，Webpack 仍然有其不可替代的优势，尤其是在复杂场景下的配置灵活性。因此，许多大型项目会选择 Vite（开发）+ Webpack（生产）的组合方案。</p>
        <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" alt="代码截图" loading="lazy">
        <h3>2. 代码规范与质量</h3>
        <p>ESLint + Prettier 的组合已经成为事实标准。更重要的是，需要在 CI/CD 流程中集成代码检查，确保合并到主分支的代码都是规范的。</p>
        <p>Commit 规范也同样重要，Conventional Commits 规范配合自动化 changelog 生成，让版本管理变得清晰透明。</p>
        <blockquote>代码规范不是为了限制你，而是为了让团队中的每个人都能轻松理解彼此的代码。</blockquote>
      `,
      images: ['https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80'],
      initialLikes: 42
    },
    {
      id: 2,
      title: '写给自己的年度总结：2025 年的得与失',
      summary: '一年一度的个人总结，回顾这一年在技术、生活和心态上的变化与成长。',
      category: 'life',
      cover: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80',
      date: '2025-12-31',
      readTime: 8,
      content: `
        <h2>写在前面</h2>
        <p>每年这个时候，都会习惯性地坐下来，给自己写一份总结。不是为了给别人看，而是为了让自己记住——这一年，我没有白过。</p>
        <h3>技术上的成长</h3>
        <p>今年最大的收获是开始深入 Rust 语言。从最初的语法学习到实际编写一个小型 CLI 工具，过程中的每一步都充满了挑战和乐趣。Rust 的所有权系统让我对内存管理有了全新的理解。</p>
        <p>另外，在 Web 性能优化方面也有了更深的认识。通过实际项目中 Core Web Vitals 的优化，我积累了不少实战经验。</p>
        <h3>生活的变化</h3>
        <p>今年搬了新家，养了一只猫。生活节奏慢了下来，有了更多的时间阅读和思考。看了 24 本书，虽然不多，但每一本都认真做了笔记。</p>
        <p>也开始尝试拍摄和剪辑视频，虽然还很粗糙，但迈出了第一步就是好的。</p>
        <blockquote>生活不是赶路，而是感受路。</blockquote>
      `,
      images: ['https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80', 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80'],
      initialLikes: 38
    },
    {
      id: 3,
      title: '基于 WebSocket 的实时协作白板实现',
      summary: '分享如何用原生 WebSocket 和 Canvas API 实现一个多人实时协作绘图白板，包含完整的技术方案。',
      category: 'project',
      cover: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
      date: '2025-11-20',
      readTime: 15,
      content: `
        <h2>项目背景</h2>
        <p>去年团队需要一个在线白板工具来进行远程技术讨论，市面上现有的工具要么太贵，要么功能冗余。于是决定自己动手实现一个轻量级的实时协作白板。</p>
        <h3>技术选型</h3>
        <ul>
          <li>前端：原生 Canvas API + React</li>
          <li>通信：WebSocket（ws 库）</li>
          <li>数据同步：CRDT 算法（避免冲突）</li>
          <li>部署：Docker + Nginx</li>
        </ul>
        <p>最核心的挑战是多人同时绘制时的冲突处理。最终选择了 CRDT（无冲突复制数据类型）算法，确保所有客户端最终状态一致。</p>
        <img src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80" alt="白板应用截图" loading="lazy">
        <h3>性能优化</h3>
        <p>Canvas 绘图在高频操作下容易出现性能问题。通过 requestAnimationFrame 批量渲染、脏矩形区域更新等策略，将帧率稳定在 60fps。</p>
      `,
      images: ['https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1200&q=80', 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80'],
      initialLikes: 56
    },
    {
      id: 4,
      title: 'TypeScript 中的类型体操：从入门到进阶',
      summary: '通过实际案例学习 TypeScript 的高级类型技巧，包括条件类型、映射类型、模板字面量类型等。',
      category: 'tech',
      cover: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600&q=80',
      date: '2025-11-08',
      readTime: 10,
      content: `
        <h2>为什么需要类型体操</h2>
        <p>TypeScript 的类型系统是图灵完备的，这意味着你可以用类型编程实现非常复杂的逻辑。虽然日常开发中用不到太多高级类型技巧，但在编写工具库或框架时，这些技巧能让你的 API 更加类型安全。</p>
        <h3>实用案例：深度 Partial</h3>
        <pre><code>type DeepPartial&lt;T&gt; = {
  [P in keyof T]?: T[P] extends object ? DeepPartial&lt;T[P]&gt; : T[P]
}</code></pre>
        <p>这个工具类型可以递归地将所有属性变为可选，在处理深层嵌套的配置对象时非常有用。</p>
        <h3>实用案例：条件类型过滤</h3>
        <p>通过 extends 关键字，我们可以实现根据条件筛选类型的逻辑。比如从一个联合类型中提取出所有函数类型的成员。</p>
      `,
      images: ['https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=1200&q=80'],
      initialLikes: 35
    },
    {
      id: 5,
      title: '秋天的第一杯咖啡',
      summary: '在一个慵懒的秋日下午，坐在街角的咖啡店里，看着窗外落叶飘零，写下一些零散的心情。',
      category: 'life',
      cover: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
      date: '2025-10-15',
      readTime: 5,
      content: `
        <p>已经很久没有这样安静地坐下来了。</p>
        <p>窗外梧桐叶正黄，一片片飘落在青石板上。咖啡店里的爵士乐慵懒地流淌着，空气中弥漫着焦糖和奶泡的香气。</p>
        <p>我点了一杯燕麦拿铁，翻开随身带的书——博尔赫斯的《小径分岔的花园》。已经是第三遍了读，但每次翻开都能发现新的东西。</p>
        <img src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80" alt="咖啡店窗外" loading="lazy">
        <p>店员是一个扎着丸子头的女孩，笑容很温暖。她在我杯子上画了一个笑脸。</p>
        <p>有时候，幸福真的可以很简单。一杯好喝的咖啡，一本好书，一个安静的下午。</p>
      `,
      images: ['https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80'],
      initialLikes: 27
    },
    {
      id: 6,
      title: '微服务架构下的前端集成策略',
      summary: '探讨在微服务后端架构下，前端如何优雅地集成多个服务，实现统一的用户体验。',
      category: 'tech',
      cover: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&q=80',
      date: '2025-09-22',
      readTime: 14,
      content: `
        <h2>微前端 vs 单体前端</h2>
        <p>当后端采用微服务架构时，前端往往会面临一个选择：是继续维持单体应用，还是也采用微前端架构？</p>
        <p>本文分析了两种方案的优劣，并给出了实际项目中的选型建议。</p>
        <h3>方案一：BFF 聚合层</h3>
        <p>在后端和前端之间增加一个 BFF（Backend For Frontend）层，由 BFF 负责聚合多个微服务的数据，前端仍然是一个单体应用。</p>
        <p>优点：开发简单，维护成本低。</p>
        <p>缺点：BFF 容易成为瓶颈。</p>
        <h3>方案二：Module Federation</h3>
        <p>使用 Webpack 5 的 Module Federation 插件，实现运行时模块共享。每个微服务团队独立开发和部署自己的前端模块。</p>
      `,
      images: ['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80'],
      initialLikes: 31
    },
    {
      id: 7,
      title: '家庭 NAS 搭建全记录',
      summary: '从硬件选型到软件配置，完整记录搭建家庭 NAS 的全过程，附避坑指南。',
      category: 'project',
      cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
      date: '2025-08-10',
      readTime: 18,
      content: `
        <h2>为什么需要 NAS</h2>
        <p>家里设备太多，文件散落各处。加上云盘隐私堪忧，决定自己搭建 NAS。</p>
        <h3>硬件配置</h3>
        <ul>
          <li>主机：HP Gen10 Plus 微型服务器</li>
          <li>CPU：Xeon E-2224</li>
          <li>内存：16GB ECC</li>
          <li>硬盘：4TB × 2（RAID 1）+ 512GB SSD（缓存）</li>
        </ul>
        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80" alt="NAS 硬件照片" loading="lazy">
        <h3>软件方案</h3>
        <p>系统选择了 TrueNAS Scale，基于 Debian 的自托管 NAS 系统，支持 ZFS 文件系统，数据安全性极高。</p>
      `,
      images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80'],
      initialLikes: 44
    },
    {
      id: 8,
      title: 'CSS 现代布局完全指南',
      summary: '从 Flexbox 到 Grid，从 Container Queries 到 Anchor Positioning，一文掌握现代 CSS 布局方案。',
      category: 'tech',
      cover: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=600&q=80',
      date: '2025-07-18',
      readTime: 11,
      content: `
        <h2>Flexbox 回顾</h2>
        <p>Flexbox 已经是现代 CSS 布局的基石。但你真的完全掌握它了吗？</p>
        <h3>CSS Grid 进阶</h3>
        <p>Grid 布局的强大之处在于二维布局能力。结合 minmax() 和 auto-fill，可以实现真正的响应式布局而无需媒体查询。</p>
        <h3>Container Queries</h3>
        <p>Container Queries 已经得到所有主流浏览器的支持。从此组件的样式可以根据自身容器大小而非视口来调整。</p>
      `,
      images: ['https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?w=1200&q=80'],
      initialLikes: 50
    },
    {
      id: 9,
      title: '在京都的七天',
      summary: '一个人在日本京都旅行七天的所见所闻所感，附旅行攻略和摄影作品。',
      category: 'life',
      cover: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80',
      date: '2025-06-05',
      readTime: 10,
      content: `
        <h2>Day 1：抵达</h2>
        <p>从关西机场坐 Haruka 特急列车到京都站，沿途的田园风光让人心旷神怡。</p>
        <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80" alt="京都街道" loading="lazy">
        <h2>Day 2：伏见稻荷大社</h2>
        <p>清晨六点到达伏见稻荷，千本朱红的鸟居在晨雾中若隐若现。</p>
      `,
      images: ['https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=80', 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80'],
      initialLikes: 63
    },
    {
      id: 10,
      title: '开源项目：轻量级 React 状态管理库',
      summary: '发布了一个仅 2KB 的 React 状态管理库，基于 Proxy 实现，API 简洁，性能优秀。',
      category: 'project',
      cover: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&q=80',
      date: '2025-05-12',
      readTime: 8,
      content: `
        <h2>为什么要再造一个轮子</h2>
        <p>React 的状态管理方案已经很多了。我想要的是一个极简的、类型安全的、无模板代码的状态管理方案。</p>
      `,
      images: ['https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=1200&q=80'],
      initialLikes: 78
    },
    {
      id: 11,
      title: '理解 JavaScript 的事件循环',
      summary: '从 Event Loop 的角度理解 JS 的异步执行机制，掌握微任务、宏任务的执行顺序。',
      category: 'tech',
      cover: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=600&q=80',
      date: '2025-04-20',
      readTime: 9,
      content: `
        <h2>单线程的 JavaScript</h2>
        <p>JavaScript 是单线程语言，但为什么还能处理异步操作？答案就是 Event Loop。</p>
        <h3>宏任务 vs 微任务</h3>
        <ul>
          <li>宏任务：setTimeout、setInterval、I/O、UI 渲染</li>
          <li>微任务：Promise.then、MutationObserver、queueMicrotask</li>
        </ul>
      `,
      images: ['https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=1200&q=80'],
      initialLikes: 45
    },
    {
      id: 12,
      title: '个人博客搭建记：从 Hexo 到自建',
      summary: '分享个人博客从 Hexo 静态站点迁移到自建动态博客的技术选型和踩坑记录。',
      category: 'project',
      cover: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600&q=80',
      date: '2025-03-15',
      readTime: 12,
      content: `
        <h2>为什么不再用 Hexo</h2>
        <p>Hexo 是一个非常优秀的静态博客框架，但慢慢发现它的局限性，于是决定自己写一个博客系统。</p>
      `,
      images: ['https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=1200&q=80'],
      initialLikes: 33
    },
    {
      id: 13,
      title: '关于写作这件事',
      summary: '写了三年技术博客后的一些感悟，关于为什么写、写什么、怎么写。',
      category: 'life',
      cover: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&q=80',
      date: '2025-02-28',
      readTime: 7,
      content: `
        <h2>开始写作的那天</h2>
        <p>三年前的今天，我在博客上发布了第一篇文章。写作已经成为我生活的一部分。</p>
        <blockquote>写作不是为了被记住，而是为了在思考中遇见更好的自己。</blockquote>
      `,
      images: ['https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&q=80'],
      initialLikes: 29
    },
    {
      id: 14,
      title: 'React Server Component 深度解析',
      summary: '从原理到实践，全面解析 React Server Component 的工作机制和最佳实践。',
      category: 'tech',
      cover: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
      date: '2025-01-10',
      readTime: 16,
      content: `
        <h2>RSC 是什么</h2>
        <p>React Server Component（RSC）是 React 团队推出的新的组件范式，允许组件在服务器端渲染。</p>
        <h3>核心原理</h3>
        <ol>
          <li>服务器接收到请求，渲染 Server Component</li>
          <li>序列化渲染结果为 RSC Payload</li>
          <li>客户端解析 Payload 并嵌入 Component Tree</li>
          <li>Client Component 正常 hydration</li>
        </ol>
      `,
      images: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=80'],
      initialLikes: 52
    }
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlogData;
}