# QA — UI03 병행 후속 원문

> 읽기 전용 분석/후보 코드. 총괄의 별도 적용·검사 전에는 실행/채택 완료가 아니다. 후속 정정이 앞선 문구보다 우선한다.

## 2026-10-01T06:09:30.517Z

원자료(`first-kill-raw.json`)와 `game.html` 실제 함수를 직접 Read해 대조한 뒤, 중복 합산 없이 분리 계측하는 **적용 전 패치 후보**를 작성했습니다. 실행·적용·파일변경은 하지 않았습니다.

## 1) 원자료 대조 (실제 Read 결과)

- `slow_window_calls`의 포함시간 3개는 **포함 관계**다: `_worldDropFxTile`(20.9ms) ⊇ `_maskWorldDropBlack`(20.8ms) ⊇ `2d.getImageData 512²`(19.3ms). **단순 합산 시 삼중 계상** → 분리 계측 필요.
- 2번째 miss: `_worldDropFxTile`13.8 ⊇ `_maskWorldDropBlack`13.8 ⊇ `getImageData`13.5. 또 `getImageData 512² 3.6ms, parent:null`(start 156469.8)이 **부모 귀속 없이** 1건 — 외부 프로브가 렉시컬 호출의 부모를 못 잡은 사각(아래 제약 참조).
- `probe_missing:["_worldDropSkin"]` = 실제 함수명은 `_worldItemSkin`(game.html:26386). 이름 불일치로 **아이템 스킨 마스킹 경로는 이번 실측에서 미계측**.
- 코드 구조: 마스킹 캐시가 **두 경로** — ①`_worldDropFxTile`→`_worldDropFxTiles[frame][tile]`(빔 타일, 26375 hit / 26380~ miss) ②`_worldItemSkin`→`img._worldDropMasked`(26405~, renderSrc별 재사용).

## 2) 패치 후보 — in-source 계측 (game.html 26359~26411 대체 후보)

`window.__qaWD` 미설정 시 완전 무효(게임시간·효과 불변, 진단 필터 규칙 준수). 각 구간은 **disjoint self/phase만** 기록 → 합산은 leaf self의 합으로만.

```javascript
// ── QA 계측 훅(진단 전용). window.__qaWD={records:[]} 설정 시에만 활성. 중복합산 방지: inclusive 기록 안 함, self/phase(상호 배타)만 기록 ──
function _qaWD(){return (typeof window!=='undefined') && window.__qaWD;}
function _qaWDpush(r){const q=_qaWD(); if(q){ r.t=performance.now(); q.records.push(r);} }

// 생성 원본은 검정 배경이 불투명 → 검정·암부를 알파로 변환
function _maskWorldDropBlack(canvas){
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  const _q=_qaWD(); let _t0=0,_tRead=0,_tLoop=0;
  try{
    if(_q)_t0=performance.now();
    const data=ctx.getImageData(0,0,canvas.width,canvas.height),px=data.data; // readback(CPU 대기) — GPU 아님
    if(_q)_tRead=performance.now();
    for(let i=0;i<px.length;i+=4){
      const light=Math.max(px[i],px[i+1],px[i+2]);
      if(light<=24)px[i+3]=0;
      else if(light<72)px[i+3]=Math.round(px[i+3]*(light-24)/48);
    }
    if(_q)_tLoop=performance.now();
    ctx.putImageData(data,0,0);
    if(_q)_qaWDpush({fn:'mask',w:canvas.width,h:canvas.height,
      readMs:_tRead-_t0, loopMs:_tLoop-_tRead, putMs:performance.now()-_tLoop}); // 3구간 상호 배타
  }catch(_maskErr){ if(_q)_qaWDpush({fn:'mask',err:1}); }
  return canvas;
}
function _worldDropFxTile(frame,tile){
  const _q=_qaWD();
  const img=_worldDropFx[frame];
  if(!img.complete||!img.naturalWidth){ if(_q)_qaWDpush({fn:'fxTile',frame,tile,res:'notready'}); return null; }
  if(_worldDropFxTiles[frame][tile]){ if(_q)_qaWDpush({fn:'fxTile',frame,tile,res:'hit'}); return _worldDropFxTiles[frame][tile]; } // 캐시 hit(같은 frame/tile 재사용)
  const _srcW=Math.floor(img.naturalWidth/_WORLD_DROP_FX_COLS),_srcH=_srcW;
  const _rowsMax=Math.floor(img.naturalHeight/_srcH);
  const col=tile%_WORLD_DROP_FX_COLS,row=~~(tile/_WORLD_DROP_FX_COLS);
  if(row>=_rowsMax){ if(_q)_qaWDpush({fn:'fxTile',frame,tile,res:'oob'}); return null; }
  const canvas=document.createElement('canvas');canvas.width=_srcW;canvas.height=_srcH;
  const ctx=canvas.getContext('2d');
  const _c0=_q?performance.now():0;
  ctx.drawImage(img,col*_srcW,row*_srcH,_srcW,_srcH,0,0,_srcW,_srcH);
  const _c1=_q?performance.now():0;
  _worldDropFxTiles[frame][tile]=_maskWorldDropBlack(canvas);                  // mask는 별도 기록 → 여기선 제외
  if(_q)_qaWDpush({fn:'fxTile',frame,tile,res:'miss',w:_srcW,h:_srcH,cropMs:_c1-_c0}); // cropMs=자식 mask 제외 self
  return _worldDropFxTiles[frame][tile];
}
// … _worldItemSkin 내부(26405~26410 대체) …
  if(!img._worldDropMasked){
    const _q=_qaWD(); const _c0=_q?performance.now():0;
    const canvas=document.createElement('canvas');canvas.width=img.naturalWidth;canvas.height=img.naturalHeight;
    canvas.getContext('2d').drawImage(img,0,0);
    const _c1=_q?performance.now():0;
    img._worldDropMasked=_maskWorldDropBlack(canvas);
    if(_q)_qaWDpush({fn:'itemSkin',src:renderSrc,res:'miss',w:img.naturalWidth,h:img.naturalHeight,cropMs:_c1-_c0});
  } else if(_qaWD()){ _qaWDpush({fn:'itemSkin',src:renderSrc,res:'hit'}); } // 같은 asset(renderSrc) 재사용
```

