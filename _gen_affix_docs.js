const fs=require('fs');
const src=fs.readFileSync('G:/hell/game.html','utf8');
const m=src.match(/const AFFIX_POOL=\[([\s\S]*?)\];/);
const pool=eval('['+m[1]+']');
const names={};
const nm=src.match(/const AFFIX_NAMES_KO=\{([\s\S]*?)\};/);
if(nm) eval('Object.assign(names,{'+nm[1]+'})');

const slotKO={wpn:'무기',helm:'투구',armor:'갑옷',shield:'견갑',gloves:'장갑',pants:'바지',boots:'부츠',cloak:'망토',belt:'벨트',bracelet:'팔찌',ring:'반지',neck:'목걸이',headband:'머리띠'};

const fmt=a=>{
  const t=a.tiers.map(v=>v===null?'-':v).join(' / ');
  const sl=a.slots.map(s=>slotKO[s]||s).join(', ');
  const tw=a.tierW?'★':'';
  const br=a.brType?' ['+a.brType+']':'';
  return '| '+a.id+' | '+(names[a.id]||'-')+' | '+(a.type===0?'PRE':'SUF')+' | '+t+' | '+a.unit+' | '+sl+' | '+a.weight+tw+br+' |';
};

const cats={};
const classify=a=>{
  if(!a||!a.id)return null;
  const id=a.id;
  if(id.startsWith('end'))return '엔드게임';
  if(id.startsWith('arc'))return '아키타입';
  if(id.startsWith('hyb'))return '하이브리드';
  if(id.startsWith('sk'))return '스킬강화';
  if(id.startsWith('onHit')||id.startsWith('onCrit')||id.startsWith('onKill')||id.startsWith('onBlock')||id.startsWith('onDodge')||id.startsWith('onParry'))return '프록';
  if(['lifeLeech','manaLeech','stLeech','lifeOnHit','injuredLeech','lifeLeechBr'].includes(id))return '흡수';
  if(['abundDmg','predDmg','fullLifeDmg','lowLifeDmg','overkilDmg','closeDmg','farDmg',
    'stunDmgUp','frozenDmgUp','burnDmgUp','poisonDmgUp','curseDmgUp','slowDmgUp',
    'bossSlayer','eliteSlayer','mobSlayer','firstStrike','healthyAtk','injuredDmg','vsBossDmg','vsEliteDmg',
    'nearDeathDmg','fullStaminaDmg','fullManaDmg2','freshKillDmg','standingDmg','movingDmg',
    'recentParryDmg','onFullManaDmg','whileStationaryDmg','momentumDmg',
    'crisisBoost','killStreakDmg','killStreakSpd','backstabDmg','executeDmg'].includes(id))return '조건부DPS';
  if(['fireRes','iceRes','lightRes','darkRes','poisonRes','allRes','eDefFlat',
    'fireResMax','iceResMax','lightResMax','darkResMax','poisonResMax'].includes(id))return '저항';
  if(['defFlat','maxHPFlat','shieldFlat','maxHPPct','physDR','reflect','thorns','barrier','ccRes','counterHit',
    'statusClean','lastStand','reviveOnce','healthyDef','injuredDR','injuredSpeed','dotDR','bossDR','closeDR','farDR',
    'hpOnKill','shieldOnKill','blockChance','blockAmount','dodgeChance','dodgeCooldown',
    'maxHPPctArmor','shieldPct','shieldRegenPct','shieldCdRed','hpRegenFlat','hpRegenPct',
    'stRegenFlat','stRegenPct','mpRegenFlat','mpRegenPct',
    'fireDR','iceDR','lightDR','darkDR','poisonDRdef','allDR','eliteDR',
    'stunRes','freezeRes','slowRes','knockbackRes','whileMovingDR',
    'armorDefPct','shieldBlockDR','shieldBashDmg','shieldStagger',
    'pantsHPRegen','pantsCCDuration','cloakDodgeDR','cloakElemDR'].includes(id))return '방어생존';
  if(id.match(/fire|ice|light|dark|poison|ignite|frostbite|shock/) &&
    (id.includes('Dmg')||id.includes('Dot')||id.includes('Pen')||id.includes('OnHit')||
     id.includes('Burst')||id.includes('Duration')||id.includes('Stack')||id.includes('Spread')))return '속성';
  if(id.includes('crit')||id.includes('Crit'))return '크리티컬';
  if(['atkSpeed','meleeAtkSpd','bowAtkSpd','castSpeed','glovesAtkSpd','helmCastSpd','headbandCastSpd',
    'cooldownRed','helmCooldown','skillCdRed','potionCdRed'].includes(id))return '속도쿨다운';
  if(['movSpeed','dashRange','dashCooldown','movSpeedCombat','movSpeedOOC','pickupRadius',
    'bootsDashDmg','bootsChargeRange','bootsMSOnKill','cloakMSPct'].includes(id))return '이동';
  if(['dropRate','goldBonus','potionPower','extraST','expBonus','goldFind','expBonusRing','dropRateAcc',
    'craftBonus','helmExpPct','beltGoldDrop'].includes(id))return '경제유틸';
  if(['lckFlatN','lckFlatR','gritFlatN','gritFlatR','strFlat','dexFlat','intFlat','allStat'].includes(id))return '스탯';
  if(['maxSTFlat','maxMPFlat','mpCostRed','stCostRed','maxSTPct','maxMPPct','resourceOnHit',
    'helmMPPct','beltSTMax','headbandMPMax','headbandMPRegen','beltSTRegen'].includes(id))return '자원';
  if(['antiRevive','revivePow','reviveCd','demonDmg','demonDR','soulHarvest',
    'lifeMaxHP','lifeRegen','lifeHealPow','overhealShield'].includes(id))return '팔찌';
  if(id.startsWith('ring')||id.startsWith('neck')||id.startsWith('belt')||id.startsWith('headband'))return '장신구전용';
  return '공격기본';
};

