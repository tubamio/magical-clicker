import { D, TEN } from '@/math/dec'
export function formatEng(x:any){ const bn=D(x); if (bn.isZero()) return '0.000';
  const exp=Math.floor(bn.log10()); const e3=Math.floor(exp/3)*3; const mant=bn.div(TEN.powInt(e3));
  if (e3===0) return mant.toFixed(3); return `${mant.toFixed(3)}e${e3}`; }
export function formatJP(x:any){
  const bn=D(x); const n=bn.toNumber();
  if (n<10000) return String(Math.floor(n));
  const UNITS=['','万','億','兆','京','垓','𥝱','穣','溝','澗','正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数'];
  const exp=Math.floor(bn.log10()); if (!Number.isFinite(exp)) return formatEng(bn);
  if (exp<8){ const val=Math.floor(n); const hi=Math.floor(val/10000); const lo=val-hi*10000; return `${hi}万${lo}`; }
  const group=Math.min(UNITS.length-1, Math.floor(exp/4)); const top=Math.floor(bn.div(TEN.powInt(group*4)).toNumber()); return `${top}${UNITS[group]}`;
}
export const format=(x:any,mode:'eng'|'jp'='jp')=> mode==='jp'? formatJP(x) : formatEng(x);
