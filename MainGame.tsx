// /src/ui/pages/MainGame.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { D, Dec, ZERO } from "/src/math/dec.ts";
import { format } from "/src/format.ts";
import { BASE_GENERATORS } from "/src/data/generators.ts";
import {
  nextCost,
  upgradeCostFor,
  clickLevelMultiplier,
  clickTapMultiplier,
  clickUpgradeCost,
  geomSum,
  maxAffordableWithSum,
} from "/src/economy/upgrade.ts";

let PrestigePanel: React.ComponentType<any> | null = null;
try { PrestigePanel = (await import("/src/ui/components/PrestigePanel.tsx")).default; } catch {}

type GenState = { id: number; owned: number; upgradeLevel: number };

const VERSION = "0.1.8.9"; // d: 最大購入の負値/暴発を完全サニタイズ（withSum採用）

export default function MainGame() {
  const [mode, setMode] = useState<"eng" | "jp">("jp");
  const [points, setPoints] = useState<Dec>(ZERO);
  const [clickLv, setClickLv] = useState(0);
  const [generators, setGenerators] = useState<GenState[]>(
    BASE_GENERATORS.map((g) => ({ id: g.id, owned: 0, upgradeLevel: 0 }))
  );

  const [shards, setShards] = useState(ZERO);
  const [relics, setRelics] = useState(ZERO);
  const [essence, setEssence] = useState(ZERO);
  const [galaxy, setGalaxy] = useState(ZERO);
  const [eternity, setEternity] = useState(ZERO);

  // クリック
  const tapNow     = useMemo(() => clickTapMultiplier(clickLv),       [clickLv]);
  const tapNext    = useMemo(() => clickTapMultiplier(clickLv + 1),   [clickLv]);
  const globalNow  = useMemo(() => clickLevelMultiplier(clickLv),     [clickLv]);
  const globalNext = useMemo(() => clickLevelMultiplier(clickLv + 1), [clickLv]);

  const clickGainNow  = useMemo(() => D(1).times(tapNow).times(globalNow),   [tapNow, globalNow]);
  const clickGainNext = useMemo(() => D(1).times(tapNext).times(globalNext), [tapNext, globalNext]);

  const globalMult = globalNow;
  const clickGain  = clickGainNow;

  // 生産
  const baseProd = useMemo(() => {
    let base = D(0);
    for (const g of generators) {
      if (g.owned <= 0) continue;
      const def = BASE_GENERATORS[g.id];
      const a = D(1.1).pow(g.upgradeLevel | 0);
      const b = D(2 / 1.1).pow(Math.floor((g.upgradeLevel | 0) / 10));
      base = base.plus(D(def.baseProd).times(a).times(b).times(g.owned));
    }
    return base;
  }, [generators]);

  const prodPerSec = useMemo(
    () => baseProd.times(globalMult)
      .times(D(1).plus(shards))
      .times(D(1).plus(relics.div(10)))
      .times(D(1).plus(essence.div(100)))
      .times(D(1).plus(galaxy.div(1e3)))
      .times(D(1).plus(eternity.div(1e4))),
    [baseProd, globalMult, shards, relics, essence, galaxy, eternity]
  );

  // タイマー
  const prodRef = useRef<Dec>(ZERO);
  const lastRef = useRef<number>(Date.now());
  useEffect(() => { prodRef.current = prodPerSec; }, [prodPerSec]);
  useEffect(() => {
    lastRef.current = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(0.5, Math.max(0, (now - lastRef.current) / 1000));
      lastRef.current = now;
      if (dt > 0) setPoints((p) => D(p).plus(prodRef.current.times(dt)));
    }, 100);
    return () => clearInterval(id);
  }, []);

  // クリック強化
  const onClickUpgrade = () => {
    const cost = clickUpgradeCost(clickLv);
    if (D(points).lt(cost)) return;
    setPoints((p) => D(p).minus(cost));
    setClickLv((x) => x + 1);
  };

  // 購入/強化操作
  const buyMax = (id: number, n: number, sum: Dec) => {
    if (n <= 0 || sum.lte(ZERO)) return;
    setPoints((p) => D(p).minus(sum));
    setGenerators((gs) => gs.map((x) => (x.id === id ? { ...x, owned: x.owned + n } : x)));
  };
  const buyOne = (id: number, cost: Dec) => {
    if (D(points).lt(cost) || cost.lte(ZERO)) return;
    setPoints((p) => D(p).minus(cost));
    setGenerators((gs) => gs.map((x) => (x.id === id ? { ...x, owned: x.owned + 1 } : x)));
  };
  const upgradeMax = (id: number, n: number, sum: Dec) => {
    if (n <= 0 || sum.lte(ZERO)) return;
    setPoints((p) => D(p).minus(sum));
    setGenerators((gs) =>
      gs.map((x) => (x.id === id ? { ...x, upgradeLevel: x.upgradeLevel + n } : x))
    );
  };
  const upgradeOne = (id: number, cost: Dec) => {
    if (D(points).lt(cost) || cost.lte(ZERO)) return;
    setPoints((p) => D(p).minus(cost));
    setGenerators((gs) =>
      gs.map((x) => (x.id === id ? { ...x, upgradeLevel: x.upgradeLevel + 1 } : x))
    );
  };

  // 転生（簡易）
  const resetLower = () => {
    setPoints(ZERO); setClickLv(0);
    setGenerators(BASE_GENERATORS.map((g) => ({ id: g.id, owned: 0, upgradeLevel: 0 })));
  };
  const gainL1 = useMemo(() => { const t=D(points).div(1e6);  if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); }, [points]);
  const gainL2 = useMemo(() => { const t=D(shards).div(1e3);  if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); }, [shards]);
  const gainL3 = useMemo(() => { const t=D(relics).div(1e2);  if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); }, [relics]);
  const gainL4 = useMemo(() => { const t=D(essence).div(20); if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); }, [essence]);
  const gainL5 = useMemo(() => { const t=D(galaxy).div(10);  if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); }, [galaxy]);

  const doL1=()=>{ if(gainL1.lte(D(0)))return; setShards(s=>D(s).plus(gainL1)); resetLower(); };
  const doL2=()=>{ if(gainL2.lte(D(0)))return; setRelics(s=>D(s).plus(gainL2)); setShards(ZERO); resetLower(); };
  const doL3=()=>{ if(gainL3.lte(D(0)))return; setEssence(s=>D(s).plus(gainL3)); setRelics(ZERO); setShards(ZERO); resetLower(); };
  const doL4=()=>{ if(gainL4.lte(D(0)))return; setGalaxy(s=>D(s).plus(gainL4)); setEssence(ZERO); setRelics(ZERO); setShards(ZERO); resetLower(); };
  const doL5=()=>{ if(gainL5.lte(D(0)))return; setEternity(s=>D(s).plus(gainL5)); setGalaxy(ZERO); setEssence(ZERO); setRelics(ZERO); setShards(ZERO); resetLower(); };
  const hardReset=()=>{ if(!confirm("全データを初期化します。よろしいですか？")) return;
    setPoints(ZERO); setClickLv(0);
    setGenerators(BASE_GENERATORS.map(g=>({id:g.id,owned:0,upgradeLevel:0})));
    setShards(ZERO); setRelics(ZERO); setEssence(ZERO); setGalaxy(ZERO); setEternity(ZERO);
  };

  return (
    <div className="container grid">
      <div className="row">
        <h1>魔法少女インフレクリッカー <span className="muted">v{VERSION}</span></h1>
        <div className="right row">
          <span className="muted">表記</span>
          <select value={mode} onChange={(e)=>setMode(e.target.value as any)}>
            <option value="eng">Engineering</option>
            <option value="jp">日本式</option>
          </select>
        </div>
      </div>

      <div className="two-col">
        {/* left */}
        <div className="grid">
          <div className="card grid">
            <div>
              <div className="muted">魔力</div>
              <div style={{ fontSize: 34, fontWeight: 800 }} className="mono">{format(points, mode)}</div>
              <div className="muted">生成/秒: <span className="mono">{format(prodPerSec, mode)}</span></div>
            </div>
            <button onClick={()=>setPoints(p=>D(p).plus(clickGain))} className="btn-indigo">
              タップ: +{format(clickGain, mode)}
            </button>
            <div className="hr row" style={{ alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 800 }}>クリック強化 Lv {clickLv}</div>
                <div className="muted mono" style={{ fontSize: "0.98rem" }}>
                  タップ量: +{format(clickGainNow, mode)} → +{format(clickGainNext, mode)} / 回　
                  全体倍率: ×{format(globalNow, "eng")} → ×{format(globalNext, "eng")}
                </div>
              </div>
              <div className="right">
                <button onClick={onClickUpgrade} disabled={D(points).lt(clickUpgradeCost(clickLv))} className="btn-upg-one">
                  強化 +1（{format(clickUpgradeCost(clickLv), mode)}）
                </button>
              </div>
            </div>
          </div>

          <div className="card grid">
            <div className="muted">仲間（ジェネレーター）</div>
            <div className="gen-list">
              {generators.map((g) => {
                const def = BASE_GENERATORS[g.id];

                const cost1 = nextCost(def.baseCost, def.costScale, g.owned);
                const canBuy1 = D(points).gte(cost1);

                // 最大購入（安全版）
                const rBuy = D(def.costScale);
                const c0Buy = D(def.baseCost).times(rBuy.pow(g.owned));
                const buyInfo = maxAffordableWithSum(c0Buy, rBuy, points);
                const nBuy  = buyInfo.n;
                const sumBuy = buyInfo.sum;
                const canBuyMax = nBuy > 0 && sumBuy.gt(ZERO);

                // 強化 +1 / 最大強化（安全版）
                const up1Cost = upgradeCostFor(def, g.upgradeLevel);
                const canUp1 = D(points).gte(up1Cost);

                const rUp = D(1.45);
                const upInfo = maxAffordableWithSum(up1Cost, rUp, points);
                const nUp = upInfo.n;
                const sumUp = upInfo.sum;
                const canUpMax = nUp > 0 && sumUp.gt(ZERO);

                // 出力プレビュー
                const a  = D(1.1).pow(g.upgradeLevel | 0);
                const b  = D(2/1.1).pow(Math.floor((g.upgradeLevel | 0)/10));
                const unitNow  = D(def.baseProd).times(a).times(b).times(globalMult);

                const a1 = D(1.1).pow((g.upgradeLevel+1)|0);
                const b1 = D(2/1.1).pow(Math.floor(((g.upgradeLevel+1)|0)/10));
                const unitNext = D(def.baseProd).times(a1).times(b1).times(globalMult);

                const aM = D(1.1).pow((g.upgradeLevel+nUp)|0);
                const bM = D(2/1.1).pow(Math.floor(((g.upgradeLevel+nUp)|0)/10));
                const unitAfterMax = D(def.baseProd).times(aM).times(bM).times(globalMult);

                return (
                  <div key={g.id} className="gen-item">
                    <div className="gen-row">
                      <div>
                        <div className="gen-name">
                          {def.name} <span className="muted" style={{ fontWeight:600, fontSize: "0.92rem" }}>x{g.owned}</span>
                        </div>
                        <div className="muted mono gen-detail" style={{ fontSize: "0.98rem" }}>
                          単体強化: {format(unitNow, mode)} → {format(unitNext, mode)} /s
                        </div>
                        <div className="muted mono gen-detail" style={{ fontSize: "0.9rem", marginTop: 2 }}>
                          最大強化後: {format(unitNow, mode)} → {format(unitAfterMax, mode)} /s（×{nUp}）
                        </div>
                      </div>

                      <div className="gen-actions">
                        <button className="btn-buy-one"   disabled={!canBuy1}       onClick={()=>buyOne(g.id, cost1)}>購入 1（{format(cost1, mode)}）</button>
                        <button className="btn-buy-multi" disabled={!canBuyMax}     onClick={()=>buyMax(g.id, nBuy, sumBuy)}>最大購入 ×{nBuy}（{format(sumBuy, mode)}）</button>
                        <button className="btn-upg-one"   disabled={!canUp1}       onClick={()=>upgradeOne(g.id, up1Cost)}>強化 +1（{format(up1Cost, mode)}）</button>
                        <button className="btn-upg-multi" disabled={!canUpMax}     onClick={()=>upgradeMax(g.id, nUp, sumUp)}>最大強化 ×{nUp}（{format(sumUp, mode)}）</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* right */}
        <div className="grid">
          {PrestigePanel ? (
            <PrestigePanel
              mode={mode}
              shards={shards} relics={relics} essence={essence} galaxy={galaxy} eternity={eternity}
              gainL1={(() => { const t=D(points).div(1e6);  if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); })()}
              gainL2={(() => { const t=D(shards).div(1e3);  if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); })()}
              gainL3={(() => { const t=D(relics).div(1e2);  if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); })()}
              gainL4={(() => { const t=D(essence).div(20); if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); })()}
              gainL5={(() => { const t=D(galaxy).div(10);  if (t.lte(D(1))) return D(0); return D(Math.floor(Math.sqrt(t.toNumber()))); })()}
              onL1={()=>{}} onL2={()=>{}} onL3={()=>{}} onL4={()=>{}} onL5={()=>{}}
            />
          ) : (
            <div className="card">
              <b>変身（転生）</b>
              <div className="muted" style={{marginTop:8}}>PrestigePanel.tsx が見つからないため、簡易表示です。</div>
              <div className="row" style={{marginTop:10, gap:8, flexWrap:'wrap'}}>
                {/* 簡易ボタン */}
                <button className="btn-upg-one" onClick={()=>{ /* 省略 */ }}>WIP</button>
              </div>
            </div>
          )}

          <div className="card grid">
            <div className="row"><b>システム</b></div>
            <div className="row" style={{ gap: 8 }}>
              <button className="btn-gray" onClick={() => alert("保存は後で実装予定")}>保存</button>
              <button className="btn-gray" onClick={() => alert("読込は後で実装予定")}>読込</button>
              <div className="right" />
              <button className="btn-red" onClick={hardReset}>ハードリセット</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
