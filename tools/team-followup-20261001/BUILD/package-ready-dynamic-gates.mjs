import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
const owned='tools/team-followup-20261001/BUILD/',root=process.cwd();
const evidence=JSON.parse(fs.readFileSync(owned+'package-ready-final-evidence.json'));
const inventory=new Map(evidence.inputFiles.map(entry=>[entry.path,entry]));const checks=[];
function checkFile(value,category){const input=inventory.get(value);checks.push({path:value,category,exists:fs.existsSync(path.join(root,value)),inManifest:!!input,lfsPointer:!!input?.lfsPointer,sha256:input?.sha256??null});}
const game=fs.readFileSync('game.html','utf8'),easy=fs.readFileSync('game-easy-test.html','utf8');
const locks={gameSHA:createHash('sha256').update(game).digest('hex'),easySHA:createHash('sha256').update(easy).digest('hex'),loop8x8:[game,easy].every(source=>source.includes('for(let y=0;y<8;y++)for(let x=0;x<8;x++)')),mainRootsKnown:game.includes("'assets/map/ch1/rootworld_candidate'")&&game.includes("'assets/map/ch1/rootworld_outer'")&&game.includes("'assets/map/ch1/production_finish'"),easyRootsKnown:easy.includes("'assets/map/ch1/baked_start_smoothing'"),phaseSetKnown:[game,easy].every(source=>source.includes("phase==='large'||phase==='large_medium'||phase==='landmark_center'"))};
if(!locks.loop8x8||!locks.mainRootsKnown||!locks.easyRootsKnown||!locks.phaseSetKnown)throw Error('DYNAMIC_SOURCE_CONTRACT_CHANGED');
for(const directory of ['assets/map/ch1/production_finish','assets/map/ch1/baked_start_outer','assets/map/ch1/baked_start_smoothing','assets/map/ch1/rootworld_candidate','assets/map/ch1/rootworld_outer',...['large','large_medium','landmark_center'].map(phase=>'assets/map/ch1/baked_spike/outer_mass/'+phase)]){
  for(let row=0;row<8;row++)for(let column=0;column<8;column++)checkFile(directory+`/chunk_${column}_${row}.png`,'source-bounded8x8-all-mode-map');
}
if(!game.includes("const _PROJ_TYPES_LOAD=['shard','bolt'];")||!game.includes("const _EL_NAMES=['phys','fire','ice','dark','ltn','holy'];")||!game.includes("const _PROJ_SKIP={'shard_2':1,'shard_4':1};"))throw Error('PROJECTILE_SOURCE_CONTRACT_CHANGED');
const names=['phys','fire','ice','dark','ltn','holy'],overrides={shard_phys:'img/balls/proj_shard_dark.png',shard_ltn:'img/balls/proj_shard_fire.png'};
for(const type of ['shard','bolt'])for(const [index,name] of names.entries()){if(type==='shard'&&[2,4].includes(index))continue;checkFile(overrides[type+'_'+name]||`img/balls/proj_${type}_${name}.png`,'active-projectile-loader');}
for(const name of ['blackbean','bluebean'])checkFile(`img/balls/proj_${name}.png`,'active-special-projectile-loader');
const missing=checks.filter(entry=>!entry.exists||!entry.inManifest||entry.lfsPointer);
const inactiveEvidence={externalEnemyAtlas:[game,easy].every(source=>source.includes('const _USE_EXT_ATLAS=false;')),arrowOverridesNotLoaded:game.includes("const _PROJ_TYPES_LOAD=['shard','bolt'];"),soundTablesDirectUses:{sfxIdentifierCount:(game.match(/\bSFX_MAP\b/g)||[]).length,bgmPlayCallOrDefinitionCount:(game.match(/\bbgmPlay\(/g)||[]).length},limits:'SFX/BGM직접호출부재는동적외부접근/글로벌인수까지없다는보장이아님'};
const result={at:new Date().toISOString(),locks,expandedCount:checks.length,checks,missing,inactiveEvidence,verdict:missing.length?'BLOCKED_REQUIRED_OR_QUERY_ASSET_MISSING':'CHECKED_BOUNDED_DYNAMIC_SETS_PASS',limits:'게임전체실행없이원소스의유한8x8/phase/projectile집합을대조;모든임의동적JS참조완전성은UNKNOWN'};
fs.writeFileSync(owned+'package-ready-dynamic-evidence.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({expandedCount:checks.length,missing,inactiveEvidence,verdict:result.verdict}));
