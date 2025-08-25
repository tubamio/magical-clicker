let __mode='eng'; // default; switchable
export function setFormatMode(m){ __mode=(m==='jp'?'jp':'eng'); }
export function getFormatMode(){ return __mode; }

function fmtENG(x){
  const n = Number(x);
  if(!Number.isFinite(n) || n===0) return '0.000';
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const m = n / 10**exp;
  const digs = m>=100 ? 0 : m>=10 ? 1 : 2;
  if (exp===0) return m.toFixed(3);
  return m.toFixed(digs) + 'e' + exp;
}

const UNITS=['','万','億','兆','京','垓','𥝱','穣','溝','澗','正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数'];
function pow4(k){ return 10**(k*4); }

function sig3NoExpUnder1e4(n){
  const a=Math.abs(n); if(a===0) return '0.000';
  const exp=Math.floor(Math.log10(a)), m=a/10**exp;
  const digs = m>=100?0: m>=10?1: 2;
  if(exp<=0) return (n<0?'-':'') + (m*10**exp).toFixed(3);
  return (n<0?'-':'') + (m*10**exp).toFixed(3);
}

function jpTwoTierInt(n){
  const s = Math.sign(n)<0?'-':''; const a=Math.abs(n);
  const exp = Math.floor(Math.log10(a));
  const g = Math.min(UNITS.length-1, Math.floor(exp/4));
  const top = Math.floor(a / pow4(g));
  const rem = a - top*pow4(g);
  let out = s + top + UNITS[g];
  if (g>0){
    const next = g-1;
    const lo = Math.floor(rem / pow4(next));
    if (lo>0) out += lo + UNITS[next];
  }
  return out;
}

function fmtJP(n){
  const a=Math.abs(n);
  if(!Number.isFinite(a)) return String(n);
  const THRESH = 1000 * 10**64; // 1000 無量大数を超えたらENG
  if (a >= THRESH) return fmtENG(n);
  if (a < 1e4) return sig3NoExpUnder1e4(n);
  return jpTwoTierInt(n);
}

export function fmt(n){ return __mode==='jp' ? fmtJP(n) : fmtENG(n); }
