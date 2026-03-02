// utils/theme.js - 主题设置工具

const STORAGE_KEY = 'appThemeSettings'

const DEFAULT_SETTINGS = {
  navBgColor: '#ff69b4',
  pageBgColor: '#FFF5F5'
}

// 根据背景色亮度判断导航栏文字颜色（只允许 #ffffff 或 #000000）
function getNavFrontColor(bgColor) {
  const hex = bgColor.replace('#', '')
  if (hex.length !== 6) return '#ffffff'
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  // 人眼亮度加权公式
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 160 ? '#000000' : '#ffffff'
}

// 读取主题设置（优先读 globalData，其次读 Storage）
function getSettings() {
  try {
    const app = getApp()
    if (app && app.globalData && app.globalData.themeSettings) {
      return app.globalData.themeSettings
    }
    const stored = wx.getStorageSync(STORAGE_KEY)
    return stored || Object.assign({}, DEFAULT_SETTINGS)
  } catch (e) {
    return Object.assign({}, DEFAULT_SETTINGS)
  }
}

// 保存主题设置
function saveSettings(settings) {
  try {
    wx.setStorageSync(STORAGE_KEY, settings)
    const app = getApp()
    if (app && app.globalData) {
      app.globalData.themeSettings = settings
    }
  } catch (e) {
    console.error('保存主题设置失败', e)
  }
}

// 将主题应用到当前页面（设置导航栏颜色 + 更新页面背景 data）
function applyTheme(pageInstance) {
  const settings = getSettings()
  wx.setNavigationBarColor({
    frontColor: getNavFrontColor(settings.navBgColor),
    backgroundColor: settings.navBgColor,
    animation: { duration: 200, timingFunc: 'easeIn' }
  })
  if (pageInstance && pageInstance.setData) {
    pageInstance.setData({ pageBgColor: settings.pageBgColor })
  }
}

module.exports = { getSettings, saveSettings, applyTheme, getNavFrontColor, DEFAULT_SETTINGS }
