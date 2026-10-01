import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {preflight} from './mac-package-preflight-cli.mjs';
const owned=path.dirname(fileURLToPath(import.meta.url));
function fixture(){
  const root=fs.mkdtempSync(path.join(owned,'mac-package-preflight-fixture-'));
  const source=path.join(root,'source'),output=path.join(root,'destinations'),app=path.join(root,'Runtime.app');
  fs.mkdirSync(source);fs.mkdirSync(output);fs.mkdirSync(path.join(app,'Contents/MacOS'),{recursive:true});
  fs.writeFileSync(path.join(source,'game.html'),'synthetic-only');fs.writeFileSync(path.join(app,'Contents/Info.plist'),'<plist/>');
  const binary=Buffer.alloc(32);binary.writeUInt32LE(0xfeedfacf);binary.writeUInt32LE(0x0100000c,4);fs.writeFileSync(path.join(app,'Contents/MacOS/nwjs'),binary);
  const hash=value=>createHash('sha256').update(value).digest('hex');
  const digest=hash('synthetic-only');
  const manifest={sourceRoot:source,outputRoot:output,arch:'arm64',outputName:'EXODUSER-mac-arm64-'+randomUUID(),inputs:[{path:'game.html',sha256:digest,backupSha256:digest}],backup:{localSha:'a'.repeat(40),remoteSha:'a'.repeat(40),remoteRef:'refs/heads/fixture-only',verifiedAt:'2026-10-01T00:00:00Z'},runtime:{appPath:app,sha256:hash(binary)}};
  return {root,source,output,app,manifest,remove:()=>fs.rmSync(root,{recursive:true,force:true})};
}
test('정상 fixture dry-run·실제출력생성0·소스불변',()=>{const state=fixture();try{const before=fs.readFileSync(path.join(state.source,'game.html'));const report=preflight(state.manifest);assert.equal(report.status,'PASS_DRY_RUN');assert.equal(report.packageCreated,false);assert.equal(fs.existsSync(path.join(state.output,state.manifest.outputName)),false);assert.deepEqual(fs.readFileSync(path.join(state.source,'game.html')),before);}finally{state.remove();}});
const mutations={
  '출력충돌':state=>fs.mkdirSync(path.join(state.output,state.manifest.outputName)),
  '입력SHA불일치':state=>fs.writeFileSync(path.join(state.source,'game.html'),'changed'),
  '원격commit불일치':state=>state.manifest.backup.remoteSha='b'.repeat(40),
  '원격입력SHA불일치':state=>state.manifest.inputs[0].backupSha256='b'.repeat(64),
  '원격조회시각없음':state=>delete state.manifest.backup.verifiedAt,
  '원격ref미확인':state=>state.manifest.backup.remoteRef='UNKNOWN',
  '빈입력목록':state=>state.manifest.inputs=[],
  '세이브포함':state=>state.manifest.inputs[0].path='saves/player.json',
  '프로필포함':state=>state.manifest.inputs[0].path='userdata/Preferences',
  '기존실행본포함':state=>state.manifest.inputs[0].path='Original.app/Contents/MacOS/nwjs',
  '비밀환경포함':state=>state.manifest.inputs[0].path='.env',
  '입력경로탈출':state=>state.manifest.inputs[0].path='../outside',
  '절대입력':state=>state.manifest.inputs[0].path='/etc/hosts',
  '출력경로탈출':state=>state.manifest.outputName='../original',
  '입력symlink':state=>{fs.renameSync(path.join(state.source,'game.html'),path.join(state.source,'original.html'));fs.symlinkSync('original.html',path.join(state.source,'game.html'));},
  '입력부모symlink':state=>{fs.symlinkSync(state.source,path.join(state.root,'link'));state.manifest.sourceRoot=path.join(state.root,'link');},
  '출력부모symlink':state=>{fs.symlinkSync(state.output,path.join(state.root,'link'));state.manifest.outputRoot=path.join(state.root,'link');},
  'dangling출력symlink':state=>fs.symlinkSync('missing',path.join(state.output,state.manifest.outputName)),
  '입력hardlink':state=>fs.linkSync(path.join(state.source,'game.html'),path.join(state.source,'alias.html')),
  'runtime없음':state=>delete state.manifest.runtime,
  'runtime아키텍처다름':state=>{state.manifest.arch='x64';state.manifest.outputName='EXODUSER-mac-x64-'+randomUUID();},
  'runtimeSHA다름':state=>state.manifest.runtime.sha256='b'.repeat(64),
  'runtimebinarysymlink':state=>{const binary=path.join(state.app,'Contents/MacOS/nwjs');fs.renameSync(binary,binary+'-original');fs.symlinkSync('nwjs-original',binary);},
  '폴더입력':state=>{fs.mkdirSync(path.join(state.source,'assets'));state.manifest.inputs[0].path='assets';},
  '중복입력':state=>state.manifest.inputs.push({...state.manifest.inputs[0]})
};
for(const [name,mutate] of Object.entries(mutations))test(name+' 거부',()=>{const state=fixture();try{mutate(state);const report=preflight(state.manifest);assert.equal(report.status,'BLOCKED');assert(report.checks.some(check=>!check.pass));assert.equal(report.packageCreated,false);}finally{state.remove();}});
test('x64 thin Mach-O 헤더 fixture',()=>{const state=fixture();try{state.manifest.arch='x64';state.manifest.outputName='EXODUSER-mac-x64-'+randomUUID();const binary=Buffer.alloc(32);binary.writeUInt32LE(0xfeedfacf);binary.writeUInt32LE(0x01000007,4);fs.writeFileSync(path.join(state.app,'Contents/MacOS/nwjs'),binary);state.manifest.runtime.sha256=createHash('sha256').update(binary).digest('hex');assert.equal(preflight(state.manifest).status,'PASS_DRY_RUN');}finally{state.remove();}});
test('실제CLI JSON/종료코드·실행옵션미제공',()=>{const state=fixture();try{const manifestPath=path.join(state.root,'manifest.json');fs.writeFileSync(manifestPath,JSON.stringify(state.manifest));const cli=path.join(owned,'mac-package-preflight-cli.mjs');const pass=spawnSync(process.execPath,[cli,manifestPath],{encoding:'utf8'});assert.equal(pass.status,0);assert.equal(JSON.parse(pass.stdout).status,'PASS_DRY_RUN');const reject=spawnSync(process.execPath,[cli,'--execute',manifestPath],{encoding:'utf8'});assert.equal(reject.status,2);assert.equal(JSON.parse(reject.stdout).status,'BLOCKED');}finally{state.remove();}});
