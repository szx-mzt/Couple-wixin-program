import { Time } from "../../utils/dateTime"

Page({
  data: {
    statusBarHeight: 0,
    loveStartDate: '2025-09-14',
    loveDays: 0,
    themeColor: '#ff69b4',
    openid: ''
  },

  onLoad() {
    this.initUserData()
  },

  onShow() {
    this.initUserData()
  },

  // 初始化用户数据
  async initUserData() {
    try {
      const loginRes = await wx.login()
      const code = loginRes.code
      const openidRes = await wx.cloud.callFunction({
        name: 'quickstartFunctions',
        data: { type: 'getOpenId', code }
      })
      const openid = openidRes.result.openid
      this.setData({ openid })
      // 用户信息加载已移除，无需调用
    } catch (err) {
      console.error('初始化用户数据失败', err)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  // 计算纪念日天数
  calculateLoveDays() {
    const startDate = Time.toTimestamp(this.data.loveStartDate); // 使用全局挂载的时间工具解析日期字符串为 Date 对象
    const today = Time.now() // 使用全局挂载的时间工具获取当前时间 Date 对象
    const days = Math.floor((today - startDate) / (1000 * 60 * 60 * 24))
    this.setData({ loveDays: days })
  },

  // 更换背景图
  changeBg() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success: (res) => {
        // TODO: 上传并设置背景图
        wx.showToast({ title: '背景已更换', icon: 'success' })
      }
    })
  },

  // 关于我们
  aboutUs() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  // 意见反馈
  feedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  // 分享
  share() {
    wx.showShareMenu({
      withShareTicket: true
    })
  }
})
