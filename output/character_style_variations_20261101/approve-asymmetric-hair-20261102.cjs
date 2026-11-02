const fs=require('fs'),path=require('path'),crypto=require('crypto'),cp=require('child_process');
const root='G:/exoduser',out=__dirname,desktop='C:/Users/심도진/Desktop/엑소듀서_검토/캐릭터_스타일변주_20261101',lib='assets/art-reference/spearmage-hair/20261102';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function writeNew(p,data){fs.mkdirSync(path.dirname(p),{recursive:true});if(fs.existsSync(p)){if(!fs.readFileSync(p).equals(Buffer.from(data)))throw Error('existing differs '+p);}else fs.writeFileSync(p,data,{flag:'wx'});}
const selection=[
 {id:'spearmage_asymmetric_bob',name:'비대칭 단발',source:'hair_fullbody_set01_halfup_bob.png',file:'approved-asymmetric-bob-pair.png',region:{x:0.5,y:0,width:0.5,height:1},note:'오른쪽 창법사만 헤어 채택. 짙은 자주색 비대칭 단발·옆으로 흐르는 앞머리.'},
 {id:'spearmage_asymmetric_updo',name:'비대칭 올림머리',source:'hair_fullbody_set03_layered_braidedupdo.png',file:'approved-asymmetric-updo-pair.png',region:{x:0.5,y:0,width:0.5,height:1},note:'오른쪽 창법사만 헤어 채택. 먹색 올림머리·회은색 앞머리·비대칭 땋은 매듭.'}
];
const manifest={status:'USER_APPROVED_HAIRSTYLE_REFERENCES',userInstruction:'일단 비대칭 2종 저거 쓰자',approvedAt:new Date().toISOString(),character:'창법사',scope:'Two hairstyle appearance references only; full paired source boards retained without raster editing.',runtimeApplied:false,notSelectedByThisInstruction:'왼쪽 복근형의 헤어 및 02세트 옆땋기는 이번 발언으로 채택하지 않음',sourceGenerationReceipt:'output/character_style_variations_20261101/hair_fullbody_sets_20261102.receipt.json',designs:selection.map(s=>({...s,sha256:hash(path.join(out,s.source))}))};
for(const s of selection){const data=fs.readFileSync(path.join(out,s.source));writeNew(path.join(root,lib,s.file),data);writeNew(path.join(desktop,'채택_창법사_비대칭헤어2종',s.file),data);if(hash(path.join(root,lib,s.file))!==s.sha256&&hash(path.join(root,lib,s.file))!==manifest.designs.find(d=>d.id===s.id).sha256)throw Error('hash mismatch');}
const json=JSON.stringify(manifest,null,2)+'\n';
writeNew(path.join(root,lib,'manifest.json'),json);writeNew(path.join(out,'spearmage_asymmetric_hair_approved_20261102.json'),json);writeNew(path.join(desktop,'채택_창법사_비대칭헤어2종','manifest.json'),json);
const readme='# 창법사 채택 헤어 2종\n\n사용자 “일단 비대칭 2종 저거 쓰자”에 따라 비대칭 단발과 비대칭 올림머리를 후속 원화의 헤어 기준으로 사용한다. 두 PNG는 원본 2인 합본을 그대로 보존한다. 채택 대상은 각 그림 오른쪽 창법사의 헤어다. 왼쪽 복근형 및 다른 후보의 채택으로 확대하지 않는다.\n\n얼굴·의상·무기·체형을 새로 잠근 결정이 아니다. 승인된 마법창 3종 기준을 유지한다. 게임·3D·애니메이션 적용 전.\n';
writeNew(path.join(root,lib,'README.md'),readme);
const docPath='docs/17게임아트팀/SPEARMAGE_APPROVED_ASYMMETRIC_HAIR_20261102.md';
const doc='# 창법사 비대칭 헤어 2종 채택 — 2026-11-02\n\n근거: 사용자 “일단 비대칭 2종 저거 쓰자”. 직전 3세트 중 이름에 비대칭이 붙은 **01 오른쪽 비대칭 단발**과 **03 오른쪽 비대칭 올림머리**를 창법사 후속 헤어 기준으로 채택한다.\n\n| ID | 채택 헤어 | 색·실루엣 | 정본 | 참조 영역 |\n|---|---|---|---|---|\n| spearmage_asymmetric_bob | 비대칭 단발 | 짙은 자주색 단발·옆으로 흐르는 앞머리 | approved-asymmetric-bob-pair.png | 01 합본 오른쪽 절반 |\n| spearmage_asymmetric_updo | 비대칭 올림머리 | 먹색 비대칭 올림머리·회은색 앞머리·땋은 매듭 | approved-asymmetric-updo-pair.png | 03 합본 오른쪽 절반 |\n\n정본 폴더: assets/art-reference/spearmage-hair/20261102/. 원본 합본 PNG 바이트를 그대로 복사했으며 manifest.json에 원본 경로·정규화 참조 구역·SHA-256을 기록했다. 바탕화면 검토 폴더의 채택_창법사_비대칭헤어2종/에도 사본을 보존한다. 생성 영수증은 과거 생성 사실로 유지하며 별도 채택 영수증 spearmage_asymmetric_hair_approved_20261102.json을 추가했다.\n\n후속 창법사 원화는 이 두 헤어를 사용한다. 왼쪽 복근형의 헤어 및 02 옆땋기는 이번 발언으로 채택하지 않는다. 얼굴·의상·체형·무기의 새로운 확정으로 확대하지 않는다. 기존 마법창 공허 균열·성좌·월식 외형 기준은 유지한다. 게임 런타임·3D·애니메이션은 미적용이다.\n\n비교 페이지 new_hairstyle_fullbody_sets.html에 두 채택 헤어를 명시했다. 보존 도우미 approve-asymmetric-hair-20261102.cjs는 정본 복사·기록·별도 Git 백업만 수행한다.\n';
writeNew(path.join(root,docPath),doc);
const review='docs/17게임아트팀/CHARACTER_STYLE_VARIATIONS_REVIEW_20261101.md',reviewText=fs.readFileSync(path.join(root,review),'utf8');
const heading='## 2026-11-02 비대칭 헤어 2종 사용자 채택';
if(!reviewText.includes(heading))fs.appendFileSync(path.join(root,review),'\n\n'+heading+'\n\n사용자 “일단 비대칭 2종 저거 쓰자”에 따라 01 오른쪽 창법사 비대칭 단발과 03 오른쪽 창법사 비대칭 올림머리를 채택했다. 앞 절의 미채택 표시는 생성 당시 상태이며, 이 두 헤어의 현행 상태는 사용자 채택이다. 왼쪽 복근형·02 옆땋기 및 얼굴·의상·체형까지 채택 범위를 확대하지 않는다. 정본과 해시·구역 manifest는 assets/art-reference/spearmage-hair/20261102/, 상세 SSOT는 [비대칭 헤어 채택](SPEARMAGE_APPROVED_ASYMMETRIC_HAIR_20261102.md). 후속 창법사 아트의 헤어 기준으로 사용하며 게임/3D 적용은 아직 없다.\n');
const art='docs/17게임아트팀/ART_TEAM_MASTER.md',artText=fs.readFileSync(path.join(root,art),'utf8'),oldRow=artText.split(/\r?\n/).find(l=>l.startsWith('| 신규 헤어 전신 3세트 v14'));
if(!oldRow)throw Error('owned master row absent');
const newRow='| 신규 헤어 전신 3세트 v14 (2026-11-02) | ✅ **창법사 비대칭 단발(01 오른쪽)·비대칭 올림머리(03 오른쪽) 사용자 채택**, 후속 헤어 기준. 02 및 복근형 헤어는 별도 후보. 정본 assets/art-reference/spearmage-hair/20261102/. 창 제외 전신 검토판이며 게임/3D 미적용 — [채택 SSOT](SPEARMAGE_APPROVED_ASYMMETRIC_HAIR_20261102.md) |';
if(oldRow!==newRow)fs.writeFileSync(path.join(root,art),artText.replace(oldRow,newRow));
const page='new_hairstyle_fullbody_sets.html';
for(const folder of [out,desktop]){
 const p=path.join(folder,page);let html=fs.readFileSync(p,'utf8');
 if(!html.includes('id="adopted-asymmetric-hair"')){
 writeNew(path.join(folder,'new_hairstyle_fullbody_sets.before_approval_20261102.html'),html);
 html=html.replace('<nav>','<aside id="adopted-asymmetric-hair"><strong>사용자 채택 · 창법사 비대칭 헤어 2종</strong><p>01 오른쪽 비대칭 단발 / 03 오른쪽 비대칭 올림머리를 후속 헤어 기준으로 사용합니다. 왼쪽 복근형과 02 옆땋기는 별도 후보입니다.</p></aside><nav>');
 html=html.replace('01 · 하프업 / 비대칭 단발</h2>','01 · 하프업 / 비대칭 단발 — 오른쪽 헤어 채택</h2>').replace('03 · 레이어드컷 / 비대칭 올림머리</h2>','03 · 레이어드컷 / 비대칭 올림머리 — 오른쪽 헤어 채택</h2>');
 html=html.replace('사용자 채택 및 게임·3D 반영 전.','창법사 비대칭 헤어 2종 사용자 채택. 게임·3D 반영 전.');fs.writeFileSync(p,html);
 }
}
function g(args,env=process.env,input){const r=cp.spawnSync('git',args,{cwd:root,env,input,encoding:'utf8',windowsHide:true,maxBuffer:8e6});if(r.error||r.status!==0)throw Error('git '+args[0]+' '+(r.error||r.stderr||r.stdout));return r.stdout;}
(async()=>{
 const url='http://localhost:3333/output/character_style_variations_20261101/'+page,r=await fetch(url),data=Buffer.from(await r.arrayBuffer());
 if(r.status!==200||!data.equals(fs.readFileSync(path.join(out,page))))throw Error('page HTTP mismatch');
 if(hash(path.join(out,page))!==hash(path.join(desktop,page)))throw Error('page copies mismatch');
 g(['fetch','origin','main']);const main=g(['rev-parse','origin/main']).trim(),head=g(['rev-parse','HEAD']).trim(),index=path.resolve(root,g(['rev-parse','--git-path','index']).trim()),before=hash(index);if(fs.existsSync(index+'.lock'))throw Error('shared index lock');
 const parent='d95ade431cfe760d14f72fb7104298452f431d8b',prior='refs/heads/codex/backup-20261101-235912349-hairstyle-fullbody-sets';if(g(['ls-remote','origin',prior]).trim().split(/\s+/)[0]!==parent)throw Error('previous remote changed');
 const remoteArt=g(['show',parent+':'+art]),remoteRow=remoteArt.split(/\r?\n/).find(l=>l.startsWith('| 신규 헤어 전신 3세트 v14'));
 if(!remoteRow)throw Error('remote row missing');const mergedArt=remoteArt.replace(remoteRow,newRow);if(mergedArt.replace(newRow,remoteRow)!==remoteArt)throw Error('remote art preservation');
 const prefix='output/character_style_variations_20261101/';
 const files=[docPath,review,...fs.readdirSync(path.join(root,lib)).map(n=>lib+'/'+n),prefix+'spearmage_asymmetric_hair_approved_20261102.json',prefix+page,prefix+'approve-asymmetric-hair-20261102.cjs'],allowed=[art,...files];
 const parentReview=g(['show',parent+':'+review]);if(!fs.readFileSync(path.join(root,review),'utf8').startsWith(parentReview))throw Error('review unexpected changes');
 const tag=new Date().toISOString().replace(/[-:.]/g,'').replace('T','-').replace('Z',''),branch='codex/backup-'+tag+'-approved-asymmetric-hair',ref='refs/heads/'+branch,env={...process.env,GIT_INDEX_FILE:path.join(out,'hair-approval-'+tag+'.index')};
 g(['read-tree',parent],env);const blob=g(['hash-object','-w','--stdin'],env,mergedArt).trim();g(['update-index','--add','--cacheinfo','100644,'+blob+','+art],env);g(['add','--',...files],env);const tree=g(['write-tree'],env).trim();g(['diff','--check',parent,tree],env);
 const changed=g(['-c','core.quotepath=false','diff','--name-only',parent,tree],env).trim().split(/\r?\n/);if(changed.some(p=>!allowed.includes(p)))throw Error('unowned path');
 const commit=g(['commit-tree',tree,'-p',parent],env,'art: adopt two asymmetric Spearmage hairstyle references\n\nUser-selected bob and braided updo only. Preserve full source plates, selection regions, Korean SSOT and review status. No runtime integration.\n').trim();if(hash(index)!==before)throw Error('shared index changed');g(['update-ref',ref,commit,'0000000000000000000000000000000000000000']);g(['push','origin',ref+':'+ref]);const remote=g(['ls-remote','origin',ref]).trim().split(/\s+/)[0];if(remote!==commit)throw Error('remote mismatch');
 const receipt={approvedIds:selection.map(s=>s.id),branch,commit,remoteSha:remote,remoteVerified:true,observedOriginMain:main,sharedIndexUnchanged:hash(index)===before,checkoutHeadUnchanged:g(['rev-parse','HEAD']).trim()===head,pageHttp:200,runtimeApplied:false};
 for(const folder of [out,desktop])fs.writeFileSync(path.join(folder,'spearmage_asymmetric_hair_approved_20261102.backup.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
