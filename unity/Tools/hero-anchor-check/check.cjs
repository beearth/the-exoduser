// 실제 소스의 wave 생성문·중심 분류·lift 식을 실행하는 오프라인 계약 회귀.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../..'),out=process.argv[2];if(!out||!path.isAbsolute(out))throw Error('I: 절대 출력 경로 필요');fs.mkdirSync(out,{recursive:true});
const rel=['unity/Assets/Exoduser/Runtime/NativeSkillView.cs','unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs'],[skill,remodel]=rel.map(p=>fs.readFileSync(root+'/'+p,'utf8'));
const creation=skill.match(/if \(!waves\.TryGetValue\(w\.Id, out it\)\) \{([^\n]+)\}/)?.[1];
const lift=remodel.match(/float below = ([^;]+);/)?.[1];if(!creation||!lift)throw Error('실제 생성문/lift 식 추출 불가');
const set=()=>{const s=new Set();return {Add:x=>s.add(x),Contains:x=>s.has(x),Remove:x=>s.delete(x),get Count(){return s.size}}};
const sr=()=>({sprite:{pivot:{y:256},pixelsPerUnit:100},transform:{lossyScale:{y:648/512}},heroLift:.18});
const context={waves:{},w:{Id:1},it:null,slamFrames:[{}],disc:{},addFlat:{},add:{},alpha:{},centeredMaliceSprites:set(),centeredSlamSprites:set(),NewItem:()=>({}),NewRenderer:()=>sr(),NativeRemodelCamera:{HeroFootLift:s=>s.heroLift},Mathf:{Abs:Math.abs}};
context.NativeSkillView={IsCenteredMaliceSprite:x=>context.centeredMaliceSprites.Contains(x)};
const classify=skill.match(/public static bool IsCenteredSkillSprite\(SpriteRenderer sprite\)\s*\{([^}]+)\}/)?.[1];
vm.createContext(context);if(classify){vm.runInContext('function IsCenteredMaliceSprite(sprite){return centeredMaliceSprites.Contains(sprite)};function classify(sprite){'+classify+'}',context);context.NativeSkillView.IsCenteredSkillSprite=x=>context.classify(x);}
vm.runInContext(creation,context);const it=context.it,checks=[];let failures=0;
function check(name,actual,expected){const pass=typeof actual==='number'?Math.abs(actual-expected)<1e-9:actual===expected;checks.push({검사:name,통과:pass,실제:actual,기대:expected});if(!pass)failures++;}
function below(s,player=null){context.sr=s;context.playerView=player;context.tr=s.transform;return vm.runInContext(lift,context)}
for(const size of [648,900,320]){it.a.transform.lossyScale.y=size/512;check('강타 wave '+size+'px 중심 높이m',below(it.a),0)}
for(const size of [84,63,42]){it.b.transform.lossyScale.y=size/512;check('강타 flash '+size+'px 중심 높이m',below(it.b),0)}
const orb=sr();context.centeredMaliceSprites.Add(orb);check('기존 악의구 중심 유지',below(orb),0);
const actor=sr();actor.transform.lossyScale.y=1.5;check('일반 캐릭터 발끝 보정 유지',below(actor),3.84);actor.sprite.heroLift=.18;check('플레이어 지정 발끝 보정 유지',below(actor,actor),.27);
const beforeRotation=remodel.includes('tilt * Quaternion.Euler(0, 0, roll)');check('billboard 회전 경로 유지',beforeRotation,true);
check('2D 비활성 조기 반환 유지',remodel.includes('if (!NativeRemodel3D.Active || r3Cam == null || Simulation == null) return;'),true);
const forget=skill.match(/static void ForgetCenteredSlamSprites\(Item item\)\s*\{([^}]+)\}/)?.[1];
if(forget){context.item=it;vm.runInContext(forget,context);check('wave·flash 제거 후 레지스트리0',context.centeredSlamSprites.Count,0);check('악의구 레지스트리 분리 보존',context.centeredMaliceSprites.Contains(orb),true);check('Drop·Reset 수명종료 등록해제',skill.split('ForgetCenteredSlamSprites(').length-1,3)}else check('wave·flash 수명종료 등록해제',false,true);
const result={시각:new Date().toISOString(),범위:'오프라인 소스 실행 계약. Unity 렌더·적탄·실제피해·M1 검증이 아님',소스:rel.map((p,i)=>({경로:p,SHA256:crypto.createHash('sha256').update(i?remodel:skill).digest('hex')})),생성문:creation,lift식:lift,검사수:checks.length,실패수:failures,검사:checks};fs.writeFileSync(out+'/영수증.json',JSON.stringify(result,null,2));const log=checks.map(c=>(c.통과?'통과 ':'실패 ')+c.검사+' 실제='+c.실제+' 기대='+c.기대).join('\n')+'\n총 '+checks.length+' / 실패 '+failures+'\n';fs.writeFileSync(out+'/결과.log',log);console.log(log);process.exitCode=failures?1:0;
