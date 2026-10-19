import { SOURCE_MAP } from './source-map.js';
import { decodeTileRLE } from './legacy.js';
import { createCharacterDrafts } from './character-drafts.js';

const DIRECTIONS = ['south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'];
const SILVER_FILES = { south: '6', 'south-east': '5', east: '3', 'north-east': '1', north: '12', 'north-west': '11', west: '9', 'south-west': '7' };

function character(id, name, columns, walk, attack, files) {
  const directions = Object.fromEntries(DIRECTIONS.map(direction => [direction, `img/${id}/${files?.[direction] || direction}.png`]));
  return {
    id, name, speed: 156, radius: 12,
    sprite: { src: directions.south, frameWidth: 48, frameHeight: 48, columns, rows: 1, frames: columns, fps: 24, scale: 2, anchorX: 0.5, anchorY: 0.85, directions },
    animations: {
      idle: { row: 0, start: 0, frames: 2, fps: 24, loop: true },
      walk: { row: 0, start: 2, frames: walk, fps: 24, loop: true },
      attack: { row: 0, start: 2 + walk, frames: attack, fps: 24, loop: false },
    },
    provenance: { source: 'game.html CHAR_LIST / _load8Dir', animationLayout: 'idle + walk + attack', tuning: 'FDG preview movement/fps/scale only' },
  };
}

function sheet(src, frameWidth, frameHeight, frames, columns, rows, scale = 0.35) {
  return { src, frameWidth, frameHeight, frames, columns, rows, fps: 20, scale, anchorX: 0.5, anchorY: 0.5 };
}

/** Fresh authoring resources. Does not modify production character/skill data. */
export function createDefaultProject() {
  return {
    schemaVersion: 1, id: 'exoduser-fdg-lab', name: 'FDG · EXODUSER 엔진 스튜디오',
    map: {
      id: 'ch1-1-tile-preview', name: 'CH1-1 canonical 타일 미리보기', width: 200, height: 200, tileSize: 40,
      tiles: decodeTileRLE(SOURCE_MAP.tileRLE), start: { ...SOURCE_MAP.start }, exit: { ...SOURCE_MAP.exit }, objects: [],
      sourceTemplate: structuredClone(SOURCE_MAP.template), provenance: structuredClone(SOURCE_MAP.provenance),
      groundSrc: 'assets/map/ch1/ground_dark_soil.png',
    },
    characters: [
      character('exoduser_warrior', '엑소듀서 전사', 21, 8, 8),
      character('exoduser_silvertail', '실버테일', 10, 4, 4, SILVER_FILES),
    ],
    characterQuality: { frames: 24, fps: 24 },
    characterDrafts: createCharacterDrafts(),
    skills: [
      { id: 'preview_landing', name: '미리보기 · 착지 화염', cooldown: 1.2, cost: 15, range: 180, vfx: 'land_fire', damage: 20 },
      { id: 'preview_slash', name: '미리보기 · 일섬', cooldown: 0.7, cost: 10, range: 150, vfx: 'ice_slash', damage: 12 },
      { id: 'preview_burst', name: '미리보기 · 마법 폭발', cooldown: 2, cost: 25, range: 320, vfx: 'magic_burst', damage: 30 },
    ],
    vfx: [
      { id: 'land_fire', name: '착지 화염 시트', kind: 'burst', color: '#ff8844', count: 32, life: 0.65, speed: 140, size: 8, spread: Math.PI * 2, sprite: sheet('assets/vfx/vfx_landing_fire.png', 200, 200, 4, 2, 2, 0.8), provenance: { source: 'game.html registerVFX land_fire', blend: 'lighter' } },
      { id: 'ice_slash', name: '일섬 시트', kind: 'projectile', color: '#87dbff', count: 18, life: 0.95, speed: 260, size: 7, spread: 0.45, sprite: sheet('assets/vfx/slash_impact_sheet.png', 128, 128, 19, 19, 1, 1), provenance: { source: 'game.html registerVFX ice_slash', blend: 'lighter' } },
      { id: 'magic_burst', name: '마법 폭발 시트', kind: 'ring', color: '#b895ff', count: 48, life: 3, speed: 100, size: 6, spread: Math.PI * 2, sprite: sheet('assets/vfx/vfx_magic_burst.png', 408, 512, 60, 8, 8), provenance: { source: 'game.html registerVFX magic_burst', blend: 'lighter' } },
    ],
    preview: { characterId: 'exoduser_warrior', skillId: 'preview_landing', vfxId: 'land_fire', resourceMax: 100, resourceRegen: 10 },
    provenance: { scope: 'FDG independent preview and authoring', gameplayApplied: false, sourceMap: structuredClone(SOURCE_MAP.provenance), skillTuning: 'preview_* authoring samples; not production SKILL_DEFS or slot assignments' },
  };
}
