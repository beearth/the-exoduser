import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ── Canvas & Renderer ──
const canvas = document.getElementById('poc-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
renderer.outputColorSpace = THREE.SRGBColorSpace;

// ── Scene ──
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x1a1a2e, 0.035);

// ── Orthographic Camera (isometric 50°) ──
const ISO_ANGLE = 50 * Math.PI / 180;
const AZI_ANGLE = 45 * Math.PI / 180;
const CAM_DIST = 20;
let curFrustum = 8;

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
  -curFrustum * aspect, curFrustum * aspect,
  curFrustum, -curFrustum,
  0.1, 100
);

function updateCamFrustum() {
  const a = window.innerWidth / window.innerHeight;
  camera.left = -curFrustum * a;
  camera.right = curFrustum * a;
  camera.top = curFrustum;
  camera.bottom = -curFrustum;
  camera.updateProjectionMatrix();
}

camera.position.set(
  CAM_DIST * Math.sin(ISO_ANGLE) * Math.cos(AZI_ANGLE),
  CAM_DIST * Math.cos(ISO_ANGLE),
  CAM_DIST * Math.sin(ISO_ANGLE) * Math.sin(AZI_ANGLE)
);
camera.lookAt(0, 0, 0);

// ── Lights ──
const dirLight = new THREE.DirectionalLight(0xffcc88, 0.8);
dirLight.position.set(5, 12, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.set(2048, 2048);
dirLight.shadow.camera.near = 0.5;
dirLight.shadow.camera.far = 40;
dirLight.shadow.camera.left = -15;
dirLight.shadow.camera.right = 15;
dirLight.shadow.camera.top = 15;
dirLight.shadow.camera.bottom = -15;
scene.add(dirLight);

const ambLight = new THREE.AmbientLight(0x332244, 0.3);
scene.add(ambLight);

const rimLight = new THREE.DirectionalLight(0x4444aa, 0.2);
rimLight.position.set(-5, 3, -8);
scene.add(rimLight);

// ── Floor ──
const floorSize = 20;
const floorSeg = 20;
const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize, floorSeg, floorSeg);
floorGeo.rotateX(-Math.PI / 2);

const checkerCanvas = document.createElement('canvas');
checkerCanvas.width = 256;
checkerCanvas.height = 256;
const ctx = checkerCanvas.getContext('2d');
const tileSize = 256 / floorSeg;
for (let r = 0; r < floorSeg; r++) {
  for (let c = 0; c < floorSeg; c++) {
    ctx.fillStyle = (r + c) % 2 === 0 ? '#2a2a3a' : '#222233';
    ctx.fillRect(c * tileSize, r * tileSize, tileSize, tileSize);
  }
}
const checkerTex = new THREE.CanvasTexture(checkerCanvas);
checkerTex.wrapS = checkerTex.wrapT = THREE.RepeatWrapping;

const floorMat = new THREE.MeshStandardMaterial({
  map: checkerTex, roughness: 0.85, metalness: 0.1
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(floorSize, floorSeg, 0x444466, 0x333355);
grid.position.y = 0.01;
scene.add(grid);

// ── 보스 다리 안개 ──
let _bossFogMesh = null;
let _bossFogOn = true;
let _bossRef3d = null;  // 보스 Object3D 참조
let _bossFogBaseY = 0;  // 안개 기준 Y (바닥 위)

const _FOG_DEBUG = true; // ★ 디버그 모드: 빨간색+거대+불투명. 보이면 false로 복구
function _createBossFog(bossWidth) {
  // 디버그: 반경 3배(~6m), 정상: 1.5배(~3m)
  const fogRadius = bossWidth * (_FOG_DEBUG ? 3 : 1.5);
  const geo = new THREE.PlaneGeometry(fogRadius * 2, fogRadius * 2);
  geo.rotateX(-Math.PI / 2); // 수평 배치

  // 텍스처: 디버그=빨강, 정상=보라 그라데이션
  const texSize = 256;
  const fogCanvas = document.createElement('canvas');
  fogCanvas.width = texSize;
  fogCanvas.height = texSize;
  const fc = fogCanvas.getContext('2d');
  const hw = texSize / 2;
  if (_FOG_DEBUG) {
    // ★ 디버그: 빨간 원, 완전 불투명 — 무조건 보여야 함
    const grd = fc.createRadialGradient(hw, hw, 0, hw, hw, hw);
    grd.addColorStop(0, 'rgba(255,0,0,1)');
    grd.addColorStop(0.5, 'rgba(255,0,0,0.8)');
    grd.addColorStop(0.8, 'rgba(255,0,0,0.4)');
    grd.addColorStop(1, 'rgba(255,0,0,0)');
    fc.fillStyle = grd;
    fc.fillRect(0, 0, texSize, texSize);
  } else {
    const grd = fc.createRadialGradient(hw, hw, 0, hw, hw, hw);
    grd.addColorStop(0, 'rgba(50,18,60,0.9)');
    grd.addColorStop(0.2, 'rgba(40,14,50,0.7)');
    grd.addColorStop(0.45, 'rgba(30,10,40,0.4)');
    grd.addColorStop(0.7, 'rgba(22,8,32,0.15)');
    grd.addColorStop(1, 'rgba(18,6,26,0)');
    fc.fillStyle = grd;
    fc.fillRect(0, 0, texSize, texSize);
  }

  const tex = new THREE.CanvasTexture(fogCanvas);
  tex.needsUpdate = true;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    depthTest: false,       // ★ 디버그: depthTest도 끔 → 무조건 그려짐
    side: THREE.DoubleSide,
    opacity: _FOG_DEBUG ? 1.0 : 0.85,
    fog: false              // scene.fog 영향 차단
  });
  _bossFogMesh = new THREE.Mesh(geo, mat);
  _bossFogMesh.renderOrder = _FOG_DEBUG ? 999 : 2;
  _bossFogMesh.visible = true;
  _bossFogMesh.frustumCulled = false;
  scene.add(_bossFogMesh);
  console.log(`[FOG] ★ CREATED — debug=${_FOG_DEBUG}, radius=${fogRadius.toFixed(2)}m, opacity=${mat.opacity}, renderOrder=${_bossFogMesh.renderOrder}, visible=${_bossFogMesh.visible}, parent=${_bossFogMesh.parent===scene?'scene':'???'}, children=${scene.children.length}`);
}

