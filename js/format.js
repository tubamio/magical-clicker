export function fmt(n){
  if(!Number.isFinite(n)) return '∞';
  const a = Math.abs(n);
  // 日本式：4桁ごと（万、億、兆、京...）。8桁未満は万の混在表示、極端に大きい数は指数。
  if (a === 0) return '0';
  const UNITS=['','万','億','兆','京','垓','𥝱','穣','溝','澗','正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数'];
  const exp = Math.floor(Math.log10(a));
  if (!Number.isFinite(exp)) return '∞';
  // 1e32 くらいを超えたら指数表記（任意の安全側しきい値）
  if (exp >= 32) {
    const mant = a / 10**exp;
    return (n<0?'-':'') + mant.toFixed(3) + 'e' + exp;
  }
  if (a < 1e4) {
    // 1万未満は整数表示
    return (n<0?'-':'') + Math.floor(a).toString();
  }
  if (exp < 8) {
    // 1億未満は「○万####」形式（例: 123,456 → 12万3456）
    const val = Math.floor(a);
    const hi  = Math.floor(val/10000);
    const lo  = val - hi*10000;
    return (n<0?'-':'') + hi + '万' + (lo? lo.toString().padStart(4,'0') : '');
  }
  const group = Math.min(UNITS.length-1, Math.floor(exp/4));
  const scaled = a / 10**(group*4);
  // 有効3桁ルール
  const s = scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2);
  return (n<0?'-':'') + s + UNITS[group];
}
