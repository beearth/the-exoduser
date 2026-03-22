/**
 * build_monster_atlas.js
 * img/monsters/etypeNN_full/ 폴더에서 rotations 4방향(north,south,east,west) +
 * animations(idle,walk,atk,hit)를 합쳐 atlas.png + atlas.json 생성
 *
 * Usage: node tools/build_monster_atlas.js [--only=0,1,2] [--force]
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const MONSTERS_DIR = path.join(__dirname, '..', 'img', 'monsters');
const CELL = 48; // 기본 프레임 크기
const CELL_OVERRIDE = { 89: 80 }; // etype별 셀 크기 오버라이드

// 방향 매핑 (rotations)
const DIRS = ['south', 'south-west', 'west', 'north-west', 'north', 'north-east', 'east', 'south-east'];
const DIR4 = ['south', 'west', 'north', 'east']; // 기본 4방향

// 애니메이션 매핑 (폴더명 → 키)
const ANIM_MAP = {
  'breathing-idle': { key: 'idle', priority: 0 },
  'fight-stance-idle-8-frames': { key: 'idle', priority: 1 },
  'walking-4-frames': { key: 'walk', priority: 0 },
  'walking-8-frames': { key: 'walk', priority: 1 },
  'cross-punch': { key: 'atk', priority: 0 },
  'lead-jab': { key: 'atk', priority: 1 },
  'surprise-uppercut': { key: 'atk', priority: 2 },
  'hurricane-kick': { key: 'atk', priority: 3 },
  'pushing': { key: 'atk', priority: 4 },
  'fireball': { key: 'atk', priority: 5 },
  'taking-punch': { key: 'hit', priority: 0 },
  'falling-back-death': { key: 'death', priority: 0 },
  'crouching': { key: 'crouch', priority: 0 },
};

// 방향 폴백: 없는 방향은 미러링으로 대체
const DIR_MIRROR = {
  'east': 'west',
  'north-east': 'north-west',
  'south-east': 'south-west',
};

async function getFrames(animDir, dirName) {
  // 직접 방향 폴더 확인
  let dir = path.join(animDir, dirName);
  let flip = false;

  if (!fs.existsSync(dir)) {
    // 미러 방향 폴백
    const mirror = DIR_MIRROR[dirName];
    if (mirror) {
      dir = path.join(animDir, mirror);
      flip = true;
    }
  }

  if (!fs.existsSync(dir)) return { frames: [], flip: false };

  const files = fs.readdirSync(dir)
    .filter(f => f.startsWith('frame_') && f.endsWith('.png'))
    .sort();

  return {
    frames: files.map(f => path.join(dir, f)),
    flip
  };
}

async function processMonster(folder) {
  const etypeMatch = folder.match(/etype(\d+)/);
  if (!etypeMatch) return null;
  const etype = parseInt(etypeMatch[1]);
  const base = path.join(MONSTERS_DIR, folder);

  console.log(`[${etype}] ${folder} 처리 중...`);

  // 1) rotations (정지 프레임)
  const rotDir = path.join(base, 'rotations');
  const rotations = {};
  if (fs.existsSync(rotDir)) {
    for (const d of DIRS) {
      let imgPath = path.join(rotDir, d + '.png');
      let flip = false;
      if (!fs.existsSync(imgPath) && DIR_MIRROR[d]) {
        imgPath = path.join(rotDir, DIR_MIRROR[d] + '.png');
        flip = true;
      }
      if (fs.existsSync(imgPath)) {
        rotations[d] = { path: imgPath, flip };
      }
    }
  }

  // 2) animations
  const animDir = path.join(base, 'animations');
  const anims = {}; // key → { dirName → { frames[], flip } }

  if (fs.existsSync(animDir)) {
    const animFolders = fs.readdirSync(animDir).filter(f =>
      fs.statSync(path.join(animDir, f)).isDirectory()
    );

    for (const af of animFolders) {
      const mapped = ANIM_MAP[af];
      if (!mapped) continue;

      // 같은 키에 대해 우선순위 체크 (이미 있으면 스킵)
      if (anims[mapped.key] && anims[mapped.key]._priority <= mapped.priority) continue;

      const animData = {};
      const afDir = path.join(animDir, af);
      const dirFolders = fs.readdirSync(afDir).filter(f =>
        fs.statSync(path.join(afDir, f)).isDirectory()
      );

      for (const d of DIRS) {
        const result = await getFrames(afDir, d);
        if (result.frames.length > 0) {
          animData[d] = result;
        }
      }

      if (Object.keys(animData).length > 0) {
        animData._priority = mapped.priority;
        animData._srcFolder = af;
        anims[mapped.key] = animData;
      }
    }
  }

  // 3) 아틀라스 레이아웃 계산
  // 구조: rows = 방향별, cols = [rot, idle0..N, walk0..N, atk0..N, hit0..N, death0..N]
  const cellSize = CELL_OVERRIDE[etype] || CELL;
  const layout = []; // { row, col, path, flip }
  const meta = {
    etype,
    cell: cellSize,
    dirs: [],
    anims: {} // key → { start, count } (열 기준)
  };

  // 사용할 방향 결정 (rotations + animations에 있는 방향)
  const availDirs = new Set();
  for (const d of DIRS) {
    if (rotations[d]) availDirs.add(d);
  }
  for (const key in anims) {
    for (const d of DIRS) {
      if (anims[key][d]) availDirs.add(d);
    }
  }
  // DIRS 순서 유지
  const usedDirs = DIRS.filter(d => availDirs.has(d));
  meta.dirs = usedDirs;

  // 열 배치: rot(1) + 각 애니메이션 프레임
  let col = 0;

  // rot 열
  meta.anims.rot = { start: 0, count: 1 };
  for (let row = 0; row < usedDirs.length; row++) {
    const d = usedDirs[row];
    if (rotations[d]) {
      layout.push({ row, col: 0, ...rotations[d] });
    }
  }
  col = 1;

  // 애니메이션 열
  const ANIM_ORDER = ['idle', 'walk', 'atk', 'hit', 'death', 'crouch'];
  for (const animKey of ANIM_ORDER) {
    if (!anims[animKey]) continue;
    const anim = anims[animKey];

    // 프레임 수 = 가장 많은 방향의 프레임 수
    let maxFrames = 0;
    for (const d of usedDirs) {
      if (anim[d] && anim[d].frames) {
        maxFrames = Math.max(maxFrames, anim[d].frames.length);
      }
    }
    if (maxFrames === 0) continue;

    meta.anims[animKey] = { start: col, count: maxFrames };

    for (let row = 0; row < usedDirs.length; row++) {
      const d = usedDirs[row];
      if (!anim[d]) continue;
      for (let fi = 0; fi < anim[d].frames.length; fi++) {
        layout.push({ row, col: col + fi, path: anim[d].frames[fi], flip: anim[d].flip });
      }
    }
    col += maxFrames;
  }

  if (layout.length === 0) {
    console.log(`  [SKIP] 이미지 없음`);
    return null;
  }

  const totalCols = col;
  const totalRows = usedDirs.length;
  meta.cols = totalCols;
  meta.rows = totalRows;

  // 4) 아틀라스 이미지 합성
  const width = totalCols * cellSize;
  const height = totalRows * cellSize;

  // 투명 배경 생성
  let composite = sharp({
    create: {
      width, height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).png();

  const compositeInputs = [];
  for (const item of layout) {
    let img = sharp(item.path).resize(cellSize, cellSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
    if (item.flip) {
      img = img.flop(); // 수평 뒤집기
    }
    const buf = await img.toBuffer();
    compositeInputs.push({
      input: buf,
      left: item.col * cellSize,
      top: item.row * cellSize,
    });
  }

  const atlasPath = path.join(base, 'atlas.png');
  const jsonPath = path.join(base, 'atlas.json');

  await sharp({
    create: {
      width, height,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).composite(compositeInputs).png().toFile(atlasPath);

  // 5) JSON 메타데이터
  const frames = [];
  for (const item of layout) {
    frames.push({
      dir: usedDirs[item.row],
      col: item.col,
      row: item.row,
      x: item.col * cellSize,
      y: item.row * cellSize,
      w: cellSize,
      h: cellSize,
      flip: item.flip || false,
    });
  }

  const jsonData = {
    etype,
    cell: cellSize,
    width,
    height,
    dirs: usedDirs,
    anims: meta.anims,
    frames,
  };

  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

  console.log(`  ✓ atlas.png (${width}×${height}, ${layout.length}프레임) + atlas.json`);
  return jsonData;
}

async function main() {
  const args = process.argv.slice(2);
  const onlyArg = args.find(a => a.startsWith('--only='));
  const onlyList = onlyArg ? onlyArg.split('=')[1].split(',').map(Number) : null;
  const force = args.includes('--force');

  // _full 폴더만 대상
  const folders = fs.readdirSync(MONSTERS_DIR)
    .filter(f => f.endsWith('_full') && fs.statSync(path.join(MONSTERS_DIR, f)).isDirectory())
    .sort((a, b) => {
      const na = parseInt(a.match(/\d+/)[0]);
      const nb = parseInt(b.match(/\d+/)[0]);
      return na - nb;
    });

  console.log(`=== 몬스터 아틀라스 빌더 ===`);
  console.log(`대상: ${folders.length}개 폴더\n`);

  const allMeta = [];
  let ok = 0, skip = 0, fail = 0;

  for (const folder of folders) {
    const etype = parseInt(folder.match(/\d+/)[0]);
    if (onlyList && !onlyList.includes(etype)) continue;

    // 이미 있으면 스킵 (--force로 재생성)
    if (!force && fs.existsSync(path.join(MONSTERS_DIR, folder, 'atlas.png'))) {
      console.log(`[${etype}] ${folder} — atlas 존재, 스킵 (--force로 재생성)`);
      // 기존 JSON 읽기
      const jp = path.join(MONSTERS_DIR, folder, 'atlas.json');
      if (fs.existsSync(jp)) {
        try { allMeta.push(JSON.parse(fs.readFileSync(jp, 'utf8'))); } catch (e) {}
      }
      skip++;
      continue;
    }

    try {
      const result = await processMonster(folder);
      if (result) { allMeta.push(result); ok++; }
      else skip++;
    } catch (e) {
      console.error(`  [ERROR] ${folder}: ${e.message}`);
      fail++;
    }
  }

  // 요약 JSON (game.html에서 참조용)
  const summaryPath = path.join(MONSTERS_DIR, '_atlas_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(allMeta, null, 2));

  console.log(`\n=== 완료 ===`);
  console.log(`성공: ${ok} | 스킵: ${skip} | 실패: ${fail}`);
  console.log(`요약: ${summaryPath}`);
}

main().catch(e => { console.error(e); process.exit(1); });
