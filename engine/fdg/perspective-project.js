import { createDefaultProject } from './catalog.js';
import { WORLD_CAMERA_DEFAULTS } from './world-camera.js';

/** An isolated camera work copy of the existing game resources and locked nav. */
export function createPerspectiveProject() {
  const project = createDefaultProject();
  project.id = 'exoduser-perspective-r1';
  project.name = 'EXODUSER · 원근 카메라 제작';
  project.viewCamera = { ...WORLD_CAMERA_DEFAULTS };
  const { start, tiles } = project.map;
  const sources = [
    ['시체나무', 'assets/map/ch1/collision/prop_corpsetree.png', .14],
    ['뼈 장식', 'docs/4.1맵디자인+설정/objects/deco_bones_02.png', .8],
    ['독 버섯', 'docs/4.1맵디자인+설정/objects/mushroom_glow_01.png', .8],
  ];
  // Authored offsets and existing walkable tiles only; no nav or source geometry changes.
  const offsets = [[-7,-12],[0,-12],[7,-12],[-7,-6],[7,-6],[-7,0],[7,0],[-7,6],[7,6]];
  for (const [index, [dx, dy]] of offsets.entries()) {
    const x = start.x + dx, y = start.y + dy;
    if (x < 0 || y < 0 || x >= 200 || y >= 200 || tiles[y * 200 + x] !== 1) continue;
    const [name, src, scale] = sources[index % sources.length];
    project.map.objects.push({ id: `perspective_prop_${index}`, name, src, scale, x, y, layer: 'world', collision: false });
  }
  project.provenance.cameraStudy = { scope: 'ENGINE_AUTHORING', source: 'POE2_REFERENCE_STUDY.md',
    referenceCommit: '5e7a07716bb40e852fbf52f4060672a757b728be', copiedPoeAssets: false, gameplayApplied: false };
  return project;
}
