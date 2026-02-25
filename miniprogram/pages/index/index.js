// index.js
Page({
    showCardActionSheet: false,
    currentActionCardId: '',
    // 显示操作菜单
    onCardMoreTap(e) {
      this.setData({
        showCardActionSheet: true,
        currentActionCardId: e.currentTarget.dataset.id
      });
    },

    // 关闭操作菜单
    closeCardActionSheet() {
      this.setData({
        showCardActionSheet: false,
        currentActionCardId: ''
      });
    },

    // 阻止冒泡
    stopPropagation(e) {
      e && e.stopPropagation && e.stopPropagation();
    },

    // 编辑卡片
    onEditCard() {
      const id = this.data.currentActionCardId;
      this.closeCardActionSheet();
      const card = this.data.dailyList.find(item => item._id === id);
      if (!card) {
        wx.showToast({ title: '未找到卡片', icon: 'none' });
        return;
      }
      // 跳转到发布页并传递卡片数据（序列化为字符串）
      wx.navigateTo({
        url: `/pages/publish/publish?edit=1&cardData=${encodeURIComponent(JSON.stringify(card))}`
      });
    },

    // 删除卡片
    onDeleteCard() {
      const id = this.data.currentActionCardId;
      this.closeCardActionSheet();
      wx.showModal({
        title: '确认删除',
        content: '确定要删除这条日常吗？',
        success: (res) => {
          if (res.confirm) {
            wx.cloud.callFunction({
              name: 'quickstartFunctions',
              data: { type: 'deleteDaily', _id: id }
            }).then(() => {
              wx.showToast({ title: '删除成功', icon: 'success' });
              // 刷新列表
              this.setData({ dailyList: this.data.dailyList.filter(item => item._id !== id) });
            }).catch(() => {
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
          }
        }
      });
    },
  data: {
    userInfo: {},
    loveDays: 0,
    dailyList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    openid: '',
    skipRefreshOnShow: false
  },

  async onLoad(options) {
    console.log('onLoad options9999900000:', options);
    await this.getOpenId();
    await this.loadUserInfo();
    // this.resetDailyState();
    // await this.loadDailyList();
    this.calculateLoveDays();
    // 移除绑定邀请逻辑
  },
  async onShow() {
    if (this.skipRefreshOnShow) {
      this.skipRefreshOnShow = false;
      return;
    }
    await this.loadUserInfo();
    // this.resetDailyState();
    console.log('onShow 调用 loadDailyList')
    // 仅首次进入页面或从发布页返回时刷新
    if (this.skipRefreshOnShow) {
      this.skipRefreshOnShow = false;
      await this.loadDailyList();
      return;
    }
    if (!this._hasLoadedOnce) {
      await this.loadDailyList();
      this._hasLoadedOnce = true;
    }
  },
  // 获取 openid
  async getOpenId() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: { type: 'getOpenId' }
      })
      
      const openid = res.result.openid
      this.setData({ openid })
      
      console.log('当前用户 openid:', openid)
      
    } catch (err) {
      console.error('获取 openid 失败', err)
    }
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      const userRes = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: { type: 'getUser' }
      });
      if (userRes.result.success && userRes.result.data) {
        const user = userRes.result.data;
        this.setData({ userInfo: user });
      }
    } catch (err) {
      console.error('加载用户信息失败', err);
    }
  },

  // 计算恋爱天数（从 2025-09-14 开始）
  calculateLoveDays() {
    const startDate = new Date('2025-09-14');
    const today = new Date();
    const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    this.setData({ loveDays: days });
  },

  // 加载日常列表
  async loadDailyList(isLoadMore = false) {
    if (this.data.loading) return;
    this.setData({ loading: true });
    try {
      const res = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: {
          type: 'getDailyList',
          page: this.data.page,
          pageSize: this.data.pageSize
        }
      });
      console.log('获取日常列表响应999999999999', res);
      if (res.result.success) {
        let dailyList = res.result.data;
        dailyList = this.formatDailyList(dailyList);
        const newList = isLoadMore ? [...this.data.dailyList, ...dailyList] : dailyList;
        this.setData({
          dailyList: newList,
          hasMore: dailyList.length >= this.data.pageSize,
          loading: false
        });
      }
    } catch (err) {
      console.error('加载日常列表失败', err);
      this.setData({ loading: false });
    }
  },

  // 格式化日常列表数据
  formatDailyList(list) {
    const { userInfo } = this.data;
    let lastDate = '';

    return list.map(item => {
      const createTime = new Date(item.createTime);
      const dateText = this.formatDate(createTime);
      const timeText = this.formatTime(createTime);

      // 判断是否显示日期卡片
      const showDate = dateText !== lastDate;
      lastDate = dateText;

      return {
        ...item,
        dateText,
        timeText,
        showDate
      };
    });
  },

  // 格式化日期
  formatDate(date) {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];

    if (date.toDateString() === today.toDateString()) {
      return '2026.01.19 星期三';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '2026.01.18 星期二';
    } else {
      return `${year}.${month.toString().padStart(2, '0')}.${day.toString().padStart(2, '0')} ${weekDay}`;
    }
  },

  // 格式化时间
  formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 加载更多
  loadMore() {
    if (!this.data.hasMore || this.data.loading) return;
    
    this.setData({ 
      page: this.data.page + 1 
    });
    this.loadDailyList(true);
  },

  // 预览图片
  previewImage(e) {
    this.skipRefreshOnShow = false;
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({
      urls,
      current
    });
  },

  // 播放视频
  playVideo(e) {
    const { url } = e.currentTarget.dataset;
    // TODO: 跳转到视频播放页面
    console.log('播放视频', url);
  },

  // 跳转到发布页
  goToPublish() {
    // 跳转到发布页，返回时刷新
    this.skipRefreshOnShow = true;
    wx.navigateTo({
      url: '/pages/publish/publish'
    });
  },

  // 跳转到纪念日页
  goToAnniversary() {
    wx.navigateTo({
      url: '/pages/anniversary/anniversary'
    });
  },
  
  // 跳转到个人主页
  goToProfile() {
    wx.navigateTo({
      url: '/pages/profile/profile'
    });
  },

  // 跳转到设置页
  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  // 下拉刷新
   async onPullDownRefresh() {
    await this.loadUserInfo();
    this.resetDailyState();
    await this.loadDailyList();
    wx.stopPullDownRefresh();
  },

  // ...existing code...

  resetDailyState() {
    this.setData({
      page: 1,
      dailyList: [],
      hasMore: true
    });
  },

  buildCoupleId(openidA, openidB) {
    const ids = [openidA, openidB].filter(Boolean);
    if (ids.length < 2) return '';
    return ids.sort().join('_');
  }
});
