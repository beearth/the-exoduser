# TOOLS — 영상 생성 → 영상 모캡 → FBX 리타깃 경로 (Kling → Move One / DeepMotion / Rokoko Vision) (2026-11-05, 클라우드 조사)

출처(CTO 11-05 전달): 사용자 질문 "애니메이션같이 모션을 제작하면 안 되나" → 평가 ②. 서비스 공식 페이지(docs.move.ai·deepmotion.com·rokoko.com·cascadeur.com)는 이 세션에서 열리지 않아 전부 `[발췌]`다.

## ① 목적 · 단계
- MO 브리프 §2 D-MO-1(동작 출처)의 **추가 후보**: 사용자 연기 영상 대신 **Kling 텍스트→영상**(API연결_가이드 승인 도구, 유료 사용 승인됨·수량은 예산 확인 뒤)으로 만든 측면 전신 클립을 단일 카메라 영상 모캡에 넣어 FBX 클립을 얻고, 공용 스켈레톤(TOOLS 1)에 리타깃한다.
- **무료 가능 여부(한 줄):** 영상 모캡 자체는 무료 티어로 **실험까지는 가능**(Move One 30크레딧 일회성 ≈ 15초, DeepMotion 월 60초, Rokoko Vision Starter 월 30초, 모두 FBX)하지만 **Move One·DeepMotion 무료는 비상업**이라 게임 반입은 유료 플랜 승인이 필요하고, Rokoko Starter의 상업 허용 여부는 미확인이다. Kling 생성은 유료(승인 범위 안, 5초 720p ≈ 30크레딧·API ≈ $0.36~0.42/클립 보도).
- 적합 판단: **보조 경로(실험 1회 뒤 결정).** 장점 = 사용자 촬영 없이 동작 후보를 빨리 뽑음. 단점 = 생성 영상의 프레임 간 비일관성·관절 뒤틀림이 모캡 지터로 그대로 들어가고, 측면 단일 뷰는 다리 겹침으로 접지가 흔들린다(DeepMotion은 3/4 뷰 권장). 모든 결과는 Blender 클린업(MO ④)을 전제한다.

## ② 입력 형식
- Kling 영상: mp4, **2~4초**, 전신이 프레임 안, 단색 배경(마젠타/회색), 몸 형태가 읽히는 의상, 소품 없음(검은 리타깃 뒤 소켓으로 부착), **3/4 측면**(순수 측면은 다리 겹침), 카메라 고정·흔들림 0, 30 fps.
- 모캡 서비스 입력: mp4/mov, 서비스별 길이 상한(Move One 무료 30초, DeepMotion 무료 클립 10~20초 보도 상충, Rokoko 월 30초).

## ③ 옵션 전수표
### ③-1 Kling(승인 도구, 전용 MCP 1.3.3 — API연결_가이드)
| 옵션 | 무엇을 바꾸나 | 우리 값 | 근거 |
|---|---|---|---|
| 모델 버전(2.x / 3.0, Std/Pro) | 품질·크레딧(3.0: 720p 무음 6크레딧/초, 1080p 음성 12/초 보도; 구 5초 Std 10크레딧) | Std 720p 무음, 5초 | fast.io kling-ai-review-2026 `[발췌]`; akool Kling 2.5 가이드 `[발췌]`; API연결_가이드 §Kling(승인·예산) |
| 프롬프트 | 동작·뷰·배경 | "full body, 3/4 side view, static camera, plain grey background, warrior performs a horizontal two-handed greatsword slash, weight shifts back then forward, 30fps" | 모캡 모범 사례 발췌(nerdbot 2026-08; 80.lv iClone AI mocap) `[발췌]` |
| 참조 이미지/모션 제어/Omni-Ref | 캐릭터 일관성·동작 제어 | LOCK 시트 정면·측면 1장 참조(캐릭터 동일성은 모캡에 영향 없음, 실루엣 판독용) | API연결_가이드 §Kling 기능 목록 |
| 비용 기록 | 크레딧 차감 | 요청 전 `who_am_i`·`query_membership_and_credits`, 생성 후 SPEND_LOG | API연결_가이드 §21·§96 |

### ③-2 영상 모캡 서비스 비교
| 서비스 | 무료 티어 | 상업 라이선스 | 유료 | 출력 | 한계·비고 | 출처(접속) |
|---|---|---|---|---|---|---|
| **Move One**(Move AI, 단일 카메라 앱/웹) | 일회성 30크레딧(만료 없음), Gen2 = 2크레딧/초/1인 → ≈15초; 무료 클립 ≤30초(유료 60초) | **Move One 티어 = 비상업**(개인·교육·연구), 상업은 Standard($48~50/월, 180크레딧)+ | Starter $18/월 60크레딧, Standard $48/월 180, Plus $225/월 240, Advanced $490/월 700 (+VAT) | FBX, BVH, USD, BLEND, JSON | 2026-04 Move Pro→Genesis(견적제) 전환 보도; Unity 리타깃 가이드(Hips 매핑 수정·Foot IK·압축 끔) 있음 | docs.move.ai/knowledge/move-one-pricing `[발췌]`; docs.move.ai/…/move-ai-pricing-plans-credits `[발췌]`; docs.move.ai/…/unity-retargeting-move-one-animation-in-unity `[발췌]`; mimem.ai `[발췌]` |
| **DeepMotion Animate 3D** | 월 60크레딧(=60초 몸 동작; 손·얼굴 +0.5/초), 클립 10~20초(상충) | **무료 = 개인·비상업**, 상업은 Starter($9/월 연간·$15 월간, 180크레딧)+ | Starter~Studio($15~300/월), Studio 7,200크레딧 뒤 저우선 무제한 | FBX, BVH, GLB, MP4…(무료 FBX 가능 여부 상충) | Foot-locking Auto/Always, 3/4 뷰 권장, 라벨링으로 무료 크레딧 적립 | deepmotion.com/release-updates `[발췌]`; cinevva ai-animation-generators-3d `[발췌]`; saasworthy `[발췌]` |
| **Rokoko Vision**(브라우저, 단일/듀얼 카메라) | Starter 무료: 월 **30초** Vision 처리, Text-to-Motion 무제한, **FBX 내보내기** | Starter 상업 허용 여부 **미확인** | Basic $12/월(연 $10) 600초, Plus $28/월 3,000초(+BVH), Pro $70/월 15,000초 | FBX(전 플랜), BVH(Plus/Pro) | 구 "무료 무제한 15초 클립"은 2023 정보(현행 아님) | rokoko.com/products/vision `[발췌]`; rokoko.com/pricing `[발췌]`; uthana.com 2026 비교 `[발췌]` |
| (참고) Cascadeur 내장 Video Mocap | Free 포함 | Free 비상업 | — | .casc | **Alpha**, 느림·부정확(공식) | cascadeur.md |

