/**
 * 轻量时间工具（无依赖）
 * 适用于：Vue / UniApp / 小程序 / 浏览器
 */
const Time = {
  now() {
    return new Date();
  },

  /** 补零 */
  pad(n) {
    return String(n).padStart(2, '0');
  },

  /** 格式化时间
   * format(new Date(), 'YYYY-MM-DD HH:mm:ss')
   * 只负责格式化，不加时区
   */
  format(date = null, pattern = 'YYYY-MM-DD HH:mm:ss') {
    // 默认格式化当前中国标准时间（自动加8小时）
    let d = date ? new Date(date) : this.now();
    d = new Date(d.getTime() + 8 * 60 * 60 * 1000);
    const map = {
      YYYY: d.getFullYear(),
      MM: this.pad(d.getMonth() + 1),
      DD: this.pad(d.getDate()),
      HH: this.pad(d.getHours()),
      mm: this.pad(d.getMinutes()),
      ss: this.pad(d.getSeconds())
    };
    return pattern.replace(/YYYY|MM|DD|HH|mm|ss/g, k => map[k]);
  },

  /** 当前中国标准时间字符串 */
  nowString(pattern = 'YYYY-MM-DD HH:mm:ss') {
    return this.format(null, pattern);
  },

  /** 时间戳 → 中国标准时间字符串 */
  fromTimestamp(ts, pattern = 'YYYY-MM-DD HH:mm:ss') {
    // 时间戳转 CST
    return this.format(new Date(ts), pattern);
  },

  /** 时间字符串 → 中国标准时间戳（兼容iOS格式） */
  toTimestamp(timeStr) {
    // iOS 只支持部分格式，需兼容
    let str = timeStr;
    // 自动将 'yyyy-MM-dd HH:mm:ss' 转为 'yyyy/MM/dd HH:mm:ss'
    if (/^\d{4}-\d{2}-\d{2} /.test(str)) {
      str = str.replace(/-/g, '/');
    }
    return new Date(str).getTime();
  },
};

module.exports = Time;