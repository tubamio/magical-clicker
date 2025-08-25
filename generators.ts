export type GenDef = { id:number; name:string; baseCost:number; costScale:number; baseProd:number }

export const BASE_GENERATORS: GenDef[] = [
  { id:0, name:'見習いの杖',        baseCost:10,         costScale:1.15, baseProd:1 },
  { id:1, name:'使い魔オーブ',      baseCost:120,        costScale:1.16, baseProd:12 },
  { id:2, name:'星屑蒸留器',        baseCost:1_800,      costScale:1.14, baseProd:160 },

  // ここから間隔を少し戻す（出力は強めのまま）
  { id:3, name:'月光レンズ',        baseCost:28_000,     costScale:1.165, baseProd:2_400 },
  { id:4, name:'虹色ルーン炉',      baseCost:520_000,    costScale:1.18,  baseProd:36_000 },
  { id:5, name:'時空リボン織機',    baseCost:10_000_000, costScale:1.19,  baseProd:540_000 },
  { id:6, name:'夢結晶プリズム',    baseCost:220_000_000,costScale:1.20,  baseProd:8_100_000 },
  { id:7, name:'宇宙魔方陣',        baseCost:5_000_000_000, costScale:1.205, baseProd:120_000_000 },
  { id:8, name:'概念詠唱核',        baseCost:120_000_000_000, costScale:1.21,  baseProd:1_800_000_000 },
]
