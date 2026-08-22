// [사용법 1] game.html(게임 화면)에서 F12 → Console 탭 열기
// [사용법 2] 이 파일 전체를 복사해 콘솔에 붙여넣고 Enter (initStage를 0~34 순회하며 해결된 G.map 덤프)
// [사용법 3] 자동 다운로드된 resolved-maps.json 을 maps/resolved-maps.json 으로 저장 후 → node tools/map-audit.js
//   ⚠ 로비 또는 안전한 상태에서 실행할 것(순회 중 스테이지가 바뀌며, 끝나면 원래 스테이지로 복구됨).
(function () {
  if (typeof initStage !== 'function' || typeof G === 'undefined') {
    alert('game.html(게임 화면)의 콘솔에서 실행하세요.');
    return;
  }
  const TS = (typeof TOTAL_STAGES !== 'undefined') ? TOTAL_STAGES : 35;
  const _origStage = G.stage, _origOn = G.on;

  // G.map(2D int) → 문자열 RLE "v:count;v:count;..." (행 우선 평탄화)
  function rleStr(map, mw, mh) {
    let out = '', runV = null, runC = 0;
    for (let y = 0; y < mh; y++) {
      const row = map[y] || [];
      for (let x = 0; x < mw; x++) {
        const v = row[x] | 0;
        if (v === runV) { runC++; }
        else { if (runV !== null) out += runV + ':' + runC + ';'; runV = v; runC = 1; }
      }
    }
    if (runV !== null) out += runV + ':' + runC + ';';
    return out;
  }

  const stages = [];
  for (let si = 0; si < TS; si++) {
    try {
      initStage(si);
      const mw = G.mw, mh = G.mh;
      const rooms = (G.rooms || []).map(r => ({ id: r.id, type: r.type, cx: r.cx, cy: r.cy, x: r.x, y: r.y, w: r.w, h: r.h }));
      const spawnHoles = (G.spawnHoles || []).map(s => ({ x: s.x, y: s.y, size: s.size, room: s.room }));
      const mo = (typeof MAP_OBJS !== 'undefined' && MAP_OBJS) ? MAP_OBJS : [];
      const mapObjs = mo.map(o => ({ type: o.type, x: o.x, y: o.y, hell: o.hell }));
      stages.push({ si, mapType: G.mapType, mw, mh, rle: rleStr(G.map, mw, mh), rooms, spawnHoles, mapObjs });
    } catch (e) {
      stages.push({ si, error: String((e && e.message) || e) });
    }
  }

  // 원래 스테이지 복구
  try { initStage(_origStage); G.on = _origOn; } catch (e) {}

  // _OBJ_META(오브젝트 크기 상수) 참고용 동봉
  const objMeta = {};
  try {
    if (typeof _OBJ_META === 'object' && _OBJ_META) {
      for (const k in _OBJ_META) { const m = _OBJ_META[k] || {}; objMeta[k] = { sz: m.sz, colW: m.colW, colH: m.colH, colSz: m.colSz }; }
    }
  } catch (e) {}

  const payload = {
    T: (typeof T !== 'undefined') ? T : 40,
    tileConv: 'runtime: 0=floor, 1=wall, 4=special-floor; floor=(v===0||v===4)',
    totalStages: TS,
    objMeta,
    stages,
  };
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'resolved-maps.json';
  document.body.appendChild(a); a.click(); a.remove();
  console.log('[dump] stages=' + stages.length + ' errors=' + stages.filter(s => s.error).length +
    ' → resolved-maps.json 다운로드됨. maps/resolved-maps.json 로 저장 후 `node tools/map-audit.js`');
})();
