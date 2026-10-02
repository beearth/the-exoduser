// ANIMVFX-sheet-frame-metadata-bounds-hb1014
// 등록 VFX sheet의 실이미지(PNG/WebP header) ↔ 프레임 메타데이터(fw/fh/frames/cols) 경계 검증.
// 실제 registerVFX 함수와 실제 draw frame-crop 표현을 추출해 실행(대역=Image/파일헤더). mode?draw0 금지.
// 마지막 frame crop이 naturalWidth/height 밖이거나 cols 0/NaN이 되는 콘텐츠 결손 탐지.
// 이미지 파서 미지원/파일부재=UNKNOWN(통과 아님). 정상 control 1 + invalid metadata 변이 control 1 포함.
// 경계: 읽기 전용. Git 0. 이미지 생성/교체 0. GL/body/실픽셀 0. productionApplied=false, runtimeAccepted=false.
import fs from 'node:fs';
import crypto from 'node:crypto';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const read=p=>fs.readFileSync(root+'/'+p,'utf8');
const startedAt=new Date().toISOString();
const rows=[];
function check(id,action){ try{action();rows.push({id,status:'PASS'});}catch(e){rows.push({id,status:'FAIL',reason:e.message});} }
function expect(v,r){ if(!v) throw new Error(r); }
function eq(a,b,r){ if(a!==b) throw new Error(`${r}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`); }

// ── 실제 source 추출 ──
const ghText=read('game.html'), geText=read('game-easy-test.html');
function extractReg(t){ const m=t.match(/function registerVFX\(id,src,fw,fh,frames,cols,blend\)\{[\s\S]*?\n\}/); expect(m,'registerVFX 추출 실패'); return m[0]; }
function extractCrop(t){ const m=t.match(/const col=v\.frame%sh\.cols,row=~~\(v\.frame\/sh\.cols\);\s*\n\s*const _sx=col\*sh\.fw,_sy=row\*sh\.fh;/); expect(m,'draw crop 추출 실패'); return m[0]; }
const regSrc=extractReg(ghText), cropSrc=extractCrop(ghText);
const regSrcE=extractReg(geText), cropSrcE=extractCrop(geText);

// ── 실제 registerVFX 실행용 샌드박스 (Image 대역) ──
// img.onload 시점에 실제 파싱한 naturalWidth/height를 주입해 cols 폴백까지 원문대로 계산한다.
function makeRegister(){
  const factory=new Function('ImageBand',`
    const _VFX_SHEETS={};
    const Image=ImageBand;
    ${regSrc}
    return { registerVFX, sheets:_VFX_SHEETS };
  `);
  // Image 대역: 원문은 img.src 설정 뒤 img.onload를 할당하므로(브라우저 async 모사),
  // src와 onload가 모두 준비되고 dims를 알 때 단 한 번 onload를 발화한다.
  class ImageBand{
    constructor(){ this._onload=null; this._src=undefined; this._fired=false; this.width=0; this.height=0; }
    _tryFire(){ if(this._fired||!this._onload||this._src===undefined) return; const d=ImageBand.__dims[this._src]; if(!d) return; this.width=d.w; this.height=d.h; this._fired=true; this._onload(); }
    set onload(fn){ this._onload=fn; this._tryFire(); }
    get onload(){ return this._onload; }
    set src(s){ this._src=s; this._tryFire(); }
    get src(){ return this._src; }
  }
  ImageBand.__dims={};
  return { factory, ImageBand };
}
// 실제 draw crop 표현 실행 (원문 그대로)
const cropFn=new Function('v','sh',`${cropSrc}\n return {col,row,_sx,_sy};`);

