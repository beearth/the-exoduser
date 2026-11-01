const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=__dirname,desktop='C:/Users/심도진/Desktop/엑소듀서_검토/캐릭터_스타일변주_20261101';
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const rp=path.join(root,'hair_fullbody_sets_20261102.receipt.json'),receipt=JSON.parse(fs.readFileSync(rp));
for(const folder of [root,desktop]){
 const p=path.join(folder,'new_hairstyle_fullbody_sets.html');let text=fs.readFileSync(p,'utf8');
 text=text.replace('원본 1536 × 1024 열기 ↗','원본 1535 × 1024 열기 ↗').replace('width="1536" height="1024" ','width="1535" height="1024" ');
 fs.writeFileSync(p,text);
}
receipt.review.observed=receipt.review.observed.replace('3枚','3개');
for(const folder of [root,desktop])fs.writeFileSync(path.join(folder,'hair_fullbody_sets_20261102.receipt.json'),JSON.stringify(receipt,null,2)+'\n');
const doc='G:/exoduser/docs/17게임아트팀/CHARACTER_STYLE_VARIATIONS_REVIEW_20261101.md',master='G:/exoduser/docs/17게임아트팀/ART_TEAM_MASTER.md';
const section="\n\n## 2026-11-02 신규 머리스타일 전신 3세트 v14\n\n사용자 “신규 머리스타일로 전신 세트 몇게 만들어봐 둘다”에 따라 성인 여성 2인 전신 비교판 3세트, 총 6개 헤어 후보를 생성했다. 왼쪽은 원이 참고 얼굴의 복근형·긴 바지·인물 왼팔 청색 단일 코어 장갑, 오른쪽은 별도 얼굴의 창법사·복부 갑주·가슴선과 한쪽 허벅지로 구분했다. 신규 헤어는 사용자 미채택 후보다.\n\n| 세트 | 복근형 (왼쪽) | 창법사 (오른쪽) | 파일 | 실제 PNG 규격 |\n|---|---|---|---|---|\n| 01 | 긴 흑갈색 하프업 | 짙은 자주 비대칭 단발 | `hair_fullbody_set01_halfup_bob.png` | 1535×1024 |\n| 02 | 높은 흑갈색 포니테일·옆땋기 | 보라색 굵은 옆땋기 | `hair_fullbody_set02_ponytail_sidebraid.png` | 1536×1024 |\n| 03 | 어깨 길이 흑갈색 레이어드컷 | 비대칭 올림머리·회은색 앞머리 | `hair_fullbody_set03_layered_braidedupdo.png` | 1536×1024 |\n\n내장 `image_gen` 편집으로 생성했으며 모델 ID·비용은 미노출이다. 첫 세트 초안의 창이 승인 전 단순 원판형으로 돌아가 `hair_fullbody_history_set01_old_disc.png`로 보존했다. 창날 교정은 `moderation_blocked / violence`로 거절됐다(request `0ffad6e4-29f1-4389-8b78-6a761d419819`, 교정 출력 없음). 이후 요청 범위를 머리·전신 비교로 줄이고 손에 든 창을 제외한 3세트를 제작했다. 승인 마법창 3종의 정본은 변경하지 않았다. 승인 무기 반영 전신으로 보고하지 않는다.\n\n실제 그림에서 머리부터 신발까지 보이고 세트별 헤어 실루엣과 두 의상 역할을 확인했다. 다만 금테·버클·찢긴 망토 등 소품이 프롬프트보다 많고 얼굴 닮음·얼굴 구별은 사용자 검토가 필요하다. 게임·3D·공격동작·동일 게임 카메라 품질 검증은 하지 않았다.\n\n프로젝트 `output/character_style_variations_20261101/`와 바탕화면 `엑소듀서_검토/캐릭터_스타일변주_20261101/`에 PNG·전체 실제 프롬프트·입력 참조·해시 영수증을 저장했다. 원본/프로젝트/바탕화면 PNG SHA-256 일치 확인. `new_hairstyle_fullbody_sets.html`에서 3세트를 비교하고 `비교보기.html` 최상단에서도 진입한다. 이전 HTML은 `비교보기.before_hairstyle_sets_20261102.html`로 보존했다. 저장/검증 도우미는 `save-hair-fullbody-sets-20261102.cjs`, `finalize-hair-fullbody-sets-20261102.cjs`이며 게임 런타임 코드는 수정하지 않았다.\n";
if(!fs.readFileSync(doc,'utf8').includes('## 2026-11-02 신규 머리스타일 전신 3세트 v14'))fs.appendFileSync(doc,section);
let m=fs.readFileSync(master,'utf8');
const anchor='| 마법창 외형 3종 v13 (2026-11-02) |';
if(!m.includes('| 신규 헤어 전신 3세트 v14')){
 const row="| 신규 헤어 전신 3세트 v14 (2026-11-02) | 🟡 여성 2인 × 3판, 총 6개 헤어 후보. 복근형/창법사 구분. 하프업/단발·포니테일/옆땋기·레이어드컷/올림머리. 창날 교정 거절로 최종 비교판은 창 제외. 원본·전체 프롬프트·동일 해시 사본·`new_hairstyle_fullbody_sets.html` 저장. 사용자 채택·게임/3D 적용 전 — [생성 이력](CHARACTER_STYLE_VARIATIONS_REVIEW_20261101.md) |\n";if(!m.includes(anchor))throw Error('master anchor missing');m=m.replace(anchor,row+anchor);fs.writeFileSync(master,m);
}
(async()=>{
 const names=['new_hairstyle_fullbody_sets.html',...receipt.sets.map(s=>s.filename),'hair_fullbody_sets_20261102.receipt.json'],http=[];
 for(const name of names){
 const url='http://localhost:3333/output/character_style_variations_20261101/'+name,r=await fetch(url),data=Buffer.from(await r.arrayBuffer());
 if(r.status!==200)throw Error('HTTP '+r.status+' '+name);
 if(!data.equals(fs.readFileSync(path.join(root,name))))throw Error('HTTP bytes differ '+name);
 if(hash(path.join(root,name))!==hash(path.join(desktop,name)))throw Error('desktop differs '+name);
 http.push({name,status:r.status,bytes:data.length});
 }
 const v={createdAt:new Date().toISOString(),http,shaCopiesMatch:true,scope:'Saved candidates only; no game runtime or 3D integration'};
 for(const folder of [root,desktop])fs.writeFileSync(path.join(folder,'hair_fullbody_sets_20261102.verify.json'),JSON.stringify(v,null,2)+'\n');
 console.log(JSON.stringify(v,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
