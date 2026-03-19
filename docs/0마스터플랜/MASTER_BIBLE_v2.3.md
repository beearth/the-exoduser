# THE EXODUSER — 지옥의 길
# MASTER BIBLE v2.2 (UNITY EDITION)

> 통합·업데이트: 2026-03-11 (v2.3 — AI 도구스택 교체 / 아이템 어픽스 완전판 / VFX Canvas 구현 / 프로덕션 파이프라인 v3.1 통합)
> 기반: v2.2 + AI-First Pipeline v3.1 + Item System Full + 임팩트VFX 총정리v1
> 이 문서 하나로 클코+안티그라비티가 전체 게임을 만든다.

> ⚠️ v2.2 → v2.3 변경 목록:
> - 섹션 13.1 AI 도구스택: God Mode AI/Genspark → PixelLab MCP/Hicksfield Soul ID/ComfyUI+LoRA
> - 섹션 13.3 에셋 프롬프트: 신규 도구 기준으로 전면 교체
> - 섹션 7.6 신규: AFFIX_POOL 완전판 (55종 접두/접미/임플리싯/전설특수)
> - 섹션 11.6 신규: game.html Canvas VFX 구현 (5레이어 임팩트 코드 스펙)
> - 섹션 16 프로덕션 파이프라인: Phase 구조 → AI-First 3단계 25일 로드맵으로 교체

---

## ⚠️ 절대 수정 금지 (전 세션 공통)

```
StageSeeder 결정론적 시드 시스템 수정 금지
강화 확률 공식 수정 금지 (99 × 0.99^n %)
보스 콤보 ID 재배치 금지 (idx 0~48 고정)
CIN_LINES 배열 내용 수정 금지 (섹션 3.3 확정본)
```

## ⚠️ Unity C# 코딩 규칙 (전 세션 공통)

```
모든 스크립트: namespace Exoduser
Update() 내 new / 힙 할당 금지 → 오브젝트 풀 사용
FindObjectOfType() 런타임 금지 → 캐싱 사용
싱글톤 패턴: GameManager.Instance 통일
비동기: UniTask 또는 Coroutine, async-await 남용 금지
```

## ⚠️ 클코 투입 시 필수 헤더 (모든 프롬프트 앞에 붙일 것)

```
---
⚠️ 프로젝트: EXODUSER (G:\exo\EXODUSER)
⚠️ 엔진: Unity 6.3 LTS (URP)
⚠️ 규칙:
  - namespace Exoduser 필수
  - Update() 내 new / 힙 할당 금지
  - FindObjectOfType() 런타임 금지 (캐싱)
  - StageSeeder 로직 수정 금지
  - 강화 확률 공식 수정 금지
  - CIN_LINES 내용 수정 금지
---
```

---

# 목차

