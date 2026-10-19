import assert from 'node:assert/strict';
import { buildSourcePreview, SOURCE_PREVIEW_GROUND_URL } from '../engine/fdg/source-preview.js';

// Synthetic UNIT data only; no source JSON/PNG/HTTP or completed suite is read.
export const SOURCE_GROUND_CANONICAL = '/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/map/ch1/ground_dark_soil.png';
export const makeSourceGroundLayout = () => ({ kind: 'engine-authored-repeat', materialKey: 'soil', origin: [0, 0], tileWorldSize: [1024, 1024],
  opacity: 1, authoredBy: 'UNIT author', clipConvention: 'source-tile-corners', unknownAuthoring: { keep: true } });
export function makeSourceGroundFixture() {
  const approved = Array.from({ length: 9 }, (_, index) => ({ relative: `unit-${index}.png`, canonicalAbsolutePath: `/unit/source/unit-${index}.png`, exists: true }));
  const observations = approved.map((asset, index) => ({ canonicalAbsolutePath: asset.canonicalAbsolutePath,
    src: `fdg-source/ch1-1/${asset.relative}`, intrinsicWidth: 100 + index, intrinsicHeight: 200 + index }));
  const visualPlacements = Array.from({ length: 85 }, (_, index) => ({ file: approved[index % 9].relative, x: 100 + index % 4,
    y: index === 84 ? 207 : 180 + index % 4, scale: 0.5, opacity: 0.8, brightness: index === 0 ? 1.08 : 0.7, saturation: 0.6, unknown: { index } }));
  const boundary = Array.from({ length: 53 }, (_, index) => [Math.round(100 + 90 * Math.cos(index * Math.PI * 2 / 53)), Math.round(100 + 90 * Math.sin(index * Math.PI * 2 / 53))]);
  const groundMaterials = { items: [
    { key: 'soil', file: 'ground_dark_soil.png', canonicalAbsolutePath: SOURCE_GROUND_CANONICAL, exists: true,
      values: { file: 'ground_dark_soil.png', brightness: 0.85, saturation: 0.48, nativeExtra: 'retain' } },
    ...['mask', 'litter', 'commonSkin'].map(key => ({ key, canonicalAbsolutePath: `/unit/ground/${key}`, exists: true, values: { unit: key } })),
    { key: 'collisionChanges', file: null, canonicalAbsolutePath: null, exists: null, values: { raw: false } },
  ], unknownGround: { keep: true } };
  const inspection = { stage: 0, gridSize: [200, 200], tileSize: 40, tiles: Array(40000).fill(1), approved9: approved,
    start: { rawTile: [100, 185], centerTile: [100.5, 185.5], worldPx: [4020, 7420] }, gateExit: { bossCx: 100, exitY: 7 },
    visualPlacements, sourceSnapshot: { boundaryPolygon: { units: 'tile index', points: 53, data: boundary, source: 'UNIT synthetic boundary' }, unknown: { keep: true } },
    manifestSnapshot: { sourceAssets: { items: approved }, groundMaterials, unknown: { keep: true } } };
  const authoring = { previewLayout: { anchorConvention: 'bottom-center', pixelsPerSourcePixel: 1, authoredBy: 'UNIT author' },
    startAuthority: { kind: 'design-start', stage: 0, centerTile: [100.5, 185.5], worldPx: [4020, 7420], tileSizePx: 40,
      source: 'CH1_WORLD_MAP_ORDER / 맵구성_1장.md:3', approvedBy: 'ROOT', runtimeSymbol: 'UNKNOWN' },
    camera: { x: 4020, y: 7420, follow: true }, resourceBindings: Object.fromEntries(observations.map(value => [value.canonicalAbsolutePath, value.src])) };
  const built = buildSourcePreview(inspection, observations, authoring); assert.equal(built.ok, true, built.errors.join('\n'));
  built.sourcePreview.actor.position = [4020, 7410]; built.sourcePreview.camera.y = 7410;
  return { scene: built.sourcePreview, inspection, observations, authoring,
    options: { groundLayout: makeSourceGroundLayout(), resourceBindings: { [SOURCE_GROUND_CANONICAL]: SOURCE_PREVIEW_GROUND_URL, unknownBindingNote: 'keep' } } };
}
