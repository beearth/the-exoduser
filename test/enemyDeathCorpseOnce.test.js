import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// ENEMY-F05 결정적 검수 — 동일 적의 사망 보상(kills/_regKill)과 시체(_addCorpse)가
// 여러 사망 경로(hurtE·지연 GC 폴백·freeze DOT·self-destruct·벽끼임 컬)를 조합해도
// 정확히 "한 번"인지 확인. (사망 연출·판정 수치·공용 렌더는 변경하지 않음 — 검수 전용)

const src = await readFile(new URL('../game.html', import.meta.url), 'utf8');

// ── 1) 실제 소스의 핵심 가드가 존재하는지 확인(하니스 충실성) ──
test('사망 경로 핵심 가드가 실제 소스에 존재(충실성)', () => {
  // hurtE 진입 이중 가드
  assert.match(src, /function hurtE\(e,dmg,ang,noSound,opts,atkEl=0\)\{[\s\S]{0,200}?if\(!e\|\|!e\.alive\)return;/, 'hurtE alive 가드');
  assert.match(src, /if\(e\.hp<=0\)return;\s*\/\/ 2026-04-17 이미 죽은 적 이중 처리 방지/, 'hurtE hp<=0 이중처리 방지 가드');
  // freeze DOT 루프 상류 alive 가드
  assert.match(src, /const e=_fzNe\[_fei\];if\(!e\.alive\)continue;/, 'freeze zone alive 가드');
  // GC 폴백 시체: !_corpseSpawned && !_isDecoy
  assert.match(src, /!ens\[i\]\.alive&&!ens\[i\]\._corpseSpawned&&!ens\[i\]\._isDecoy&&ens\[i\]\.mhp>0/, 'GC 시체 폴백 가드');
  // _addCorpse 는 플래그 설정
  assert.match(src, /function _addCorpse\(e,killAng,power\)\{[\s\S]{0,120}?e\._corpseSpawned=true;/, '_addCorpse가 _corpseSpawned 설정');
  // 압축 컬은 alive만 수집(_rest)
  assert.match(src, /_rest=\[\];for\(let i=0;i<ens\.length;i\+\+\)\{const e=ens\[i\];[\s\S]{0,80}?if\(!e\.alive\)continue;e\._ensDist/, '압축 _rest는 alive만');
});

// ── 2) 실제 가드 로직을 충실히 복제한 사망 경로 모델 ──
// 각 경로는 실제 코드의 가드 순서를 그대로 따른다.
function makeEnv(){
  const env={ reward:0, corpse:0, floorTrace:0 };
  // _addCorpse: 실제처럼 가드 없음(플래그만 설정). 이중 호출되면 이중 시체가 남는다(충실).
  env.addCorpse=(e)=>{ env.corpse++; env.floorTrace++; e._corpseSpawned=true; };
  // 보상 공통
  env.award=(e)=>{ e.alive=false; env.reward++; /*_regKill/ kills++*/ };
  // 경로들 --------------------------------------------------------------
  // hurtE: if(!alive)return; if(hp<=0)return; ... dmg 적용 후 hp<=0면 award+corpse
  env.hurtE=(e,dmg)=>{ if(!e.alive)return; if(e.hp<=0)return; e.hp-=dmg; if(e.hp<=0){e.hp=0; env.award(e); env.addCorpse(e);} };
  // freeze dim DOT: 상류 if(!alive)continue; 후 hp-=dot; if(hp<=0){award+corpse}
  env.freezeDim=(e,dot)=>{ if(!e.alive)return; e.hp-=dot; if(e.hp<=0){e.hp=0; env.award(e); env.addCorpse(e);} };
  // self-destruct(38013/38372): updateE가 alive 적만 호출 → alive 가드; award+corpse
  env.selfDestruct=(e)=>{ if(!e.alive)return; e.hp=0; env.award(e); env.addCorpse(e); };
  // 벽끼임 컬(비보스, 32876): alive 적만; award (corpse는 안 만듦 → GC가 처리)
  env.wallStuckKill=(e)=>{ if(!e.alive)return; e.hp=0; env.award(e); };
  // 지연 GC 폴백(32816): !alive && !_corpseSpawned && !_isDecoy && mhp>0 → corpse
  env.gcFallback=(e)=>{ if(!e.alive && !e._corpseSpawned && !e._isDecoy && e.mhp>0) env.addCorpse(e); };
  return env;
}
function mkE(hp=100){ return {hp, mhp:100, alive:true, _corpseSpawned:false, _isDecoy:false}; }

test('시나리오별 보상·시체 정확히 1회 (조합 검증)', () => {
  const scen=[];
  const run=(name, fn)=>{ const env=makeEnv(); const e=mkE(); fn(env,e); scen.push({name, reward:env.reward, corpse:env.corpse, floorTrace:env.floorTrace}); };

  run('① hurtE 치사 → GC 폴백', (env,e)=>{ env.hurtE(e,200); env.gcFallback(e); });
  run('② hurtE 치사 → 같은 프레임 2번째 hurtE(중복타)', (env,e)=>{ env.hurtE(e,200); env.hurtE(e,200); });
  run('③ freeze 치사 → 직후 hurtE(이미 사망)', (env,e)=>{ env.freezeDim(e,200); env.hurtE(e,200); });
  run('④ hurtE 치사 → freeze DOT(이미 사망) → GC', (env,e)=>{ env.hurtE(e,200); env.freezeDim(e,200); env.gcFallback(e); });
  run('⑤ 벽끼임 컬(시체 없음) → GC 폴백(시체 보충)', (env,e)=>{ env.wallStuckKill(e); env.gcFallback(e); });
  run('⑥ self-destruct → GC 폴백', (env,e)=>{ env.selfDestruct(e); env.gcFallback(e); });
  run('⑦ freeze 치사 → self-destruct(이미 사망) → hurtE(이미 사망) → GC', (env,e)=>{ env.freezeDim(e,200); env.selfDestruct(e); env.hurtE(e,200); env.gcFallback(e); });
  run('⑧ 여러 GC 폴백 반복 호출(플래그 멱등)', (env,e)=>{ env.hurtE(e,200); env.gcFallback(e); env.gcFallback(e); env.gcFallback(e); });

  console.log('\n[ENEMY-F05] 사망 보상·시체 정확히 1회 검수 (실제 가드 로직 복제)');
  for(const s of scen) console.log(`  ${s.name.padEnd(46)} → 보상=${s.reward} 시체=${s.corpse} 핏자국=${s.floorTrace}`);

  for(const s of scen){
    assert.equal(s.reward, 1, `${s.name}: 보상은 정확히 1회여야 함(실제 ${s.reward})`);
    assert.equal(s.corpse, 1, `${s.name}: 시체는 정확히 1회여야 함(실제 ${s.corpse})`);
    assert.equal(s.floorTrace, 1, `${s.name}: 핏자국은 정확히 1회여야 함(실제 ${s.floorTrace})`);
  }
  console.log('  ⇒ 전 시나리오 보상/시체/핏자국 정확히 1회 — 이중 보상·이중 시체 재현 안 됨(NO-FIX).');
});

// ── 3) 불변식이 "가드"에 의존함을 문서화하는 반증 케이스 ──
// _addCorpse는 자체 멱등 가드가 없어, 만약 alive 가드 없이 두 경로가 같은 적을 처리하면 이중이 된다.
// 현재 코드엔 그런 경로가 없지만, 미래 회귀 감지용으로 "가드 없는 이중 호출"이 이중을 만든다는 사실을 고정한다.
test('반증: alive 가드를 우회한 직접 이중 _addCorpse는 이중 시체를 만든다(잠재 하드닝 근거)', () => {
  const env=makeEnv(); const e=mkE();
  env.addCorpse(e); env.addCorpse(e); // 가드 없이 직접 2회
  assert.equal(env.corpse, 2, '가드 없는 직접 이중 호출은 이중 시체(→ _addCorpse 멱등 가드는 하드닝 후보)');
});
