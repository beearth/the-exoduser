import { validateWorldProject, WorldProjectValidationError } from './world-project.js';

/** References only: no source asset loading, area registration or invented handshake. */
export function normalizeMapWorldPilot(connections, height, { connectionsRef, heightRef } = {}) {
  const stages = connections?.stages;
  if (typeof stages?.ch1_1?.stageId !== 'string' || typeof stages?.ch1_2?.stageId !== 'string'
    || !height?.sourcePreserved || typeof connectionsRef !== 'string' || typeof heightRef !== 'string') {
    throw new TypeError('Two MAP reference documents and their source references are required.');
  }
  const world = {
    worldVersion: 1, id: 'map_reference_ch1', name: 'CH1 맵 참조 · 소비 계약 대기', scope: 'MAP_PILOT',
    scenes: [
      { id: 'map_reference_scene0', name: 'CH1-1 원본 장면 참조', project: null, sourceRef: stages.ch1_1.scene || connectionsRef },
      { id: 'map_reference_scene1', name: 'CH1-2 텍스트 장면 참조', project: null, sourceRef: connectionsRef + '#/stages/ch1_2/scene_resource' },
    ],
    areas: [
      { areaKey: 'map_reference_stage0', name: 'CH1-1 참조', stageRef: stages.ch1_1.stageId, sceneId: 'map_reference_scene0', entrances: [{ id: 'pending_arrival', position: null, camera: null }], exits: [] },
      { areaKey: 'map_reference_stage1', name: stages.ch1_2.name || 'CH1-2 참조', stageRef: stages.ch1_2.stageId, sceneId: 'map_reference_scene1', entrances: [{ id: 'pending_arrival', position: null, camera: null }], exits: [] },
    ],
    transitions: [], progress: {},
    state: { activeAreaKey: 'map_reference_stage0', regions: { map_reference_stage0: { visits: 0, data: {} }, map_reference_stage1: { visits: 0, data: {} } } },
    metadata: {
      sourceRefs: { connections: connectionsRef, height: heightRef },
      sourceDocuments: { connections: structuredClone(connections), height: structuredClone(height) },
      normalization: {
        status: 'PENDING_ENGINE_CONTRACT', productionRegistration: 0, productionTransitions: 0,
        areaKeysAreReferenceOnly: true, sourceStageIdsAreNotAreaKeys: true,
        arrivalPolicy: 'null: exact entrance XYZ/camera handshake is unresolved; basin center is not arrival',
        sourceProgression: 'REGION→gate→exit→boss arena→bosskill→stageCleared→nextStage→si1',
        sourceGraph: 'DERIVED proposal retained in metadata; no runtime edges registered',
        sourceHeight: 'logical smoothstep 0..1; physical units unresolved',
        pending: ['resource-manifest', 'exact-arrival-xyz-camera', 'boss-arena-progression-contract', 'height-physical-units', 'ground-nav-consumer', 'reverse-reentry-contract', 'world-graph-minimap-waypoint-ui'],
      },
    },
  };
  const result = validateWorldProject(world);
  if (!result.ok) throw new WorldProjectValidationError(result.errors);
  return world;
}
