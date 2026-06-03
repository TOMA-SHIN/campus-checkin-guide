/**
 * components.js - Web Components 组件模块
 * 定义所有 blog- 前缀的自定义元素，使用 Shadow DOM
 */

// ============================
// 1. <blog-star-rating> - 五星评分
// ============================
class BlogStarRating extends HTMLElement {
  static get observedAttributes() {
    return ['post-id', 'rating', 'count'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._currentHover = 0;
    this._rating = parseFloat(this.getAttribute('rating')) || 0;
    this._count = parseInt(this.getAttribute('count')) || 0;
    this._postId = this.getAttribute('post-id');
    this._userRating = 0;

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; align-items: center; gap: 8px; font-size: 14px; }
        .blog-stars { display: inline-flex; gap: 2px; }
        .blog-star { cursor: pointer; font-size: 20px; color: #D1D5DB; transition: color 0.2s, transform 0.15s; user-select: none; line-height: 1; }
        .blog-star:hover { transform: scale(1.2); }
        .blog-star.active { color: #F59E0B; }
        .blog-star.hover { color: #FCD34D; }
        .blog-rating-info { color: #6B7280; font-size: 0.85em; margin-left: 4px; }
      </style>
      <div class="blog-stars" part="stars">
        ${Array.from({ length: 5 }, (_, i) => `<span class="blog-star" data-index="${i + 1}">★</span>`).join('')}
      </div>
      <span class="blog-rating-info" part="info">
        <span class="blog-average">${this._rating.toFixed(1)}</span>
        (<span class="blog-count">${this._count}</span>)
      </span>
    `;
  }

  connectedCallback() {
    this._renderStars();
    this._bindEvents();
    this._loadUserRating();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'rating') this._rating = parseFloat(newVal) || 0;
    if (name === 'count') this._count = parseInt(newVal) || 0;
    if (name === 'post-id') this._postId = newVal;
    this._renderStars();
    this._updateInfo();
  }

  _loadUserRating() {
    if (window.Storage && this._postId) {
      this._userRating = Storage.getUserRating(parseInt(this._postId));
      this._renderStars();
    }
  }

  _renderStars() {
    const stars = this.shadowRoot.querySelectorAll('.blog-star');
    const displayRating = this._currentHover || this._rating;
    stars.forEach((star, i) => {
      const idx = i + 1;
      star.className = 'blog-star';
      if (idx <= Math.round(this._userRating || displayRating)) {
        star.classList.add('active');
      }
    });
  }

  _updateInfo() {
    const avgEl = this.shadowRoot.querySelector('.blog-average');
    const cntEl = this.shadowRoot.querySelector('.blog-count');
    if (avgEl) avgEl.textContent = this._rating.toFixed(1);
    if (cntEl) cntEl.textContent = String(this._count);
  }

  _bindEvents() {
    const container = this.shadowRoot.querySelector('.blog-stars');
    container.addEventListener('mouseover', (e) => {
      const star = e.target.closest('.blog-star');
      if (!star) return;
      this._currentHover = parseInt(star.dataset.index);
      this._renderStars();
    });
    container.addEventListener('mouseleave', () => {
      this._currentHover = 0;
      this._renderStars();
    });
    container.addEventListener('click', (e) => {
      const star = e.target.closest('.blog-star');
      if (!star) return;
      const stars = parseInt(star.dataset.index);
      if (window.Storage && this._postId) {
        const result = Storage.ratePost(parseInt(this._postId), stars);
        this._rating = result.average;
        this._count = result.count;
        this._userRating = stars;
        this._renderStars();
        this._updateInfo();
      }
      this.dispatchEvent(new CustomEvent('blog-rate', {
        bubbles: true, composed: true,
        detail: { postId: this._postId, stars }
      }));
    });
  }
}

// ============================
// 2. <blog-like-button> - 点赞按钮
// ============================
class BlogLikeButton extends HTMLElement {
  static get observedAttributes() {
    return ['post-id', 'count', 'liked'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._postId = this.getAttribute('post-id');
    this._count = parseInt(this.getAttribute('count')) || 0;
    this._liked = this.getAttribute('liked') === 'true';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; }
        button { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px solid #E5E7EB; border-radius: 8px; background: #F9FAFB; cursor: pointer; font-size: 14px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); color: #6B7280; user-select: none; line-height: 1; }
        button:hover { background: #FEF2F2; border-color: #FECACA; transform: scale(1.05); }
        button.liked { color: #EF4444; border-color: #FECACA; background: #FEF2F2; }
        button.liked:hover { background: #FEE2E2; }
        .heart { font-size: 16px; transition: transform 0.2s; }
        button.liked .heart { animation: heartPop 0.3s ease; }
        @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.4); } 100% { transform: scale(1); } }
        .count { font-size: 0.9em; }
      </style>
      <button class="${this._liked ? 'liked' : ''}" part="button">
        <span class="heart">${this._liked ? '❤️' : '🤍'}</span>
        <span class="count">${this._count}</span>
      </button>
    `;
  }

  connectedCallback() { this._bindEvents(); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'post-id') this._postId = newVal;
    if (name === 'count') { this._count = parseInt(newVal) || 0; this._updateCount(); }
    if (name === 'liked') { this._liked = newVal === 'true'; this._updateState(); }
  }

  _updateCount() {
    const el = this.shadowRoot.querySelector('.count');
    if (el) el.textContent = String(this._count);
  }

  _updateState() {
    const btn = this.shadowRoot.querySelector('button');
    const heart = this.shadowRoot.querySelector('.heart');
    if (btn) btn.className = this._liked ? 'liked' : '';
    if (heart) heart.textContent = this._liked ? '❤️' : '🤍';
  }

  _bindEvents() {
    const btn = this.shadowRoot.querySelector('button');
    btn.addEventListener('click', () => {
      if (window.Storage && this._postId) {
        const post = window.BlogData?.posts?.find(p => String(p.id) === String(this._postId));
        const initialCount = post ? post.initialLikes : 0;
        const result = Storage.toggleLike(parseInt(this._postId), initialCount);
        this._count = result.count;
        this._liked = result.liked;
        this._updateCount();
        this._updateState();
      } else {
        this._liked = !this._liked;
        this._count += this._liked ? 1 : -1;
        this._updateCount();
        this._updateState();
      }
      this.dispatchEvent(new CustomEvent('blog-like', {
        bubbles: true, composed: true,
        detail: { postId: this._postId, liked: this._liked, count: this._count }
      }));
    });
  }
}

// ============================
// 3. <blog-share-button> - 分享按钮
// ============================
class BlogShareButton extends HTMLElement {
  static get observedAttributes() { return ['title', 'url', 'text']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._title = this.getAttribute('title') || '';
    this._url = this.getAttribute('url') || location.href;
    this._text = this.getAttribute('text') || '';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-flex; }
        button { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border: 1px solid #E5E7EB; border-radius: 8px; background: #F9FAFB; cursor: pointer; font-size: 14px; color: #6B7280; transition: all 0.25s; user-select: none; line-height: 1; }
        button:hover { background: #EFF6FF; border-color: #BFDBFE; color: #3B82F6; transform: scale(1.05); }
        .icon { font-size: 16px; }
      </style>
      <button part="button"><span class="icon">↗</span><span>分享</span></button>
    `;
  }

  connectedCallback() { this._bindEvents(); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'title') this._title = newVal || '';
    if (name === 'url') this._url = newVal || location.href;
    if (name === 'text') this._text = newVal || '';
  }

  async _share() {
    const shareData = { title: this._title || document.title, url: this._url };
    if (this._text) shareData.text = this._text;
    if (navigator.share) {
      try { await navigator.share(shareData); }
      catch (err) { if (err.name !== 'AbortError') this._copyLink(); }
    } else {
      this._copyLink();
    }
  }

  async _copyLink() {
    try { await navigator.clipboard.writeText(this._url); } catch {
      const input = document.createElement('input');
      input.value = this._url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    this._showToast('链接已复制到剪贴板');
  }

  _showToast(message) {
    const existing = document.querySelector('blog-toast');
    if (existing) { existing.setAttribute('message', message); existing.setAttribute('duration', '2500'); return; }
    const toast = document.createElement('div');
    toast.textContent = message;
    Object.assign(toast.style, { position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#1F2937', color: 'white', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', zIndex: '999999', opacity: '0', transition: 'opacity 0.3s ease', pointerEvents: 'none' });
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2500);
  }

  _bindEvents() {
    this.shadowRoot.querySelector('button').addEventListener('click', () => this._share());
  }
}

// ============================
// 4. <blog-back-to-top> - 返回顶部
// ============================
class BlogBackToTop extends HTMLElement {
  static get observedAttributes() { return ['threshold']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._threshold = parseInt(this.getAttribute('threshold')) || 300;
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; bottom: 32px; right: 32px; z-index: 9999; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); transform: translateY(20px); }
        :host(.visible) { opacity: 1; visibility: visible; transform: translateY(0); }
        button { width: 44px; height: 44px; border-radius: 50%; border: none; background: #4A90D9; color: white; font-size: 20px; cursor: pointer; box-shadow: 0 4px 15px rgba(74, 144, 217, 0.4); transition: all 0.25s; display: flex; align-items: center; justify-content: center; }
        button:hover { background: #3d80c7; transform: scale(1.1); }
      </style>
      <button part="button" aria-label="返回顶部"><span>↑</span></button>
    `;
  }

  connectedCallback() {
    this._bindScroll();
    this._bindClick();
    this._checkScroll();
  }

  disconnectedCallback() { window.removeEventListener('scroll', this._scrollHandler); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'threshold') this._threshold = parseInt(newVal) || 300;
  }

  _checkScroll() {
    this.classList.toggle('visible', window.scrollY > this._threshold);
  }

  _bindScroll() {
    this._scrollHandler = () => this._checkScroll();
    window.addEventListener('scroll', this._scrollHandler, { passive: true });
  }

  _bindClick() {
    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ============================
// 5. <blog-reading-progress> - 阅读进度条
// ============================
class BlogReadingProgress extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; top: 0; left: 0; width: 100%; height: 3px; z-index: 99999; background: transparent; pointer-events: none; }
        .progress-bar { height: 100%; width: 0%; background: linear-gradient(90deg, #4A90D9, #67B8F7); transition: width 0.1s linear; border-radius: 0 2px 2px 0; }
      </style>
      <div class="progress-bar" part="bar"></div>
    `;
  }

  connectedCallback() {
    this._updateProgress();
    window.addEventListener('scroll', this._scrollHandler = () => this._updateProgress(), { passive: true });
    window.addEventListener('resize', this._resizeHandler = () => this._updateProgress(), { passive: true });
  }

  disconnectedCallback() {
    window.removeEventListener('scroll', this._scrollHandler);
    window.removeEventListener('resize', this._resizeHandler);
  }

  _updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (docHeight <= 0) { this.shadowRoot.querySelector('.progress-bar').style.width = '0%'; return; }
    this.shadowRoot.querySelector('.progress-bar').style.width = Math.min((scrollTop / docHeight) * 100, 100) + '%';
  }
}

// ============================
// 6. <blog-lazy-image> - 图片懒加载
// ============================
class BlogLazyImage extends HTMLElement {
  static get observedAttributes() { return ['src', 'alt', 'placeholder']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._loaded = false;
    this._src = this.getAttribute('src') || '';
    this._alt = this.getAttribute('alt') || '';
    this._placeholder = this.getAttribute('placeholder') || '#E5E7EB';
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: inline-block; position: relative; overflow: hidden; line-height: 0; }
        .placeholder { width: 100%; height: 100%; background-color: ${this._placeholder}; transition: opacity 0.5s ease; position: absolute; top: 0; left: 0; }
        .placeholder.hidden { opacity: 0; }
        img { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.5s ease; }
        img.loaded { opacity: 1; }
      </style>
      <div class="placeholder"></div>
      <img part="img" alt="${this._alt}">
    `;
  }

  connectedCallback() { this._observe(); }
  disconnectedCallback() { if (this._observer) this._observer.disconnect(); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'src') { this._src = newVal || ''; this._loaded = false; if (this._observer) { this._observer.disconnect(); this._observe(); } }
    if (name === 'alt') { this._alt = newVal || ''; const img = this.shadowRoot.querySelector('img'); if (img) img.alt = this._alt; }
    if (name === 'placeholder') { this._placeholder = newVal || '#E5E7EB'; const pl = this.shadowRoot.querySelector('.placeholder'); if (pl) pl.style.backgroundColor = this._placeholder; }
  }

  _observe() {
    if (!this._src) return;
    this._observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { this._loadImage(); this._observer.disconnect(); }
      });
    }, { rootMargin: '200px' });
    this._observer.observe(this);
  }

  _loadImage() {
    const img = this.shadowRoot.querySelector('img');
    const placeholder = this.shadowRoot.querySelector('.placeholder');
    const tempImg = new Image();
    tempImg.onload = () => { img.src = this._src; img.classList.add('loaded'); placeholder.classList.add('hidden'); this._loaded = true; };
    tempImg.onerror = () => { placeholder.style.backgroundColor = '#FEE2E2'; this._loaded = false; };
    tempImg.src = this._src;
  }
}

