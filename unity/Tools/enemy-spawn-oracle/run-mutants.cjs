// Mutation check for the CX-02 oracle: applies ONE deliberate change at a time to a temp copy of EnemyFactory.cs and runs the oracle on it.
// Every mutant must produce failures (a surviving mutant means the oracle cannot see that kind of mistake).
//   node run-mutants.cjs [--project <unity project dir>] [--out <dir>]
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1];};
const project=path.resolve(arg('--project',path.join(__dirname,'../..'))),out=path.resolve(arg('--out',path.join(__dirname,'runs')));
const core=path.join(project,'Assets/Exoduser/Runtime/Core');
const fac=fs.readFileSync(path.join(core,'EnemyFactory.cs'),'utf8');
const M=[
 ['random constant: st2 30+rnd()*50 -> 31','e.st2 = 30+rnd()*50;','e.st2 = 31+rnd()*50;'],
 ['draw order: facing before st2',"e.st2 = 30+rnd()*50;\n            e.facing = rnd()*Math.PI*2;","e.facing = rnd()*Math.PI*2;\n            e.st2 = 30+rnd()*50;"],
 ['one draw dropped: bossPatT','e.bossPatT = 30+rnd()*20;','e.bossPatT = 30+0.5*20;'],
 ['conditional draw made unconditional: etype 6 shieldAng','e.shieldAng = etype==6?rnd()*Math.PI*2:0;','e.shieldAng = rnd()*Math.PI*2;'],
 ['HP curve base 1.0014 -> 1.0015','Math.Pow(1.0014, ','Math.Pow(1.0015, '],
 ['HP pacing /18 -> /19','/ 18); }','/ 19); }'],
 ['~~ wrap removed (etype 92 absorb max)','if (double.IsNaN(v) || double.IsInfinity(v)) return 0;\n            double t = Math.Truncate(v) % 4294967296.0;\n            if (t < 0) t += 4294967296.0;\n            return unchecked((int)(uint)t);','if (double.IsNaN(v) || double.IsInfinity(v)) return 0;\n            return (int)Math.Max(int.MinValue, Math.Min(int.MaxValue, Math.Truncate(v)));'],
 ['safePt ring start d=T -> T/2','for (double d = Tile; d <= Tile * 5; d += Tile / 2)','for (double d = Tile / 2; d <= Tile * 5; d += Tile / 2)'],
 ['safePt ring end 5T -> 4T','d <= Tile * 5;','d <= Tile * 4;'],
 ['rollAura pool hell <= -> <','if (a.Hell <= hell) pool.Add(a);','if (a.Hell < hell) pool.Add(a);'],
 ['mob skin seed etype*7 -> *8','(long)e.etype * 7','(long)e.etype * 8'],
 ['druid finale stage 3 -> 4','c.Stage == c.DemoLastStage && c.Stage == 3','c.Stage == c.DemoLastStage && c.Stage == 4'],
 ['rollMods attack count tier>=3 -> tier>=2','tier >= 3 ? 2 : 1','tier >= 2 ? 2 : 1'],
 ['rollElite magic threshold drops champion+rare','roll < champion + rare + magic','roll < champion + magic'],
 ['no-projectile etype 59 removed','54, 55, 56, 57, 58, 59 }','54, 55, 56, 57, 58 }'],
 ['M02 projCd *.85 -> *.86','_projCd * .85','_projCd * .86'],
 ['M02 speed *1.5 dropped','if (mods.Contains("M02")) spd *= 1.5;','if (mods.Contains("M02")) spd *= 1.0;'],
 ['opening replacement ignores ib','si == 0 && !ib && Array.IndexOf','si == 0 && Array.IndexOf'],
 ['boss HP multiplier 24 -> 25','ib ? 24 : 1','ib ? 25 : 1'],
 ['boss radius 22 -> 21 in canMv first check','c.CanMove(x, y, ib ? 22 : 10)','c.CanMove(x, y, ib ? 21 : 10)'],
 ['difficulty fallback: out-of-range index uses 0 instead of 1','EnemyTables.DiffMul[di] : 1;','EnemyTables.DiffMul[di] : 0;'],
 ['elite projCd champion .6 -> .65','elite >= 3 ? .6','elite >= 3 ? .65'],
 ['EQUIVALENT (expected to survive): _revPts rounding uses banker rounding; si*5.882 never ends in .5 for si 0..34','JsRound(si * 5.882)','Math.Round(si * 5.882)'],
];
const results=[];
M.forEach(([name,from,to],i)=>{
 const n=fac.split(from).length-1;if(n<1){results.push({i,name,applied:false,note:'pattern not found'});return;}
 const dir=path.join(out,'mut','m'+i);fs.rmSync(dir,{recursive:true,force:true});
 const c2=path.join(dir,'Assets/Exoduser/Runtime/Core');fs.mkdirSync(c2,{recursive:true});
 for(const f of ['EnemyTables.cs','EliteTables.cs','EnemySpawn.cs','JsMath.cs'])fs.copyFileSync(path.join(core,f),path.join(c2,f));
 fs.writeFileSync(path.join(c2,'EnemyFactory.cs'),fac.split(from).join(to));
 const r=cp.spawnSync('C:/nvm4w/nodejs/node.exe',[path.join(__dirname,'run.cjs'),'--project',dir,'--out',path.join(out,'mut','o'+i),'--label','mut'],{encoding:'utf8'});
 const m=/ENEMY_SPAWN_RESULT (\d+) checks \/ (\d+) failures/.exec(r.stdout||'');
 results.push({i,name,applied:true,occurrences:n,checks:m?+m[1]:null,failures:m?+m[2]:null,buildOrRunError:m?undefined:(r.stdout||'').slice(-300)});
});
const survived=results.filter(r=>r.applied&&(r.failures===0||r.failures===null));
fs.writeFileSync(path.join(out,'mutation.json'),JSON.stringify({mutants:results.length,applied:results.filter(r=>r.applied).length,survived:survived.length,results},null,1));
for(const r of results)console.log((r.applied?(r.failures>0?'KILLED  ':'SURVIVED'):'NOT-APPLIED'),r.failures,'|',r.name);
console.log(JSON.stringify({mutants:results.length,applied:results.filter(r=>r.applied).length,survived:survived.length}));
