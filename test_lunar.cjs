const { Solar, Lunar } = require('lunar-javascript');

const solar = Solar.fromYmd(2024, 2, 17);
const lunar = solar.getLunar();

console.log('YearInGanZhi:', lunar.getYearInGanZhi());
console.log('MonthInGanZhi:', lunar.getMonthInGanZhi());
console.log('DayInGanZhi:', lunar.getDayInGanZhi());
console.log('DayZhi:', lunar.getDayZhi());
console.log('TimeZhi:', lunar.getTimeZhi());
