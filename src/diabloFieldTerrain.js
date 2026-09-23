/**
 * Render-only terrain plan for the Diablo-style outdoor field pipeline.
 * Gameplay must continue to query the blueprint NAV RLE; no decoration here
 * is allowed to introduce collision.
 */
export function buildDiabloTerrainPlan(blueprint, biome = 'rotten_forest') {
  if (!blueprint || !blueprint.tileRLE || !Array.isArray(blueprint.regions)) {
    throw new Error('A Diablo field blueprint with tileRLE and regions is required.');
  }

  const chunkSize = 1024;
  const chunks = Array.from({ length: 64 }, (_, index) => ({
    id: `field-${String(index).padStart(2, '0')}`,
    x: index % 8,
    y: Math.floor(index / 8),
    core: chunkSize,
    bleed: 1,
  }));

  return {
    biome,
    navAuthority: 'blueprint.tileRLE',
    baseTexture: 'assets/map/shared/diablo_field_base_cold_v1.png',
    layers: [
      { id: 'base', order: 0, purpose: 'continuous ground albedo' },
      { id: 'ground', order: 1, purpose: 'roads, mud, snow and ground decals' },
      { id: 'back', order: 2, purpose: 'distant cliff and tree masses' },
      { id: 'mid', order: 3, purpose: 'playable-space prop clusters' },
      { id: 'front', order: 4, purpose: 'foreground occluders and atmosphere' },
    ],
    chunks,
    outerMasses: blueprint.regions.map((region) => ({
      id: `outer-${region.id}`,
      anchor: { x: region.cx, y: region.cy },
      role: region.role,
      collision: false,
      renderLayer: region.role === 'boss' ? 'back' : 'mid',
    })),
  };
}
