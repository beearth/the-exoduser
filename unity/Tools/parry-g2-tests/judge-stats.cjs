// G1 section 8 numeric pass lines from Mac run outputs. Reads only; no Unity, no game data writes.
// node judge-stats.cjs <runDir> [<runDir> ...] [--out <dir>]
// Each runDir holds combat-stats.json (required), parry-bot.json and fullrun.json (optional).
const fs=require('node:fs'),path=require('node:path');
const argv=process.argv.slice(2),oi=argv.indexOf('--out'),out=oi<0?null:argv[oi+1],dirs=argv.filter((x,i)=>x!=='--out'&&i!==oi+1);
if(!dirs.length){console.error('usage: judge-stats.cjs <runDir>... [--out <dir>]');process.exit(2);}
const read=p=>fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):null,sum=o=>Object.values(o||{}).reduce((a,b)=>a+b,0),pct=x=>x==null?'—':(x*100).toFixed(1)+'%';
const LINES={melee:[.40,.60],reflect:.35,recovery:.30,groggy:5,stop:.30};
const runs=dirs.map(d=>{
 const s=read(path.join(d,'combat-stats.json'));if(!s)return {dir:d,missing:'combat-stats.json'};
 const bot=read(path.join(d,'parry-bot.json')),full=read(path.join(d,'fullrun.json'));
 const ps=s.parrySuccess||{},parries=sum(ps),melee=(ps.meleeE||0)+(ps.meleeQ||0);
 const dealt=sum(s.dmgDealt),reflect=(s.dmgDealt||{}).reflect||0;
 const seconds=s.clearSeconds>0?s.clearSeconds:s.ticks/60,g=s.gain||{};
 const frac=g.melee&&'hpMaxFrac' in g.melee?(g.melee.hpMaxFrac||0)+((g.proj||{}).hpMaxFrac||0):null;
 const groggy=((s.groggy||{}).meleeParry||0)+((s.groggy||{}).counter||0);
 const r={dir:d,seconds,parries,melee,
  meleeShare:parries?melee/parries:null,reflectShare:dealt?reflect/dealt:null,
  recoveryPerMin:frac==null||!(seconds>0)?null:frac/(seconds/60),groggy,
  deaths:s.deaths,hurtCount:s.hurtCount,wrongInput:s.parryWrongInput,
  meleeTells:sum(s.meleeTellStarted),projCharges:sum(s.projChargeStarted),
  bot:bot?{opportunities:bot.opportunities,attempts:bot.attempts,inputRate:bot.opportunities?bot.attempts/bot.opportunities:null}:null,
  fullrun:full?{result:full.result,worldCleared:full.worldCleared,deaths:full.deaths}:null};
 r.pass={
  melee:r.meleeShare==null?null:r.meleeShare>=LINES.melee[0]&&r.meleeShare<=LINES.melee[1],
  reflect:r.reflectShare==null?null:r.reflectShare<=LINES.reflect,
  recovery:r.recoveryPerMin==null?null:r.recoveryPerMin<=LINES.recovery,
  groggy:groggy>=LINES.groggy};
 r.stopSignal=r.meleeShare!=null&&r.meleeShare<LINES.stop;
 return r;});
const ok=runs.filter(r=>!r.missing),all=k=>ok.length&&ok.every(r=>r.pass[k]===true)?true:ok.some(r=>r.pass[k]===false)?false:null;
const verdict={melee:all('melee'),reflect:all('reflect'),recovery:all('recovery'),groggy:all('groggy')};
const result={scope:'G1 section 8 numeric lines only. Screen (section 3, 1x crops) and m1-check/oracle regression are judged separately.',lines:LINES,runs,verdict,
 stopSignal:ok.filter(r=>r.stopSignal).length,missing:runs.filter(r=>r.missing).map(r=>r.dir+': '+r.missing)};
const word=v=>v===true?'PASS':v===false?'FAIL':'미측정';
const md=['# 패링 G2 §8 수치 판정','','| 판 | 시간(초) | 패링 | 근접 비중(40~60%) | 반사 비중(≤35%) | 분당 회복(≤최대HP 30%) | 근접 그로기(≥5) | 사망 | 봇 입력률 |','|---|---|---|---|---|---|---|---|---|',
 ...runs.map((r,i)=>r.missing?`| ${i+1} | 파일 없음: ${r.missing} | | | | | | | |`:`| ${i+1} | ${Math.round(r.seconds)} | ${r.parries} | ${pct(r.meleeShare)} ${word(r.pass.melee)} | ${pct(r.reflectShare)} ${word(r.pass.reflect)} | ${pct(r.recoveryPerMin)} ${word(r.pass.recovery)} | ${r.groggy} ${word(r.pass.groggy)} | ${r.deaths} | ${r.bot?pct(r.bot.inputRate):'—'} |`),
 '',`종합: 근접 ${word(verdict.melee)} · 반사 ${word(verdict.reflect)} · 회복 ${word(verdict.recovery)} · 그로기 ${word(verdict.groggy)}. 근접 30% 미만 판 ${result.stopSignal}개(같은 방법 2회 연속이면 §6 손잡이 변경).`,
 '화면(§3)·회귀(m1-check·oracle)는 이 표에 들어가지 않습니다. 회복이 미측정이면 hpMaxFrac 기록 전 빌드입니다.'].join('\n');
if(out){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'g2-judge.json'),JSON.stringify(result,null,1));fs.writeFileSync(path.join(out,'g2-judge.md'),md+'\n');}
console.log(md);
process.exitCode=result.missing.length?2:Object.values(verdict).every(v=>v===true)?0:1;
