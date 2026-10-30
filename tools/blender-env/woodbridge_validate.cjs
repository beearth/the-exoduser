const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('G:/exoduser/node_modules/sharp');
const r='I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2',d=r+'/delivery',kit=d+'/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(p+'/'+x.name):[p+'/'+x.name]);
(async()=>{
 const files=walk(d),metas=files.filter(x=>x.endsWith('.meta')),guidMap=new Map();
 for(const p of metas){const m=fs.readFileSync(p,'utf8').match(/^guid: (\w+)/m);if(!m||guidMap.has(m[1]))throw Error('누락/중복GUID '+p);guidMap.set(m[1],p);}
 let refs=0;for(const p of files.filter(x=>/\.mat$|\.fbx\.meta$/.test(x)))for(const m of fs.readFileSync(p,'utf8').matchAll(/guid: ([a-f0-9]{32})/g)){if(m[1]==='933532a4fcc9baf4fa0491de14d08ed7')continue;if(!guidMap.has(m[1]))throw Error('유실참조 '+p);refs++;}
 const rows=JSON.parse(fs.readFileSync(r+'/source/모듈명세.json','utf8')),reimport=JSON.parse(fs.readFileSync(r+'/FBX-재수입검사.json','utf8'));if(rows.length!==17||reimport.length!==17)throw Error('17종 불일치');
 const pixel=[];
 for(const row of rows){
  const id=row.id,model=kit+'/Models/'+id+'.fbx';if(!reimport.find(x=>x.id===id&&x.FBX_SHA256===sha(model)&&x.삼각형===row.삼각형))throw Error('현재FBX SHA 재수입 누락 '+id);
  for(const k of ['BaseColor','Normal','AO','Curvature','Roughness','Metallic','MetallicSmoothness']){
   const p=kit+'/Textures/'+id+'_'+k+'.png',meta=fs.readFileSync(p+'.meta','utf8'),md=await sharp(p).metadata();if(md.width!==row.텍스처해상도||md.height!==(row.텍스처높이||row.텍스처해상도))throw Error('텍스처 규격 '+p);
   if(!meta.includes('sRGBTexture: '+(k==='BaseColor'?1:0)))throw Error('색공간 '+p);
   if(k==='Normal'&&!meta.includes('textureType: 1'))throw Error('노멀 임포트 '+p);
   pixel.push({id,맵:k,sha256:sha(p),가로:md.width,세로:md.height});
  }
  const rr=await sharp(kit+'/Textures/'+id+'_Roughness.png').greyscale().raw().toBuffer(),mm=await sharp(kit+'/Textures/'+id+'_Metallic.png').greyscale().raw().toBuffer(),pack=await sharp(kit+'/Textures/'+id+'_MetallicSmoothness.png').ensureAlpha().raw().toBuffer();
  for(let i=0;i<rr.length;i++)if(pack[i*4]!==mm[i]||pack[i*4+3]!==255-rr[i])throw Error('R금속/A평활 패킹 불일치 '+id+' '+i);
  for(const suffix of ['','_side']){const md=await sharp(r+'/renders/'+id+suffix+'.png').metadata();if(md.width!==1600||md.height!==1000)throw Error('모듈 렌더 규격 '+id);}
  for(const suffix of ['_비교.png','_노레위비교.png'])if(!fs.existsSync(r+'/compare/'+id+suffix))throw Error('레퍼런스 비교 누락 '+id);
 }
 const scene=await sharp(r+'/승인구도_최종.png').metadata();if(scene.width!==1920||scene.height!==1080)throw Error('조립1080p 누락');
 const result={시각:new Date().toISOString(),모듈수:rows.length,삼각형합계:rows.reduce((s,x)=>s+x.삼각형,0),FBX:files.filter(x=>x.endsWith('.fbx')).length,PNG:pixel.length,재질:files.filter(x=>x.endsWith('.mat')).length,파일수:files.length,GUID수:guidMap.size,재질참조수:refs,중복GUID:0,유실GUID참조:0,최신FBX재수입:'PASS',패킹전픽셀:'PASS',정면측면:rows.length*2,개별원화비교:rows.length,개별노레위비교:rows.length,조립규격:'1920×1080',Unity실행:0,Player실행:0,검증경계:'납품 기술검사·Blender 정적 렌더. 실제 Unity 임포트·게임·탄막·충돌·성능·M1 미검증'};
 fs.writeFileSync(r+'/납품-기술검사.json',JSON.stringify(result,null,2));fs.writeFileSync(r+'/텍스처-현재SHA.json',JSON.stringify(pixel,null,2));console.log(result);
})().catch(e=>{console.error(e);process.exitCode=1});
