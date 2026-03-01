import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { generateDungeon } from './dungeon.js';

/* ═══════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════ */
const TILE = 20;
const VIEW = 420;
const PLAYER_SPD = 7.5;
const CAM_LERP = 0.10;
const ATK_DUR = 0.18;
const ATK_RANGE = TILE * 2.8;
const ATK_ARC = Math.PI * 0.75;

// Post-processing
const BLOOM_STR = 0.6;
const BLOOM_RAD = 0.5;
const BLOOM_THR = 0.85;

/* ═══════════════════════════════════════════════════════════════
   VIGNETTE + COLOR GRADING SHADER
   Teal shadows / warm highlights — cinematic D2R aesthetic
   ═══════════════════════════════════════════════════════════════ */
const VignetteShader = {
  name: 'VignetteColorGrade',
  uniforms: {
    tDiffuse: { value: null },
    strength: { value: 2.2 },
  },
  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float strength;
    varying vec2 vUv;
    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      // Vignette
      vec2 q = vUv - 0.5;
      float vig = 1.0 - dot(q, q) * strength;
      c.rgb *= clamp(vig, 0.0, 1.0);
      // Color grade: teal shadows, warm highlights
      float lum = dot(c.rgb, vec3(0.299, 0.587, 0.114));
      vec3 warm = c.rgb * vec3(1.08, 1.0, 0.86);
      vec3 cool = c.rgb * vec3(0.86, 0.97, 1.14);
      c.rgb = mix(cool, warm, smoothstep(0.0, 0.35, lum));
      // Contrast lift
      c.rgb = pow(c.rgb, vec3(1.08));
      gl_FragColor = c;
    }`,
};

/* ═══════════════════════════════════════════════════════════════
   ATLAS TILE INDICES (4×4 grid)
   Row 0: floors  — 0:slime  1:eggspeck  2:fungus   3:chitin
   Row 1: edges   — 4:chitin 5:vein      6:web      7:ridge
   Row 2: decals  — 8:eggs   9:cocoon    10:puddle  11:bones
   Row 3: effects — 12:spore 13:rune     14:floorNoise 15:wallGrime
   ═══════════════════════════════════════════════════════════════ */

class Game {
  constructor() {
    this.keys = {};
    this.floor = 0;
    this.dungeon = null;
    this.dungeonGroup = null;
    this.playerPos = new THREE.Vector2();
    this.clock = new THREE.Clock();

    // Combat
    this.mouseWorld = new THREE.Vector2();
    this.aimAngle = 0;
    this.attackTimer = 0;
    this.attackAngle = 0;
    this.attackCooldown = 0;
    this.slashMesh = null;
    this.ens = [];
    this.hitEns = new Set();
    this.combo = 0;
    this.killCount = 0;

    // Particles
    this.particles = null;
    this.particleBaseZ = null;
    this.particlePhases = null;
    this.particleCount = 0;

    this.init();
    this.setupInput();
    this.animate();
  }

  /* ─── Three.js + Post-processing setup ─── */
  init() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010103);

    const aspect = innerWidth / innerHeight;
    this.camera = new THREE.OrthographicCamera(
      -VIEW * aspect / 2, VIEW * aspect / 2,
      VIEW / 2, -VIEW / 2, 0.1, 1000
    );
    this.camera.position.set(0, 0, 100);

    // ── Full-resolution renderer with tone mapping ──
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    document.body.appendChild(this.renderer.domElement);

    // ── Post-processing pipeline ──
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(innerWidth, innerHeight),
      BLOOM_STR, BLOOM_RAD, BLOOM_THR
    );
    this.composer.addPass(bloom);
    this.bloomPass = bloom;

    const vignette = new ShaderPass(VignetteShader);
    this.composer.addPass(vignette);

    const output = new OutputPass();
    this.composer.addPass(output);

    // ── Resize handler ──
    window.addEventListener('resize', () => {
      const a = innerWidth / innerHeight;
      this.camera.left = -VIEW * a / 2;
      this.camera.right = VIEW * a / 2;
      this.camera.top = VIEW / 2;
      this.camera.bottom = -VIEW / 2;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
      this.composer.setSize(innerWidth, innerHeight);
      this.bloomPass.resolution.set(innerWidth, innerHeight);
    });

    // ── Load textures (SMOOTH filtering — no pixelation) ──
    const loader = new THREE.TextureLoader();
    this._texLoaded = 0;
    const onTex = () => { if (++this._texLoaded >= 3) this.onTexturesReady(); };

    const maxAniso = this.renderer.capabilities.getMaxAnisotropy();

    this.atlas = loader.load('/img/atlas_insect.png', tex => {
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      tex.anisotropy = maxAniso;
      onTex();
    });

    this.wallGrimeTex = loader.load('/img/wall_grime.png', tex => {
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.generateMipmaps = true;
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.anisotropy = maxAniso;
      onTex();
    });

    this.playerTex = loader.load('/img/exoduser.png', tex => {
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      onTex();
    });

    // ── Particle glow texture (soft radial gradient) ──
    this.particleTex = this._makeGlowTexture();

    // ── Minimap ──
    this.minimapCanvas = document.createElement('canvas');
    this.minimapCanvas.style.cssText =
      'position:fixed;bottom:16px;right:16px;border:2px solid #3a3;border-radius:4px;background:#000;z-index:10;';
    document.body.appendChild(this.minimapCanvas);
  }

  _makeGlowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.7)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.15)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(c);
    return tex;
  }

  onTexturesReady() {
    console.log('All textures loaded — building dungeon...');
    this.loadFloor(0);
    document.getElementById('loading')?.classList.add('hide');
  }

  /* ─── Input ─── */
  setupInput() {
    window.addEventListener('keydown', e => { this.keys[e.code] = true; });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });

    window.addEventListener('mousemove', e => {
      const rect = this.renderer.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      const aspect = innerWidth / innerHeight;
      this.mouseWorld.set(
        this.camera.position.x + ndcX * VIEW * aspect / 2,
        this.camera.position.y + ndcY * VIEW / 2
      );
      this.aimAngle = Math.atan2(
        this.mouseWorld.y - this.playerPos.y,
        this.mouseWorld.x - this.playerPos.x
      );
    });

    window.addEventListener('mousedown', e => {
      if (e.button === 0) this.doAttack();
    });
  }

  /* ─── Attack ─── */
  doAttack() {
    if (this.attackCooldown > 0) return;
    this.attackTimer = ATK_DUR;
    this.attackCooldown = ATK_DUR + 0.08;
    this.attackAngle = this.aimAngle;
    this.hitEns = new Set();
    this.combo++;
    this.createSlashEffect();
  }

  createSlashEffect() {
    if (this.slashMesh) {
      this.scene.remove(this.slashMesh);
      this.slashMesh.geometry.dispose();
      this.slashMesh.material.dispose();
    }
    const segments = 20;
    const innerR = TILE * 0.5, outerR = ATK_RANGE;
    const shape = new THREE.Shape();
    const startA = this.attackAngle - ATK_ARC / 2;
    const endA = this.attackAngle + ATK_ARC / 2;

    shape.moveTo(Math.cos(startA) * innerR, Math.sin(startA) * innerR);
    for (let i = 0; i <= segments; i++) {
      const a = startA + (endA - startA) * (i / segments);
      shape.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
    }
    for (let i = segments; i >= 0; i--) {
      const a = startA + (endA - startA) * (i / segments);
      shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
    }

    const geo = new THREE.ShapeGeometry(shape);
    const mat = new THREE.MeshBasicMaterial({
      color: 0xffcc44,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.slashMesh = new THREE.Mesh(geo, mat);
    this.slashMesh.position.set(this.playerPos.x, this.playerPos.y, 8);
    this.slashMesh.renderOrder = 20;
    this.scene.add(this.slashMesh);
  }

  /* ─── Load dungeon floor ─── */
  loadFloor(fi) {
    this.floor = fi;
    this.dungeon = generateDungeon(fi);
    this.buildTiles(this.dungeon);
    this.createPlayer();
    this.setupLights();
    this.buildParticles(this.dungeon);
    this.drawMinimap();

    const sr = this.dungeon.startRoom;
    if (sr) this.playerPos.set(sr.cx * TILE, -sr.cy * TILE);
    this.camera.position.x = this.playerPos.x;
    this.camera.position.y = this.playerPos.y;

    this.spawnEnemies();
    document.getElementById('floorNum').textContent = `B${fi + 1}F — 충의 둥지`;
    this.killCount = 0;
    this.updateKillHud();
  }

  /* ─── Enemy Spawning ─── */
  spawnEnemies() {
    for (const en of this.ens) { if (en.mesh) this.scene.remove(en.mesh); }
    this.ens = [];
    if (!this.dungeon) return;

    const ETYPES = [
      { name: '유충',    color: 0x66aa33, hp: 20, atk: 5,  spd: 2.5, r: TILE * 0.4 },
      { name: '거미',    color: 0x888844, hp: 14, atk: 8,  spd: 4.0, r: TILE * 0.35 },
      { name: '딱정벌레', color: 0x556633, hp: 35, atk: 10, spd: 1.5, r: TILE * 0.55 },
      { name: '자폭충',  color: 0xcc4422, hp: 12, atk: 18, spd: 3.5, r: TILE * 0.3 },
    ];

    for (const room of this.dungeon.rooms) {
      if (room.type !== 'combat') continue;
      const count = 3 + ~~(Math.random() * 4) + this.floor;
      for (let i = 0; i < count; i++) {
        const ex = (room.x + 1 + ~~(Math.random() * (room.w - 2))) * TILE;
        const ey = -(room.y + 1 + ~~(Math.random() * (room.h - 2))) * TILE;
        const et = ETYPES[~~(Math.random() * ETYPES.length)];
        const en = {
          x: ex, y: ey,
          hp: et.hp + this.floor * 3, maxHp: et.hp + this.floor * 3,
          atk: et.atk + this.floor, spd: et.spd, r: et.r,
          color: et.color, name: et.name,
          aggroRange: TILE * 10, hitFlash: 0, dead: false, mesh: null,
        };
        this.createEnemyMesh(en);
        this.ens.push(en);
      }
    }

    const br = this.dungeon.bossRoom;
    if (br) {
      const boss = {
        x: br.cx * TILE, y: -br.cy * TILE,
        hp: 80 + this.floor * 20, maxHp: 80 + this.floor * 20,
        atk: 15 + this.floor * 3, spd: 2.0, r: TILE * 0.9,
        color: 0xff2244, name: '여왕충',
        aggroRange: TILE * 14, hitFlash: 0, dead: false, boss: true, mesh: null,
      };
      this.createEnemyMesh(boss);
      this.ens.push(boss);
    }
  }

  createEnemyMesh(en) {
    const geo = new THREE.CircleGeometry(en.r, en.boss ? 6 : 12);
    const mat = new THREE.MeshBasicMaterial({
      color: en.color, transparent: true, opacity: 0.9,
    });
    en.mesh = new THREE.Mesh(geo, mat);
    en.mesh.position.set(en.x, en.y, 4);
    en.mesh.renderOrder = 8;
    this.scene.add(en.mesh);
  }

  updateKillHud() {
    let el = document.getElementById('killCount');
    if (!el) {
      el = document.createElement('div');
      el.id = 'killCount';
      el.style.cssText = 'position:fixed;top:40px;left:20px;color:#f84;font-size:14px;font-weight:bold;text-shadow:0 1px 3px #000;z-index:10;';
      document.body.appendChild(el);
    }
    el.textContent = `처치: ${this.killCount}`;
  }

  /* ═══════════════════════════════════════════════════════════════
     BUILD TILE LAYERS — the core rendering pipeline
     Layer order (z): walls(-0.5) → floor(0) → overlay(0.3) →
       decals(0.6) → edges(1.2) → glows(2.0) → enemies(4) → player(5)
     ═══════════════════════════════════════════════════════════════ */
  buildTiles(dg) {
    if (this.dungeonGroup) {
      this.scene.remove(this.dungeonGroup);
      this.dungeonGroup.traverse(c => {
        if (c.geometry) c.geometry.dispose();
        if (c.material) {
          if (Array.isArray(c.material)) c.material.forEach(m => m.dispose());
          else c.material.dispose();
        }
      });
    }
    this.dungeonGroup = new THREE.Group();
    this.scene.add(this.dungeonGroup);
    this._shaderMaterials = [];

    const { map, mw, mh, edges, decals, glows, overlays, wallDist } = dg;
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    // ── Count tiles ──
    let floorCount = 0;
    const visWalls = [];
    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      if (map[y][x] === 0 || map[y][x] === 2) floorCount++;
      else {
        // Only render walls adjacent to floor (visible boundary walls)
        let nearFloor = false;
        for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]]) {
          const nx = x + dx, ny = y + dy;
          if (nx >= 0 && nx < mw && ny >= 0 && ny < mh && map[ny][nx] !== 1) {
            nearFloor = true; break;
          }
        }
        if (nearFloor) visWalls.push({ x, y });
      }
    }

    // ═══ LAYER 0: Visible walls — dark organic planes ═══
    if (visWalls.length > 0) {
      const wallGeo = new THREE.PlaneGeometry(TILE * 1.12, TILE * 1.12);
      const wallMat = new THREE.MeshBasicMaterial({
        map: this.wallGrimeTex,
        color: 0x100d08,
      });
      const wallMesh = new THREE.InstancedMesh(wallGeo, wallMat, visWalls.length);
      wallMesh.frustumCulled = false;
      for (let i = 0; i < visWalls.length; i++) {
        const w = visWalls[i];
        dummy.position.set(w.x * TILE, -w.y * TILE, -0.5);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        wallMesh.setMatrixAt(i, dummy.matrix);
        const v = 0.6 + Math.random() * 0.4;
        color.setRGB(v, v * 0.9, v * 0.8);
        wallMesh.setColorAt(i, color);
      }
      wallMesh.instanceMatrix.needsUpdate = true;
      if (wallMesh.instanceColor) wallMesh.instanceColor.needsUpdate = true;
      this.dungeonGroup.add(wallMesh);
    }

    // ═══ LAYER 1: Floor tiles — atlas textured with AO ═══
    {
      const floorGeo = new THREE.PlaneGeometry(TILE * 1.08, TILE * 1.08); // generous overlap hides all grid seams
      const floorMat = this.createAtlasMaterial(false, false, true); // hasAO = true
      const floorMesh = new THREE.InstancedMesh(floorGeo, floorMat, floorCount);
      floorMesh.frustumCulled = false;

      const tileIndices = new Float32Array(floorCount);
      const aoFactors = new Float32Array(floorCount);
      let fi = 0;

      for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
        if (map[y][x] !== 0 && map[y][x] !== 2) continue;
        // Jitter position to break grid pattern (overlap covers gaps)
        const jx = (Math.random() - 0.5) * 2.0;
        const jy = (Math.random() - 0.5) * 2.0;
        dummy.position.set(x * TILE + jx, -y * TILE + jy, 0);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();
        floorMesh.setMatrixAt(fi, dummy.matrix);

        // 100% chitin_cracked(3) for seamless stone floor — variety via overlays/decals
        tileIndices[fi] = 3;

        // AO from wall distance — darker near walls
        const wd = wallDist ? wallDist[y][x] : 99;
        aoFactors[fi] = wd <= 0 ? 0.25 : wd === 1 ? 0.5 : wd === 2 ? 0.72 : wd === 3 ? 0.88 : 1.0;

        // Uniform warm brown — no per-tile color variation = invisible seams
        color.setRGB(0.95, 0.88, 0.74);
        floorMesh.setColorAt(fi, color);
        fi++;
      }

      floorGeo.setAttribute('tileIdx', new THREE.InstancedBufferAttribute(tileIndices, 1));
      floorGeo.setAttribute('aoFactor', new THREE.InstancedBufferAttribute(aoFactors, 1));
      floorMesh.instanceMatrix.needsUpdate = true;
      if (floorMesh.instanceColor) floorMesh.instanceColor.needsUpdate = true;
      this.dungeonGroup.add(floorMesh);
    }

    // (Overlay layer removed — chitin floor texture + decals provide enough detail)

    // ═══ LAYER 3: Decals — eggs, cocoons, slime, bones (varying sizes) ═══
    if (decals.length > 0) {
      // Split into small and large for size variety
      const decalData = decals.map(d => ({
        ...d,
        scale: 0.6 + Math.random() * 0.8, // 0.6x to 1.4x random scale
      }));

      const decGeo = new THREE.PlaneGeometry(TILE, TILE);
      const decMat = this.createAtlasMaterial(true);
      const decMesh = new THREE.InstancedMesh(decGeo, decMat, decalData.length);
      decMesh.frustumCulled = false;
      const decIdx = new Float32Array(decalData.length);

      for (let i = 0; i < decalData.length; i++) {
        const d = decalData[i];
        const sc = d.scale;
        dummy.position.set(
          d.x * TILE + (Math.random() - 0.5) * TILE * 0.2,
          -d.y * TILE + (Math.random() - 0.5) * TILE * 0.2,
          0.15  // almost flush with floor
        );
        dummy.rotation.set(0, 0, ~~(Math.random() * 4) * Math.PI / 2); // 90° increments only
        dummy.scale.set(sc, sc, 1);
        dummy.updateMatrix();
        decMesh.setMatrixAt(i, dummy.matrix);
        decIdx[i] = 8 + d.type; // atlas tiles 8-11
        const dv = 0.28 + Math.random() * 0.18;
        color.setRGB(dv * 0.9, dv * 0.75, dv * 0.55); // dark warm brown — nearly invisible blend
        decMesh.setColorAt(i, color);
      }

      decGeo.setAttribute('tileIdx', new THREE.InstancedBufferAttribute(decIdx, 1));
      decMesh.instanceMatrix.needsUpdate = true;
      if (decMesh.instanceColor) decMesh.instanceColor.needsUpdate = true;
      this.dungeonGroup.add(decMesh);
    }

    // ═══ LAYER 4: Edge tiles — organic wall-floor transitions (multiply blend) ═══
    if (edges.length > 0) {
      const edgeScale = 1.6;
      const edgeGeo = new THREE.PlaneGeometry(TILE * edgeScale, TILE * edgeScale);
      const edgeMat = this.createAtlasMaterial(true, false, false, 0.55); // 55% alpha for soft blend
      const edgeMesh = new THREE.InstancedMesh(edgeGeo, edgeMat, edges.length);
      edgeMesh.frustumCulled = false;
      const edgeIdx = new Float32Array(edges.length);

      for (let i = 0; i < edges.length; i++) {
        const e = edges[i];
        // Push slightly toward wall
        const pushX = [0, 0.25, 0, -0.25][e.dir] * TILE;
        const pushY = [-0.25, 0, 0.25, 0][e.dir] * TILE;
        dummy.position.set(e.x * TILE + pushX, -e.y * TILE + pushY, 0.8);
        dummy.rotation.set(0, 0, -e.dir * Math.PI / 2);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        edgeMesh.setMatrixAt(i, dummy.matrix);
        edgeIdx[i] = 4 + ~~(Math.random() * 4); // edge tiles 4-7
        const ev = 0.5 + Math.random() * 0.2; // semi-dark organic border
        color.setRGB(ev, ev * 0.88, ev * 0.72);
        edgeMesh.setColorAt(i, color);
      }

      edgeGeo.setAttribute('tileIdx', new THREE.InstancedBufferAttribute(edgeIdx, 1));
      edgeMesh.instanceMatrix.needsUpdate = true;
      if (edgeMesh.instanceColor) edgeMesh.instanceColor.needsUpdate = true;
      this.dungeonGroup.add(edgeMesh);
    }

    // ═══ LAYER 5: Glow elements — small atmospheric emitters ═══
    if (glows.length > 0) {
      const glowGeo = new THREE.PlaneGeometry(TILE * 0.8, TILE * 0.8);
      const glowMat = this.createAtlasMaterial(true, true); // transparent + emissive
      const glowMesh = new THREE.InstancedMesh(glowGeo, glowMat, glows.length);
      glowMesh.frustumCulled = false;
      const glowIdx = new Float32Array(glows.length);

      for (let i = 0; i < glows.length; i++) {
        const g = glows[i];
        const sc = 0.6 + Math.random() * 0.6; // varying small sizes
        dummy.position.set(
          g.x * TILE + (Math.random() - 0.5) * TILE * 0.4,
          -g.y * TILE + (Math.random() - 0.5) * TILE * 0.4,
          1.8
        );
        dummy.rotation.set(0, 0, Math.random() * Math.PI * 2);
        dummy.scale.set(sc, sc, 1);
        dummy.updateMatrix();
        glowMesh.setMatrixAt(i, dummy.matrix);
        glowIdx[i] = 12 + g.type;
        // Moderate colors — bloom will amplify naturally
        const gc = g.type === 0
          ? [0.3, 0.7, 0.25] // green spores (subtle)
          : [0.25, 0.5, 0.75]; // blue runes (subtle)
        color.setRGB(gc[0], gc[1], gc[2]);
        glowMesh.setColorAt(i, color);
      }

      glowGeo.setAttribute('tileIdx', new THREE.InstancedBufferAttribute(glowIdx, 1));
      glowMesh.instanceMatrix.needsUpdate = true;
      if (glowMesh.instanceColor) glowMesh.instanceColor.needsUpdate = true;
      this.dungeonGroup.add(glowMesh);
    }

    this.collisionMap = map;
    this.mapW = mw;
    this.mapH = mh;
  }

  /* ═══════════════════════════════════════════════════════════════
     CUSTOM ATLAS SHADER — lighting + AO + emissive
     ═══════════════════════════════════════════════════════════════ */
  createAtlasMaterial(transparent = false, emissive = false, hasAO = false, alphaMult = 1.0) {
    const MAX_LIGHTS = 48;
    const mat = new THREE.ShaderMaterial({
      transparent,
      depthWrite: !transparent,
      blending: emissive ? THREE.AdditiveBlending : THREE.NormalBlending,
      defines: { MAX_LIGHTS, HAS_AO: hasAO },
      uniforms: {
        atlas: { value: this.atlas },
        emissiveStr: { value: emissive ? 0.6 : 0.0 },
        alphaMult: { value: alphaMult },
        time: { value: 0 },
        ambientStr: { value: 0.15 },
        // Torch (player light)
        torchPos: { value: new THREE.Vector3() },
        torchColor: { value: new THREE.Color(0xffaa66) },
        torchRange: { value: TILE * 20 },
        torchIntensity: { value: 3.0 },
        // Room lights
        lightPosRange: { value: new Array(MAX_LIGHTS).fill(null).map(() => new THREE.Vector4()) },
        lightColors: { value: new Array(MAX_LIGHTS).fill(null).map(() => new THREE.Color(0, 0, 0)) },
        numLights: { value: 0 },
      },
      vertexShader: /* glsl */`
        attribute float tileIdx;
        #ifdef HAS_AO
          attribute float aoFactor;
          varying float vAO;
        #endif
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vColor;

        void main() {
          // Atlas UV: 4×4 grid with padding to prevent bleeding
          float col = mod(tileIdx, 4.0);
          float row = floor(tileIdx / 4.0);
          float pad = 0.003;
          vec2 tileSize = vec2(0.25 - pad * 2.0);
          vUv = uv * tileSize + vec2(col * 0.25 + pad, (3.0 - row) * 0.25 + pad);

          #ifdef USE_INSTANCING_COLOR
            vColor = instanceColor;
          #else
            vColor = vec3(1.0);
          #endif

          #ifdef HAS_AO
            vAO = aoFactor;
          #endif

          vec4 worldPos = instanceMatrix * vec4(position, 1.0);
          vWorldPos = worldPos.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * worldPos;
        }
      `,
      fragmentShader: /* glsl */`
        uniform sampler2D atlas;
        uniform float emissiveStr;
        uniform float alphaMult;
        uniform float time;
        uniform float ambientStr;
        uniform vec3 torchPos;
        uniform vec3 torchColor;
        uniform float torchRange;
        uniform float torchIntensity;
        uniform vec4 lightPosRange[MAX_LIGHTS];
        uniform vec3 lightColors[MAX_LIGHTS];
        uniform int numLights;

        #ifdef HAS_AO
          varying float vAO;
        #endif
        varying vec2 vUv;
        varying vec3 vWorldPos;
        varying vec3 vColor;

        float atten(float dist, float range) {
          float r = clamp(1.0 - dist / range, 0.0, 1.0);
          return r * r * r; // cubic falloff — softer, more cinematic
        }

        void main() {
          vec4 tex = texture2D(atlas, vUv);
          if (tex.a < 0.08) discard;

          vec3 base = tex.rgb * vColor;

          // Ambient
          vec3 lit = base * ambientStr;

          // Torch light
          float tDist = distance(vWorldPos.xy, torchPos.xy);
          float tAtt = atten(tDist, torchRange) * torchIntensity;
          lit += base * torchColor * tAtt;

          // Room lights
          for (int i = 0; i < MAX_LIGHTS; i++) {
            if (i >= numLights) break;
            vec4 lpr = lightPosRange[i];
            if (lpr.w <= 0.0) continue;
            float d = distance(vWorldPos.xy, lpr.xy);
            float a = atten(d, lpr.w) * 1.5;
            lit += base * lightColors[i] * a;
          }

          // Ambient occlusion
          #ifdef HAS_AO
            lit *= mix(0.25, 1.0, vAO);
          #endif

          // Emissive glow (spores/runes)
          if (emissiveStr > 0.0) {
            float pulse = 0.65 + 0.35 * sin(time * 2.5 + vWorldPos.x * 0.08 + vWorldPos.y * 0.06);
            lit += tex.rgb * emissiveStr * pulse * vColor;
          }

          // Distance fog — fade to black beyond torch range
          float fogDist = distance(vWorldPos.xy, torchPos.xy);
          // Combine torch range + nearest room light for effective visibility
          float visRange = torchRange;
          for (int i = 0; i < MAX_LIGHTS; i++) {
            if (i >= numLights) break;
            vec4 lpr = lightPosRange[i];
            if (lpr.w <= 0.0) continue;
            float ld = distance(vWorldPos.xy, lpr.xy);
            if (ld < lpr.w) {
              visRange = max(visRange, lpr.w - ld + torchRange * 0.3);
            }
          }
          float fog = smoothstep(visRange * 0.5, visRange * 1.1, fogDist);
          lit = mix(lit, vec3(0.008, 0.008, 0.015), fog);

          gl_FragColor = vec4(lit, tex.a * alphaMult);
        }
      `,
    });

    if (!this._shaderMaterials) this._shaderMaterials = [];
    this._shaderMaterials.push(mat);
    return mat;
  }

  /* ─── Particle system — floating spores and dust ─── */
  buildParticles(dg) {
    // Remove old particles
    if (this.particles) {
      this.scene.remove(this.particles);
      this.particles.geometry.dispose();
      this.particles.material.dispose();
    }

    const maxCount = 700;
    const positions = [];
    const colors = [];
    const sizes = [];
    const phases = [];
    const baseZ = [];

    let count = 0;
    for (let i = 0; i < maxCount; i++) {
      const fx = ~~(Math.random() * dg.mw);
      const fy = ~~(Math.random() * dg.mh);
      if (dg.map[fy]?.[fx] === 1) continue; // skip walls

      const wx = fx * TILE + (Math.random() - 0.5) * TILE;
      const wy = -fy * TILE + (Math.random() - 0.5) * TILE;
      const wz = 4 + Math.random() * 8;

      positions.push(wx, wy, wz);
      baseZ.push(wz);
      phases.push(Math.random() * Math.PI * 2);

      // Color: teal-green (70%) or amber (30%)
      if (Math.random() < 0.7) {
        colors.push(0.3 + Math.random() * 0.3, 0.9 + Math.random() * 0.1, 0.4 + Math.random() * 0.4);
      } else {
        colors.push(0.95, 0.6 + Math.random() * 0.2, 0.15);
      }

      sizes.push(1.5 + Math.random() * 3);
      count++;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 4,
      map: this.particleTex,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: false,
      vertexColors: true,
    });

    this.particles = new THREE.Points(geo, mat);
    this.particles.renderOrder = 15;
    this.scene.add(this.particles);

    this.particleCount = count;
    this.particleBaseZ = baseZ;
    this.particlePhases = phases;
  }

  /* ─── Lighting setup ─── */
  setupLights() {
    // Remove old lights
    const oldLights = [];
    this.scene.traverse(c => { if (c.isLight) oldLights.push(c); });
    oldLights.forEach(l => this.scene.remove(l));

    // Minimal ambient for non-shader materials (enemies, player)
    this.scene.add(new THREE.AmbientLight(0x334433, 0.4));

    // Torch PointLight for non-shader objects
    this.torchLight = new THREE.PointLight(0xffaa66, 2.8, TILE * 20);
    this.torchLight.position.set(0, 0, 15);
    this.scene.add(this.torchLight);

    // Collect room light data for shader uniforms
    this.roomLightData = [];
    if (this.dungeon) {
      for (const room of this.dungeon.rooms) {
        let lColor, lRange;
        switch (room.type) {
          case 'start': lColor = new THREE.Color(0.3, 0.85, 0.6); lRange = TILE * 14; break;
          case 'boss':  lColor = new THREE.Color(1.0, 0.2, 0.15); lRange = TILE * 18; break;
          case 'forge': lColor = new THREE.Color(1.0, 0.7, 0.25); lRange = TILE * 12; break;
          default:      lColor = new THREE.Color(0.15, 0.55, 0.5); lRange = TILE * 9; break; // teal
        }
        const pos = new THREE.Vector2(room.cx * TILE, -room.cy * TILE);
        this.roomLightData.push({ pos, color: lColor, range: lRange });

        // PointLight for non-shader objects
        const pl = new THREE.PointLight(lColor, 1.2, lRange);
        pl.position.set(pos.x, pos.y, 12);
        this.scene.add(pl);
      }
    }
    this.updateShaderLights();
  }

  updateShaderLights() {
    if (!this._shaderMaterials || !this.roomLightData) return;
    const n = Math.min(this.roomLightData.length, 48);
    for (const mat of this._shaderMaterials) {
      mat.uniforms.numLights.value = n;
      for (let i = 0; i < n; i++) {
        const rl = this.roomLightData[i];
        mat.uniforms.lightPosRange.value[i].set(rl.pos.x, rl.pos.y, 12, rl.range);
        mat.uniforms.lightColors.value[i].copy(rl.color);
      }
    }
  }

  /* ─── Player ─── */
  createPlayer() {
    if (this.player) {
      this.scene.remove(this.player);
      if (this.player.geometry) this.player.geometry.dispose();
      if (this.player.material) this.player.material.dispose();
    }
    const geo = new THREE.PlaneGeometry(TILE * 1.6, TILE * 2.0);
    const mat = new THREE.MeshBasicMaterial({
      map: this.playerTex, transparent: true, alphaTest: 0.5,
    });
    this.player = new THREE.Mesh(geo, mat);
    this.player.position.z = 5;
    this.player.renderOrder = 10;
    this.scene.add(this.player);
  }

  /* ─── Minimap ─── */
  drawMinimap() {
    if (!this.dungeon) return;
    const { map, mw, mh, rooms } = this.dungeon;
    const scale = Math.min(180 / mw, 140 / mh);
    const cw = ~~(mw * scale), ch = ~~(mh * scale);
    this.minimapCanvas.width = cw;
    this.minimapCanvas.height = ch;
    this.minimapCanvas.style.width = cw * 1.5 + 'px';
    this.minimapCanvas.style.height = ch * 1.5 + 'px';

    const ctx = this.minimapCanvas.getContext('2d');
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, cw, ch);

    for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) {
      if (map[y][x] === 1) continue;
      const px = ~~(x * scale), py = ~~(y * scale);
      ctx.fillStyle = map[y][x] === 2 ? '#0f0' : '#2a2a1a';
      ctx.fillRect(px, py, Math.ceil(scale), Math.ceil(scale));
    }

    for (const r of rooms) {
      const colors = { start: '#4f8', boss: '#f44', forge: '#fa3', combat: '#555' };
      ctx.strokeStyle = colors[r.type] || '#555';
      ctx.lineWidth = 1;
      ctx.strokeRect(~~(r.x * scale), ~~(r.y * scale), ~~(r.w * scale), ~~(r.h * scale));
    }
    this.minimapScale = scale;
  }

  updateMinimapPlayer() {
    if (!this.dungeon) return;
    this.drawMinimap();
    const ctx = this.minimapCanvas.getContext('2d');
    const px = ~~((this.playerPos.x / TILE) * this.minimapScale);
    const py = ~~((-this.playerPos.y / TILE) * this.minimapScale);
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ─── Collision ─── */
  isWall(worldX, worldY) {
    const tx = ~~(worldX / TILE + 0.5);
    const ty = ~~(-worldY / TILE + 0.5);
    if (tx < 0 || tx >= this.mapW || ty < 0 || ty >= this.mapH) return true;
    return this.collisionMap[ty][tx] === 1;
  }

  /* ═══════════════════════════════════════════════════════════════
     UPDATE LOOP
     ═══════════════════════════════════════════════════════════════ */
  update(dt) {
    if (!this.dungeon || !this.player) return;
    const time = this.clock.elapsedTime;

    // ── Player movement ──
    let dx = 0, dy = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp'])    dy = 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown'])  dy = -1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft'])  dx = -1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) dx = 1;
    if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

    const spd = PLAYER_SPD * TILE * dt;
    const nx = this.playerPos.x + dx * spd;
    const ny = this.playerPos.y + dy * spd;
    const r = TILE * 0.35;

    if (!this.isWall(nx + r * Math.sign(dx), this.playerPos.y) &&
        !this.isWall(nx + r * Math.sign(dx), this.playerPos.y + r * 0.5) &&
        !this.isWall(nx + r * Math.sign(dx), this.playerPos.y - r * 0.5)) {
      this.playerPos.x = nx;
    }
    if (!this.isWall(this.playerPos.x, ny + r * Math.sign(dy)) &&
        !this.isWall(this.playerPos.x + r * 0.5, ny + r * Math.sign(dy)) &&
        !this.isWall(this.playerPos.x - r * 0.5, ny + r * Math.sign(dy))) {
      this.playerPos.y = ny;
    }

    this.player.position.x = this.playerPos.x;
    this.player.position.y = this.playerPos.y;
    this.player.scale.y = 1 + Math.sin(time * 2.5) * 0.03;
    this.player.scale.x = 1 - Math.sin(time * 2.5) * 0.015;
    if (dx < 0) this.player.scale.x = -Math.abs(this.player.scale.x);
    else if (dx > 0) this.player.scale.x = Math.abs(this.player.scale.x);

    // ── Camera ──
    this.camera.position.x += (this.playerPos.x - this.camera.position.x) * CAM_LERP;
    this.camera.position.y += (this.playerPos.y - this.camera.position.y) * CAM_LERP;

    // ── Torch flicker ──
    const torchFlicker = 2.0 + Math.sin(time * 5.5) * 0.35 + Math.sin(time * 8.7) * 0.2 + Math.sin(time * 13.1) * 0.1;
    if (this.torchLight) {
      this.torchLight.position.x = this.playerPos.x;
      this.torchLight.position.y = this.playerPos.y;
      this.torchLight.intensity = torchFlicker;
    }

    // ── Update shader uniforms ──
    if (this._shaderMaterials) {
      for (const mat of this._shaderMaterials) {
        mat.uniforms.time.value = time;
        mat.uniforms.torchPos.value.set(this.playerPos.x, this.playerPos.y, 15);
        mat.uniforms.torchIntensity.value = torchFlicker;
      }
    }

    // ── Particles bobbing ──
    if (this.particles && this.particleBaseZ) {
      const pos = this.particles.geometry.attributes.position.array;
      for (let i = 0; i < this.particleCount; i++) {
        const ph = this.particlePhases[i];
        pos[i * 3 + 2] = this.particleBaseZ[i] + Math.sin(time * 0.7 + ph) * 2.5;
        pos[i * 3] += Math.sin(time * 0.25 + ph * 2) * 0.04;
        pos[i * 3 + 1] += Math.cos(time * 0.3 + ph * 1.5) * 0.03;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
      // Pulse opacity
      this.particles.material.opacity = 0.5 + Math.sin(time * 1.5) * 0.15;
    }

    // ── Attack ──
    if (this.attackTimer > 0) {
      this.attackTimer -= dt;
      if (this.slashMesh) {
        this.slashMesh.position.set(this.playerPos.x, this.playerPos.y, 8);
        this.slashMesh.material.opacity = Math.max(0, this.attackTimer / ATK_DUR) * 0.75;
      }
      for (const en of this.ens) {
        if (en.dead || this.hitEns.has(en)) continue;
        const edx = en.x - this.playerPos.x;
        const edy = en.y - this.playerPos.y;
        const dist = Math.sqrt(edx * edx + edy * edy);
        if (dist > ATK_RANGE + en.r) continue;
        let angle = Math.atan2(edy, edx);
        let diff = angle - this.attackAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        if (Math.abs(diff) < ATK_ARC / 2 + 0.2) {
          this.hitEns.add(en);
          const dmg = 8 + this.floor * 2;
          en.hp -= dmg;
          en.hitFlash = 0.15;
          if (dist > 0.1) {
            en.x += (edx / dist) * TILE * 0.8;
            en.y += (edy / dist) * TILE * 0.8;
          }
          this.addDmgText(en.x, en.y, dmg);
          if (en.hp <= 0) {
            en.dead = true;
            if (en.mesh) { this.scene.remove(en.mesh); en.mesh = null; }
            this.killCount++;
            this.updateKillHud();
            this.addDmgText(en.x, en.y - 10, en.boss ? '★ BOSS KILL ★' : 'KILL', '#ff4');
          }
        }
      }
    } else if (this.slashMesh) {
      this.scene.remove(this.slashMesh);
      this.slashMesh.geometry.dispose();
      this.slashMesh.material.dispose();
      this.slashMesh = null;
    }
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    // ── Enemy AI ──
    for (const en of this.ens) {
      if (en.dead) continue;
      const edx = this.playerPos.x - en.x;
      const edy = this.playerPos.y - en.y;
      const dist = Math.sqrt(edx * edx + edy * edy);

      if (dist < en.aggroRange && dist > en.r + TILE * 0.3) {
        const moveSpd = en.spd * TILE * dt;
        const mx = (edx / dist) * moveSpd;
        const my = (edy / dist) * moveSpd;
        const ntx = ~~((en.x + mx) / TILE + 0.5);
        const nty = ~~(-(en.y + my) / TILE + 0.5);
        if (ntx >= 0 && ntx < this.mapW && nty >= 0 && nty < this.mapH && this.collisionMap[nty][ntx] !== 1) {
          en.x += mx; en.y += my;
        }
      }

      if (en.hitFlash > 0) en.hitFlash -= dt;
      if (en.mesh) {
        en.mesh.position.set(en.x, en.y, 4);
        en.mesh.material.color.set(en.hitFlash > 0 ? 0xffffff : en.color);
        const sc = 1 + Math.sin(time * 3 + en.x * 0.1) * 0.05;
        en.mesh.scale.set(sc, sc, 1);
      }
    }
    this.ens = this.ens.filter(e => !e.dead);

    // ── Exit check ──
    const tx = ~~(this.playerPos.x / TILE + 0.5);
    const ty = ~~(-this.playerPos.y / TILE + 0.5);
    if (tx >= 0 && tx < this.mapW && ty >= 0 && ty < this.mapH &&
        this.collisionMap[ty][tx] === 2) {
      this.loadFloor(this.floor + 1);
    }

    // ── Minimap ──
    this.minimapTimer = (this.minimapTimer || 0) + dt;
    if (this.minimapTimer > 0.25) {
      this.minimapTimer = 0;
      this.updateMinimapPlayer();
    }
  }

  /* ─── Damage text ─── */
  addDmgText(wx, wy, text, color = '#fff') {
    const div = document.createElement('div');
    div.textContent = text;
    div.style.cssText = `position:fixed;color:${color};font-size:18px;font-weight:bold;pointer-events:none;z-index:20;text-shadow:0 1px 5px #000,0 0 10px rgba(0,0,0,.6);transition:all .6s ease-out;`;
    document.body.appendChild(div);

    const v = new THREE.Vector3(wx, wy, 8);
    v.project(this.camera);
    div.style.left = ((v.x * 0.5 + 0.5) * innerWidth) + 'px';
    div.style.top = ((-v.y * 0.5 + 0.5) * innerHeight) + 'px';

    requestAnimationFrame(() => {
      div.style.transform = 'translateY(-50px)';
      div.style.opacity = '0';
    });
    setTimeout(() => div.remove(), 700);
  }

  /* ─── Main loop — uses EffectComposer ─── */
  animate() {
    requestAnimationFrame(() => this.animate());
    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.update(dt);
    this.composer.render();
  }
}

new Game();