## 3) 분석측 집계기 (QA 독립 도구, 게임 무관 — 중복합산 방지 리듀서)

```javascript
// window.__qaWD.records 를 호출·miss/hit·같은 asset 재사용으로 분리. inclusive 없이 leaf self 합만.
function qaWDReduce(recs){
  const byKey={}, tally={fxTile:{hit:0,miss:0},itemSkin:{hit:0,miss:0}};
  let readMs=0, loopMs=0, putMs=0, cropMs=0, maskReadbacks=0;
  for(const r of recs){
    if(r.fn==='mask'&&!r.err){ readMs+=r.readMs; loopMs+=r.loopMs; putMs+=r.putMs; maskReadbacks++; }
    if(r.fn==='fxTile'){ (r.res==='hit')?tally.fxTile.hit++:(r.res==='miss'&&tally.fxTile.miss++); if(r.res==='miss')cropMs+=r.cropMs;
      const k='f'+r.frame+'t'+r.tile; byKey[k]=byKey[k]||{hit:0,miss:0}; byKey[k][r.res]=(byKey[k][r.res]||0)+1; }
    if(r.fn==='itemSkin'){ (r.res==='hit')?tally.itemSkin.hit++:(r.res==='miss'&&tally.itemSkin.miss++); if(r.res==='miss')cropMs+=r.cropMs;
      byKey[r.src]=byKey[r.src]||{hit:0,miss:0}; byKey[r.src][r.res]=(byKey[r.src][r.res]||0)+1; }
  }
  // 총 CPU self = readMs+loopMs+putMs+cropMs (상호 배타). getImageData=readMs 단독으로 분리됨.
  return {tally, selfSum:{readMs,loopMs,putMs,cropMs,total:readMs+loopMs+putMs+cropMs}, maskReadbacks, reuse:byKey};
}
```

이 구조면 원자료의 20.9/20.8/19.3ms가 `cropMs`(크롭 draw) + `readMs`(readback=getImageData 19.3) + `loopMs`(픽셀 변환) + `putMs`로 **상호 배타 분해**되어, miss 1회의 실제 지배 구간이 readback인지 픽셀루프인지 분리 확정 가능하며, `tally`/`reuse`로 호출수·캐시 hit/miss·같은 asset 재사용이 분리됩니다.

## 4) 미실행·적용 제약 (명시)

- **미적용·미실측**: game.html은 총괄 단독 편집이며 본 세션은 읽기 권한만 — 위는 **적용 전 후보 코드**다. 실제 주입·게임 실행·새 실측은 하지 않았다.
- **외부 전역 몽키패치로는 불가**: `_worldDropFxTile`·`_maskWorldDropBlack`는 선언·호출부(50507)가 모두 **렉시컬 바인딩**이라 `window.__` 재할당으로는 내부 getImageData/픽셀루프를 가로챌 수 없다. 그래서 기존 외부 프로브가 `getImageData 512²(3.6ms)`를 `parent:null`로 남긴 것이며, 위 패치는 **in-source**여야 그 사각이 메워진다.
- **probe 이름 불일치**: 원 프로브의 `_worldDropSkin`은 실제 `_worldItemSkin`의 오타/부재 → 아이템 스킨 경로는 이번 원자료에서 미계측. 패치는 이 경로를 포함한다.
- **오버헤드·본표 분리**: 활성 시 miss 경로에 `performance.now()` 수 개가 self에 미세 포함 → 래퍼 실행이므로 p95/p99·롱프레임 ABAB 본표에 합산 금지. 비활성(기본) 시 분기만 타 게임시간 불변.
- **가설·귀속 금지**: `_worldItemSkin`의 getContext(26407)엔 `willReadFrequently` 미설정이라 readback 비용이 빔 타일 경로와 다를 수 있다 — 가설이며 원인확정 아님. getImageData는 CPU readback이지 GPU 시간 아님. **PC 329ms 원인확정은 하지 않는다.**
- **중복합산 금지 재확인**: 기록·집계는 inclusive(`_worldDropFxTile`/`_maskWorldDropBlack`/`getImageData`) 합산 없이 leaf self 합만.

후속 한 건(패치 후보) 완료. 종료합니다.
