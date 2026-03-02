import { Time } from "../../utils/dateTime";
const app = getApp();
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
              // 删除后重置页码并刷新列表，保证分组和时间显示正常
              this.setData({ page: 1 });
              this.loadDailyList();
            }).catch(() => {
              wx.showToast({ title: '删除失败', icon: 'none' });
            });
          }
        }
      });
    },
  data: {
    userInfo: app.globalData.userInfo || {},
    loveDays: 0,
    dailyList: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    openid: app.globalData.openid || '',
    skipRefreshOnShow: false
  },

  async onLoad(options) {
    console.log('onLoad options9999900000:', options);
    this.calculateLoveDays();
  },
  async onShow() {
    if (this.skipRefreshOnShow) {
      this.skipRefreshOnShow = false;
      return;
    }
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

  // 计算恋爱天数（从 2025-09-14 开始）
  calculateLoveDays() {
    const startDate = Time.toTimestamp('2025-09-14'); // 使用全局挂载的时间工具解析日期字符串为 Date 对象
    const today = Time.now(); // 使用全局挂载的时间工具获取当前时间 Date 对象
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
    let lastDate = '';
    return list.map(item => {
      const date = new Date(item.createTime);
      const dateText = this.formatDate(date);
      const timeText = this.formatTime(date);

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
    const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][date.getDay()];
    return Time.format(date, 'YYYY.MM.DD') + ` ${weekDay}`;
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
