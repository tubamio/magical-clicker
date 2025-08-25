const KEY='msi-split-v1';
export const save = (state)=>{
  try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch{}
};
export const load = ()=>{
  try{ const raw = localStorage.getItem(KEY); return raw? JSON.parse(raw): null; }catch{ return null; }
};
export const reset = ()=>{ try{ localStorage.removeItem(KEY); }catch{} };
