const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('G:/exoduser/node_modules/sharp');
const r='I:/EXODUSER-Storage/demo-art/blender-env/forest-r1',d=r+'/delivery';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(x=>x.isDirectory()?walk(p+'/'+x.name):[p+'/'+x.name]);
(async()=>{
 const files=walk(d),metas=files.filter(x=>x.endsWith('.meta')),guidMap=new Map();
 for(const p of metas){const m=fs.readFileSync(p,'utf8').match(/^guid: (\w+)/m);if(!m)throw Error('GUID 누락 '+p);if(guidMap.has(m[1]))throw Error('중복 GUID '+p);guidMap.set(m[1],p);}
 const refs=[];for(const p of files.filter(x=>/\.mat$|\.fbx\.meta$/.test(x)))for(const m of fs.readFileSync(p,'utf8').matchAll(/guid: ([a-f0-9]{32})/g)){if(m[1]==='933532a4fcc9baf4fa0491de14d08ed7')continue;if(!guidMap.has(m[1]))throw Error('유실 참조 '+p+' '+m[1]);refs.push(m[1]);}
 const rows=JSON.parse(fs.readFileSync(r+'/source/모듈명세.json','utf8'));const reimport=JSON.parse(fs.readFileSync(r+'/FBX-재수입검사.json','utf8'));
 for(const a of rows){const model=d+'/Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Models/'+a.id+'.fbx';const digest=crypto.createHash('sha256').update(fs.readFileSync(model)).digest('hex');if(!reimport.find(x=>x.id===a.id&&x.삼각형===a.삼각형&&x.FBX_SHA256===digest))throw Error('다른 후보 재수입 영수증 '+a.id);for(const postfix of ['','.meta'])if(!fs.existsSync(model+postfix))throw Error('FBX 누락');
  for(const tail of ['','_side']){const p=r+'/renders/'+a.id+tail+'.png';const m=await sharp(p).metadata();if(m.width!==1600||m.height!==1000)throw Error('렌더 규격 '+p);}
  if(!fs.existsSync(r+'/compare/'+a.id+'_비교.png'))throw Error('비교 누락 '+a.id);
 }
 const result={시각:new Date().toISOString(),모듈수:rows.length,삼각형합계:rows.reduce((s,x)=>s+x.삼각형,0),파일수:files.length,GUID수:guidMap.size,재질참조수:refs.length,중복GUID:0,유실GUID참조:0,렌더규격:'1600×1000 정면·측면 22장',개별레퍼런스비교:11,Unity실행:0,판정경계:'파일 연결·FBX Blender 재수입 검사. Unity 임포트·GPU·실게임 QA 미검증'};
 fs.writeFileSync(r+'/납품-기술검사.json',JSON.stringify(result,null,2));console.log(result);
})().catch(e=>{console.error(e);process.exitCode=1});
