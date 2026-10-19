import assert from 'node:assert/strict';
import { makeSourceGroundFixture, SOURCE_GROUND_CANONICAL } from './fdg-source-ground-fixture.mjs';
import { attachSourcePreviewGround, attachSourcePreviewHeight, SOURCE_PREVIEW_GROUND_URL } from '../engine/fdg/source-preview.js';
import { SOURCE_PREVIEW_HEIGHT_BINDING } from '../engine/fdg/source-preview-height.js';

/** Portable synthetic UNIT data only; no test suite/source-file/PNG/HTTP imports or reads. */
export function makeSourceHeightFixture() {
  const ground = makeSourceGroundFixture();
  ground.scene.actor.position = [4020, 7400]; ground.scene.camera.y = 7400;
  const readyGround = attachSourcePreviewGround(ground.scene, { ...ground.options,
    groundObservations: [{ canonicalAbsolutePath: SOURCE_GROUND_CANONICAL, src: SOURCE_PREVIEW_GROUND_URL,
      intrinsicWidth: 1024, intrinsicHeight: 1024, observedBy: 'UNIT synthetic runtime decode' }] });
  assert.equal(readyGround.ok, true, readyGround.errors.join('\n'));
  const sourceExecutionData = { completionId: 'UNIT-normalized-height', control: 'UNIT-v4-contract', kind: 'UNIT synthetic execution envelope',
    baseRef: { scene: '/UNIT/not-fetched.json' }, unknownEnvelope: { keep: true }, executionData: {
      logicalHeight: { source: 'UNIT explicit logical-height semantic binding', units: 'tile, T40; normalized logical0..1, not physical Z',
        nativeParams: { cx: 147, cy: 98, rx: 18, ry: 9, inner: 0.84, outer: 1.04, rampX0: 125, rampX1: 135, rampY: 98, rampHalf0: 1.8, rampHalf1: 3, unknownNative: { keep: true } },
        exactEvaluator: { ...SOURCE_PREVIEW_HEIGHT_BINDING, unknownEvaluator: 'retain' },
        samples: [{ label: 'UNIT additional ramp sample', tile: [126, 98], px: [5060, 3940], height: 0.06075, ramp: 0.15, bandBlocks: false }],
        summitTileCount: 340, cliffBandBlockedTileCount: 166, unknownLogical: { keep: true } },
      boundaryColliders: { hillCliffBand: { rule: '_ch1HillBandBlocks: 0.84<=d<=1.04 && ramp<0 -> isW(stage0)',
        blockedTileCount: 166, sampleTiles: [[139, 89]], source: 'UNIT explicit cliff semantic binding' } },
      objectColliders: { status: 'EXTRACTION_BLOCKED', objectColliderCount: 'UNKNOWN', unitNote: 'No actual collider instances.' },
    } };
  const options = { sourceExecutionData,
    heightMapping: { kind: 'engine-authored-linear', scalePx: 64, offsetPx: 0, authoredBy: 'UNIT engine author', unknownMapping: { keep: true } },
    movement: { maxStep: 16, maxSlope: 0.75, cliffFootPolicy: 'conservative-ellipse-band-contained-ramp', authoredBy: 'UNIT engine author' } };
  const attached = attachSourcePreviewHeight(readyGround.sourcePreview, options);
  assert.equal(attached.ok, true, attached.errors.join('\n'));
  return { scene: attached.sourcePreview, sourceExecutionData, options, baseScene: readyGround.sourcePreview };
}
