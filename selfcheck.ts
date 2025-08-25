// src/debug/selfcheck.ts
type Row = { name: string; ok: boolean; note?: string }

function panel(){ 
  let el = document.getElementById('__selfcheck__')
  if (!el){
    el = document.createElement('div')
    el.id='__selfcheck__'
    el.className='boot-panel'
    document.body.appendChild(el)
  }
  return el
}

async function tryImport(absPath:string){
  try{
    const mod = await import(absPath)
    return { ok:true, mod }
  }catch(e:any){
    return { ok:false, err: e?.message || String(e) }
  }
}

(async ()=>{
  const rows: Row[] = []
  const mods = [
    '/src/data/generators.ts',
    '/src/economy/upgrade.ts',
    '/src/economy/purchase.ts',
    '/src/format.ts',
    '/src/math/dec.ts',
    '/src/ui/pages/MainGame.tsx',
    // 下部UI
    '/src/ui/components/GeneratorCard.tsx',
    '/src/ui/components/PrestigePanel.tsx',
  ]
  for (const p of mods){
    const r = await tryImport(p)
    if (r.ok){
      let note = ''
      if (p.includes('/data/generators')) {
        const list = (r as any).mod?.BASE_GENERATORS
        note = `BASE_GENERATORS: ${Array.isArray(list)? list.length: 'N/A'}`
      }
      rows.push({ name: `import("${p}")`, ok:true, note })
    }else{
      rows.push({ name: `import("${p}")`, ok:false, note: (r as any).err })
    }
  }

  const el = panel()
  const lines = [
    'Self-Check Result (UI comps included)',
    '=====================================',
    ...rows.map(r => `${r.ok?'✔':'✘'} ${r.name}${r.note?`  // ${r.note}`:''}`),
    '',
    '※ GeneratorCard / PrestigePanel が ✘ の場合、ヘッダ以降が描画されません（import 解決失敗）。',
  ]
  el.textContent = lines.join('\n')
})();
