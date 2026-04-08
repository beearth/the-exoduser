const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const https = require('https');
const {execSync} = require('child_process');

const CELL = 256;
const COLS = 8; // 40종 → 8x5=40 딱 맞음
const USE_FRAMES = 4;
const SAMPLE = [0, 1, 3, 5];
const DIRS = ['south','south-east','east','north-east','north','north-west','west','south-west'];
const DIR_FILE = ['south','south_east','east','north_east','north','north_west','west','south_west'];
const TMP = path.join(__dirname, '_tmp_atlas');
const BASE = 'https://backblaze.pixellab.ai/file/pixellab-characters/1c4e63db-1f78-4fbe-a6d5-35995753bd06';

const ALL_MOBS = [
  {name:'blood_swarm',id:'04941b16-85d2-4db8-8ffa-012cc62147e6'},
  {name:'apostle_mass',id:'b215e7a0-6336-4a73-b338-5b62cf66149e'},
  {name:'apostle_knight',id:'4e506ba8-0a20-47a2-b3a9-0a5e8c2bf424'},
  {name:'soul_flame',id:'1928ffd1-bb39-4b4a-b453-f058b1c5b594'},
  {name:'hive_bloater',id:'1574146f-ac2e-498f-8546-21e35f73fec2'},
  {name:'spine_beast',id:'7d319b64-50b3-4edf-a8a7-0f3368f2fe71'},
  {name:'flesh_crawler',id:'1e159b4b-249f-45dc-a2c1-81e88ac4a974'},
  {name:'carapace_predator',id:'1ff79754-3610-4f7d-a9e6-815980b15f01'},
  {name:'bone_centipede_pro',id:'1a9b5f11-b3bd-4eea-ace0-74b5962af3ca'},
  {name:'gas_zombie',id:'f138750c-a7d0-4666-9b72-2ab5dadd731f'},
  {name:'needle_tentacle',id:'10708932-e02e-4a03-8ebb-65b001e9d64c'},
  {name:'rotting_slime_mass',id:'a69aaa09-7309-4cac-a327-003913874a01'},
  {name:'flesh_eye_mass',id:'dd7e5f31-243c-4ff5-8ce6-65f31e1fe49b'},
  {name:'corrupted_wolf',id:'15dd8ebb-d94c-4501-ad54-a96432fb837c'},
  {name:'crawling_horror',id:'5fdbbad8-b631-490f-8b38-69a49693ba8a'},
  {name:'eye_stalker_pro',id:'decd76fa-902e-4854-8df0-f976caa98aa7'},
  {name:'iron_butcher_pro',id:'bc0855ec-ccdc-4d03-ab2e-492f0437c461'},
  {name:'plague_doctor_pro',id:'6a0cd036-d301-43db-aeec-b1dd95d454d4'},
  {name:'grotesque_quadruped',id:'cb7cfd95-11c1-428c-a3ce-e1d7bb9f3018'},
  {name:'black_castle_guardian',id:'86feebb2-a815-45ea-94bc-4ff0762c691a'},
  {name:'poison_mushroom_giant',id:'ae830a8d-7f2c-4aa2-8ddc-e5e323918f1f'},
  {name:'forest_watcher',id:'2d15ba18-b5b2-4593-8a25-d41e2692569a'},
  {name:'boss_ch1_stag',id:'1d2cba78-f46f-4133-8efa-d8e4a8d9e875'},
  {name:'headless_knight',id:'4cc1c017-2674-4591-b32f-64676f213fa1'},
  {name:'plague_censer',id:'608a7f74-0e92-405a-8799-3ccf9823d18b'},
  {name:'skinless_hound',id:'e9c3d370-0142-4e9c-8db1-e18586b7ba1f'},
  {name:'deformed_giant',id:'338ab327-5945-4101-bfbd-75ec3ec43b85'},
  {name:'gut_witch',id:'5cfb7ebc-a0e9-4c83-b5c0-f49ccd5f733f'},
  {name:'iron_torturer',id:'f455fa36-d90e-420b-a987-12e096d4ab01'},
  {name:'jaw_stalker',id:'90f6089a-2227-4f01-bc8e-7be7f8d726a0'},
  {name:'fallen_paladin',id:'7321f5bd-684c-4c3d-9c27-729aa5749306'},
  {name:'flesh_executioner',id:'55644bfc-c63f-42f3-b9a4-fa45cfe1d30b'},
  {name:'void_cultist',id:'6fea3be7-c8ba-4f7c-8ee7-a8b0d69e68c4'},
  {name:'skull_brute',id:'10e8a153-5418-4928-8998-c6f6ef887472'},
  {name:'chain_wraith',id:'e97b4eab-6f8c-48f8-a57b-e31404692ae1'},
  {name:'bone_archer',id:'fdb62e6f-74aa-420d-ae6d-329740272026'},
  {name:'bloated_warrior',id:'7a8f3a43-8861-4db4-abcd-91d6b3c8be60'},
  {name:'rot_knight',id:'e99d62bb-6e0a-40b8-9c0c-5be7c1105a82'},
  {name:'etype1_archer',id:'94c819f2-ad49-4c52-af99-d49cacce9927'},
  {name:'blind_swordsman',id:'5b25252f-62cb-4b03-a452-541bdedd8ebc'},
];

