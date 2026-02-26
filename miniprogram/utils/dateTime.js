/**
 * 轻量时间工具（无依赖）
 * 适用于：Vue / UniApp / 小程序 / 浏览器
 */

export const Time = {
    /** 解析时间字符串为中国标准时间Date对象 */
    parse(timeStr) {
      // 解析为UTC时间后加8小时，得到CST时间
      const d = new Date(timeStr);
      return new Date(d.getTime() + 8 * 60 * 60 * 1000);
    },
  /** 获取当前中国标准时间 Date */
  now() {
    // 云函数环境默认 UTC+0，需手动加8小时
    const now = new Date();
    return new Date(now.getTime());
  },

  /** 补零 */
  pad(n) {
    return String(n).padStart(2, '0');
  },

  /** 格式化时间
   * format(new Date(), 'YYYY-MM-DD HH:mm:ss')
   * 只负责格式化，不加时区
   */
  format(date = new Date(), pattern = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
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
    return this.format(this.now(), pattern);
  },

  /** 时间戳 → 中国标准时间字符串 */
  fromTimestamp(ts, pattern = 'YYYY-MM-DD HH:mm:ss') {
    // ts为UTC时间戳，需加8小时
    return this.format(new Date(ts + 8 * 60 * 60 * 1000), pattern);
  },

  /** 时间字符串 → 中国标准时间戳（兼容iOS格式） */
  toTimestamp(timeStr) {
    // iOS 只支持部分格式，需兼容
    let str = timeStr;
    // 自动将 'yyyy-MM-dd HH:mm:ss' 转为 'yyyy/MM/dd HH:mm:ss'
    if (/^\d{4}-\d{2}-\d{2} /.test(str)) {
      str = str.replace(/-/g, '/');
    }
    return new Date(str).getTime() + 8 * 60 * 60 * 1000;
  },

  /** 相差秒数（均按中国标准时间处理） */
  diffSeconds(t1, t2) {
    const d1 = this.parse(t1).getTime();
    const d2 = this.parse(t2).getTime();
    return Math.floor((d1 - d2) / 1000);
  },

  /** 是否今天（中国标准时间） */
  isToday(date) {
    const dCST = this.parse(date);
    const nCST = this.now();
    return (
      dCST.getFullYear() === nCST.getFullYear() &&
      dCST.getMonth() === nCST.getMonth() &&
      dCST.getDate() === nCST.getDate()
    );
  }
};