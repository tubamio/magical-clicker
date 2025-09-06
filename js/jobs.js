export const JOB_GROUPS = [
  {
    id: 'magic',
    name: '魔法少女系',
    jobs: [
      { id:'kirameki',       name:'きらめき魔法少女', tap:1.5, gen:1.5, prestige:1.5, desc:'きらめきで全て1.5倍',       point:'時間片', req:1e6,    reqType:'power' },
      { id:'sugarwitch',     name:'シュガーウィッチ', tap:1.6, gen:1.6, prestige:1.6, desc:'甘い魔力で全て1.6倍',       point:'時間片', req:10,      reqType:'point' },
      { id:'lunamage',       name:'ルナメイジ',       tap:1.7, gen:1.7, prestige:1.7, desc:'月の魔力で全て1.7倍',       point:'時間片', req:100,     reqType:'point' },
      { id:'whitesorceress', name:'ホワイトソーサレス', tap:1.8, gen:1.8, prestige:1.8, desc:'白き魔法で全て1.8倍',       point:'時間片', req:1000,    reqType:'point' },
      { id:'mysticsaber',    name:'ミスティックセイバー', tap:1.9, gen:1.9, prestige:1.9, desc:'秘剣で全て1.9倍',         point:'時間片', req:10000,   reqType:'point' },
    ],
  },
  {
    id: 'maid',
    name: 'メイド系',
    jobs: [
      { id:'lilymaid',      name:'リリィメイド',           tap:1,   gen:2,   prestige:1,   desc:'ユニット性能に特化しPPS2倍',          point:'賢者石片', req:1e6,    reqType:'power' },
      { id:'sweethouse',    name:'スイートハウスメイド',   tap:1.1, gen:2.5, prestige:1,   desc:'甘いおもてなしでPPS2.5倍',             point:'賢者石片', req:20,      reqType:'point' },
      { id:'elegantparlor', name:'エレガントパーラーメイド', tap:1.2, gen:3,   prestige:1.1, desc:'優雅な所作でPPS3倍',                    point:'賢者石片', req:200,     reqType:'point' },
      { id:'graceladies',   name:'グレイスレディズメイド', tap:1.3, gen:3.5, prestige:1.2, desc:'気品でPPS3.5倍',                        point:'賢者石片', req:2000,    reqType:'point' },
      { id:'royalchief',    name:'ロイヤルチーフメイド',   tap:1.4, gen:4,   prestige:1.3, desc:'王宮仕込みでPPS4倍',                    point:'賢者石片', req:20000,   reqType:'point' },
    ],
  },
  {
    id: 'angel',
    name: '天使系',
    jobs: [
      { id:'feathergirl',   name:'フェザーガール',       tap:1,   gen:1,   prestige:2,   desc:'羽の加護で覚醒スタークリスタル獲得2倍', point:'天啓', req:1e6,    reqType:'power' },
      { id:'breezeangel',   name:'ブリーズエンジェル',   tap:1.1, gen:1.1, prestige:2.5, desc:'そよ風の祝福で2.5倍',                   point:'天啓', req:50,      reqType:'point' },
      { id:'wingmaiden',    name:'ウィングメイデン',     tap:1.2, gen:1.2, prestige:3,   desc:'翼の導きで3倍',                         point:'天啓', req:500,     reqType:'point' },
      { id:'celestiamuse',  name:'セレスティアミューズ', tap:1.3, gen:1.3, prestige:3.5, desc:'天上の調べで3.5倍',                     point:'天啓', req:5000,    reqType:'point' },
      { id:'luminusseraphy',name:'ルミナスセラフィー',   tap:1.4, gen:1.4, prestige:4,   desc:'聖光の加護で覚醒スタークリスタル獲得4倍', point:'天啓', req:50000,   reqType:'point' },
    ],
  },
  {
    id: 'idol',
    name: 'アイドル系',
    jobs: [
      { id:'kyunidol',      name:'きゅんきゅんアイドル', tap:2,   gen:1.1, prestige:1,   desc:'ときめきでタップ2倍',                    point:'スターオーラ', req:1e6,    reqType:'power' },
      { id:'melodysinger',  name:'メロディシンガー',     tap:2.5, gen:1.2, prestige:1.1, desc:'歌声でタップ2.5倍',                      point:'スターオーラ', req:30,      reqType:'point' },
      { id:'stagecinderella', name:'ステージシンデレラ', tap:3,   gen:1.3, prestige:1.2, desc:'舞台の輝きでタップ3倍',                 point:'スターオーラ', req:300,     reqType:'point' },
      { id:'shinystar',     name:'シャイニースター',     tap:3.5, gen:1.4, prestige:1.3, desc:'星の煌めきでタップ3.5倍',               point:'スターオーラ', req:3000,    reqType:'point' },
      { id:'gloriousdiva',  name:'グロリアスディーヴァ', tap:4,   gen:1.5, prestige:1.4, desc:'栄光のステージでタップ4倍',             point:'スターオーラ', req:30000,   reqType:'point' },
    ],
  },
  {
    id: 'glasses',
    name: 'メガネ系',
    jobs: [
      { id:'booklover',       name:'ブックラバー',       tap:1.5, gen:1.5, prestige:1.5, desc:'読書の知恵で全て1.5倍',       point:'叡智の欠片', req:1e6,    reqType:'power' },
      { id:'wonderresearcher',name:'ワンダーリサーチャー', tap:1.6, gen:1.6, prestige:1.6, desc:'研究の閃きで全て1.6倍',       point:'叡智の欠片', req:40,     reqType:'point' },
      { id:'nobleprofessor',  name:'ノーブルプロフェッサー', tap:1.7, gen:1.7, prestige:1.7, desc:'高貴な教授で全て1.7倍',       point:'叡智の欠片', req:400,    reqType:'point' },
      { id:'ancientsage',     name:'エンシェントセージ',   tap:1.8, gen:1.8, prestige:1.8, desc:'古代の叡智で全て1.8倍',       point:'叡智の欠片', req:4000,   reqType:'point' },
      { id:'metatron',        name:'メタトロン＝アルカナ', tap:1.9, gen:1.9, prestige:1.9, desc:'究極の知恵で全て1.9倍',         point:'叡智の欠片', req:40000,  reqType:'point' },
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
