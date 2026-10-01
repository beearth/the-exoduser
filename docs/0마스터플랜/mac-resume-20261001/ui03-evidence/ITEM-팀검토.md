# ITEM — UI03 병행 후속 원문

> 읽기 전용 분석/후보 코드. 총괄의 별도 적용·검사 전에는 실행/채택 완료가 아니다. 후속 정정이 앞선 문구보다 우선한다.

## 2026-10-01T06:07:31.125Z

수신: UI03 후속 — 승인 원화 런타임 연결/로딩 실패 폴백 검증용 독립 검사 + 최소 패치 후보를 실제 함수에 연결해 답변 코드블록으로 완성합니다. 실제 함수 본문을 먼저 정확히 읽어 연결점을 확정합니다.

## 2026-10-01T06:09:59.803Z

승인 원화 런타임 연결/로딩 실패 폴백 검증 산출물입니다. 실제 참조 함수(`_itemSkin` 26325, `_worldItemSkin` 26386, `_itemSkinSrc` 26324)와 실제 경로에 연결했고, **파일에 적용하지 않은 코드블록 후보**로만 제출합니다.

## 핵심 연결점 (실제 코드 확인)

- 현재 `game.html`에 `uniqueId` 렌더 분기·`img/ui/unique-items/` 경로 **부재** → 고유아이템은 `wtype/btype/slot` 공통 스킨으로만 폴백(승인 원화 미참조).
- 폴백 종단: `_itemSkin`은 `img` 제거 시 형제로 깔린 `_itemIco` **SVG가 종단 폴백**; `_worldItemSkin`은 로드 실패 시 **`null`(스프라이트 미표시)** 이 종단.
- **경로 3종 구분** (반드시): 승인 원본 `assets/unique-items/ui-XX.png`(1024², RGB·배경포함, **직접 참조 금지**) → 게임 가공본 `img/ui/unique-items/ui-XX.png`(256² RGBA, 계약 §2) → 미승인 Seedream 후보 `…-seedream-candidate.png`(**코드 미연결**).

## 산출 1 — 최소 패치 후보 (미적용)

```js
// ── [PATCH CANDIDATE · 미적용] 고유아이템 승인 원화 전용 렌더 연결 ──
// 값 불변: it.uniqueId를 "읽기"만 함. 효과/드롭/저장/uniqueId 값 변경·생성 없음. 렌더 경로만 분기.
// 승인 전용 경로: img/ui/unique-items/<파일>.png  (승인 원본→256² RGBA 가공본, 계약 §2)
const UNIQUE_ART = {
  // 총괄 승인 시에만 1줄씩 추가. 현재 채택 0/22 → 비어 있음(패치 무동작=안전).
  // 'UI-07':'ui-07',   // 승인 후 예시(belt)
};
// 참고용(연결 금지): 미승인 Seedream 후보는 이 맵/경로에 절대 넣지 않는다.
// const _UNIQUE_ART_CANDIDATES = { 'UI-07':'ui-07-seedream-candidate', /* …미승인 */ };
function _uniqueArtSrc(it){
  const id = it && it.uniqueId;                       // 읽기 전용
  const f  = id && UNIQUE_ART[id];
  return f ? 'img/ui/unique-items/'+f+'.png' : '';    // 미승인/미등록 → '' → 기존 폴백 사용
}

// ── _itemSkin 수정분 (26332~26341 치환) : 전용→(컷아웃/원소)→물리→SVG 다단 폴백 ──
//   const src=_itemSkinSrc(base,el);
//   const srcPhys=_itemSkinSrc(base,'phys');
//   const cutoutSrc=_ITEM_CUTOUT_BASES.has(base)?'img/ui/item-cutouts/'+base+'_phys_cutout.png':'';
     const uniqueSrc=_uniqueArtSrc(it);                               // [PATCH]
     const renderSrc=uniqueSrc||cutoutSrc||src;                       // [PATCH] 승인 전용 최우선
     const chain=[ uniqueSrc?(cutoutSrc||src):'', (renderSrc!==srcPhys?srcPhys:'') ].filter(Boolean);
     const fbAttr=chain.length?' data-fb="'+chain.join('|')+'"':''; // [PATCH] 다단 체인(비고유=종전과 동일 1단)
//   return '<span class="iskin r'+(it.rarity||0)+'" style="width:'+sz+'px;height:'+sz+'px">'
//     +_itemIco(it,col,Math.round(sz*0.82))
//     +'<img class="iskin-img" src="'+renderSrc+'"'+fbAttr+' data-el="'+(it.el||0)+'" width="'+sz+'" height="'+sz+'" loading="lazy" '
       +'onerror="var fb=(this.dataset.fb||\'\').split(\'|\').filter(Boolean);if(fb.length){this.src=fb.shift();this.classList.add(\'el\'+this.dataset.el);if(fb.length)this.dataset.fb=fb.join(\'|\');else this.removeAttribute(\'data-fb\');}else{this.remove();}">'
//     +'</span>';

// ── _worldItemSkin 수정분 (26392~26404 반영) : 전용은 알파 보존(마스킹 금지) + 다단 폴백 ──
     const uniqueSrcW=_uniqueArtSrc(it);                              // [PATCH]
     const renderSrcW=uniqueSrcW||cutoutSrc||src;                     // [PATCH]
     const transparent=!!(uniqueSrcW||cutoutSrc);                     // [PATCH] 전용 가공본도 RGBA → 검정 마스킹 금지
//   let img=_worldItemSkinCache.get(renderSrcW);
//   if(!img){
//     img=new Image(); img.onload=()=>{img._worldDropMasked=null;};
       const fbList=[ uniqueSrcW?(cutoutSrc||src):'', (renderSrcW!==fallback?fallback:'') ].filter(Boolean); // [PATCH]
       if(fbList.length){let fi=0;img.onerror=()=>{ if(fi<fbList.length){img._worldDropMasked=null;img.src=fbList[fi++];} else {img.onerror=null;} };}
//     img.src=renderSrcW; _worldItemSkinCache.set(renderSrcW,img);
//   }
//   if(!img.complete||!img.naturalWidth)return null;
     if(transparent)return img;   // [PATCH] (기존 'if(cutoutSrc)' 대체 — 전용 투명본도 마스킹 생략)
//   … 이하 검정 마스킹 로직 동일
```

