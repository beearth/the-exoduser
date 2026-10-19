import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';
import test from 'node:test';
import { createCharacterDrafts } from '../engine/fdg/character-drafts.js';
import { createDefaultProject } from '../engine/fdg/catalog.js';
import { draftFrame, frameIndex, inspectCharacterPixels } from '../engine/fdg/character-quality.js';
import { ProjectStore, validateProject } from '../engine/fdg/project.js';

const root = new URL('../', import.meta.url);
const ids = ['transmuter', 'hell_hunter', 'arcane_lancer'];
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const asset = src => readFile(new URL(src, root));
const manifestBytes = await asset('assets/fdg/character-reference/manifest.json');
const manifest = JSON.parse(manifestBytes);

// Decode the actual opaque/RGBA generated PNGs, without a browser or image dependency.
// Hashes below are over materialized RGBA cell pixels, not compressed PNG bytes.
function decodePng(bytes) {
  assert.deepEqual(bytes.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  let width, height, channels;
  const compressed = [];
  for (let offset = 8; offset < bytes.length;) {
    const length = bytes.readUInt32BE(offset), type = bytes.toString('ascii', offset + 4, offset + 8);
    const chunk = bytes.subarray(offset + 8, offset + 8 + length);
    assert.equal(chunk.length, length, 'PNG chunks are complete');
    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0); height = chunk.readUInt32BE(4);
      assert.equal(chunk[8], 8, 'Generated atlas uses 8-bit channels');
      assert.ok([2, 6].includes(chunk[9]), 'Generated atlas uses RGB or RGBA');
      assert.deepEqual([...chunk.subarray(10)], [0, 0, 0], 'Generated atlas has standard compression/filtering and no interlace');
      channels = chunk[9] === 6 ? 4 : 3;
    }
    if (type === 'IDAT') compressed.push(chunk);
    offset += length + 12;
    if (type === 'IEND') break;
  }
  const stride = width * channels, packed = inflateSync(Buffer.concat(compressed));
  assert.equal(packed.length, height * (stride + 1), 'Every PNG scanline is present');
  const raw = Buffer.alloc(stride * height), data = Buffer.alloc(width * height * 4);
  const paeth = (a, b, c) => {
    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y += 1) {
    const filter = packed[y * (stride + 1)];
    assert.ok(filter <= 4, 'PNG scanline has a supported filter');
    for (let x = 0; x < stride; x += 1) {
      const i = y * stride + x, a = x >= channels ? raw[i - channels] : 0;
      const b = y ? raw[i - stride] : 0, c = y && x >= channels ? raw[i - stride - channels] : 0;
      const prediction = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter];
      raw[i] = (packed[y * (stride + 1) + 1 + x] + prediction) & 255;
    }
    for (let x = 0; x < width; x += 1) {
      const from = y * stride + x * channels, to = (y * width + x) * 4;
      data[to] = raw[from]; data[to + 1] = raw[from + 1]; data[to + 2] = raw[from + 2];
      data[to + 3] = channels === 4 ? raw[from + 3] : 255;
    }
  }
  return { width, height, data };
}

function cellPixels(image, rect) {
  const bytes = Buffer.alloc(rect.sw * rect.sh * 4);
  for (let y = 0; y < rect.sh; y += 1) {
    const from = ((rect.sy + y) * image.width + rect.sx) * 4;
    image.data.copy(bytes, y * rect.sw * 4, from, from + rect.sw * 4);
  }
  return bytes;
}

function invalid(mutate, pattern) {
  const project = createDefaultProject(); mutate(project);
  const result = validateProject(project, { geometry: false });
  assert.equal(result.ok, false);
  assert.match(result.errors.join('\n'), pattern);
}

