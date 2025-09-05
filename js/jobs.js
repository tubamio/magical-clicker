export const JOBS = [
  { id:'magical', name:'魔法少女', tap:2, gen:1, prestige:1, desc:'タップに特化し獲得ハート2倍' },
  { id:'maid',    name:'メイド',    tap:1, gen:2, prestige:1, desc:'ユニット性能に特化しPPS2倍' },
  { id:'angel',   name:'天使',     tap:1, gen:1, prestige:2, desc:'覚醒ハートスター獲得2倍' },
  { id:'idol',    name:'アイドル',  tap:1.5, gen:1.5, prestige:1.5, desc:'総合力型で全て1.5倍' },
];

export function getJobBonuses(id){
  const j = JOBS.find(j=>j.id===id);
  return j ? { tap:j.tap, gen:j.gen, prestige:j.prestige } : { tap:1, gen:1, prestige:1 };
}
