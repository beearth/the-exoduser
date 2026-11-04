import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function inside(root,relative){const full=path.resolve(root,relative),prefix=path.resolve(root)+path.sep;if(!full.startsWith(prefix))throw new Error('정본 조각 경계 이탈');return full;}
export function assembleRecovery(root,manifest){
  const parts=manifest.parts.map(row=>{const input=inside(root,row.path);if(fs.lstatSync(input).isSymbolicLink())throw new Error('정본 조각 연결 금지');const b=fs.readFileSync(input);if(b.length!==row.bytes||hash(b)!==row.sha256)throw new Error('정본 조각 불일치: '+row.path);return b;});
  const result=Buffer.concat(parts);if(result.length!==manifest.bytes||hash(result)!==manifest.sha256)throw new Error('영상 정본 불일치');return result;
}
export function buildMediaPath(buildRoot,destination){
  const root=path.resolve(buildRoot),expected=path.resolve('I:/EXODUSER-Storage/map25d/a2r-build-keyshot');
  if(root.toLowerCase()!==expected.toLowerCase())throw new Error('지정 빌드 폴더만 허용');
  if(!/^Assets\/StreamingAssets\/Lobby\/[a-zA-Z0-9_.-]+\.mp4$/.test(destination))throw new Error('영상 목적지 경계 이탈');
  return path.join(root,'EXODUSER-A2R_Data','StreamingAssets','Lobby',path.posix.basename(destination));
}
export function prepareBuild(project,buildRoot){
  const native=JSON.parse(fs.readFileSync(path.join(buildRoot,'build.json'),'utf8'));
  if(native.result!=='Succeeded'||native.errors!==0)throw new Error('성공한 실제 Unity 빌드가 필요');
  const rows=[];
  for(const name of ['world-intro-v23-newopening-canonical','warrior-story-v23']){
    const root=path.join(project,'Tools','MediaRecovery',name),manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.json'),'utf8'));
    const dest=buildMediaPath(buildRoot,manifest.destination),data=assembleRecovery(root,manifest);
    fs.mkdirSync(path.dirname(dest),{recursive:true});if(fs.existsSync(dest)&&fs.lstatSync(dest).isSymbolicLink())throw new Error('영상 목적지 연결 금지');
    fs.writeFileSync(dest,data);if(hash(fs.readFileSync(dest))!==manifest.sha256)throw new Error('기록된 정본 영상 불일치');
    rows.push({file:path.basename(dest),bytes:data.length,sha256:manifest.sha256,parts:manifest.parts.length});
  }
  const receipt={passed:true,scope:'Git 정본 조각 복원, 재인코딩·프로젝트 에셋 수정 없음. 전체 빌드 해시 검사가 아님',rows};
  fs.writeFileSync(path.join(buildRoot,'keyshot-media.json'),JSON.stringify(receipt,null,2));return receipt;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const args=process.argv.slice(2),project=args[args.indexOf('--project')+1],build=args[args.indexOf('--build')+1];
  if(!args.includes('--project')||!args.includes('--build'))throw new Error('사용법: prepare-build.mjs --project <unity> --build <a2r-build-keyshot>');
  console.log(JSON.stringify(prepareBuild(project,build)));
}
