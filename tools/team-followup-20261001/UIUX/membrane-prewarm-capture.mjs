export function createCapture({now, runId, limit = 64}) {
  if (typeof now !== 'function' || typeof runId !== 'string' || !runId || runId.length > 128 || !Number.isInteger(limit) || limit < 1 || limit > 64) throw new TypeError('잘못된 캡처 계약');
  const rows = [];
  let dropped = 0;
  let closed = false;
  function observe(stage, phase, wet, surfaceOnly, variant, key) {
    if (closed) return;
    if (!['membrane','atlas'].includes(stage) || !['init','miss','commit'].includes(phase)) throw new TypeError('알 수 없는 관측 종류');
    if (phase === 'init') {
      if ([wet,surfaceOnly,variant,key].some(value => value !== null)) throw new TypeError('초기화 필드 불일치');
    } else if (typeof wet !== 'boolean' || typeof surfaceOnly !== 'boolean' || !Number.isInteger(variant) || variant < 0 || variant > 2 || !Number.isInteger(key) || key < 0 || key > 5) throw new TypeError('스칼라 관측 계약 불일치');
    if (rows.length >= limit) { dropped++; return; }
    const time = now();
    if (!Number.isFinite(time)) throw new TypeError('유효하지 않은 시각');
    rows.push({runId, time, stage, phase, wet, surfaceOnly, variant, key});
  }
  return Object.freeze({observe, close() { closed = true; }, snapshot() { return {runId, closed, dropped, rows: rows.map(row => ({...row}))}; }});
}

export function instrumentSource(source) {
  function replaceOnce(before, after) {
    if (source.split(before).length !== 2) throw new Error('원소스 문맥 불일치');
    source = source.replace(before, after);
  }
  replaceOnce("  'use strict';", "  'use strict';\n  function observeMembrane(stage,phase,wet,surfaceOnly,variant,key){\n    try{const observer=root.__uiuxMembraneCapture;if(observer)observer.observe(stage,phase,wet,surfaceOnly,variant,key);}catch{}\n  }");
  replaceOnce('  const membranes=[];', "  const membranes=[];\n  observeMembrane('membrane','init',null,null,null,null);");
  replaceOnce('const id=wet?3:variant;if(membranes[id])return membranes[id];', "const id=wet?3:variant;if(membranes[id])return membranes[id];\n    observeMembrane('membrane','miss',wet,false,variant,id);");
  replaceOnce('membranes[id]=a;return a;', "membranes[id]=a;\n    observeMembrane('membrane','commit',wet,false,variant,id);return a;");
  replaceOnce('  const atlases=[];', "  const atlases=[];\n  observeMembrane('atlas','init',null,null,null,null);");
  replaceOnce('const id=surfaceOnly?(wet?2:3):wet?1:variant?3+variant:0;if(atlases[id])return atlases[id];', "const id=surfaceOnly?(wet?2:3):wet?1:variant?3+variant:0;if(atlases[id])return atlases[id];\n    observeMembrane('atlas','miss',wet,surfaceOnly,variant,id);");
  replaceOnce('atlases[id]=a;return a;', "atlases[id]=a;\n    observeMembrane('atlas','commit',wet,surfaceOnly,variant,id);return a;");
  return source;
}
