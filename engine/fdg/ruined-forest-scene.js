// One independently authored native encounter; no source artwork or combat implementation.
export const RUINED_FOREST_SCENE = Object.freeze({
  id: 'ruined-forest-first', name: '폐허 숲길', tileSize: 40, width: 72, height: 84,
  start: { x: 35, y: 68 }, exit: { x: 41, y: 16 },
  camera: { projection: 'perspective', yaw: 0, pitch: .92, distance: 2600, zoom: .82, near: 32 },
  regions: [
    { id: 'start', name: '남쪽 숲 입구', type: 'start', cx: 35, cy: 68, rx: 8, ry: 6 },
    { id: 'approach', name: '부서진 뿌리길', cx: 34, cy: 59, rx: 7, ry: 10 },
    { id: 'arena', name: '폐허 교전장', cx: 35, cy: 47, rx: 17, ry: 14 },
    { id: 'west', name: '시체나무 포켓', cx: 23, cy: 43, rx: 9, ry: 10 },
    { id: 'east', name: '동쪽 숨돌림터', cx: 50, cy: 39, rx: 8, ry: 8 },
    { id: 'north', name: '북쪽 탈출로', cx: 40, cy: 27, rx: 7, ry: 15 },
    { id: 'exit', name: '숲 밖으로', cx: 41, cy: 16, rx: 6, ry: 5 }
  ],
  enemies: [
    { x: 31, y: 55, etype: 0, skin: 'rot_knight' },
    { x: 39, y: 51, etype: 0, skin: 'skull_brute' },
    { x: 30, y: 43, etype: 1, skin: 'bone_archer' },
    { x: 43, y: 39, etype: 1, skin: 'etype1_archer' }
  ]
});

export function createRuinedForestTemplate() {
  const s = RUINED_FOREST_SCENE, cells = Array.from({ length: s.height }, () => Array(s.width).fill(2));
  for (let y = 1; y < s.height - 1; y++) for (let x = 1; x < s.width - 1; x++) {
    if (s.regions.some(r => ((x-r.cx)/r.rx)**2 + ((y-r.cy)/r.ry)**2 <= 1)) cells[y][x] = 1;
  }
  const tileRLE = [];
  for (const value of cells.flat()) {
    if (tileRLE.length && tileRLE.at(-2) === value) tileRLE[tileRLE.length-1]++;
    else tileRLE.push(value, 1);
  }
  const objs = [];
  const add = (id,x,y,scale=1,upright=false) => objs.push({id,x,y,scale,noCol:1,fdgUpright:upright});
  // LARGE: continuous side mass follows the authored nonwalkable silhouette.
  for (const [x,y,id,scale] of [
    [4,69,'m_c1bs',1.1],[53,71,'m_c1bsf',1.2],
    [7,59,'m_c1bw',1.3],[51,61,'m_c1be',1.3],
    [5,48,'m_c1bw',1.8],[6,36,'m_c1bwf',1.8],
    [65,51,'m_c1be',1.7],[61,39,'m_c1bef',1.7],
    [55,29,'m_c1cne',1.6],[28,26,'m_c1cnw',1.4],
    [29,16,'m_c1bnf',1.5],[63,12,'m_c1bn',1.7]
  ]) add(id,x,y,scale,true);
  // MEDIUM: root/edge connections stay on the ground below vertical silhouettes.
  for (const [x,y,scale] of [[25,65,1.1],[47,57,1.1],[18,45,1.4],[58,38,1.3],[29,27,.9],[49,19,.9]]) {
    add('m_c1groot',x,y,scale); add('m_c1gedgef',x-1,y+1,scale);
  }
  // GROUND: distinct approach, open combat dirt and a quieter exit connection.
  for (const [id,x,y,scale] of [['m_c1gpath',35,65,1.1],['m_c1gpathf',34,57,1.2],
    ['m_c1gbattle',35,47,1.3],['m_c1gpock',48,39,.9],['m_c1gpath',40,30,1.1],['m_c1gpathf',41,20,1]]) add(id,x,y,scale);
  // LANDMARK: the existing corpse tree occupies the west edge of the arena.
  add('m_c1groot',18,45,1.4); add('m_c1tree',8,45,.3,true);
  add('m_c1camp',52,38,.8,true);
  // SMALL: isolated story accents use at least five tile spacing, without random scatter.
  for (const [x,y] of [[30,62],[43,53],[25,42],[46,32],[36,20]]) add('m_c1sbone',x,y,.85);
  return { _fdgIndependentScene: s.id, _testbed: true, mw:s.width, mh:s.height,
    tileRLE, rooms:s.regions.map(r=>({...r,shape:'ellipse'})),corridors:[],spawnHoles:[],objs };
}

export function installRuinedForestSceneUi({ document: doc=globalThis.document, getState, start, restart }) {
  const panel=doc.createElement('section');panel.id='fdgRuinedForestPanel';
  panel.style.cssText='position:fixed;right:14px;top:12px;z-index:9100;width:250px;padding:12px;background:#111b17eb;border:1px solid #789083;border-radius:6px;color:#edf0da;font:13px sans-serif';
  const title=doc.createElement('strong');title.textContent='폐허 숲길 · 원근 교전';panel.append(title);
  const guide=doc.createElement('p');guide.textContent='WASD 이동 · 방향키 두 번 / Shift 돌진 · 좌클릭 근접 · 우클릭 마법 · E 물리 패링 · Q 마법 패링';panel.append(guide);
  const goal=doc.createElement('p');goal.textContent='남쪽 입구 → 교전장 → 북쪽 출구. 기존 NORMAL · Lv1 · 실제 몬스터 AI.';panel.append(goal);
  const status=doc.createElement('p');status.id='fdgRuinedForestStatus';panel.append(status);
  const play=doc.createElement('button');play.textContent='플레이 시작';play.addEventListener('click',()=>{start();play.hidden=true;guide.hidden=true;goal.hidden=true;});panel.append(play);
  const retry=doc.createElement('button');retry.textContent='처음부터 다시';retry.addEventListener('click',async()=>{retry.disabled=true;try{await restart();play.hidden=false;guide.hidden=false;goal.hidden=false;}finally{retry.disabled=false;}});panel.append(retry);
  for(const button of [play,retry])button.style.cssText='margin:4px 6px 0 0;padding:7px 10px;border:1px solid #789083;border-radius:4px;background:#273e31;color:#edf0da;font:inherit;cursor:pointer';
  doc.body.append(panel);
  const timer=setInterval(()=>{const s=getState();status.textContent=`${s.completed?'출구 도착':s.dead?'사망':s.running?'교전 진행':'시작 준비'} · 남은 적 ${s.alive} · HP ${Math.ceil(s.hp)} · ${s.fps} FPS`;},200);
  return {uninstall(){clearInterval(timer);panel.remove();}};
}