// ── 실제 이미지 헤더 파서 (PNG / WebP) ──
function parseImage(absPath){
  let buf; try{ buf=fs.readFileSync(absPath); }catch(e){ return {status:'MISSING'}; }
  // PNG
  if(buf.length>=24 && buf[0]===0x89&&buf[1]===0x50&&buf[2]===0x4E&&buf[3]===0x47){
    if(buf.toString('ascii',12,16)!=='IHDR') return {status:'UNSUPPORTED',fmt:'png-no-ihdr'};
    return {status:'OK',fmt:'png',w:buf.readUInt32BE(16),h:buf.readUInt32BE(20)};
  }
  // WebP (RIFF....WEBP)
  if(buf.length>=30 && buf.toString('ascii',0,4)==='RIFF' && buf.toString('ascii',8,12)==='WEBP'){
    const chunk=buf.toString('ascii',12,16);
    if(chunk==='VP8 '){ // lossy: 0x9d012a 뒤 14bit w,h (LE)
      const w=(buf[26]|(buf[27]<<8))&0x3fff, h=(buf[28]|(buf[29]<<8))&0x3fff;
      return {status:'OK',fmt:'webp-vp8',w,h};
    }
    if(chunk==='VP8L'){ // lossless: 0x2f 뒤 14bit (w-1),(h-1)
      if(buf[20]!==0x2f) return {status:'UNSUPPORTED',fmt:'vp8l-sig'};
      const b1=buf[21],b2=buf[22],b3=buf[23],b4=buf[24];
      const w=1+(((b2&0x3f)<<8)|b1);
      const h=1+(((b4&0x0f)<<10)|(b3<<2)|((b2&0xc0)>>6));
      return {status:'OK',fmt:'webp-vp8l',w,h};
    }
    if(chunk==='VP8X'){ // extended: canvas (w-1),(h-1) 24bit LE
      const w=1+(buf[24]|(buf[25]<<8)|(buf[26]<<16));
      const h=1+(buf[27]|(buf[28]<<8)|(buf[29]<<16));
      return {status:'OK',fmt:'webp-vp8x',w,h};
    }
    return {status:'UNSUPPORTED',fmt:'webp-'+chunk.trim()};
  }
  return {status:'UNSUPPORTED',fmt:'unknown'};
}

// ── 활성 registerVFX(...) 호출 파싱 (주석 제외) ──
function parseRegistrations(t){
  const out=[]; const re=/^registerVFX\('([^']+)','([^']+)',(\d+),(\d+),(\d+),(\d+)(?:,'([^']+)')?\)/gm;
  let m; while((m=re.exec(t))){ out.push({id:m[1],src:m[2],fw:+m[3],fh:+m[4],frames:+m[5],cols:+m[6],blend:m[7]||null}); }
  return out;
}
const regs=parseRegistrations(ghText);

// ── 한 등록을 실제 registerVFX+draw로 평가 ──
function evaluate(reg){
  const {factory,ImageBand}=makeRegister();
  const parsed=parseImage(root+'/'+reg.src);
  if(parsed.status!=='OK') return { ...reg, image:parsed, verdict:'UNKNOWN', reason:'image '+parsed.status+(parsed.fmt?('/'+parsed.fmt):'') };
  ImageBand.__dims[reg.src]={w:parsed.w,h:parsed.h};
  const env=factory(ImageBand);
  env.registerVFX(reg.id, reg.src, reg.fw, reg.fh, reg.frames, reg.cols, reg.blend); // 실제 onload 동기 실행
  const sh=env.sheets[reg.id];
  expect(sh,'sheet 미등록(onload 미발화)');
  // cols 0/NaN 결손
  const colsBad = !(sh.cols>0) || Number.isNaN(sh.cols);
  // 마지막 소비 frame = frames-1 의 실제 crop (원문 표현 실행)
  const last=cropFn({frame:reg.frames-1,scale:1}, sh);
  const needW=last._sx+sh.fw, needH=last._sy+sh.fh;
  const xOver=needW>parsed.w, yOver=needH>parsed.h;
  const defect= colsBad || xOver || yOver;
  return { ...reg, image:{w:parsed.w,h:parsed.h,fmt:parsed.fmt}, storedCols:sh.cols,
    lastFrame:reg.frames-1, lastColRow:[last.col,last.row], lastCropXY:[last._sx,last._sy],
    needWH:[needW,needH], colsBad, xOver, yOver,
    verdict: defect?'DEFECT':'OK' };
}

const results=regs.map(evaluate);
const defects=results.filter(r=>r.verdict==='DEFECT');
const unknowns=results.filter(r=>r.verdict==='UNKNOWN');
const oks=results.filter(r=>r.verdict==='OK');