const TOTAL = ALL_MOBS.length; // 40
const ROWS = Math.ceil(TOTAL / COLS); // 5

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest) && fs.statSync(dest).size > 100) { resolve(); return; }
    const proto = url.startsWith('https') ? https : require('http');
    proto.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, dest).then(resolve).catch(reject); return;
      }
      if (res.statusCode !== 200) { reject(new Error('HTTP '+res.statusCode)); return; }
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => ws.close(resolve));
    }).on('error', reject);
  });
}

function findWalkDir(mobDir) {
  const animDir = path.join(mobDir, 'animations');
  if (!fs.existsSync(animDir)) return null;
  const dirs = fs.readdirSync(animDir).filter(d => d.startsWith('walking') || d.startsWith('animating') || d.startsWith('running'));
  return dirs.length ? path.join(animDir, dirs[0]) : null;
}

async function main() {
  fs.mkdirSync(TMP, {recursive:true});
  const OUT = path.join(__dirname, 'img');

  // 1. Download idle sprites + ZIPs
  console.log('=== Phase 1: Download ===');
  const idleTasks = [];
  for (const mob of ALL_MOBS) {
    for (let di = 0; di < DIRS.length; di++) {
      const url = `${BASE}/${mob.id}/rotations/${DIRS[di]}.png`;
      const dest = path.join(TMP, `${mob.name}_${DIR_FILE[di]}.png`);
      idleTasks.push({url, dest, name: mob.name});
    }
  }
  const BATCH = 16;
  for (let i = 0; i < idleTasks.length; i += BATCH) {
    await Promise.all(idleTasks.slice(i, i+BATCH).map(t => download(t.url, t.dest).catch(e => console.warn(`FAIL idle: ${t.name} ${e.message}`))));
    process.stdout.write(`\r  idle: ${Math.min(i+BATCH, idleTasks.length)}/${idleTasks.length}`);
  }
  console.log('\n  ZIPs...');
  for (const mob of ALL_MOBS) {
    const zipPath = path.join(TMP, mob.name + '.zip');
    const dirPath = path.join(TMP, mob.name);
    if (fs.existsSync(dirPath) && fs.readdirSync(dirPath).length > 0) { process.stdout.write('.'); continue; }
    try {
      await download(`https://api.pixellab.ai/mcp/characters/${mob.id}/download`, zipPath);
      fs.mkdirSync(dirPath, {recursive:true});
      execSync(`unzip -q -o "${zipPath}" -d "${dirPath}"`, {stdio:'pipe'});
      process.stdout.write('+');
    } catch (e) { console.warn(`\n  ZIP FAIL: ${mob.name}: ${e.message}`); }
  }
  console.log('\n  Downloads complete.');

  // 2. Build idle atlas
  console.log('=== Phase 2: Idle atlas ===');
  const W = COLS * CELL, H = ROWS * CELL;
  for (let di = 0; di < DIRS.length; di++) {
    const dirFile = DIR_FILE[di];
    const composites = [];
    for (let mi = 0; mi < ALL_MOBS.length; mi++) {
      const src = path.join(TMP, `${ALL_MOBS[mi].name}_${dirFile}.png`);
      if (!fs.existsSync(src) || fs.statSync(src).size < 100) continue;
      const col = mi % COLS, row = Math.floor(mi / COLS);
      const resized = await sharp(src).resize(CELL, CELL, {fit:'contain', background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
      composites.push({input: resized, left: col * CELL, top: row * CELL});
    }
    await sharp({create:{width:W,height:H,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(composites).png({compressionLevel:9}).toFile(path.join(OUT, `atlas_ch1_8dir_${dirFile}.png`));
    console.log(`  ${dirFile}: ${W}x${H}`);
  }

  // idle JSON
  const idleMeta = {cell:CELL, cols:COLS, rows:ROWS, total:TOTAL, directions:DIRS, mobs:{}};
  for (let mi = 0; mi < ALL_MOBS.length; mi++) {
    idleMeta.mobs[ALL_MOBS[mi].name] = {idx:mi, col:mi%COLS, row:Math.floor(mi/COLS)};
  }
  fs.writeFileSync(path.join(OUT, 'atlas_ch1_8dir.json'), JSON.stringify(idleMeta, null, 2));

  // 3. Build walk atlas
  console.log('=== Phase 3: Walk atlas ===');
  const walkData = {};
  for (const mob of ALL_MOBS) {
    const wd = findWalkDir(path.join(TMP, mob.name));
    if (wd) walkData[mob.name] = wd;
    else console.warn(`  No walk: ${mob.name}`);
  }
  console.log(`  Walk found: ${Object.keys(walkData).length}/${ALL_MOBS.length}`);

  const WW = COLS * USE_FRAMES * CELL, WH = ROWS * CELL;
  for (let di = 0; di < DIRS.length; di++) {
    const dirKey = DIRS[di], dirFile = DIR_FILE[di];
    const composites = [];
    for (let mi = 0; mi < ALL_MOBS.length; mi++) {
      const wd = walkData[ALL_MOBS[mi].name];
      if (!wd) continue;
      const framePath = path.join(wd, dirKey);
      if (!fs.existsSync(framePath)) continue;
      const col = mi % COLS, row = Math.floor(mi / COLS);
      for (let fi = 0; fi < USE_FRAMES; fi++) {
        const fp = path.join(framePath, `frame_${String(SAMPLE[fi]).padStart(3,'0')}.png`);
        if (!fs.existsSync(fp)) continue;
        const resized = await sharp(fp).resize(CELL, CELL, {fit:'contain', background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer();
        composites.push({input: resized, left: (col * USE_FRAMES + fi) * CELL, top: row * CELL});
      }
    }
    await sharp({create:{width:WW,height:WH,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(composites).png({compressionLevel:9}).toFile(path.join(OUT, `atlas_ch1_8dir_walk_${dirFile}.png`));
    console.log(`  walk_${dirFile}: ${WW}x${WH}`);
  }

  // walk JSON
  const walkMobs = {};
  for (let mi = 0; mi < ALL_MOBS.length; mi++) {
    if (walkData[ALL_MOBS[mi].name]) walkMobs[ALL_MOBS[mi].name] = {idx:mi, col:mi%COLS, row:Math.floor(mi/COLS)};
  }
  fs.writeFileSync(path.join(OUT, 'atlas_ch1_8dir_walk.json'), JSON.stringify({cell:CELL,cols:COLS,rows:ROWS,frames:USE_FRAMES,framesPerMob:USE_FRAMES,sampleIndices:SAMPLE,mobs:walkMobs}, null, 2));

  console.log(`\n=== DONE ===`);
  console.log(`Idle: ${TOTAL} mobs, ${COLS}x${ROWS} (${W}x${H})`);
  console.log(`Walk: ${Object.keys(walkMobs).length} mobs, ${COLS*USE_FRAMES}x${ROWS} (${WW}x${WH})`);
}

main().catch(e => { console.error(e); process.exit(1); });
