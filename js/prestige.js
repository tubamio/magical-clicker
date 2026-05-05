export const REBIRTHS = [
  { level:1, name:'ピュアハート',           req:1e2,   effect:'全体倍率×1e4',  feature:'オートタップが解禁（ボタンでON/OFF）' },
  { level:2, name:'パステルドリーム',       req:1e5,   effect:'全体倍率×1e8',  feature:'ジェネレーター転生が解禁（ボタンで実行）' },
  { level:3, name:'サニーフラグメント',     req:1e8,   effect:'全体倍率×1e12', feature:'自動ユニット購入が解禁（ボタンでON/OFF）' },
  { level:4, name:'マジカルプリンセス',     req:1e12,  effect:'全体倍率×1e16', feature:'スタークリスタル変換が解禁（ボタンで変換）' },
  { level:5, name:'セラフィムクイーン',     req:1e16,  effect:'全体倍率×1e20', feature:'ハイパーモードが解禁（ボタンで発動）' },
  { level:6, name:'ホーリーブライト',       req:1e20,  effect:'全体倍率×1e25', feature:'自動スマイル強化が解禁（ボタンでON/OFF）' },
  { level:7, name:'エターナルエンプレス',   req:1e25,  effect:'全体倍率×1e30', feature:'ギャラクシーサージが解禁（ボタンで1e6倍）' },
];

export function prestigeGain(power){
  const p = (power instanceof Decimal) ? power : new Decimal(power);
  if (p.lt(1e8)) return 0;
  return p.div(1e8).pow(1/3).floor().toNumber();
}

const MULTIPLIERS = [1, 1e4, 1e8, 1e12, 1e16, 1e20, 1e25, 1e30];

export function rebirthMultiplier(level){
  return MULTIPLIERS[level] || 1;
}
