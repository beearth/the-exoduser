# THE EXODUSER — AI-First 프로덕션 파이프라인 v3.1
## "뼈대 먼저, 검증하고, 스킨은 나중에"

> v3.0 -> v3.1 핵심 변경: 스킨 제작을 뒤로 뺌
> 뼈대(graybox) 전체 구축 -> 움직임 검증 -> AI 스킨 일괄
> AAA 스튜디오도 쓰는 정석 순서

---

## 마인드셋

```
"안 돼" 금지. "어떤 AI로 어떻게 하면 돼"만 허용.

순서도 중요하다:
X: 캐릭터 하나 뼈대+스킨 완성 -> 다음 캐릭터 -> 반복
O: 전체 뼈대 먼저 -> 전체 움직임 검증 -> 전체 스킨 일괄

뼈대가 잘못되면 스킨 다시 만들어야 한다.
뼈대를 먼저 다 잡아야 스킨을 한 번에 끝낼 수 있다.
```

---

## AI 도구 스택

| 역할 | 도구 | 왜 되는가 | 월비용 |
|------|------|-----------|--------|
| 캐릭터 컨셉 | 힉스필드 Soul ID | 30장 학습 -> 일관된 캐릭터 무한 생성 | $9-24 |
| 스프라이트 생성 | PixelLab | 픽셀아트 전용. 스켈레톤 애니메이션+타일셋 | $12-24 |
| 바이브코딩 연동 | PixelLab MCP | 클코에서 직접 스프라이트 생성 -> 코드 자동 | 포함 |
| 배치 양산 | ComfyUI+LoRA | 베르세르크 LoRA -> 100종 배치 양산 | 무료(로컬) |
| 배경/환경 | GPT-4o 이미지 | Ori 스타일 배경. 정적이라 일관성 문제 없음 | 기존사용 |
| 픽셀 편집 | Aseprite+PixelLab확장 | AI 출력물 팔레트 통일+미세 보정 | $20 1회 |
| BGM | Suno/Udio | 지옥별 BGM 14곡+타이틀/엔딩 2곡 | $10-20 |
| SFX | Web Audio 프로시저럴 | 코드로 생성. 파일크기 0, 변형 무한 | $0 |
| 더빙 | ElevenLabs | 기존 21라인+30라인 확장 | 기존사용 |
| 트레일러 | 힉스필드 영상 | 컨셉아트 -> 시네마틱 영상 자동 | 포함 |

총 월비용: $30-50 (예비창업패키지로 1년치 충당)

---

## 전체 로드맵 -- 3단계 구조

