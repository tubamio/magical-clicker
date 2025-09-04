export const REBIRTHS = [
  { level:1, name:'マジカルメイド・シュガースプラッシュ', req:10,  effect:'全体倍率×1e3',   feature:'オートタップが解禁（ボタンでON/OFF）' },
  { level:2, name:'マジカルエンジェル・プリズムドレス',   req:1e3, effect:'全体倍率×1e6',   feature:'バーストタップが解禁（ボタンを押すと100倍タップ）' },
  { level:3, name:'マジカルアイドル・メルティシンフォニー', req:1e6, effect:'全体倍率×1e12',  feature:'自動ユニット購入が解禁（ボタンでON/OFF）' },
  { level:4, name:'メイドスターリーループ',                 req:1e9,  effect:'全体倍率×1e24',  feature:'ハートスター変換が解禁（ボタンで変換）' },
  { level:5, name:'エンジェリックブロッサムウィング',       req:1e12, effect:'全体倍率×1e48',  feature:'ハイパーモードが解禁（ボタンで発動）' },
  { level:6, name:'アイドルセレナーデステージ',               req:1e15, effect:'全体倍率×1e96',  feature:'自動スマイル強化が解禁（ボタンでON/OFF）' },
  { level:7, name:'エターナルレインボーハーモニー',           req:1e18, effect:'全体倍率×1e192', feature:'ギャラクシーサージが解禁（ボタンで1e6倍）' },
];

export function prestigeGain(power){
  if (power < 1e6) return 0;
  return Math.floor(Math.sqrt(power / 1e6));
}

const MULTIPLIERS = [1, 1e3, 1e6, 1e12, 1e24, 1e48, 1e96, 1e192];

export function rebirthMultiplier(level){
  return MULTIPLIERS[level] || 1;
}

