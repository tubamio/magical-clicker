export function fmt(n){
  if(!Number.isFinite(n)) return '∞';
  const a=Math.abs(n);
  if(a<1e6){ return (a>=1000? Math.round(n).toLocaleString('en-US'): (a>=100? n.toFixed(0): a>=10? n.toFixed(1): n.toFixed(2))); }
  const e=Math.floor(Math.log10(a)), m=a/10**e;
  return (n<0?'-':'')+m.toFixed(2)+'e'+e;
}
