/* format.js — cleaned & unified (JP/ENG) formatter */
let __mode = 'jp';

export function setFormatMode(mode) {
  if (mode === 'jp' || mode === 'eng') __mode = mode;
}
export function getFormatMode(){ return __mode; }

export function fmt(x) {
  if (Number.isNaN(x)) return 'NaN';
  if (!Number.isFinite(x)) return String(x);
  if (Object.is(x, -0)) x = 0;
  return __mode === 'jp' ? formatJP(x) : formatENG(x);
}

function absExp10(a){ return Math.floor(Math.log10(Math.abs(a))); }
function sigToFixed(a, sig=3){
  if (a === 0) return '0';
  const exp = absExp10(a);
  const dec = Math.max(0, sig - 1 - exp);
  return a.toFixed(dec);
}

/* ENG: 有効3桁。|exp|>=3 は工学式(e±3n) */
function formatENG(n){
  const s = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (a === 0) return '0';
  const rawExp = absExp10(a);
  if (Math.abs(rawExp) >= 3){
    const e3 = Math.floor(rawExp / 3) * 3;
    const mant = a / (10 ** e3);
    const di = mant >= 100 ? 3 : (mant >= 10 ? 2 : 1);
    const dec = Math.max(0, 3 - di);
    const rounded = Math.round(mant * 10 ** dec) / 10 ** dec;
    return s + rounded.toFixed(dec) + 'e' + e3;
  } else {
    return s + sigToFixed(a, 3);
  }
}

/* JP: 1万未満→有効3桁、1万以上→上位/下位2段。超巨大はENGへ */
const JP_UNITS = [
  '', '万', '億', '兆', '京', '垓', '秭', '穣', '溝', '澗',
  '正', '載', '極', '恒河沙', '阿僧祇', '那由他', '不可思議', '無量大数'
];

function formatJP(n){
  const s = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (a === 0) return '0';
  if (a < 1e4) return s + sigToFixed(a, 3);

  const exp10 = absExp10(a);
  const group = Math.floor(exp10 / 4);
  if (group >= JP_UNITS.length) return s + formatENG(a);

  const powTop = 10 ** (group * 4);
  const top = Math.floor(a / powTop);
  const rem = a - top * powTop;

  let out = s + String(top) + JP_UNITS[group];
  if (group >= 1){
    const powLow = 10 ** ((group - 1) * 4);
    const low = Math.floor(rem / powLow);
    if (low > 0) out += String(low) + JP_UNITS[group - 1];
  }
  return out;
}