```
====================================================
 STAGE 1: 뼈대 전체 구축 (DAY 1-10)
====================================================
  "placeholder 상태로 전부 돌아가게 만든다"

  DAY 1-2 -- 렉 제거 + 기반 시스템
    - AudioBuffer 풀링
    - 파티클+텍스트 오브젝트 풀
    - Fixed Timestep 게임루프

  DAY 3-4 -- 플레이어 뼈대
    - SpriteAnimator 시스템
    - Atlas P 로더 (JSON 기반)
    - 상태머신 (idle/run/attack/dodge/hurt/die)
    - placeholder: 기존 프로시저럴 렌더 그대로 유지 (폴백)

  DAY 5-6 -- 몬스터 뼈대
    - Atlas E 로더 + etype별 프레임 매핑
    - 런타임 팔레트 스왑 시스템 (initStage 1회)
    - 몬스터 애니메이션 상태 (idle/attack/hurt x 20종)
    - placeholder: 기존 프로시저럴 렌더 유지

  DAY 7 -- 보스 뼈대
    - Atlas B 로더 + 보스별 프레임 매핑
    - 보스 페이즈 전환 (idle/atk1/atk2/rage)
    - 보스 시네마틱 트리거 (등장/처치)
    - placeholder: 기존 프로시저럴 보스 유지

  DAY 8-9 -- 맵/배경 뼈대
    - 다중 레이어 패럴랙스 시스템
    - MAP_BG_LAYERS[hellIdx] -> 3레이어 로딩
    - 환경 데코 시스템 (MAP_DECOR 배치 로직)
    - 동적 라이팅 확장 (지옥별 환경광)
    - placeholder: 기존 맵 유지 (배경 이미지 없으면 스킵)

  DAY 10 -- 사운드 뼈대
    - SFX_MAP 매핑 시스템
    - BGM_MAP + 크로스페이드 시스템
    - 프로시저럴 SFX 엔진 (Web Audio 오실레이터)
    - placeholder: 기본 비프음으로 소리 있는 상태

====================================================
 STAGE 2: 움직임 검증 (DAY 11-12)
====================================================
  "placeholder 상태에서 전체 게임 플로우 확인"

  DAY 11 -- 플레이 테스트
    - idle/run/attack/dodge 전환 타이밍
    - 히트박스와 스프라이트 크기 정합성
    - 몬스터 20종 상태 전환
    - 보스 페이즈+시네마틱 타이밍
    - 패럴랙스 스크롤
    - SFX 타이밍 (공격 프레임과 타격음 싱크)
    - BGM 전환 (탐험 -> 보스전)

  DAY 12 -- 수정 + 규격 확정
    - 타이밍 안 맞는 부분 수정
    - 프레임 수 조절
    - 히트박스 재조정
    - *** 최종 스프라이트 규격 확정 ***
      플레이어: [W]x[H]px, 모션별 프레임 수, 프레임 속도
      일반몹: [W]x[H]px, 3프레임
      보스: [W]x[H]px, 4프레임
      배경: [W]x[H]px, 3레이어
    - 이 규격이 STAGE 3 AI 프롬프트의 정확한 입력값

====================================================
 STAGE 3: AI 스킨 일괄 씌우기 (DAY 13-25)
====================================================
  "검증된 뼈대 위에 AI 스킨 교체. PNG만 바꾸면 끝."

  DAY 13-14 -- AI 도구 세팅
    - PixelLab 가입 + MCP 세팅 (클코 연동)
    - 힉스필드 Soul ID 베르세르크 캐릭터 30장 학습
    - ComfyUI + LoRA 세팅 (로컬 배치용)
    - Aseprite + PixelLab 확장 설치

  DAY 15-16 -- 플레이어 스킨
    - Soul ID -> PLR 컨셉 확정
    - PixelLab -> 확정 규격으로 스프라이트시트
    - Aseprite -> 5색 팔레트 통일
    - atlas_player.png 교체 -> 즉시 반영

  DAY 17-20 -- 몬스터 스킨 (하루 5종 x 4일)
    - PixelLab/ComfyUI -> 확정 32x32, 3프레임 배치 생성
    - Aseprite 배치 + 7지옥 팔레트 스왑 검증
    - atlas_enemies.png 교체 -> 즉시 반영

  DAY 21-22 -- 보스 스킨 + 배경 (병렬)
    - 보스: Soul ID 컨셉 -> PixelLab 64x64 -> atlas_bosses.png 교체
    - 배경: GPT-4o Ori 스타일 7지옥x3레이어=21장 -> img/bg/ 배치

  DAY 23-24 -- 사운드 스킨
    - Suno/Udio -> BGM 16곡 -> bgm/ 배치
    - ElevenLabs -> 더빙 30라인 추가
    - SFX 파일 추가 교체

  DAY 25 -- 최종 통합 + 데모 + 트레일러
    - 전체 플로우 재테스트
    - 힉스필드 -> 트레일러 영상
    - itch.io + Steam 데모 패키징
```

---

---

# STAGE 1 상세: 뼈대 전체 구축

## DAY 1-2: 렉 제거

stutter-fix-prompts.md 기반 그대로.

```
[클코 프롬프트 1] AudioBuffer 풀링
new Audio(url) 전부 제거.
fetch -> decodeAudioData -> AudioBuffer 캐시.
playSample()은 AudioBufferSourceNode만 사용.

[클코 프롬프트 2] 파티클+텍스트 오브젝트 풀
PART_MAX=1500, TXT_MAX=80 고정 배열.
active 플래그 + 순환 인덱스.
게임루프 안에서 {} 리터럴/new 금지.

[클코 프롬프트 3] Fixed Timestep
Glenn Fiedler 패턴.
PHYS_STEP=16.667ms, accumulator 기반.
fpsCap 제거, Date.now()/performance.now() 통일.
```

완료 기준: 몹 100마리+이펙트에서 60fps, 1% Low >= 50

---

## DAY 3-4: 플레이어 뼈대

