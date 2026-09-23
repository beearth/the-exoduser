import { buildDiabloFieldBlueprint } from './diabloFieldBlueprint.js';
import { buildDiabloTerrainPlan } from './diabloFieldTerrain.js';

const CH1_1_SEQUENCE = Object.freeze([
  ['start', 'south_forecourt', 'wet_stone', 'quiet arrival plaza with a clear northbound read'],
  ['combat', 'west_basin', 'mud_and_roots', 'broad first-combat basin, never a closed room'],
  ['travel', 'broken_causeway', 'frosted_stone', 'irregular upward traversal between exterior masses'],
  ['combat', 'corpse_tree_clearing', 'dead_grass', 'large landmark clearing with multi-angle combat'],
  ['pocket', 'altar_marsh', 'black_mud', 'optional side pocket visible from the main route'],
  ['boss', 'north_gate', 'cracked_slate', 'upper gate approach and boss forecourt'],
]);

export function buildDiabloFieldStagePlan(stageIndex = 0, biome = 'rotten_forest') {
  const blueprint = buildDiabloFieldBlueprint(stageIndex);
  const terrain = buildDiabloTerrainPlan(blueprint, biome);
  const regions = blueprint.regions.map((region, index) => {
    const [expectedRole, landmark, surface, intent] = CH1_1_SEQUENCE[index] || [region.role, 'field_landmark', 'weathered_ground', 'continuous outdoor encounter'];
    if (region.role !== expectedRole) throw new Error(`Unexpected field sequence at ${region.id}.`);
    return {
      ...region,
      landmark,
      surface,
      intent,
      collisionAuthority: 'NAV only',
      visualRule: 'outer masses frame the space; no sealed rectangle or corridor loop',
    };
  });

  return {
    stageId: `field-${stageIndex}`,
    designTarget: 'Diablo-style continuous outdoor field structure',
    startClock: 6,
    exitClock: 12,
    blueprint,
    terrain,
    regions,
    gateChecks: [
      'South start has a readable northbound opening.',
      'Every combat region has at least two broad movement vectors.',
      'Top approach remains open to the exit/boss boundary.',
      'Visual masses do not change NAV collision.',
    ],
  };
}
