// boss.js — Boss GLB loader + animation controller (skeleton)
// STEP 1-2에서 구현 예정

export class Boss {
  constructor(scene) {
    this.scene = scene;
    this.model = null;
    this.mixer = null;
    this.actions = {};
  }

  async load(url) {
    // GLTFLoader로 GLB 로드 → this.model, this.mixer 세팅
  }

  update(dt) {
    if (this.mixer) this.mixer.update(dt);
  }
}