1. [비전 & 아트 디렉션](#1-비전--아트-디렉션)
2. [기술 스택 (Unity)](#2-기술-스택-unity)
3. [스토리 & 세계관](#3-스토리--세계관)
4. [월드맵 — 7장 35에리어](#4-월드맵--7장-35에리어)
5. [전투 시스템](#5-전투-시스템)
6. [스킬 시스템](#6-스킬-시스템)
7. [장비 & 강화 시스템](#7-장비--강화-시스템)
8. [몬스터 시스템 — 100종](#8-몬스터-시스템--100종)
9. [보스 시스템 — 49패턴 58콤보](#9-보스-시스템--49패턴-58콤보)
10. [맵 & 던전 구조](#10-맵--던전-구조)
11. [그래픽 마스터 v4.0 — 비주얼 구현](#11-그래픽-마스터-v40--비주얼-구현)
12. [사운드 시스템](#12-사운드-시스템)
13. [에셋 프로덕션 파이프라인](#13-에셋-프로덕션-파이프라인)
14. [Unity 폴더 구조 & 스크립트 아키텍처](#14-unity-폴더-구조--스크립트-아키텍처)
15. [클코 프롬프트 마스터 목록](#15-클코-프롬프트-마스터-목록)
16. [출시 로드맵](#16-출시-로드맵)

---

# 1. 비전 & 아트 디렉션

## 1.1 게임 정의

```
장르:   아이소메트릭 핵앤슬래쉬 액션 RPG
구조:   7장 × 에리어 = 35에리어 + 보스방 + 엔드게임 무한던전
엔진:   Unity 6.3 LTS (6000.3.10f1), URP
카메라: 아이소메트릭 Perspective 고정 (Euler 50, 45, 0 / FOV 60)
배포:   Steam (Unity 빌드) | 예비창업패키지 데모: game.html 병행 유지
```

## 1.2 비주얼 공식 (그래픽 마스터 v4.0 확정 — v2.2 통합)

> ⚠️ v2.2 업데이트: Ori 레퍼런스 추가. 기존 "NRftW + Diablo4"와 충돌 아님.
> Ori = 빛·파티클·서정성 / NRftW = 텍스처·구조·지옥 스케일 → 두 레이어가 공존한다.
> "이쁜 맵 위에서 기괴한 괴물을 쓸어죽이는 게임" — 이 문장이 둘을 동시에 설명함.

```
맵/배경 파티클  = Ori and the Blind Forest / Will of the Wisps
                  서정적 발광 파티클, 살아있는 배경, 빛과 안개의 레이어링
                  → AmbientParticleSystem으로 구현 (섹션 11.5)

맵/텍스처+구조  = No Rest for the Wicked + Diablo 4
                  카라바조 명암, 거대한 지옥 배경, 유화 질감 타일

전투 VFX       = Hades 2
                  오메가 빌드업 VFX, 림라이팅, 다중 동적 광원

임팩트         = Ravenswatch
                  속성별 VFX 언어, 타격 가독성 최우선

캐릭터         = 베르세르크(미우라 켄타로) × FromSoftware
                  작지만 실루엣 강렬, 전쟁의 상흔

사운드         = 젤다 시리즈 (환경/UI 피드백/스킬 차징 음조)
               + Hades 2 (스킬/히트 레이어링 / 보스 BGM 레이어)

전체 톤        = 다크 판타지 · 카라바조 명암 · 어둠+극적 광원
핵심 키워드     = "잔혹동화" — 이쁜 맵 위에서 기괴한 괴물을 쓸어죽이는 게임
```

## 1.3 아트 디렉션 레퍼런스

| 구분 | 레퍼런스 | 채용 요소 |
|------|---------|---------|
| 맵 파티클/빛 | Ori and the Blind Forest | 발광 파티클, 안개, 살아있는 배경, 서정적 조명 |
| 맵 텍스처/구조 | No Rest for the Wicked | 유화 질감, 카라바조 명암, 배경 거대감 |
| 맵 어둠/채도 | Diablo 4 | 지형 디테일, 어두운 채도, 돌/흙 텍스처 |
| 전투 VFX | Hades 2 | 오메가 빌드업 오라, 림라이팅, 다중광원 |
| 임팩트 VFX | Ravenswatch | 속성별 색 언어, 파티클 레이어 |
| 캐릭터 | 베르세르크 | 전쟁 미학, 흑갑옷, 과도한 무기 |
| 캐릭터 | FromSoftware | 디테일한 갑주, 절제된 실루엣 |
| 사운드/모션 | 젤다 시리즈 | 스킬 피드백, 환경 효과음, UI 톤, 차징 음조 |
| 히트 사운드 | Hades 2 | 원소+물리+임팩트 3레이어, 보스 BGM 레이어링 |
| 적 디자인 | 베르세르크 사도 | 인간→괴물 변이, 그로테스크 그러나 서정적 |

## 1.4 절대 금지

```
✗ 전형적인 서양 판타지 몬스터 (뿔 악마 / 드래곤 / 갑옷 해골)
✗ 단순 고어, 징그러운 것 자체가 목적인 디자인
✗ 밝고 화려한 애니메이션 색감 (게임은 항상 어둡고 극적으로)
✗ 주황-노랑 색의 무기/이펙트 → 원소 테마 위반
✗ 픽셀 아트 레트로 스타일 (PixelLab 구독 취소 확정)
```

---

# 2. 기술 스택 (Unity)

## 2.1 엔진 & 렌더

```
Unity:   6.3 LTS (6000.3.10f1)
렌더파이프: URP (Universal Render Pipeline)
카메라:  Perspective, Euler (50, 45, 0), FOV 60
방식:    3D 월드 + 2D 스프라이트 혼합 (Hades 파이프라인)
타겟FPS: 60fps (GC 스파이크 Zero)
```

## 2.2 외부 의존성 (최소화 원칙)

```
허용:
  Supabase (리더보드/세이브)
  Noto Sans KR (한글 폰트)
  UniTask (비동기)
  DOTween (트윈 애니메이션)

금지:
  Runtime Fee 발생 에셋
  무거운 AI 추론 런타임
  외부 물리 엔진 (Unity Physics 사용)
```

## 2.3 빌드 타겟

```
Primary:   Windows 64bit (Steam)
Secondary: macOS, Linux
Demo:      game.html (Canvas2D, 예비창업패키지 제출용 — 별도 유지)
```

## 2.4 성능 목표

```
목표: 60fps 스터터 Zero
오브젝트 풀: EnemyPool, BulletPool, VFXPool, TextPool, AmbientParticlePool
배치 드로우콜: GPU Instancing + SRP Batcher
파티클: Particle System Pool (80개 상한)
```

---

# 3. 스토리 & 세계관

## 3.1 코어 서사

전쟁 생존자(PLR)가 가족을 파괴한 전 동료 **"Killu"** 에게 복수하기 위해 7개의 지옥을 탈출하는 **복수극**.

> "살아남은 자에게 주어진 것은, 오직 복수뿐."

## 3.2 주요 캐릭터

| 코드 | 이름 | 설명 | 보이스 |
|------|------|------|--------|
| PLR | 플레이어/복수자 | 전쟁 생존자. 투구+망토+방패+석궁 풀장비 | 결의에 찬 남성 |
| NAR | 내레이터 | 지옥의 안내자. 옴니시언트 관찰자 | 깊고 무거운 남성 |
| NEM | Nemesia | 지옥의 심판자. Killu의 연결고리 | 차가운 여성 |
| KIL | Killu | 전 동료 → 최종 적대자 | 미정 |

## 3.3 인트로 나레이션 — CIN_LINES 확정본 (절대 수정 금지)

> ⚠️ v2.2 업데이트: 21라인 전체 확정. 클코 IntroCinematic.cs에 하드코딩.
> 빨강(Red) 시퀀스 = idx 9~14. 화면 플래시 + PLR 보이스 전환.
> 흐림(Dim) 시퀀스 = idx 16~18. 3라인 동시 잔상.
> 금색(Gold) 시퀀스 = idx 19~20. Bloom 발광 + 카메라 줌인.

```csharp
// ⚠️ 이 배열은 IntroCinematic.cs에 하드코딩. 수정 금지.
public static readonly CinLine[] CIN_LINES = new CinLine[]
{
    new CinLine(0,  "전쟁에서 살아 돌아온 한 남자.",                              CinStyle.Normal, "NAR"),
    new CinLine(1,  "하지만 집은 모두 불타 사라졌다.",                             CinStyle.Normal, "NAR"),
    new CinLine(2,  "이웃이자 친구였던 킬루가 그의 가문을 짓밟았다.",              CinStyle.Normal, "NAR"),
    new CinLine(3,  "아내는 몸종으로 끌려가 온갖 몹쓸 짓을 당했고,",              CinStyle.Normal, "NAR"),
    new CinLine(4,  "끝내 못 이겨 스스로 목숨을 끊었다.",                          CinStyle.Normal, "NAR"),
    new CinLine(5,  "아이들은 노예로 팔려가 어디에 있는지조차 알 수 없다.",        CinStyle.Normal, "NAR"),
    new CinLine(6,  "늙은 부모는 감옥에 갇혀 굶어 죽었다.",                        CinStyle.Normal, "NAR"),
    new CinLine(7,  "킬루 가문의 모두가 알고 있었다.",                              CinStyle.Normal, "NAR"),
    new CinLine(8,  "31명이 보고도 못 본 척했다.",                                  CinStyle.Normal, "NAR"),
    new CinLine(9,  "그날 밤, 킬루 가문을 모두 죽였다.",                            CinStyle.Red,    "NAR"),
    new CinLine(10, "칼로 킬루의 팔다리를 자르고",                                  CinStyle.Red,    "NAR"),
    new CinLine(11, "불로 지혈까지 해주며",                                          CinStyle.Red,    "NAR"),
    new CinLine(12, "오래오래 살려두었다.",                                          CinStyle.Red,    "NAR"),
    new CinLine(13, "\"기억하라.\"",                                                 CinStyle.Red,    "PLR"),
    new CinLine(14, "\"그리고 지옥에서도 후회하라.\"",                               CinStyle.Red,    "PLR"),
    new CinLine(15, "그리고 지옥에 떨어진다.",                                       CinStyle.Normal, "NAR"),
    new CinLine(16, "\"...이것은 셀 수 없는 복수자 중 하나의 이야기일 뿐.\"",      CinStyle.Dim,    "NEM"),
    new CinLine(17, "\"지옥의 미로에는 매일 새로운 영혼이 떨어진다.\"",             CinStyle.Dim,    "NEM"),
    new CinLine(18, "\"분노로 가득 찬 자, 억울함에 미친 자, 사랑을 잃은 자...\"", CinStyle.Dim,    "NEM"),
    new CinLine(19, "\"너는 왜 지옥에 왔느냐?\"",                                   CinStyle.Gold,   "NEM"),
    new CinLine(20, "\"지옥을 탈출하라, 죄인이여.\"",                               CinStyle.Gold,   "NEM"),
};
```

### 스타일 정의

| Style | 색상 | 폰트 | 연출 |
|-------|------|------|------|
| Normal | #e8e0d0 | Noto Sans KR Regular | 기본 Fade In/Out |
| Red | #ff2200 | Noto Sans KR Bold | 화면 전체 0.1초 빨강 플래시 |
| Dim | #888888 | Noto Sans KR (작게 ×0.85) | 3라인 동시 화면 하단 잔상 |
| Gold | #ffd700 | Noto Sans KR Bold | Bloom 발광 + 카메라 줌인 (FOV 60→56) |

### ElevenLabs 녹음 스펙

```
[NAR] idx 0~8, 15
  Stability: 0.72 / Similarity: 0.85 / Style: 0.25 / Speed: -10%
  특징: 공허하고 무거움. 감정 없이 사실만. 억양 과장 없이 담담하게.

[PLR] idx 13~14
  Stability: 0.50 / Similarity: 0.90 / Style: 0.65 / Speed: 보통
  idx 13 "기억하라." → 낮고 천천히, 명령조
  idx 14 "지옥에서도 후회하라." → 마지막에 힘 빼기
  ⚠️ 두 라인 사이 pause 1.5초 확보 (연출 핵심)

[NEM] idx 16~20
  Stability: 0.90 / Similarity: 0.80 / Style: 0.05 / Speed: -5%
  idx 16~18: 리버브 추가 (거리감, 메아리)
  idx 19: 약간 음조 올림 (유일한 의문형)
  idx 20: 가장 낮게, 가장 천천히
```

## 3.4 기타 보이스 라인

```
지옥 진입: 7라인 (지옥당 1개, NAR)
보스 등장: 19종 × 3라인 (등장/위기/사망)
클리어:    7라인 (NAR, 지옥별)
엔딩:      4라인 (NAR+NEM)
사망:      5라인 (NAR, 랜덤)
총 보이스: ~90라인
```

---

# 4. 월드맵 — 7장 35에리어

> ⚠️ MAP BIBLE v3 기준 (2026-03-10 확정)

## 4.1 구조 개요

```
7장 × 에리어 = 35 에리어 + 7 보스방 = 42 맵
진행 방향: 썩은 숲 → 벌레굴 → 얼음굴 → 화염지대
         → 지옥 군단 → 사도의 마굴 → 지옥성 → 탈출

구조: 에리어(일반 전투구간) + 미니보스방 + 보스방(Grid형)
엔드게임: 35 에리어 랜덤 리믹스 무한던전
```

## 4.2 7장 세계관 테이블

| 장 | 이름 | 코드 | 원소 | 에리어 | 분위기 | 장보스 |
|----|-----|------|------|----|------|------|
| 1 | 썩은 숲 | ROTTEN_FOREST | 독/물리 | 4 | 썩어가는 숲, 눈 달린 버섯, 안개 | 숲의 기생수 |
| 2 | 벌레굴 | WORM_NEST | 물리/독 | 6 | 살점 동굴, 점액, 알주머니 | 여왕 구더기 |
| 3 | 얼음굴 | FROZEN_CAVERN | 빙결 | 4 | 얼어붙은 동굴, 봉인된 괴물들 | 얼음 속 봉인 괴물 |
| 4 | 화염지대 | FLAME_OF_AGONY | 화염 | 7 | 용암, 불기둥, 지옥 화산 | 화염 감옥지기 |
| 5 | 지옥의 군단 | HELL_LEGION | 물리/암흑 | 5 | 전쟁 폐허, 뼈 산, 악마 깃발 | 군단 지휘관 |
| 6 | 사도의 마굴 | APOSTLE_LAIR | 암흑/물리 | 6 | 살점 벽, 인간 뼈, 뒤틀린 동굴 | 대사도 |
| 7 | 지옥성 | HELL_CASTLE | 전원소 혼합 | 3 | 검은 성, 붉은 하늘, 차원 균열 | 지옥 군주 |
| | **합계** | | | **35** | | |

## 4.3 장별 에리어 상세

### 1장 — 썩은 숲 (4 에리어, 미니보스 2)
| # | 에리어 이름 | 크기 | 맵 타입 | 특징 |
|---|------------|------|---------|------|
| 0 | 숲 입구 | 200×200 | Vert | 튜토리얼, 시작 안식처 |
| 1 | 뒤틀린 숲길 | 300×300 | Horiz | 버섯 첫 등장, 독 웅덩이 |
| 2 | 버섯 군락 | 350×350 | Vert | **미니보스** — 독버섯 거인 |
| 3 | 기생수의 둥지 | 250×250 | Grid | **보스방** — 숲의 기생수 |

### 2장 — 벌레굴 (6 에리어, 미니보스 2)
| # | 에리어 이름 | 크기 | 맵 타입 | 특징 |
|---|------------|------|---------|------|
| 0 | 벌레 터널 입구 | 250×250 | Vert | 숲→굴 전환, 점액 시작 |
| 1 | 점액 동굴 | 300×300 | Horiz | 점액 웅덩이(이동속도 50%↓) |
| 2 | 기생충 서식지 | 300×300 | Vert | **미니보스** — 기생충 모체 |
| 3 | 구더기 번식장 | 350×350 | Vert | **미니보스** — 거대 알주머니 |
| 4 | 살점 동굴 | 350×350 | Horiz | 맥박 뛰는 살점 벽 |
| 5 | 여왕의 방 | 300×300 | Grid | **보스방** — 여왕 구더기 |

### 3장 — 얼음굴 (4 에리어, 미니보스 1)
| # | 에리어 이름 | 크기 | 맵 타입 | 특징 |
|---|------------|------|---------|------|
| 0 | 얼음 동굴 입구 | 250×250 | Vert | 빙판 첫 등장 |
| 1 | 미끄러운 얼음길 | 300×300 | Horiz | **미니보스** — 서리의 기사, 빙판 관성 기믹 |
| 2 | 얼어붙은 감옥 | 350×350 | Vert | 얼음 속 봉인 괴물들, 접근 시 깨어남 |
| 3 | 봉인의 방 | 300×300 | Grid | **보스방** — 얼음 속 봉인 괴물 |

### 4장 — 화염지대 (7 에리어, 미니보스 2)
| # | 에리어 이름 | 크기 | 맵 타입 | 특징 |
|---|------------|------|---------|------|
| 0 | 용암 입구 | 250×250 | Vert | 용암 첫 등장 (낙하=즉사) |
| 1 | 불기둥 지대 | 300×300 | Horiz | 불기둥 타이밍 회피 기믹 |
| 2 | 화산 심장 | 350×350 | Vert | **미니보스** — 용암의 심장 |
| 3 | 화염 악마 소굴 | 350×350 | Vert | 화염 악마 밀집 |
| 4 | 지옥 사냥개 터 | 300×300 | Horiz | **미니보스** — 화염 쌍두 |
| 5 | 불벌레 동굴 | 350×350 | Vert | 벽에서 쏟아지는 불벌레 |
| 6 | 감옥지기의 관문 | 300×300 | Grid | **보스방** — 화염 감옥지기 |

### 5장 — 지옥의 군단 (5 에리어, 미니보스 2)
| # | 에리어 이름 | 크기 | 맵 타입 | 특징 |
|---|------------|------|---------|------|
| 0 | 전쟁 폐허 | 300×300 | Vert | 부서진 성벽, 공성무기 잔해 |
| 1 | 뼈 산 | 350×350 | Horiz | **미니보스** — 뼈산의 왕, 밟으면 해골 스폰 |
| 2 | 악마 병영 | 350×350 | Vert | 악마 병사 대규모 전투 |
| 3 | 기사단 진지 | 350×350 | Vert | **미니보스** — 철벽 기사단장 |
| 4 | 지휘관의 요새 | 300×300 | Grid | **보스방** — 군단 지휘관 |

### 6장 — 사도의 마굴 (6 에리어, 미니보스 2)
| # | 에리어 이름 | 크기 | 맵 타입 | 특징 |
|---|------------|------|---------|------|
| 0 | 살점 입구 | 300×300 | Vert | 벽이 살점으로 변하기 시작 |
| 1 | 인간 뼈 통로 | 300×300 | Horiz | 카타콤 구조, 뼈 밟으면 어그로 |
| 2 | 뒤틀린 동굴 | 350×350 | Vert | 공간 자체가 비정상적으로 뒤틀림 |
| 3 | 촉수 악마 소굴 | 350×350 | Vert | **미니보스** — 촉수의 어미 |
| 4 | 괴물 인간 서식지 | 400×400 | Horiz | **미니보스** — 불완전 사도 (최대 에리어) |
| 5 | 대사도의 제단 | 350×350 | Grid | **보스방** — 대사도 |

### 7장 — 지옥성 (3 에리어, 스토리보스 1)
| # | 에리어 이름 | 크기 | 맵 타입 | 특징 |
|---|------------|------|---------|------|
| 0 | 검은 성문 | 350×350 | Vert | 전 장 몬스터 혼합, 모든 원소 트랩 |
| 1 | 지옥 탑 | 400×400 | Horiz | **스토리보스** — Killu (1차) |
| 2 | 지옥 군주의 왕좌 | 350×350 | Grid | **최종보스** — 지옥 군주 (128px, 3페이즈) |

## 4.4 보스 전체 목록 (19마리)

| # | 이름 | 종류 | 장 | 크기 |
|---|------|------|----|------|
| 1 | 독버섯 거인 | 미니보스 | 1장 | 64px |
| 2 | 숲의 사냥꾼 | 미니보스 | 1장 | 64px |
| 3 | **숲의 기생수** | 장보스 | 1장 | 96px |
| 4 | 기생충 모체 | 미니보스 | 2장 | 64px |
| 5 | 거대 알주머니 | 미니보스 | 2장 | 96px |
| 6 | **여왕 구더기** | 장보스 | 2장 | 96px |
| 7 | 서리의 기사 | 미니보스 | 3장 | 64px |
| 8 | **얼음 속 봉인 괴물** | 장보스 | 3장 | 96px |
| 9 | 용암의 심장 | 미니보스 | 4장 | 96px |
| 10 | 화염 쌍두 | 미니보스 | 4장 | 64px |
| 11 | **화염 감옥지기** | 장보스 | 4장 | 96px |
| 12 | 뼈산의 왕 | 미니보스 | 5장 | 64px |
| 13 | 철벽 기사단장 | 미니보스 | 5장 | 64px |
| 14 | **군단 지휘관** | 장보스 | 5장 | 96px |
| 15 | 촉수의 어미 | 미니보스 | 6장 | 96px |
| 16 | 불완전 사도 | 미니보스 | 6장 | 64px |
| 17 | **대사도** | 장보스 | 6장 | 96px |
| 18 | **Killu (1차)** | 스토리보스 | 7장 | 64px |
| 19 | **지옥 군주** | 최종보스 | 7장 | **128px** |

## 4.5 장별 팔레트 & 조명 (Unity URP)

| 장 | BG색 | 강조(Accent) | globalIntensity | playerLight색 | 분위기 |
|----|------|------------|----------------|--------------|--------|
| 1 썩은 숲 | #0d1205 | #4a7a1e | 0.08 | #c8ff96 | 서정적 어둠, 독녹 발광 |
| 2 벌레굴 | #0a0a03 | #8bc34a | 0.06 | #d4e870 | 부패 살색, 점액 |
| 3 얼음굴 | #0d1520 | #4fc3f7 | 0.10 | #a0d0f0 | 고요한 서리, 푸른 발광 |
| 4 화염지대 | #1a0800 | #ff6d00 | 0.12 | #ffa060 | 용암빛, 가장 밝음 |
| 5 지옥 군단 | #080010 | #7c4dff | 0.06 | #c080ff | 칠흑, 보라 균열 |
| 6 사도의 마굴 | #080008 | #d500f9 | 0.04 | #f090ff | 가장 어두움, 마젠타 |
| 7 지옥성 | #080003 | #ff4081 | 0.05 | #ff6080 | 핏빛, 차원붕괴 |

## 4.6 장별 고유 기믹

| 장 | 기믹 | 구현 방식 |
|----|------|---------|
| 1 썩은 숲 | 독 웅덩이 (지속 독 데미지) | PoisonPuddle Trigger |
| 2 벌레굴 | 점액 (이동속도 50%↓) | SlimePuddle, Rigidbody drag |
| 3 얼음굴 | 빙판 미끄러짐 (관성) | IceFloor, drag=0.5f |
| 4 화염지대 | 용암(즉사) + 불기둥(타이밍) | LavaFloor + FirePillar 2초 주기 |
| 5 지옥 군단 | 뼈 산 밟으면 해골 스폰 | BonePile OnTrigger |
| 6 사도의 마굴 | 살점 벽 맥박 + 촉수 | FleshWall sin파 애니메이션 |
| 7 지옥성 | 전 원소 트랩 혼합 | GimmickType 랜덤 선택 |

---

# 5. 전투 시스템

## 5.1 전투 철학

```
이 게임의 전투는 단순한 클릭 노가다가 아니다.
탄막을 피하면서, 패링 타이밍을 잡고, 스킬로 적을 가두고,
벽에 밀어붙여 추가 데미지를 넣고, 악마 떼를 쓸어죽이며 전진한다.

레퍼런스: Devil May Cry × Dark Souls × Diablo × 탄막슈팅
```

## 5.2 6입력 조작 (PC 기준)

| 입력 | 행동 |
|------|------|
| 마우스 좌클릭 | 무기 근접 공격 (7종 무기) |
| 마우스 우클릭 | 악의 처내기 (탭=처내기, 홀드=연사) |
| Q | 데빌포스 흡수 (패리 → 에너지 충전) |
| E | 마법 (탭=투사체, 홀드=빔) |
| Space | 석궁 원거리 발사 |
| Shift | 돌진 (회피 + 이동기, 무적 i-frame 12f) |

## 5.3 포이즈/스태거 (다크소울식)

```
모든 적에게 포이즈 수치 존재
공격이 포이즈를 깎음 → 0 되면 스태거(경직) → 추가 콤보 기회

해머/철퇴 = 스태거 18/12 (높음, 한방 경직)
단검/창   = 스태거 3/5  (낮음, 대신 빠름)
→ 무기 선택이 전투 스타일을 결정
```

## 5.4 패리 → 데빌포스 시스템

```
Q키로 적 공격을 타이밍 맞춰 패리
→ parryBank에 에너지 축적
→ 축적된 에너지로 합체 스킬, 그로기 폭발 발동
→ "적 공격을 받아치면 더 강해지는" 공방일체 시스템
```

## 5.5 벽밀기 & 지형 활용

```
wallPush: 적을 벽에 충돌 → 추가 데미지
gravityWell: 적을 한 점으로 끌어모음
cageTrap: 가두는 장판
→ wallPush + gravityWell 콤보 = 떼몹 모아서 벽에 때려박기
```

## 5.6 방어 옵션

| 옵션 | 방법 | 효과 |
|------|------|------|
| 회피 | Shift 돌진 | 무적 프레임으로 관통 |
| 패리 | Q 타이밍 | 데빌포스 축적 + 카운터 |
| 막기 | 우클릭 홀드 | 데미지 감소, 스태미너 소모 |
| 보호막 | guardian 스킬 | 피해 흡수 배리어 |
| 유령걸음 | ghostWalk | 무적 상태 적 관통 이동 |
| 칼날대시 | bladeDash | 이동 + 공격 동시 |

## 5.7 원소 조합 반응

| 조합 | 반응 | 효과 |
|------|------|------|
| 화염 + 빙결 | 증기폭발 | 범위 데미지 + 시야 차단 |
| 뇌전 + 빙결 | 과냉각 | 이동속도 -80% + 크리 +30% |
| 암흑 + 화염 | 저주불꽃 | 지속 데미지 + 힐 차단 |
| 뇌전 + 화염 | 플라즈마 | 관통 데미지 + 방어 무시 |
| 암흑 + 뇌전 | 공허방전 | 범위 스턴 + MP 흡수 |
| 암흑 + 빙결 | 동결심연 | 즉사 확률 + 파편 폭발 |

## 5.8 탄막 컬러 언어

| 원소 | 색 | 거동 | 대응 |
|------|----|------|------|
| 물리 | 흰색 | 직선 고속, 단발 | 회피 쉬움 |
| 화염 | 주황 | 넓은 폭발, 잔류 불꽃 | 범위 피해야 |
| 빙결 | 시안 | 느리지만 추적 | 맞으면 감속 |
| 암흑 | 보라 | 시야 차단, 유도+관통 | 가장 위험 |
| 뇌전 | 노랑 | 연쇄 전격, 튐 | 군중 위험 |
| 신성 | 금색 | 범위 넓음, 장판화 | 지형 피해야 |

---

# 6. 스킬 시스템

## 6.1 구조

```
22 액티브 스킬
+ 11 패시브 스킬
+ 7 합체 스킬 (두 스킬 모두 습득 시 해금)
= 66 변형 (22 × 3분기 PoE2식)
```

## 6.2 스킬 목록

### 이동 계열
돌진 강화, 질풍참, 마법 블링크, 유령걸음

### 물리 계열
회전참, 기폭팔, 방패 처내기

### 마법 계열
만화방창, 멸살광선, 악의 보호자/사냥/포격, 얼음보주, 폭독혈

### 원거리 계열
악의폭축, 칼날살, 산탄, 파편탄, 유탄

### 궁극기
신성폭발, 블랙, 용암소환

## 6.3 합체 스킬 7종

| 스킬 A | 스킬 B | 합체 결과 | 효과 |
|--------|--------|----------|------|
| 회전참 | 기폭 | 회전기폭 | 회전하며 주변 폭발 |
| 돌진강화 | 질풍참 | 차원돌파 | 공간 관통 돌진 |
| 악의사냥 | 수호자 | 악의해방 | 전방위 해방 |
| 악의포격 | 얼음보주 | 얼음포격 | 빙결 범위 폭격 |
| 산탄 | 전방위빔 | 육선포 | 6방향 동시 빔 |
| 폭축 | 칼날살 | 폭축칼날 | 폭발 칼날 연사 |
| 악의폭풍 | 해골벽 | 해골폭풍 | 해골 소환 폭풍 |

## 6.4 스킬 3분기 예시

| 스킬 | 분기 A | 분기 B | 분기 C |
|------|--------|--------|--------|
| 회전참 | 넓은 호 (범위+50%) | 빠른 회전 (공속+40%) | 원소 주입 |
| 돌진 강화 | 관통 돌진 | 폭발 돌진 | 유령 돌진 (무적) |
| 멸살광선 | 확산 (3갈래) | 집중 (단일 극딜) | 지속 (채널링) |
| 신성폭발 | 정화 (디버프 제거) | 심판 (즉사 확률) | 축복 (아군 버프) |

---

# 7. 장비 & 강화 시스템

## 7.1 장비 슬롯 (12종)

```
무기 / 방패 / 부츠 / 갑옷 / 투구 / 석궁
장갑 / 바지 / 목걸이 / 반지1 / 반지2 / 망토
```

## 7.2 등급 시스템

| 등급 | 배율 | 색상 |
|------|------|------|
| 일반 | ×1.0 | 회색 |
| 고급 | ×1.2 | 파란색 |
| 희귀 | ×1.5 | 보라색 |
| 영웅 | ×1.8 | 주황색 |
| 전설 | ×2.2 | 금색(글로우) |

## 7.3 강화 시스템

```
확률 공식: 99 × 0.99^n %  ← 절대 수정 금지
스탯 보너스: 복리 누적
이전 비용: 폭발적 곡선 (고강화 = 사실상 영구 귀속)
경제 재화: 악의(Agui)
어픽스: PoE식 접두/접미사 시스템
```

## 7.4 세트 장비 (7세트)

| 세트 | 지옥 | 2셋 | 4셋 | 6셋 |
|------|------|-----|-----|-----|
| 뇌신의 권능 | 5장 | 뇌전 저항 +30% | 감전 확률 +20% | 연쇄 전격 자동 |
| 부패의 살갗 | 2장 | 독 저항 +30% | 처치 시 HP 흡수 | 사망 시 시체 폭발 |
| 업화의 갑주 | 3장 | 화염 저항 +30% | 화상 데미지 +25% | 공격 시 화염 자취 |
| 심연의 눈 | 4장 | 암흑 저항 +30% | 텔레포트 스킬 해금 | 환영 분신 소환 |
| 서리의 맹세 | 1장 | 빙결 저항 +30% | 빙결 데미지 +25% | 피격 시 얼음 폭발 |
| 백골의 왕관 | 6장 | 불사 저항 +30% | 처치 시 해골 소환 | 사망 시 1회 부활 |
| 혼돈의 파편 | 7장 | 전 원소 저항 +15% | 랜덤 원소 추가 | 공격마다 원소 변환 |

## 7.5 룬 소켓

```
장비에 빈 소켓 1~3개 → 룬 장착으로 커스터마이징
- 공격 룬: 흡혈, 관통, 폭발, 연쇄
- 방어 룬: 반사, 흡수, 회피, 가시
- 유틸 룬: 이속, 경험치, 드롭률, 골드
```

## 7.6 ⭐ AFFIX_POOL 완전판 (신규 — v2.3)

> 출처: exoduser-item-system-full.md 확정본
> game.html 직접 패치용. 클코 투입 시 STEP 1~10 순서 준수.

### 어픽스 구조
```javascript
// 각 어픽스 엔트리 구조
{
  id,       // 고유 ID
  type,     // 0=접두(PREFIX) / 1=접미(SUFFIX)
  ko,       // 한국어 표시명
  stat,     // 적용 필드명 (P._xxx)
  tiers,    // [T1, T2, T3] 등급별 수치
  unit,     // 'val'=정수 / 'pct'=퍼센트 / 'prob'=확률 / 'frame'=프레임
  slots,    // 붙을 수 있는 슬롯 코드 배열
  group,    // 중복 방지 그룹
  weight,   // 출현 가중치
}
```

### 등급별 어픽스 슬롯 수
| 등급 | 어픽스 수 | 임플리싯 | 전설특수 |
|------|---------|---------|---------|
| 일반 | 0 | ✅ | — |
| 고급 | 1 | ✅ | — |
| 희귀 | 2 | ✅ | — |
| 영웅 | 3 | ✅ | — |
| 전설 | 4 | ✅ | ✅ |

### IMPLICIT_TABLE (슬롯 고정 1개)
| 슬롯 | 효과 | 범위 |
|------|------|------|
| weapon | 공격력 +X% | 5~15% |
| bow | 관통 확률 +X% | 5~15% |
| shield | 방어율 +X% | 3~8% |
| armor | 물리 피해감소 +X% | 3~8% |
| helmet | 최대 HP +X | 10~30 |
| gloves | 공격속도 +X% | 3~8% |
| pants | 상태이상 저항 +X% | 5~12% |
| boots | 이동속도 +X% | 3~8% |
| ring | 원소 저항 +X% | 8~15% |
| necklace | 최대 HP +X% | 5~12% |
| cape | 회피 쿨다운 -X% | 5~12% |

### AFFIX_POOL 요약 (55종)

**PREFIX — 공격 DoT (5종)**
맹독의 / 불꽃의 / 냉기의 / 번개의 / 암흑의

**PREFIX — 공격 보조 (8종)**
피흡의 / 관통의 / 광폭의(크리확률) / 처형의(크리데미지) /
파쇄의(스태거) / 연쇄의 / 학살의(킬데미지) / 폭발의(크리폭발)

**PREFIX — 전투 스타일 (7종)**
쾌속의(공속) / 패리의 / 콤보의 / 돌진의 /
궁극의(스킬강화) / 집중력의(쿨감) / 원소집중의

**PREFIX — 능력치 (4종)**
강인의(HP플랫) / 활력의(HP%) / 신속의(이속) / 회복의(킬힐)

**SUFFIX — 원소 저항 (6종)**
화염수호 / 빙결수호 / 뇌전수호 / 암흑수호 / 독수호 / 전원소수호

**SUFFIX — 물리 방어 (6종)**
강철의(물리감소) / 반사의 / 가시의 / 흡수의(배리어) /
인내의(CC저항) / 회피의(무적프레임)

**SUFFIX — 조건부 트리거 (8종)**
위기의(저HP강화) / 피격반격의 / 킬연쇄의 / 패링폭발의 /
스태거폭발의 / 원소전환의 / 정화의 / 불굴의(영웅+) / 부활의(전설)

**SUFFIX — 유틸리티 (6종)**
약탈의(드롭률) / 경험의 / 골드의 / 포션강화의 / 스태미나의 / 마력의

### LEGENDARY_SPECIAL (슬롯별 1종)
| 슬롯 | 전설 효과 |
|------|---------|
| weapon_dagger | 처치 시 이속 +40%(3초) + 다음 공격 크리 보장 |
| weapon_sword | 5타 콤보 완성 시 데빌포스 20% 즉시 충전 |
| weapon_greatsword | 체간 파괴 시 2초 슬로우모션 + 데미지 +60% |
| weapon_spear | 돌진 관통 타격 수만큼 데미지 +20% 중첩(최대5) |
| weapon_hammer | 스태거 발동 시 범위 충격파 (ATK×120%) |
| weapon_axe | 출혈 대상 크리 시 잔여 DoT×300% 즉시 폭발 |
| bow | 치명타 시 추가 투사체 1발 발사 |
| shield | 패리 성공 시 2초 무적 + 반격 데미지 ×2 |
| armor | 피격 시 3초 쿨로 HP 8% 즉시 회복 |
| helmet | 스킬 사용 시 25% 확률로 쿨다운 미소모 |
| gloves | 공격속도 +20% + 기본공격에 랜덤 원소 추가 |
| boots | 회피 직후 첫 공격 데미지 +80% |
| necklace | HP 50% 이하 시 전 스킬 쿨다운 -50% |

### 클코 투입 순서 (item-system 패치)
```
STEP 1. AFFIX_POOL 교체 (기존 PREFIXES/SUFFIXES 대체) — line ~19925
STEP 2. IMPLICIT_TABLE 추가 (AFFIX_POOL 바로 아래)
STEP 3. LEGENDARY_SPECIAL 추가
STEP 4. mkItem() 업그레이드 (어픽스 배열화)
STEP 5. buildItemName() 추가
STEP 6. itemDispName() 업그레이드
STEP 7. spawnDrop(e) 통합 드롭 함수
STEP 8. applyAffixStats() — 장착 시 스탯 반영
STEP 9. removeAffixStats() — 탈착 시 스탯 제거
STEP 10. renderAffixTooltip() — 툴팁 어픽스 표시
⚠️ 금지: 게임 루프 내 new/{}/splice/filter/Date.now()
⚠️ 금지: ELC[] / ETYPE_COL[] / _tseed(tx,ty) 수정
```

---

# 8. 몬스터 시스템 — 100종

## 8.1 디자인 철학 — 베르세르크 사도급

```
핵심 원칙:
  1. 눈알이 무기다 — 몸 곳곳의 눈에서 탄막을 쏜다
  2. 입이 무기다 — 거대한 입에서 레이저/돌진/포식
  3. 살덩어리가 변형한다 — 팔이 칼날, 등이 촉수, 배가 입
  4. 인간의 흔적이 남아있다 — 얼굴, 손, 비명 자세
  5. 크기 차이가 극단적 — 쥐만한 기생충 ~ 화면 가득 채우는 거인

⚠ 절대 금지:
  ✗ 뿔 달린 악마 / 날개 달린 드래곤 / 갑옷 입은 해골 병사
  ✗ 색 바꾼 슬라임/고블린/오크
  ✗ "그냥 큰 동물" (그냥 큰 늑대, 그냥 큰 거미)
```

## 8.2 등급 분류

| 구분 | etype | 수량 | 설명 |
|------|-------|------|------|
| 공통 몬스터 | 0-19 | 20종 | 전 지옥 출현 |
| 지옥전용 몬스터 | 20-89 | 70종 | 지옥별 10종 |
| 희귀 몬스터 | 90-99 | 10종 | 랜덤 특수 AI |

## 8.3 엘리트 등급

| 등급 | HP 배율 | 특징 |
|------|---------|------|
| 일반 | ×1.0 | 기본 |
| 매직 | ×2.5 | 파란 틴트 |
| 레어 | ×5.0 | 금색 틴트, 모디파이어 2개 |
| 챔피언 | ×8.0 | 빨강+1.2배 크기, 모디파이어 3개 |

## 8.4 공통 몬스터 20종

| etype | 이름 | 설명 |
|-------|------|------|
| 0 | 하급 사도 | 소형 후드, 발광눈, 구부린 자세 |
| 1 | 광신도 | 찢긴 로브, 광란의 팔 |
| 2 | 감옥지기 | 거구, 열쇠 소지, 철 마스크 |
| 3 | 해골 보병 | 녹슨 갑옷, 방패+검 |
| 4 | 부패한 사제 | 검은 로브, 보라색 손 발광 |
| 5 | 유령 | 반투명 흘러내리는 형체, 슬픈 얼굴 |
| 6 | 살인 인형 | 균열 도자기 얼굴, 칼날 손 |
| 7 | 거미 | 어두운 갑각, 다수의 붉은 눈 |
| 8 | 슬라임 | 독성 보라 점액, 단일 눈 |
| 9 | 박쥐 | 거대 박쥐, 찢긴 날개, 어금니 |
| 10 | 고블린 | 갑주 고블린, 조잡한 무기 |
| 11 | 늑대 | 상처투성이 방향광, 발광눈 |
| 12 | 임프 | 소형 악마, 불꽃 손 |
| 13 | 워리어 | 언데드 전사, 중갑 |
| 14 | 궁수 | 해골 궁수, 뼈 활 |
| 15 | 마법사 | 암흑 마법사, 부유, 수정 지팡이 |
| 16 | 자폭 병사 | 발광 균열 좀비, 폭발 |
| 17 | 방패병 | 타워 쉴드, 눈 하나만 노출 |
| 18 | 도적 | 이중 단검, 후드, 잠복 |
| 19 | 거대쥐 | 병든 쥐, 발광눈 |

## 8.5 지옥별 전용몹 테마 (70종)

| 지옥 | etype | 테마 |
|------|-------|------|
| 1 얼음 | 20-29 | 얼음결정 통체로 박힌 사도, 서리 수호자 |
| 2 독충 | 30-39 | 구더기/기생충, 점액 뒤덮인 변이체 |
| 3 화염 | 40-49 | 용암혈관 악마, 불타는 뼈대 |
| 4 심연 | 50-59 | 촉수 덩어리, 그림자에서 눈만 빛남 |
| 5 뇌전 | 60-69 | 전기 요정, 번개 방전 갑옷형 |
| 6 백골 | 70-79 | 뼈만 남은 기사/왕/성직자 |
| 7 혼돈 | 80-89 | 6종 무작위 합성 키메라 |

## 8.6 희귀 몬스터 (90-99)

| etype | 이름 | 특징 |
|-------|------|------|
| 90 | 방랑기사 | 발광검, 대전사 AI |
| 91 | 보물악마 | 금으로 덮인 몸, 보석 박힘, 도주형 |
| 92 | 거울의 사도 | 반사 갑옷, 플레이어 모방 |
| 93 | 상인악마 | 친화적 포즈, 랜턴+보따리 (NPC) |
| 94 | 사슬의 죄수 | 거대 쇠사슬, 철 마스크, 폭주형 |
| 95 | 시간의 사도 | 시계 모티프, 모래시계 지팡이 |
| 96 | 탐욕의 사도 | 몸이 자라남, 금화 박힘 |
| 97 | 저주받은 쌍둥이 | 사슬로 연결된 2인 한 세트 |
| 98 | 차원 균열체 | 파편화 몸, 발광 균열 |
| 99 | 죽음 그 자체 | 거대 낫 리퍼, 압도적 기척 |

---

# 9. 보스 시스템 — 49패턴 58콤보

## 9.1 보스 공통 AI 구조

```csharp
public class BossAI : MonoBehaviour
{
    // 유틸리티 AI: 거리적합, 반복패널티, 카운터보너스
    // BOSS_MOVES 49종에서 확률 기반 선택
    // BOSS_COMBOS 58종 콤보 연쇄 실행
}
```

## 9.2 BOSS_PHASES (5단계)

| 페이즈 | HP 비율 | 특징 |
|--------|---------|------|
| 0 | 100~80% | 기본 패턴 |
| 1 | 80~60% | 속도/텔레그래프 배율 증가 |
| 2 | 60~40% | 추가 패턴 해금 |
| 3 | 40~20% | 분신/카운터 등 강화 |
| 4 | 20~0% | 전 패턴 해금, 최대 배율 |

## 9.3 BOSS_MOVES 49패턴

### 기본 패턴 (idx 0-14)
| idx | id | 타입 | 설명 |
|-----|-----|------|------|
| 0 | burst | 즉발 | 광역 탄 |
| 1 | charge | 상태 | 돌진 |
| 2 | fan | 즉발 | 부채꼴 탄 |
| 3 | shock | 즉발 | 충격파 |
| 4 | jump | 상태 | 점프 공격 |
| 5 | grab | 상태 | 잡기 (보라, 패링불가) |
| 6 | spin | 상태 | 회전 |
| 7 | laser | 상태 | 레이저 |
| 8 | summon | 즉발 | 소환 |
| 9 | mine | 즉발 | 지뢰 |
| 10 | vortex | 즉발 | 회오리 |
| 11 | meteor | 즉발 | 유성 |
| 12 | multiDash | 상태 | 연속돌진 |
| 13 | teleStrike | 상태 | 텔레포트 공격 |
| 14 | elemBall | 즉발 | 속성탄 |

### 근접 강화 (idx 15-19)
| idx | id | 설명 |
|-----|-----|------|
| 15 | slashCombo | 3연참 |
| 16 | slam | 내려치기 |
| 17 | sweep | 횡베기 |
| 18 | beanStorm | 탄막폭풍 |
| 19 | beanRain | 탄막비 |

### 특수 패턴 1차 (idx 20-28)
| idx | id | 패링 | 설명 |
|-----|-----|------|------|
| 20 | swordWave | ✅ | 검기 (초승달 투사체) |
| 21 | judgeCut | ✅ | 재단참 (딜레이 폭발) |
| 22 | spiralBullet | ❌ | 나선탄 |
| 23 | delaySlash | ✅ | 딜레이참 (홀드→스윙) |
| 24 | perilThrust | ✅ | 위험찌르기 (패링 보상 큼, 체간60) |
| 25 | pillars | ❌ | 지옥기둥 |
| 26 | phantomSwords | ✅ | 환영검 (유도) |
| 27 | burstCounter | ❌ | 폭발반격 (카운터 자세) |
| 28 | crescendoCombo | ✅ | 점층연격 (갈수록 빠름) |

### 특수 패턴 2차 (idx 29-38)
| idx | id | 설명 |
|-----|-----|------|
| 29 | darkZone | 암흑영역 |
| 30 | mirrorClone | 거울분신 |
| 31 | groundFissure | 균열 |
| 32 | tideWave | 조류파 |
| 33 | seekerMines | 추적지뢰 |
| 34 | rewindStrike | 되감기참 |
| 38 | gravityWell | 중력우물 |

### 특수 패턴 3차 (idx 39-48)
| idx | id | 패링 | 설명 |
|-----|-----|------|------|
| 39 | wallPush | ❌ | 충격파 벽, 플레이어 밀어냄 |
| 40 | poisonTrail | ❌ | 대시하며 독웅덩이 (4초) |
| 41 | cageTrap | ✅ | 가시 감옥 |
| 42 | chainLightning | ✅ | 4점 연쇄번개 |
| 43 | orbWeave | ❌ | 궤도탄 (5초) |
| 44 | shieldBash2 | ✅ | 방패돌진+스턴 |
| 45 | mirrorGuard | ✅ | 반격자세 (2배 반격) |
| 46 | soulAnchor | ❌ | 영혼닻, 속박+DOT |
| 47 | doppelganger | ✅ | 분신소환 (독립AI) |
| 48 | itemSteal | ❌ | 무기봉인 10초 |

## 9.4 패링 컬러 코딩

```
빨간색 (#ff2200): 패링 가능 → 와인드업 시 링+글로우+PARRY 텍스트
보라색 (#cc00ff): 패링 불가 (잡기/독/속박 등) → DANGER 텍스트
```

## 9.5 체간(Posture) 시스템

```csharp
float posture;       // 현재 체간 (0 ~ maxPosture)
float maxPosture;    // 100 + stage * 8
float postureReT;    // 자연회복 쿨다운 (3초, 피격 시 리셋)
// 체간 파괴: 5초 스턴 + 그로기 SFX + 슬로우모션 + 화면 흔들림
// HUD: 금색 그라데이션 체간바
```

## 9.6 보스 등장 시네마틱

```
1. 레터박스 (위아래 검은 바 인 애니메이션)
2. 네임카드 (보스 이름 + 장/층 정보)
3. 보스 Idle 애니메이션
4. BGM 전환 (탐험 BGM → 보스전 BGM 크로스페이드 2초)
5. 레터박스 아웃 → 전투 시작
```

---

# 10. 맵 & 던전 구조

## 10.1 설계 철학

```
진행 방향: 각 장을 순서대로 클리어
맵은 아래 → 위 방향 (지옥을 올라가는 느낌)
에리어 타입 3종: Vert / Horiz / Grid
결정론적 시드: StageSeeder → 룸 배치, 기믹 위치, 스폰 포인트 (수정 금지)
```

## 10.2 에리어 흐름

```
[에리어 0]
  Start → 룸 × 4~6 → 안식처 → 다음 에리어

[에리어 n (미니보스 있음)]
  → 룸 × 3~4 → 미니보스방(별도 Grid) → 안식처 → 다음 에리어

[마지막 에리어 = 보스방(Grid)]
  → 안식처 → 보스문 → 보스전 → 장 클리어 안식처(대장간)
```

## 10.3 맵 타입별 생성 규칙

| 타입 | 방향 | 룸 배치 | 용도 |
|------|------|---------|------|
| **Vert** | 아래→위 | 세로 스네이크 | 일반 탐험 구간 |
| **Horiz** | 좌→우 | 가로 스네이크 | 넓은 전투 구간 |
| **Grid** | 중앙 대방 | 원형/팔각형 | 보스방, 미니보스방, 아레나 |

## 10.4 맵 레이어 구조 (Unity)

```
Layer 0: HD 배경 이미지 (Genspark, No Rest for Wicked 스타일)
Layer 1: Tilemap — 바닥 (floorTilemap, 콜리전 없음)
Layer 2: Tilemap — 벽 (wallTilemap, TilemapCollider2D)
Layer 3: Tilemap — 장식 (decorTilemap, 콜리전 없음)
Layer 4: Light2D (GlobalLight, PlayerLight, TorchLight)
Layer 5: 안개/파티클 (AmbientParticleSystem Pool)
Layer 6: 캐릭터/몬스터 (SpriteRenderer)
Layer 7: VFX (VFXPool)
Layer 8: UI/이펙트 (Canvas — Screen Space Overlay)
```

## 10.5 맵 오브젝트 5종

| 오브젝트 | 배치 기준 | 상호작용 |
|---------|---------|---------|
| **Bonfire** (안식처) | 보스방 전 에리어 1개, 각 장 시작 1개 | [R] HP/MP/스태미너 풀회복 + 세이브 |
| **Lore** (비석) | StageSeeder 결정론적, 에리어당 최대 3개 | [R] 비문 팝업 |
| **Breakable** (파괴물) | 벽 인접 바닥 랜덤 | [R]×3타 → 악의/물약 드롭 |
| **Trap** (함정) | combat룸, 3~7개 | 자동 (지옥별 타입 연동) |
| **Altar** (버프 제단) | 3장 이후, 60% 확률 | [R] 랜덤 버프 3종 택1 |

## 10.6 엔드게임 맵 — 심연의 나락

```
35 에리어 랜덤 리믹스 → 무한 던전
매층 난이도 +5% (몬스터 HP/ATK 복리)
10층마다 보스 랜덤 (19마리 풀에서)
전 장 몬스터 혼합 + 혼돈 모디파이어 중첩
리더보드: Supabase 연동
```

---

# 11. 그래픽 마스터 v4.0 — 비주얼 구현

## 11.1 VFX 5레이어 구조

```
Layer 1: 배경 글로우 (Bloom + Glow 후처리)
Layer 2: 메인 형태 (프레임별 랜덤 변형 파티클)
Layer 3: 밝은 코어 (흰색 코어, URP Additive 블렌딩)
Layer 4: 파티클 보조 (소형 파편, 불꽃)
Layer 5: 후처리 (Chromatic Aberration, Vignette)
```

## 11.2 VFX 3페이즈 (모든 전투 효과 공통)

```
Phase 1 — 예비동작 (Windup)
  와인드업 오라, 느린 빌드업 파티클, 에너지 수렴

Phase 2 — 폭발 (Impact) ← 임팩트의 80%
  1~2프레임 히트스톱 (Time.timeScale → 0.1 → 1.0)
  화면 흔들림 (CameraShake)
  폭발 파티클 Burst

Phase 3 — 여운 (Echo)
  파티클 서서히 소멸
  잔여 이펙트 (불꽃, 얼음 파편 등)
  BGM 레이어 반응
```

## 11.3 Unity 조명 시스템 (Dark Souls 철학)

```
"어둠 속의 빛" — 플레이어 중심 포인트 라이트 + 전역 어둠 오버레이

GlobalLight2D:  intensity 0.04~0.12 (거의 어둠, 장별 설정)
PlayerLight:    PointLight2D, radius 3~4, falloff 강함
BonfireLight:   PointLight2D, flicker 애니메이션 (sin파 0.8~1.2)
TorchLight:     맵 고정 횃불, 약한 주황빛 (#ff8844)
BossAura:       보스 페이즈별 색상 변화 Light2D
```

## 11.4 12개 시스템 구현 순서

```
[위험 낮음 → 높음 순서]

A. 팔레트 교체 → Material Property Block 런타임 교체
B. 타일 디테일 → Tilemap Renderer, SpriteAtlas
C. 환경 데코 → ScriptableObject MAP_DECOR 시스템
D-1. 림라이팅 → URP Custom Pass
D-2. 스프라이트 아웃라인 → Outline Shader
D-3. 블룸 → URP Post Processing, Threshold 0.8
D-4. 다중 동적 광원 → Light2D Pool
D-5. 컬러 그레이딩 → URP Color Adjustments, 장별 LUT
D-6. 발 그림자 → Blob Shadow
D-7. 오메가 빌드업 VFX → 차징 시 점점 커지는 오라
D-8. 속성별 스킬 VFX → 6원소 테마
D-9. 대시 잔상 → Ghost Trail 0.1초 간격
D-10. 사운드 레이어 → AudioMixer 3채널
D-11. 화면 전환 → Transition Shader 지옥별
D-12. 상태이상 오버레이 → Material Tint
```

## 11.5 ⭐ 지옥별 Ambient Particle 스펙 (신규 — v2.2)

> Ori급 분위기의 핵심. AmbientParticleSystem.cs로 구현.
> 각 지옥 진입 시 자동 전환. Pool 상한 80개.

| 장 | 파티클 A | 파티클 B | 파티클 C | 색상 키 |
|----|---------|---------|---------|--------|
| 1 썩은 숲 | 독 안개 (바닥 0.5m, 유동) | 버섯 포자 (흰 점, 느린 낙하) | 반딧불 (발광, 랜덤 유영) | #5aff52 / #ffffff / #b4ff7e |
| 2 벌레굴 | 점액 방울 (낙하, 착지 splash) | 알주머니 맥박 파티클 (반경 방사) | 동굴 먼지 (수평 유동) | #c8ff00 / #ffee88 / #888866 |
| 3 얼음굴 | 눈 결정 (낙하, 느린 회전) | 서리 입자 (수평 유동, 미세) | 봉인 빛줄기 (수직 상승, 파랑) | #e0f4ff / #a0d0ff / #4fc3f7 |
| 4 화염지대 | 불씨 (상승, 깜빡임) | 용암 방울 (낙하+착지 풀) | 열기 굴절 (Heat Distortion) | #ff6d00 / #ff3300 / #ffa060 |
| 5 지옥 군단 | 재 (회색, 느린 낙하) | 핏방울 미스트 (바닥 안개) | 깃발 천 조각 (수평 부유) | #888888 / #aa0000 / #440000 |
| 6 사도의 마굴 | 살점 수증기 (분홍 안개, 밀도 높음) | 검은 안개 (고밀도, 시야 차단) | 마젠타 포자 (방사형) | #d500f9 / #1a001a / #ff00cc |
| 7 지옥성 | 차원 균열 파편 (발광, 무작위) | 붉은 하늘 입자 (낙하) | 원소 혼합 미스트 (6색 랜덤) | #ff4081 / #880000 / random |

```csharp
// 구현 스펙
// 파일: Assets/Scripts/VFX/AmbientParticleSystem.cs
// namespace Exoduser
// ScriptableObject: AmbientParticleData (장별 프리셋)
// ParticleSystem Pool (상한 80개, GC Zero)
// StageManager.OnAreaChanged 이벤트 구독 → 자동 전환
// Update() new 금지
```

## 11.6 ⭐ game.html Canvas VFX 구현 스펙 (신규 — v2.3)

> 출처: EXODUSER_임팩트VFX_총정리v1.docx
> game.html (Canvas 2D) 전용. Unity URP VFX(섹션 11.1~11.4)와 별개로 유지.

### 근본 진단
```
임팩트 코드 아무리 고쳐도 캐릭터가 원·적이 원이면 임팩트도 원으로 보임.
에셋 교체 > 코드 개선 (시각 효과 10배 차이).
→ 단기: 코드 수정으로 즉시 체감 개선 / 장기: 스프라이트 교체로 완성

핵심 문제:
  - poolPart tp=1(원형) 남발 → 원색 구체가 화면 가득
  - 임팩트 지속시간 ml:12프레임 → 눈에 보이기도 전에 사라짐
  - 기준: 디아블로2급 = 0.4~0.8초 (24~48프레임) 필요
```

### PHASE 1 — 즉시 효과 (클코 1회 투입)

```javascript
// ① hitFlash 시스템 (shake 함수 근처)
let _hitFlash = { a: 0, col: "#ffffff" };
function doHitFlash(col, strength) {
  _hitFlash.a = Math.min(1, (_hitFlash.a || 0) + strength);
  _hitFlash.col = col || "#ffffff";
}
// 렌더 루프 최후미에 추가:
if (_hitFlash.a > 0) {
  X.globalAlpha = _hitFlash.a;
  X.fillStyle = _hitFlash.col;
  X.fillRect(0, 0, C.width, C.height);
  X.globalAlpha = 1;
  _hitFlash.a -= 0.08 * _dtSp;
  if (_hitFlash.a < 0) _hitFlash.a = 0;
}
// 호출 시점:
// 일반 무기 타격: doHitFlash("#ffffff", 0.12)
// 보스 피니셔/postureBreak: doHitFlash("#ffffff", 0.35)
// 패리 성공: doHitFlash("#00ccff", 0.25)

// ② 임팩트 지속시간 수정
// 기존 ml:12 → ml:24 전체 교체

// ③ 임팩트 파티클 타입 수정
// tp=1(원형) → tp=2(삼각) 또는 tp=3(충격파 링) 전체 교체
```

### PHASE 2 — 5레이어 임팩트 렌더 교체

```javascript
// 위치: ~21730줄 if(_impacts.length>0){...} 블록 전체 교체
if(_impacts.length>0){
  X.save();
  for(let ii=0;ii<_impacts.length;ii++){
    const im=_impacts[ii];
    if(im.x<_vl||im.x>_vr||im.y<_vt||im.y>_vb) continue;
    const p=im.t/im.ml; const inv=1-p;
    const ec=ELC[im.el]||"#ff6622"; const sz=im.sz||1;
    X.save(); X.globalCompositeOperation="lighter";
    // Layer 1: 배경 글로우
    if(p<0.6){ const gp=1-p/0.6;
      const gr=X.createRadialGradient(im.x,im.y,0,im.x,im.y,20*sz);
      gr.addColorStop(0,ec+"66"); gr.addColorStop(1,"transparent");
      X.globalAlpha=gp*0.4; X.fillStyle=gr;
      X.beginPath();X.arc(im.x,im.y,20*sz,0,Math.PI*2);X.fill(); }
    // Layer 2: 충격파 링
    X.globalAlpha=inv*0.65; X.strokeStyle=ec;
    X.lineWidth=Math.max(0.5,(2-p*2)*sz);
    X.beginPath();X.arc(im.x,im.y,(6+p*24)*sz,0,Math.PI*2);X.stroke();
    // Layer 3: 코어 플래시 (초반만)
    if(p<0.25){ const fp=1-p/0.25;
      X.globalAlpha=fp*0.75; X.fillStyle="#ffffff";
      X.beginPath();X.arc(im.x,im.y,6*sz*fp,0,Math.PI*2);X.fill(); }
    // Layer 4: 슬래시 호 (slash 타입)
    if(im.type!=="blunt"&&p<0.7){ const sp=1-p/0.7; const ang=im.ang||0;
      X.globalAlpha=sp*0.65; X.strokeStyle="#ffffff";
      X.lineWidth=(2-p*1.5)*sz;
      X.beginPath();X.arc(im.x,im.y,(10+p*8)*sz,ang-0.75,ang+0.75);X.stroke(); }
    // Layer 5: 스파크 라인 (magic 타입)
    if(im.type==="magic"&&p<0.5){ X.globalAlpha=inv*0.5; X.strokeStyle=ec; X.lineWidth=1.2*sz;
      for(let si=0;si<6;si++){ const sa=(im.ang||0)+(Math.PI*2*si/6);
        X.beginPath();X.moveTo(im.x+Math.cos(sa)*4*sz,im.y+Math.sin(sa)*4*sz);
        X.lineTo(im.x+Math.cos(sa)*(10+p*14)*sz,im.y+Math.sin(sa)*(10+p*14)*sz);X.stroke(); } }
    X.restore();
  }
  X.globalAlpha=1; X.restore();
}
```

### PHASE 3 — bigImpact 경량화

```javascript
function bigImpact(x, y, el, ang) {
  const ec = ELC[el] || "#ff6622";
  if(_impacts.length >= 40) _impacts.shift();
  _impacts.push({x,y,el,ang:ang||0,t:0,ml:32,sz:1.8,type:"slash"});
  // 스파크 선 6발 (tp=2)
  for(let i=0;i<6;i++){
    const a=(ang||0)+(-0.8+i*0.32); const spd=2.5+Math.random()*2.5;
    poolPart(x,y,Math.cos(a)*spd,Math.sin(a)*spd,
      i%2?ec:"#ffffff",3+Math.random()*2,14+Math.random()*8,2,a,0.02);
  }
  poolPart(x,y,0,0,ec,14,16,3,0,0);  // 충격파 링 tp=3
  _addBlastLight(x,y,120,14,255,200,120);
  doHitFlash("#ffffff", 0.18);
}
```

### PHASE 4 — VFX 스프라이트시트 시스템 (PNG 인라인)

```javascript
// PNG 시퀀스 → base64 인라인 → Canvas 프레임 재생
// 권장 스펙: 64×64px, 16프레임, 4열×4행, base64 50~80KB
// 3~4종 인라인 시 300KB 이내

const _VFX_SHEETS = {};
function registerVFX(id, base64src, frameW, frameH, frameCount, cols) {
  const img = new Image();
  img.src = base64src;
  img.onload = () => {
    _VFX_SHEETS[id] = {img, fw:frameW, fh:frameH,
      frames:frameCount, cols: cols||Math.floor(img.width/frameW)};
  };
}
function playVFX(id, x, y, scale, speed) {
  if(!_VFX_SHEETS[id]) return;
  if(_vfxAnims.length >= 20) _vfxAnims.shift();
  _vfxAnims.push({id,x,y,frame:0,maxFrames:_VFX_SHEETS[id].frames,
    t:0,frameTime:speed||3,scale:scale||1.5});
}
// 에셋 준비: itch.io "slash effect spritesheet" 검색
// 변환: base64 -i slash_effect.png | tr -d "\n"
// 등록: registerVFX("slash", "data:image/png;base64,<값>", 64, 64, 16, 4)
// 호출: playVFX("slash", hitX, hitY, 1.5, 2)
```

### 원소별 임팩트 색상 (ELC[] 기준)
| 원소 | 플래시 색 | 강도 | 지속(ml) |
|------|---------|------|---------|
| 물리 | #ffffff | 0.12 | 24 |
| 화염 | #ff6600 | 0.18 | 28 |
| 빙결 | #44aaff | 0.15 | 32 |
| 뇌전 | #ffee00 | 0.20 | 20 |
| 암흑 | #aa00ff | 0.22 | 36 |
| 신성 | #ffd700 | 0.25 | 30 |

---

## 12.1 사운드 철학 (v2.2 상세화)

```
[젤다 시리즈 레퍼런스 — 핵심 3원칙]

1. 즉각 피드백
   모든 입력에 0프레임 딜레이 SFX
   AudioSource.PlayOneShot() — 풀링 없이 바로 재생
   이동 시작: 발소리 (지형별 pitch 변조)
     - 일반 바닥: pitch 1.0
     - 얼음 바닥: pitch 1.2 (높고 맑음)
     - 용암/점액: pitch 0.8 (낮고 둔탁)
   아이템 획득: 3음 상승 팡파레 Do-Mi-Sol (0.3초)
   UI 선택: 짧은 클릭 pitch 1.0 / 확인: pitch 1.2

2. 스킬 차징 음조 시스템 (젤다 핵심)
   차징 시작: 허밍 pitch 0.8 / 볼륨 0.4
   차징 50%:  pitch 1.0 / 볼륨 0.5 / 파티클 시작
   차징 100%: pitch 1.3 / 볼륨 0.7 / 오라 풀 발광
   구현: AudioSource.pitch = Mathf.Lerp(0.8f, 1.3f, chargeRatio)

3. 환경음 레이어링
   Base: 동굴 반향 (항상 재생, 볼륨 0.3)
   장별 레이어 1 (자연음):
     1장: 바람 + 벌레 소리
     2장: 점액 소리 + 습기 드립
     3장: 얼음 바람 + 공명
     4장: 용암 부글거림 + 화염 파열
     5장: 원거리 전쟁 소리 + 뼈 소리
     6장: 살점 박동 + 저음 윙윙
     7장: 차원 균열 공명 + 전원소 혼합
   장별 레이어 2 (기믹음):
     독 웅덩이 접근: 버블 소리 페이드인
     용암 접근: 열기 소리 페이드인 (거리 기반)
     얼음 바닥: 발소리 pitch +0.2 + 미끄럼 SFX

[Hades 2 레퍼런스 — 히트 레이어링]
   히트 = 물리 타격음 + 원소 SFX + 임팩트 진동 3레이어 동시 재생
   강한 타격: LowPass 필터 제거 (주파수 개방)
   약한 타격: LowPass 필터 유지 (둔탁)
```

## 12.2 AudioMixer 구조

```
Master
├── BGM (배경음악, 크로스페이드 지원)
│   ├── Explore (탐험 BGM)
│   └── Boss (보스전 BGM, 레이어 4단계)
├── SFX (효과음)
│   ├── Combat (전투음, 동시 8채널)
│   ├── Skill (스킬음, 차징 pitch 연동)
│   ├── Ambient (환경음, 볼륨 자동 조절)
│   └── UI (인터페이스음)
└── Voice (더빙)
    ├── NAR (내레이터)
    ├── PLR (플레이어)
    └── NEM (네메시아)
```

## 12.3 보스 BGM 레이어 시스템 (Hades 2식)

```
Track 0 (Explore):    탐험 중 항상 재생
Track 1 (Boss Intro): 보스룸 진입 → 크로스페이드 2초
Track 2 (Phase 2):    HP 60% 이하 → 추가 레이어 믹스인
Track 3 (Phase 5):    HP 20% 이하 → 최대 강도 + 합창

구현: AudioMixer.SetFloat("BossLayer{n}Vol", targetVol)
      DOTween으로 볼륨 전환 (0.5~1.5초)
```

## 12.4 SFX 목록 (45종)

### 전투 SFX (15종)
```
hit_sword / hit_dagger / hit_hammer / hit_spear / hit_axe / hit_mace / hit_club
shield_block / shield_parry / crossbow_fire / crossbow_hit
player_damage / player_death / enemy_stagger / enemy_death
```

### 원소 SFX (12종)
```
fire_cast / fire_explosion / ice_cast / ice_shatter
lightning_strike / lightning_chain / dark_cast / dark_portal
holy_cast / holy_explosion / poison_cast / poison_tick
```

### 환경 SFX (10종)
```
dungeon_drip / bonfire_crackle / ice_wind / flesh_squelch
thunder_distant / bone_rattle / void_hum
chest_open / stone_door / trap_activate
```

### UI SFX (8종)
```
menu_select / menu_confirm / menu_cancel
level_up / item_pickup / item_equip
skill_unlock / bonfire_rest
```

## 12.5 BGM 목록 (실제 파일 확정 — 2026-03-11)

> ⚠️ 실제 파일 경로: 바탕화면\hell\음악\
> (1) 붙은 파일 = 대안 버전. AudioManager에서 동일 코드명 배열에 넣고 랜덤 픽.
> 최종 채택 결정 후 불필요한 버전 정리.

| Unity 코드명 | 실제 파일명 | 재생 조건 | 배정 근거 |
|-------------|-----------|---------|---------|
| bgm_hell1 | Ashes of the Fallen Gate | 1장 썩은 숲 탐험 | 폐허의 문 — 잿더미+숲 입구 |
| bgm_hell2 | Carapace Cathedral | 2장 벌레굴 탐험 | 갑각 성당 — 살점 동굴, 벌레 질감 |
| bgm_hell3 | Abyssal Drift | 3장 얼음굴 탐험 | 심연의 표류 — 고요하고 차가운 표류 |
| bgm_hell4 | Ignis et Sanguis | 4장 화염지대 탐험 | 라틴어 "불과 피" — 화염지대 그 자체 |
| bgm_hell5 | Crown of Ash and Iron | 5장 지옥 군단 탐험 | 재와 철의 왕관 — 전쟁 폐허+군단 |
| bgm_hell6 | Midnight Cathedral of Ash | 6장 사도의 마굴 탐험 | 자정 재의 성당 — 가장 어두운 마굴 |
| bgm_hell7 | Abyss Below | 7장 지옥성 탐험 | 심연의 아래 — 최후의 지옥 |
| bgm_boss_early | Anvil Ashes | 보스전 1~3장 | 모루의 잿더미 — 초반 보스 긴장감 |
| bgm_boss_late | Kiln of Broken Crowns | 보스전 4~6장 | 부서진 왕관의 가마 — 중후반 |
| bgm_boss_final | Teeth in the Choir | 최종보스 (지옥 군주) | 합창단의 이빨 — 합창+공포 |
| bgm_boss_cinematic | Inferno Liturgia | 보스 등장 시네마틱 레터박스 | 지옥의 전례 — 등장 연출용 |
| bgm_bonfire | 복수의 대장간 | 안식처/대장간 구간 | 이름 그대로 |
| jingle_death | 지옥 추락 사망 징글 | 사망 시 (루프 없음) | 이름 그대로 |
| jingle_clear | 탈출 성공 | 장 클리어/엔딩 (루프 없음) | 이름 그대로 |

```csharp
// AudioManager.cs — BGM 로드 예시
// (1) 버전 있는 트랙은 배열로 관리 → Random.Range로 픽
private AudioClip[] bgm_hell1_variants = {
    Resources.Load<AudioClip>("Audio/BGM/Ashes of the Fallen Gate"),
    Resources.Load<AudioClip>("Audio/BGM/Ashes of the Fallen Gate (1)")
};
// PlayBGM("bgm_hell1") → 배열에서 랜덤 선택
```

## 12.6 보이스 더빙 전체 목록

```
인트로:     21라인 (CIN_LINES 확정본 — 섹션 3.3)
지옥 진입:  7라인 (NAR, 지옥 당 1개)
보스 등장:  19종 × 3라인 = 57라인 (등장/위기/사망)
장 클리어:  7라인 (NAR)
엔딩:       4라인 (NAR+NEM)
사망:       5라인 (NAR, 랜덤)
총계:       ~101라인
```

---

# 13. 에셋 프로덕션 파이프라인

## 13.1 AI 도구 스택 (2026) — v3.1 확정

> ⚠️ v2.2 → v2.3: God Mode AI / Genspark 제거. PixelLab MCP / Hicksfield Soul ID / ComfyUI+LoRA로 전면 교체.
> 총 월비용: $30-50 (예비창업패키지로 1년치 충당 가능)

| 역할 | 도구 | 월비용 | 왜 되는가 |
|------|------|--------|---------|
| 캐릭터 컨셉 | **Hicksfield Soul ID** | $9-24 | 30장 학습 → 일관된 캐릭터 무한 생성 |
| 스프라이트 생성 | **PixelLab** | $12-24 | 픽셀아트 전용. 스켈레톤 애니+타일셋 |
| 클코 직접 연동 | **PixelLab MCP** | 포함 | 클코에서 직접 스프라이트 생성 → 코드 자동 |
| 배치 양산 (100종) | **ComfyUI + 베르세르크 LoRA** | $0 (로컬) | 50-100장 학습 → 배치 생성 |
| 배경/환경 | **GPT-4o 이미지** | 기존사용 | Ori 스타일 배경. 정적이라 일관성 문제 없음 |
| 픽셀 편집/팔레트 통일 | **Aseprite** | $20 1회 | AI 출력물 5색 팔레트 통일+보정 |
| BGM | **Suno / Udio** | $10-20 | 지옥별 14곡+타이틀/엔딩 |
| SFX | **Web Audio 프로시저럴** | $0 | 코드 생성. 파일크기 0, 변형 무한 |
| 더빙 | **ElevenLabs** | 기존사용 | 101라인 (섹션 12.6) |
| 트레일러 | **Hicksfield 영상** | 포함 | 컨셉아트 → 시네마틱 영상 자동 |

### Soul ID 학습 소스 (베르세르크 캐릭터용)
```
[10장] 베르세르크 가츠   [10장] 다크소울 기사
[5장]  할로나이트        [5장]  Blasphemous
총 30장 → Soul ID 학습 → PLR/보스 컨셉 무한 생성
```

### ComfyUI LoRA 설정
```
학습 소스: 베르세르크 사도 50-100장
학습 스텝: 2000 steps
배치 프롬프트 공통 헤더:
  "pixel art, dark fantasy, berserk x fromsoft,
   [W]x[H]px, side view, 3 frames,
   5 colors, transparent bg, melancholic not grotesque"
```

### 5색 팔레트 (Aseprite 통일 기준)
```
[0] 투명
[1] #0A0A0F  (가장 어두운 검정)
[2] #141E32  (어두운 남색)
[3] #325078  (중간 청색)
[4] #6496C8  (밝은 청색)
[5] #A0D2F0  (하이라이트)
[6] #64DCFF  (발광 효과)
장별 팔레트 교체: Aseprite 런타임 팔레트 스왑 → initStage() 1회 실행
```

## 13.2 스프라이트 규격

| 대상 | Unity 크기 | 애니메이션 | 방향 | 프레임 |
|------|-----------|-----------|------|-------|
| PLR (플레이어) | 128×128 | Idle/Walk/Attack/Hurt/Die | 8방향 | 4/6/6/3/6 |
| 장보스 | 256×256 | Idle/Attack1/Attack2/Rage | 8방향 | 4/6/6/8 |
| 미니보스 | 192×192 | Idle/Attack1/Attack2/Die | 8방향 | 4/6/6/6 |
| 일반몹 | 96×96 | Idle/Move/Attack/Die | 4방향(flip) | 4/6/4/4 |
| 희귀몹 | 128×128 | Idle/Move/Attack/Special | 4방향(flip) | 4/6/4/6 |
| 타일 | 64×64 | — | — | — |
| VFX 스프라이트 | 128×128 | (애니) | — | 4~8 |
| UI 아이콘 | 64×64 | — | — | — |

## 13.3 ⭐ AI 에셋 발주 프롬프트 — v3.1 도구 기준 (신규)

> v2.2 God Mode AI 프롬프트 → v2.3 PixelLab/Hicksfield/ComfyUI 기준으로 전면 교체

### PixelLab — PLR (플레이어) 발주

```
PixelLab 입력:
"Dark fantasy warrior, pixel art, 128x128px per frame, transparent PNG.
Berserk (Miura) x FromSoftware Dark Souls aesthetic.
Heavily scarred male warrior. Dented dark iron full plate armor,
tattered burgundy cape, horned helmet, black kite shield + iron crossbow.
Posture: hunched, battle-ready. Small but intense silhouette.
5 color palette: #0A0A0F #141E32 #325078 #6496C8 #A0D2F0 + transparent.
Side view. Flip L/R for mirror direction.
Animations (separate rows):
  Idle 4f (chest breathing), Walk 6f (heavy steps),
  Attack 6f (crossbow raise→aim→fire), Hurt 3f, Die 6f"
```

### Hicksfield Soul ID — 보스 컨셉 (30장 학습 후)

```
Soul ID 학습 후 프롬프트:
"[Soul ID character] as a massive tree boss, 256x256px pixel art.
Berserk apostle transformation. Ancient gnarled trunk with screaming
human face embedded in bark. Multiple arm-like branches ending in
human hands. Dozens of eyes covering bark. Root-tentacles on ground.
Core glow: sickly green #4a7a1e. Size fills frame.
Same 5-color palette as player sheet."
```

### ComfyUI + LoRA — 일반몹 배치 (20종 × 40분/종)

```
배치 프롬프트 (etype 0~19 공통 헤더):
"pixel art, dark fantasy, berserk x fromsoft,
 96x96px, side view, 4 frames (idle/attack/hurt/die),
 5 colors (#0A0A0F #141E32 #325078 #6496C8 #A0D2F0), transparent bg,
 melancholic not grotesque, strong silhouette"

개별 프롬프트 (etype별 append):
#00: lesser apostle, hunched, single glowing red eye, too-long arms
#01: fanatic, torn robes, flailing arms, wild expression
#02: jailer, massive, iron mask, key chains
... (etype 03~19 동일 패턴)

1종 사이클: [10분] ComfyUI 생성 → [10분] Aseprite 5색 통일
           → [5분] 실루엣 테스트 → [5분] 팔레트 스왑 검증 → [10분] 보정
총 20종: 4일 × 5종/일 = 800분
```

### GPT-4o — 배경 (Ori 스타일 7지옥 × 3레이어)

```
각 지옥별 프롬프트 (1장 예시):
"Background layer for dark fantasy isometric game.
Style: Ori and the Blind Forest — luminous particles, atmospheric depth,
painterly. NOT pixel art. High resolution 1920x1080.
Theme: Rotting Forest, Chapter 1 of hell.
Colors: Deep forest black #0d1205, rot brown #3d2510, poison green #4a7a1e.
Layer FAR (parallax 0.3): Distant dark trees, faint green mist.
Layer MID (parallax 0.6): Gnarled tree silhouettes, mushroom glow.
Layer NEAR (parallax 0.9): Foreground roots, wet soil, faint particles."

7지옥 × 3레이어 = 21장 → img/bg/hell{n}_{far|mid|near}.png
```

## 13.4 Unity 연동 규격

```
SpriteAtlas 패킹: 2048×2048 (장별 몬스터 묶음)
피벗: Bottom Center (모든 스프라이트 공통)
PPU: 64 (Pixels Per Unit)
압축: Crunch Compression (WebGL 데모) / ASTC (모바일 대비)
파일명 규칙: PLR_idle_S_00.png (캐릭터_애니_방향_프레임번호)
아틀라스 행: 방향 (S/SE/E/NE/N/NW/W/SW)
아틀라스 열: 프레임 (0~n)
```

## 13.5 에셋 총량

| 카테고리 | 수량 |
|---------|------|
| PLR 스프라이트 | 1 × 8방향 × 5애니 ≈ 200프레임 |
| 장보스 | 7종 × 8방향 × 4애니 ≈ 1,680프레임 |
| 미니보스 | 12종 × 8방향 × 4애니 ≈ 2,304프레임 |
| 일반몹 | 20종 × 4방향 × 4애니 ≈ 1,920프레임 |
| 지옥전용몹 | 70종 × 4방향 × 4애니 ≈ 6,720프레임 |
| 맵 타일셋 | 7지옥 × 5종 = 35장 |
| 맵 오브젝트 | 5종 × 7지옥 = 35 스킨 |
| 스킬 VFX | ~30종 × 4~8프레임 ≈ 180프레임 |
| UI 아이콘 | ~80종 (스킬+아이템+상태이상) |
| SFX | 45종 WAV |
| BGM | 13곡 (11지옥+인트로+NEM테마) |
| 보이스 | ~101라인 WAV |

---

# 14. Unity 폴더 구조 & 스크립트 아키텍처

## 14.1 폴더 구조

```
G:\exo\EXODUSER\Assets\
├── Scripts\
│   ├── Core\           GameManager, SceneLoader, StageSeeder
│   ├── Player\         PlayerController, PlayerStats, PlayerSkills
│   ├── Enemy\          EnemyAI, EnemyStats, EnemyPool
│   ├── Boss\           BossAI, BossPhase, BossCombos
│   ├── Combat\         DamageSystem, ParrySystem, ElementSystem
│   ├── Stage\          StageManager, MapLoader, MapObjects
│   ├── Items\          ItemSystem, EnhanceSystem, DropSystem
│   ├── UI\             HUD, BossHUD, InventoryUI, SkillTreeUI, MainMenu
│   ├── VFX\            VFXManager, VFXPool, CameraShake, AmbientParticleSystem
│   ├── Audio\          AudioManager, BGMController, SFXPool
│   ├── Narrative\      IntroCinematic, LoreSystem, VoiceQueue
│   └── Utility\        ObjectPool, ExtensionMethods, Constants
├── Art\
│   ├── Sprites\        PLR, Enemies, Bosses
│   ├── Tiles\          Hell01~07
│   ├── VFX\            Skills, Impacts, Environments, Ambient
│   └── UI\             Icons, Frames, HUD
├── Audio\
│   ├── BGM\
│   ├── SFX\
│   └── Voice\          NAR, PLR, NEM
├── Prefabs\
│   ├── Player\ / Enemy\ / Boss\ / VFX\ / UI\
├── ScriptableObjects\
│   ├── EnemyData\ / BossData\ / ItemData\ / StageData\ / AmbientParticleData\
└── Resources\
```

## 14.2 핵심 스크립트 아키텍처

```csharp
// GameManager.cs — 싱글톤 허브
namespace Exoduser {
    public class GameManager : MonoBehaviour {
        public static GameManager Instance;
        public GameState State;  // Boot/Cinematic/MainMenu/Playing/Paused/GameOver
        // DontDestroyOnLoad
    }
}

// StageSeeder.cs — 결정론적 시드 ← 절대 수정 금지
namespace Exoduser {
    public static class StageSeeder {
        // 시드 기반 결정론적 난수
        // 몬스터 스폰 위치, 맵 변형, 오브젝트 배치 결정
    }
}

// IntroCinematic.cs — 신규
namespace Exoduser {
    public class IntroCinematic : MonoBehaviour {
        // CIN_LINES 21개 순서 출력
        // DOTween Fade In/Out
        // CinStyle별 연출 (Red플래시/Dim잔상/Gold줌인)
        // AudioManager.PlayVoice() 연동
        // Space/ESC 스킵 → GameManager.StartGame()
    }
}
```

## 14.3 오브젝트 풀 패턴 (GC Zero 필수)

```csharp
public class ObjectPool<T> : MonoBehaviour where T : MonoBehaviour {
    [SerializeField] private T prefab;
    [SerializeField] private int poolSize;
    private Queue<T> pool = new();
    // Get() / Return() — new 호출 금지
}
```

---

# 15. 클코 프롬프트 마스터 목록

## 15.1 완료된 프롬프트

| # | 폴더 | 내용 | 상태 |
|---|------|------|------|
| 001 | Core | 폴더구조 + GameManager + CameraController | ✅ 완료 |
| 004 | 4맵디자인 | StageData SO × 7 + MapLoader + StageManager + StageAtmosphere + EnvironmentGimmick + MinimapUI | ✅ 완료 |

## 15.2 투입 순서 (폴더 기준)

```
[1전체그래픽세팅]         → 1전체그래픽세팅_MASTER.md ✅ 완료
[2게임디자인레벨디자인]    → 이 바이블 섹션 5~7
[3.1 ui hud 디자인]       → #08-D HUD 리디자인 + #08-E UI 2차 정비 ← v2.3 추가
[3.2메타·진행시스템]       → 프롬프트 #11 Meta/Progress
[4.0케릭터스프라이트 디자인]→ 프롬프트 #03 SpriteAnimator
[4.1맵디자인]             → 프롬프트 #04 ✅ 완료
[5.0애니메이션파이프라인]   → 프롬프트 #05-A
[5.1임팩트디자인]          → 프롬프트 #05-B VFX + 섹션 11.6 Canvas VFX ← v2.3 추가
[6사운드디자인]            → 프롬프트 #09 AudioManager
[7아이템디자인]            → 프롬프트 #07 + 섹션 7.6 AFFIX_POOL 패치 ← v2.3 추가
[8.0몬스터디자인]          → 프롬프트 #06-A EnemyAI
[8.1보스디자인바이블]       → boss-system.md (MAP BIBLE v3 기준) ✅ 완료
[9적ai패턴디자인]          → 프롬프트 #06-C AI Pattern
[10ai에셋프롬프트모음]      → 섹션 13.3 PixelLab/Hicksfield/ComfyUI 발주 ← v2.3 교체
[11내러티브·로어디자인]     → 프롬프트 #11-A IntroCinematic ✅ 문서완성
[12퍼포먼스·최적화]        → 프롬프트 #12 (렉 제거 3종 = AI-First DAY 1-2)
[13출시·마케팅]            → Hicksfield 트레일러 + Steam 페이지
```

### 현재 클코 당장 투입 가능 (블로커 없음)
```
① #08-D HUD 리디자인   → exoduser-hud-redesign.md (WORK 1→4)
② #08-E UI 2차 정비    → exoduser-ui-phase2.md (WORK 1→5)
③ 아이템 AFFIX 패치    → exoduser-item-system-full.md (STEP 1→10)
④ VFX PHASE 1~3       → 섹션 11.6 코드 그대로 투입
```

## 15.3 프롬프트 상세

### #002: PlayerController

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/Player/PlayerController.cs

- WASD 이동 (아이소메트릭 50도 보정)
- Rigidbody2D 기반, Update() new 금지
- 8방향 입력 → SpriteRenderer 방향 결정
- Shift = 회피대시 (무적프레임 i-frame 12f)
- 지옥별 기믹 연동:
    IceFloor: drag = 0.5f (관성)
    SlimePuddle: moveSpeed × 0.5f
    LavaFloor: 즉사 (GameManager.PlayerDie())
- Q = 패리 입력 (ParrySystem.TryParry())
- Space = 석궁 (PlayerSkills.FireCrossbow())
```

### #003: SpriteAnimator + 캐릭터 스프라이트

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/Player/SpriteAnimator.cs

- atlas.json 기반 프레임 매핑
- Play(animName, speed, loop) API
- 8방향 flip 처리 (W/SW/NW = flip X)
- 폴백: placeholder 색상 박스 (에셋 없을 때 게임 동작)
- PLR 5애니 × 8방향:
    Idle(4f) / Walk(6f) / Attack(6f) / Hurt(3f) / Die(6f)
- 피벗: Bottom Center
- 프레임 속도: Idle=4fps / Walk=10fps / Attack=14fps
```

### #05-B: VFX 시스템 (임팩트 디자인)

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/VFX/VFXManager.cs
     Assets/Scripts/VFX/VFXPool.cs
     Assets/Scripts/VFX/CameraShake.cs

- VFX 5레이어 구조 (섹션 11.1)
- VFX 3페이즈 (Windup/Impact/Echo, 섹션 11.2)
- 히트스톱: Time.timeScale 0.05 → 1.0, 2프레임
- CameraShake: 강도×거리 기반
- 6원소 파티클 프리셋 (섹션 5.8 컬러 기반)
- ParticleSystem Pool (80개 상한, GC Zero)
- AmbientParticleSystem 연동 (섹션 11.5)
```

### #06-A: EnemyAI + EnemyPool

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/Enemy/EnemyAI.cs
     Assets/Scripts/Enemy/EnemyPool.cs

- ObjectPool<EnemyController> (풀 사이즈 80)
- 상태머신: Idle → Chase → Attack → Hurt → Die
- EnemyData ScriptableObject (etype 0~99)
- 장별 몬스터 스폰 테이블 연동
- 엘리트 등급 틴트:
    매직 = 파랑 (#4488ff)
    레어 = 금 (#ffcc00)
    챔피언 = 빨강 (#ff2200) + 크기 ×1.2
```

### #06-B: BossAI

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/Boss/BossAI.cs

- BOSS_MOVES[49] 데이터 구조 (섹션 9.3)
- 유틸리티 AI 선택 (거리적합+반복패널티+카운터보너스)
- BossPhase 5단계 전환 (섹션 9.2)
- 패링 컬러 코딩 (빨강/#ff2200 vs 보라/#cc00ff)
- 보스 등장 시네마틱 (레터박스 + 네임카드)
- 체간(Posture) 시스템 (섹션 9.5)
- BGM 레이어 페이즈 연동
```

### #07: 아이템 & 강화

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/Items/ItemSystem.cs
     Assets/Scripts/Items/EnhanceSystem.cs

- ItemData SO (12슬롯 × 5등급)
- 강화 확률: 99 × 0.99^n % ← 절대 수정 금지
- 악의(Agui) 경제 시스템
- PoE식 어픽스 접두 2종 / 접미 2종
- 세트 장비 7세트 효과 (섹션 7.4)
- 룬 소켓 1~3개
- 이전 비용 폭발 곡선 (고강화=영구 귀속)
```

### #08: HUD (UI)

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/UI/HUD.cs

Canvas 구조:
  HP/MP/스태미너 바 (DOTween 애니)
  보스 HP바 + 체간바 (금색 그라데이션)
  스킬 슬롯 6개 (쿨다운 방사형 오버레이)
  악의 카운터 (우상단)
  히트 넘버 (TextPool 80개)
  미니맵 (MinimapUI)
  상태이상 아이콘 (독/화상/빙결/감전)
```

### ⭐ #08-D: HUD 리디자인 (신규 — v2.3)

> 출처: exoduser-hud-redesign.md
> 디자인 컨셉: "단조된 철과 잔불" (Forged Iron & Ember)
> 제약: 외부 이미지 0개. 순수 CSS + inline SVG + Canvas HUD만 사용.

```
파일: game.html (CSS + HTML + JS 패치)
레퍼런스: Hades급 장식 밀도 × Blasphemous 고딕 톤

HUD 컬러 팔레트:
  철 프레임:        #2a1f18 → #4a3828
  테두리 하이라이트: #6b4f3a
  리벳/장식:        #8a6840 (황동)
  HP 빨강:          #cc2200 → #ff4422
  ST 초록:          #226600 → #44cc00
  DP 보라:          #442288 → #7744cc
  SH 파랑:          #2244aa → #44aaff
  잔불 글로우:       rgba(255,120,40,.15)

작업 순서 (WORK 1→4):
  WORK 1: HP/ST/DP/SH 바 리디자인
    - 철 프레임 3중 border beveled 효과
    - 25% 세그먼트 눈금 (::after repeating-linear-gradient)
    - HP 수치 표시 (.bar-val, id=hpVal)
    - HP 위험 상태: HP 30% 이하 → .danger 클래스 → hpPulse 애니메이션
    - updateHUD()에 3줄 추가: hpVal텍스트 + danger클래스 토글 + shVal텍스트
  
  WORK 2: 퀵슬롯 프레임 리디자인
    - .qs-group (4종: skill/ult/action/menu) data-label 그룹 프레임
    - 그룹 라벨: ::before content: attr(data-label)
    - .qs 개별 슬롯: 철판 텍스처 + hover 잔불 글로우
    - HUD_ICON 상수 (SVG 8종): magic/dash/absorb/skill/forge/bag/gear/bow
    - _updateActionKeys()에서 이모지 → HUD_ICON.xxx 교체
    - updateQS()에서 빈슬롯 기본 아이콘 교체

  WORK 3: 상단 HUD 리디자인
    - .hud-char 블록: 이름+레벨+EXP바 철 프레임으로 묶음
    - .hud-res 블록: 킬/악의/SP 그룹 / CP 별도 그룹
    - "? 조작법" → "⌨" 아이콘으로 축소
    - expBar → hud-char 블록 안으로 이동

  WORK 4: HUD 배경 그라데이션
    - #hud::before: 하단 100px 어둠→투명
    - .hud-top::before: 상단 어둠→투명

⚠️ 보존 필수:
  - .inv-eq-slot / .inv-eq-sil / inv-eq-wrap (인벤토리 장비 UI)
  - qsFlash / swap-sel / sk-drop-hover 클래스 (드래그앤드롭 시스템)
  - qs0~qs6 click/contextmenu, qsK/G/TAB/ESC click 이벤트 리스너
  - $('expF').style.width (ID 유지 필수)
  - _tseed(), ELC[], ETYPE_COL[] 절대 수정 금지
```

### ⭐ #08-E: UI 2차 정비 — 반응형 + CSS 시스템 (신규 — v2.3)

> 출처: exoduser-ui-phase2.md
> 목표: 다양한 해상도에서 깨지지 않는 UI + CSS 디자인 시스템

```
파일: game.html (CSS + HTML + JS 패치)

현재 문제:
  - @media 쿼리 0개 (1920×1080 고정)
  - CSS 변수 없음 (#443322 등 하드코딩 40+회)
  - eq-row 데드코드 잔존
  - 퀵슬롯 46px×17개 → 900px 이하 화면 넘침

작업 순서 (WORK 1→5):
  WORK 1: CSS Custom Properties 도입
    :root에 추가:
      --c-border: #443322 / --c-text: #aa8866 / --c-accent: #ff8844
      --c-text-bright: #ccaa77 / --c-gold: #ffcc44
      --qs-size: 46px / --panel-pad: 20px / --font: Noto Sans KR
    교체 우선: #443322(40+) → var(--c-border), #886644(30+) → var(--c-text)

  WORK 2: 반응형 @media 브레이크포인트
    @media (max-width: 1200px): 퀵슬롯 40px, HUD 바 축소
    @media (max-width: 900px):  퀵슬롯 36px, 패널 풀스크린, 인벤토리 세로스택
    @media (max-width: 600px):  HUD 최소화, 보스바 축소

  WORK 3: eq-row 데드코드 완전 제거
    삭제: CSS .eq-row/.eq-s/.ed/.ee (line 34~37)
    삭제: HTML <div class="eq-row" style="display:none"> (line 291~298)
    보존: .inv-eq-slot / .inv-eq-sil / inv-eq-wrap (절대 건드리지 말 것)

  WORK 4: 상단 HUD 정보 2행 구조 정리
    2행: [이름+LV+EXP바] | [킬/악의/SP/CP]
    기존 expBar div(line 333) 제거 → hud-top 내부로 이동
    JS 수정 불필요 ($('expF').style.width ID 유지)

  WORK 5: 스테이지 전환 로딩 인디케이터
    #stageTransition 오버레이: 층 이름 + 프로그레스바
    showStageTransition(callback): requestAnimationFrame 분산
    실제 스테이지 전환 함수명 grep으로 확인 후 적용
    "nextBtn\|nextStage\|G.stage++" 검색

⚠️ 보존 필수:
  - .inv-eq-slot / .inv-eq-sil / inv-eq-wrap
  - updateHUD(), $('expF').style.width
  - _tseed(), ELC[], ETYPE_COL[] 절대 수정 금지
  - 외부 CDN 금지 (Supabase, Noto Sans KR만)

검증 (각 WORK 완료 후):
  WORK 1: grep -c "var(--c" game.html  # 증가 확인
  WORK 2: grep -c "@media" game.html   # 3 이상
  WORK 3: grep "eq-row" game.html      # 0
  WORK 4: grep "hud-char" game.html    # 존재
  WORK 5: grep "stageTransition" game.html  # 존재
```

### ⭐ #08-B: InventoryUI (신규 — v2.2)

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/UI/InventoryUI.cs

레이아웃: 2열 × 6행 그리드 (12슬롯)
슬롯 순서: 무기/방패/투구/갑옷/바지/장갑/부츠/석궁/목걸이/반지1/반지2/망토
배경: 반투명 다크 패널 (Color: 0,0,0,0.85)
슬롯 크기: 64×64px
아이템 아이콘: 64×64px
등급별 테두리: 회(#888888)/파(#4488ff)/보(#aa44ff)/주(#ff8800)/금(#ffd700+glow)
강화 표시: 우하단 "+N" TextMeshPro (금색)
어픽스 툴팁: 호버 시 팝업 (접두2+접미2, 검은 배경 패널)
룬 소켓: 아이콘 하단 원형 소켓 1~3개
  빈 소켓: 회색 원 (#444444)
  장착: 원소별 색상 (화염=#ff4400 / 빙결=#44aaff / 암흑=#aa00ff)
단축키: I키 토글 / ESC 닫기
```

### ⭐ #08-C: SkillTreeUI (신규 — v2.2)

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/UI/SkillTreeUI.cs
     Assets/ScriptableObjects/SkillData.cs (22종)

레이아웃: ScrollRect 내부 노드 그래프
진행 방향: 아래→위 (지옥 탈출 방향)
노드: 64×64px 아이콘 + 발광 링
연결선: 직선, 미해금=어둠/해금=흰색+발광
분기: Y자 (1노드 → 3노드, 분기 A/B/C)
분기 선택: 1개 선택 시 나머지 2개 잠금 (ResolveConflict)
합체 스킬: 두 노드 사이 마름모 노드 (양쪽 모두 해금 시 활성)
해금 상태: 미해금=어둡게+자물쇠 아이콘 / 해금=발광 링
포인트 표시: 상단 "스킬 포인트: N" TextMeshPro
단축키: K키 토글
```

### #09: AudioManager

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/Audio/AudioManager.cs

- AudioSource Pool (8개, SFX 동시 재생 상한)
- BGM 크로스페이드: Coroutine CrossfadeBGM(clip, 2f)
- 장별 환경음 자동 전환 (StageManager.OnAreaChanged)
- 스킬 차징 pitch 제어 (섹션 12.1):
    SetChargePitch(float ratio)
    pitch = Mathf.Lerp(0.8f, 1.3f, ratio)
- 보스 BGM 레이어 (섹션 12.3):
    SetBossLayer(int layer, float targetVol)
- 지형별 발소리 pitch:
    SetFootstepPitch(TerrainType terrain)
- ElevenLabs 보이스 큐:
    PlayVoice(string voiceCode, int lineIndex)
    보이스 파일 없으면 무음 통과 (에러 없이)
- Update() new 금지 / FindObjectOfType 금지
```

### ⭐ #11-A: IntroCinematic (신규 — v2.2)

```
⚠️ [헤더 붙일 것]
파일: Assets/Scripts/Narrative/IntroCinematic.cs

CIN_LINES 배열: 섹션 3.3 하드코딩 (절대 수정 금지)

Canvas 구조:
  BackgroundPanel (Image, #000000, alpha 1.0)
  FlashPanel (Image, #ff2200, alpha 0 → 런타임 제어)
  LineText_Main (TextMeshPro, Noto Sans KR, 중앙)
  LineText_Dim_0/1/2 (TMP, 하단 1/3 영역, 잔상용)
  SkipHint (TMP, "[Space] 건너뛰기", 우하단, alpha 0.3)

텍스트 애니 (DOTween):
  Fade In: 0.5초
  Hold: Max(voiceClipLength, 2.5초)
  Fade Out: 0.8초
  다음 라인 대기: 0.3초

스타일별 연출:
  Red (idx 9-14):
    - idx 9 진입 시 암전 0.5초 → 빨강 플래시 → 텍스트
    - 각 Red 라인: FlashPanel alpha 0→0.3→0 (0.1초)
    - BGM 덕킹: 볼륨 0 (0.1초) → 복귀
  Dim (idx 16-18):
    - 3라인 하단 동시 표시 (잔상 유지)
    - fontSize ×0.85
  Gold (idx 19-20):
    - Bloom Intensity DOTween 0→3 (0.5초)
    - 카메라 FOV DOTween 60→56 (1.0초)
    - 화면 중앙, 크기 ×1.2

특수 연출:
  idx 15 "지옥에 떨어진다":
    - CameraShake (강도 0.5, 시간 0.8초)
    - SFX: AudioManager.PlaySFX("fall_impact")
  idx 16 등장:
    - BGM 교체: bgm_nem_theme 볼륨 0.2로 페이드인

스킵: Space/ESC → DOTween.Kill(this) → GameManager.StartGame()
완료: idx 20 Fade Out → GameManager.StartGame()
```

### #12: 퍼포먼스 최적화

```
⚠️ [헤더 붙일 것]
- Unity Profiler 병목 제거
- GPU Instancing + SRP Batcher 검증
- GC Alloc Zero 확인
- 60fps @ 100마리 + 이펙트 벤치마크
- AmbientParticleSystem 풀 80개 상한 확인
- VFXPool 80개 상한 확인
- AudioSource Pool 8채널 상한 확인
```

---

# 16. 프로덕션 파이프라인 — AI-First v3.1

> ⚠️ v2.3 교체: Phase 12주 구조 → AI-First 3단계 25일 로드맵
> 출처: exoduser-ai-first-pipeline-v3.1.md
> 핵심 마인드셋: **뼈대 먼저 → 움직임 검증 → AI 스킨 일괄**

```
"안 돼" 금지. "어떤 AI로 어떻게 하면 돼"만 허용.

X: 캐릭터 하나 뼈대+스킨 완성 → 다음 캐릭터 → 반복
O: 전체 뼈대 먼저 → 전체 움직임 검증 → 전체 스킨 일괄

뼈대가 잘못되면 스킨 다시 만들어야 한다.
뼈대를 먼저 다 잡아야 스킨을 한 번에 끝낼 수 있다.
```

## 16.1 STAGE 1 — 뼈대 전체 구축 (DAY 1-10)

> "placeholder 상태로 전부 돌아가게 만든다"
> 핵심 원칙: atlas_xxx.png 없어도 기존 프로시저럴 폴백으로 게임 항상 동작

| Day | 작업 | 완료 기준 |
|-----|------|---------|
| 1-2 | 렉 제거 | 몹 100마리+이펙트 60fps, 1% Low ≥ 50 |
| 3-4 | 플레이어 뼈대 | SpriteAnimator + atlas_player 폴백 동작 |
| 5-6 | 몬스터 뼈대 | atlas_enemies + etype별 프레임 매핑 |
| 7 | 보스 뼈대 | atlas_bosses + 페이즈 전환 + 시네마틱 |
| 8-9 | 맵/배경 뼈대 | 패럴랙스 3레이어 + 환경 데코 |
| 10 | 사운드 뼈대 | SFX_MAP + BGM 크로스페이드 + 프로시저럴 SFX |

### DAY 1-2: 렉 제거 (클코 프롬프트 3개)
```
[1] AudioBuffer 풀링
    new Audio(url) 전부 제거.
    fetch → decodeAudioData → AudioBuffer 캐시.
    playSample()은 AudioBufferSourceNode만 사용.

[2] 파티클+텍스트 오브젝트 풀
    PART_MAX=1500, TXT_MAX=80 고정 배열.
    active 플래그 + 순환 인덱스.
    게임루프 안에서 {}/new 금지.

[3] Fixed Timestep
    Glenn Fiedler 패턴.
    PHYS_STEP=16.667ms, accumulator 기반.
    fpsCap 제거, performance.now() 통일.
```

### DAY 3-4: 플레이어 뼈대
```
SpriteAnimator 시스템 + atlas_player.png/json 로딩
폴백: 파일 없으면 기존 프로시저럴 렌더 그대로
상태 매핑: idle/move/attack/dodge/hurt/die
draw()에서: atlas 있으면 SpriteAnimator.draw(), 없으면 기존 프로시저럴
```

### DAY 5-6: 몬스터 뼈대
```
atlas_enemies.png + json. 폴백 동일.
etype → 프레임 매핑 JSON: {"etype_00": {"idle":[{x,y,w,h}], ...}}
런타임 팔레트 스왑: initStage() 1회, offscreenCanvas 캐싱.
엘리트 틴트: 매직=파랑 / 레어=금 / 챔피언=빨강+1.2배 크기
```

### DAY 7: 보스 뼈대
```
atlas_bosses.png + json. 사이즈 64x64.
페이즈: HP100~50% → idle/atk1, HP50%↓ → rage
시네마틱: 등장(레터박스+네임카드), 처치(슬로모+페이드)
```

### DAY 8-9: 맵/배경 뼈대
```javascript
MAP_BG_LAYERS = {
  0: [
    {src:'img/bg/hell0_far.png',  parallax:0.3, opacity:0.8},
    {src:'img/bg/hell0_mid.png',  parallax:0.6, opacity:0.9},
    {src:'img/bg/hell0_near.png', parallax:0.9, opacity:1.0},
  ], // 1~6 동일 구조
};
// 이미지 없으면 스킵 (기존 맵 그대로). 넣으면 자동 표시.
```

### DAY 10: 사운드 뼈대
```javascript
// SFX_MAP: 프로시저럴 기본 + 파일 있으면 교체
// 'hit_sword': {type:'procedural', fn: sfxHitSword}
// 'skill_whirlwind': {type:'file', src:'sfx/sk_whirl.mp3'}
// 프로시저럴 기본 5종:
//   sfxHitSword: sawtooth 200→80Hz 0.15초
//   sfxHitMagic: sine 800→200Hz 코러스
//   sfxLevelUp: 아르페지오 C→E→G→C
//   5원소 필터: 화염=크래클, 빙결=리버브 등
// BGM 크로스페이드: GainNode 2초
```

## 16.2 STAGE 2 — 움직임 검증 (DAY 11-12)

> "placeholder 상태에서 전체 게임 플로우 확인"

### DAY 11: 플레이 테스트 체크리스트
```
[ ] 렉: 몹 100마리+이펙트 60fps
[ ] 플레이어: idle↔run 전환 / attack 히트싱크 / dodge 무적프레임
[ ] 몬스터: 20종 전부 idle → attack → hurt 전환
[ ] 보스: 등장 시네마틱 / HP50% rage / 처치 시네마틱
[ ] 배경: 패럴랙스 방향/속도 / 레이어 z-order
[ ] 사운드: 검타격 SFX / BGM 지옥전환 크로스페이드 / 보스전 전환
```

### DAY 12: 규격 확정 ← STAGE 3 AI 프롬프트 입력값
```
*** 이 규격이 확정되어야 스킨을 한 번에 만들 수 있다 ***
*** 규격 없이 스킨 만들면 안 맞아서 다시 만듦 = 시간낭비 ***

플레이어: [W]x[H]px
  idle [N]f speed[N] / run [N]f / attack [N]f / dodge / hurt / die
  히트박스 오프셋: x[N] y[N] w[N] h[N]

몬스터: [W]x[H]px
  idle/attack/hurt/die = 4프레임 (확정 후 etype별 히트박스)

보스: [W]x[H]px
  idle/atk1/atk2/rage = 4프레임

배경: [W]x[H]px, 3레이어, horizontal tiling
```

## 16.3 STAGE 3 — AI 스킨 일괄 (DAY 13-25)

> "검증된 뼈대 위에 AI 스킨 교체. PNG만 바꾸면 끝."
> 핵심: PNG 하나 교체 = 비주얼 전환 (코드와 에셋 완전 분리)

| Day | 작업 |
|-----|------|
| 13-14 | AI 도구 세팅 (PixelLab MCP / Soul ID 학습 / ComfyUI LoRA) |
| 15-16 | PLR 스킨 (Soul ID 컨셉 → PixelLab 규격 생성 → atlas_player.png 교체) |
| 17-20 | 몬스터 스킨 20종 (하루 5종 × 4일, 40분/종 사이클) |
| 21-22 | 보스 스킨 19종 + 배경 21장 (병렬) |
| 23-24 | 사운드 (Suno BGM 14곡 / ElevenLabs +30라인 / SFX 교체) |
| 25 | 최종 통합 + Hicksfield 트레일러 + itch.io + Steam 데모 |

### 1종 스킨 사이클 (40분)
```
[10분] PixelLab/ComfyUI (확정 규격으로 생성)
[10분] Aseprite 5색 팔레트 통일
[5분]  실루엣 테스트
[5분]  7지옥 팔레트 스왑 검증
[10분] 보정
```

## 16.4 핵심 원칙 5가지

```
1. 뼈대 먼저, 스킨 나중
   전체를 placeholder로 돌려본다 → 움직임 검증 → 규격 확정 → AI 스킨 일괄

2. PNG 하나 교체 = 비주얼 전환
   atlas_xxx.png 바꾸면 게임이 바뀜. 스킨 업그레이드 무한히 쉬움.

3. 폴백 항상 유지
   에셋 없으면 기존 프로시저럴 렌더. 어느 시점에서든 게임이 돌아감.

4. AI가 메인 생산 엔진
   도진님 = 디렉터. AI = 아티스트. 월 $30-50으로 아티스트 연봉 대체.

5. 되는 방법만 찾는다
   "안 돼" 금지.
```

## 16.5 엔드게임 콘텐츠

```
심연의 나락 (무한 던전): 35에리어 랜덤 리믹스, 매층 +5%
도전 던전 5종: 시간제한/무피격/원소제한/맨몸/보스러시
뉴게임+ 3단계: ×2/×3/×5 스케일링
몬스터 도감 100종 + 업적 50+
예상 플레이타임: 메인 8~12h / 전체 200h+
```

---

## 플레이타임 목표

```
메인 스토리 (7장 35에리어):  8~12시간
엔드게임 무한던전:            무한
도전 던전 전클리어:           5~10시간
뉴게임+ 3단계:               30~50시간
전 장비 수집:                 100시간+
전 업적 달성:                 150시간+
총 예상:                     200시간+ (PoE2/Diablo4급)
```

---

*EXODUSER MASTER BIBLE v2.2 — Unity Edition*
*마지막 업데이트: 2026-03-11 (CIN_LINES 확정 / Ori 비주얼 공식 통합 / 사운드 상세화 / 에셋 발주 스펙)*
*소스: MASTER_BIBLE_v2.1 + 인트로 대사 확정본 + God Mode AI 프롬프트 + 젤다 사운드 상세*
*다음 업데이트 트리거: Phase 1 Unity 뼈대 완료 시 → v2.3*
