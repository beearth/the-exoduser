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
const H = 10;
const ISO_ANGLE = 50 * Math.PI / 180;  // 50도
const AZI_ANGLE = 45 * Math.PI / 180;  // 45도 (아이소 기본)

const aspect = window.innerWidth / window.innerHeight;
const frustum = 10;
const camera = new THREE.OrthographicCamera(
  -frustum * aspect, frustum * aspect,
  frustum, -frustum,
  0.1, 100
);

camera.position.set(
  H * Math.sin(ISO_ANGLE) * Math.cos(AZI_ANGLE),
  H * Math.cos(ISO_ANGLE),
  H * Math.sin(ISO_ANGLE) * Math.sin(AZI_ANGLE)
);
camera.lookAt(0, 0, 0);

// ── Lights (Berserk tone: warm key + cool purple ambient) ──
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

// 보조 림 라이트 (뒤쪽에서 실루엣 강조)
const rimLight = new THREE.DirectionalLight(0x4444aa, 0.2);
rimLight.position.set(-5, 3, -8);
scene.add(rimLight);

// ── Floor (checker pattern) ──
const floorSize = 20;
const floorSeg = 20;
const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize, floorSeg, floorSeg);
floorGeo.rotateX(-Math.PI / 2);

// 체커 패턴 텍스처 생성
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
  map: checkerTex,
  roughness: 0.85,
  metalness: 0.1
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.receiveShadow = true;
scene.add(floor);

// 그리드 헬퍼 (가이드 용도)
const grid = new THREE.GridHelper(floorSize, floorSeg, 0x444466, 0x333355);
grid.position.y = 0.01;
scene.add(grid);

// ── 보스 GLB 로드 ──
let mixer = null;
const loader = new GLTFLoader();
loader.load(
  'assets/boss_01.glb',
  (gltf) => {
    const boss = gltf.scene;

    // 바운딩박스로 원본 크기 측정 → 2.2m 높이에 맞게 스케일
    const box = new THREE.Box3().setFromObject(boss);
    const size = box.getSize(new THREE.Vector3());
    const rawH = size.y;
    const TARGET_H = 2.2;
    const sc = TARGET_H / rawH;
    boss.scale.setScalar(sc);
    console.log(`[BOSS] raw height=${rawH.toFixed(3)} → scale=${sc.toFixed(3)} → ${TARGET_H}m`);

    // 스케일 적용 후 바운딩박스 재측정, 발을 바닥(y=0)에 붙임
    const box2 = new THREE.Box3().setFromObject(boss);
    boss.position.set(0, -box2.min.y, 0);

    boss.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    scene.add(boss);

    // 카메라를 보스 전신이 꽉 차게 조정 (높이 기준)
    const box3 = new THREE.Box3().setFromObject(boss);
    const center = box3.getCenter(new THREE.Vector3());
    const bossSize = box3.getSize(new THREE.Vector3());
    const newFrustum = bossSize.y * 1.4;
    const a = window.innerWidth / window.innerHeight;
    camera.left = -newFrustum * a;
    camera.right = newFrustum * a;
    camera.top = newFrustum;
    camera.bottom = -newFrustum;
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    const camDist = 8;
    camera.position.set(
      center.x + camDist * Math.sin(ISO_ANGLE) * Math.cos(AZI_ANGLE),
      center.y + camDist * Math.cos(ISO_ANGLE),
      center.z + camDist * Math.sin(ISO_ANGLE) * Math.sin(AZI_ANGLE)
    );
    controls.update();
    console.log(`[BOSS] size: ${bossSize.x.toFixed(2)} x ${bossSize.y.toFixed(2)} x ${bossSize.z.toFixed(2)}, frustum=${newFrustum.toFixed(2)}`);

    // 애니메이션 추출 & 재생
    const clips = gltf.animations;
    console.log(`[BOSS] GLB loaded — ${clips.length} animation(s):`);
    clips.forEach((clip, i) => console.log(`  [${i}] "${clip.name}" (${clip.duration.toFixed(2)}s)`));

    if (clips.length > 0) {
      mixer = new THREE.AnimationMixer(boss);
      const action = mixer.clipAction(clips[0]);
      action.play();
      console.log(`[BOSS] Playing: "${clips[0].name}"`);
    }
  },
  (progress) => {
    if (progress.total > 0) {
      console.log(`[BOSS] Loading... ${(progress.loaded / progress.total * 100).toFixed(0)}%`);
    }
  },
  (error) => {
    console.warn('[BOSS] GLB load failed:', error);
  }
);

// 플레이어 위치 마커 (파란 원기둥, 높이 ~1.8)
const pMarkerGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 8);
const pMarkerMat = new THREE.MeshStandardMaterial({ color: 0x3355cc, wireframe: true });
const playerMarker = new THREE.Mesh(pMarkerGeo, pMarkerMat);
playerMarker.position.set(4, 0.9, 4);
playerMarker.castShadow = true;
scene.add(playerMarker);

// ── OrbitControls (임시, GLB 검증용) ──
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 1, 0);
controls.update();

// ── Resize ──
window.addEventListener('resize', () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const a = w / h;
  camera.left = -frustum * a;
  camera.right = frustum * a;
  camera.top = frustum;
  camera.bottom = -frustum;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});

// ── Render Loop ──
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  controls.update();

  // 보스 애니메이션 업데이트
  if (mixer) mixer.update(dt);

  // 마커 회전 (씬이 살아있는지 시각적 확인)
  playerMarker.rotation.y -= 0.5 * dt;

  renderer.render(scene, camera);
}

animate();

console.log('[POC] Scene ready — loading boss_01.glb');
