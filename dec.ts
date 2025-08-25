export class Dec{
  m:number; e:number;
  constructor(x:any){ if (x instanceof Dec){ this.m=x.m; this.e=x.e; return; }
    const n = typeof x==='number' ? x : (typeof x==='string'? Number(x): (x&&typeof x.m==='number'? (x.m*10**x.e): 0));
    if (!Number.isFinite(n) || n===0){ this.m=0; this.e=0; return; }
    const e=Math.floor(Math.log10(Math.abs(n))); this.m=n/10**e; this.e=e; this._norm();
  }
  static from(x:any){ return x instanceof Dec? x : new Dec(x); }
  static ZERO=new Dec(0); static ONE=new Dec(1);
  _norm(){ if (this.m===0 || !isFinite(this.m)){ this.m=0; this.e=0; return; }
    while(Math.abs(this.m)>=10){ this.m/=10; this.e++; }
    while(Math.abs(this.m)>0 && Math.abs(this.m)<1){ this.m*=10; this.e--; } }
  clone(){ return new Dec(this); }
  isZero(){ return this.m===0; }
  toNumber(){ return this.m*10**this.e; }
  toFixed(k=0){ return this.toNumber().toFixed(k); }
  plus(y:any){ const a=this, b=Dec.from(y); if(a.isZero()) return b.clone(); if(b.isZero()) return a.clone();
    const d=a.e-b.e; if (d>=308) return a.clone(); if (d<=-308) return b.clone();
    if (d>=0){ const r=new Dec(0); r.m=a.m + b.m*10**(-d); r.e=a.e; r._norm(); return r; }
    const r=new Dec(0); r.m=a.m*10**d + b.m; r.e=b.e; r._norm(); return r; }
  neg(){ const r=this.clone(); r.m=-r.m; return r; }
  minus(y:any){ return this.plus(Dec.from(y).neg()); }
  times(y:any){ const b=Dec.from(y); if (this.isZero()||b.isZero()) return Dec.ZERO;
    const r=new Dec(0); r.m=this.m*b.m; r.e=this.e+b.e; r._norm(); return r; }
  div(y:any){ const b=Dec.from(y); if (b.isZero()) return Dec.ZERO; if (this.isZero()) return Dec.ZERO;
    const r=new Dec(0); r.m=this.m/b.m; r.e=this.e-b.e; r._norm(); return r; }
  powInt(n:number){ n = Math.trunc(n); if (n===0) return Dec.ONE; if (n<0) return Dec.ONE.div(this.powInt(-n));
    let base=this.clone(), res=Dec.ONE; while(n>0){ if(n&1) res=res.times(base); n>>=1; if(n>0) base=base.times(base); } return res; }
  pow(y:any){ const p=Number(y); if (!isFinite(p)) return Dec.ZERO; if (this.isZero()) return Dec.ZERO;
    const e=this.e*p; const m=Math.pow(this.m, p); const r=new Dec(0); r.m=m; r.e=Math.trunc(e); r._norm();
    const frac=e-r.e; if (frac!==0){ r.m*=10**frac; r._norm(); } return r; }
  lt(y:any){ return this.toNumber() < Dec.from(y).toNumber(); }
  lte(y:any){ return this.toNumber() <= Dec.from(y).toNumber(); }
  gt(y:any){ return this.toNumber() > Dec.from(y).toNumber(); }
  gte(y:any){ return this.toNumber() >= Dec.from(y).toNumber(); }
  log10(){ if (this.isZero()) return -Infinity; return Math.log10(Math.abs(this.m)) + this.e; }
}
export const D=(x:any)=>Dec.from(x);
export const ZERO=Dec.ZERO, ONE=Dec.ONE, TEN=D(10);
