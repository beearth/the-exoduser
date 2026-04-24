// combat.js — Hit detection + damage system (skeleton)
// DAY 2에서 구현 예정

export class Combat {
  constructor() {
    this.entities = [];
  }

  register(entity) {
    this.entities.push(entity);
  }

  update(dt) {
    // 히트박스 충돌 판정
  }
}
