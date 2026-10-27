// Mutation check for the CX-04a oracle: applies ONE deliberate change at a time to a temp copy of EnemyHurt.cs and runs the oracle on it.
// Every mutant must produce failures (a surviving mutant means the oracle cannot see that kind of mistake).
//   node run-mutants.cjs [--project <unity project dir>] [--out <dir>] [--only 1,2,3]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const project=path.resolve(arg('--project',path.join(__dirname,'../..'))),out=path.resolve(arg('--out',path.join(__dirname,'runs')));
const core=path.join(project,'Assets/Exoduser/Runtime/Core');
const FILES=['EnemyTables.cs','EliteTables.cs','EnemySpawn.cs','EnemySpawn.Tick.cs','EnemySpawn.Hurt.cs','EnemyFactory.cs','JsMath.cs','EnemyHurtContext.cs','EnemyHurtTables.cs','EnemyHurt.cs'];
const src={};for(const f of FILES)src[f]=fs.readFileSync(path.join(core,f),'utf8');
const T='EnemyHurt.cs';
const M=[
 // ---- gates ----
 [T,'revive cap 90 -> 91','if (e.reviveIframes > 90) e.reviveIframes = 90;','if (e.reviveIframes > 91) e.reviveIframes = 91;'],
 [T,'revive decrement 1 -> 2','e.reviveIframes = Math.Max(0, e.reviveIframes - 1); return null;','e.reviveIframes = Math.Max(0, e.reviveIframes - 2); return null;'],
 [T,'revive protects against DOT','e.reviveIframes > 0 && !dotT','e.reviveIframes > 0'],
 [T,'hp<=0 gate removed','if (e.hp <= 0) return null;',''],
 [T,'btDmgLog entry skipped','if (c.BtDmgLog != null) c.BtDmgLog.Add(new EnemyHurtLogEntry { t = c.Now, src = "player", dmg = dmg });',''],
 [T,'shBufI not released','finally { c.ShBufI--; }','finally { }'],
 [T,'lesson gate: no early return','c.ParryLessonHurt(e, dmg, ang, opts); return null; }','c.ParryLessonHurt(e, dmg, ang, opts); }'],
 // ---- counters / rare ----
 [T,'mirror guard x2 -> x3','e.atk * 2 * ElMul','e.atk * 3 * ElMul'],
 [T,'burst counter x1.5 -> x1.6','e.atk * 1.5 * ElMul','e.atk * 1.6 * ElMul'],
 [T,'counter iframes 15 -> 16','P.iframes = 15;','P.iframes = 16;'],
 [T,'mirror guard state check dropped','e.ib && Truthy(e._mgActive) && e.s == "bossMirrorGuard"','e.ib && Truthy(e._mgActive)'],
 [T,'etype99 cap 1% -> 2%','ToInt32(e.mhp * .01)','ToInt32(e.mhp * .02)'],
 [T,'etype92 absorb >= -> >','e._mrAbsorb >= e._mrAbsorbMax','e._mrAbsorb > e._mrAbsorbMax'],
 [T,'etype92 shot speed 4 -> 5','JsMath.Cos(e.facing) * 4','JsMath.Cos(e.facing) * 5'],
 [T,'etype92 reacts to DOT','e.etype == 92 && !dotT','e.etype == 92'],
 [T,'etype93 curse 18000 -> 18001','18000','18001'],
 [T,'etype40 phasing return dropped','if (e.etype == 40 && e._wraithPhasing) return null;',''],
 [T,'etype41 guard .5 -> .6','e._dkGuarding) dmg = ToInt32(dmg * .5)','e._dkGuarding) dmg = ToInt32(dmg * .6)'],
 [T,'etype57 curled return dropped','if (e.etype == 57 && e._curled) return null;',''],
 [T,'blue bean min 10% -> 11%','Math.Max(dmg, ToInt32(e.mhp * 0.10))','Math.Max(dmg, ToInt32(e.mhp * 0.11))'],
 [T,'boss blue bean 10% -> 11%','dmg = ToInt32(e.mhp * .10);','dmg = ToInt32(e.mhp * .11);'],
 [T,'bleed pool 10% -> 11%','c.PDotPool() * dmg * 0.10','c.PDotPool() * dmg * 0.11'],
 [T,'bleed stack cap 10 -> 9','Math.Min(10, e.bleedStk + 1)','Math.Min(9, e.bleedStk + 1)'],
 [T,'poison stack cap check','if (e.poisonStk < 10)','if (e.poisonStk <= 10)'],
 [T,'shield arc pi/3 -> pi/4','Math.Abs(shDiff) < Math.PI / 3','Math.Abs(shDiff) < Math.PI / 4'],
 [T,'shield factor .3 -> .4','dmg = ToInt32(dmg * 0.3);','dmg = ToInt32(dmg * 0.4);'],
 [T,'shield block sound ignores noSound','if (!noSound) c.Block();','c.Block();'],
 [T,'element resistance halved','dmg * (1 - e.eRes[(int)atkEl]))','dmg * (1 - e.eRes[(int)atkEl] * 0.5))'],
 [T,'crab guard .3 -> .4','e._crabGuard && !dotT) dmg = ToInt32(dmg * .3)','e._crabGuard && !dotT) dmg = ToInt32(dmg * .4)'],
 [T,'obsidian guard .2 -> .25','e._obsGuarding && !dotT) dmg = ToInt32(dmg * .2)','e._obsGuarding && !dotT) dmg = ToInt32(dmg * .25)'],
 [T,'etype85 dodge .25 -> .26','c.Random() < .25','c.Random() < .26'],
 [T,'etype85 dodge against DOT','e.etype == 85 && !dotT &&','e.etype == 85 &&'],
 [T,'M14 .5 -> .6','Contains("M14")) dmg = ToInt32(dmg * .5)','Contains("M14")) dmg = ToInt32(dmg * .6)'],
 [T,'guardian aura <1 -> <=1','e._aDefM.Value < 1','e._aDefM.Value <= 1'],
 [T,'M22 .67 -> .68','dmg * .67','dmg * .68'],
 [T,'M22 radius 120 -> 121','c.ShQuery(e.x, e.y, 120)','c.ShQuery(e.x, e.y, 121)'],
 [T,'M22 loop does not break','"#ff66aa", 15, null, null); break; }','"#ff66aa", 15, null, null); }'],
 [T,'M22 applies to bosses','if (e.mods != null && !e.ib)\n                {\n                    var m22','if (e.mods != null)\n                {\n                    var m22'],
 [T,'hit sound cooldown 8 -> 9','c.HitSfxCd = 8;','c.HitSfxCd = 9;'],
 [T,'hit sound cooldown <=0 -> <0','c.HitSfxCd <= 0','c.HitSfxCd < 0'],
 [T,'shock +5% -> +6%','e._shockStk.Value * 0.05','e._shockStk.Value * 0.06'],
 [T,'shock stun threshold 3 -> 4','e._shockStk.Value >= 3','e._shockStk.Value >= 4'],
 [T,'shock stun 18 -> 19','Math.Max(e.stunned, 18)','Math.Max(e.stunned, 19)'],
 [T,'shock stack cap 10 -> 11','Math.Min(10, Or(e._shockStk, 0) + 1)','Math.Min(11, Or(e._shockStk, 0) + 1)'],
 [T,'shock timer 300 -> 301','Math.Max(Or(e._shockT, 0), 300)','Math.Max(Or(e._shockT, 0), 301)'],
 [T,'cursed 1.25 -> 1.26','dmg * 1.25','dmg * 1.26'],
 [T,'antiRevive applies to bosses','(EnemyHurtTables.IsUndead((int)e.etype) || Truthy(e._isGhoul)) && !e.ib','(EnemyHurtTables.IsUndead((int)e.etype) || Truthy(e._isGhoul))'],
 [T,'elemConvert also for atkEl>0','atkEl == 0 && c.EqAffix("elemConvert") > 0','atkEl >= 0 && c.EqAffix("elemConvert") > 0'],
 [T,'elemFocus doubled','(1 + c.EqAffix("elemFocus"))','(1 + c.EqAffix("elemFocus") * 2)'],
 [T,'phase2 element table reaches atkEl 5','atkEl > 0 && atkEl <= 4','atkEl > 0 && atkEl <= 5'],
 [T,'crisis threshold 30% -> 31%','P.hp < P.mhp * .3 &&','P.hp < P.mhp * .31 &&'],
 [T,'killSlayer: undefined mul treated as 0','1 + N(P._killMul)','1 + Or(P._killMul, 0)'],
 [T,'boots buff kept after use','P._lBootsT = 0; c.AddText','c.AddText'],
 [T,'boots buff applies to DOT','Gt0(P._lBootsT) && !dotT &&','Gt0(P._lBootsT) &&'],
 [T,'spear needs no stacks','Gt0(P._lSpearT) && Or(P._lSpearStk, 0) > 0 &&','Gt0(P._lSpearT) &&'],
 [T,'accessory bonus 0.01 -> 0.02','Headband2Dmg) * 0.01','Headband2Dmg) * 0.02'],
 [T,'accessory bonus skips headband2','+ c.HeadbandDmg + c.Headband2Dmg)','+ c.HeadbandDmg)'],
 [T,'weak-prey doubled','dmg * (1 + pb)','dmg * (1 + pb * 2)'],
 [T,'hunter bonus uses wrong value','dmg = ToInt32(dmg * hm)','dmg = ToInt32(dmg * (hm - 0.01))'],
 // ---- conditional affixes ----
 [T,'abund 70% -> 71%','e.hp >= e.mhp * .7','e.hp >= e.mhp * .71'],
 [T,'abund passive .20 -> .21','Or(c.PassAbund, 0) * .20','Or(c.PassAbund, 0) * .21'],
 [T,'healthy 70% -> 71%','P.hp >= P.mhp * .7)','P.hp >= P.mhp * .71)'],
 [T,'full life uses >=','if (P.hp == P.mhp)','if (P.hp >= P.mhp)'],
 [T,'low life 35% -> 36%','P.hp <= P.mhp * .35','P.hp <= P.mhp * .36'],
 [T,'predDmg 30% -> 31%','e.hp <= e.mhp * .3)','e.hp <= e.mhp * .31)'],
 [T,'overkill 20% -> 21%','e.hp <= e.mhp * .2)','e.hp <= e.mhp * .21)'],
 [T,'firstStrike 95% -> 96%','e.hp >= e.mhp * .95','e.hp >= e.mhp * .96'],
 [T,'firstStrike applies to DOT','e.hp >= e.mhp * .95 && !dotT','e.hp >= e.mhp * .95'],
 [T,'close range 120 -> 121','d2e <= 120','d2e <= 121'],
 [T,'far range 300 -> 301','d2e > 300','d2e > 301'],
 [T,'club stun bonus -1 dropped','cAx += (c.UEq("_uClubStun") - 1);','cAx += c.UEq("_uClubStun");'],
 [T,'burn state uses only _burning','Gt0(e._burning) || e.burnT > 0','Gt0(e._burning)'],
 [T,'slow state ignores freezeSlow','|| Gt0(e._freezeSlow)',''],
 [T,'elite slayer counts empty mods','e.mods != null && e.mods.Count > 0 && !e.ib','e.mods != null && e.mods.Count >= 0 && !e.ib'],
 [T,'mob slayer ignores undefined mods','(e.mods == null || e.mods.Count == 0)','(e.mods != null && e.mods.Count == 0)'],
 [T,'min damage 1 removed','if (dmg < 1 && !shBlocked) dmg = 1;',''],
 [T,'kb default 1.0 -> 1.1','opts.kbMult.Value : 1.0','opts.kbMult.Value : 1.1'],
 [T,'poise default 1.0 -> 1.1','opts.poiseMult.Value : 1.0','opts.poiseMult.Value : 1.1'],
 // ---- flags / type % ----
 [T,'arrow ignores magic flag','else isArrow = !Truthy(opts.magic);','else isArrow = true;'],
 [T,'arrow requires no pure','if (isPure) isArrow = false; else if (opts == null)','if (opts == null)'],
 [T,'gunpowder ignores magic','else isGun = !Truthy(opts.magic);','else isGun = true;'],
 [T,'magic ignores gunpowder','else if (Truthy(isGun)) isMag = false;','else if (false) isMag = false;'],
 [T,'magic by atkEl>0 only','else if (opts == null) isMag = null; else if (Truthy(opts.beam)) isMag = true; else isMag = opts.magic;','else isMag = null;'],
 [T,'melee % applies to DOT','!magT && !arrT && !dotT','!magT && !arrT'],
 [T,'ranged % drops projDmgPct','tyAx += c.EqAffix("rangedDmgPct") + c.EqAffix("projDmgPct");','tyAx += c.EqAffix("rangedDmgPct");'],
 [T,'beam % drops spell','tyAx += c.EqAffix("beamDmgPct") + c.EqAffix("spellDmgPct");','tyAx += c.EqAffix("beamDmgPct");'],
 [T,'pBow .15 -> .16','N(c.PassBow) * .15','N(c.PassBow) * .16'],
 [T,'pBow undefined treated as 0','N(c.PassBow) * .15','Or(c.PassBow, 0) * .15'],
 [T,'weakPhys doubled','1 + e._weakPhys.Value','1 + e._weakPhys.Value * 2'],
 [T,'weakMag requires non-magic','!isPure && Gt0(e._weakMag) && magT','!isPure && Gt0(e._weakMag) && !magT'],
 [T,'weakPj ignores pure','!isPure && Gt0(e._weakPj) && arrT','Gt0(e._weakPj) && arrT'],
 [T,'shockDR ignores pure','!isPure && Or(e._shockDR, 0) > 0','Or(e._shockDR, 0) > 0'],
 [T,'blinkWeak without timer','Or(e._blinkWeak, 0) > 0 && Or(e._blinkWeakT, 0) > 0','Or(e._blinkWeak, 0) > 0'],
 // ---- combo ----
 [T,'combo passive max x5 -> x6','cbPas * 5','cbPas * 6'],
 [T,'combo affix max 10 -> 11','cbAf > 0 ? 10 : 0','cbAf > 0 ? 11 : 0'],
 [T,'combo beam counter 4 -> 5','e._comboBmT < 4','e._comboBmT < 5'],
 [T,'combo per stack 3% -> 4%','e._comboStk.Value * 0.03','e._comboStk.Value * 0.04'],
 [T,'combo stacks on DOT','if (!dotT)\n                    {\n                        bool cbAdd','if (true)\n                    {\n                        bool cbAdd'],
 [T,'combo hit timers not reset','e._comboHitT = 0; e._comboDecayT = 0; }\n                    }','}\n                    }'],
 [T,'rage skill dmg dropped','if (isRageSk) { double rsd = c.EqAffix("rageSkDmg"); if (rsd > 0) dmg = ToInt32(dmg * (1 + rsd)); }',''],
 // ---- crit ----
 [T,'rage crit x100 -> x101','c.EqAffix("rageSkCrit") * 100','c.EqAffix("rageSkCrit") * 101'],
 [T,'melee crit subtype dropped','crBonus += c.EqAffix("critRateMelee") * 100;',''],
 [T,'crit roll < -> <=','c.Random() * 100 < c.StatCrit() + crBonus','c.Random() * 100 <= c.StatCrit() + crBonus'],
 [T,'crit damage ksFC doubled','c.StatCritDmg() + ksFC','c.StatCritDmg() + ksFC * 2'],
 [T,'dagger crit not consumed','if (lDagForce) P._lNextCrit = 0;',''],
 [T,'dagger crit on DOT','bool lDagForce = !dotT && ','bool lDagForce = '],
 [T,'kiSlash crit cap 1 -> 2','Math.Min(1, c.EqAffix("kiSlashFullCrit"))','Math.Min(2, c.EqAffix("kiSlashFullCrit"))'],
 [T,'crit counter not incremented','if (c.HasStats) c.StatCrits++;',''],
 [T,'axe bleed pool not cleared','e.bleedPool = 0; e.bleedT = 0;','e.bleedT = 0;'],
 [T,'axe bleed min 1 -> 0','Math.Max(1, ToInt32(e.bleedPool.Value','Math.Max(0, ToInt32(e.bleedPool.Value'],
 [T,'onCritExplode radius 80 -> 81','double ocR = 80;','double ocR = 81;'],
 [T,'onCritExplode skips dead check','oe != null && oe.alive && oe != e && Dst','oe != null && oe != e && Dst'],
 [T,'onCritExplode damage not truncated','double ocD = ToInt32(dmg * ocExpl);','double ocD = dmg * ocExpl;'],
 [T,'onCritChain range 250 -> 251','double ocMin = 250;','double ocMin = 251;'],
 [T,'onCritChain picks farthest','if (od < ocMin)','if (od > ocMin)'],
 [T,'onCritFreeze threshold 100 -> 101','e._freezeGauge.Value >= 100','e._freezeGauge.Value >= 101'],
 [T,'onCritFreeze ignores immunity','&& !Truthy(e._freezeImmune)',''],
 [T,'onCritHeal not capped','P.hp = Math.Min(P.mhp, P.hp + ocHeal)','P.hp = P.hp + ocHeal'],
 [T,'onCritShield without max check','ocShld > 0 && N(P.eShieldMax) > 0','ocShld > 0'],
 // ---- ring reaction ----
 [T,'ring cooldown 120 -> 121','>= 120)','>= 121)'],
 [T,'ring weakness >=2 -> >2','ElMul(atkEl, e.el) >= 2','ElMul(atkEl, e.el) > 2'],
 [T,'ring radius 100 -> 101','c.ShQuery(e.x, e.y, 100)','c.ShQuery(e.x, e.y, 101)'],
 [T,'ring hits itself','if (re.alive && re != e)','if (re.alive)'],
 [T,'ring never-fired sentinel -9999 -> -9998','Or(e._lReactF, -9999)','Or(e._lReactF, -9998)'],
 [T,'ring damage min 1 -> 0','Math.Max(1, ToInt32(c.MeleeRef()','Math.Max(0, ToInt32(c.MeleeRef()'],
 [T,'ring colour fallback changed','At(EnemyFactory.ElementColors, atkEl) ?? "#ffdd44"','At(EnemyFactory.ElementColors, atkEl) ?? "#ffdd45"'],
 // ---- stun/freeze, shield ----
 [T,'stun x1.5 -> x1.6','if (e.stunned > 0 && !dotT) dmg = ToInt32(dmg * 1.5);','if (e.stunned > 0 && !dotT) dmg = ToInt32(dmg * 1.6);'],
 [T,'freeze x1.5 applies to DOT','if (Gt0(e._frozen) && !dotT) dmg','if (Gt0(e._frozen)) dmg'],
 [T,'shield ignores shieldHit for DOT','(!dotT || (opts != null && Truthy(opts.shieldHit)))','(!dotT)'],
 [T,'shield absorbs without max','e.eShieldMax > 0 && e.eShield > 0','e.eShield > 0'],
 [T,'shield overflow lost','dmg = Math.Max(0, dmg - shAbs);','dmg = 0;'],
 [T,'shield not reduced','e.eShield = Math.Max(0, e.eShield - dmg);',''],
 [T,'shield text for DOT','shAbs > 0 && !dotT','shAbs > 0'],
 [T,'shield text size 48 -> 49','45, 48, JsNumber(shAbs)','45, 49, JsNumber(shAbs)'],
 [T,'shield blocked flag dropped','if (dmg == 0) shBlocked = true;',''],
 [T,'int conversion without wrap (dmg*1.5)','dmg = ToInt32(dmg * 1.5);','dmg = Math.Truncate(dmg * 1.5);'],
 [T,'result drops kbM','kbM = kbM,','kbM = 1,'],
 [T,'ring particle colour fallback changed','At(EnemyHurtTables.ParticleColors, atkEl) ?? "#ffdd44"','At(EnemyHurtTables.ParticleColors, atkEl) ?? "#ffdd45"'],
];
const only=arg('--only',null);const onlySet=only?new Set(only.split(',').map(Number)):null;
const results=[];
M.forEach(([file,name,from,to],i)=>{
 if(onlySet&&!onlySet.has(i))return;
 const n=src[file].split(from).length-1;if(n<1){results.push({i,name,applied:false,note:'pattern not found'});return;}
 const dir=path.join(out,'mut','m'+i);fs.rmSync(dir,{recursive:true,force:true});
 const c2=path.join(dir,'Assets/Exoduser/Runtime/Core');fs.mkdirSync(c2,{recursive:true});
 for(const f of FILES)fs.writeFileSync(path.join(c2,f),f===file?src[f].split(from).join(to):src[f]);
 const r=cp.spawnSync('C:/nvm4w/nodejs/node.exe',[path.join(__dirname,'run.cjs'),'--project',dir,'--out',path.join(out,'mut','o'+i),'--label','mut'],{encoding:'utf8'});
 const m=/ENEMY_HURT_RESULT (\d+) checks \/ (\d+) failures/.exec(r.stdout||'');
 results.push({i,name,applied:true,occurrences:n,checks:m?+m[1]:null,failures:m?+m[2]:null,buildOrRunError:m?undefined:(r.stdout||'').slice(-300)});
 fs.rmSync(dir,{recursive:true,force:true});
});
const survived=results.filter(r=>r.applied&&(r.failures===0||r.failures===null));
fs.writeFileSync(path.join(out,'mutation.json'),JSON.stringify({mutants:results.length,applied:results.filter(r=>r.applied).length,survived:survived.length,notApplied:results.filter(r=>!r.applied).length,results},null,1));
for(const r of results)console.log((r.applied?(r.failures>0?'KILLED  ':'SURVIVED'):'NOT-APPLIED'),r.failures,'|',r.name,r.buildOrRunError?'| '+r.buildOrRunError.replace(/\s+/g,' '):'');
console.log(JSON.stringify({mutants:results.length,applied:results.filter(r=>r.applied).length,survived:survived.length,notApplied:results.filter(r=>!r.applied).length}));