pool.forEach(a=>{if(!a||!a.id)return;const c=classify(a);if(!cats[c])cats[c]=[];cats[c].push(a)});

const order=['공격기본','속성','크리티컬','속도쿨다운','조건부DPS','흡수','프록','스킬강화',
  '방어생존','이동','저항','자원','스탯','팔찌','장신구전용','하이브리드','경제유틸','아키타입','엔드게임'];
const catDesc={
  '공격기본':'플랫뎀(물리/원소), %뎀, 관통, 연쇄, 스플래시, DoT, 출혈, 사거리',
  '속성':'5원소별 뎀%/관통/적중부여/폭발/지속/장신구보너스',
  '크리티컬':'크리확률(전체/근접/마법/석궁), 크리뎀, 조건부크리',
  '속도쿨다운':'공속(전체/근접/석궁), 시전속도, 쿨감(전체/스킬/물약)',
  '조건부DPS':'HP/거리/적상태/대상/타이밍/자원 기반 조건부 뎀업 (합연산)',
  '흡수':'HP/MP/ST 흡수%, 적중고정회복, 조건부흡혈',
  '프록':'적중/크리/처치/블록/회피 시 확률 발동 효과',
  '스킬강화':'20종 스킬 개별 뎀% (회전참~연쇄돌격)',
  '방어생존':'방어력, HP, 쉴드, DR(물리/속성/전체), 블록, 회피, 리젠, CC저항, 생존(불굴/부활)',
  '이동':'이동속도(전투/비전투), 돌진(거리/쿨감/뎀), 습득범위',
  '저항':'5원소 저항%, 전원소저항, 속성방어, 최대저항+',
  '자원':'ST/MP 최대(플랫/%), 소비감소, 리젠, 적중자원',
  '스탯':'STR/DEX/INT 플랫, 전스탯, LCK, 근성',
  '팔찌':'악마팔찌(부활/뎀/DR/영혼수확), 생명팔찌(HP/리젠/흡혈/과치유)',
  '장신구전용':'반지(원소뎀/콤보), 목걸이(만능/크리뎀), 벨트(포션/ST), 머리띠(시전/마나)',
  '하이브리드':'2효과 동시 부여 (공+HP, 체+마, 힘+민, 빙+화 등)',
  '경제유틸':'드롭률, 경험치, 골드, 강화성공률, 포션강화',
  '아키타입':'전사/마법사/궁수/탱크/암살자 빌드 특화',
  '엔드게임':'극악 희귀 (w≤15), 최고 수치, 후반 파밍 목표'
};

const out=['# 아이템 어픽스 총정리','','> 2026-04-15 | AFFIX_POOL | 전체 5-티어 | '+pool.length+'종',
  '> PRE=접두(PREFIX) | SUF=접미(SUFFIX) | ★=희귀 가중치 | w=드롭 가중치(높을수록 흔함)','','---',''];

out.push('## 카테고리 요약');out.push('');
out.push('| # | 카테고리 | 수량 | 설명 |');out.push('|---|---|---|---|');
let idx=1;
order.forEach(c=>{if(cats[c])out.push('| '+idx+++' | **'+c+'** | '+cats[c].length+' | '+(catDesc[c]||'')+' |')});
out.push('| | **합계** | **'+pool.length+'** | |');
out.push('');out.push('---');out.push('');

order.forEach(cat=>{
  const arr=cats[cat];if(!arr)return;
  out.push('## '+cat+' ('+arr.length+'종)');out.push('');
  out.push('> '+catDesc[cat]);out.push('');
  out.push('| id | 이름 | P/S | T1 / T2 / T3 / T4 / T5 | unit | 슬롯 | w |');
  out.push('|---|---|---|---|---|---|---|');
  arr.sort((a,b)=>a.id.localeCompare(b.id));
  arr.forEach(a=>out.push(fmt(a)));
  out.push('');
});

// 미분류
const ordered=new Set(order);
Object.keys(cats).forEach(k=>{
  if(!ordered.has(k)){
    out.push('## [미분류] '+k+' ('+cats[k].length+'종)');out.push('');
    out.push('| id | 이름 | P/S | T1/T2/T3/T4/T5 | unit | 슬롯 | w |');out.push('|---|---|---|---|---|---|---|');
    cats[k].forEach(a=>out.push(fmt(a)));out.push('');
  }
});

fs.writeFileSync('G:/hell/docs/7아이템디자인/아이템_어픽스_총정리.md', out.join('\n'), 'utf8');
console.log('Done: '+pool.length+' entries, '+Object.keys(cats).length+' categories');
