export const JOB_GROUPS = [
  {
    id: 'magic',
    name: '魔法少女系',
    jobs: [
      { id:'starlight', name:'スターライト魔法少女', tap:1.5, gen:1.5, prestige:1.5, desc:'星の輝きで全て1.5倍',       point:'時間片', req:1 },
      { id:'prism',     name:'プリズム魔法少女',     tap:1.6, gen:1.6, prestige:1.6, desc:'プリズムの力で全て1.6倍',   point:'時間片', req:10 },
      { id:'astral',    name:'アストラル魔法少女',   tap:1.7, gen:1.7, prestige:1.7, desc:'星界の魔力で全て1.7倍',     point:'時間片', req:100 },
      { id:'chronos',   name:'クロノス魔法少女',     tap:1.8, gen:1.8, prestige:1.8, desc:'時間魔法で全て1.8倍',       point:'時間片', req:1000 },
      { id:'cosmic',    name:'コズミック魔法少女',   tap:1.9, gen:1.9, prestige:1.9, desc:'宇宙の真理で全て1.9倍',     point:'時間片', req:10000 },
    ],
  },
  {
    id: 'maid',
    name: 'メイド系',
    jobs: [
      { id:'maid',        name:'メイド',     tap:1,   gen:2,   prestige:1,   desc:'ユニット性能に特化しPPS2倍',          point:'賢者石片', req:2 },
      { id:'headmaid',    name:'メイド長',   tap:1.1, gen:2.5, prestige:1,   desc:'指揮でPPS2.5倍',                        point:'賢者石片', req:20 },
      { id:'royalmaid',   name:'宮廷メイド', tap:1.2, gen:3,   prestige:1.1, desc:'宮廷仕込みでPPS3倍',                    point:'賢者石片', req:200 },
      { id:'alchemymaid', name:'錬金メイド', tap:1.3, gen:3.5, prestige:1.2, desc:'錬金術でPPS3.5倍',                      point:'賢者石片', req:2000 },
      { id:'alchemist',   name:'アルケミスト', tap:1.4, gen:4,   prestige:1.3, desc:'錬金術でPPS4倍',                          point:'賢者石片', req:20000 },
    ],
  },
  {
    id: 'angel',
    name: '天使系',
    jobs: [
      { id:'angel',     name:'天使',     tap:1,   gen:1,   prestige:2,   desc:'覚醒スタークリスタル獲得2倍',            point:'天啓', req:5 },
      { id:'archangel', name:'大天使',   tap:1.1, gen:1.1, prestige:2.5, desc:'更なる加護で2.5倍',                      point:'天啓', req:50 },
      { id:'throne',    name:'座天使',   tap:1.2, gen:1.2, prestige:3,   desc:'神の座に仕える',                          point:'天啓', req:500 },
      { id:'dominion',  name:'主天使',   tap:1.3, gen:1.3, prestige:3.5, desc:'支配を司る',                              point:'天啓', req:5000 },
      { id:'seraph',    name:'熾天使',   tap:1.4, gen:1.4, prestige:4,   desc:'天界の加護で覚醒スタークリスタル獲得4倍', point:'天啓', req:50000 },
    ],
  },
  {
    id: 'idol',
    name: 'アイドル系',
    jobs: [
      { id:'idol',       name:'アイドル',     tap:2,   gen:1.1, prestige:1,   desc:'ライブの熱気でタップ2倍',                point:'スターオーラ', req:3 },
      { id:'popstar',    name:'人気アイドル', tap:2.5, gen:1.2, prestige:1.1, desc:'カリスマでタップ2.5倍',                  point:'スターオーラ', req:30 },
      { id:'superstar',  name:'スーパースター', tap:3,   gen:1.3, prestige:1.2, desc:'スターの輝きでタップ3倍',                point:'スターオーラ', req:300 },
      { id:'galaxyidol', name:'銀河アイドル', tap:3.5, gen:1.4, prestige:1.3, desc:'銀河ライブでタップ3.5倍',                point:'スターオーラ', req:3000 },
      { id:'diva',       name:'次元アイドル', tap:4,   gen:1.5, prestige:1.4, desc:'次元を超えた人気でタップ4倍',            point:'スターオーラ', req:30000 },
    ],
  },
];

export const JOBS = [
  { id:'magical', name:'魔法少女', tap:1, gen:1, prestige:1, desc:'まだ何の力も持たない魔法少女', point:'なし' },
  ...JOB_GROUPS.flatMap(g => g.jobs),
];

export const JOB_MAP = Object.fromEntries(JOBS.map(j => [j.id, j]));

export function getJobBonuses(id){
  const j = JOB_MAP[id];
  return j ? { tap:j.tap, gen:j.gen, prestige:j.prestige } : { tap:1, gen:1, prestige:1 };
}