```
[클코 프롬프트]

game.html에 스프라이트 애니메이션 시스템을 구축해.
실제 스프라이트 이미지는 아직 없어. placeholder로 동작하게 만들어.

=== 1. SpriteAnimator ===

const SpriteAnimator = {
  create(atlasImg, frameMap, defaultAnim) {
    return {
      atlas: atlasImg,
      frames: frameMap,
      anim: defaultAnim,
      frame: 0, timer: 0, speed: 8,
      loop: true, done: false,
    };
  },
  play(sa, animName, speed, loop) {
    if (sa.anim === animName && !sa.done) return;
    sa.anim = animName;
    sa.frame = 0; sa.timer = 0;
    sa.speed = speed || 8;
    sa.loop = (loop !== false);
    sa.done = false;
  },
  update(sa) {
    if (sa.done) return;
    const frames = sa.frames[sa.anim];
    if (!frames) return;
    sa.timer++;
    if (sa.timer >= sa.speed) {
      sa.timer = 0;
      sa.frame++;
      if (sa.frame >= frames.length) {
        if (sa.loop) sa.frame = 0;
        else { sa.frame = frames.length-1; sa.done = true; }
      }
    }
  },
  draw(sa, ctx, x, y, facing) {
    const frames = sa.frames[sa.anim];
    if (!frames || !sa.atlas) return false;
    const f = frames[sa.frame];
    ctx.save();
    ctx.translate(x, y);
    if (facing < 0) ctx.scale(-1, 1);
    ctx.drawImage(sa.atlas, f.x, f.y, f.w, f.h, -f.w/2, -f.h/2, f.w, f.h);
    ctx.restore();
    return true;
  }
};

=== 2. Atlas P 로딩 (파일 없으면 폴백) ===

const _atlasP_img = new Image();
let _atlasPReady = false;
let _atlasPFrames = null;

_atlasP_img.onload = () => { _atlasPReady = true; };
_atlasP_img.onerror = () => { _atlasPReady = false; };
_atlasP_img.src = 'atlas_player.png';

fetch('atlas_player.json')
  .then(r => r.json())
  .then(j => { _atlasPFrames = j; })
  .catch(() => { _atlasPFrames = null; });

=== 3. 플레이어 연결 ===

// update()에서:
const ANIM_MAP = {
  'idle':'idle', 'move':'run', 'attack':'attack_sword',
  'dodge':'dodge', 'hurt':'hurt', 'die':'death'
};

// draw()에서:
const rendered = (_atlasPReady && _atlasPFrames)
  ? SpriteAnimator.draw(P._sa, X, px, py, P.dir==='right'?1:-1)
  : false;
if (!rendered) {
  // 기존 프로시저럴 렌더링 그대로 실행 (폴백)
}

핵심: atlas_player.png 없어도 게임 정상 동작.
파일 넣으면 자동 전환. PNG 교체 = 비주얼 교체.
```

---

## DAY 5-6: 몬스터 뼈대

```
[클코 프롬프트]

game.html 적 렌더링에 아틀라스 시스템 추가.
SpriteAnimator 동일 사용.

=== Atlas E 로딩 ===
atlas_enemies.png + atlas_enemies.json
파일 없으면 폴백 (기존 프로시저럴).

=== etype -> 프레임 매핑 ===
JSON: { "etype_00": { "idle":[{x,y,w,h}], "attack":[...], "hurt":[...] } }

=== 런타임 팔레트 스왑 ===
initStage()에서 HELL_PALETTES[hellIdx]로 1회 스왑.
offscreenCanvas 캐싱.
draw()에서 getImageData 절대 금지.

=== 적 draw() 분기 ===
아틀라스 있으면 SpriteAnimator.draw()
없으면 기존 프로시저럴 (폴백)

=== 엘리트 등급 오버레이 ===
매직: 파란 틴트, 레어: 금 틴트, 챔피언: 빨강+1.2배
globalCompositeOperation으로 색 오버레이.

atlas_enemies.png 교체만으로 몬스터 비주얼 전환.
```

---

## DAY 7: 보스 뼈대

```
[클코 프롬프트]

적과 동일 구조. 사이즈 64x64.

1. atlas_bosses.png + json 로딩
2. 페이즈 전환: HP100-50% -> idle/atk1, HP50%이하 -> rage
3. 시네마틱: 등장(레터박스+네임카드), 처치(슬로모+페이드)
4. 폴백: atlas 없으면 기존 프로시저럴 보스

atlas_bosses.png 교체 = 보스 비주얼 전환.
```

---

## DAY 8-9: 맵/배경 뼈대

