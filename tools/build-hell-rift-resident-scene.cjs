'use strict';

// Independent editor candidate. build() does no file I/O and never changes its input.
// The guarded CLI is the only writer, and requires a new, explicit scene destination.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const vm = require('node:vm');
// The checkout treats .js as ESM, while this dual browser/CJS core exposes its API
// on module.exports. Load the trusted existing core once, before pure build calls.
const coreContext = { module: { exports: {} }, JSON };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'map-scene-core.js'), 'utf8'), coreContext, { filename: 'map-scene-core.js' });
const K = coreContext.module.exports;
const REPO = path.resolve(__dirname, '..');
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

const CONTRACT = freeze({
  originalScene: 'assets/map/hell_rift/editor_result_20261006/hell-rift.scene.json',
  originalSceneSha256: 'f5068d742ddd6da3e1c78fb7178317df228e936bab0edc6237dec40bfd0bb5ac',
  painting: {
    src: 'assets/map/hell_rift/interspace_20261005/hell-rift-painterly-v2.png', width: 1920, height: 1920,
    sha256: 'a3d95a005924692626321cedf384d1e4e90282ba990d9e19e86a3aa73a1563d4'
  },
  abyss: {
    src: 'assets/map/hell_rift/interspace_20261005/hell-rift-abyss-v3.png', width: 1920, height: 1920,
    sha256: 'ace0c853cc27cbb4d2b807104273399a1144df77d31b1003e574141fed10f991'
  },
  cleanPlate: {
    src: 'assets/map/hell_rift/resident_layers_20261006/clean-plate-v1.png', width: 1254, height: 1254,
    sha256: 'aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673'
  },
  atlas: {
    src: 'assets/map/hell_rift/resident_layers_20261006/resident-atlas-v1.png', width: 1254, height: 1254,
    sha256: 'ff20e1f5dc1a8849edb64a10380c1d9eb21688de1817f098b144a57410190a38'
  },
  navSha256: 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179',
  walkableCount: 1192, routeVisited: 1185, radius: 12,
  sourceRatio: 1254 / 1920, standingHeight: 80, alphaThreshold: 8,
  paintingAssetIds: ['west-0', 'west-1', 'centre-0', 'centre-1', 'east-0', 'east-1', 'west-root', 'east-horn', 'south-root'],
  residents: [
    { key: 'haran', name: '하란', x: 4660, y: 6660, crop: { x: 169, y: 27, w: 350, h: 578 } },
    { key: 'berin', name: '베린', x: 6020, y: 5580, crop: { x: 748, y: 257, w: 363, h: 352 } },
    { key: 'nessa', name: '네사', x: 6300, y: 5020, crop: { x: 197, y: 660, w: 262, h: 547 } },
    { key: 'dorik', name: '도릭', x: 5220, y: 2500, crop: { x: 813, y: 742, w: 240, h: 465 } }
  ]
});

