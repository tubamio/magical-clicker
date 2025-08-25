// 単純な表記関数（Numberベース）。必要なら後で科学記数・工学記数を強化。
export function fmt(n){
  if (!isFinite(n)) return '∞';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs < 1000) return n.toFixed(abs<10 ? 2 : 0);
  const e = Math.floor(Math.log10(abs));
  const m = abs / 10**e;
  return (n<0?'-':'') + m.toFixed(2) + 'e' + e;
}

export function fmtInt(n){
  return Math.floor(n).toLocaleString('en-US');
}
