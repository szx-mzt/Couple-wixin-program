// pages/settings/settings.js
const { getSettings, saveSettings, applyTheme, getNavFrontColor } = require('../../utils/theme.js')

Page({
  data: {
    navColorOptions: [
      { color: '#ff69b4', name: '热情粉' },
      { color: '#FFB6C1', name: '浅玫粉' },
      { color: '#E91E63', name: '玫瑰红' },
      { color: '#F06292', name: '樱花粉' },
      { color: '#9C27B0', name: '薰衣紫' },
      { color: '#7E57C2', name: '淡雅紫' },
      { color: '#42A5F5', name: '天空蓝' },
      { color: '#26A69A', name: '薄荷青' },
      { color: '#66BB6A', name: '清新绿' },
      { color: '#FFA726', name: '暖橙色' },
      { color: '#8D6E63', name: '奶茶棕' },
      { color: '#546E7A', name: '深邃灰' },
      { color: '#37474F', name: '炭黑色' },
      { color: '#FFFFFF', name: '纯净白' },
    ],
    bgColorOptions: [
      { color: '#FFF5F5', name: '浅粉白' },
      { color: '#FCE4EC', name: '玫瑰白' },
      { color: '#F3E5F5', name: '薰衣白' },
      { color: '#E8EAF6', name: '淡蓝紫' },
      { color: '#E3F2FD', name: '天蓝白' },
      { color: '#E8F5E9', name: '薄荷白' },
      { color: '#FFF9C4', name: '柠檬黄' },
      { color: '#FFF3E0', name: '暖橙白' },
      { color: '#EFEBE9', name: '奶茶白' },
      { color: '#F5F5F5', name: '浅灰白' },
      { color: '#FAFAFA', name: '雾霭白' },
      { color: '#FFFFFF', name: '纯净白' },
    ],
    selectedNavColor: '#ff69b4',
    selectedBgColor: '#FFF5F5',
    pageBgColor: '#FFF5F5',
  },

  onLoad() {
    const settings = getSettings()
    this.setData({
      selectedNavColor: settings.navBgColor,
      selectedBgColor: settings.pageBgColor,
      pageBgColor: settings.pageBgColor,
    })
  },

  onShow() {
    // 不调用 applyTheme，让用户在此页自由预览
    const settings = getSettings()
    wx.setNavigationBarColor({
      frontColor: getNavFrontColor(settings.navBgColor),
      backgroundColor: settings.navBgColor,
    })
  },

  // 选择导航栏颜色（实时预览）
  selectNavColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({ selectedNavColor: color })
    wx.setNavigationBarColor({
      frontColor: getNavFrontColor(color),
      backgroundColor: color,
      animation: { duration: 200, timingFunc: 'easeIn' }
    })
  },

  // 选择页面背景色（实时预览）
  selectBgColor(e) {
    const color = e.currentTarget.dataset.color
    this.setData({ selectedBgColor: color, pageBgColor: color })
  },

  // 保存设置
  saveSettings() {
    const settings = {
      navBgColor: this.data.selectedNavColor,
      pageBgColor: this.data.selectedBgColor,
    }
    saveSettings(settings)
    wx.showToast({ title: '设置已保存', icon: 'success', duration: 1500 })
    setTimeout(() => { wx.navigateBack() }, 1600)
  },

  // 恢复默认
  resetSettings() {
    wx.showModal({
      title: '恢复默认',
      content: '确定要恢复默认外观设置吗？',
      success: (res) => {
        if (res.confirm) {
          const defaults = { navBgColor: '#ff69b4', pageBgColor: '#FFF5F5' }
          this.setData({
            selectedNavColor: defaults.navBgColor,
            selectedBgColor: defaults.pageBgColor,
            pageBgColor: defaults.pageBgColor,
          })
          wx.setNavigationBarColor({
            frontColor: getNavFrontColor(defaults.navBgColor),
            backgroundColor: defaults.navBgColor,
            animation: { duration: 200, timingFunc: 'easeIn' }
          })
          saveSettings(defaults)
          wx.showToast({ title: '已恢复默认', icon: 'success' })
        }
      }
    })
  }
})