### ③-3 리타깃·반입(공통)
| 옵션 | 우리 값 | 근거 |
|---|---|---|
| 리타깃 도구 | Blender: Rokoko Studio Live 애드온(무료) 또는 Auto-Rig Pro(유료, 보류) / Unity: Humanoid 아바타 자동 리타깃(소스 FBX Rig=Humanoid, Avatar Create From This Model → 대상 영웅 아바타에 클립 적용) | MO 브리프 §3-③; docs.move.ai Unity 가이드 `[발췌]` |
| Unity 보정 | Foot IK 켬, Animation Compression Off(리타깃 검수 중), 루트 모션은 Core 이동량과 대조 | docs.move.ai Unity 가이드 `[발췌]` |
| 클린업(Blender NLA·그래프) | 접점 틱 정렬, 발 접지 고정, 지터 스무딩(Butterworth/Smooth F-curve), 예비·팔로스루 과장 | MO 브리프 §3-④ |

## ④ 절차 (Mac 실습 1회, 승인 범위 안)
1. Kling 전용 MCP로 `who_am_i`·잔액 조회 → 승인된 수량 안에서 **클립 3개**(attack1 3/4 측면 5초 ×2 변주, walk 5초) 생성, 프롬프트·모델·크레딧을 SPEND_LOG와 ⑧에 기록.
2. 영상 전처리: 2~4초로 트림(sprite_gen `video-frames`로 프레임 확인), 전신 프레임 안 확인, 30 fps 유지.
3. 모캡 1순위 **Rokoko Vision Starter**(월 30초, FBX, 로그인 사용자) → 실패/부족 시 Move One 무료 30크레딧(비상업 실험용) → DeepMotion 무료(비상업 실험용). 서비스 설정(foot lock·fps·스켈레톤 프리셋)은 UI 캡처로 기록.
4. FBX → Blender 임포트 → Humanoid 이름 매핑 확인 → 지터·접지 체크(발 높이 그래프) → NLA 클린업 → TOOLS 1 FBX 옵션으로 재내보내기.
5. Unity Humanoid 리타깃 → PixelActorPass 10초 영상 → MO 채점표.
6. 상업 반입 판단: 무료 비상업 서비스로 만든 클립은 **참고용**으로만 두고, 채택 시 해당 서비스 유료 플랜(또는 Rokoko 상업 조건 확인) 승인 뒤 **재처리**한다.

## ⑤ 출력 형식 · 네이밍
- 원본 영상 `I:/EXODUSER-Storage/tm/v2m/<동작>_<서비스>_<날짜>.mp4`, 모캡 FBX `*_raw.fbx`, 클린업 뒤 `CH_<영웅>_A_<동작>_v2m.fbx`(30 fps). 원본 영상은 저장소에 넣지 않음.

## ⑥ 검수 방법
- 접지: 발 본 높이 그래프에서 접지 구간 분산 <1 cm, 발 미끄러짐 0(1x).
- 지터: 손 본 속도 스파이크(프레임 간 >2 m/s) 0.
- MO 채점표 7항목, 사용자 연기 모캡(있으면)·Cascadeur 결과와 같은 프레임 3장 비교.

## ⑦ 금지 · 흔한 실패
- 순수 측면 뷰·소품 든 영상(다리 겹침·검이 팔을 가려 추적 실패).
- 생성 영상의 팔 길이 변동(프레임 간 비일관성)을 모캡이 그대로 뼈 길이 변화로 받음 → 클린업 없이 반입 금지.
- 무료 비상업 티어 결과를 상용 빌드에 넣는 것.
- Kling 추가 충전·신규 구독을 승인으로 해석하는 것(API연결_가이드 §96).
- "출처 없는 절차 생성 금지"와의 관계: 각 서비스 수치는 위 URL 발췌이고 상충 항목(DeepMotion 클립 길이·무료 FBX, Move One 무료 크레딧, Rokoko 상업 조건)은 `[미검증]`으로 표기했다. 실습 때 서비스 UI의 실제 설정·크레딧 차감·약관 문구를 캡처해 ⑧에 남기고, 그때까지 이 경로를 채택 결정의 근거로 쓰지 않는다.

## ⑧ 실습 기록
- Mac 실습 대기(사용자 로그인·Kling 수량 승인 뒤). 기록: 클립 3개 프롬프트·모델·크레딧, 서비스·플랜·설정 캡처, 접지/지터 수치, 채점표, SHA, SPEND_LOG 줄.
