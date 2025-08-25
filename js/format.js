let __mode = 'jp'; // 'jp' or 'eng'
export function setFormatMode(m){ __mode = (m==='eng') ? 'eng' : 'jp'; }
export function getFormatMode(){ return __mode; }

function fmtJP(n){
  if(!Number.isFinite(n)) return '∞';
  const s = Math.sign(n) < 0 ? '-' : '';
  const a = Math.abs(n);
  const UNITS=['','万','億','兆','京','垓','𥝱','穣','溝','澗','正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数'];
  if(a===0) return '0';
  const exp = Math.floor(Math.log10(a));
  if(exp >= 32){ const m=a/10**exp; return s + m.toFixed(3) + 'e' + exp; }
  if(a < 1e4) return s + Math.floor(a).toString();
  if(exp < 8){
    const v = Math.floor(a), hi = Math.floor(v/10000), lo = v - hi*10000;
    return s + hi + '万' + (lo ? String(lo).padStart(4,'0') : '');
  }
  const g = Math.min(UNITS.length-1, Math.floor(exp/4));
  const scaled = a / 10**(g*4);
  const body = scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2);
  return s + body + UNITS[g];
}

function fmtENG(n){
  if(!Number.isFinite(n)) return '∞';
  const s = Math.sign(n) < 0 ? '-' : '';
  const a = Math.abs(n);
  if(a===0) return '0.000';
  const exp = Math.floor(Math.log10(a));
  const e3 = Math.floor(exp/3)*3;
  const mant = a / 10**e3;
  return s + mant.toFixed(3) + (e3===0 ? '' : 'e'+e3);
}

export function fmt(n){
  return __mode==='eng' ? fmtENG(n) : fmtJP(n);
}
