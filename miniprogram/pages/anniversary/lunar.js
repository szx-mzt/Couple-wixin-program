// lunar.js
// 简易农历转公历，仅支持2026年（如需多年份请更换库）
// 这里只做静态映射演示，实际建议用 npm lunar-javascript 或 wx-lunar

const lunarToSolar2026 = {
  // 2026年农历7月16 对应阳历 2026-08-29
  '7-16': '2026-08-29',
  // 2026年农历6月24 对应阳历 2026-07-28
  '6-24': '2026-07-28'
};

function getSolarDate(lunarMonth, lunarDay) {
  return lunarToSolar2026[`${lunarMonth}-${lunarDay}`] || '';
}

module.exports = {
  getSolarDate
};
