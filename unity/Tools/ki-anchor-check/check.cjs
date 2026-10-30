// 기검 중심형 표시의 실제 billboard lift 식을 실행하는 회귀 검사.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../..'),out=process.argv[2];if(!out||!path.isAbsolute(out))throw Error('절대 출력 경로 필요');fs.mkdirSync(out,{recursive:true});
const ki=fs.readFileSync(root+'/unity/Assets/Exoduser/Runtime/KiSlashView.cs','utf8'),remodel=fs.readFileSync(root+'/unity/Assets/Exoduser/Runtime/NativeGame.Remodel3D.cs','utf8');
const lift=remodel.match(/float below = ([^;]+);/)?.[1];if(!lift)throw Error('실제 lift 식 없음');const centered=new Set();const context={Mathf:{Abs:Math.abs},NativeSkillView:{IsCenteredSkillSprite:()=>false},NativeRemodelCamera:{HeroFootLift:s=>s.heroLift},centeredSprites:{Contains:s=>centered.has(s)}};
const classify=ki.match(/public static bool IsCenteredSprite\(SpriteRenderer sprite\)\s*\{([^}]+)\}/)?.[1];vm.createContext(context);if(classify){vm.runInContext('function classify(sprite){'+classify+'}',context);context.KiSlashView={IsCenteredSprite:s=>context.classify(s)};}else context.KiSlashView={IsCenteredSprite:()=>false};
const checks=[];function check(name,actual,expected){checks.push({검사:name,통과:Math.abs(actual-expected)<1e-8,실제:actual,기대:expected});}
function below(sr,player=null){Object.assign(context,{sr,playerView:player,tr:sr.transform});return vm.runInContext(lift,context);}
const sr=()=>({sprite:{pivot:{y:256},pixelsPerUnit:100},transform:{lossyScale:{y:1}},heroLift:.18});
const registered=ki.includes('centeredSprites.Add(r);');
for(const size of [192,252,554.4,632.016,78,117]){const r=sr();r.transform.lossyScale.y=size/512;if(registered)centered.add(r);check('기검·충전 중심 높이 '+size+'px',below(r),0);}
const actor=sr();actor.transform.lossyScale.y=1.5;check('일반 캐릭터 발끝 보존',below(actor),3.84);actor.sprite.heroLift=.18;check('플레이어 지정 발끝 보존',below(actor,actor),.27);
const failures=checks.filter(x=>!x.통과).length;const receipt={시각:new Date().toISOString(),범위:'실제 billboard lift 식의 오프라인 실행. Player·GPU·화면 검수 별도',소스SHA256:crypto.createHash('sha256').update(ki+remodel).digest('hex'),검사수:checks.length,실패수:failures,검사:checks};fs.writeFileSync(out+'/영수증.json',JSON.stringify(receipt,null,2));console.log(JSON.stringify(receipt));process.exitCode=failures?2:0;
