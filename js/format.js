// Ver.0.1.1.2 format.js
let __mode = 'jp';
export function setFormatMode(m){ __mode = (m==='eng')?'eng':'jp'; }
export function getFormatMode(){ return __mode; }

function sign(n){return n<0?'-':'';}
function digits(a){return a>=1?Math.floor(Math.log10(a))+1:0;}

// JP: <1万 は指数なしの有効3桁、>=1万は二段（上位＋次位）。1000無量大数以上はENGへ。
const UNITS=['','万','億','兆','京','垓','𥝱','穣','溝','澗','正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数'];
const POW4=k=>10**(k*4);

function sig3Plain(n){
  if(!Number.isFinite(n)) return String(n);
  if(n===0) return '0';
  const s=sign(n), a=Math.abs(n); const d=digits(a);
  if(d>=3) return s+Math.round(a).toString();
  if(d===2) return s+(Math.round(a*10)/10).toFixed(1);
  if(d===1) return s+(Math.round(a*100)/100).toFixed(2);
  const exp=Math.floor(Math.log10(a)); const scale=3-1-exp;
  const val=Math.round(a*10**scale)/10**scale;
  let out=val.toFixed(max(0,scale)); out=out.replace(/\.0+$/,''); return s+out;
}
function max(a,b){return a>b?a:b;}

function jpTwoTier(n){
  const s=sign(n), a=Math.abs(n);
  const exp=Math.floor(Math.log10(a)); const g=Math.min(UNITS.length-1, Math.floor(exp/4));
  const top=Math.floor(a/POW4(g)); const rem=Math.floor(a-top*POW4(g));
  let out=s+top+UNITS[g];
  if(g>0){ const next=g-1; const lo=Math.floor(rem/POW4(next)); if(lo>0) out+=String(lo)+UNITS[next]; }
  return out;
}

function formatJP(x){
  const n=Number(x); const a=Math.abs(n);
  if(!Number.isFinite(a)) return String(n);
  const THRESH = 1000 * 10**64;
  if(a>=THRESH) return formatENG(n);
  if(a<1e4) return sig3Plain(n);
  return jpTwoTier(n);
}

// ENG: 有効3桁、指数は3の倍数（e±3, e±6, ...）、e表記は|exp|>=3から
function formatENG(x){
  const n = Number(x);
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return "0.00";
  const s = n < 0 ? "-" : "";
  const a = Math.abs(n);
  const rawExp = a > 0 ? Math.floor(Math.log10(a)) : 0;

  // e表記は |exp|>=3 から。それ未満は指数なしで有効3桁
  if (a > 0 && Math.abs(rawExp) < 3) {
    if (a >= 1) {
      // 1～999
      const d = a >= 100 ? 3 : (a >= 10 ? 2 : 1);
      const dec = Math.max(0, 3 - d);
      return s + strRound(a, dec);
    } else {
      // 0 < a < 1
      const exp = Math.floor(Math.log10(a));
      const scale = 3 - 1 - exp;
      return s + strRound(a, Math.max(0, scale));
    }
  }

  // 工学式 e(±3n)
  const e3 = Math.floor(rawExp / 3) * 3;
  const mant = a / (10 ** e3);
  const di = mant >= 100 ? 3 : (mant >= 10 ? 2 : 1);
  const dec = Math.max(0, 3 - di);
  const rounded = Math.round(mant * 10 ** dec) / 10 ** dec;
  return s + rounded.toFixed(dec) + "e" + e3;
} else {
      const exp = Math.floor(Math.log10(a));
      const scale = 3 - 1 - exp;
      return s + strRound(a, Math.max(0, scale));
    }
  }

  // 工学式 e(±3n)
  const e3 = Math.floor(rawExp / 3) * 3;
  const mant = a / (10 ** e3);
  const di = mant >= 100 ? 3 : (mant >= 10 ? 2 : 1);
  const dec = Math.max(0, 3 - di);
  const rounded = Math.round(mant * 10 ** dec) / 10 ** dec;
  return s + rounded.toFixed(dec) + "e" + e3;
} else {
      const exp = Math.floor(Math.log10(a));
      const scale = 3 - 1 - exp;
      return s + strRound(a, Math.max(0, scale));
    }
  }
  const e3 = Math.floor(rawExp/3)*3;
  const mant = a / 10**e3;
  const di = mant>=100?3:(mant>=10?2:1);
  const dec = Math.max(0, 3-di);
  const rounded = Math.round(mant*10**dec)/10**dec;
  return s + rounded.toFixed(dec) + 'e' + e3;
}
  const rawExp=Math.floor(Math.log10(a)); const e3=Math.floor(rawExp/3)*3; if(e3===0){ const d=digits(a); if(d>=3) return s+Math.round(a).toString(); if(d===2) return s+(Math.round(a*10)/10).toFixed(1); return s+(Math.round(a*100)/100).toFixed(2);}
  const mant=a/10**e3; const di=digits(mant); const dec=Math.max(0,3-di); const rounded=Math.round(mant*10**dec)/10**dec;
  return s+rounded.toFixed(dec)+'e'+e3;
}

export function fmt(x){ return __mode==='eng' ? formatENG(x) : formatJP(x); }

function strRound(val,dec){ return (Math.round(val*10**dec)/10**dec).toFixed(dec); }
