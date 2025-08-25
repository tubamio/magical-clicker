const KEY = 'ultra-inflate-idle-js-save-v1';

export function load(){
  try{
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    const data = JSON.parse(raw);
    return data;
  }catch(e){ return null; }
}

export function save(state){
  try{
    const data = JSON.stringify({
      score: state.score,
      generators: state.generators.map(g=>({id:g.id,count:g.count})),
      mult: state.mult,
    });
    localStorage.setItem(KEY, data);
  }catch(e){}
}

export function exportSave(){
  const data = localStorage.getItem(KEY) ?? '';
  return btoa(unescape(encodeURIComponent(data)));
}

export function importSave(b64){
  try{
    const json = decodeURIComponent(escape(atob(b64)));
    localStorage.setItem(KEY, json);
    return true;
  }catch(e){ return false; }
}
