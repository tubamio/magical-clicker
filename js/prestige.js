export const REBIRTHS = [
  { level:1, name:'マジカルメイド・シュガースプラッシュ', req:'エンジェルハート 1e6', effect:'タップ倍率+10%' },
  { level:2, name:'マジカルエンジェル・プリズムドレス', req:'ハートスター 10', effect:'全体倍率+5%' },
  { level:3, name:'マジカルアイドル・メルティシンフォニー', req:'ハートスター 25', effect:'ユニット性能+10%' },
  { level:4, name:'メイドスターリーループ', req:'ハートスター 50', effect:'コスト-5%' },
  { level:5, name:'エンジェリックブロッサムウィング', req:'ハートスター 100', effect:'タップ倍率+25%' },
  { level:6, name:'アイドルセレナーデステージ', req:'ハートスター 250', effect:'全体倍率+15%' },
  { level:7, name:'エターナルレインボーハーモニー', req:'ハートスター 500', effect:'全ステータス+20%' },
];

export function prestigeGain(power){
  if (power < 1e6) return 0;
  return Math.floor(Math.sqrt(power / 1e6));
}
