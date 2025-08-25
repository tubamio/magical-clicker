// 初期ジェネレーター定義（あとで自由に増やせる）
export const GENERATORS = [
  { id:'hand', name:'手動クリック', baseCost: 10,  costMul: 1.15, basePps: 0, clickGain: 1 },
  { id:'cursor', name:'カーソル',     baseCost: 15,  costMul: 1.15, basePps: 0.1 },
  { id:'bot',    name:'ボット',       baseCost: 100, costMul: 1.17, basePps: 1   },
  { id:'lab',    name:'研究所',       baseCost: 1200,costMul: 1.20, basePps: 12  },
];
