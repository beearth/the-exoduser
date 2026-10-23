import fs from 'node:fs';
import crypto from 'node:crypto';
const root='G:/exoduser/',dir=root+'output/new_heroes_refinement_20261022/';
const [candidate,task]=process.argv.slice(2);
const prompts={
H51:'EDIT reference. Fine chrome variant: replace broad body strips with delicate tapered silver inlays flowing along collarbones and exposed flanks, 3 short asymmetric branches, tiny recessed joints. Elegant tech jewelry, skin predominant, crisp reflections, wear. Keep SAME face, blonde bob, monocular, jacket, bodysuit coverage, hotpants and colored-ammo giant revolver rifle. Keep relaxed two-hand low carry, NOT aiming; stock retained, no forced shoulder contact. Same framing. No glow/dots/chains.',
H52:'EDIT reference. Warrior chrome variant: replace curved body jewelry with compact angular segmented silver plates at collarbones, side ribs and hip crests. Asymmetric overlapping facets, dark gasket seams, worn edges; echo robot arm. Bare abdomen stays mostly visible. Keep SAME face, blonde bob, monocular, jacket, hotpants and giant revolver rifle with colored ammo. Relaxed two-hand low carry, not aiming; retain stock, no forced shoulder contact. Same framing/quality. No spikes/chains/glow/dots.'
};
if(!prompts[candidate]||!/^\d{19}$/.test(task||''))throw Error('Observed candidate/task required');
const prompt=prompts[candidate];if(prompt.length>500)throw Error('Prompt too long');
const reference='assets/character-concepts/20261023/hellgunner_chrome_body_inlays_h50.png',referenceSha256=crypto.createHash('sha256').update(fs.readFileSync(root+reference)).digest('hex');
if(referenceSha256!=='eebf4c74e521c07e558bad576f2564f632799c2534abc0ca8177ac92d5ed8ac3')throw Error('H50 input changed');
const f=dir+'submission-receipt.json',r=JSON.parse(fs.readFileSync(f,'utf8')),old=r.jobs.find(j=>j.candidate===candidate);
if(old&&old.task!==task)throw Error('Task conflict');
if(!old)r.jobs.unshift({candidate,task,label:candidate==='H51'?'Fine flowing chrome inlays':'Angular segmented warrior chrome',provider:'MagicLight',model:'Seedream 5.0 Pro',generationMode:'single-reference-edit',reference,referenceSha256,prompt,aspectRatio:'4:3',outputs:1,displayedCost:100,status:'submitted'});
const h50=r.jobs.find(j=>j.candidate==='H50');h50.userRenderingVerdict='나쁘지 않네 다른버전도 해바';h50.userRenderingDirection='Positive base for chrome variants, not final adoption';
r.latestChromeDirection.userPositiveQuote='나쁘지 않네 다른버전도 해바';
r.latestChromeDirection.variants=r.latestChromeDirection.variants||[];if(!r.latestChromeDirection.variants.includes(candidate))r.latestChromeDirection.variants.push(candidate);
r.latestChromeDirection.poseInterpretation={userQuestion:'총 견착빼버리는게 편한가 저렇게',scope:'For the two current concept poses keep low two-hand display carry, no forced shoulder contact; retain stock. This is agent interpretation of user question, not deletion of stock or cancellation of shoulder-fired combat concept.'};
r.updatedAt=new Date().toISOString();fs.writeFileSync(f,JSON.stringify(r,null,2)+'\n');
const rf=dir+'chrome-variants-receipt.json',v=fs.existsSync(rf)?JSON.parse(fs.readFileSync(rf,'utf8')):{base:'H50',reference,referenceSha256,userPositiveQuote:'나쁘지 않네 다른버전도 해바',provider:'MagicLight Toolbox Image',model:'Seedream 5.0 Pro',jobs:[]};if(!v.jobs.some(j=>j.candidate===candidate))v.jobs.push({candidate,task,prompt,promptLength:prompt.length,aspectRatio:'4:3',outputs:1,displayedCost:100,submittedAt:r.updatedAt});fs.writeFileSync(rf,JSON.stringify(v,null,2)+'\n');
const df=root+'docs/17게임아트팀/HELLGUNNER_SINGLE_SHOT_GIANT_GUN_20261023.md';let d=fs.readFileSync(df,'utf8');if(!d.includes('## 크롬 비교 변형 — H51/H52'))d+='\n## 크롬 비교 변형 — H51/H52\n\n사용자는 H50에 “나쁘지 않네 다른버전도 해바”라고 평가해 추가 변형을 요청했다. H50를 두 변형의 편집 원본으로 사용한다. H50 긍정 평가는 최종 게임 채택이 아니다.\n\n| 후보 | 제작 방향 | 유지 |\n|---|---|---|\n| H51 | 가는 테이퍼 크롬 인레이, 쇄골/옆구리를 따르는 흐름과 짧은 비대칭 갈래. 장신구 인상 | 얼굴·단발·단안·가죽 핫팬츠·현재 의상 범위·거대총기/탄약색·근접 구도 |\n| H52 | 작은 각진 은색 분절판, 겹친 면·어두운 개스킷 틈·마모 모서리로 전사 인상 | 얼굴·단발·단안·가죽 핫팬츠·거대총기/탄약색·근접 구도 |\n\n사용자가 이어 “총 견착빼버리는게 편한가 저렇게”라고 물었다. 에이전트는 현재 장식을 보여주는 원화에서는 두 손으로 총을 낮게 받치는 비조준 자세를 유지하고 억지 견착을 피하는 것으로 해석해 제작한다. **개머리판을 삭제하거나 전투의 견착 단발 개념을 폐기하는 지시로 확대하지 않는다.** 조준 사격 포즈에서는 개머리판/어깨 접촉이 별도 기준으로 남는다.\n\n두 후보 모두 MagicLight Seedream 5.0 Pro, 4:3·1장씩·표시100pt/건. 실제 접수/494자 이하 프롬프트/참조 SHA는 chrome-variants-receipt.json 및 submission-receipt.json. 수신 후 실제 장식 차이와 기존 인물/무기/탄약색을 눈으로 검수한다.\n';
d=d.replaceAll('실제 접수/494자 이하 프롬프트','실제 접수/500자 이하 프롬프트');
const line='\n'+candidate+' 실제 접수: `'+task+'`, '+prompt.length+'자 프롬프트.\n';if(!d.includes(candidate+' 실제 접수:'))d+=line;fs.writeFileSync(df,d);
let c=fs.readFileSync(dir+'checkpoint.mjs','utf8');for(const n of ['record-chrome-variants.mjs','chrome-variants-receipt.json']){const p='output/new_heroes_refinement_20261022/'+n;if(!c.includes(p))c=c.replace('const fixed=[','const fixed=[\n '+JSON.stringify(p)+',');}fs.writeFileSync(dir+'checkpoint.mjs',c);console.log(JSON.stringify({candidate,task,promptLength:prompt.length,status:'submitted'}));
