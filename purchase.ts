// v0.1.7.7 (bugfix): export purchase helpers (buyOne/buyMax/upgradeOne/upgradeMax)

import { D } from '/src/math/dec'
import { BASE_GENERATORS } from '/src/data/generators'
import { nextCost, upgradeCostFor } from '/src/economy/upgrade'

const ZERO = D(0)
const ONE  = D(1)

/** 等比購入の合計コスト S(n) = c0 * (r^n - 1)/(r - 1) */
function geomSum(c0: any, r: any, n: number) {
  if (n <= 0) return ZERO
  const C0 = D(c0)
  const R  = D(r)
  if (R.lte(ONE)) return C0.times(n) // 念のため
  return C0.times(R.pow(n).minus(ONE)).div(R.minus(ONE))
}

/** 予算 B で買える最大個数 n を解析式で求める（等比級数の逆算） */
function maxAffordable(c0: any, r: any, budget: any) {
  const B = D(budget)
  if (B.lte(ZERO)) return 0
  const C0 = D(c0)
  const R  = D(r)

  if (R.lte(ONE)) {
    // ほぼ使わないが安全策
    return Math.max(0, Math.floor(B.div(C0).toNumber()))
  }

  // n = floor( log_r( B*(r-1)/c0 + 1 ) )
  const num = B.times(R.minus(ONE)).div(C0).plus(ONE)
  if (num.lte(ONE)) return 0
  const n = Math.floor(num.log10() / R.log10())
  return Math.max(0, n)
}

/** 1個購入 */
export function buyOne(
  id: number,
  points: any,
  setPoints: (fn: (p: any) => any) => void,
  setGenerators: (fn: (gs: any[]) => any[]) => void
) {
  const def = BASE_GENERATORS[id]
  const cost = nextCost(def.baseCost, def.costScale, (gOwned(id, setGenerators) ?? 0))
  if (D(points).lt(cost)) return
  setPoints((p) => D(p).minus(cost))
  setGenerators((gs) => gs.map((x) => (x.id === id ? { ...x, owned: (x.owned ?? 0) + 1 } : x)))
}

/** 最大まとめ購入（現在の所持ポイントで買えるだけ） */
export function buyMax(
  id: number,
  points: any,
  setPoints: (fn: (p: any) => any) => void,
  setGenerators: (fn: (gs: any[]) => any[]) => void
) {
  const def = BASE_GENERATORS[id]
  // c0 = base * scale^owned
  const owned = gOwned(id, setGenerators) ?? 0
  const r = D(def.costScale)
  const c0 = D(def.baseCost).times(r.pow(owned))
  const n = maxAffordable(c0, r, points)
  if (n <= 0) return
  const sum = geomSum(c0, r, n)
  setPoints((p) => D(p).minus(sum))
  setGenerators((gs) => gs.map((x) => (x.id === id ? { ...x, owned: (x.owned ?? 0) + n } : x)))
}

/** 強化を1回 */
export function upgradeOne(
  id: number,
  points: any,
  setPoints: (fn: (p: any) => any) => void,
  setGenerators: (fn: (gs: any[]) => any[]) => void
) {
  const { upLv, cost } = upgradeCostState(id, setGenerators)
  if (D(points).lt(cost)) return
  setPoints((p) => D(p).minus(cost))
  setGenerators((gs) => gs.map((x) => (x.id === id ? { ...x, upgradeLevel: (x.upgradeLevel ?? 0) + 1 } : x)))
}

/** 強化を最大まで（所持ポイントで可能な限り） */
export function upgradeMax(
  id: number,
  points: any,
  setPoints: (fn: (p: any) => any) => void,
  setGenerators: (fn: (gs: any[]) => any[]) => void
) {
  const def = BASE_GENERATORS[id]
  const curr = gUpLv(id, setGenerators) ?? 0
  const r = D(1.45)
  const c0 = upgradeCostFor(def, curr) // = base*2*1.45^upLv
  const n = maxAffordable(c0, r, points)
  if (n <= 0) return
  const sum = geomSum(c0, r, n)
  setPoints((p) => D(p).minus(sum))
  setGenerators((gs) => gs.map((x) => (x.id === id ? { ...x, upgradeLevel: (x.upgradeLevel ?? 0) + n } : x)))
}

/* ===== 内部ユーティリティ ===== */

/** 現在 owned を取得（setState のクロージャに依存せず安全に読む） */
function gOwned(id: number, setGenerators: (fn: (gs: any[]) => any[]) => void): number {
  let val = 0
  setGenerators((gs: any[]) => {
    const g = gs.find((x) => x.id === id)
    val = g ? (g.owned ?? 0) : 0
    return gs // 読み取りのみ
  })
  return val
}

/** 現在 upgradeLevel を取得 */
function gUpLv(id: number, setGenerators: (fn: (gs: any[]) => any[]) => void): number {
  let val = 0
  setGenerators((gs: any[]) => {
    const g = gs.find((x) => x.id === id)
    val = g ? (g.upgradeLevel ?? 0) : 0
    return gs
  })
  return val
}

/** 強化の現在コストを取得 */
function upgradeCostState(id: number, setGenerators: (fn: (gs: any[]) => any[]) => void) {
  const def = BASE_GENERATORS[id]
  const upLv = gUpLv(id, setGenerators) ?? 0
  const cost = upgradeCostFor(def, upLv)
  return { upLv, cost }
}
