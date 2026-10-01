import fs from 'node:fs';
import {createHash} from 'node:crypto';
const prefix='tools/team-followup-20261001/BUILD/package-input-resolution-';
const evidence=JSON.parse(fs.readFileSync(prefix+'evidence.json')),config=JSON.parse(fs.readFileSync(prefix+'config.json'));
const hash=data=>createHash('sha256').update(data).digest('hex');
const executable=evidence.files.filter(entry=>/\.(html|js|mjs|cjs|css)$/i.test(entry.path)).map(entry=>({path:entry.path,text:fs.readFileSync(entry.path,'utf8')}));
const metadata=['assets/map/ch1/production_finish/composition.json','assets/map/ch1/production_finish/retouch-layers.json'];
const inbound=executable.flatMap(source=>metadata.flatMap(target=>source.text.includes(target)||source.text.includes(target.split('/').at(-1))?[{from:source.path,target}]:[]));
const patch=evidence.exclusions.find(entry=>entry.path.endsWith('/outer90_patch.png'));
if(patch.hits.length===2&&patch.hits.every(hit=>metadata.includes(hit.path))&&inbound.length===0){patch.decision='EXCLUDE_SOURCE_ONLY';patch.reason='composition.json/retouch-layers.json의 bake retouchLayers 제작 참조2; 실행 HTML/JS/CSS에서 두 manifest 로드 참조0; chunk/rotforest_mass 별도 활성 자산은 유지';}
evidence.metadataDependency={paths:metadata,inboundExecutableReferences:inbound,sourceHashes:metadata.map(path=>({path,sha256:hash(fs.readFileSync(path))})),limits:'임의 외부 글로벌 코드·동적 manifest 문자열 합성은 UNKNOWN; 현재 패키지 실행 소스 명시 경로와 유한 map 로더 기준'};
const selected=evidence.files.filter(entry=>!evidence.exclusions.some(exclusion=>exclusion.path===entry.path&&exclusion.decision==='EXCLUDE_SOURCE_ONLY'));
config.inputRoots=selected.map(entry=>entry.path);config.inputs=selected.map(({path,sha256})=>({path,sha256}));config.backup.inputs=selected.filter(entry=>entry.checkpointMatches).map(({path,sha256})=>({path,sha256}));
evidence.selectedCount=selected.length;evidence.selectedBytes=selected.reduce((sum,entry)=>sum+entry.bytes,0);evidence.manifestSHA=hash(JSON.stringify(config.inputs));
if(evidence.exclusions.every(entry=>entry.decision==='EXCLUDE_SOURCE_ONLY'))evidence.gates=evidence.gates.filter(gate=>gate!=='제외 후보 직접 의존성');
evidence.assetClasses={required:'활성 map chunk512 + projectile12=524 모두 현재 SHA/allowlist 유지; 직접 script/style139 기존 SHA 유지',inactive:'enemy atlas는 _USE_EXT_ATLAS=false로 즉시 return; arrow override는 현재 shard/bolt 로더 미사용',fallback:'legacy BGM fetch/decode 실패는 catch return으로 무음 종료; procedural SFX는 파일과 다른 경로',unknown:'legacy SFX_MAP 파일 항목에 외부/global 호출 시 대체 음원 보장 없음; 임의 동적 경로/실제 청감 UNKNOWN'};
evidence.finalizedAt=new Date().toISOString();
fs.writeFileSync(prefix+'config.json',JSON.stringify(config,null,2)+'\n');fs.writeFileSync(prefix+'evidence.json',JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({selectedCount:evidence.selectedCount,selectedBytes:evidence.selectedBytes,excluded:evidence.exclusions.map(entry=>({path:entry.path,decision:entry.decision})),inbound,gates:evidence.gates,manifestSHA:evidence.manifestSHA,finalizedAt:evidence.finalizedAt}));