test('Generated manifest and module hashes identify the exact local reference artifacts', async () => {
  const shaFile = await asset('assets/fdg/character-reference/manifest.sha256');
  assert.equal(shaFile.toString().trim(), `${digest(manifestBytes)}  manifest.json`);
  assert.equal(digest(await asset(manifest.draftModule.src)), manifest.draftModule.sha);
  assert.deepEqual(manifest.artifacts.map(item => item.id), ids);
  assert.equal(manifest.scope, 'reference-motion');
  assert.equal(manifest.gameplayApplied, false); assert.equal(manifest.modelAvailable, false);
  assert.equal(manifest.pipeline.interpolation, false); assert.equal(manifest.pipeline.poseDuplication, false);
});

for (const id of ids) {
  test(`${id}: actual 4608×1728 PNG has 24 distinct RGBA cells matching decoded source-frame hashes`, async () => {
    const draft = createCharacterDrafts().find(item => item.id === id);
    const artifact = manifest.artifacts.find(item => item.id === id);
    assert.deepEqual(draft, artifact.draft, 'Generated catalog matches its artifact manifest');
    const bytes = await asset(draft.clip.src), image = decodePng(bytes);
    assert.equal(digest(bytes), artifact.atlas.sha); assert.equal(bytes.length, artifact.atlas.bytes);
    assert.deepEqual({ width: image.width, height: image.height }, { width: 4608, height: 1728 });
    assert.deepEqual(draft.clip, { src: draft.clip.src, frameWidth: 768, frameHeight: 432, columns: 6, rows: 4, frames: 24, fps: 24 });
    const hashes = Array.from({ length: 24 }, (_, index) => digest(cellPixels(image, draftFrame(draft.clip, index))));
    assert.deepEqual(hashes, draft.provenance.sourceFrames.map(frame => frame.pixelSha));
    assert.equal(new Set(hashes).size, 24, 'Distinct compressed bytes cannot substitute for distinct material pixels');
    const inspection = inspectCharacterPixels(image, draft.clip);
    assert.equal(inspection.distinctFrameCount, 24); assert.equal(inspection.declaredFrames, 24);
    assert.deepEqual(inspection.target, { frames: 24, fps: 24, declaredFramesMet: true, fpsMet: true, distinctFramesMet: true });
    assert.equal(inspection.summary.duration, 1); assert.equal(inspection.summary.hasTransparency, false);
    assert.equal(inspection.technical.status, 'review', 'Opaque video background still needs visual review');
    assert.ok(inspection.technical.warnings.some(warning => warning.code === 'opaque-background'));
    assert.equal(inspection.subjectiveStatus, 'unreviewed', 'Distinct pixels do not approve motion or modeling');
  });

  test(`${id}: copied original PNG is hash-traceable and source timing is frames 0..23 at 24FPS`, async () => {
    const draft = createCharacterDrafts().find(item => item.id === id);
    const artifact = manifest.artifacts.find(item => item.id === id), provenance = draft.provenance;
    const reference = await asset(draft.referenceSrc);
    assert.equal(digest(reference), provenance.sourceReferenceSha);
    assert.equal(digest(reference), artifact.reference.sha); assert.equal(reference.length, artifact.reference.bytes);
    assert.equal(reference.readUInt32BE(16), artifact.reference.width); assert.equal(reference.readUInt32BE(20), artifact.reference.height);
    assert.match(provenance.sourceSha, /^[a-f0-9]{64}$/); assert.match(provenance.sourceReferenceSha, /^[a-f0-9]{64}$/);
    assert.equal(provenance.sourceFps, 24); assert.ok(provenance.sourceFrameCount >= 24);
    assert.deepEqual(provenance.sourceFrames.map(frame => frame.index), Array.from({ length: 24 }, (_, i) => i));
    assert.deepEqual(provenance.sourceFrames.map(frame => frame.sourceFrameIndex), Array.from({ length: 24 }, (_, i) => i));
    provenance.sourceFrames.forEach((frame, i) => {
      assert.ok(Math.abs(frame.mediaTime - i / 24) < 1e-6, 'Decoder display time resolves the intended source frame');
      assert.equal(frameIndex(i / 24), i); assert.match(frame.pixelSha, /^[a-f0-9]{64}$/);
    });
    assert.equal(provenance.scope, 'reference-motion'); assert.equal(provenance.gameplayApplied, false);
    assert.equal(provenance.modelAvailable, false); assert.equal(provenance.alpha, false); assert.equal(provenance.backgroundIncluded, true);
    assert.equal(provenance.reviewStatus, id === 'arcane_lancer' ? 'retouch' : 'pending');
  });
}

