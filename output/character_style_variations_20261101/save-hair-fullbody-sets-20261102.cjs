const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=__dirname,desktop='C:/Users/심도진/Desktop/엑소듀서_검토/캐릭터_스타일변주_20261101';
const spec=JSON.parse(fs.readFileSync(path.join(root,'hair_fullbody_sets_20261102.input.json'),'utf8'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function writeNew(p,data){if(fs.existsSync(p)){if(!fs.readFileSync(p).equals(Buffer.from(data)))throw Error('existing differs '+p);}else fs.writeFileSync(p,data,{flag:'wx'});}
fs.mkdirSync(desktop,{recursive:true});
const records=[];
for(const item of [...spec.sets,spec.history]){
 const a=path.join(root,item.filename),b=path.join(desktop,item.filename),data=fs.readFileSync(item.source);
 writeNew(a,data);writeNew(b,data);
 const sha=hash(a);if(sha!==hash(b)||sha!==hash(item.source))throw Error('hash mismatch');
 const dims={width:data.readUInt32BE(16),height:data.readUInt32BE(20)};
 records.push({id:item.id||'history',filename:item.filename,source:item.source,project:a,desktop:b,sha256:sha,...dims});
}
const receipt={...spec,files:records,copySha256Verified:true,reviewedAt:new Date().toISOString()};
const receiptText=JSON.stringify(receipt,null,2)+'\n';
writeNew(path.join(root,'hair_fullbody_sets_20261102.receipt.json'),receiptText);
writeNew(path.join(desktop,'hair_fullbody_sets_20261102.receipt.json'),receiptText);
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const headings=['01 · 하프업 / 비대칭 단발','02 · 높은 포니테일 / 굵은 옆땋기','03 · 레이어드컷 / 비대칭 올림머리'];
const desc=['흑갈색 하프업과 짙은 자주 단발.','흑갈색 높은 포니테일과 보랏빛 굵은 옆땋기.','어깨 길이 레이어드컷과 회은색 앞머리가 섞인 올림머리.'];
const cards=spec.sets.map((v,i)=>'<article id="'+v.id+'"><header><h2>'+headings[i]+'</h2><p>'+desc[i]+' 왼쪽 복근형 · 오른쪽 창법사</p><a href="'+v.filename+'" target="_blank" rel="noopener">원본 1536 × 1024 열기 ↗</a></header><a href="'+v.filename+'" target="_blank" rel="noopener"><img src="'+v.filename+'" alt="'+escape(v.label)+' 여성 2인 전신 시안" width="1536" height="1024" '+(i?'loading="lazy"':'')+'></a></article>').join('\n');
const html='<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>새 머리스타일 · 여성 전신 3세트</title><style>body{margin:0;background:#16171b;color:#eee;font:16px/1.65 system-ui,sans-serif}main{max-width:1536px;margin:auto;padding:28px 22px}h1{font-size:clamp(24px,3vw,38px);margin-bottom:8px}p{margin:8px 0;color:#c7c9cf}a{color:#b8ceff;text-underline-offset:4px}nav{display:flex;gap:12px;flex-wrap:wrap;margin:24px 0}nav a{padding:8px 14px;border:1px solid #444754;border-radius:6px;text-decoration:none}article{margin:44px 0 70px;scroll-margin-top:20px}header{margin-bottom:14px}h2{font-size:24px;margin:0}img{display:block;width:100%;height:auto;border-radius:5px;background:#eee}aside{padding:14px 18px;background:#22242c;border-left:3px solid #8a9dcb;font-size:14px}footer{border-top:1px solid #343640;padding:24px 0;color:#aaa;font-size:14px}a:focus-visible{outline:3px solid #fff;outline-offset:4px}</style></head><body><main><h1>새 머리스타일 · 여성 전신 3세트</h1><p>각 캐릭터 3종, 총 6개 헤어 시안. 왼쪽은 복근·긴 바지·청색 단일 코어 장갑, 오른쪽은 복부 갑주·가슴선·한쪽 허벅지로 구분했습니다.</p><nav>'+spec.sets.map((s,i)=>'<a href="#'+s.id+'">'+headings[i]+'</a>').join('')+'</nav><aside>신규 헤어 검토 후보입니다. 창날 교정은 이미지 도구에서 거절되어 이번 전신판에는 손에 든 창을 제외했습니다. 승인된 마법창 공허 균열·성좌·월식은 <a href="비교보기.html#magic-spear-fantasy-v13">별도 정본</a>으로 유지합니다.</aside>'+cards+'<footer><a href="hair_fullbody_sets_20261102.receipt.json">원본 경로 · 전체 프롬프트 · 복사 해시</a> · <a href="비교보기.html">이전 시안 전체</a><p>사용자 채택 및 게임·3D 반영 전. 의상 소품과 얼굴 닮음에는 생성 편차가 있습니다.</p></footer></main></body></html>';
writeNew(path.join(root,'new_hairstyle_fullbody_sets.html'),html);writeNew(path.join(desktop,'new_hairstyle_fullbody_sets.html'),html);
const reviewName='비교보기.html',masterPath=path.join(root,reviewName),desktopMaster=path.join(desktop,reviewName);
const old=fs.readFileSync(masterPath,'utf8');if(old!==fs.readFileSync(desktopMaster,'utf8'))throw Error('review copies differ');
if(!old.includes('id="hair-fullbody-sets-v14"')){
 for(const d of [root,desktop])writeNew(path.join(d,'비교보기.before_hairstyle_sets_20261102.html'),old);
 const article='<article id="hair-fullbody-sets-v14"><h2>최신 · 신규 머리스타일 전신 3세트 / 6개 헤어</h2><p>왼쪽 복근형 · 오른쪽 창법사. 하프업/단발, 포니테일/옆땋기, 레이어드컷/올림머리. <a href="new_hairstyle_fullbody_sets.html">새 전신 세트만 비교하기 ↗</a>. 창은 제외한 헤어 검토판이며 승인 마법창 3종은 별도 유지합니다. 사용자 채택·게임 적용 전.</p><a href="new_hairstyle_fullbody_sets.html"><img src="'+spec.sets[2].filename+'" alt="레이어드컷과 비대칭 올림머리의 여성 두 명 전신"></a></article>';
 const next=old.replace('<article id="magic-spear-fantasy-v13">',article+'<article id="magic-spear-fantasy-v13">');
 if(next===old)throw Error('anchor missing');for(const p of [masterPath,desktopMaster])fs.writeFileSync(p,next);
}
console.log(JSON.stringify({saved:records.map(x=>({file:x.filename,sha256:x.sha256,width:x.width,height:x.height})),page:path.join(root,'new_hairstyle_fullbody_sets.html'),desktop,receiptSha:hash(path.join(root,'hair_fullbody_sets_20261102.receipt.json'))},null,2));
