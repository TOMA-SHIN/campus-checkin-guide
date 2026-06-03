/**
 * storage.js - localStorage 数据管理模块
 * 管理点赞、评分、评论数据的持久化读写
 */

const Storage = {
  /**
   * 获取所有点赞数据
   * @returns {Object} { postId: likeCount, ... }
   */
  getLikes() {
    try {
      return JSON.parse(localStorage.getItem('blog_likes') || '{}');
    } catch { return {}; }
  },

  /**
   * 保存点赞数据
   * @param {Object} data
   */
  saveLikes(data) {
    localStorage.setItem('blog_likes', JSON.stringify(data));
  },

  /**
   * 点赞/取消点赞
   * @param {number} postId
   * @param {number} initialCount - 初始点赞数
   * @returns {Object} { count, liked }
   */
  toggleLike(postId, initialCount = 0) {
    const likes = this.getLikes();
    const userLikes = this.getUserLikes();
    const liked = userLikes.includes(postId);

    if (liked) {
      // 取消点赞
      likes[postId] = (likes[postId] || initialCount) - 1;
      this.setUserLikes(userLikes.filter(id => id !== postId));
    } else {
      // 点赞
      likes[postId] = (likes[postId] || initialCount) + 1;
      this.setUserLikes([...userLikes, postId]);
    }

    this.saveLikes(likes);
    return { count: likes[postId], liked: !liked };
  },

  /**
   * 获取用户点赞记录
   * @returns {number[]}
   */
  getUserLikes() {
    try {
      return JSON.parse(localStorage.getItem('blog_user_likes') || '[]');
    } catch { return []; }
  },

  /**
   * 保存用户点赞记录
   * @param {number[]} data
   */
  setUserLikes(data) {
    localStorage.setItem('blog_user_likes', JSON.stringify(data));
  },

  /**
   * 获取评分数据
   * @returns {Object} { postId: { total: number, count: number }, ... }
   */
  getRatings() {
    try {
      return JSON.parse(localStorage.getItem('blog_ratings') || '{}');
    } catch { return {}; }
  },

  /**
   * 为文章评分
   * @param {number} postId
   * @param {number} stars - 1-5
   * @returns {Object} { average, count }
   */
  ratePost(postId, stars) {
    const ratings = this.getRatings();
    if (!ratings[postId]) {
      ratings[postId] = { total: 0, count: 0 };
    }
    // 如果用户已经评过分，先减去旧的
    const userRating = this.getUserRating(postId);
    if (userRating > 0) {
      ratings[postId].total -= userRating;
      ratings[postId].count -= 1;
    }
    ratings[postId].total += stars;
    ratings[postId].count += 1;
    this.saveRatings(ratings);
    this.setUserRating(postId, stars);
    return {
      average: ratings[postId].total / ratings[postId].count,
      count: ratings[postId].count
    };
  },

  /**
   * 保存评分数据
   * @param {Object} data
   */
  saveRatings(data) {
    localStorage.setItem('blog_ratings', JSON.stringify(data));
  },

  /**
   * 获取用户评分记录
   * @returns {Object} { postId: stars, ... }
   */
  getUserRatings() {
    try {
      return JSON.parse(localStorage.getItem('blog_user_ratings') || '{}');
    } catch { return {}; }
  },

  /**
   * 获取用户对某篇文章的评分
   * @param {number} postId
   * @returns {number}
   */
  getUserRating(postId) {
    return this.getUserRatings()[postId] || 0;
  },

  /**
   * 保存用户评分记录
   * @param {number} postId
   * @param {number} stars
   */
  setUserRating(postId, stars) {
    const ratings = this.getUserRatings();
    ratings[postId] = stars;
    localStorage.setItem('blog_user_ratings', JSON.stringify(ratings));
  },

  /**
   * 获取评论数据
   * @returns {Object} { postId: [comment, ...], ... }
   */
  getComments() {
    try {
      return JSON.parse(localStorage.getItem('blog_comments') || '{}');
    } catch { return {}; }
  },

  /**
   * 添加评论
   * @param {number} postId
   * @param {string} name
   * @param {string} content
   * @returns {Object} 新评论对象
   */
  addComment(postId, name, content) {
    const comments = this.getComments();
    if (!comments[postId]) comments[postId] = [];
    const comment = {
      id: Date.now(),
      name: name || '匿名访客',
      content,
      time: new Date().toLocaleString('zh-CN')
    };
    comments[postId].unshift(comment);
    localStorage.setItem('blog_comments', JSON.stringify(comments));
    return comment;
  },

  /**
   * 获取全站留言板留言
   * @returns {Array}
   */
  getGuestbook() {
    try {
      return JSON.parse(localStorage.getItem('blog_guestbook') || '[]');
    } catch { return []; }
  },

  /**
   * 添加全站留言
   * @param {string} name
   * @param {string} content
   * @returns {Object}
   */
  addGuestbook(name, content) {
    const entries = this.getGuestbook();
    const entry = {
      id: Date.now(),
      name: name || '匿名访客',
      content,
      time: new Date().toLocaleString('zh-CN')
    };
    entries.unshift(entry);
    localStorage.setItem('blog_guestbook', JSON.stringify(entries));
    return entry;
  }
};