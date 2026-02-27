export enum ElementType {
  Physical = 0,
  Fire = 1,
  Ice = 2,
  Dark = 3,
  Lightning = 4
}

export interface Item {
  id: number;
  slot: string;
  el: ElementType;
  rarity: number;
  tier: number;
  name: string;
  emoji: string;
  atk?: number;
  def?: number;
  spd?: number;
  charge?: number;
  chargeDist?: number;
  stagger?: number;
  range?: number;
  beamDmg?: number;
  elements?: Array<{ el: ElementType; dmg: number }>;
}

export interface GameState {
  on: boolean;
  paused: boolean;
  stage: number;
  kills: number;
  mats: number;
  cam: { x: number; y: number };
  shake: number;
  hitStop: number;
  slowMo: number;
  curRoom: number;
  forgeOpen: boolean;
}
