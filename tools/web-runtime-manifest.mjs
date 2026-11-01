// The playable CH1 map uses its chunks/layout, not the large authoring master.
export function isMapAuthoringSource(path) {
  const normalized=path.replaceAll('\\','/');
  return /^assets\/map\/ch1\/production_finish\/(?:CH1_1_PRODUCTION_MASTER\.png$|(?:outer\d+|skin\d+|floor\d+)_sources\/)/.test(normalized)
    || /^assets\/map\/ch1\/(?:rottenwood_field_rootworld_master_v2|rottenwood_poison_master_higgsfield_v2_wide|rottenwood_poison_tree_detail_v3_source)\.png$/.test(normalized);
}

function isRetiredWebSource(path) {
  const normalized=path.replaceAll('\\','/').normalize('NFC');
  return /^assets\/cutscene\/prologue\/_old_20260727\//.test(normalized)
    || /^assets\/map\/ch1\/(?:baked_spike\/south_visual_pass\/CH1_SOUTH_BASE|boss_room_bg_old|ground_dark_soil_backup)\.png$/.test(normalized);
}

function isWebAuthoringSource(path) {
  return /^assets\/web-derived\//.test(path) || isMapAuthoringSource(path)
    || isRetiredWebSource(path)
    || /\/(?:[^/]*_sources|_unity_preview|_p11_candidates|_grok_qa)\//.test(path)
    || /^assets\/video-(?:bases|tests)\//.test(path)
    || /^assets\/map\/.*\/(?:master\.png|[^/]*_MASTER\.png)$/i.test(path)
    || /\.(zip|blend|psd|kra)$/i.test(path);
}

// Follow runtime asset literals/dynamic prefixes, not authoring tools or docs.
export function selectWebRuntimeFiles(tracked,entryFiles,readSource) {
  const paths=tracked.map(path=>({path,canonical:path.normalize('NFC')}));
  const available=new Set(paths.map(entry=>entry.canonical));
  const roots=new Set(entryFiles);
  const selected=new Set(paths.filter(({path})=>roots.has(path)
    || /^(lang_[^/]+\.js|atlas_[^/]+)$/.test(path)
    || /^(sfx|sprites|localization)\//.test(path)
    || /^assets\/(vendor|3d)\//.test(path)).map(entry=>entry.path));
  const scanned=new Set(),references=new Set();let changed=true;
  while(changed) {
    changed=false;
    for(const path of selected) {
      if(scanned.has(path)||! /\.(html|js|css|mjs)$/.test(path))continue;
      scanned.add(path);const source=readSource(path);
      for(const match of source.matchAll(/["'`]((?:assets|img|sprites|bgm|sfx|video|output|web3d)\/[^"'`\r\n]*)["'`]/g)) {
        const ref=match[1].split(/[?#]/)[0].split('${')[0].normalize('NFC');
        if(ref.split('/')[1]||available.has(ref))references.add(ref);
      }
      for(const match of source.matchAll(/url\(\s*([^"'\s][^)]*)\)/g)) {
        const ref=match[1].split(/[?#]/)[0].trim().normalize('NFC');
        if(/^(assets|img|sprites|bgm|sfx|video|output)\/.+/.test(ref))references.add(ref);
      }
    }
    const exact=new Set([...references].filter(ref=>available.has(ref)));
    const prefixes=[...references].filter(ref=>!available.has(ref));
    for(const {path,canonical} of paths) {
      if(selected.has(path)||(isWebAuthoringSource(path)&&!(isRetiredWebSource(path)&&exact.has(canonical))))continue;
      if(exact.has(canonical)||prefixes.some(ref=>canonical.startsWith(ref))){selected.add(path);changed=true;}
    }
  }
  const declared=new Map();
  for(const [manifestPath,kind] of [
    ['img/lording/wide/manifest.json','loading'],
    ['assets/fullscreen-wide/20261031/manifest.json','fullscreen']
  ]) {
    if(!selected.has(manifestPath))continue;
    let data;
    try {data=JSON.parse(readSource(manifestPath));}
    catch {throw new Error('Invalid runtime manifest: '+manifestPath);}
    const entries=kind==='loading' ? data.images?.flatMap(image=>[image.source,...image.variants.map(variant=>variant.file)])
      : data.assets?.flatMap(asset=>[asset.source,...asset.outputs.map(output=>output.path)]);
    if(!Array.isArray(entries))throw new Error('Invalid runtime manifest entries: '+manifestPath);
    const required=new Set([manifestPath]);
    for(const asset of entries) {
      const canonical=String(asset).normalize('NFC');
      if(!available.has(canonical))throw new Error('Missing manifest asset: '+asset);
      if(isWebAuthoringSource(canonical))throw new Error('Manifest asset excluded: '+asset);
      required.add(canonical);
    }
    for(const {path,canonical} of paths)if(required.has(canonical))selected.add(path);
    declared.set(kind,required);
  }
  return tracked.filter(path=>{
    if(!selected.has(path)||(isWebAuthoringSource(path)&&!(isRetiredWebSource(path)&&references.has(path.normalize('NFC')))))return false;
    const canonical=path.normalize('NFC');
    if(path.startsWith('img/lording/')&&declared.has('loading'))return declared.get('loading').has(canonical)||references.has(canonical);
    if(path.startsWith('assets/fullscreen-wide/20261031/')&&declared.has('fullscreen'))return declared.get('fullscreen').has(canonical)||references.has(canonical);
    return true;
  });
}