function build(original) {
  // This operation is deliberately bound to the reviewed source, not edited scenes
  // or other map presets. Actual source-file byte pins are additionally checked by CLI.
  const p = K.validate(original);
  if (sha256(JSON.stringify(p)) !== CONTRACT.originalSceneSha256) throw new Error('Reviewed original scene pin mismatch');
  if (p.sourcePins?.painting !== CONTRACT.painting.sha256 || p.sourcePins?.abyss !== CONTRACT.abyss.sha256 ||
      p.sourcePins?.nav !== CONTRACT.navSha256 || sha256(Buffer.from(p.walkable)) !== CONTRACT.navSha256 ||
      p.walkable.filter(Boolean).length !== CONTRACT.walkableCount) throw new Error('Original source/navigation pin mismatch');

  const byAsset = new Map(p.assets.map(a => [a.id, a]));
  for (const id of CONTRACT.paintingAssetIds) {
    const asset = byAsset.get(id);
    if (!asset || asset.src !== CONTRACT.painting.src || asset.width !== 1920 || asset.height !== 1920) throw new Error('Original painting asset mismatch: ' + id);
    asset.src = CONTRACT.cleanPlate.src;
    asset.width = CONTRACT.cleanPlate.width; asset.height = CONTRACT.cleanPlate.height;
    // Fractional source crops are supported by v1. World geometry and normalized
    // masks remain exact; downsampling is not an assertion of identical pixels.
    asset.crop = Object.fromEntries(Object.entries(asset.crop).map(([key, value]) => [key, value * CONTRACT.sourceRatio]));
  }

  const foot = p.layers.find(layer => layer.id === 'foot');
  if (!foot || foot.sort !== 'foot' || p.layers.length !== 6) throw new Error('Reviewed foot layer missing');
  for (const resident of CONTRACT.residents) {
    if (!K.canWalk(p, resident.x, resident.y, CONTRACT.radius)) throw new Error('Resident anchor is not walkable: ' + resident.key);
    const assetId = 'resident-' + resident.key;
    const height = resident.key === 'berin' ? CONTRACT.standingHeight * resident.crop.h / 578 : CONTRACT.standingHeight;
    p.assets.push({ id: assetId, name: resident.name, src: CONTRACT.atlas.src, width: 1254, height: 1254, crop: K.clone(resident.crop), internal: true });
    foot.objects.push({
      id: 'obj-' + assetId, assetId, name: resident.name, x: resident.x, y: resident.y,
      width: height * resident.crop.w / resident.crop.h, height,
      pivotX: .5, pivotY: 1, rotation: 0, opacity: 1, flipX: false
    });
  }
  p.name = '지옥의 틈 · 독립 주민 레이어 후보';
  p.residentLayerReview = {
    kind: 'independent-resident-preview-v1', cleanPlate: K.clone(CONTRACT.cleanPlate), atlas: K.clone(CONTRACT.atlas),
    originalPaintingSha256: p.sourcePins.painting,
    bodyScale: 'standing80-seated-source-proportion', notAdopted: true
  };
  p.sourcePins.cleanPlate = CONTRACT.cleanPlate.sha256;
  p.sourcePins.residentAtlas = CONTRACT.atlas.sha256;
  p.notes = '승인 원화를 참조해 생성한 clean plate와 주민 cutout 후보이며 원본 픽셀의 정확 추출이 아니다. 원본 씬·PNG는 보존. 원화 6 crop·전경 3 crop의 source만 1254/1920 비율로 교체하고 심연·월드·보행·카메라는 유지. 독립 주민 4명은 foot 레이어에 발 기준 정렬하며 높이 물리·본편 NPC/세이브·영구 보상에는 미연결.';
  const candidate = K.validate(p), route = K.route(candidate);
  if (!route.pass || route.visited !== CONTRACT.routeVisited) throw new Error('Reviewed route invariant changed');
  return candidate;
}

function verifyPngBytes(bytes, contract) {
  if (!Buffer.isBuffer(bytes) || sha256(bytes) !== contract.sha256) throw new Error('PNG source pin mismatch: ' + contract.src);
  const { PNG } = require('pngjs');
  const image = PNG.sync.read(bytes);
  if (image.width !== contract.width || image.height !== contract.height) throw new Error('PNG dimensions mismatch: ' + contract.src);
  return { src: contract.src, width: image.width, height: image.height, sha256: contract.sha256, bytes: bytes.length };
}

function verifySources(repo = REPO) {
  const sceneBytes = fs.readFileSync(path.join(repo, CONTRACT.originalScene));
  if (sha256(sceneBytes) !== CONTRACT.originalSceneSha256) throw new Error('Original scene file pin mismatch');
  const images = ['painting', 'abyss', 'cleanPlate', 'atlas'].map(key => verifyPngBytes(fs.readFileSync(path.join(repo, CONTRACT[key].src)), CONTRACT[key]));
  return { original: JSON.parse(sceneBytes.toString('utf8')), images };
}

function runCLI(args) {
  if (args.length !== 2 || args[0] !== '--output' || !args[1]) throw new Error('Usage: node tools/build-hell-rift-resident-scene.cjs --output assets/map/.../new.scene.json');
  const destination = path.resolve(REPO, args[1]);
  const relative = path.relative(REPO, destination).split(path.sep).join('/');
  K.projectSource(relative);
  if (destination === path.join(REPO, CONTRACT.originalScene) || fs.existsSync(destination)) throw new Error('Refusing to overwrite an existing scene: ' + relative);
  const { original, images } = verifySources();
  const candidate = build(original), bytes = JSON.stringify(candidate);
  // Exclusive creation protects the original and closes the check/write race.
  // The caller must already have created the destination directory; no hidden outputs.
  fs.writeFileSync(destination, bytes, { flag: 'wx' });
  return {
    destination, sceneSha256: sha256(bytes), sourcePins: candidate.sourcePins, images,
    assets: candidate.assets.length, layers: candidate.layers.length,
    objects: candidate.layers.reduce((sum, layer) => sum + layer.objects.length, 0),
    residents: CONTRACT.residents.length, route: K.route(candidate), productionStatus: candidate.productionStatus,
    visualVerdict: 'NOT_ASSESSED', notAdopted: true
  };
}

module.exports = { build, CONTRACT, verifyPngBytes, verifySources, runCLI };
if (require.main === module) {
  try { process.stdout.write(JSON.stringify(runCLI(process.argv.slice(2)), null, 2) + '\n'); }
  catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 1; }
}
