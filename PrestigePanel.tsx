import React from 'react'
import { D, Dec } from '/src/math/dec.ts'
import { format } from '/src/format.ts'

type Mode = 'eng'|'jp'

type Props = {
  mode: Mode
  // 所持
  shards: Dec; relics: Dec; essence: Dec; galaxy: Dec; eternity: Dec
  // 獲得見込み
  gainL1: Dec; gainL2: Dec; gainL3: Dec; gainL4: Dec; gainL5: Dec
  // 実行
  onL1: ()=>void; onL2: ()=>void; onL3: ()=>void; onL4: ()=>void; onL5: ()=>void
}

export default function PrestigePanel(p: Props){
  const rows: {label:string, have:Dec, gain:Dec, on:()=>void}[] = [
    { label: 'L1 ピュアハート', have: p.shards,  gain: p.gainL1, on: p.onL1 },
    { label: 'L2 魔装',         have: p.relics,  gain: p.gainL2, on: p.onL2 },
    { label: 'L3 霊素',         have: p.essence, gain: p.gainL3, on: p.onL3 },
    { label: 'L4 星霊',         have: p.galaxy,  gain: p.gainL4, on: p.onL4 },
    { label: 'L5 永輝',         have: p.eternity,gain: p.gainL5, on: p.onL5 },
  ]

  return (
    <div className="card grid">
      <div className="row"><b>変身（転生）</b></div>

      {/* 所持サマリ */}
      <div className="grid" style={{gap:8}}>
        <div className="row" style={{justifyContent:'space-between'}}>
          <span className="muted">所持:</span>
          <span className="mono">
            💗 {format(p.shards,p.mode)} / 🛡 {format(p.relics,p.mode)} / ✨ {format(p.essence,p.mode)} / 🌌 {format(p.galaxy,p.mode)} / ♾ {format(p.eternity,p.mode)}
          </span>
        </div>
      </div>

      {/* 各レイヤー */}
      <div className="grid" style={{gap:10}}>
        {rows.map((r, i)=> {
          const can = D(r.gain).gt(D(0))
          return (
            <div key={i} className="gen-row">
              <div>
                <div><b>{r.label}</b></div>
                <div className="muted mono">獲得見込み: +{format(r.gain, p.mode)}</div>
              </div>
              <div className="gen-actions" style={{gridTemplateColumns:'minmax(140px,1fr)'}}>
                <button
                  className="btn-amber"
                  disabled={!can}
                  onClick={r.on}
                  title={can ? '実行して下位をリセット' : '条件未達'}>
                  変身する（+{format(r.gain,p.mode)}）
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
