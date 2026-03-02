const { Time } = require('../../utils/dateTime.js');
const { applyTheme } = require('../../utils/theme.js');

// pages/anniversary/anniversary.js
Page({

  data: {
    wifeLunar: { month: 7, day: 16 }, // 农历
    husbandLunar: { month: 6, day: 24 },
    wifeSolar: '',
    husbandSolar: '',
    wifeBirthdayDays: 0,
    husbandBirthdayDays: 0,
    wedding: '', // 结婚纪念日待定
    loveMonth: 9,
    loveDay: 14,
    loveDays: 0,
    loveCountdown: 0,
    pageBgColor: '#FFF5F5',
  },

  onLoad(options) {
    this.calculateAnniversaries();
  },

  onShow() {
    applyTheme(this)
  },

  calculateAnniversaries() {
    const today = Time.now(); // 使用全局挂载的时间工具获取当前时间 Date 对象
    // 引入农历转公历静态映射
    const lunar = require('./lunar.js');
    // 老婆生日
    const wifeSolar = lunar.getSolarDate(this.data.wifeLunar.month, this.data.wifeLunar.day);
    let wifeBirthdayDays = '';
    if (wifeSolar) {
      const wifeDate = new Date(wifeSolar);
      let nextWifeBirthday = new Date(today.getFullYear(), wifeDate.getMonth(), wifeDate.getDate());
      if (nextWifeBirthday < today) {
        nextWifeBirthday.setFullYear(today.getFullYear() + 1);
      }
      wifeBirthdayDays = Math.ceil((nextWifeBirthday - today) / (1000 * 60 * 60 * 24));
    }
    // 老公生日
    const husbandSolar = lunar.getSolarDate(this.data.husbandLunar.month, this.data.husbandLunar.day);
    let husbandBirthdayDays = '';
    if (husbandSolar) {
      const husbandDate = new Date(husbandSolar);
      let nextHusbandBirthday = new Date(today.getFullYear(), husbandDate.getMonth(), husbandDate.getDate());
      if (nextHusbandBirthday < today) {
        nextHusbandBirthday.setFullYear(today.getFullYear() + 1);
      }
      husbandBirthdayDays = Math.ceil((nextHusbandBirthday - today) / (1000 * 60 * 60 * 24));
    }
    // 结婚纪念日（待定）
    let weddingDays = '';
    // 恋爱纪念日（每年9月14日）
    const loveMonth = this.data.loveMonth;
    const loveDay = this.data.loveDay;
    let thisYearLove = new Date(today.getFullYear(), loveMonth - 1, loveDay);
    let nextLove = thisYearLove < today ? new Date(today.getFullYear() + 1, loveMonth - 1, loveDay) : thisYearLove;
    let loveCountdown = Math.ceil((nextLove - today) / (1000 * 60 * 60 * 24));
    // 距离上一次恋爱纪念日已过去天数
    let lastLove = thisYearLove < today ? thisYearLove : new Date(today.getFullYear() - 1, loveMonth - 1, loveDay);
    let loveDays = Math.floor((today - lastLove) / (1000 * 60 * 60 * 24));
    this.setData({
      wifeSolar,
      husbandSolar,
      wifeBirthdayDays,
      husbandBirthdayDays,
      weddingDays,
      loveDays,
      loveCountdown
    });
  },
})
