/**
 * 轻量时间工具（无依赖）
 * 适用于：Vue / UniApp / 小程序 / 浏览器
 */

export const Time = {
  /** 获取当前中国标准时间 Date */
  now() {
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

  /** 相差秒数（均按中国标准时间处理） */
  diffSeconds(t1, t2) {
    const d1 = this.now(t1).getTime();
    const d2 = this.now(t2).getTime();
    return Math.floor((d1 - d2) / 1000);
  },

  /** 是否今天（中国标准时间） */
  isToday(date) {
    const dCST = this.now(date);
    const nCST = this.now();
    return (
      dCST.getFullYear() === nCST.getFullYear() &&
      dCST.getMonth() === nCST.getMonth() &&
      dCST.getDate() === nCST.getDate()
    );
  }
};