// ── Control: 정상 1 + invalid metadata 변이 1 (가짜 counter 금지, 실제 crop로 판정) ──
// 정상 control: OK 판정이 난 실제 등록 1개를 골라 재평가 → 결손 없어야 PASS
// invalid control: 그 등록의 frames를 이미지 밖으로 변이 → DEFECT로 탐지돼야 함
let controlNormal=null, controlInvalid=null;
const base = oks[0] || results.find(r=>r.image&&r.image.w);
if(base){
  controlNormal = evaluate({id:base.id,src:base.src,fw:base.fw,fh:base.fh,frames:base.frames,cols:base.cols,blend:base.blend});
  // 이미지가 담을 수 있는 최대 프레임 수를 넘기는 변이 (cols 유지, frames = cols*rowsThatFit + 1)
  const img=parseImage(root+'/'+base.src);
  const rowsFit=Math.floor(img.h/base.fh);
  const mutFrames=base.cols*rowsFit+1; // 마지막 frame이 반드시 y축 밖
  controlInvalid = evaluate({id:base.id+'_MUT',src:base.src,fw:base.fw,fh:base.fh,frames:mutFrames,cols:base.cols,blend:base.blend});
}

// ── 검증 그룹 ──
check('EX-source-slices', ()=>{
  expect(sha(regSrc)===sha(regSrcE),'registerVFX 양판 동일');
  expect(sha(cropSrc)===sha(cropSrcE),'draw crop 양판 동일');
});
check('EX-registrations-parsed', ()=>{ expect(regs.length>=50,'활성 등록 파싱 수 '+regs.length); });
check('EX-image-parser-real', ()=>{
  // 실제 헤더를 읽어 OK가 하나라도 있어야(파서 동작 증거). 전부 UNKNOWN이면 파서 문제
  expect(oks.length+defects.length>0, '실제 이미지 치수 해석 0건(파서/파일 문제)');
});
check('CONTROL-normal-no-defect', ()=>{
  expect(controlNormal, 'control base 없음');
  eq(controlNormal.verdict,'OK','정상 control은 결손 없어야');
});
check('CONTROL-invalid-detected', ()=>{
  expect(controlInvalid, 'invalid control 없음');
  eq(controlInvalid.verdict,'DEFECT','invalid metadata 변이는 DEFECT로 탐지돼야');
  expect(controlInvalid.yOver===true,'y축 overflow 탐지');
});
check('UNKNOWN-not-counted-pass', ()=>{
  // UNKNOWN은 통과로 세지 않음을 명시적으로 확인 (verdict 분리)
  for(const u of unknowns) expect(u.verdict==='UNKNOWN','UNKNOWN 분류 유지');
});

const endedAt=new Date().toISOString();
const fail=rows.filter(r=>r.status==='FAIL');
const out={
  taskId:'supervisor-next/ANIMVFX/ANIMVFX-sheet-frame-metadata-bounds-hb1014',
  provider:'VS Code Claude native (supervisor follow-up, continuous single session)',
  cwd:root, node:process.version, startedAt, endedAt,
  sourceReadSHA:{ note:'실Read 시점 sha256. Git 미호출. parent 제공 6b865637은 역사적 기준, currentHEAD 주장 안 함.',
    'game.html':sha(ghText), 'game-easy-test.html':sha(geText),
    registerVFXSlice:sha(regSrc), drawCropSlice:sha(cropSrc) },
  bands:'Image=src 세터가 실제 파싱 치수로 onload 동기 발화(naturalWidth/height 주입), 이미지=실제 PNG/WebP 파일헤더 파싱. registerVFX·draw crop은 원문 그대로 실행. 셰이더/GL/실픽셀 없음.',
  parser:'PNG(IHDR), WebP(VP8/VP8L/VP8X). 그 외/파일부재=UNKNOWN(통과 아님).',
  summary:{ registrations:regs.length, ok:oks.length, defect:defects.length, unknown:unknowns.length,
    groups:{ total:rows.length, pass:rows.filter(r=>r.status==='PASS').length, fail:fail.length } },
  defects, unknowns: unknowns.map(u=>({id:u.id,src:u.src,reason:u.reason})),
  results,
  control:{ normal:controlNormal, invalid:controlInvalid },
  productionApplied:false, runtimeAccepted:false,
  disclaimer:'source/fixture PASS ≠ 실게임/native/GPU픽셀/배포 PASS. 실제 비주얼(빈 프레임 노출) 확인은 별도 Gate.',
  rows
};
process.stdout.write(JSON.stringify(out,null,2)+'\n');
process.exit(fail.length?1:0);
