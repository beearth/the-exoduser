// ═══ DUNGEON GENERATOR v2 — Wide Organic Dungeon ═══
// Large rooms + wide corridors + cellular automata smoothing
// Reference: dungeon_right.png (wide paths, organic walls)

export function generateDungeon(floor = 0) {
  const mw = 100 + floor * 8;
  const mh = 100 + floor * 8;
  const map = [];
  for (let y = 0; y < mh; y++) { map[y] = []; for (let x = 0; x < mw; x++) map[y][x] = 1; }

  // ═══ 1. PLACE ROOMS ═══
  const rooms = [];
  const maxRooms = 18 + floor * 2;
  const maxAttempts = 800;

  function rectsOverlap(a, b, pad = 3) {
    return a.x - pad < b.x + b.w + pad && a.x + a.w + pad > b.x - pad &&
           a.y - pad < b.y + b.h + pad && a.y + a.h + pad > b.y - pad;
  }

  // Carve an elliptical room
  function carveEllipse(cx, cy, rx, ry) {
    for (let dy = -ry; dy <= ry; dy++) for (let dx = -rx; dx <= rx; dx++) {
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) > 1.0) continue;
      const tx = cx + dx, ty = cy + dy;
      if (tx > 0 && tx < mw - 1 && ty > 0 && ty < mh - 1) map[ty][tx] = 0;
    }
  }

  // Carve rounded rectangle
  function carveRoundRect(x, y, w, h, cornerR) {
    for (let dy = 0; dy < h; dy++) for (let dx = 0; dx < w; dx++) {
      const tx = x + dx, ty = y + dy;
      if (tx <= 0 || tx >= mw - 1 || ty <= 0 || ty >= mh - 1) continue;
      // Round corners
      let inside = true;
      const cr = Math.min(cornerR, ~~(Math.min(w, h) / 2));
      if (dx < cr && dy < cr) inside = (dx - cr) ** 2 + (dy - cr) ** 2 <= cr * cr;
      else if (dx >= w - cr && dy < cr) inside = (dx - (w - 1 - cr)) ** 2 + (dy - cr) ** 2 <= cr * cr;
      else if (dx < cr && dy >= h - cr) inside = (dx - cr) ** 2 + (dy - (h - 1 - cr)) ** 2 <= cr * cr;
      else if (dx >= w - cr && dy >= h - cr) inside = (dx - (w - 1 - cr)) ** 2 + (dy - (h - 1 - cr)) ** 2 <= cr * cr;
      if (inside) map[ty][tx] = 0;
    }
  }

  for (let attempt = 0; attempt < maxAttempts && rooms.length < maxRooms; attempt++) {
    // Room shape variety
    const shape = Math.random();
    let w, h, rx, ry, cx, cy, x, y;

    if (shape < 0.4) {
      // Elliptical room
      rx = 5 + ~~(Math.random() * 6);
      ry = 4 + ~~(Math.random() * 5);
      cx = rx + 3 + ~~(Math.random() * (mw - rx * 2 - 6));
      cy = ry + 3 + ~~(Math.random() * (mh - ry * 2 - 6));
      x = cx - rx; y = cy - ry; w = rx * 2; h = ry * 2;
    } else {
      // Rounded rectangle
      w = 8 + ~~(Math.random() * 10);
      h = 7 + ~~(Math.random() * 8);
      x = 3 + ~~(Math.random() * (mw - w - 6));
      y = 3 + ~~(Math.random() * (mh - h - 6));
      cx = x + ~~(w / 2); cy = y + ~~(h / 2);
      rx = ~~(w / 2); ry = ~~(h / 2);
    }

    const room = { x, y, w, h, cx, cy, rx, ry, shape: shape < 0.4 ? 'ellipse' : 'rect', type: 'combat' };
    // Check overlap
    if (rooms.some(r => rectsOverlap(room, r, 4))) continue;
    // Bounds check
    if (x < 2 || y < 2 || x + w >= mw - 2 || y + h >= mh - 2) continue;

    rooms.push(room);
    if (room.shape === 'ellipse') carveEllipse(cx, cy, rx, ry);
    else carveRoundRect(x, y, w, h, 3);
  }

  if (rooms.length < 3) {
    // Fallback: force at least some rooms
    const cr = { x: ~~(mw / 2) - 6, y: ~~(mh / 2) - 5, w: 12, h: 10, cx: ~~(mw / 2), cy: ~~(mh / 2), rx: 6, ry: 5, shape: 'ellipse', type: 'start' };
    rooms.push(cr);
    carveEllipse(cr.cx, cr.cy, cr.rx, cr.ry);
  }

  // ═══ 2. CONNECT ROOMS (MST + extra loops) ═══
  // Minimum spanning tree using Prim's algorithm on room centers
  const connected = new Set([0]);
  const edges = []; // { from, to }

  while (connected.size < rooms.length) {
    let bestDist = Infinity, bestFrom = -1, bestTo = -1;
    for (const fi of connected) {
      for (let ti = 0; ti < rooms.length; ti++) {
        if (connected.has(ti)) continue;
        const dx = rooms[fi].cx - rooms[ti].cx;
        const dy = rooms[fi].cy - rooms[ti].cy;
        const d = dx * dx + dy * dy;
        if (d < bestDist) { bestDist = d; bestFrom = fi; bestTo = ti; }
      }
    }
    if (bestTo === -1) break;
    connected.add(bestTo);
    edges.push({ from: bestFrom, to: bestTo });
  }

  // Extra loop connections (30% of non-MST edges)
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      if (edges.some(e => (e.from === i && e.to === j) || (e.from === j && e.to === i))) continue;
      const dx = rooms[i].cx - rooms[j].cx;
      const dy = rooms[i].cy - rooms[j].cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 35 && Math.random() < 0.35) {
        edges.push({ from: i, to: j });
      }
    }
  }

  // Carve wide corridors between connected rooms
  function carveCorridor(r1, r2) {
    let x1 = r1.cx, y1 = r1.cy, x2 = r2.cx, y2 = r2.cy;
    const corridorW = 3 + ~~(Math.random() * 2); // 3-4 tiles wide

    // L-shaped or straight corridor
    const bendFirst = Math.random() > 0.5; // horizontal or vertical first
    const midX = bendFirst ? x2 : x1;
    const midY = bendFirst ? y1 : y2;

    // Segment 1
    carveWideSegment(x1, y1, midX, midY, corridorW);
    // Segment 2
    carveWideSegment(midX, midY, x2, y2, corridorW);
  }

  function carveWideSegment(x1, y1, x2, y2, w) {
    const dx = x2 - x1, dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));
    if (steps === 0) return;
    const hw = ~~(w / 2);

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const cx = ~~(x1 + dx * t);
      const cy = ~~(y1 + dy * t);
      // Add noise to corridor width for organic feel
      const noise = Math.sin(i * 0.3) * 1.2;
      const curW = hw + ~~noise;

      for (let oy = -curW; oy <= curW; oy++) {
        for (let ox = -curW; ox <= curW; ox++) {
          const tx = cx + ox, ty = cy + oy;
          if (tx > 0 && tx < mw - 1 && ty > 0 && ty < mh - 1) {
            map[ty][tx] = 0;
          }
        }
      }
    }
  }

  for (const edge of edges) {
    carveCorridor(rooms[edge.from], rooms[edge.to]);
  }

  // ═══ 3. CELLULAR AUTOMATA — organic wall smoothing ═══
  for (let pass = 0; pass < 3; pass++) {
    const tmp = map.map(row => [...row]);
    for (let y = 2; y < mh - 2; y++) for (let x = 2; x < mw - 2; x++) {
      let floorN = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        if (tmp[y + dy][x + dx] === 0) floorN++;
      }
      // Wall with many floor neighbors → floor (smooths edges)
      if (tmp[y][x] === 1 && floorN >= 5) map[y][x] = 0;
      // Also add small random openings for organic feel
      if (tmp[y][x] === 1 && floorN >= 3 && Math.random() < (pass === 0 ? 0.35 : 0.15)) map[y][x] = 0;
    }
  }

  // ═══ 4. RANDOM ALCOVES & CAVES ═══
  const numAlcoves = 8 + ~~(Math.random() * 8);
  for (let a = 0; a < numAlcoves; a++) {
    // Find a wall adjacent to floor
    for (let attempt = 0; attempt < 50; attempt++) {
      const ax = 5 + ~~(Math.random() * (mw - 10));
      const ay = 5 + ~~(Math.random() * (mh - 10));
      if (map[ay][ax] !== 1) continue;
      let adjFloor = false;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (map[ay + dy] && map[ay + dy][ax + dx] === 0) adjFloor = true;
      }
      if (!adjFloor) continue;
      // Carve small cave
      const r = 2 + ~~(Math.random() * 3);
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r * (0.7 + Math.random() * 0.3)) continue;
        const tx = ax + dx, ty = ay + dy;
        if (tx > 0 && tx < mw - 1 && ty > 0 && ty < mh - 1) map[ty][tx] = 0;
      }
      break;
    }
  }

  // ═══ 5. ASSIGN ROOM TYPES ═══
  // BFS from first room to find distances
  function bfsRoomDist(startIdx) {
    const dist = rooms.map(() => -1);
    dist[startIdx] = 0;
    const q = [startIdx];
    while (q.length) {
      const ci = q.shift();
      for (const e of edges) {
        let ni = -1;
        if (e.from === ci && dist[e.to] === -1) ni = e.to;
        if (e.to === ci && dist[e.from] === -1) ni = e.from;
        if (ni !== -1) { dist[ni] = dist[ci] + 1; q.push(ni); }
      }
    }
    return dist;
  }

  const roomDist = bfsRoomDist(0);
  // Start room = index 0
  rooms[0].type = 'start';
  // Boss room = farthest
  let bossIdx = 0, maxD = 0;
  for (let i = 1; i < rooms.length; i++) {
    if (roomDist[i] > maxD) { maxD = roomDist[i]; bossIdx = i; }
  }
  rooms[bossIdx].type = 'boss';
  // Forge = mid-distance
  const midD = ~~(maxD / 2);
  for (let i = 1; i < rooms.length; i++) {
    if (rooms[i].type !== 'combat') continue;
    if (Math.abs(roomDist[i] - midD) <= 1) { rooms[i].type = 'forge'; break; }
  }

  // ═══ 6. EXIT TILES ═══
  const exits = [];
  const bossRoom = rooms[bossIdx];
  if (bossRoom) {
    const ex = bossRoom.cx, ey = bossRoom.cy + ~~(bossRoom.ry || bossRoom.h / 2) - 1;
    if (ey > 0 && ey < mh && ex > 0 && ex + 1 < mw) {
      map[ey][ex] = 2; map[ey][ex + 1] = 2;
      exits.push({ x: ex, y: ey }, { x: ex + 1, y: ey });
    }
  }

  // ═══ 7. CONNECTIVITY — flood fill from start, remove isolated ═══
  const startRoom = rooms[0];
  const vis = [];
  for (let y = 0; y < mh; y++) { vis[y] = []; for (let x = 0; x < mw; x++) vis[y][x] = false; }
  const q = [{ x: startRoom.cx, y: startRoom.cy }];
  vis[startRoom.cy][startRoom.cx] = true;
  while (q.length) {
    const c = q.shift();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = c.x + dx, ny = c.y + dy;
      if (nx >= 0 && nx < mw && ny >= 0 && ny < mh && !vis[ny][nx] && map[ny][nx] !== 1) {
        vis[ny][nx] = true; q.push({ x: nx, y: ny });
      }
    }
  }
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    if (map[y][x] === 0 && !vis[y][x]) map[y][x] = 1;
  }

  // ═══ 8. BUILD DECORATION DATA — 레퍼런스 밀도 기준 ═══
  const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];

  // ── 벽 경계 엣지 (벽과 바닥 닿는 모든 곳) ──
  const edgesList = [];
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    if (map[y][x] !== 0 && map[y][x] !== 2) continue;
    for (let d = 0; d < 4; d++) {
      const nx = x + DIRS[d][0], ny = y + DIRS[d][1];
      if (nx >= 0 && nx < mw && ny >= 0 && ny < mh && map[ny][nx] === 1) {
        edgesList.push({ x, y, dir: d });
      }
    }
  }

  // ── 벽에서 2칸 안쪽까지 추가 엣지 (벽 근처 유기적 침식) ──
  const wallDist = []; // 각 바닥 타일의 가장 가까운 벽까지 거리
  for (let y = 0; y < mh; y++) { wallDist[y] = []; for (let x = 0; x < mw; x++) wallDist[y][x] = 99; }
  // BFS from all walls
  const wq = [];
  for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
    if (map[y][x] === 1) { wallDist[y][x] = 0; wq.push({ x, y }); }
  }
  let wi = 0;
  while (wi < wq.length) {
    const c = wq[wi++];
    if (wallDist[c.y][c.x] >= 3) continue;
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = c.x + dx, ny = c.y + dy;
      if (nx >= 0 && nx < mw && ny >= 0 && ny < mh && wallDist[ny][nx] > wallDist[c.y][c.x] + 1) {
        wallDist[ny][nx] = wallDist[c.y][c.x] + 1;
        wq.push({ x: nx, y: ny });
      }
    }
  }

  // ── 데칼: 벽 근처 집중 + 전체 산포 (15~20% 커버리지) ──
  const decals = [];
  for (let y = 1; y < mh - 1; y++) for (let x = 1; x < mw - 1; x++) {
    if (map[y][x] !== 0) continue;
    const wd = wallDist[y][x];
    // 벽 바로 옆(1칸): 40% 확률 데칼
    // 벽 2칸: 20% 확률
    // 그 외: 6% 확률
    const chance = wd <= 1 ? 0.40 : wd <= 2 ? 0.20 : 0.06;
    if (Math.random() < chance) {
      // 벽 근처: 뼈/껍질(3), 점액(2) 위주. 그 외: 알무리(0), 고치(1) 위주
      let type;
      if (wd <= 1) type = Math.random() < 0.6 ? 3 : 2;  // bones/slime
      else if (wd <= 2) type = ~~(Math.random() * 4);     // any
      else type = Math.random() < 0.5 ? 0 : 1;           // eggs/cocoon
      decals.push({ x, y, type });
    }
  }

  // ── 바닥 노이즈 오버레이 (모든 바닥에 14번 타일) ──
  const overlays = [];
  for (let y = 1; y < mh - 1; y++) for (let x = 1; x < mw - 1; x++) {
    if (map[y][x] !== 0) continue;
    if (Math.random() < 0.35) { // 35% 바닥에 노이즈 오버레이
      overlays.push({ x, y, type: 14 }); // floor_noise
    }
  }

  // ── 글로우 포자: 방 + 복도 전역 ──
  const glows = [];
  // 방 내부 (집중)
  for (const room of rooms) {
    const count = room.type === 'boss' ? 10 : room.type === 'forge' ? 6 : 4;
    for (let i = 0; i < count; i++) {
      const gx = room.cx + ~~((Math.random() - 0.5) * (room.rx || room.w / 2) * 1.4);
      const gy = room.cy + ~~((Math.random() - 0.5) * (room.ry || room.h / 2) * 1.4);
      if (gy >= 0 && gy < mh && gx >= 0 && gx < mw && map[gy][gx] === 0) {
        glows.push({ x: gx, y: gy, type: Math.random() > 0.5 ? 0 : 1 });
      }
    }
  }
  // 복도 벽 근처 포자 (벽 1~2칸 거리)
  for (let y = 2; y < mh - 2; y += 2) for (let x = 2; x < mw - 2; x += 2) {
    if (map[y][x] !== 0) continue;
    const wd = wallDist[y][x];
    if (wd >= 1 && wd <= 2 && Math.random() < 0.12) {
      glows.push({ x, y, type: 0 }); // spore glow
    }
  }

  return {
    map, mw, mh, rooms, exits,
    edges: edgesList, decals, glows, overlays,
    wallDist,
    startRoom: rooms[0],
    bossRoom: rooms[bossIdx],
  };
}
