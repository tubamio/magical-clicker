/* format.js — Ver.0.1.1.11 日本式/ENGフォーマット */

let __mode = 'jp';
export function setFormatMode(mode){ if(mode==='jp'||mode==='eng') __mode=mode; }
export function getFormatMode(){ return __mode; }
export function fmt(x){
  if (Number.isNaN(x)) return 'NaN';
  if (!Number.isFinite(x)) return String(x);
  if (Object.is(x,-0)) x = 0;
  return __mode==='jp' ? fmtJP(x) : fmtENG(x);
}

/* ===== 共通ヘルパ ===== */
function abs10exp(a){ return Math.floor(Math.log10(Math.abs(a))); }
function roundSig3(n){
  if(n===0) return 0;
  const exp=abs10exp(n);
  const scale=10**(exp-2);
  return Math.round(n/scale)*scale;
}
function trimFixed(num, maxDec=2){
  const s=num.toFixed(maxDec);
  return s.indexOf('.')>=0? s.replace(/\.0+$/,'').replace(/\.$/,'') : s;
}

/* ===== ENG ===== */
function fmtENG(n){
  const sgn=n<0?'-':''; const a=Math.abs(n);
  if(a===0) return '0';
  if(a>=0.01 && a<1000){ return sgn+trimFixed(a,2); }
  const exp=abs10exp(a);
  const mant=a/10**exp;
  const mstr=(Math.round(mant*100)/100).toFixed(2).replace(/\.0+$/,'');
  return sgn+mstr+'e'+exp;
}

/* ===== JP ===== */
const JP_UNITS=[
  '','万','億','兆','京','垓','秭','穣','溝','澗',
  '正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数'
];

function fmtJP(n){
  const sgn=n<0?'-':''; let a=Math.abs(n);
  if(a===0) return '0';
  a=roundSig3(a);
  if(a<10000){ return sgn+trimFixed(a,2); }
  const exp=abs10exp(a);
  const g=Math.floor(exp/4);
  if(g>=JP_UNITS.length){ return sgn+fmtENG(a); }
  const powTop=10**(g*4);
  const top=Math.floor(a/powTop);
  let out=sgn+String(top)+JP_UNITS[g];
  if(g>=1){
    const powLow=10**((g-1)*4);
    const low=Math.floor((a-top*powTop)/powLow);
    if(low>0) out+=String(low)+JP_UNITS[g-1];
  }
  return out;
}
