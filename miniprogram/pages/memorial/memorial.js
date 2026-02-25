const app = getApp()

Page({
  data: {
    openid: ''
  },

  onLoad() {
    // 如果已经获取过，直接使用
    if (app.globalData.openid) {
      this.setData({
        openid: app.globalData.openid
      })
    } else {
      // 如果还未获取，等待获取
      this.waitForOpenId()
    }
  },

  async waitForOpenId() {
    // 等待 app.js 中的 getOpenId 完成
    if (!app.globalData.openid) {
      await new Promise(resolve => setTimeout(resolve, 100))
      return this.waitForOpenId()
    }
    
    this.setData({
      openid: app.globalData.openid
    })
  }
})
