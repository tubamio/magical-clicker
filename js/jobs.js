export const JOBS = [
  // 魔法少女系
  { id:'magical',   name:'魔法少女',   tap:2,   gen:1,   prestige:1,   desc:'タップに特化し獲得ハート2倍',            point:'時間片' },
  { id:'mage',      name:'魔導師',     tap:2.5, gen:1.1, prestige:1,   desc:'魔法の研鑽でタップ2.5倍',                point:'時間片' },
  { id:'archmage',  name:'大魔導師',   tap:3,   gen:1.2, prestige:1.1, desc:'大魔力でタップ3倍',                      point:'時間片' },
  { id:'timemage',  name:'時空魔導師', tap:3.5, gen:1.3, prestige:1.2, desc:'時空魔法でタップ3.5倍',                  point:'時間片' },
  { id:'chrono',    name:'クロノマンサー', tap:4,   gen:1.4, prestige:1.3, desc:'時間を操りタップ効率4倍',                 point:'時間片' },

  // メイド系
  { id:'maid',        name:'メイド',     tap:1,   gen:2,   prestige:1,   desc:'ユニット性能に特化しPPS2倍',              point:'賢者石片' },
  { id:'headmaid',    name:'メイド長',   tap:1.1, gen:2.5, prestige:1,   desc:'指揮でPPS2.5倍',                        point:'賢者石片' },
  { id:'royalmaid',   name:'宮廷メイド', tap:1.2, gen:3,   prestige:1.1, desc:'宮廷仕込みでPPS3倍',                    point:'賢者石片' },
  { id:'alchemymaid', name:'錬金メイド', tap:1.3, gen:3.5, prestige:1.2, desc:'錬金術でPPS3.5倍',                      point:'賢者石片' },
  { id:'alchemist',   name:'アルケミスト', tap:1.4, gen:4,   prestige:1.3, desc:'錬金術でPPS4倍',                         point:'賢者石片' },

  // 天使系
  { id:'angel',     name:'天使',     tap:1,   gen:1,   prestige:2,   desc:'覚醒ハートスター獲得2倍',              point:'天啓' },
  { id:'archangel', name:'大天使',   tap:1.1, gen:1.1, prestige:2.5, desc:'更なる加護で2.5倍',                    point:'天啓' },
  { id:'throne',    name:'座天使',   tap:1.2, gen:1.2, prestige:3,   desc:'神の座に仕える',                        point:'天啓' },
  { id:'dominion',  name:'主天使',   tap:1.3, gen:1.3, prestige:3.5, desc:'支配を司る',                            point:'天啓' },
  { id:'seraph',    name:'熾天使',   tap:1.4, gen:1.4, prestige:4,   desc:'天界の加護で覚醒ハートスター獲得4倍',   point:'天啓' },

  // アイドル系
  { id:'idol',       name:'アイドル',     tap:1.5, gen:1.5, prestige:1.5, desc:'総合力型で全て1.5倍',                point:'スターオーラ' },
  { id:'popstar',    name:'人気アイドル', tap:1.6, gen:1.6, prestige:1.6, desc:'人気で全て1.6倍',                    point:'スターオーラ' },
  { id:'superstar',  name:'スーパースター', tap:1.7, gen:1.7, prestige:1.7, desc:'スターの力で全て1.7倍',                point:'スターオーラ' },
  { id:'galaxyidol', name:'銀河アイドル', tap:1.8, gen:1.8, prestige:1.8, desc:'銀河規模で全て1.8倍',                  point:'スターオーラ' },
  { id:'diva',       name:'次元アイドル', tap:1.9, gen:1.9, prestige:1.9, desc:'異次元の人気で全て1.9倍',              point:'スターオーラ' },
];

export function getJobBonuses(id){
  const j = JOBS.find(j=>j.id===id);
  return j ? { tap:j.tap, gen:j.gen, prestige:j.prestige } : { tap:1, gen:1, prestige:1 };
}

