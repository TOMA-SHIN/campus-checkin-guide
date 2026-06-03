/**
 * app.js - 博客主应用逻辑
 * 路由系统、页面渲染、事件绑定与初始化
 * 依赖：BlogData (data.js), Storage (storage.js), Web Components (components.js)
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

function navigate(hash) {
  if (location.hash === '#' + hash) {
    window.dispatchEvent(new CustomEvent('blog-navigate'));
  }
  location.hash = hash;
}

const Blog = {
  container: null,
  nav: null,
  activeCategory: null,
  searchQuery: '',
  revealObserver: null,
  lightbox: null,

  init() {
    this.setupContainer();
    this.setupNavigation();
    this.setupGlobalComponents();
    this.bindGlobalEvents();
    this.setupRevealObserver();
    this.setupScrollListeners();
    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('blog-navigate', () => this.handleRoute());
    this.handleRoute();
  },

  setupContainer() {
    this.container = document.getElementById('blog-content');
    if (!this.container) {
      this.container = document.createElement('main');
      this.container.id = 'blog-content';
      document.body.appendChild(this.container);
    }
  },

  setupNavigation() {
    this.nav = document.querySelector('.blog-nav');
    if (this.nav) {
      const toggle = this.nav.querySelector('#blogHamburger, #blogNavToggle');
      const links = this.nav.querySelector('#blogNavLinks');
      if (toggle && links) {
        toggle.addEventListener('click', () => { toggle.classList.toggle('active'); links.classList.toggle('open'); });
        links.addEventListener('click', () => { toggle.classList.remove('active'); links.classList.remove('open'); });
      }
      return;
    }
    this.nav = document.createElement('nav');
    this.nav.className = 'blog-nav';
    this.nav.innerHTML = `<a class="blog-nav-brand" href="#home"><span class="brand-icon">✦</span><span>墨客</span></a><div class="blog-nav-toggle" id="blogNavToggle"><span></span><span></span><span></span></div><div class="blog-nav-links" id="blogNavLinks"><a href="#home" data-route="home">首页</a><a href="#resume" data-route="resume">关于站长</a><a href="#guestbook" data-route="guestbook">留言板</a></div>`;
    document.body.prepend(this.nav);
    const toggle = this.nav.querySelector('#blogNavToggle');
    const links = this.nav.querySelector('#blogNavLinks');
    toggle.addEventListener('click', () => { toggle.classList.toggle('active'); links.classList.toggle('open'); });
    links.addEventListener('click', () => { toggle.classList.remove('active'); links.classList.remove('open'); });
  },

  setupGlobalComponents() {
    if (!document.querySelector('blog-back-to-top')) { const el = document.createElement('blog-back-to-top'); document.body.appendChild(el); }
    if (!document.querySelector('blog-reading-progress')) { const el = document.createElement('blog-reading-progress'); document.body.appendChild(el); }
    this.lightbox = document.querySelector('blog-lightbox');
    if (!this.lightbox) { this.lightbox = document.createElement('blog-lightbox'); this.lightbox.id = 'blogLightbox'; document.body.appendChild(this.lightbox); }
    if (!document.querySelector('blog-toast')) { const el = document.createElement('blog-toast'); el.id = 'blogToast'; document.body.appendChild(el); }
  },

  handleRoute() {
    const route = getRoute();
    if (!this.container) return;
    this.container.innerHTML = '';
    this.container.className = 'blog-content blog-fade-in';
    this.searchQuery = '';
    this.activeCategory = null;
    this.updateNavActive(route.page);
    switch (route.page) {
      case 'home': this.renderHome(); break;
      case 'post': this.renderPost(route.param); break;
      case 'resume': this.renderResume(); break;
      case 'guestbook': this.renderGuestbook(); break;
      default: this.renderHome();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.observeReveal();
  },

  updateNavActive(page) {
    const links = this.nav?.querySelectorAll('.blog-nav-links a');
    if (!links) return;
    links.forEach(link => { const route = link.dataset.route; link.classList.toggle('active', route === page); });
  },

  renderHome() {
    const hero = document.createElement('section');
    hero.className = 'blog-hero';
    hero.innerHTML = `<div class="blog-hero-bg"></div><div class="blog-hero-content"><h1>墨客<span class="highlight">·</span>墨痕</h1><p class="subtitle">用代码写诗，用文字记录——一个全栈开发者的技术博客与作品集</p><div class="author-brief"><img src="${BlogData.author.avatar}" alt="${BlogData.author.name}"><span>${BlogData.author.name} · ${BlogData.author.title}</span></div></div><div class="blog-scroll-hint"><span>向下滚动</span><div class="scroll-dot"></div></div>`;
    this.container.appendChild(hero);

    const searchSection = document.createElement('div');
    searchSection.style.cssText = 'max-width:600px;margin:var(--blog-space-xl) auto 0;padding:0 var(--blog-space-xl);display:flex;gap:10px';
    searchSection.innerHTML = `<input type="text" id="blogSearchInput" placeholder="搜索文章标题或摘要..." style="flex:1;padding:12px 18px;background:var(--blog-bg-tertiary);border:1px solid var(--blog-border);border-radius:var(--blog-radius-full);color:var(--blog-text);font-size:0.95rem;outline:none;transition:border-color var(--blog-transition-fast)"><button id="blogSearchBtn" style="padding:12px 24px;background:var(--blog-accent);color:var(--blog-bg);border:none;border-radius:var(--blog-radius-full);font-size:0.95rem;font-weight:600;cursor:pointer;transition:background var(--blog-transition-fast)">搜索</button>`;
    this.container.appendChild(searchSection);

    const searchInput = searchSection.querySelector('#blogSearchInput');
    const searchBtn = searchSection.querySelector('#blogSearchBtn');
    const searchHandler = () => { this.searchQuery = searchInput.value.trim().toLowerCase(); this.renderFilteredPosts(); };
    searchInput.addEventListener('input', searchHandler);
    searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') searchHandler(); });
    searchBtn.addEventListener('click', searchHandler);

    const postsWrapper = document.createElement('div');
    postsWrapper.id = 'blogPostsWrapper';
    this.container.appendChild(postsWrapper);
    this.renderFilteredPosts();
  },