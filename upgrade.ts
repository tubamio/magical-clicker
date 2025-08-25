// v0.1.6.2 (stable): maxAffordable キャップ100 + 誤差補正
import { D } from '/src/math/dec'

const ONE = D(1)

/** 次回購入コスト: base * scale^owned */
export function nextCost(base: number, scale: number, owned: number) {
  return D(base).times(D(scale).pow(owned || 0))
}

/** 強化1回あたりのコスト: base*2 * 1.45^lv */
export function upgradeCostFor(def: { baseCost: number }, lv: number) {
  return D(def.baseCost).times(2).times(D(1.45).pow(lv || 0))
}

/** 強化を n 回まとめて行う合計コスト（等比級数の和） */
export function bulkUpgradeCost(def: { baseCost: number }, lv: number, n: number) {
  const r = D(1.45)
  const c0 = upgradeCostFor(def, lv)
  if (n <= 0) return D(0)
  // S(n) = c0 * (r^n - 1) / (r - 1)
  return c0.times(r.pow(n).minus(ONE)).div(r.minus(ONE))
}

/** クリック強化の全体倍率（Lvごと ×1.03） */
export function clickLevelMultiplier(lv: number) {
  return D(1.03).pow(lv || 0)
}

/** タップ（クリック）1回の基礎上昇量（Lvごと ×4） */
export function clickTapMultiplier(lv: number) {
  return D(4).pow(lv || 0)
}

/** クリック強化コスト（初期125 → 単調増加） */
export function clickUpgradeCost(lv: number) {
  // 初期125からスタート → 125 * 5^lv
  return D(125).times(D(5).pow(lv || 0))
}

/**
 * 最大まとめ購入数（キャップ100、二分探索方式 + 誤差補正）
 * owned: 現在の所有数
 * baseCost: 基本コスト
 * costScale: コスト倍率
 * budget: 手持ち通貨
 */
export function maxAffordable(owned: number, baseCost: any, costScale: any, budget: any): number {
  if (budget.lte(0)) return 0

  const c0 = D(baseCost).times(D(costScale).pow(owned || 0))
  let low = 0
  let high = 100 // キャップ
  let best = 0

  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (mid === 0) {
      low = 1
      continue
    }
    const sum = c0.times(D(costScale).pow(mid).minus(ONE)).div(D(costScale).minus(ONE))
    if (sum.lte(budget)) {
      best = mid
      low = mid + 1
    } else {
      high = mid - 1
    }
  }

  // 誤差補正: sum(best) が budget を超えてないか最終チェック
  while (best > 0) {
    const sum = c0.times(D(costScale).pow(best).minus(ONE)).div(D(costScale).minus(ONE))
    if (sum.lte(budget)) break
    best--
  }

  return best
}
