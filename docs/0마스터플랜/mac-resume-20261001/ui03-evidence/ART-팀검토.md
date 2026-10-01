# ART — UI03 병행 후속 원문

> 읽기 전용 분석/후보 코드. 총괄의 별도 적용·검사 전에는 실행/채택 완료가 아니다. 후속 정정이 앞선 문구보다 우선한다.

## 2026-10-01T06:07:03.323Z

wa24 한 건의 브라우저 인수 준비를 완성하겠습니다. 먼저 wa24 전후 컷(전환 대조용)과 원본 이미지를 확인하겠습니다.

## 2026-10-01T06:07:27.808Z

전후 컷(wa23→wa24→wa25)과 원본을 확인했습니다. wa24는 유일하게 `shake:1`(화면 흔들림)이 걸린 컷이라 흔들림 관측이 핵심입니다. shake 구현값을 확인하겠습니다.

## 2026-10-01T06:07:55.533Z

shake 구현(`±2px` 지터, 자막엔 미적용)과 ease-out 곡선을 확인했습니다. 관찰 코드가 런타임 타임라인 배열을 정확히 참조하도록 선언부와 캐시/캔버스 전역을 확인하겠습니다.

## 2026-10-01T06:09:04.916Z

wa24 준비 완료에 필요한 원본·대사·런타임 참조를 모두 확보했습니다. 네 장 재감사 없이 **wa24** 한 건만 완성합니다.

## ART 후속 미완료 1건 완성 — wa24 (브라우저 인수 준비)

### 1. 승인 원본 + 대사 + 런타임 대조

