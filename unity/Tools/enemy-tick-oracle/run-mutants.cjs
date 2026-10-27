// Mutation check for the CX-03a oracle: applies ONE deliberate change at a time to a temp copy of EnemyTick.cs (or JsMath.cs) and runs the oracle on it.
// Every mutant must produce failures (a surviving mutant means the oracle cannot see that kind of mistake).
//   node run-mutants.cjs [--project <unity project dir>] [--out <dir>]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const project=path.resolve(arg('--project',path.join(__dirname,'../..'))),out=path.resolve(arg('--out',path.join(__dirname,'runs')));
const core=path.join(project,'Assets/Exoduser/Runtime/Core');
const FILES=['EnemyTables.cs','EliteTables.cs','EnemySpawn.cs','EnemySpawn.Tick.cs','EnemyFactory.cs','EnemyTickContext.cs','EnemyTickTables.cs','JsMath.cs','EnemyTick.cs'];
const src={};for(const f of FILES)src[f]=fs.readFileSync(path.join(core,f),'utf8');
const T='EnemyTick.cs';
const M=[
 // ---- U1 ----
 [T,'wall push condition inverted','if (!c.CanMoveTile(e.x, e.y, e.r)) c.PushOutWall(e);','if (c.CanMoveTile(e.x, e.y, e.r)) c.PushOutWall(e);'],
 [T,'knockback threshold .1 -> .2','Math.Abs(e.kb.x) > .1 || Math.Abs(e.kb.y) > .1','Math.Abs(e.kb.x) > .2 || Math.Abs(e.kb.y) > .2'],
 [T,'knockback decay .85 -> .86','Math.Pow(.85, sp)','Math.Pow(.86, sp)'],
 [T,'wall damage cap .08 -> .09','Math.Min(0.08, kbSpd * 0.004)','Math.Min(0.09, kbSpd * 0.004)'],
 [T,'wall damage max -> min','(int)Math.Max(ToInt32(kbSpd * 4), ToInt32(e.mhp * wPct))','(int)Math.Min(ToInt32(kbSpd * 4), ToInt32(e.mhp * wPct))'],
 [T,'wall damage speed gate >2 -> >3','isRealWall && kbSpd > 2','isRealWall && kbSpd > 3'],
 [T,'rift speed gate >2 -> >3','if (kbSpd2 > 2)','if (kbSpd2 > 3)'],
 [T,'rift radius 20 -> 25','Math.Min(1, rf.t / rf.maxT) * 20','Math.Min(1, rf.t / rf.maxT) * 25'],
 [T,'rift damage x4 -> x5','ToInt32(kbSpd2 * 4)','ToInt32(kbSpd2 * 5)'],
 [T,'real wall test ignores map','wbTx >= c.MapWidth || wbTy >= c.MapHeight || c.Map[wbTy][wbTx] == 1','wbTx >= c.MapWidth || wbTy >= c.MapHeight || false'],
 [T,'spike slow applied to x only','e.kb.x *= (1 - ssP); e.kb.y *= (1 - ssP);','e.kb.x *= (1 - ssP);'],
 [T,'spike slow cap .95 -> .96','Math.Min(.95,','Math.Min(.96,'],
 [T,'hitStun return dropped','if (Gt0(e._hitStun)) return true; // hit-stun: skip AI','if (Gt0(e._hitStun)) { } // hit-stun: skip AI'],
 [T,'stun cap 180 -> 181','if (e.stunned > 180) e.stunned = 180;','if (e.stunned > 181) e.stunned = 181;'],
 [T,'maxStunned comparison flipped','e._maxStunned < e.stunned','e._maxStunned > e.stunned'],
 [T,'move threshold .25 -> .3','dx * dx + dy * dy > 0.25','dx * dx + dy * dy > 0.3'],
 [T,'moveHold 3 -> 4','e._moveHold = 3;','e._moveHold = 4;'],
 [T,'prevX falsy fallback dropped','double dx = e.x - Or(e._prevX, e.x), dy = e.y - Or(e._prevY, e.y);','double dx = e.x - (e._prevX ?? e.x), dy = e.y - (e._prevY ?? e.y);'],
 [T,'frozen immunity boss 300 -> 301','e.ib ? 300 : 120;','e.ib ? 301 : 120;'],
 [T,'iceShardRes .002 -> .003','e._iceShardRes -= 0.002 * sp','e._iceShardRes -= 0.003 * sp'],
 [T,'freezeGauge .3 -> .4','e._freezeGauge.Value - sp * .3','e._freezeGauge.Value - sp * .4'],
 [T,'weak reset keeps weakPj','e._weakMag = 0; e._weakPj = 0; }','e._weakMag = 0; }'],
 [T,'poise regen 0.15 -> 0.16','ToInt32(e.maxPoise * 0.15)','ToInt32(e.maxPoise * 0.16)'],
 [T,'poise regen 200 -> 201','if (e.poiseR >= 200)','if (e.poiseR >= 201)'],
 [T,'poise regen applies to bosses','if (!e.ib && e.poise < e.maxPoise)','if (e.poise < e.maxPoise)'],
 [T,'move sound distance 1000 -> 999','if (d < 1000 && e.stunned == 0','if (d < 999 && e.stunned == 0'],
 [T,'move sound limit 3 -> 4','if (c.MoveSfxPlaying < 3)','if (c.MoveSfxPlaying < 4)'],
 [T,'move sound volume .35 -> .36','.35 * (1 - d / 1000)','.36 * (1 - d / 1000)'],
 [T,'crawl branch < .5 -> <= .5','c.Random() < .5','c.Random() <= .5'],
 [T,'move sound cooldown 60 -> 61','e._mSfxCd = 60 + ToInt32','e._mSfxCd = 61 + ToInt32'],
 [T,'stunned truthiness: stunned<0 plays sound','e.stunned == 0 && !Truthy(e._frozen)','e.stunned <= 0 && !Truthy(e._frozen)'],
 [T,'reviveChase d>200 -> >=200','d > 200 && (e.s == "idle"','d >= 200 && (e.s == "idle"'],
 [T,'sight d<800 -> <=800','d < 800 && (e.s == "idle" || e.s == "recover") && c.HasLos','d <= 800 && (e.s == "idle" || e.s == "recover") && c.HasLos'],
 [T,'druid aim lock st2 <= 18+sp -> <= 18','e.st2 <= 18 + sp','e.st2 <= 18'],
 [T,'facing distance 800 -> 801','if (d < 800 && Truthy(e._alerted) && !druidAimLocked)','if (d < 801 && Truthy(e._alerted) && !druidAimLocked)'],
 [T,'chase short range <=400 -> <400','if (eRng <= 400)','if (eRng < 400)'],
 [T,'chase min distance 30 -> 31','if (d > 30) { c.FlowMove','if (d > 31) { c.FlowMove'],
 [T,'ideal min .65 -> .66','double idealMin = eRng * .65','double idealMin = eRng * .66'],
 [T,'ideal max .85 -> .86','idealMax = eRng * .85;','idealMax = eRng * .86;'],
 [T,'retreat speed .5 -> .6','* sp * .5;\n                        double bnx','* sp * .6;\n                        double bnx'],
 [T,'retreat ignores wall test','if (!c.IsWall(bnx, bny, true))','if (true)'],
 [T,'wwStk decay 60 -> 61','ToInt32(3 * sp / 60)','ToInt32(3 * sp / 61)'],
 [T,'combo reset 300 -> 301','e._comboHitT >= 300','e._comboHitT >= 301'],
 [T,'combo decay start 60 -> 61','else if (e._comboHitT >= 60)','else if (e._comboHitT >= 61)'],
 [T,'combo decay 20% -> 21%','e._comboStk.Value * 0.20','e._comboStk.Value * 0.21'],
 // ---- L1 ----
 [T,'time budget 12 -> 13 ms','(c.IsMobile ? 8 : 12)','(c.IsMobile ? 8 : 13)'],
 [T,'time budget interval 32 -> 33','ei % (c.IsMobile ? 8 : 32) == 0','ei % (c.IsMobile ? 8 : 33) == 0'],
 [T,'time budget checks index 0','&& ei > 0 && !e.ib','&& ei >= 0 && !e.ib'],
 [T,'time budget cuts bosses','&& ei > 0 && !e.ib &&','&& ei > 0 &&'],
 [T,'tier T1 range 22500 -> <=','ed2 < 22500','ed2 <= 22500'],
 [T,'tier T2 range 122500 -> 122501','ed2 < 122500','ed2 < 122501'],
 [T,'tier T3 range 490000 -> 490001','ed2 < 490000','ed2 < 490001'],
 [T,'tier T2 parity flipped','(tierFrame & 1) == (ei & 1)','(tierFrame & 1) != (ei & 1)'],
 [T,'tier T3 mask 3 -> 1','(tierFrame & 3) == (ei & 3)','(tierFrame & 1) == (ei & 1)'],
 [T,'tier T2 sp*2 -> sp*3','c.UpdateE(e, sp * 2)','c.UpdateE(e, sp * 3)'],
 [T,'T4 sp*8 -> sp*7','c.UpdateE(e, sp * 8)','c.UpdateE(e, sp * 7)'],
 [T,'T4 flow multiplier .6 -> .5','c.FlowMove(e, sp * 4, 0.6)','c.FlowMove(e, sp * 4, 0.5)'],
 [T,'commit state not forced to T1','bool eCommitChg = e.s == "eChargeWind" || e.s == "eCharge";','bool eCommitChg = e.s == "eChargeWind";'],
 [T,'cull margin 300 -> 301','e.x < c.CamX + c.ViewW / 2 + 300','e.x < c.CamX + c.ViewW / 2 + 301'],
 [T,'cull near distance 900 -> 901','(ed2 < 900)','(ed2 < 901)'],
 [T,'cull exempts hurt enemies dropped','|| Gt0(e.hurt) || eCommitChg || (ed2 < 900)','|| eCommitChg || (ed2 < 900)'],
 [T,'leash distance > -> >=','ed2 > 6250000','ed2 >= 6250000'],
 [T,'leash ring 800 -> 801','800 + c.Random() * 400','801 + c.Random() * 400'],
 [T,'leash draw order swapped','double lshAng = Math.PI * 2 * c.Random(), lshD = 800 + c.Random() * 400;','double lshD = 800 + c.Random() * 400, lshAng = Math.PI * 2 * c.Random();'],
 [T,'leash ignores frozen','!Truthy(e._frozen) && Truthy(e._alerted) && ed2 > 6250000','Truthy(e._alerted) && ed2 > 6250000'],
 [T,'wall rescue range 5 -> 4','wr0 <= 5','wr0 <= 4'],
 [T,'boss rescue start 6 -> 7','int wr1 = 6;','int wr1 = 7;'],
 [T,'rescue ignores wall tiles','c.Map[rty0][rtx0] != 1)','true)'],
 [T,'rescue skips kb reset','e.x = wx0; e.y = wy0; e.kb.x = 0; e.kb.y = 0; rescued0 = true;','e.x = wx0; e.y = wy0; rescued0 = true;'],
 [T,'corner check: last corner skipped','|| c.WallStuck(e.x + e.r, e.y + e.r))','|| false)'],
 [T,'death exp fallback 1 -> 2','c.AddExp(Or(e.exp, 1))','c.AddExp(Or(e.exp, 2))'],
 [T,'death does not count stage kills','c.StageKills = Or(c.StageKills, 0) + 1;',''],
 [T,'death kill count dropped','c.Kills++; c.StageKills','c.StageKills'],
 [T,'boss fallback to player ignores canMv','if (!brescued0 && c.CanMove(c.PlayerX, c.PlayerY, e.r))','if (!brescued0)'],
 [T,'spawnT decrement dropped','if (e._spawnT > 0) e._spawnT--;',''],
 [T,'revive VFX radius ignores origR','Or(e._origR, e.r)','e.r'],
 [T,'hitFlash not clamped','Math.Max(0, e._hitFlash.Value - sp)','e._hitFlash.Value - sp'],
 [T,'bonfire repush applies to bosses','if (f.BonfireActive && !e.ib) { double clr2','if (f.BonfireActive) { double clr2'],
 [T,'bonfire timer not decremented','if (c.Bonfire != null && c.Bonfire.t > 0) c.Bonfire.t -= sp;',''],
 [T,'tier frame not incremented','c.EnemyTierFrame = c.EnemyTierFrame.Value + 1;',''],
 [T,'walkDist accumulates on zero move','if (edd > 0) e._walkDist','if (edd >= 0) e._walkDist'],
 // ---- JsMath (V8 bit-exactness) ----
 ['JsMath.cs','atan coefficient changed','3.33333333333329318027e-01','3.33333333333329418027e-01'],
 ['JsMath.cs','atan2 quadrant 2 offset dropped','case 2: return Pi - (z - PiLo);','case 2: return Pi - z;'],
 ['JsMath.cs','sin kernel S3 changed','-1.98412698298579493134e-04','-1.98412698298579593134e-04'],
 ['JsMath.cs','cos kernel branch threshold changed','if (ix < 0x3FD33333)','if (ix < 0x3FD33334)'],
 ['JsMath.cs','rem_pio2 pio2_1t changed','6.07710050650619224932e-11','6.07710050650719224932e-11'],
 ['JsMath.cs','sin quadrant sign changed','case 2: return -KernelSin(y0, y1, 1); default: return -KernelCos(y0, y1);','case 2: return KernelSin(y0, y1, 1); default: return -KernelCos(y0, y1);'],
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
 const m=/ENEMY_TICK_RESULT (\d+) checks \/ (\d+) failures/.exec(r.stdout||'');
 results.push({i,name,applied:true,occurrences:n,checks:m?+m[1]:null,failures:m?+m[2]:null,buildOrRunError:m?undefined:(r.stdout||'').slice(-300)});
 fs.rmSync(dir,{recursive:true,force:true});
});
const survived=results.filter(r=>r.applied&&(r.failures===0||r.failures===null));
fs.writeFileSync(path.join(out,'mutation.json'),JSON.stringify({mutants:results.length,applied:results.filter(r=>r.applied).length,survived:survived.length,results},null,1));
for(const r of results)console.log((r.applied?(r.failures>0?'KILLED  ':'SURVIVED'):'NOT-APPLIED'),r.failures,'|',r.name,r.buildOrRunError?'| '+r.buildOrRunError.replace(/\s+/g,' '):'');
console.log(JSON.stringify({mutants:results.length,applied:results.filter(r=>r.applied).length,survived:survived.length}));
