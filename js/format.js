/* format.js — Ver.0.1.1.15 日本式/ENGフォーマット */

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
function trimFixed(num, dec){
  const s=num.toFixed(dec);
  return s.indexOf('.')>=0? s.replace(/\.0+$/,'').replace(/\.$/,'') : s;
}

/* ===== ENG ===== */
function fmtENG(n){
  const sgn = n<0?'-':''; const a=Math.abs(n);
  if(a===0) return '0';
  if(a>=0.01 && a<1000){
    const r=roundSig3(a);
    const dec=Math.max(0,2-abs10exp(r));
    return sgn+r.toFixed(dec);
  }
  const exp=abs10exp(a);
  const exp3=Math.floor(exp/3)*3;
  const mant=a/10**exp3;
  const mr=roundSig3(mant);
  const dec=Math.max(0,2-abs10exp(mr));
  const mstr=mr.toFixed(dec);
  return sgn+mstr+'e'+exp3;
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
  if(a<10000){
    const dec=Math.max(0,2-abs10exp(a));
    return sgn+trimFixed(a,dec);
  }
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
