// [CLEAR-RESULT] 보스 클리어 결과 — 점수 공식/랭크 임계/베스트 기록 병합 테스트 (2026-09-30)
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function source(name){
  const start=html.indexOf(`function ${name}(`);
  assert.ok(start>=0,`${name} exists`);
  let depth=0;
  for(let i=html.indexOf('{',start);i<html.length;i++){
    if(html[i]==='{')depth++;
    else if(html[i]==='}'&&!--depth)return html.slice(start,i+1);
  }
  assert.fail(`${name} closes`);
}
const par=Function(`${source('_clearParTime')};return _clearParTime`)();
const parScore=Function(`${source('_clearParScore')};return _clearParScore`)();
const calc=Function(`${source('_clearScoreCalc')};return _clearScoreCalc`)();
const rank=Function(`${source('_clearRankCalc')};return _clearRankCalc`)();
const ordSrc=html.match(/const _RANK_ORD=\{[^}]+\};/)[0];
const merge=Function(`${ordSrc}${source('_clearRecordMerge')};return _clearRecordMerge`)();
const fmt=Function(`${source('_clearFmtNum')};return _clearFmtNum`)();

test('par time/score follow the documented stage formulas (stage 0 demo: 168 spawns = 8:30 / 5,180)',()=>{
  assert.equal(par(168),510);
  assert.equal(parScore(168),5180);
  assert.equal(par(0),90);
  assert.equal(parScore(0),3500);
});

test('score breakdown matches the documented formula and floors at zero',()=>{
  const p=calc({kills:168,regions:4,bossKilled:true,clearSec:480,parSec:510,deaths:0,dmgTaken:12345,comboMax:150});
  assert.equal(p.kills,1680);
  assert.equal(p.regions,2000);
  assert.equal(p.boss,1000);
  assert.equal(p.timeBonus,300);   // (510-480)*10
  assert.equal(p.noDeath,500);
  assert.equal(p.noHit,0);         // dmgTaken>0
  assert.equal(p.combo,750);
  assert.equal(p.deathPen,0);
  assert.equal(p.total,1680+2000+1000+300+500+750);
  // 사망 다수 + 저점수 → 하한 0
  const worst=calc({kills:0,regions:0,bossKilled:false,clearSec:9999,parSec:510,deaths:10,dmgTaken:1,comboMax:0});
  assert.equal(worst.total,0);
  assert.equal(worst.deathPen,3000);
  // 시간 보너스는 par 초과 시 0 (음수 없음)
  assert.equal(calc({clearSec:600,parSec:510}).timeBonus,0);
});

test('rank thresholds tie to par time and par score (S/A/B/C/D)',()=>{
  const PT=510,PS=5180;
  assert.equal(rank(300,PT,6000,PS,0),'S'); // ratio .59→3 + score≥par→2 + 무사망 1 = 6
  assert.equal(rank(480,PT,6000,PS,0),'A'); // ratio .94→2 + 2 + 1 = 5
  assert.equal(rank(480,PT,6000,PS,2),'A'); // 2+2 = 4
  assert.equal(rank(700,PT,3200,PS,0),'B'); // ratio 1.37→1 + 60%→1 + 1 = 3
  assert.equal(rank(700,PT,3200,PS,1),'C'); // 1+1 = 2
  assert.equal(rank(2000,PT,1000,PS,3),'D'); // 0+0 = 0
  // 경계값: ratio 정확히 0.7/1.0/1.5, 점수 정확히 par/0.6par 는 상위 구간
  assert.equal(rank(357,PT,PS,PS,0),'S');    // 357=510*0.7 → 3+2+1
  assert.equal(rank(510,PT,PS*0.6,PS,0),'A');// 1.0→2 + 1 + 1
  assert.equal(rank(765,PT,0,PS,1),'D');     // 1.5→1 + 0 = 1
});

test('best record merge: first clear sets record without new-record flags; per-field bests kept',()=>{
  const first=merge(undefined,{t:500,s:6000,r:'A'});
  assert.deepEqual(first.rec,{t:500,s:6000,r:'A'});
  assert.equal(first.first,true);
  assert.equal(first.newTime,false);
  assert.equal(first.newScore,false);
  // 시간만 갱신
  const m1=merge({t:500,s:6000,r:'A'},{t:450,s:5000,r:'B'});
  assert.deepEqual(m1.rec,{t:450,s:6000,r:'A'});
  assert.equal(m1.newTime,true);assert.equal(m1.newScore,false);
  // 점수만 갱신 + 랭크 상향
  const m2=merge({t:450,s:6000,r:'A'},{t:460,s:7000,r:'S'});
  assert.deepEqual(m2.rec,{t:450,s:7000,r:'S'});
  assert.equal(m2.newScore,true);assert.equal(m2.newTime,false);
  // 구세이브 호환: 필드 결측(prev.t 없음) = 기록 없음 취급
  const m3=merge({},{t:400,s:100,r:'D'});
  assert.equal(m3.first,true);
});

test('numbers render as integers with thousands separators',()=>{
  assert.equal(fmt(12345),'12,345');
  assert.equal(fmt(1234567.9),'1,234,567');
  assert.equal(fmt(-5),'0');
});

test('clear flow wiring: boss-death snapshot, result call before stats, save field, old-save default',()=>{
  assert.ok(html.includes("G._bossClearT=~~((G.stageTime||0)/60); // [CLEAR-RESULT]"),'snapshot at boss death');
  assert.ok(html.indexOf('_showClearResult(); // [CLEAR-RESULT]')<html.indexOf('// ═══ 클리어 통계 표시 ═══'),'result shown with the clear panel');
  assert.ok((html.match(/clearRecords:G\._clearRecords\|\|\{\}/g)||[]).length>=4,'all save builders include clearRecords');
  assert.ok(html.includes("G._clearRecords=d.game.clearRecords||{}"),'restore defaults to empty for old saves');
});