## 산출 2 — 독립 정적 검사 (읽기 전용, 미실행)

```js
// 승인 원화 런타임 연결/로딩 실패 폴백 정적 검증. fs 읽기 전용, 게임 미기동.
// 이번 작업에서 실행하지 않음(미실행 제약) — 총괄이 실행/저장.
const fs=require('fs'), path=require('path');
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const UNIQUE_ART={ /* 패치와 동일한 승인 맵. 현재 채택 0/22 → 비어 있음 */ };
const SLOT_BASE={ 'UI-07':'belt', 'UI-20':'shield', 'UI-21':'armor' /* …계약 §3의 22종 */ };
const ex=r=>fs.existsSync(path.join(ROOT,r));
for(const [id,base] of Object.entries(SLOT_BASE)){
  const f=UNIQUE_ART[id];
  const uniquePath = f ? 'img/ui/unique-items/'+f+'.png' : null;     // 승인 전용 가공본
  const common='output/imagegen/item-skins/'+base+'_phys.png';       // 공통 폴백
  const approvedOrig='assets/unique-items/'+id.toLowerCase()+'.png'; // 승인 원본(보존·직접참조금지)
  const candidate ='assets/unique-items/'+id.toLowerCase()+'-seedream-candidate.png'; // 미승인
  console.log({ id,
    승인등록: !!f,
    전용가공본: uniquePath ? (ex(uniquePath)?'존재':'없음→로딩실패→폴백') : '(미승인)',
    공통폴백: ex(common)?'존재':'없음',
    종단폴백: ex(common)?'공통스킨':'SVG(_itemIco) / world=null',
    승인원본보존: ex(approvedOrig)?'OK':'누락',
    미승인후보: ex(candidate)?'파일만 존재(코드 미연결 확인요)':'-'
  });
  if(f && !ex(uniquePath)) console.warn('  ⚠ 승인 등록이나 전용 파일 부재 → 런타임 폴백 발생:',id);
}
// 추가 단언 권장: game.html 소스에 'seedream-candidate' 문자열 0건인지 grep로 교차검증.
```

## 검증 결론 (정적)

- 현재 `UNIQUE_ART` **비어 있음(채택 0/22)** → 패치를 적용해도 **무동작**, 기존 경로·폴백 100% 보존. 승인 시 1줄 추가로 활성.
- 승인 등록됐는데 전용 가공본이 없으면 → `onerror` 체인이 **공통 스킨→물리→SVG(인벤)/null(월드)** 로 안전 강등(로딩 실패 폴백 성립).
- 미승인 Seedream 후보 경로는 패치·검사·맵 어디에도 미참조.

## 미실행 제약

- **파일 미변경**(답변 코드블록만), **게임 미실행·서버 미기동·브라우저 렌더 미수행**, 독립 검사도 이번 작업에서 **미실행**.
- `uniqueId/효과/드롭/저장 값 불변` — 패치는 `it.uniqueId`를 읽어 렌더 경로만 분기.
- 승인 원본 ≠ 게임 가공본 ≠ 미승인 Seedream 후보 **3종 분리 유지**, 후보 **채택 미승인** 상태 그대로.

산출 2건 완성. 적용·실행·저장은 총괄에 위임하고 종료합니다.
