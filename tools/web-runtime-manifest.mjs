// The playable CH1 map uses its chunks/layout, not the large authoring master.
export function isMapAuthoringSource(path) {
  return /^assets\/map\/ch1\/production_finish\/(?:CH1_1_PRODUCTION_MASTER\.png$|(?:outer\d+|skin\d+|floor\d+)_sources\/)/.test(path.replaceAll('\\','/'));
}

function isWebAuthoringSource(path) {
  return isMapAuthoringSource(path)
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
      for(const match of source.matchAll(/["'`]((?:assets|img|sprites|bgm|sfx|video|output)\/[^"'`\r\n]*)["'`]/g)) {
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
      if(selected.has(path)||isWebAuthoringSource(path))continue;
      if(exact.has(canonical)||prefixes.some(ref=>canonical.startsWith(ref))){selected.add(path);changed=true;}
    }
  }
  return tracked.filter(path=>selected.has(path)&&!isWebAuthoringSource(path));
}