| 항목 | 값 (실제 확인) | 근거 |
|---|---|---|
| 원본 파일 | `assets/cutscene/warintro/cin_fallhell_custom.jpg` | Glob 존재 + **Read 직접 관찰** |
| 규격 / 바이트 / SHA | 2560×1440(16:9) / 598626 / `4c7795…d5db`, 출처 rd12 | ART_TEAM_MASTER §104, §204 |
| 구도(Read 확인) | 전사(흑발·암적 망토·흑철 뿔갑옷) **뒤모습**, 중앙 돌계단 상행, 상단 거대한 불타는 눈(지옥문), 좌우 불타는 첨탑, 용암·붉은 하늘. 하단 계단 어두움 | 원본 Read |
| 코드 엔트리 | `game.html:60152`(ko)·60187(en)·60222(ja)·60257(zh), `PROLOGUE_LINES` const(60127~) | Read/Grep |
| 로더 URL | `_getCutsceneImg`(60410): '/'포함 → `assets/cutscene/warintro/cin_fallhell_custom.jpg?v=20261001-warstills2` | Read |
| 대사(KO) | `그리고 지옥에 떨어진다.` / EN `And so he fell into hell.` / JA `そして地獄に落ちた。` / ZH `然后，他坠入了地狱。` | Grep |
| 자막색 | **col 미지정 → 기본 나레이션색 `#d8d4cc`(뼈색)** — wa28(#ddc8a0)·wa22~23(#ff4422)과 다름 | 60152 + 60638 |
| 타이밍 | `t:73600` 시작, `dur:2400` → 73600~76000ms | 60152 |
| 카메라 | zoom zs**1.08**→ze**1.04**, ease `out`(`1-(1-t)²`, 60122) 완만 줌아웃 | 60152 |
| VFX | `vig:.5` + **`shake:1`(이 컷 유일)** → `_cutShake`(60436) 이미지에 ±2px 정수 지터, **자막엔 미적용**(restore 후 렌더) | 60152·60600 |
| transition | fade `cross in:400`. 앞 **wa23**(cin_remember, #ff4422, in:1, ~73600 종료)에서 크로스페이드 진입 → 뒤 **wa25**(`img:null` 빈 화면, in:400)로 크로스페이드 이탈 | 60151·60153 |

### 2. 브라우저 인수 관측 체크리스트 (`?test=1&cutscene=1`, _cutSeq='PRO')

- **타임라인**: 73600~76000ms 구간에 cin_fallhell_custom 표출, dur 2400ms, 앞 cin_remember·뒤 블랙비트 경계 정확.
- **크롭**: imgR=2560/1440=1.778, 16:9 뷰포트(1600×900·1920×1080) cR=1.778 → `imgR≈cR` 거의 무크롭 전폭(60604~609). 전사·계단·상단 지옥문 눈 전부 프레임 내 유지. 비16:9 창에서만 상하 약간 손실 확인.
- **자막**: 하단 중앙(ch*.88, 60642), `#d8d4cc`, Noto Sans KR, 그림자 #000 blur6, wrap cw*.84, 상단 rgba(0,0,0,.35) 가독 오버레이. 하단 어두운 계단 → 뼈색 자막 대비 양호. 1x 실크기 가독.
- **transition/shake**: wa23→wa24 400ms 크로스페이드 자연, 2400ms 동안 ±2px 흔들림(이미지만, 자막 고정), wa24→wa25 블랙 전환 깜빡임 없음.
- **로드/오류**: 새 쿼리 `?v=20261001-warstills2` 200, naturalWidth/Height 2560×1440, img.complete·naturalWidth>0 실제 drawImage, 1x 확대 잔점 0, pageerror 0·404 0.
- **성공**: 위 전부 충족(한국어 우선). **실패**: 404/구쿼리 캐시·naturalWidth 0·인물/지옥문 잘림·자막 색(#d8d4cc 아님)/위치 어긋남·과도 암전·shake가 자막까지 흔듦·전환 깜빡임·잔점·pageerror.

### 3. 실행용 관찰 코드 (DevTools 콘솔, **읽기 전용·상태 변경 없음**)

```js
// wa24 인수 관측 — 게임/상태 변경 없음. ?test=1&cutscene=1 로 컷신 진입 후 실행.
(() => {
  const KEY='warintro/cin_fallhell_custom.jpg';
  const L=(typeof PROLOGUE_LINES!=='undefined')&&PROLOGUE_LINES.ko.find(l=>l.id==='wa24');
  const cv=document.querySelector('canvas'); const cw=cv?.width||0, ch=cv?.height||0;
  // 이미지: 캐시만 읽음(미스 시 fetch 유발 금지 → 로더 호출 안 함)
  const cache=(typeof _cutsceneImgCache!=='undefined')?_cutsceneImgCache[KEY]:undefined;
  const imgR = cache? cache.naturalWidth/cache.naturalHeight : null;
  const cR = ch? cw/ch : null;
  // 커버 크롭 예측
  let crop=null;
  if(imgR&&cR){ crop = imgR>cR
    ? {mode:'height-fit', dw:+(ch*imgR).toFixed(1), dh:ch, cut:'좌우', dx:+((cw-ch*imgR)/2).toFixed(1)}
    : {mode:'width-fit',  dw:cw, dh:+(cw/imgR).toFixed(1), cut:'상하', dy:+(((ch-cw/imgR)*.1)).toFixed(1)} }
  // shake(mag=1) 순간 오프셋 & ease-out 진행도
  const now=performance.now();
  const sk=(typeof _cutShake!=='undefined')?_cutShake(1,now):null;
  let elapsed=null,zoom=null;
  if(typeof _cutsceneStartMs!=='undefined'&&L){
    const seqT=now-_cutsceneStartMs;                 // 시퀀스 경과(ms)
    if(seqT>=L.t && seqT<L.t+L.dur){
      elapsed=+(seqT-L.t).toFixed(0);
      const t=Math.min(1,elapsed/L.dur), et=_ease.out(t);
      zoom=+(L.cam.zs+(L.cam.ze-L.cam.zs)*et).toFixed(4);
    }
  }
  console.table({
    src_t_dur:`t=${L?.t} dur=${L?.dur}`,
    col:L?.col||'(기본 #d8d4cc)',
    cam:`${L?.cam.zs}->${L?.cam.ze} ${L?.cam.ease}`,
    vfx:JSON.stringify(L?.vfx), fade:JSON.stringify(L?.fade),
    text_ko:L?.text,
    expectURL:`assets/cutscene/${KEY}?v=20261001-warstills2`,
    cached:!!cache, cacheSrc:cache?.src,
    complete:cache?.complete, natural:cache?`${cache.naturalWidth}x${cache.naturalHeight}`:'미프리로드',
    canvas:`${cw}x${ch}`, imgR, cR,
    crop:JSON.stringify(crop),
    shake_px:sk?`x${sk.x} y${sk.y} (±2 범위)`:'-',
    live_elapsed_ms:elapsed, live_zoom:zoom
  });
})();
```

- 동작: `PROLOGUE_LINES.ko`의 wa24 엔트리 필드, `_cutsceneImgCache` 캐시 상태(미스 시 `_getCutsceneImg` **호출 안 함** → fetch 미유발), 캔버스 기준 커버 크롭 예측, shake 순간값, wa24 윈도우 내일 때 실시간 경과/줌을 출력. 모두 **읽기만** 하며 게임 변수에 대입 없음.
- 검증 포인트: `natural`이 `2560x1440`, `cacheSrc`에 `?v=20261001-warstills2`, `complete=true`, `crop.mode='height-fit'`(16:9에서 cut 거의 0), `col`이 기본 뼈색, `shake_px`가 ±2 범위인지.

### 4. 미실행 제약 (준수)
이번 세션은 **Read/Glob/Grep 읽기 전용**만 수행 — 새 이미지/인코딩/게임 실행·파일·공용 HTML(UI03 포함)·Git·PC 접속·신규 팀 변경 0건. 위 관찰 코드는 **사용자가 직접** 콘솔에서 실행하는 산출물이며, 실제 브라우저 인수는 UI03 총괄 단일 편집·QA·MAP 검수 종료 후 순차 배정 시 수행. NW.js 실기 재생은 BUILD 인계.

wa24 준비 완성, 종료합니다.
