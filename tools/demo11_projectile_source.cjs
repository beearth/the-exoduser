const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const args=Object.fromEntries(process.argv.slice(2).map(s=>{const i=s.indexOf('=');return [s.slice(0,i),s.slice(i+1)]}));
const gamePath=args['--source-game'],outPath=args['--output'];if(!gamePath||!outPath)throw Error('--source-game and --output required');const game=fs.readFileSync(gamePath,'utf8');
function fn(name){const a=game.indexOf('function '+name+'(');if(a<0)throw Error(name);const b=game.indexOf('\n}',a);return game.slice(a,b+2);}
const pool=game.slice(game.indexOf('function _mkProj(){'),game.indexOf('for(let _i=0;_i<_PROJ_POOL;'));
const ctx=vm.createContext({EL:{P:0}});vm.runInContext(pool+'\n'+fn('_resetProj')+'\n'+fn('_projectileParryClass')+'\n'+fn('_enemyHomingTurnRate'),ctx);
const defaults=vm.runInContext('let p=_mkProj();_resetProj(p);p',ctx);
const rates={};for(const [name,p]of Object.entries({physical:{el:0},magic:{el:3},black:{el:0,blackBean:true},lesson:{el:0,_lessonShot:true},energy:{el:0,fbEnergy:true},elemBall:{el:0,elemBall:true},phantom:{el:0,phantomSword:true}})){ctx.input=p;rates[name]=vm.runInContext('_enemyHomingTurnRate(input)',ctx);}
const expected=JSON.parse(JSON.stringify({source_sha256:crypto.createHash('sha256').update(game).digest('hex'),pool:defaults,turn_rates:rates}));
if(args['--verify']==='true'){const actual=JSON.parse(fs.readFileSync(outPath,'utf8'));require('node:assert/strict').deepEqual(actual,expected);console.log(JSON.stringify({source_groups:3,pool_fields:Object.keys(defaults).length,turn_rates:Object.keys(rates).length,mismatches:0}));}else fs.writeFileSync(outPath,JSON.stringify(expected,null,2)+'\n');