// ── 보스 GLB 로드 ──
let mixer = null;
const loader = new GLTFLoader();
loader.load(
  'assets/boss_01.glb',
  (gltf) => {
    const boss = gltf.scene;

    // 1) Box3 측정 → 2.2m 스케일
    const box = new THREE.Box3().setFromObject(boss);
    const size = box.getSize(new THREE.Vector3());
    const rawH = size.y;
    const TARGET_H = 2.2;
    const sc = TARGET_H / rawH;
    boss.scale.setScalar(sc);
    console.log(`[BOSS] raw height=${rawH.toFixed(3)} → scale=${sc.toFixed(3)} → ${TARGET_H}m`);

    // 발 바닥 정렬
    const box2 = new THREE.Box3().setFromObject(boss);
    boss.position.set(0, -box2.min.y, 0);

    boss.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(boss);

    const box3 = new THREE.Box3().setFromObject(boss);
    const bossSize = box3.getSize(new THREE.Vector3());
    console.log(`[BOSS] final size: ${bossSize.x.toFixed(2)} x ${bossSize.y.toFixed(2)} x ${bossSize.z.toFixed(2)}`);

    // 보스 다리 안개 생성
    _bossRef3d = boss;
    // box3.min.y ≈ 0 (발 바닥 정렬 후), 안개는 발 위 0.05m
    _bossFogBaseY = 0.05;
    const bossW = Math.max(bossSize.x, bossSize.z);
    console.log(`[FOG] Creating fog — bossW=${bossW.toFixed(2)}, baseY=${_bossFogBaseY}, bossPos=(${boss.position.x.toFixed(2)},${boss.position.y.toFixed(2)},${boss.position.z.toFixed(2)})`);
    _createBossFog(bossW);

    // 애니메이션
    const clips = gltf.animations;
    console.log(`[BOSS] ${clips.length} animation(s):`);
    clips.forEach((clip, i) => console.log(`  [${i}] "${clip.name}" (${clip.duration.toFixed(2)}s)`));

    if (clips.length > 0) {
      mixer = new THREE.AnimationMixer(boss);
      const action = mixer.clipAction(clips[0]);
      action.play();
      console.log(`[BOSS] Playing: "${clips[0].name}"`);
    }
  },
  (progress) => {
    if (progress.total > 0)
      console.log(`[BOSS] Loading... ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
  },
  (error) => {
    console.warn('[BOSS] GLB load failed:', error);
  }
);

// ── 플레이어 마커 ──
const playerPos = new THREE.Vector3(4, 0, 4);
const pMarkerGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8);
const pMarkerMat = new THREE.MeshStandardMaterial({ color: 0x3355cc, wireframe: true });
const playerMarker = new THREE.Mesh(pMarkerGeo, pMarkerMat);
playerMarker.position.set(playerPos.x, 0.9, playerPos.z);
playerMarker.castShadow = true;
scene.add(playerMarker);

// ── WASD 입력 ──
const keys = { w: false, a: false, s: false, d: false };
window.addEventListener('keydown', (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = true;
  // F4: 안개 토글
  if (e.code === 'F4') {
    e.preventDefault();
    _bossFogOn = !_bossFogOn;
    if (_bossFogMesh) {
      _bossFogMesh.visible = _bossFogOn;
      console.log(`[FOG TOGGLE] _bossFogOn=${_bossFogOn}, mesh.visible=${_bossFogMesh.visible}, mesh.parent=${_bossFogMesh.parent?_bossFogMesh.parent.type:'DETACHED'}`);
    } else {
      console.warn('[FOG TOGGLE] _bossFogMesh is NULL!');
    }
  }
});
window.addEventListener('keyup', (e) => {
  const k = e.key.toLowerCase();
  if (k in keys) keys[k] = false;
});

// 카메라 기준 이동 방향 계산용 벡터
const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();
const PLAYER_SPEED = 5;

// ── OrbitControls ──
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enableZoom = true;
controls.target.set(playerPos.x, 1, playerPos.z);
controls.update();

// ── 카메라 추적 타겟 ──
const camTarget = new THREE.Vector3(playerPos.x, 1, playerPos.z);
const LERP = 0.1;

// ── Resize ──
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  updateCamFrustum();
});

// ── HUD ──
const hudEl = document.getElementById('info');
hudEl.innerHTML = '';

const fpsEl = document.createElement('div');
fpsEl.style.cssText = 'position:fixed;top:8px;left:12px;color:#aaa;font:13px/1.4 monospace;z-index:10';
document.body.appendChild(fpsEl);

const hpBarWrap = document.createElement('div');
hpBarWrap.style.cssText = 'position:fixed;top:12px;left:50%;transform:translateX(-50%);width:300px;z-index:10;text-align:center';
hpBarWrap.innerHTML = `
  <div style="color:#ff4444;font:bold 14px monospace;margin-bottom:4px">BOSS — 100 / 100</div>
  <div style="background:#222;border:1px solid #555;border-radius:3px;height:14px;overflow:hidden">
    <div id="hp-fill" style="background:linear-gradient(#cc2222,#ff4444);width:100%;height:100%"></div>
  </div>`;
document.body.appendChild(hpBarWrap);

// ── FPS 카운터 ──
let frameCount = 0, fpsTime = 0, fps = 0;

// ── Render Loop ──
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  // FPS
  frameCount++;
  fpsTime += dt;
  if (fpsTime >= 0.5) {
    fps = Math.round(frameCount / fpsTime);
    fpsEl.textContent = `FPS: ${fps}`;
    frameCount = 0;
    fpsTime = 0;
  }

  // 보스 애니메이션
  if (mixer) mixer.update(dt);

  // 보스 다리 안개 업데이트 (위치 추적 + 진동 + 회전)
  if (_bossFogMesh && _bossRef3d) {
    _bossFogMesh.visible = _bossFogOn;
    if (_bossFogOn) {
      const bx = _bossRef3d.position.x;
      const bz = _bossRef3d.position.z;
      // Y: 바닥 위 고정 + sin wave 진동 (amplitude 0.05, 주기 2초)
      const oscY = Math.sin(clock.elapsedTime * Math.PI) * 0.05;
      _bossFogMesh.position.set(bx, _bossFogBaseY + oscY, bz);
      // 천천히 회전 (안개 흐르는 느낌)
      _bossFogMesh.rotation.y += 0.001;
    }
  }
  // 매 프레임 디버그 로그 (0.5초 주기 FPS 리셋 시점에만)
  if (_bossFogMesh && fpsTime < dt * 1.5) {
    const fp = _bossFogMesh.position;
    const vis = _bossFogMesh.visible;
    const par = _bossFogMesh.parent ? _bossFogMesh.parent.type : 'NONE';
    const bossP = _bossRef3d ? _bossRef3d.position : {x:'?',y:'?',z:'?'};
    console.log(`[FOG-FRAME] visible=${vis} parent=${par} fogPos=(${typeof fp.x==='number'?fp.x.toFixed(2):fp.x},${typeof fp.y==='number'?fp.y.toFixed(2):fp.y},${typeof fp.z==='number'?fp.z.toFixed(2):fp.z}) bossPos=(${typeof bossP.x==='number'?bossP.x.toFixed(2):bossP.x},${typeof bossP.y==='number'?bossP.y.toFixed(2):bossP.y},${typeof bossP.z==='number'?bossP.z.toFixed(2):bossP.z}) renderOrder=${_bossFogMesh.renderOrder} opacity=${_bossFogMesh.material.opacity}`);
  } else if (!_bossFogMesh && fpsTime < dt * 1.5) {
    console.warn('[FOG-FRAME] _bossFogMesh is NULL — boss GLB not loaded yet?');
  }

  // WASD 이동 (카메라 기준 방향)
  _forward.set(0, 0, 0);
  _right.set(0, 0, 0);

  // 카메라 → 타겟 방향에서 XZ 평면 forward/right 추출
  camera.getWorldDirection(_forward);
  _forward.y = 0;
  _forward.normalize();
  _right.crossVectors(camera.up, _forward).normalize();

  const move = new THREE.Vector3();
  if (keys.w) move.add(_forward);
  if (keys.s) move.sub(_forward);
  if (keys.a) move.add(_right);
  if (keys.d) move.sub(_right);

  if (move.lengthSq() > 0) {
    move.normalize().multiplyScalar(PLAYER_SPEED * dt);
    playerPos.add(move);
  }

  playerMarker.position.set(playerPos.x, 0.9, playerPos.z);
  playerMarker.rotation.y -= 0.5 * dt;

  // 카메라 추적 (Lerp)
  camTarget.set(playerPos.x, 1, playerPos.z);
  controls.target.lerp(camTarget, LERP);
  controls.update();

  renderer.render(scene, camera);
}

animate();

console.log('[POC] Scene ready — WASD to move, mouse to orbit');