test('Fresh draft catalogs, default projects and exported snapshots isolate every nested mutation', () => {
  const expected = createCharacterDrafts(), first = createCharacterDrafts(), project = createDefaultProject();
  first[0].designLocks[0] = 'mutated'; first[0].clip.fps = 1;
  first[0].provenance.sourceFrames[0].pixelSha = 'mutated';
  project.characterDrafts[1].provenance.sourceFrames.pop();
  assert.deepEqual(createCharacterDrafts(), expected);
  assert.deepEqual(createDefaultProject().characterDrafts, expected);
  const store = new ProjectStore(createDefaultProject()), snapshot = store.project;
  snapshot.characterDrafts[0].review = { face: 'pass' }; snapshot.characterDrafts[0].clip.frames = 1;
  assert.deepEqual(store.project.characterDrafts, expected); assert.equal(store.canUndo, false);
  store.dispose();
});

test('Default 24FPS preview preserves real legacy cell counts and keeps all drafts outside playable resources', () => {
  const project = createDefaultProject();
  assert.equal(validateProject(project).ok, true);
  assert.deepEqual(project.characterQuality, { frames: 24, fps: 24 });
  assert.deepEqual(project.characters.map(character => character.sprite.frames), [21, 10]);
  for (const character of project.characters) {
    assert.equal(character.sprite.fps, 24);
    for (const animation of Object.values(character.animations)) assert.equal(animation.fps, 24);
    assert.ok(!ids.includes(character.id));
  }
  assert.ok(!ids.includes(project.preview.characterId));
  assert.deepEqual(project.characterDrafts.map(draft => draft.id), ids);
});

test('Old projects without optional drafts and quality target still validate and remain importable', () => {
  const project = createDefaultProject(); delete project.characterDrafts; delete project.characterQuality;
  const result = validateProject(project); assert.equal(result.ok, true, result.errors.join('\n'));
  const store = new ProjectStore(project); assert.deepEqual(store.project, project); store.dispose();
});

for (const [name, mutate, pattern] of [
  ['invalid target frame count', p => { p.characterQuality.frames = 23; }, /characterQuality/],
  ['invalid target FPS', p => { p.characterQuality.fps = 30; }, /characterQuality/],
  ['non-array drafts', p => { p.characterDrafts = {}; }, /characterDrafts/],
  ['missing draft object', p => { p.characterDrafts[0] = null; }, /제작 후보/],
  ['duplicate draft ID', p => { p.characterDrafts[1].id = p.characterDrafts[0].id; }, /중복 id/],
  ['unsafe reference image path', p => { p.characterDrafts[0].referenceSrc = '../private.png'; }, /referenceSrc/],
  ['unsafe motion atlas path', p => { p.characterDrafts[0].clip.src = 'https://example.com/sheet.png'; }, /clip.src/],
  ['fewer than 24 declared source cells', p => { p.characterDrafts[0].clip.frames = 23; }, /실제 24장/],
  ['non-24 motion playback', p => { p.characterDrafts[0].clip.fps = 12; }, /실제 24장/],
  ['sheet too small for declared frames', p => { p.characterDrafts[0].clip.rows = 3; }, /시트 용량/],
  ['oversized inspection grid despite only 24 declared frames', p => { Object.assign(p.characterDrafts[0].clip, { columns: 17, rows: 16, frameWidth: 1, frameHeight: 1 }); }, /256셀.*1600만 픽셀/],
  ['oversized inspection atlas with a valid 24-cell grid', p => { Object.assign(p.characterDrafts[0].clip, { frameWidth: 1024, frameHeight: 768 }); }, /256셀.*1600만 픽셀/],
  ['missing design locks', p => { p.characterDrafts[0].designLocks = []; }, /designLocks/],
  ['false gameplay completion', p => { p.characterDrafts[0].provenance.gameplayApplied = true; }, /미이관/],
  ['false production scope', p => { p.characterDrafts[0].provenance.scope = 'production'; }, /참고 모션/],
  ['false 3D model availability', p => { p.characterDrafts[0].provenance.modelAvailable = true; }, /모델 미확보/],
  ['false source quality completion', p => { p.characterDrafts[0].provenance.reviewStatus = 'pass'; }, /provenance/],
  ['manual review with invalid status', p => { p.characterDrafts[0].review = { weapon: 'complete' }; }, /review.weapon/],
  ['manual review with unknown criterion', p => { p.characterDrafts[0].review = { gameplay: 'pass' }; }, /review.gameplay/],
  ['draft selected as playable character', p => { p.preview.characterId = p.characterDrafts[0].id; }, /preview.characterId/],
]) test(`Draft import rejects ${name}`, () => invalid(mutate, pattern));