```
[클코 프롬프트]

다중 레이어 패럴랙스 배경 시스템.

MAP_BG_LAYERS = {
  0: [
    {src:'img/bg/hell0_far.png', parallax:0.3, opacity:0.8},
    {src:'img/bg/hell0_mid.png', parallax:0.6, opacity:0.9},
    {src:'img/bg/hell0_near.png', parallax:0.9, opacity:1.0},
  ], ...
};

draw()에서 맵 타일 전에 배경 레이어 렌더.
이미지 없으면 스킵 (기존 맵 그대로).
이미지 넣으면 자동 표시.

+ 환경 데코 시스템 (MAP_DECOR)
+ 동적 라이팅 (지옥별 환경광 색온도)
데코/라이팅 이미지 없으면 스킵.
```

---

## DAY 10: 사운드 뼈대

```
[클코 프롬프트]

=== SFX_MAP ===
'hit_sword': {type:'procedural', fn: sfxHitSword}
'skill_whirlwind': {type:'file', src:'sfx/sk_whirl.mp3'}
파일 없으면 조용히 스킵. 프로시저럴은 항상 동작.

=== BGM_MAP ===
title: 'bgm/title.mp3'
0: { explore:'bgm/h0_explore.mp3', boss:'bgm/h0_boss.mp3' }
파일 없으면 스킵. 넣으면 자동 재생.
크로스페이드: 2초 GainNode.

=== 프로시저럴 SFX 기본 세트 ===
sfxHitSword: sawtooth 200->80Hz 0.15초
sfxHitMagic: sine 800->200Hz 코러스
sfxLevelUp: 아르페지오 C->E->G->C
5원소 필터: 화염=크래클, 빙결=리버브 등

젤다 레퍼런스: 검타격=금속임팩트, 마법=상승잔향
```

---

---

# STAGE 2 상세: 움직임 검증

## DAY 11: 플레이 테스트 체크리스트

```
[ ] 렉 테스트
    [ ] 가만히 서있을 때 끊김 없음
    [ ] 몹 50마리 전투 중 60fps
    [ ] 몹 100마리+이펙트 50fps 이상

[ ] 플레이어 애니메이션
    [ ] idle <-> run 전환 자연스러움
    [ ] attack 히트 판정 싱크
    [ ] dodge 무적프레임 일치
    [ ] hurt -> idle 복귀
    [ ] die -> 게임오버 트리거
    [ ] 좌/우 flip 정상

[ ] 몬스터 애니메이션
    [ ] 20종 전부 idle
    [ ] 공격범위 -> attack 전환
    [ ] 피격 -> hurt
    [ ] 엘리트 틴트 오버레이

[ ] 보스
    [ ] 등장 시네마틱 타이밍
    [ ] HP 50% -> rage 전환
    [ ] 처치 시네마틱
    [ ] 보스 HP바

[ ] 배경
    [ ] 패럴랙스 스크롤 방향/속도
    [ ] 레이어 z-order
    [ ] 타일맵과 겹침 없음

[ ] 사운드
    [ ] 검타격 -> SFX 재생
    [ ] 스킬 -> SFX
    [ ] BGM 지옥전환 크로스페이드
    [ ] 보스전 BGM 전환
```

## DAY 12: 규격 확정

```
검증 후 확정할 항목 (= STAGE 3 AI 프롬프트 입력값):

플레이어: [W]x[H]px
  idle [N]f speed[N] / run [N]f speed[N] / attack [N]f speed[N]
  dodge [N]f / hurt [N]f / die [N]f
  히트박스 오프셋: x[N] y[N] w[N] h[N]

몬스터: [W]x[H]px
  idle(1) / attack(1) / hurt(1) = 3프레임
  히트박스: etype별 반경

보스: [W]x[H]px
  idle(1) / atk1(1) / atk2(1) / rage(1) = 4프레임

배경: [W]x[H]px, 3레이어, horizontal tiling

*** 이 규격이 확정되어야 스킨을 한 번에 만들 수 있다 ***
*** 규격 없이 스킨 만들면 안 맞아서 다시 만듦 = 시간낭비 ***
```

---

---

# STAGE 3 상세: AI 스킨 일괄

## DAY 13-14: AI 도구 세팅

```
1. PixelLab + MCP (클코 연동)
2. 힉스필드 Soul ID (30장 학습)
   [10] 베르세르크 가츠 [10] 다크소울 기사
   [5] 할로나이트 [5] Blasphemous
3. ComfyUI + 베르세르크 LoRA (50-100장, 2000 steps)
4. Aseprite + 5색 팔레트
   [0]투명 [1]#0A0A0F [2]#141E32 [3]#325078
   [4]#6496C8 [5]#A0D2F0 [6]#64DCFF
```

