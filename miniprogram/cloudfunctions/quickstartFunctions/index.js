// pages/profile/theme/theme.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

    themeColorList: [
      { name: '樱花粉', value: '#ff69b4' },
      { name: '晨曦橙', value: '#ff8c42' },
      { name: '海洋蓝', value: '#42b7ff' },
      { name: '薄荷绿', value: '#4dd0a3' },
      { name: '暮雪紫', value: '#b97bff' },
      { name: '星夜灰', value: '#6f7481' }
    ],
    themeColor: '#ff69b4',
    themeColorName: '樱花粉'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  /**
   * 选择主题色
   */
  selectThemeColor(event) {
    const { color, name } = event.currentTarget.dataset;
    if (!color) return;
    this.setData({
      themeColor: color,
      themeColorName: name
    });
  },

  /**
   * 应用主题色
   */
  applyThemeColor() {
    const { themeColor, themeColorName } = this.data;
    wx.setStorageSync('themeColor', themeColor);
    wx.setStorageSync('themeColorName', themeColorName);
    wx.showToast({
      title: '主题已更新',
      icon: 'success',
      duration: 1200
    });
  },
})