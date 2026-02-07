// メイドスマイル強化仕様：タップ威力 = base * 3^Lv、全体倍率 = 1.015^Lv
// コスト：150 * 6^Lv
export const CLICK = {
  baseClick: new Decimal(0.5),
};

export function clickGainByLevel(lv){
  return CLICK.baseClick.times(Decimal.pow(3, lv));
}
export function globalMultiplier(lv){
  return Decimal.pow(1.015, lv);
}
export function clickNextCost(lv){
  return new Decimal(150).times(Decimal.pow(6, lv));
}
export function clickNextDelta(lv){
  return clickGainByLevel(lv+1).minus(clickGainByLevel(lv));
}

export function clickTotalCost(lv, n){
  if (n <= 0) return new Decimal(0);
  let total = new Decimal(0);
  let cost = clickNextCost(lv);
  for(let i=0;i<n;i++){
    total = total.plus(cost);
    cost = cost.times(6);
  }
  return total;
}

export function maxAffordableClicks(lv, budget){
  budget = new Decimal(budget);
  let n = 0;
  let cost = clickNextCost(lv);
  while (budget.gte(cost) && n < 1e6){
    budget = budget.minus(cost);
    n++;
    cost = cost.times(6);
  }
  return n;
}
