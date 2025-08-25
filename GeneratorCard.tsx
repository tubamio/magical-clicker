import { format } from '@/format'
import { D } from '@/math/dec'
import type { GenDef } from '@/data/generators'
import { maxAffordable, nextCost, sumCostN } from '@/economy/purchase'
import { upgradeCostFor, sumUpgradeCostN, upgradeMultiplier } from '@/economy/upgrade'

type Props = {
  def: GenDef
  owned: number
  upLv: number
  mode: 'eng'|'jp'
  points: any
  clickLv: number
  onBuy: (n:number)=>void
  onUpgrade: (n:number)=>void
}

export default function GeneratorCard(p:Props){
  const cost1 = nextCost(p.def.baseCost, p.def.costScale, p.owned)
  const canBuy1 = D(p.points).gte(cost1)
  const nBuy = maxAffordable(p.def.baseCost, p.def.costScale, p.owned, p.points)
  const bulkBuyCost = sumCostN(p.def.baseCost, p.def.costScale, p.owned, nBuy)

  const costUp1 = upgradeCostFor(p.def, p.upLv)
  const canUp1 = D(p.points).gte(costUp1)
  const nUp = (() => {
    let lo = 0, hi = 1
    while (true) {
      const s = sumUpgradeCostN(p.def, p.upLv, hi)
      if (s.gt(p.points)) break
      hi *= 2; if (hi > 1e9) break
    }
    while (lo < hi) {
      const mid = Math.floor((lo + hi + 1) / 2)
      const s = sumUpgradeCostN(p.def, p.upLv, mid)
      if (s.lte(p.points)) lo = mid; else hi = mid - 1
    }
    return lo
  })()
  const bulkUpCost = sumUpgradeCostN(p.def, p.upLv, nUp)

  const unitNow    = D(p.def.baseProd).times(upgradeMultiplier(p.upLv))
  const unitAfter1 = D(p.def.baseProd).times(upgradeMultiplier(p.upLv + 1))
  const unitAfterN = D(p.def.baseProd).times(upgradeMultiplier(p.upLv + Math.max(1,nUp)))

  return (
    <div className="card">
      <div className="row">
        <div style={{ minWidth: 200 }}>
          <b>{p.def.name}</b> <span className="muted">x{p.owned}</span>
          <div className="muted" style={{ marginTop: 4 }}>強化Lv {p.upLv}（10毎に×2.0）</div>
        </div>
        <div className="right" style={{ display:'grid', gridTemplateColumns:'180px 220px', gap:10 }}>
          <button disabled={!canBuy1} onClick={()=>p.onBuy(1)} className="btn-primary">購入 ×1（{format(cost1,p.mode)}）</button>
          <button disabled={nBuy<=0} onClick={()=>p.onBuy(nBuy)} className="btn-secondary">最大×{nBuy}（{format(bulkBuyCost,p.mode)}）</button>
        </div>
      </div>

      <div className="row hr" style={{ alignItems:'start' }}>
        <div className="muted" style={{ lineHeight:1.5 }}>
          単体生産: {format(unitNow,p.mode)} /s<br/>
          → +1後 {format(unitAfter1,p.mode)} /s<br/>
          → +最大後 {format(unitAfterN,p.mode)} /s
        </div>
        <div className="right" style={{ display:'grid', gridTemplateColumns:'180px 220px', gap:10 }}>
          <button disabled={!canUp1} onClick={()=>p.onUpgrade(1)} className="btn-upg">強化 +1（{format(costUp1,p.mode)}）</button>
          <button disabled={nUp<=0} onClick={()=>p.onUpgrade(Math.max(1,nUp))} className="btn-upg">最大×{Math.max(1,nUp)}（{format(nUp>0?bulkUpCost:costUp1,p.mode)}）</button>
        </div>
      </div>
    </div>
  )
}
