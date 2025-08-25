// Click-upgrade logic
export const CLICK = {
  baseClick: 1,    // 基礎獲得
  clickMul:  1.20, // レベル毎倍率
  baseCost:  150,  // 初期費用
  costMul:   1.25, // 費用倍率
};

export function clickGainByLevel(lv){
  return CLICK.baseClick * Math.pow(CLICK.clickMul, lv);
}
export function clickNextDelta(lv){
  const now = clickGainByLevel(lv);
  const next = clickGainByLevel(lv+1);
  return next - now;
}
export function clickNextCost(lv){
  return CLICK.baseCost * Math.pow(CLICK.costMul, lv);
}
