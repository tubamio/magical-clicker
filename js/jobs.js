export const JOB_GROUPS = [
  {
    id: 'magic',
    name: '魔法少女系',
    jobs: [
      { id:'kirameki', name:'きらめき魔法少女', tap:1e2, gen:1e2, prestige:10, pointGain:10, desc:'全性能100倍', point:'魔導水晶', req:3e5, reqType:'power' },
      { id:'sugarwitch', name:'シュガーウィッチ', tap:1e4, gen:1e4, prestige:1e2, pointGain:1e2, desc:'全性能1万倍', point:'魔導水晶', req:100, reqType:'point' },
      { id:'lunamage', name:'ルナメイジ', tap:1e6, gen:1e6, prestige:1e3, pointGain:1e3, desc:'全性能100万倍', point:'魔導水晶', req:1e4, reqType:'point' },
      { id:'whitesorceress', name:'ホワイトソーサレス', tap:1e8, gen:1e8, prestige:1e4, pointGain:1e4, desc:'全性能1億倍', point:'魔導水晶', req:1e6, reqType:'point' },
      { id:'mysticsaber', name:'ミスティックセイバー', tap:1e10, gen:1e10, prestige:1e6, pointGain:1e6, desc:'全性能100億倍', point:'魔導水晶', req:1e8, reqType:'point' },
    ],
  },
  {
    id: 'maid',
    name: 'メイド系',
    jobs: [
      { id:'lilymaid', name:'リリィメイド', tap:20, gen:2e2, prestige:10, pointGain:10, desc:'ジェネ特化200倍', point:'メイドバッジ', req:3e5, reqType:'power' },
      { id:'sweethouse', name:'スイートハウスメイド', tap:50, gen:2e4, prestige:1e2, pointGain:1e2, desc:'ジェネ特化2万倍', point:'メイドバッジ', req:100, reqType:'point' },
      { id:'elegantparlor', name:'エレガントパーラーメイド', tap:1e2, gen:2e6, prestige:1e3, pointGain:1e3, desc:'ジェネ特化200万倍', point:'メイドバッジ', req:1e4, reqType:'point' },
      { id:'graceladies', name:'グレイスレディズメイド', tap:2e2, gen:2e8, prestige:1e4, pointGain:1e4, desc:'ジェネ特化2億倍', point:'メイドバッジ', req:1e6, reqType:'point' },
      { id:'royalchief', name:'ロイヤルチーフメイド', tap:5e2, gen:2e10, prestige:1e6, pointGain:1e6, desc:'ジェネ特化200億倍', point:'メイドバッジ', req:1e8, reqType:'point' },
    ],
  },
  {
    id: 'angel',
    name: '天使系',
    jobs: [
      { id:'feathergirl', name:'フェザーガール', tap:20, gen:20, prestige:1e2, pointGain:10, desc:'覚醒効率100倍', point:'聖羽', req:3e5, reqType:'power' },
      { id:'breezeangel', name:'ブリーズエンジェル', tap:80, gen:80, prestige:1e4, pointGain:1e2, desc:'覚醒効率1万倍', point:'聖羽', req:100, reqType:'point' },
      { id:'wingmaiden', name:'ウィングメイデン', tap:2e2, gen:2e2, prestige:1e6, pointGain:1e3, desc:'覚醒効率100万倍', point:'聖羽', req:1e4, reqType:'point' },
      { id:'celestiamuse', name:'セレスティアミューズ', tap:5e2, gen:5e2, prestige:1e8, pointGain:1e4, desc:'覚醒効率1億倍', point:'聖羽', req:1e6, reqType:'point' },
      { id:'luminusseraphy', name:'ルミナスセラフィー', tap:1e3, gen:1e3, prestige:1e10, pointGain:1e6, desc:'覚醒効率100億倍', point:'聖羽', req:1e8, reqType:'point' },
    ],
  },
  {
    id: 'idol',
    name: 'アイドル系',
    jobs: [
      { id:'kyunidol', name:'きゅんきゅんアイドル', tap:2e2, gen:20, prestige:10, pointGain:10, desc:'タップ200倍', point:'ファンレター', req:3e5, reqType:'power' },
      { id:'melodysinger', name:'メロディシンガー', tap:2e4, gen:50, prestige:1e2, pointGain:1e2, desc:'タップ2万倍', point:'ファンレター', req:100, reqType:'point' },
      { id:'stagecinderella', name:'ステージシンデレラ', tap:2e6, gen:1e2, prestige:1e3, pointGain:1e3, desc:'タップ200万倍', point:'ファンレター', req:1e4, reqType:'point' },
      { id:'shinystar', name:'シャイニースター', tap:2e8, gen:2e2, prestige:1e4, pointGain:1e4, desc:'タップ2億倍', point:'ファンレター', req:1e6, reqType:'point' },
      { id:'gloriousdiva', name:'グロリアスディーヴァ', tap:2e10, gen:5e2, prestige:1e6, pointGain:1e6, desc:'タップ200億倍', point:'ファンレター', req:1e8, reqType:'point' },
    ],
  },
  {
    id: 'reaper',
    name: '死神系',
    jobs: [
      { id:'littlereaper', name:'リトルリーパー', tap:1e2, gen:1e2, prestige:1e2, cooldown:0.8, pointGain:10, desc:'全性能100倍+CT20%短縮', point:'冥刻の砂', req:3e5, reqType:'power' },
      { id:'blacksavant', name:'ブラックサーヴァント', tap:1e4, gen:1e4, prestige:1e4, cooldown:0.6, pointGain:1e2, desc:'全性能1万倍+CT40%短縮', point:'冥刻の砂', req:100, reqType:'point' },
      { id:'gothicsister', name:'ゴシックシスター', tap:1e6, gen:1e6, prestige:1e6, cooldown:0.45, pointGain:1e3, desc:'全性能100万倍+CT55%短縮', point:'冥刻の砂', req:1e4, reqType:'point' },
      { id:'souljudgementer', name:'ソウルジャッジメンター', tap:1e8, gen:1e8, prestige:1e8, cooldown:0.3, pointGain:1e4, desc:'全性能1億倍+CT70%短縮', point:'冥刻の砂', req:1e6, reqType:'point' },
      { id:'deathofnocturne', name:'デスオブノクターン', tap:1e10, gen:1e10, prestige:1e10, cooldown:0.15, pointGain:1e6, desc:'全性能100億倍+CT85%短縮', point:'冥刻の砂', req:1e8, reqType:'point' },
    ],
  },
  {
    id: 'scholar',
    name: '学者系',
    jobs: [
      { id:'booklover', name:'ブックラバー', tap:20, gen:1e2, prestige:1e2, upgCost:0.5, pointGain:10, desc:'強化コスト50%減', point:'研究資料', req:3e5, reqType:'power' },
      { id:'wonderresearcher', name:'ワンダーリサーチャー', tap:80, gen:1e4, prestige:1e4, upgCost:0.2, pointGain:1e2, desc:'強化コスト80%減', point:'研究資料', req:100, reqType:'point' },
      { id:'nobleprofessor', name:'ノーブルプロフェッサー', tap:2e2, gen:1e6, prestige:1e6, upgCost:0.05, pointGain:1e3, desc:'強化コスト95%減', point:'研究資料', req:1e4, reqType:'point' },
      { id:'ancientsage', name:'エンシェントセージ', tap:5e2, gen:1e8, prestige:1e8, upgCost:0.01, pointGain:1e4, desc:'強化コスト99%減', point:'研究資料', req:1e6, reqType:'point' },
      { id:'metatron', name:'メタトロン＝アルカナ', tap:1e3, gen:1e10, prestige:1e10, upgCost:0.001, pointGain:1e6, desc:'強化コスト99.9%減', point:'研究資料', req:1e8, reqType:'point' },
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
  return j
    ? { tap:j.tap, gen:j.gen, prestige:j.prestige, pointGain:j.pointGain||1, upgCost:j.upgCost||1, cooldown:j.cooldown||1 }
    : { tap:1, gen:1, prestige:1, pointGain:1, upgCost:1, cooldown:1 };
}
