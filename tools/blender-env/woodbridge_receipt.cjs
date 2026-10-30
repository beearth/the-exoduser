const fs=require('fs'),path=require('path'),cp=require('child_process'),crypto=require('crypto');
const r='I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2',wt='G:/exoduser-wt/codex-blender-env',base='I:/EXODUSER-Storage/demo-art/blender-env/forest-r1';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const git=args=>{const x=cp.spawnSync('git',args,{cwd:wt,encoding:'utf8',windowsHide:true});if(x.status!==0)throw Error(x.stderr);return x.stdout.trim();};
const rows=JSON.parse(fs.readFileSync(r+'/source/모듈명세.json','utf8'));
const start=JSON.parse(fs.readFileSync(r+'/시작-보존.json','utf8'));let preserved=0;
for(const f of JSON.parse(fs.readFileSync(base+'/납품-파일영수증.json','utf8')).파일){const p=base+'/delivery/'+f.경로;if(sha(p)!==f.sha256)throw Error('이전 납품 변경 '+p);preserved++;}
for(const s of start.사본)if(sha(base+'/'+s.경로)!==s.sha256)throw Error('원본 변경 '+s.경로);
if(sha(wt+'/tools/guard.baseline.json')!==start.guardSHA)throw Error('시작 guard WIP 변경');
const source=['bark_brown_02_Diffuse.jpg','bark_brown_02_Rough.jpg','fine_grained_wood_Diffuse.jpg','fine_grained_wood_Rough.jpg','burned_ground_01_Diffuse.jpg'].map(n=>({경로:base+'/pbr-source/'+n,sha256:sha(base+'/pbr-source/'+n),공식출처:'https://polyhaven.com/a/'+n.split('_Diffuse')[0].split('_Rough')[0],라이선스:'https://polyhaven.com/license - CC0, 2026-10-30 공식 페이지 재확인'}));
const scan='I:/EXODUSER-Storage/demo-art/map/r2/source/r2_one_mass_lod_baked.blend';source.push({경로:scan,sha256:sha(scan),원본:['Poly Haven tree_stump_01','Poly Haven dead_tree_trunk_02'],라이선스:'기존 map/r2 CC0 인수 원본. 원본 read-only·자기 사본에서만 편집'});
fs.writeFileSync(r+'/출처-현행대조.json',JSON.stringify({시각:new Date().toISOString(),원본:source,이전납품보존:preserved,기존원본3개SHA보존:true,guardWIP_SHA:start.guardSHA,유료생성:0,구매:0},null,2));
const manifest={시각:new Date().toISOString(),브랜치:git(['branch','--show-current']),HEAD:git(['rev-parse','HEAD']),자산경로:r+'/delivery/Assets',원본경로:r+'/source',자산:'FBX17/재질17/PNG119/메타 포함310파일',모듈수:rows.length,삼각형합계:rows.reduce((s,x)=>s+x.삼각형,0),이전납품변경:0,Unity실행:0,Player실행:0,상속Runtime병합요청:false,기술:fs.existsSync(r+'/납품-기술검사.json')?JSON.parse(fs.readFileSync(r+'/납품-기술검사.json','utf8')):null};
fs.writeFileSync(r+'/최종-인계영수증.json',JSON.stringify(manifest,null,2));console.log(JSON.stringify({모듈:rows.map(x=>[x.id,x.삼각형,x.텍스처해상도]),삼각형합계:manifest.삼각형합계,이전납품보존:preserved,guardWIP:'SHA 동일'},null,2));