// ============================
// 7. <blog-lightbox> - 图片灯箱
// ============================
class BlogLightbox extends HTMLElement {
  static get observedAttributes() { return ['images', 'current']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._images = [];
    this._current = 0;
    try { this._images = this.getAttribute('images') ? JSON.parse(this.getAttribute('images')) : []; } catch { this._images = []; }
    this._current = parseInt(this.getAttribute('current')) || 0;
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 100000; display: flex; align-items: center; justify-content: center; opacity: 0; visibility: hidden; transition: opacity 0.3s ease, visibility 0.3s ease; }
        :host(.open) { opacity: 1; visibility: visible; }
        .overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); backdrop-filter: blur(6px); }
        .close-btn { position: absolute; top: 20px; right: 24px; width: 40px; height: 40px; border: none; background: rgba(255,255,255,0.15); color: white; font-size: 28px; border-radius: 50%; cursor: pointer; z-index: 2; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
        .close-btn:hover { background: rgba(255,255,255,0.3); }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); width: 48px; height: 48px; border: none; background: rgba(255,255,255,0.12); color: white; font-size: 24px; border-radius: 50%; cursor: pointer; z-index: 2; display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.2s; }
        .nav-btn:hover { background: rgba(255,255,255,0.25); transform: translateY(-50%) scale(1.1); }
        .nav-btn.prev { left: 20px; }
        .nav-btn.next { right: 20px; }
        .nav-btn.hidden { display: none; }
        .image-container { position: relative; z-index: 1; max-width: 85vw; max-height: 85vh; display: flex; align-items: center; justify-content: center; }
        .image-container img { max-width: 85vw; max-height: 85vh; object-fit: contain; border-radius: 4px; box-shadow: 0 8px 40px rgba(0,0,0,0.5); opacity: 0; transition: opacity 0.3s ease; }
        .image-container img.visible { opacity: 1; }
        .counter { position: absolute; bottom: -36px; left: 50%; transform: translateX(-50%); color: rgba(255,255,255,0.7); font-size: 14px; }
      </style>
      <div class="overlay" part="overlay"></div>
      <button class="close-btn" part="close-btn">✕</button>
      <button class="nav-btn prev" part="prev-btn">‹</button>
      <button class="nav-btn next" part="next-btn">›</button>
      <div class="image-container" part="container">
        <img part="lightbox-img" alt="lightbox image">
        <div class="counter" part="counter"></div>
      </div>
    `;
  }

  connectedCallback() { this._bindEvents(); this._render(); }
  disconnectedCallback() { document.removeEventListener('keydown', this._keyHandler); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'images') { try { this._images = JSON.parse(newVal); } catch { this._images = []; } this._render(); }
    if (name === 'current') { this._current = parseInt(newVal) || 0; this._render(); }
  }

  open(index) {
    if (typeof index === 'number') { this._current = index; this.setAttribute('current', String(index)); }
    this.classList.add('open');
    this._render();
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this._keyHandler);
  }

  close() {
    this.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', this._keyHandler);
    this.dispatchEvent(new CustomEvent('blog-lightbox-close', { bubbles: true, composed: true }));
  }

  _goTo(index) { if (index < 0 || index >= this._images.length) return; this._current = index; this._render(); }

  _render() {
    const img = this.shadowRoot.querySelector('img');
    const counter = this.shadowRoot.querySelector('.counter');
    const prevBtn = this.shadowRoot.querySelector('.nav-btn.prev');
    const nextBtn = this.shadowRoot.querySelector('.nav-btn.next');
    if (!this._images.length) { img.classList.remove('visible'); img.src = ''; counter.textContent = ''; prevBtn.classList.add('hidden'); nextBtn.classList.add('hidden'); return; }
    this._current = Math.max(0, Math.min(this._current, this._images.length - 1));
    img.classList.remove('visible');
    img.src = this._images[this._current];
    img.onload = () => img.classList.add('visible');
    img.onerror = () => img.classList.add('visible');
    counter.textContent = `${this._current + 1} / ${this._images.length}`;
    prevBtn.classList.toggle('hidden', this._images.length <= 1);
    nextBtn.classList.toggle('hidden', this._images.length <= 1);
  }

  _bindEvents() {
    this._keyHandler = (e) => {
      if (e.key === 'Escape') this.close();
      if (e.key === 'ArrowLeft') this._goTo(this._current - 1);
      if (e.key === 'ArrowRight') this._goTo(this._current + 1);
    };
    this.shadowRoot.querySelector('.overlay').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.close-btn').addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.nav-btn.prev').addEventListener('click', () => this._goTo(this._current - 1));
    this.shadowRoot.querySelector('.nav-btn.next').addEventListener('click', () => this._goTo(this._current + 1));
  }
}

// ============================
// 8. <blog-toast> - Toast 通知
// ============================
class BlogToast extends HTMLElement {
  static get observedAttributes() { return ['message', 'duration']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._message = this.getAttribute('message') || '';
    this._duration = parseInt(this.getAttribute('duration')) || 3000;
    this._timer = null;
    this.shadowRoot.innerHTML = `
      <style>
        :host { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px); z-index: 999999; opacity: 0; visibility: hidden; transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34,1.56,0.64,1), visibility 0.35s ease; pointer-events: none; }
        :host(.show) { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }
        .toast-content { background: #1F2937; color: white; padding: 12px 28px; border-radius: 10px; font-size: 14px; box-shadow: 0 8px 30px rgba(0,0,0,0.25); max-width: 80vw; text-align: center; line-height: 1.5; pointer-events: auto; }
      </style>
      <div class="toast-content" part="content">${this._message}</div>
    `;
  }

  connectedCallback() { if (this._message) this.show(); }
  disconnectedCallback() { if (this._timer) clearTimeout(this._timer); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'message') { this._message = newVal || ''; const el = this.shadowRoot.querySelector('.toast-content'); if (el) el.textContent = this._message; }
    if (name === 'duration') { this._duration = parseInt(newVal) || 3000; }
  }

  show(message, duration) {
    if (message != null) { this._message = message; this.shadowRoot.querySelector('.toast-content').textContent = message; this.setAttribute('message', message); }
    if (duration != null) this._duration = duration;
    if (this._timer) clearTimeout(this._timer);
    this.classList.remove('show');
    void this.shadowRoot.host.offsetHeight;
    this.classList.add('show');
    this._timer = setTimeout(() => { this.classList.remove('show'); }, this._duration);
  }

  hide() { if (this._timer) clearTimeout(this._timer); this.classList.remove('show'); }
}

customElements.define('blog-star-rating', BlogStarRating);
customElements.define('blog-like-button', BlogLikeButton);
customElements.define('blog-share-button', BlogShareButton);
customElements.define('blog-back-to-top', BlogBackToTop);
customElements.define('blog-reading-progress', BlogReadingProgress);
customElements.define('blog-lazy-image', BlogLazyImage);
customElements.define('blog-lightbox', BlogLightbox);
customElements.define('blog-toast', BlogToast);