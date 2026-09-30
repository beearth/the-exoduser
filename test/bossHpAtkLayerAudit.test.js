import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// ENEMY §4-⑤ 보스 HP/ATK 배율 레이어 감사 (문서 전용 — 전투수치·코드 변경 없음)
// 목적: mkEn 실제 산출식과 정의된 상수(BOSS_HP_MULT 등)의 관계를 소스에서 결정적으로 확인,
//       현행값+출처 표 산출. stale 문서(BOSS_BATTLE_SETTINGS)만 정정하기 위한 근거.

const src = await readFile(new URL('../game.html', import.meta.url), 'utf8');

// 단어 경계 매칭(FINALBOSS_HP_MULT가 BOSS_HP_MULT를 부분포함하므로 substring 금지)
function countWord(s, name){ return (s.match(new RegExp('\\b'+name+'\\b','g'))||[]).length; }

test('정의 상수 6종은 1회만 등장 = dead(미참조)', () => {
  // 정의 존재
  assert.match(src, /const MON_BASE_HP=60,MON_BASE_ATK=8;/, 'MON_BASE 정의');
  assert.match(src, /const BOSS_HP_MULT=8,BOSS_ATK_MULT=3;/, 'BOSS_MULT 정의');
  assert.match(src, /const FINALBOSS_HP_MULT=15,FINALBOSS_ATK_MULT=5;/, 'FINALBOSS_MULT 정의');
  // 각 식별자가 소스 전체에서 정확히 1회(정의)만 등장 → 어디서도 사용 안 됨(dead)
  for(const name of ['MON_BASE_HP','MON_BASE_ATK','BOSS_HP_MULT','BOSS_ATK_MULT','FINALBOSS_HP_MULT','FINALBOSS_ATK_MULT']){
    const n=countWord(src, name);
    assert.equal(n, 1, `${name} 은 정의 1회만 등장해야 함(dead). 실제 ${n}회`);
  }
});

test('실제 mkEn HP/ATK 산출식이 소스에 존재(live 공식)', () => {
  assert.match(src, /const _baseHpCurve=\(monLv<=500\?0\.4\*monLv\*monLv\*monLv\+199\*monLv\+100:50000000\*Math\.pow\(1\.0014,monLv-500\)\)\*2\.925;/, 'HP 기본커브');
  assert.match(src, /const _bossMul=ib\?24:1;/, '보스 HP ×24');
  assert.match(src, /const _lvHp=Math\.floor\(_baseHpCurve\*_enemyHpPacing\(monLv\)\*_bossMul\*dm\*et\.hpMul\);let _hp=Math\.floor\(_lvHp\*\(1\+si\*0\.02\)\);/, 'HP 최종식(pacing·×24·dm·hpMul·stage)');
  assert.match(src, /const _baseAtkLin=\(\(ib\?75:50\)\+monLv\*\(ib\?2\.9:1\.95\)\)\*0\.6;/, 'ATK 선형식');
  assert.match(src, /const _atk=Math\.floor\(_baseAtkLin\*dm\*et\.atkMul\);/, 'ATK 최종식');
  assert.match(src, /function _enemyHpPacing\(lv\)\{return 1\/\(1\+Math\.min\(9,Math\.max\(0,lv-1\)\)\/18\)\}/, 'pacing 함수');
});

// ── live 공식 복제로 현행값 산출 (dm=1, et.hpMul=et.atkMul=1, stage si=0) ──
const pacing = (lv)=> 1/(1+Math.min(9,Math.max(0,lv-1))/18);
const baseHpCurve = (lv)=> (lv<=500 ? 0.4*lv*lv*lv+199*lv+100 : 50000000*Math.pow(1.0014,lv-500))*2.925;
const bossHP = (lv,si=0)=> Math.floor(Math.floor(baseHpCurve(lv)*pacing(lv)*24*1*1)*(1+si*0.02));
const normHP = (lv,si=0)=> Math.floor(Math.floor(baseHpCurve(lv)*pacing(lv)*1*1*1)*(1+si*0.02));
const bossATK = (lv)=> Math.floor(((75+lv*2.9))*0.6*1*1);
const normATK = (lv)=> Math.floor(((50+lv*1.95))*0.6*1*1);

test('현행값 표 산출 + dead 상수와 불일치 확인', () => {
  console.log('\n[§4-⑤ 보스 HP/ATK 배율 레이어 감사] 현행값(live 공식, dm=1·hpMul/atkMul=1·si=0)');
  console.log('  구분        | Lv1        | Lv10       | Lv100          | Lv500');
  const fmt=(n)=>String(n).padStart(12);
  console.log(`  일반몹 HP   |${fmt(normHP(1))}|${fmt(normHP(10))}|${fmt(normHP(100))}|${fmt(normHP(500))}`);
  console.log(`  보스 HP(×24)|${fmt(bossHP(1))}|${fmt(bossHP(10))}|${fmt(bossHP(100))}|${fmt(bossHP(500))}`);
  console.log(`  일반몹 ATK  |${fmt(normATK(1))}|${fmt(normATK(10))}|${fmt(normATK(100))}|${fmt(normATK(500))}`);
  console.log(`  보스 ATK    |${fmt(bossATK(1))}|${fmt(bossATK(10))}|${fmt(bossATK(100))}|${fmt(bossATK(500))}`);
  // 문서(공격시스템 line 35) "Lv1 HP875" = 일반몹 기준 확인
  assert.equal(normHP(1), 875, `일반몹 Lv1 HP=875(공격시스템 문서 일치). 실제 ${normHP(1)}`);
  // 보스 HP/ATK가 dead 상수(×8/×3·base60/8)로 계산한 값과 완전히 다름을 고정
  const deadBossHP_lv1 = 60*8; // MON_BASE_HP × BOSS_HP_MULT (문서 stale 해석)
  const deadBossATK_lv1 = 8*3; // MON_BASE_ATK × BOSS_ATK_MULT
  console.log(`\n  dead 상수 해석(stale): 보스 HP≈${deadBossHP_lv1}, ATK≈${deadBossATK_lv1} — 실제(${bossHP(1)}/${bossATK(1)})와 완전 불일치`);
  assert.notEqual(bossHP(1), deadBossHP_lv1, 'live 보스 HP는 dead 상수 계산값과 다름');
  assert.notEqual(bossATK(1), deadBossATK_lv1, 'live 보스 ATK는 dead 상수 계산값과 다름');
  console.log('  ⇒ BOSS_HP_MULT=8/ATK_MULT=3/MON_BASE 60·8/FINALBOSS 15·5는 정의만 된 dead 상수. 실제는 mkEn 커브(HP×24·ATK 선형). 공격시스템 문서=정확, BOSS_BATTLE_SETTINGS §3=stale.');
});
