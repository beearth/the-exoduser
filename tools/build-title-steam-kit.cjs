const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const sharp=require(require.resolve('sharp',{paths:[process.cwd(),'G:/exoduser']}));
const src='G:/exoduser/tmp/design-review/20261031_title_signboard/A';
const out='G:/exoduser/tmp/design-review/20261031_title_signboard/steam_kit';
const evidence='I:/EXODUSER-Storage/codex-takeover/title-signboard/steam-kit';
const master=src+'/master-7680x2160.png',logo='img/logo_exoduser_solid.png';
const rows=[];
async function save(name,buf,use,layout){fs.writeFileSync(out+'/'+name,buf);const m=await sharp(buf).metadata();rows.push({file:name,width:m.width,height:m.height,use,layout,sha256:crypto.createHash('sha256').update(buf).digest('hex')});}
async function brand(image,w,h,box){
 const input=await sharp(logo).resize(box.w,box.h||Math.round(box.w*719/1506),{fit:'inside'}).png().toBuffer();const m=await sharp(input).metadata();
 // Local shadow follows the logo alpha. No opaque rectangular backing.
 const sh=await sharp(input).tint('#000000').blur(Math.max(2,w/180)).png().toBuffer();
 return sharp(image).composite([{input:sh,left:box.x+1,top:box.y+Math.max(1,Math.round(w/400))},{input,left:box.x,top:box.y}]).png().toBuffer();
}
async function landscape(w,h){return sharp(master).resize(w,h,{fit:'cover',position:'centre'}).png().toBuffer();}
async function portrait(w,h){
 // Recompose the approved character over the clean A plate; do not stretch/crop the hero.
 const bg=await sharp(src+'/layers/background-plate.png').extract({left:2350,top:0,width:1800,height:2160}).resize(w,h,{fit:'cover',position:'top'}).png().toBuffer();
 const joined=await sharp(src+'/layers/contact-rock.png').composite([{input:src+'/layers/silvertail.png'}]).png().toBuffer();
 const hero=await sharp(joined).trim({background:'#00000000',threshold:1}).resize({height:Math.round(h*.64),width:Math.round(w*.93),fit:'inside'}).png().toBuffer();const m=await sharp(hero).metadata();
 const shade=Buffer.from(`<svg width="${w}" height="${h}"><defs><linearGradient id="g" x2="0" y2="1"><stop stop-color="#050508" stop-opacity=".22"/><stop offset=".65" stop-color="#050508" stop-opacity="0"/><stop offset="1" stop-color="#050508" stop-opacity=".5"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/></svg>`);
 const y=h-m.height-Math.round(h*.025),x=Math.round((w-m.width)/2+w*.025);
 return sharp(bg).composite([{input:hero,left:x,top:y},{input:shade}]).png().toBuffer();
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});fs.mkdirSync(evidence,{recursive:true});
 const hero=await landscape(3840,1240);await save('library_hero_3840x1240.jpg',await sharp(hero).jpeg({quality:97,chromaSubsampling:'4:4:4'}).toBuffer(),'Steam Library Hero','로고 없음, 중앙 수직 크롭');
 await save('library_logo.png',await sharp(logo).trim().resize(1280,720,{fit:'inside'}).png().toBuffer(),'Steam Library Logo','투명 PNG, 원본 로고 종횡비 유지');
 for(const [name,w,h,x,y,lw] of [['header_capsule',920,430,38,194,352],['main_capsule',1232,706,48,310,470]]){
  const art=await landscape(w,h);await save(`${name}_${w}x${h}.jpg`,await sharp(await brand(art,w,h,{x,y,w:lw})).jpeg({quality:97,chromaSubsampling:'4:4:4'}).toBuffer(),'Steam '+name,'인물 우측·달 상단, 로고 좌측 중하단');
 }
 for(const [name,w,h] of [['vertical_capsule',748,896],['library_capsule',600,900]]){
  const art=await portrait(w,h);await save(`${name}_${w}x${h}.jpg`,await sharp(await brand(art,w,h,{x:Math.round(w*.09),y:Math.round(h*.025),w:Math.round(w*.82)})).jpeg({quality:97,chromaSubsampling:'4:4:4'}).toBuffer(),'Steam '+name,'클린 배경과 동일 실버테일 레이어 재구성, 로고 상단');
 }
 await save('page_background_1438x810.jpg',await sharp(await landscape(1438,810)).jpeg({quality:97,chromaSubsampling:'4:4:4'}).toBuffer(),'Steam Page Background','로고 없음');
 const masterBytes=fs.readFileSync(master);await save('contest_master_7680x2160_nologo.png',masterBytes,'공모전·보도용 원본','승인 A 원본 bytes 동일');
 await save('contest_master_7680x2160_logo.png',await brand(masterBytes,7680,2160,{x:192,y:192,w:1040}),'공모전·보도용 로고판','32:9 원화 좌상단 로고');
 const four=await landscape(3840,2160);await save('contest_4k_3840x2160_nologo.png',four,'공모전·홍보용 4K','16:9 중앙 크롭');
 await save('contest_4k_3840x2160_logo.png',await brand(four,3840,2160,{x:144,y:190,w:880}),'공모전·홍보용 4K 로고판','16:9 좌측 로고');
 const poster=await portrait(2160,3240);await save('contest_poster_2160x3240_nologo.png',poster,'공모전·홍보용 세로 포스터','배경·인물 재구성');
 await save('contest_poster_2160x3240_logo.png',await brand(poster,2160,3240,{x:194,y:81,w:1772}),'공모전·홍보용 세로 포스터 로고판','상단 로고, 인물 발 아래 접지');
 const prior='img/lording/library_hero_3840x1240.jpg';
 if(fs.existsSync(prior)){
  const old=await sharp(prior).resize(1920,620).png().toBuffer(),current=await sharp(hero).resize(1920,620).png().toBuffer();
  await sharp({create:{width:3840,height:660,channels:3,background:'#101014'}}).composite([{input:old,left:0,top:40},{input:current,left:1920,top:40},{input:Buffer.from('<svg width="3840" height="40"><text x="24" y="28" font-size="22" fill="#eee">PREVIOUS LIBRARY HERO</text><text x="1944" y="28" font-size="22" fill="#eee">APPROVED A</text></svg>'),left:0,top:0}]).png().toFile(out+'/compare_library_hero.png');
 }
 fs.writeFileSync(out+'/manifest.json',JSON.stringify({approved:'A',sourceMasterSHA256:crypto.createHash('sha256').update(masterBytes).digest('hex'),note:'업스케일된 승인 원본. 네이티브 8K 생성 아님. 게시·업로드 실행 없음.',files:rows},null,2)+'\n');
 const readme='# 승인 A — Steam·공모전 키트\n\n게시·업로드하지 않은 로컬 파일입니다. Steam 라이브러리 Hero/페이지 배경에는 로고가 없습니다. 인물·로고를 늘이지 않고 규격별로 재배치했습니다.\n\n| 파일 | 크기 | 용도 | 배치 |\n|---|---|---|---|\n'+rows.map(r=>`| ${r.file} | ${r.width}×${r.height} | ${r.use} | ${r.layout} |`).join('\n')+'\n\n원본 마스터는 승인 A와 SHA-256 동일. 7680×2160은 승인 원본의 출력 규격이며 네이티브 8K 생성으로 표기하지 않습니다. 비교: compare_library_hero.png(좌 기존 / 우 A).\n';
 fs.writeFileSync(out+'/README.md',readme);fs.writeFileSync(evidence+'/manifest.json',fs.readFileSync(out+'/manifest.json'));
 // Review contact sheet; full-size deliverables remain above.
 const panels=[];for(const r of rows){const p=await sharp(out+'/'+r.file).resize(600,400,{fit:'contain',background:'#151519'}).png().toBuffer();panels.push(p);}
 await sharp({create:{width:2400,height:1600,channels:3,background:'#151519'}}).composite(panels.map((input,i)=>({input,left:(i%4)*600,top:Math.floor(i/4)*400}))).jpeg({quality:95}).toFile(evidence+'/contact-sheet.jpg');
 console.log(JSON.stringify({out,files:rows.length,dimensions:rows.map(r=>[r.file,r.width,r.height])}));
})().catch(e=>{console.error(e);process.exitCode=1;});