test('Manual visual review is one undoable transaction and cannot grant gameplay or model completion', () => {
  const original = createDefaultProject(), store = new ProjectStore(original);
  store.change('무기 구조 검수', project => { project.characterDrafts[0].review = { weapon: 'pass', feet: 'retouch' }; });
  assert.deepEqual(store.project.characterDrafts[0].review, { weapon: 'pass', feet: 'retouch' });
  assert.equal(store.project.characterDrafts[0].provenance.gameplayApplied, false);
  const reviewed = store.project;
  assert.throws(() => store.change('잘못된 완료 기록', p => { p.characterDrafts[0].provenance.gameplayApplied = true; }), /미이관/);
  assert.deepEqual(store.project, reviewed); assert.equal(store.canRedo, false);
  assert.equal(store.undo(), true); assert.deepEqual(store.project, original); assert.equal(store.canUndo, false);
  assert.equal(store.redo(), true); assert.deepEqual(store.project, reviewed); store.dispose();
});

function multirowProject() {
  const project = createDefaultProject(), character = project.characters[0], clip = project.characterDrafts[0].clip;
  character.sprite = { ...character.sprite, ...clip }; delete character.sprite.directions;
  character.animations = {
    idle: { row: 0, start: 0, frames: 24, fps: 24, loop: true },
    walk: { row: 0, start: 4, frames: 8, fps: 24, loop: true },
    attack: { row: 3, start: 3, frames: 3, fps: 24, loop: false },
  };
  return project;
}

test('Imported animations may cross rows and consume all 24 actual cells of a 6×4 atlas', () => {
  const project = multirowProject(), result = validateProject(project, { geometry: false });
  assert.equal(result.ok, true, result.errors.join('\n'));
  const store = new ProjectStore(createDefaultProject());
  store.replace(project, '다중 행 클립 가져오기'); assert.deepEqual(store.project, project);
  store.undo(); assert.deepEqual(store.project, createDefaultProject()); store.redo(); assert.deepEqual(store.project, project); store.dispose();
});

test('Imported animations cannot overflow declared frame count even if the PNG grid has spare cells', () => {
  const project = multirowProject(); project.characters[0].animations.attack.frames = 4;
  assert.match(validateProject(project, { geometry: false }).errors.join('\n'), /실제 시트 프레임 범위/);
  project.characters[0].sprite.frames = 20;
  project.characters[0].animations = { idle: { row: 0, start: 0, frames: 20, fps: 24, loop: true }, walk: { row: 2, start: 4, frames: 5, fps: 24, loop: true } };
  assert.match(validateProject(project, { geometry: false }).errors.join('\n'), /walk.*실제 시트 프레임 범위/);
});

test('Imported animations must start inside their selected row, even when a flat index would fit', () => {
  const project = multirowProject(); project.characters[0].animations.walk.start = 6;
  assert.match(validateProject(project, { geometry: false }).errors.join('\n'), /walk.*실제 시트 프레임 범위/);
});
