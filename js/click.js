// クリック強化仕様：タップ威力 = base * 4^Lv、全体倍率 = 1.03^Lv
// コスト：125 * 5^Lv
export const CLICK = {
  baseClick: 1,
};

export function clickGainByLevel(lv){
  return CLICK.baseClick * Math.pow(4, lv);
}
export function globalMultiplier(lv){
  return Math.pow(1.03, lv);
}
export function clickNextCost(lv){
  return 125 * Math.pow(5, lv);
}
export function clickNextDelta(lv){
  return clickGainByLevel(lv+1) - clickGainByLevel(lv);
}

export function clickTotalCost(lv, n){
  if (n <= 0) return 0;
  const c0 = clickNextCost(lv);
  const r = 5;
  return c0 * (Math.pow(r, n) - 1) / (r - 1);
}
