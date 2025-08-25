// format.js — mode toggle + rules aligned to format.ts
let __mode = 'jp'; // default: Japanese

export function setFormatMode(m){ __mode = (m==='eng' ? 'eng' : 'jp'); }
export function getFormatMode(){ return __mode; }

function formatEng(x){
  const n = Number(x);
  if (!Number.isFinite(n) || n === 0) return '0.000';
  const abs = Math.abs(n);
  const exp = Math.floor(Math.log10(abs));
  const m = abs / (10 ** exp);
  const digs = m >= 100 ? 0 : (m >= 10 ? 1 : 2);
  if (exp === 0) return (n < 0 ? '-' : '') + m.toFixed(3);
  return (n < 0 ? '-' : '') + m.toFixed(digs) + 'e' + exp;
}

// --- JP helpers ---
const UNITS=['','万','億','兆','京','垓','𥝱','穣','溝','澗','正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数'];
const POW4 = k => 10 ** (k*4);

function sig3NoExpUnder1e4(x){
  const n = Number(x); const s = n<0?'-':''; const a = Math.abs(n);
  if (a === 0) return '0.000';
  const exp = Math.floor(Math.log10(a));
  const m = a / (10 ** exp);
  const digs = m >= 100 ? 0 : (m >= 10 ? 1 : 2);
  // exp<=0 でも指数表記にはしない（小数で有効3桁）
  const val = m * (10 ** exp);
  return s + val.toFixed(3);
}

function jpTwoTierInt(x){
  const n = Number(x); const s = n<0?'-':''; const a = Math.abs(n);
  const exp = Math.floor(Math.log10(a));
  const g = Math.min(UNITS.length-1, Math.floor(exp/4));
  const top = Math.floor(a / POW4(g));
  const rem = Math.floor(a - top * POW4(g));
  let out = s + top + UNITS[g];
  if (g > 0) {
    const next = g - 1;
    const lo = Math.floor(rem / POW4(next));
    if (lo > 0) out += String(lo) + UNITS[next];
  }
  return out;
}

function formatJP(x){
  const n = Number(x); const a = Math.abs(n);
  if (!Number.isFinite(a)) return String(n);
  // 1000 無量大数以上は ENG に切替
  const THRESH = 1000 * (10 ** 64);
  if (a >= THRESH) return formatEng(x);
  if (a < 1e4) return sig3NoExpUnder1e4(x);
  return jpTwoTierInt(x);
}

export function fmt(x){
  return __mode === 'eng' ? formatEng(x) : formatJP(x);
}