## DAY 15-16: 플레이어 스킨

```
A: 힉스필드 Soul ID -> 10장 -> 택1 확정
B: PixelLab -> STAGE 2 확정 규격으로 시트 생성
C: Aseprite -> 5색 통일 + 실루엣 검증
D: atlas_player.png 교체 -> 즉시 반영
```

## DAY 17-20: 몬스터 스킨 (하루 5종 x 4일)

```
1종 40분 사이클:
[10분] PixelLab/ComfyUI (확정 규격)
[10분] Aseprite 5색 통일
[5분]  실루엣 테스트
[5분]  7지옥 팔레트 스왑 검증
[10분] 보정

20종 배치 프롬프트 (공통 헤더):
"pixel art, dark fantasy, berserk x fromsoft,
 [W]x[H]px, side view, 3 frames,
 5 colors, transparent bg, melancholic not grotesque"

#01 skeleton warrior  #02 skeleton archer
#03 skeleton mage     #04 shambling zombie
#05 giant spider      #06 giant bat
#07 dark slime        #08 goblin
#09 hulking orc       #10 dire wolf
#11 giant serpent     #12 floating wraith
#13 mimic chest       #14 mushroom creature
#15 armored beetle    #16 flying insect
#17 stone golem       #18 tentacle mass
#19 fire elemental    #20 ice witch

atlas_enemies.png 교체 -> 즉시 반영
```

## DAY 21-22: 보스 + 배경 (병렬)

```
보스 10종 (힉스필드 컨셉 -> PixelLab 64x64):
#01 서리의 파수꾼  #02 독의 여왕  #03 업화의 군주
#04 심연의 눈      #05 뇌신       #06 백골왕
#07 허공의 균열자  #08 흑기사     #09 타락천사
#10 최종보스

배경 21장 (GPT-4o Ori 스타일):
7지옥 x 3레이어(far/mid/near)
#0 얼음 navy->cyan  #1 독충 green->yellow
#2 화염 red->orange #3 심연 purple->black
#4 암전 blue->yellow #5 백골 ivory->yellow
#6 혼돈 all colors shifting
```

## DAY 23-24: 사운드 스킨

```
BGM: Suno 16곡 (탐험7+보스7+타이틀/엔딩2)
더빙: ElevenLabs +30라인 (진입7+보스등장7+클리어7+사망5+엔딩4)
SFX: 추가 파일 교체 (프로시저럴 기본은 이미 동작중)
```

## DAY 25: 최종

```
[ ] 전체 플로우 재테스트
[ ] 스킨 비주얼 일관성 확인
[ ] 힉스필드 -> 트레일러 영상
[ ] itch.io 브라우저 데모
[ ] Electron -> Steam 데모
```

---

---

# 핵심 원칙

```
1. 뼈대 먼저, 스킨 나중
   전체 시스템을 placeholder로 돌려본다.
   움직임/타이밍 검증 후 규격을 확정한다.
   확정된 규격으로 AI 스킨을 한 번에 만든다.

2. PNG 하나 교체 = 비주얼 전환
   코드와 에셋 완전 분리.
   atlas_xxx.png 바꾸면 게임이 바뀜.
   스킨 교체/업그레이드가 무한히 쉬움.

3. 폴백 항상 유지
   에셋 없으면 기존 프로시저럴 렌더 그대로.
   점진적 교체. 어느 시점에서든 게임이 돌아감.

4. AI가 메인 생산 엔진
   도진님 = 디렉터. AI = 아티스트.
   월 $30-50으로 아티스트 연봉 대체.

5. 되는 방법만 찾는다
   "안 돼" 금지.
```

---

## vs 이전 버전

| 항목 | v3.0 | v3.1 |
|------|------|------|
| 순서 | 캐릭터별 뼈대+스킨 동시 | 뼈대 전체 -> 검증 -> 스킨 전체 |
| AI 도구 세팅 | DAY 1-2 | DAY 13-14 (뼈대 후) |
| 스킨 제작 시작 | DAY 3 | DAY 15 (규격 확정 후) |
| 규격 확정 | 사전 추정 | STAGE 2에서 실측 확정 |
| 스킨 재작업 리스크 | 높음 | 0 (확정 후 1회 제작) |
| placeholder | 없음 | 프로시저럴 폴백 상시 유지 |
