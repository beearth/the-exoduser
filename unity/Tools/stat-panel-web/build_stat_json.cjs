// PC-A13: cap_stat_assets.cjs 가 뽑은 web_stat_defs_raw.json + stat-panel-ui.js 의 노트 표를 합쳐 stat_panel_web.json 생성.
// 정의(이름·설명·위치·연결·길 분류·최대 레벨·기여 공식 문구)만 담는다. 투자 레벨·SP/AP·습득 여부 같은 상태는 담지 않는다.
// 사용: node build_stat_json.cjs <cap-dir> <stat-panel-ui.js> <out.json> <web-commit>
const fs = require('fs');
const [capDir, jsPath, outPath, webCommit] = process.argv.slice(2);
const raw = JSON.parse(fs.readFileSync(capDir + '/web_stat_defs_raw.json', 'utf8'));
const src = fs.readFileSync(jsPath, 'utf8');
const m = src.match(/const notes=\{([\s\S]*?)\n  \};/);
const notes = eval('({' + m[1] + '})');
const strip = s => String(s).replace(/^[^\p{L}(]+/u, '');
const DEFAULT_NOTE = ['다른 패시브와 함께 투자할 수 있습니다. 표는 이 패시브의 기여이며, 최종 전투 능력치는 장비·조건에 따라 달라집니다.', 'Combine with other passives. These are this passive’s contributions; final combat stats depend on gear and conditions.'];
const STAT_NOTE = ['직접 투자한 능력치의 기본 기여입니다. 레벨·장비·패시브 배율은 전투 능력치에 합산됩니다. 재생은 초당 기준이며, 근성 방어는 전체 근성을 합산한 뒤 내림합니다.', 'Base contribution from allocated points. Level, gear and passive multipliers are included in combat stats. Regeneration is per second; GRIT defense rounds down after total GRIT is summed.'];
const statPath = { str: 'assault', dex: 'precision', int: 'arcane', lck: 'fate', grit: 'survival' };
const { defs, detail } = raw;
const r2 = n => Math.round(n * 100) / 100;
const body = Object.fromEntries(defs.body.map(b => [b.key, b]));
const pathOf = key => { const p = defs.paths.find(p => p.keys.includes(key)); return p ? p.id : statPath[key]; };

const nodes = [];
for (const b of defs.body) {
  const stat = b.stat;
  const d = stat ? defs.stats.find(s => s.key === b.key) : defs.passive.find(p => p.key === b.key);
  nodes.push({
    key: b.key, kind: stat ? 'stat' : 'passive', x: b.x, y: b.y, parent: b.parent, major: b.major,
    max: stat ? (d.cap == null ? 0 : d.cap) : d.max, uncapped: stat && d.cap == null,
    path: pathOf(b.key), glyph: b.key,
    nameKo: detail[b.key].name, nameEn: strip(d.nameEn), descKo: strip(d.desc), descEn: strip(d.descEn),
    statLabel: stat ? b.key.toUpperCase() : '',
    noteKo: (stat ? STAT_NOTE : (notes[b.key] || DEFAULT_NOTE))[0], noteEn: (stat ? STAT_NOTE : (notes[b.key] || DEFAULT_NOTE))[1],
    effects: d.effects.map(e => ({ ko: e.ko, en: e.en, per: e.per, unit: e.unit, base: e.base || 0, cap: e.cap == null ? -1 : e.cap })),
  });
}
const pathNodeCount = id => nodes.filter(n => n.path === id).reduce((s, n) => s + (n.kind === 'passive' ? n.max : 1), 0);
const paths = defs.paths.map(p => ({ id: p.id, ko: p.ko, en: p.en, glyph: p.icon, color: p.color, keys: p.keys, hintKo: p.hint[0], hintEn: p.hint[1], total: pathNodeCount(p.id) }));
const out = {
  source: {
    webCommit, statPanelUiLastCommit: '2cc7bdfdc', files: ['G:/exoduser/stat-panel-ui.js', 'G:/exoduser/game.html (PASSIVE_DEF/STAT_DEF/STAT_MAX/_glyph)'],
    extractedAt: new Date().toISOString(), tool: 'Tools/stat-panel-web/cap_stat_assets.cjs + build_stat_json.cjs',
    note: '정의 전용(이름·설명·위치·연결·길 분류·최대 레벨·기여 공식 문구). 투자 레벨/SP/AP/습득 여부 등 상태는 포함하지 않음.',
  },
  costs: [1, 1, 1, 2, 2, 2, 3, 3, 3, 5],
  joints: Object.entries(defs.joints).map(([key, j]) => ({ key, x: j.x, y: j.y, parent: j.parent || '' })),
  paths, totalNodes: nodes.reduce((s, n) => s + (n.kind === 'passive' ? n.max : 1), 0),
  nodes,
  stars: defs.constellation.nodes.map(n => ({ id: n.id, key: n.key, rank: n.rank, x: r2(n.x), y: r2(n.y) })),
  starLinks: defs.constellation.links,
};
fs.writeFileSync(outPath, JSON.stringify(out));
console.log(JSON.stringify({ nodes: nodes.length, stars: out.stars.length, total: out.totalNodes, paths: paths.map(p => p.id + ':' + p.total) }));
