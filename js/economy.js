const D = (x)=> new Decimal(x);

export const DEFAULTS = {
  g1:{ basePps:D(0.18),   baseCost:D(12),   costMul:D(1.14), upBaseCost:D(50),   upCostMul:D(1.16) },
  g2:{ basePps:D(1.80),   baseCost:D(80),   costMul:D(1.16), upBaseCost:D(250),  upCostMul:D(1.17) },
  g3:{ basePps:D(14.4),   baseCost:D(700),  costMul:D(1.17), upBaseCost:D(1000), upCostMul:D(1.18) },
  g4:{ basePps:D(115.2),  baseCost:D(5400), costMul:D(1.19), upBaseCost:D(4000), upCostMul:D(1.19) },
  g5:{ basePps:D(936.0),  baseCost:D(4.0e4),costMul:D(1.20), upBaseCost:D(1.7e4),upCostMul:D(1.20) },
  g6:{ basePps:D(7560),   baseCost:D(3.0e5),costMul:D(1.21), upBaseCost:D(8.0e4),upCostMul:D(1.21) },
  g7:{ basePps:D(6.12e4), baseCost:D(2.2e6),costMul:D(1.22), upBaseCost:D(3.7e5),upCostMul:D(1.22) },
  g8:{ basePps:D(4.86e5), baseCost:D(1.7e7),costMul:D(1.23), upBaseCost:D(1.7e6),upCostMul:D(1.23) },
  g9:{ basePps:D(3.78e6), baseCost:D(1.2e8),costMul:D(1.24), upBaseCost:D(7.5e6),upCostMul:D(1.24) },
};

function ensureParams(gen){
  const d = DEFAULTS[gen.id] || DEFAULTS.g1;
  if (gen.level == null)      gen.level = 0;
  if (gen.basePps == null)    gen.basePps = d.basePps; else gen.basePps = new Decimal(gen.basePps);
  if (gen.baseCost == null)   gen.baseCost = d.baseCost; else gen.baseCost = new Decimal(gen.baseCost);
  if (gen.costMul == null)    gen.costMul = d.costMul; else gen.costMul = new Decimal(gen.costMul);
  if (gen.upBaseCost == null) gen.upBaseCost = d.upBaseCost; else gen.upBaseCost = new Decimal(gen.upBaseCost);
  if (gen.upCostMul == null)  gen.upCostMul = d.upCostMul; else gen.upCostMul = new Decimal(gen.upCostMul);
  return gen;
}

export function powerFor(gen){
  ensureParams(gen);
  const lv = gen.level|0;
  const linear = Decimal.pow(1.10, lv);
  const step   = Decimal.pow(2, Math.floor(lv/10));
  return gen.basePps.times(linear).times(step);
}

export function totalPps(state){
  let p = new Decimal(0);
  for (const g of state.gens){
    ensureParams(g);
    p = p.plus(new Decimal(g.count|0).times(powerFor(g)));
  }
  return p;
}

export function nextUnitCost(gen){
  ensureParams(gen);
  return gen.baseCost.times(Decimal.pow(gen.costMul, gen.count|0));
}

export function totalCostUnits(gen, n){
  ensureParams(gen);
  let total = new Decimal(0);
  let cost = nextUnitCost(gen);
  for(let i=0;i<n;i++){
    total = total.plus(cost);
    cost = cost.times(gen.costMul);
  }
  return total;
}

export function maxAffordableUnits(gen, budget){
  ensureParams(gen);
  let n=0;
  let cost = nextUnitCost(gen);
  let total = new Decimal(0);
  while (budget.gte(total.plus(cost))){
    total = total.plus(cost);
    n++;
    cost = cost.times(gen.costMul);
    if (n>1e6) break;
  }
  return n;
}

export function buyUnits(state, id, mode='1'){
  const g = state.gens.find(x=>x.id===id);
  if (!g) return false;
  ensureParams(g);
  let n = (mode==='max') ? maxAffordableUnits(g, state.power) : 1;
  if (n <= 0) return false;
  const cost = totalCostUnits(g, n);
  if (state.power.lt(cost)) return false;
  state.power = state.power.minus(cost);
  g.count = (g.count|0) + n;
  return true;
}

export function nextUpgradeCost(gen){
  ensureParams(gen);
  return gen.upBaseCost.times(Decimal.pow(gen.upCostMul, gen.level|0));
}

export function totalCostUpgrades(gen, n){
  ensureParams(gen);
  let total = new Decimal(0);
  let cost = nextUpgradeCost(gen);
  for(let i=0;i<n;i++){
    total = total.plus(cost);
    cost = cost.times(gen.upCostMul);
  }
  return total;
}

export function maxAffordableUpgrades(gen, budget){
  ensureParams(gen);
  if ((gen.count|0) <= 0) return 0;
  let n=0;
  let cost = nextUpgradeCost(gen);
  let total = new Decimal(0);
  while (budget.gte(total.plus(cost))){
    total = total.plus(cost);
    n++;
    cost = cost.times(gen.upCostMul);
    if (n>1e6) break;
  }
  return n;
}

export function upgrade(state, id, mode='1'){
  const g = state.gens.find(x=>x.id===id);
  if (!g) return false;
  ensureParams(g);
  if ((g.count|0) <= 0) return false;
  let n = (mode==='max') ? maxAffordableUpgrades(g, state.power) : 1;
  if (n <= 0) return false;
  const cost = totalCostUpgrades(g, n);
  if (state.power.lt(cost)) return false;
  state.power = state.power.minus(cost);
  g.level = (g.level|0) + n;
  return true;
}

