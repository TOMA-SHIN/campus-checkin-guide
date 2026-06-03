/**
 * app.js - 博客主应用逻辑
 * 路由系统、页面渲染、事件绑定与初始化
 * 依赖：BlogData (data.js), Storage (storage.js), Web Components (components.js)
 */

// ============================
// 路由系统
// ============================

/**
 * 解析当前 URL hash 返回路由对象
 * @returns {{ page: string, param: * }}
 */
function getRoute() {
  const hash = location.hash.replace(/^#/, '') || 'home';
  if (hash === 'home') return { page: 'home', param: null };
  if (hash === 'resume') return { page: 'resume', param: null };
  if (hash === 'guestbook') return { page: 'guestbook', param: null };
  const postMatch = hash.match(/^post\/(\d+)$/);
  if (postMatch) return { page: 'post', param: parseInt(postMatch[1], 10) };
  return { page: 'home', param: null };
}

/**
 * 导航到指定 hash 路由
 * @param {string} hash - 路由 hash（如 'home', 'post/1'）
 */
function navigate(hash) {
  if (location.hash === '#' + hash) {
    // 同一路由，强制触发渲染
    window.dispatchEvent(new CustomEvent('blog-navigate'));
  }
  location.hash = hash;
}

// ============================
// 博客应用对象
// ============================

const Blog = {
  /** @type {HTMLElement} 主内容容器 */
  container: null,
  /** @type {HTMLElement} 导航栏 */
  nav: null,
  /** @type {string|null} 当前选中的分类 */
  activeCategory: null,
  /** @type {string} 搜索关键字 */
  searchQuery: '',
  /** @type {IntersectionObserver} 滚动淡入观察器 */
  revealObserver: null,
  /** @type {HTMLElement|null} Lightbox 元素引用 */
  lightbox: null,

  // ============================
  // 初始化
  // ============================

  /**
   * 应用入口
   */
  init() {
    this.setupContainer();
    this.setupNavigation();
    this.setupGlobalComponents();
    this.bindGlobalEvents();
    this.setupRevealObserver();
    this.setupScrollListeners();

    // 监听 hash 变化
    window.addEventListener('hashchange', () => this.handleRoute());
    // 自定义同一路由刷新
    window.addEventListener('blog-navigate', () => this.handleRoute());

    // 加载当前路由
    this.handleRoute();
  },

  /**
   * 创建或获取主内容容器
   */
  setupContainer() {
    this.container = document.getElementById('blog-content');
    if (!this.container) {
      this.container = document.createElement('main');
      this.container.id = 'blog-content';
      document.body.appendChild(this.container);
    }
  },

  /**
   * 创建顶部导航栏
   */
  setupNavigation() {
    this.nav = document.querySelector('.blog-nav');
    if (this.nav) {
      // 绑定已有导航栏的汉堡菜单
      const toggle = this.nav.querySelector('#blogHamburger, #blogNavToggle');
      const links = this.nav.querySelector('#blogNavLinks');
      if (toggle && links) {
        toggle.addEventListener('click', () => {
          toggle.classList.toggle('active');
          links.classList.toggle('open');
        });
        links.addEventListener('click', () => {
          toggle.classList.remove('active');
          links.classList.remove('open');
        });
      }
      return;
    }

    this.nav = document.createElement('nav');
    this.nav.className = 'blog-nav';
    this.nav.innerHTML = `
      <a class="blog-nav-brand" href="#home">
        <span class="brand-icon">✦</span>
        <span>墨客</span>
      </a>
      <div class="blog-hamburger" id="blogNavToggle">
        <span></span><span></span><span></span>
      </div>
      <div class="blog-nav-links" id="blogNavLinks">
        <a href="#home" data-route="home">首页</a>
        <a href="#resume" data-route="resume">关于站长</a>
        <a href="#guestbook" data-route="guestbook">留言板</a>
      </div>
    `;
    document.body.prepend(this.nav);

    // 汉堡菜单切换
    const toggle = this.nav.querySelector('#blogNavToggle');
    const links = this.nav.querySelector('#blogNavLinks');
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('open');
    });
    // 点击导航链接后关闭菜单
    links.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
    });
  },

  /**
   * 添加全局组件（返回顶部、进度条、Lightbox、Toast）
   */
  setupGlobalComponents() {
    const existingBackTop = document.querySelector('blog-back-to-top');
    if (!existingBackTop) {
      const backTop = document.createElement('blog-back-to-top');
      document.body.appendChild(backTop);
    }
    const existingProgress = document.querySelector('blog-reading-progress');
    if (!existingProgress) {
      const progress = document.createElement('blog-reading-progress');
      document.body.appendChild(progress);
    }
    this.lightbox = document.querySelector('blog-lightbox');
    if (!this.lightbox) {
      this.lightbox = document.createElement('blog-lightbox');
      this.lightbox.id = 'blogLightbox';
      document.body.appendChild(this.lightbox);
    }
    const existingToast = document.querySelector('blog-toast');
    if (!existingToast) {
      const toast = document.createElement('blog-toast');
      toast.id = 'blogToast';
      document.body.appendChild(toast);
    }
  },

  // ============================
  // 路由处理
  // ============================

  /**
   * 处理当前路由，渲染对应页面
   */
  handleRoute() {
    const route = getRoute();
    if (!this.container) return;

    this.container.innerHTML = '';
    this.container.className = 'blog-fade-in';
    this.searchQuery = '';
    this.activeCategory = null;

    // 更新导航高亮
    this.updateNavActive(route.page);

    switch (route.page) {
      case 'home':
        this.renderHome();
        break;
      case 'post':
        this.renderPost(route.param);
        break;
      case 'resume':
        this.renderResume();
        break;
      case 'guestbook':
        this.renderGuestbook();
        break;
      default:
        this.renderHome();
    }

    // 滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 重新观察新内容中的 reveal 元素
    this.observeReveal();
  },

  /**
   * 更新导航栏激活状态
   * @param {string} page
   */
  updateNavActive(page) {
    const links = this.nav?.querySelectorAll('.blog-nav-links a');
    if (!links) return;
    links.forEach(link => {
      const route = link.dataset.route;
      link.classList.toggle('active', route === page);
    });
  },

  // ============================
  // 首页渲染
  // ============================

  /**
   * 渲染首页（文章卡片列表）
   */
  renderHome() {
    const posts = BlogData.posts || [];
    const categories = BlogData.categories || [];

    // ---- Hero 区域 ----
    const hero = document.createElement('section');
    hero.className = 'blog-hero';
    hero.innerHTML = `
      <div class="blog-hero-bg"></div>
      <div class="blog-hero-content">
        <h1>墨客<span class="highlight">·</span>墨痕</h1>
        <p class="subtitle">用代码写诗，用文字记录——一个全栈开发者的技术博客与作品集</p>
        <div class="author-brief">
          <img src="${BlogData.author.avatar}" alt="${BlogData.author.name}">
          <span>${BlogData.author.name} · ${BlogData.author.title}</span>
        </div>
      </div>
      <div class="blog-scroll-hint">
        <span>向下滚动</span>
        <div class="scroll-dot"></div>
      </div>
    `;
    this.container.appendChild(hero);

    // ---- 搜索框 ----
    const searchSection = document.createElement('div');
    searchSection.style.cssText = 'max-width:600px;margin:var(--blog-space-xl) auto 0;padding:0 var(--blog-space-xl);display:flex;gap:10px';
    searchSection.innerHTML = `
      <input type="text" id="blogSearchInput" placeholder="搜索文章标题或摘要..." style="flex:1;padding:12px 18px;background:var(--blog-bg-tertiary);border:1px solid var(--blog-border);border-radius:var(--blog-radius-full);color:var(--blog-text);font-size:0.95rem;outline:none;transition:border-color var(--blog-transition-fast)">
      <button id="blogSearchBtn" style="padding:12px 24px;background:var(--blog-accent);color:var(--blog-bg);border:none;border-radius:var(--blog-radius-full);font-size:0.95rem;font-weight:600;cursor:pointer;transition:background var(--blog-transition-fast)">搜索</button>
    `;
    this.container.appendChild(searchSection);

    // 搜索事件绑定
    const searchInput = searchSection.querySelector('#blogSearchInput');
    const searchBtn = searchSection.querySelector('#blogSearchBtn');
    searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      this.renderFilteredPosts();
    });
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.searchQuery = searchInput.value.trim().toLowerCase();
        this.renderFilteredPosts();
      }
    });
    searchBtn.addEventListener('click', () => {
      this.searchQuery = searchInput.value.trim().toLowerCase();
      this.renderFilteredPosts();
    });

    // ---- 文章列表容器 ----
    const postsWrapper = document.createElement('div');
    postsWrapper.id = 'blogPostsWrapper';
    this.container.appendChild(postsWrapper);

    // 渲染分类栏和文章列表
    this.renderFilteredPosts();
  },

  /**
   * 渲染分类筛选栏与文章列表（供搜索/筛选复用）
   */
  renderFilteredPosts() {
    const wrapper = document.getElementById('blogPostsWrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    const posts = BlogData.posts || [];
    const categories = BlogData.categories || [];

    // ---- 分类栏 ----
    const categoryBar = document.createElement('div');
    categoryBar.className = 'blog-category-bar';
    categoryBar.id = 'blogCategoryBar';

    const allTag = document.createElement('button');
    allTag.className = 'blog-category-tag active';
    allTag.dataset.category = '';
    allTag.textContent = '全部';
    categoryBar.appendChild(allTag);

    categories.forEach(cat => {
      const tag = document.createElement('button');
      tag.className = 'blog-category-tag';
      tag.dataset.category = cat.id;
      tag.textContent = cat.icon + ' ' + cat.name;
      categoryBar.appendChild(tag);
    });

    wrapper.appendChild(categoryBar);

    // 分类点击事件
    categoryBar.addEventListener('click', (e) => {
      const tag = e.target.closest('.blog-category-tag');
      if (!tag) return;
      categoryBar.querySelectorAll('.blog-category-tag').forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      this.activeCategory = tag.dataset.category || null;
      this.renderPostGrid();
    });

    // ---- 文章网格 ----
    const grid = document.createElement('section');
    grid.className = 'blog-posts-grid';
    grid.id = 'blogPostsGrid';
    wrapper.appendChild(grid);

    this.renderPostGrid();
  },

  /**
   * 渲染文章卡片网格（根据分类和搜索过滤）
   */
  renderPostGrid() {
    const grid = document.getElementById('blogPostsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const posts = BlogData.posts || [];
    const userLikes = Storage.getUserLikes();
    const ratings = Storage.getRatings();
    const categories = BlogData.categories || [];

    // 过滤
    let filtered = posts.filter(post => {
      if (this.activeCategory && post.category !== this.activeCategory) return false;
      if (this.searchQuery) {
        const q = this.searchQuery;
        const inTitle = post.title.toLowerCase().includes(q);
        const inSummary = post.summary.toLowerCase().includes(q);
        if (!inTitle && !inSummary) return false;
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:var(--blog-text-muted);font-size:1.1rem">没有找到匹配的文章</div>';
      return;
    }

    filtered.forEach((post, index) => {
      const card = this.createPostCard(post, index, userLikes, ratings, categories);
      grid.appendChild(card);
    });

    // 为新卡片绑定点击事件（卡片整体点击进入详情）
    grid.addEventListener('click', (e) => {
      // 如果点击的是 Web Components 内部或交互元素，不触发跳转
      const interactive = e.target.closest('blog-like-button, blog-star-rating, blog-share-button, .blog-category-tag');
      if (interactive) return;
      const cardEl = e.target.closest('.blog-card');
      if (cardEl && cardEl.dataset.postId) {
        navigate('post/' + cardEl.dataset.postId);
      }
    });

    // 观察新卡片实现淡入
    this.observeReveal();
  },

  /**
   * 创建单张文章卡片
   * @param {Object} post
   * @param {number} index
   * @param {number[]} userLikes
   * @param {Object} ratings
   * @param {Array} categories
   * @returns {HTMLElement}
   */
  createPostCard(post, index, userLikes, ratings, categories) {
    const card = document.createElement('article');
    card.className = 'blog-card blog-reveal';
    if (index > 0) {
      const delay = Math.min(index, 5);
      card.classList.add('blog-reveal-delay-' + delay);
    }
    card.dataset.postId = post.id;

    const catObj = categories.find(c => c.id === post.category);
    const catName = catObj ? catObj.icon + ' ' + catObj.name : post.category;
    const liked = userLikes.includes(post.id);
    const likeData = Storage.getLikes();
    const likeCount = likeData[post.id] !== undefined ? likeData[post.id] : post.initialLikes;
    const ratingData = ratings[post.id];
    const avgRating = ratingData ? (ratingData.total / ratingData.count) : 0;
    const ratingCount = ratingData ? ratingData.count : 0;

    // 封面
    const cover = document.createElement('div');
    cover.className = 'blog-card-cover';
    const lazyImg = document.createElement('blog-lazy-image');
    lazyImg.setAttribute('src', post.cover);
    lazyImg.setAttribute('alt', post.title);
    lazyImg.style.cssText = 'width:100%;height:100%';
    cover.appendChild(lazyImg);

    const catTag = document.createElement('span');
    catTag.className = 'blog-card-category';
    catTag.textContent = catName;
    cover.appendChild(catTag);

    // 正文
    const body = document.createElement('div');
    body.className = 'blog-card-body';

    const title = document.createElement('h3');
    title.className = 'blog-card-title';
    title.textContent = post.title;

    const summary = document.createElement('p');
    summary.className = 'blog-card-summary';
    summary.textContent = post.summary;

    // Meta 信息
    const meta = document.createElement('div');
    meta.className = 'blog-card-meta';

    const metaLeft = document.createElement('div');
    metaLeft.className = 'meta-left';
    metaLeft.innerHTML = `<span>📅 ${post.date}</span><span>📖 ${post.readTime} min</span>`;

    const actions = document.createElement('div');
    actions.className = 'blog-card-actions';

    // 点赞组件
    const likeBtn = document.createElement('blog-like-button');
    likeBtn.setAttribute('post-id', String(post.id));
    likeBtn.setAttribute('count', String(likeCount));
    likeBtn.setAttribute('liked', String(liked));
    actions.appendChild(likeBtn);

    // 评分组件
    const rating = document.createElement('blog-star-rating');
    rating.setAttribute('post-id', String(post.id));
    rating.setAttribute('rating', String(avgRating));
    rating.setAttribute('count', String(ratingCount));
    actions.appendChild(rating);

    meta.appendChild(metaLeft);
    meta.appendChild(actions);

    body.appendChild(title);
    body.appendChild(summary);
    body.appendChild(meta);

    card.appendChild(cover);
    card.appendChild(body);

    return card;
  },

  // ============================
  // 文章详情页
  // ============================

  /**
   * 渲染文章详情页
   * @param {number} id - 文章 ID
   */
  renderPost(id) {
    const post = BlogData.posts.find(p => p.id === id);
    if (!post) {
      this.container.innerHTML = `
        <div style="text-align:center;padding:120px 20px;color:var(--blog-text-muted)">
          <h2 style="font-size:1.5rem;margin-bottom:16px;color:var(--blog-white)">文章未找到</h2>
          <p>请返回首页浏览其他文章</p>
          <a href="#home" style="display:inline-block;margin-top:20px;padding:10px 28px;background:var(--blog-accent);color:var(--blog-bg);border-radius:var(--blog-radius-full);font-weight:600">返回首页</a>
        </div>
      `;
      return;
    }

    const categories = BlogData.categories || [];
    const catObj = categories.find(c => c.id === post.category);
    const catName = catObj ? catObj.icon + ' ' + catObj.name : post.category;

    const userLikes = Storage.getUserLikes();
    const liked = userLikes.includes(post.id);
    const likeData = Storage.getLikes();
    const likeCount = likeData[post.id] !== undefined ? likeData[post.id] : post.initialLikes;
    const ratings = Storage.getRatings();
    const ratingData = ratings[post.id];
    const avgRating = ratingData ? (ratingData.total / ratingData.count) : 0;
    const ratingCount = ratingData ? ratingData.count : 0;

    // ---- 文章主体 ----
    const article = document.createElement('article');
    article.className = 'blog-article blog-reveal';

    // 头部
    const header = document.createElement('header');
    header.className = 'blog-article-header';
    header.innerHTML = `
      <span class="blog-category-tag" style="cursor:default">${catName}</span>
      <h1>${post.title}</h1>
      <div class="blog-article-meta">
        <span>📅 ${post.date}</span>
        <span>📖 ${post.readTime} 分钟阅读</span>
      </div>
    `;
    article.appendChild(header);

    // 封面
    if (post.cover) {
      const coverDiv = document.createElement('div');
      coverDiv.className = 'blog-article-cover';
      coverDiv.innerHTML = `<img src="${post.cover}" alt="${post.title}" loading="lazy">`;
      article.appendChild(coverDiv);
    }

    // 内容（处理图片包装为可点击）
    const contentDiv = document.createElement('div');
    contentDiv.className = 'blog-article-content';
    contentDiv.dataset.lightboxImages = '';
    contentDiv.innerHTML = this.processPostContent(post.content, post.images || []);
    article.appendChild(contentDiv);

    // 操作栏
    const actions = document.createElement('div');
    actions.className = 'blog-article-actions';

    const likeBtn = document.createElement('blog-like-button');
    likeBtn.setAttribute('post-id', String(post.id));
    likeBtn.setAttribute('count', String(likeCount));
    likeBtn.setAttribute('liked', String(liked));
    actions.appendChild(likeBtn);

    const ratingComp = document.createElement('blog-star-rating');
    ratingComp.setAttribute('post-id', String(post.id));
    ratingComp.setAttribute('rating', String(avgRating));
    ratingComp.setAttribute('count', String(ratingCount));
    actions.appendChild(ratingComp);

    const shareBtn = document.createElement('blog-share-button');
    shareBtn.setAttribute('title', post.title);
    shareBtn.setAttribute('text', post.summary);
    actions.appendChild(shareBtn);

    article.appendChild(actions);
    this.container.appendChild(article);

    // 内容图片点击 — 打开 Lightbox
    this.bindContentImages(contentDiv, post.images || []);

    // ---- 评论区 ----
    this.renderComments(post.id);
  },

  /**
   * 处理文章内容：给图片添加点击事件支持
   * @param {string} contentHtml
   * @param {string[]} images
   * @returns {string}
   */
  processPostContent(contentHtml, images) {
    if (!images || images.length === 0) return contentHtml;

    // 用临时 DOM 解析内容，处理图片
    const temp = document.createElement('div');
    temp.innerHTML = contentHtml;

    const imgs = temp.querySelectorAll('img');
    imgs.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.setAttribute('loading', 'lazy');
    });

    return temp.innerHTML;
  },

  /**
   * 绑定内容图片点击打开 Lightbox
   * @param {HTMLElement} container
   * @param {string[]} images
   */
  bindContentImages(container, images) {
    if (!images || images.length === 0 || !this.lightbox) return;

    container.addEventListener('click', (e) => {
      const img = e.target.closest('img');
      if (!img) return;

      const src = img.getAttribute('src');
      if (!src) return;

      const index = images.indexOf(src);
      if (index !== -1) {
        this.lightbox.setAttribute('images', JSON.stringify(images));
        this.lightbox.open(index);
      } else {
        // 单图模式
        this.lightbox.setAttribute('images', JSON.stringify([src]));
        this.lightbox.open(0);
      }
    });
  },

  // ============================
  // 评论区渲染
  // ============================

  /**
   * 渲染评论区
   * @param {number} postId
   */
  renderComments(postId) {
    const commentsSection = document.createElement('section');
    commentsSection.className = 'blog-comments blog-reveal';

    const title = document.createElement('h3');
    title.textContent = '💬 评论';
    commentsSection.appendChild(title);

    // 评论表单
    const form = document.createElement('form');
    form.className = 'blog-comment-form';
    form.innerHTML = `
      <div class="form-row">
        <input type="text" class="comment-name" placeholder="你的昵称（选填）" style="flex:1">
      </div>
      <textarea class="comment-content" placeholder="写下你的想法..." required></textarea>
      <button type="submit" class="submit-btn">发布评论</button>
    `;
    commentsSection.appendChild(form);

    // 评论提交
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = form.querySelector('.comment-name');
      const contentInput = form.querySelector('.comment-content');
      const name = nameInput.value.trim();
      const content = contentInput.value.trim();
      if (!content) return;

      Storage.addComment(postId, name, content);
      nameInput.value = '';
      contentInput.value = '';
      this.renderCommentList(postId, commentsSection);
      this.showToast('评论发布成功！');
    });

    // 评论列表
    this.renderCommentList(postId, commentsSection);

    this.container.appendChild(commentsSection);
  },

  /**
   * 渲染评论列表
   * @param {number} postId
   * @param {HTMLElement} section
   */
  renderCommentList(postId, section) {
    let listEl = section.querySelector('.blog-comment-list');
    if (!listEl) {
      listEl = document.createElement('div');
      listEl.className = 'blog-comment-list';
      section.appendChild(listEl);
    }
    listEl.innerHTML = '';

    const allComments = Storage.getComments();
    const comments = allComments[postId] || [];

    if (comments.length === 0) {
      listEl.innerHTML = '<p style="text-align:center;color:var(--blog-text-muted);padding:40px 0">还没有评论，来当第一个评论者吧 ✨</p>';
      return;
    }

    comments.forEach(comment => {
      const item = document.createElement('div');
      item.className = 'blog-comment-item';
      item.innerHTML = `
        <div class="comment-header">
          <span class="comment-name">${this.escapeHtml(comment.name)}</span>
          <span class="comment-time">${comment.time}</span>
        </div>
        <div class="comment-content">${this.escapeHtml(comment.content)}</div>
      `;
      listEl.appendChild(item);
    });
  },

  // ============================
  // 简历页面
  // ============================

  /**
   * 渲染简历/关于站长页面
   */
  renderResume() {
    const author = BlogData.author;
    const skills = BlogData.skills || [];

    const resume = document.createElement('div');
    resume.className = 'blog-resume';

    // ---- 个人信息 ----
    const header = document.createElement('div');
    header.className = 'blog-resume-header blog-reveal';
    header.innerHTML = `
      <img class="blog-avatar" src="${author.avatar}" alt="${author.name}" loading="lazy">
      <div class="blog-resume-info">
        <h1>${author.name}</h1>
        <p class="title">${author.title}</p>
        <p class="bio">${author.bio}</p>
        <div class="social-links">
          <a href="${author.social.github}" target="_blank" rel="noopener" title="GitHub">GH</a>
          <a href="${author.social.twitter}" target="_blank" rel="noopener" title="Twitter">TW</a>
          <a href="${author.social.zhihu}" target="_blank" rel="noopener" title="知乎">ZH</a>
          <a href="mailto:${author.email}" title="Email">✉</a>
        </div>
      </div>
    `;
    resume.appendChild(header);

    // ---- 教育背景 ----
    const eduSection = document.createElement('section');
    eduSection.className = 'blog-resume-section blog-reveal blog-reveal-delay-1';
    eduSection.innerHTML = '<h2>🎓 教育背景</h2>';
    (BlogData.education || []).forEach(edu => {
      const item = document.createElement('div');
      item.className = 'blog-resume-item';
      item.innerHTML = `
        <div class="item-year">${edu.year}</div>
        <div class="item-body">
          <h4>${edu.school}</h4>
          <div class="item-sub">${edu.major} · ${edu.degree}</div>
          <div class="item-desc">${edu.desc}</div>
        </div>
      `;
      eduSection.appendChild(item);
    });
    resume.appendChild(eduSection);

    // ---- 工作经验 ----
    const expSection = document.createElement('section');
    expSection.className = 'blog-resume-section blog-reveal blog-reveal-delay-2';
    expSection.innerHTML = '<h2>💼 工作经验</h2>';
    (BlogData.experience || []).forEach(exp => {
      const item = document.createElement('div');
      item.className = 'blog-resume-item';
      item.innerHTML = `
        <div class="item-year">${exp.year}</div>
        <div class="item-body">
          <h4>${exp.company}</h4>
          <div class="item-sub">${exp.role}</div>
          <div class="item-desc">${exp.desc}</div>
        </div>
      `;
      expSection.appendChild(item);
    });
    resume.appendChild(expSection);

    // ---- 技能 ----
    const skillSection = document.createElement('section');
    skillSection.className = 'blog-resume-section blog-reveal blog-reveal-delay-3';
    skillSection.innerHTML = '<h2>🛠 技能</h2>';
    const skillsGrid = document.createElement('div');
    skillsGrid.className = 'blog-skills';

    skills.forEach(skill => {
      const item = document.createElement('div');
      item.className = 'blog-skill-item blog-reveal';
      item.innerHTML = `
        <div class="skill-name">
          <span>${skill.name}</span>
          <span>${skill.level}%</span>
        </div>
        <div class="blog-skill-bar">
          <div class="skill-fill" data-level="${skill.level}"></div>
        </div>
      `;
      skillsGrid.appendChild(item);
    });
    skillSection.appendChild(skillsGrid);
    resume.appendChild(skillSection);

    this.container.appendChild(resume);

    // 技能条动画：页面出现后触发
    requestAnimationFrame(() => {
      const fills = skillsGrid.querySelectorAll('.skill-fill');
      fills.forEach(fill => {
        const level = parseInt(fill.dataset.level, 10);
        setTimeout(() => {
          fill.style.width = level + '%';
          fill.classList.add('animated');
        }, 300);
      });
    });
  },

  // ============================
  // 留言板
  // ============================

  /**
   * 渲染留言板页面
   */
  renderGuestbook() {
    const gb = document.createElement('div');
    gb.className = 'blog-guestbook blog-reveal';
    gb.innerHTML = `
      <h1>📖 留言板</h1>
      <p class="gb-subtitle">留下你的想法、建议或只是想打个招呼 👋</p>

      <div class="blog-guestbook-form blog-reveal blog-reveal-delay-1">
        <h3>写留言</h3>
        <div class="form-group">
          <input type="text" id="gbName" placeholder="你的昵称（选填）">
        </div>
        <div class="form-group">
          <textarea id="gbContent" placeholder="说点什么..." required></textarea>
        </div>
        <button class="submit-btn" id="gbSubmitBtn">发布留言</button>
      </div>

      <div class="blog-guestbook-list" id="gbList"></div>
    `;
    this.container.appendChild(gb);

    // 渲染已有留言
    this.renderGuestbookEntries();

    // 提交留言
    const submitBtn = gb.querySelector('#gbSubmitBtn');
    submitBtn.addEventListener('click', () => {
      const nameInput = gb.querySelector('#gbName');
      const contentInput = gb.querySelector('#gbContent');
      const name = nameInput.value.trim();
      const content = contentInput.value.trim();
      if (!content) {
        this.showToast('请输入留言内容');
        return;
      }
      Storage.addGuestbook(name, content);
      nameInput.value = '';
      contentInput.value = '';
      this.renderGuestbookEntries();
      this.showToast('留言发布成功！');
    });
  },

  /**
   * 渲染留言列表
   */
  renderGuestbookEntries() {
    const list = document.getElementById('gbList');
    if (!list) return;
    list.innerHTML = '';

    const entries = Storage.getGuestbook();

    if (entries.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:var(--blog-text-muted);padding:60px 0">还没有留言，来当第一个访客吧 🌟</p>';
      return;
    }

    entries.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'blog-gb-card';
      const initial = entry.name.charAt(0).toUpperCase();
      card.innerHTML = `
        <div class="gb-header">
          <span class="gb-name">
            <span class="gb-avatar">${initial}</span>
            ${this.escapeHtml(entry.name)}
          </span>
          <span class="gb-time">${entry.time}</span>
        </div>
        <div class="gb-content">${this.escapeHtml(entry.content)}</div>
      `;
      list.appendChild(card);
    });
  },

  // ============================
  // 全局事件绑定
  // ============================

  /**
   * 绑定全局事件
   */
  bindGlobalEvents() {
    // 点赞事件（来自 Web Components）
    document.addEventListener('blog-like', (e) => {
      // 无需额外操作，Web Components 已处理 Storage
    });

    // 评分事件（来自 Web Components）
    document.addEventListener('blog-rate', (e) => {
      // 无需额外操作，Web Components 已处理 Storage
    });
  },

  // ============================
  // 滚动监听
  // ============================

  /**
   * 设置滚动监听（导航栏阴影）
   */
  setupScrollListeners() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          if (this.nav) {
            this.nav.classList.toggle('scrolled', window.scrollY > 50);
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  },

  // ============================
  // 滚动淡入
  // ============================

  /**
   * 创建 IntersectionObserver 用于滚动淡入效果
   */
  setupRevealObserver() {
    this.revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          this.revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  },

  /**
   * 观察容器内的 blog-reveal 元素
   */
  observeReveal() {
    if (!this.revealObserver) return;
    const els = this.container.querySelectorAll('.blog-reveal');
    els.forEach(el => this.revealObserver.observe(el));
  },

  // ============================
  // 工具方法
  // ============================

  /**
   * HTML 转义
   * @param {string} text
   * @returns {string}
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * 显示 Toast 提示
   * @param {string} message
   */
  showToast(message) {
    const toast = document.querySelector('blog-toast');
    if (toast) {
      toast.show(message, 2500);
    }
  }
};

// ============================
// 启动
// ============================

document.addEventListener('DOMContentLoaded', () => {
  Blog.init();
});