# MANUAL 15 — 성능 예산 (폴리곤·텍스처·드로우콜·프레임 시간·GC·로딩) (초안 2026-11-05)

- 상태: 초안(3차 반영 11-05) | 출처 상태: SOURCE_VERIFY 0a9b84e(CX22-5 최종) 기준 | 연구 반영: **3차: codex_asset_size(Resources 폴더별·참조 대조·텍스처 규칙·Steam 용량 목표·절감 순서), FIRST_SCENE_PLAN(§7 측정 관문), codex_synthesis(§1.14 성능 원칙·§2 Resources/A2R 판정), ENGINE_TRIAL_UE5_PLAN(§9 성능 판정 기준)**, 이전: poe2(§8 성능 예산, §9 L1·L2·F1), d4_01_env(§3~§5 소품·베이크 수치), d4_03_cam(R6 발광 단계), conventions(J2, K4 그래픽 옵션), **2차: codex_tech_budget(공개 자료에 정량 예산 대부분 없음 확인, 최소 사양·FPS 환산 반영), our_tech_audit(Resources 원본 2,881,554,015 byte·상위 위험 30개·현재 상태 대비), TOOLCHAIN(§3a~§3d 패스 예산 합계 14.7ms, BudgetCheck c-5), ENGINE_DECISION(UE5 칸 점검)** | 연구 반영 대기: 없음. 단 삼각형·텍스처·draw call·파티클·voice·GC의 7종 공개 수치는 "확인 불가"가 결론이라 계속 [추정] 시작값이고, 모든 항목은 Mac M5 Pro 첫 실측 후 개정
- 범위: 1-1 한 판(데모 v0) 기준 60fps를 지키는 예산. 지형·소품·캐릭터(픽셀 렌더)·조명·후처리·VFX·로딩·메모리.
- 이 문서가 정하지 않는 것: 규칙 코어 틱 레이트와 시뮬 비용(코어 소관), 웹판 성능 문서(`docs/12퍼포먼스·최적화/` 대부분이 웹 H5 이력이라 Unity 예산의 근거로 쓰지 않는다. 메모 참고만).
- 기준 하드웨어: PC(High) = 컴파일·빌드 담당, **판정은 Mac(M5 Pro)에서 한다**(CLAUDE.md 3.4). 목표는 둘 다 1920×1080 60fps. 32:9 3840×1080도 성립해야 한다(21:9는 2560×1080)(CLAUDE.md 4.2-4). 저사양 하한 기기 정의는 아직 없다 → 결정 D15-1.

## 1. 목표 장면·레퍼런스 (무엇을, 왜)

| 항목 | 내용 |
|---|---|
| 목표 장면 | 1-1 키샷: 소품 군집 4~7개, 먼 적 3마리 이상, 영웅 빛, 높이 안개, 전투 중 VFX, HUD 켬 |
| 목표 | 최악의 순간(밀집 전투 + 보스 대기술)에도 60fps, 프레임 스파이크 없음 |
| 레퍼런스 | PoE2(그림자 광원과 GI가 가장 큰 성능 항목, 설정 등급으로 대응) [사실, poe2 S13·S14], D4(정적 그림자 미리 계산 + 동적 얹기) [사실, d4_01 §5.1] |
| 왜 문서로 못 박나 | 분위기·밀도 요구(01·02)가 예산을 먹는다. 예산이 없으면 "멋있게 만들었는데 끊긴다"가 된다 |

## 2. 디렉션 원칙

1. **60fps가 예산의 기준이다.** 프레임 시간 16.6ms. 이유: 전투 판독과 입력감.
2. **비싼 것은 이야기가 있는 곳에만 쓴다.** 그림자 광원, 볼륨 효과. 이유: 비용 최대 항목 [사실, poe2 S14].
3. **구울 수 있는 것은 굽는다.** 정적 그림자·간접광. 이유: 런타임 비용이 낮다(크기는 실측 필요) [근거 없음 — CX22 출처 검증에서 "비용 0" 미확인, 정정 11-05].
4. **예산은 장면 단위가 아니라 최악의 프레임 단위로 잰다.** 평균이 아니라 p99. 이유: 스파이크가 체감이다.
5. **전투 중 메모리 할당(GC) 0을 지향한다.** 풀링, 문자열 생성 금지. 이유: 스파이크 방지 [추정].
6. **로딩은 멈춤이 없고, 막히면 복구한다.** 이유: 크래시 0 목표 [사실 내부, conventions J2].
7. **품질 옵션으로 줄일 수 있게 만든다.** 그림자·간접광·후처리 등급. 이유: 하한 기기 대응 [사실, poe2 S13].
8. **새 에셋은 예산 항목에 등록 후 반입한다.** 이유: 무분별한 증가 방지.
9. **측정은 같은 장면, 같은 카메라, 같은 도구로.** 이유: 비교 가능성.
10. **예산 초과는 RETOUCH다. 품질선을 낮춰 맞추지 말고 구조(베이크, 배칭, LOD)로 맞춘다.** 이유: CLAUDE.md "범위는 좁혀도 품질선은 낮추지 않는다".

## 3. 수치 기준

### 3.1 프레임 시간(목표 1920×1080 60fps)

| 항목 | 값 | 근거 | 출처 상태 |
|---|---|---| --- |
| 총 프레임 시간 | 16.6ms 이하 (p99 기준) | [추정] | 우리 기준 |
| GPU 총합 | PC·Mac 모두 14.7ms 이하(항목 합계, 3.2표). 이전 초안 PC 12ms/Mac 14ms는 항목 합과 모순이라 개정 | [추정] 7종 공개 자료에 CPU/GPU 분배표 없음(codex_tech_budget §6.1·§12). TOOLCHAIN §3a 합계 14.7ms 제안과 정합 → D15-7★ | 우리 기준 |
| CPU 메인 스레드 | 10ms 이하 | [추정] 공개 자료 없음(codex_tech_budget §6.1), 우리 기준. 현재 CPU 위험은 3.8표 CPU 관문 | 우리 기준 |
| 프레임 상한 옵션 | 기본 상한 60, 옵션 120/무제한 | [사실 내부] `NativeGame.cs:104`(코드 기본 targetFrameRate 120), 설정 FrameCap(`NativeGame.cs:737`) | 내부 |
| 3840×1080 | 1080p 대비 GPU 시간 +40% 이내 | [추정] 계산: 처리 픽셀 2배(4,147,200 vs 2,073,600, codex_urp_mood §3). GPU 시간 2배는 아님, 실측 필요 | 우리 기준 |

### 3.2 GPU 항목별

| 항목 | PC | Mac | 근거 | 출처 상태 |
|---|---|---|---| --- |
| 안개 패스(높이 안개·산란) | 1.2ms | 1.2ms (저비용판 0.6ms 시험) | [추정] TOOLCHAIN §3a a-4 (PC ≤1.2, Mac 저비용판 ≤0.6). 이전 초안 1.0/1.5ms 개정 | 우리 기준 |
| 화면 공간 AO | 0.8ms | 0.8ms | [추정] TOOLCHAIN a-6 ≤0.8ms. 이전 1.0ms 개정 | 우리 기준 |
| 후처리 전체(톤맵·LUT·블룸·비네트) | 1.0ms | 1.0ms | [추정] poe2 §8, TOOLCHAIN 합계표 동일 | 우리 기준 |
| 그림자(키라이트 + 장소) | 2.0ms | 2.0ms | [추정] TOOLCHAIN §3a. 이전 초안 2.5/3.0ms 개정 | 우리 기준 |
| 지형·소품 본 렌더(불투명 월드) | 5.0ms | 5.0ms | [추정] TOOLCHAIN §3a. 이전 초안 PC 4.0/Mac 5.0ms | 우리 기준 |
| 캐릭터 픽셀 렌더(PixelActorPass) | 2.0ms | 2.0ms | [추정] TOOLCHAIN a-1 (30적+영웅+보스). 이전 1.0/1.5ms 개정. 현재는 액터마다 개별 카메라 요청이라 이 값 달성 불확실(3.8표 #02) | 우리 기준 |
| 데칼·가림 투명화·실루엣 | 1.2ms | 1.2ms | [추정] TOOLCHAIN §3a (a-5 0.5 + a-2 0.5 + a-3 0.2) | 우리 기준 |
| VFX(파티클) | 1.0ms | 1.0ms | [추정] TOOLCHAIN §3a. 이전 초안 2.0/2.5ms는 데칼 포함 값이라 분리 | 우리 기준 |
| UI | 0.5ms | 0.5ms | [추정] TOOLCHAIN §3a. 이전 0.8/1.0ms 개정 | 우리 기준 |
| **합계** | **14.7ms** | **14.7ms** | 계산: 1.2+0.8+1.0+2.0+5.0+2.0+1.2+1.0+0.5 = 14.7. 16.6ms 대비 여유 1.9ms. Mac M5 Pro 측정 전 시작값 | 우리 기준 |

**정합 점검(2차 반영):** 이전 초안 항목 합계는 PC 13.3ms, Mac 16.5ms인데 총합 한도는 PC 12ms, Mac 14ms였다. 항목 합이 한도를 넘는 모순이었다. TOOLCHAIN §3a 표로 바꿔 합계를 14.7ms로 맞췄다. 총합 한도(3.1)는 결정 D15-7★에서 확정한다. PoE2의 GI 부분 비용 약 3ms(GTX 1050, Radiance Cascades)는 특정 구현의 부분 값이라 우리 예산 근거로 쓰지 않는다 [단일] codex_tech_budget §6.3.

### 3.3 조명·그림자

| 항목 | 값 | 근거 | 출처 상태 |
|---|---|---| --- |
| 그림자 있는 광원(키라이트 제외) | 화면당 4 이하(PC), 2 이하(Mac) | [추정] poe2 §8 | 우리 기준 |
| 그림자 없는 점광원 | 16 이하(PC), 8 이하(Mac) | [추정] poe2 §8 | 우리 기준 |
| 키라이트 그림자 거리 | 45m, 단계 3 | [단일] poe2 L1 | 미검증 |
| 그림자 해상도 | 2048(PC), 1024(Mac). 장소 광원은 1024 | [추정] poe2 L1 | 우리 기준 |
| 간접광 프로브 메모리 | 256MB 이하(현 설정 1024MB는 실측 후 낮춤) | [추정] poe2 §8 | 우리 기준 |
| 베이크 시간 | 10분 이하(Mac) | [추정] poe2 L2 | 우리 기준 |
| 베이크 해상도 | 8~12 texel/u | [추정] d4_01 T7 | 우리 기준 |

### 3.4 지오메트리·텍스처

| 항목 | 값 | 근거 | 출처 상태 |
|---|---|---| --- |
| 화면 삼각형 합계 | 300k 이하 | [추정] poe2 E1 | 우리 기준 |
| 큰 소품 1개(고목·큰 바위) | 6~12k 삼각형 | [추정] d4_01 T1 | 우리 기준 |
| 중간 소품 | 1~3k | [추정] 7종 공개 수치 없음(codex_tech_budget §3), 우리 기준 | 우리 기준 |
| 작은 소품·카드 | 0.2~0.5k | [추정] 7종 공개 수치 없음(codex_tech_budget §3), 우리 기준 | 우리 기준 |
| 지면 타일 | 2048² × 4층, 마스크맵 포함 | [추정] d4_01 G-2 | 우리 기준 |
| 데칼 아틀라스 | 2048² 1~2장 | [추정] d4_01 A-2 | 우리 기준 |
| 텍스처 메모리 총합 | 1.5GB 이하(VRAM 사용 기준) | [추정] 7종 공개 상주 예산 없음(codex_tech_budget §4). 현재 원본 규모는 3.8표 #22~26 참고 | 우리 기준 |
| 영웅 모델(리깅 3D) | 20~40k 삼각형 | [추정] 7종 공개 수치 없음(§3). 현재 R7 원본 93,437 삼각형(our_tech_audit #20)이라 상한 초과 → 3.8표. 캐릭터 매뉴얼과 조율 | 우리 기준 |
| 일반 적 | 3~8k 삼각형 | [추정] 7종 공개 수치 없음(§3). 현재 적 30종 원본 12,240~13,047 삼각형(our_tech_audit #19)이라 상한 초과 | 우리 기준 |
| 보스 | 40~80k 삼각형 | [추정] 7종 공개 수치 없음(§3). 현재 보스 모델 수치는 미집계 | 우리 기준 |
| 거리 단계(LOD) | 큰 소품 2단계, 카드는 단일 | [추정] | 우리 기준 |
| 압축 | 색 BC7 상당, 노멀 BC5 상당, 마스크맵 BC7 | [추정] 공개 자료 없음. 현재 Default 압축 0(무압축) 853/1,057개(our_tech_audit §5) → 목표와 차이, 3.8표 #22 | 우리 기준 |

### 3.5 드로우콜·배칭·VFX

| 항목 | 값 | 근거 | 출처 상태 |
|---|---|---| --- |
| 드로우콜(배치) | 1500 이하/프레임 | [추정] 7종 공개 상한 없음(codex_tech_budget §5). 현재 값 미측정(our_tech_audit §4) | 우리 기준 |
| 인스턴싱 대상 | 식생 카드, 반복 소품 | [추정] d4_01 T6 | 우리 기준 |
| 동시 적 수(렌더) | 코어 최대치 기준 판정, 표현 비용 측정 | 공개 자료 없음(codex_tech_budget §5). V Rising 60인·160,000 오브젝트는 서버·월드 규모라 화면당 적 수 아님 | 우리 기준 |
| 가산 이펙트 화면 면적 | 12% 이하 | [단일] yellowsky 규칙 3 | 미검증 |
| 패링 충돌 이펙트 동시 | 4 이하(풀링) | [추정] yellowsky 4.1 | 우리 기준 |
| 파티클 총수 | 5000 이하 | [추정] 공개 상한 없음(codex_tech_budget §7). V Rising 2,700 particle systems는 시스템 개수라 동시 활성 수와 다름 | 우리 기준 |
| 발광(HDR) 단계 | 기본 ≤1.5, 스킬 ≤3, 궁극기·보스 ≤6 | [추정] d4_03 R6 | 우리 기준 |

### 3.6 GC·메모리·로딩

| 항목 | 값 | 근거 | 출처 상태 |
|---|---|---| --- |
| 전투 중 프레임당 관리 메모리 할당 | 0 목표, 허용 1KB 이하 | [추정] | 우리 기준 |
| GC 스파이크 | 1-1 한 판 중 2ms 초과 0회 | [추정] | 우리 기준 |
| 전체 메모리(작업 세트) | 8GB 이하 | [추정] 공개 자료 없음. 공개 최소 RAM은 4~16GB(3.9표) | 우리 기준 |
| 1-1 로딩 시간 | 준비 상한 12초(코어 흐름 값), 목표 8초 이하(SSD) | [사실 내부] `NativeScreenTransition.cs`, [추정] 목표 | 내부 |
| 로딩 감시 | 조립 20초 / 기타 12초 / 절대 120초 | [사실 내부] `NativeScreenTransition.cs` | 내부 |
| 텍스처 첫 사용 끊김 | 전투 진입 전 워밍업, 첫 킬 끊김 0 | [사실 내부] `docs/12퍼포먼스·최적화/COMBAT_TEXTURE_WARMUP_20260929.md`(웹 이력, 개념만 참고) | 내부 |
| 빌드 용량 | 데모 패키지 4GB 이하 | [추정] 공개 설치 용량 15~145GB(3.9표)와 별개. 현재 Resources 원본만 2.88GB라 4GB는 빠듯함 → D15-8★ | 우리 기준 |
| 동시 음성(실제/가상) | 현재 프로젝트 실제 32 / 가상 512. SFX 논리 풀 48(타격 3·예고 2·일반 6/flush). 환경·BGM·영상 소스는 풀 밖 | [사실 내부, 정적 집계] our_tech_audit §3 #29, `P/AudioManager.asset:13-14`, `NativeFeedbackAudio.cs`. 7종 공개 voice 상한 없음(codex_tech_budget §8) | 내부 |
| 오디오 임포트 | SFX·앰비언트 138개 PCM 전부 사전 로드, BGM 16개 압축(메모리 상주) | [정적 집계] our_tech_audit §5. 실제 디코드 크기·DSP 비용 미측정 | 내부 |

### 3.7 현재 상태 대비 (2차 반영: our_tech_audit 정적 집계)

**기준:** `docs/0마스터플랜/GAME_STUDY/our_tech_audit.md`, 기준 HEAD `75add6ff`, 정적 분석 전용. 실행 성능은 측정하지 않았다(§7 후속 관문). 아래 값은 Git 원본 byte 또는 파일 파싱 결과이며 설치 용량·VRAM·상주 RAM과 다르다.

| 항목 | 현재 정적 값 | 3.4~3.6 목표 | 차이 | 근거 | 출처 상태 |
|---|---|---|---|---| --- |
| **Resources 원본 총량** | **1,417파일 / 2,881,554,015 byte (≈2,748 MiB ≈ 2.684 GiB)** | 데모 패키지 4GB 이하 | 원본만 목표의 약 72%. 최종 포함 byte는 Build Report로 확인 필요 | our_tech_audit §6, #30 | 내부 |
| Resources 하위 | Art 2,639,706,495 B (2,517 MiB) / Audio 138,608,912 B (132 MiB) / Enemies3D 99,711,618 B (95 MiB) / Data 2.3 MiB / VFX 0.95 MiB | — | Art가 91.6% | 같은 §6 | 내부 |
| Art 하위 | FullscreenWide 128파일 1,112,785,500 B (대표 7680×2160) / map 348파일 586,511,657 B / fonts 30파일 110,748,202 B / lobby 43,659,500 B / enemy 27,507,104 B | — | 와이드 원화가 단일 최대 | 같은 §6 | 내부 |
| StreamingAssets | 12파일 68,692,282 B (Resources와 별도) | — | — | 같은 §6 | 내부 |
| 영웅 R7 모델 | 정점 142,733 / 삼각형 93,437 | 영웅 20~40k 삼각형 | 약 2.3~4.7배 | our_tech_audit #20 | 내부 |
| 일반 적(30종) | 삼각형 12,240~13,047 (EyeMass 정점 25,168) | 3~8k 삼각형 | 약 1.5~4배 | #19 | 내부 |
| 월드 모듈 | r3 거목각 19,888 / Hollow 26,876 / 전경 로그 45,719 삼각형 | 큰 소품 6~12k | 1.7~7.6배 | #21 | 내부 |
| FBX 전체 | 88파일 정점 2,108,625 / 삼각형 환산 1,653,385 (메시 asset 38개 삼각형 152,174) | 화면 삼각형 300k 이하 | 파일 총량이라 프레임 값과 직접 비교 금지 | §4 | 내부 |
| 텍스처 임포트 | 1,057개. 상위 max 8192=289, Default cap 8192=846, Default 압축 0(무압축)=853, 밉 끔=569, 스트리밍 밉=0 | 색 BC7 상당 압축, 지면 2048² | 압축 정책이 목표와 다름 | §5, #22·#26 | 내부 |
| 적 8방향 atlas | idle 8장 2048×1280, walk 8장 8192×1280. 원본 크기 RGBA32 가정 시 약 400 MiB | 텍스처 메모리 1.5GB 이하 | 한 항목이 27% 가정치 | #23 (가정, 실제 포맷 미확인) | 내부 |
| 와이드 원화 캐시 | 7680×2160 RGBA32 한 장 ≈ 63.28 MiB, 방문분 static 캐시 해제 경로 없음 | — | 방문 누적 | #24 | 내부 |
| 틱 중 적 목록 복사 | `Enemies.ToArray` 매 틱. 적 800·참조 8byte 가정 시 약 0.37 MiB/초 | 전투 중 할당 1KB/프레임 이하 | 목표 초과 가능 | #04 (계산은 [추정]) | 내부 |
| URP PC High / Mac Balanced | MSAA 4/2, 주광 그림자 2048/1024, 추가광 8/6, 추가광 그림자 1/0, 그림자 거리 45/32, 캐스케이드 3/2 | 3.3 그림자 광원 PC 4·Mac 2, 키 그림자 거리 45m | Mac 현재 거리 32, 추가광 그림자 0. 기기 배정은 OS가 아니라 품질 인덱스(≥3=PC)라 Mac이 PC 자산을 쓸 수 있음 [추정] | §2, `E/Rm0EngineSetup.cs:84` | 내부 |
| 배칭 | SRP Batcher 켬, Dynamic Batching 끔 | 인스턴싱 대상 식생·반복 소품 | SRP Batcher 켬은 병합 증거가 아님 | §2 | 내부 |
| 수면 반사 | 960×540 ARGBHalf 추가 패스, D3D12는 꺼짐 | — | Mac·D3D11만 켜짐, 비용 미측정 | #17 | 내부 |

### 3.8 상위 위험 30개 요약 (정적 위험도 순, 실측 병목 순위 아님)

출처: `docs/0마스터플랜/GAME_STUDY/our_tech_audit.md` §3 (정적 분석, 실행·프로파일링 없음). 영향 란은 §7의 후속 측정 관문(CPU/GPU/MEM/AUD/BUILD)이다. 수정은 제안뿐이며 Core 순서·34° 카메라·발/피격 앵커·원본 UI 글자 품질을 보존해야 한다. 파일 경로는 `R/`=`unity/Assets/Exoduser/Runtime/`, `E/`=`.../Editor/`, `A/`=`unity/Assets/Exoduser/`.

| # | 문제 | 대표 위치 | 영향 | 방향 | 난이도 | 출처 상태 |
|---|---|---|---|---|---| --- |
| 01 | 전역 SpriteRenderer 검색을 Late마다 | `R/NativeGame.Remodel3D.cs:217` | CPU/MEM | 생성·파괴 때 등록, 대상만 투영 | 중 | 내부 |
| 02 | 적마다 카메라 렌더 요청·개별 RT | `R/NativeEnemyRigRenderer.cs:85` | CPU/GPU/MEM | 공유 RT 아틀라스·거리별 주기 (TOOLCHAIN a-1 PixelActorPass와 동일 방향) | 대 | 내부 |
| 03 | sprite 캐시 히트에도 문자열 생성 | `R/NativeGame.cs:445` | CPU/MEM | 값 타입 키·미리 만든 배열 | 중 | 내부 |
| 04 | 매 틱 적 목록 ToArray | `R/Core/Simulation.cs:145` | CPU/MEM | 재사용 스냅샷·지연 큐(순서 보존) | 대 | 내부 |
| 05 | AI 질의 새 목록·전체 탐색 | `R/Core/Simulation.EnemyAi.cs:232` | CPU/MEM | 틱별 공간 인덱스·버퍼 | 대 | 내부 |
| 06 | 근접 연출 배열·Tuple·캡처 | `R/NativeGame.MeleeParry.cs:19` | CPU/MEM | 직접 처리·값 타입 | 중 | 내부 |
| 07 | 숨긴 2D 지면 청크 관리 | `R/NativeGame.cs:400` | CPU/MEM | 범위 변경 때만 갱신 | 중 | 내부 |
| 08 | 드롭 HashSet 매 프레임 생성 | `R/NativeGame.WorldDrops.cs:88` | CPU/MEM | scratch Set 재사용 | 소~중 | 내부 |
| 09 | 숨은 적도 리그 pose 평가 | `R/NativeEnemyRigRenderer.cs:53` | CPU/MEM | 틱 캐시·가시성 샘플링 | 중~대 | 내부 |
| 10 | Actor별 조명 순회·빈 결과 재Find | `R/NativeEnemyRigRenderer.cs:80` | CPU/MEM | 공통 조명 등록소 | 중 | 내부 |
| 11 | HUD 글리프별 측정·그리기 | `R/NativeObjectivePanel.cs:48` | CPU/GPU/MEM | 레이아웃 캐시 | 중 | 내부 |
| 12 | 플로팅 텍스트 후보 목록 | `R/NativeFloatingTextLayout.cs:52` | CPU/MEM | 버퍼 풀 | 중 | 내부 |
| 13 | 검수 OFF에도 provenance 문자열 | `R/NativeUiAudit.cs:33` | CPU/MEM | 호출부 Active 가드 안에서 생성 | 소 | 내부 |
| 14 | 적 상한(800→700) 정리 시 임시 컨테이너 | `R/Core/Simulation.EnemyCap.cs:19` | CPU/MEM | scratch 확보, 순서 보존 | 중~대 | 내부 |
| 15 | JS 객체 이벤트 boxing | `R/Core/EnemyHurtContext.Tail.cs:10` | CPU/MEM | typed DTO | 대 | 내부 |
| 16 | 반복 GetComponent | `R/NativeGame.Remodel3D.cs:199` | CPU | 참조 저장 | 소~중 | 내부 |
| 17 | 수면 반사 추가 패스 | `R/A2RiverReflection.cs:25` | CPU/GPU/MEM | 최대 주기 제한·가시성별 갱신 | 중 | 내부 |
| 18 | 개별 합성/데칼 머티리얼 | `R/NativeEnemyRigRenderer.cs:50` | GPU/MEM | 공유 RT·데칼 아틀라스 | 중~대 | 내부 |
| 19 | 작은 적에도 원본 약 1.2만 삼각형 | `A/Resources/Enemies3D/EyeMass.fbx.meta:34` | CPU/GPU | 저폴리·거리 LOD·캡처 주기 | 대 | 내부 |
| 20 | 고밀도 영웅(93k 삼각형)·초기 표면 정리 | `R/NativeRigPixelHero.cs:33` | CPU/GPU/MEM | 법선 Editor 베이크·LOD | 대 | 내부 |
| 21 | 반복 숲 모듈·개별 메시 변형 | `R/NativeGame.A2Field.cs:145` | CPU/GPU/MEM | 접지 베이크·저폴리·instancing | 대 | 내부 |
| 22 | 광범위 8192·무압축 임포트 정책 | `E/SourceTextureImporter.cs:17` | MEM/BUILD | 종류별 크기·압축 정책 | 중~대 | 내부 |
| 23 | 8방향 적 atlas 메모리 | `R/NativeGame.cs:470` | MEM/BUILD | 리그 사용 시 소스 atlas 지연 | 중~대 | 내부 |
| 24 | 와이드 원화 캐시 수명 | `R/NativeFullscreenArtwork.cs:10` | MEM/BUILD | 화면별 세트·LRU | 중 | 내부 |
| 25 | meta·Default·postprocessor 불일치 | `E/SourceTextureImporter.cs:36` | MEM/BUILD | 정책 정리·임포트 결과 확인 | 중 | 내부 |
| 26 | 밉 스트리밍 미사용 | `P/QualitySettings.asset:305` | GPU/MEM | 월드 큰 텍스처만 검토(UI·픽셀은 제외) | 중 | 내부 |
| 27 | PCM 사전 로드·BGM 설명 차이 | `E/SourceAudioImporter.cs:10` | AUD/MEM | 종류별 정책 | 중 | 내부 |
| 28 | 음향 flush 임시 목록·누적 로그 | `R/NativeFeedbackAudio.cs:40` | CPU/MEM | 재사용·제한 링 | 소~중 | 내부 |
| 29 | 논리 48 vs 실제 32 voice | `R/NativeFeedbackAudio.cs:262` | AUD/CPU | 전 소스군 총합 예산 | 중 | 내부 |
| 30 | Resources 큰 원본 세트 (2.88GB) | `R/NativeFullscreenArtwork.cs:23` | BUILD/MEM | demo/정식·언어·챕터 포함 계약 | 대 | 내부 |

완화 요인: GUIStyle 초기화·재사용, 드롭 mask/beam material null 가드, 죽은 Volume/Bloom 목록 재사용은 이미 되어 있다 [사실, our_tech_audit §3]. 이 표는 "전부 고친 뒤에야 예산 합격"이 아니라, 3.2 예산을 어기는 원인 후보다. 상위 항목 중 02·09·19·20은 PixelActorPass(TOOLCHAIN a-1)와 영웅·적 모델 상한(캐릭터 매뉴얼)에서 함께 해결한다.

### 3.10 Resources 용량 절감 계획 대조 (3차 반영: codex_asset_size, 계획이며 미실행)

원본 byte·임포트 payload·설치·다운로드·RAM/VRAM은 서로 다른 지표다. 이 절의 숫자는 Git 원본 또는 소스 직렬화 설정이며 빌드 감소 보장이 아니다. 기준 HEAD `75add6ff`, 현재 Player/Steam 실제 용량은 **미측정**.

| 항목 | 값 | 근거 | 출처 상태 |
|---|---|---| --- |
| Resources 원본 | 1,417파일 2,881,554,015 byte = 2,748.06 MiB = 2.684 GiB (십진 2.882GB). 앞의 "2,751MB" 표기와 약칭 "2.75GB"는 같은 범위의 다른 표기이며 환산으로 맞추지 않음 | [사실] codex_asset_size §1, codex_synthesis §2 | 내부 |
| 하위 최대 | Art/FullscreenWide 128파일 약 1,061.23 MiB(PNG 픽셀 합 620,980,304, 최대 7680×2160, 모두 max8192/무압축/밉 없음), Art/map/a2 233파일 405,608,808 byte, Enemies3D 32파일 99,711,618 byte (부분집합이라 더하지 않음) | [사실] §2, §7.2 | 내부 |
| A2R | 별도 브랜치 보존분 797파일 1,247,335,249 byte. 현재 HEAD에 없음 → **현재 절감량·분모에 넣지 않음** | [사실] §1 | 내부 |
| Resources 안 텍스처 .meta | 998개: Default 압축 0(무압축) 831 / HQ 167, 밉 켬 454, Read/Write 켬 23, Default max 8192 = 831 / 2048 = 167. (전체 1,057개 집계와 분모가 다름) | [사실] §5.1 | 내부 |
| 후보 | 카탈로그 도달불가 와이드 68개 655.08 MiB, 일반 미참조 73개 63.14 MiB(OFL 9개 보존), 판단 불가 361개. 검토 상한 합 718.22 MiB — 설치 감소 보장 아님, 삭제 확정 0 | [사실] §3~§7.1 | 내부 |
| 텍스처 payload 이론값 | 와이드 128개 BC7 8192 기준 592.44 MiB(RGB24 가정 1,776.64 / RGBA32 2,368.85). 유지 60개 BC7 4096 cap = 206.17 MiB. 68개 제외 + 60개 BC7 + 4096 cap이면 기준 대비 이론 차이 1,570.47–2,162.68 MiB | [추정·계산] §7.2. 실제 임포트 포맷·Player 크기 미확인 | 내부 |
| Steam 내부 목표 | 다운로드 ≤1.0 GiB, 설치 ≤2.0 GiB/OS (1-1 한 판·타이틀/로비·필수 언어·모든 화면비·오프라인 재실행 포함). 설치 1.0 GiB는 후속 도전 목표 | [추정·제안] §6. Halls of Torment Prelude 요구 공간 1GB 한 사례 [사실], Steam 일률 권장 GB는 없음 | 우리 기준 |
| 텍스처 규칙 제안 | 유지 와이드 배경: BC7 HQ 시험 후 4096 cap 검토(32:9 3840px에 2048 일괄은 확대 발생해 불채택). UI 원화·글자·9-slice는 최초 일괄 압축 제외(no-mip 규칙 보존). 3D a2/PBR는 HQ 압축 유지, 기본 2048·작은 소품 1024·보조 512. 픽셀 atlas는 셀 경계 검증 뒤 개별, 좌표로 Sprite를 만드는 atlas는 자동 축소 제외 | [추정] §5.3 (미적용). 기존 제약: `SourceTextureImporter.cs`, `SilverUiImportCheck.cs`, `PortVerification.cs` | 우리 기준 |
| 로딩 방식 | 로컬 번들로 재포장만 하면 전체 설치량이 줄지 않음. 배포하지 않는 그룹이 실제 빌드·depot 목록에서 빠져야 줄어듦. 작업량: 포함 명세 2–4인일 / 원화만 Addressables 5–8 / 전체 12–20 / 직접 AssetBundle 15–25 | [추정] §4 | 우리 기준 |
| 실행 순서 | ① baseline Build Report ② 도달불가 와이드 68개 확인 ③ 일반 미참조 ④ 유지 원화 압축 시험 ⑤ 필요한 해상도만 제한 ⑥ 데모 제외 그룹 분리 ⑦ 원화 Addressables | [추정] §7 | 우리 기준 |

**첫 장면 측정 관문 (FIRST_SCENE_PLAN §7):** 고목·소품 가시 인스턴스·삼각형·draw/SetPass·그림자 패스, 물 반사·수면 패스, 리그 적 RT 요청 수·시간, 후처리·안개 비용을 같은 카메라·적 수·해상도에서 Mac이 잰다. CPU/GPU 프레임, GC, 텍스처/RT 실제 상주 메모리, 첫 가시 프레임 지연을 기록하고 GPU 지표를 못 얻으면 0ms가 아니라 "미측정"으로 쓴다. 예산 초과 시 새 광선·반사·후처리부터 한 요소씩 줄이고 먼 적·34° LOCK·점 0을 희생하지 않는다. 군집화했다고 성능이 자동 개선됐다고 쓰지 않는다.

### 3.9 공개 PC 최소 사양 (하한 기기 정의 참고, D15-1)

출처: `docs/0마스터플랜/GAME_STUDY/codex_tech_budget.md` §10, 조사일 2026-11-05 상점 열람 [사실]. 최소 사양 기준이며 FPS 조건이 있는 것만 적었다.

| 게임 | GPU 최소 | RAM | 저장 | FPS 조건 | 출처 상태 |
|---|---|---|---|---| --- |
| Diablo IV | GTX 660 / Arc A380 / R9 280 | 8GB | 90GB SSD | 출력 1080p / 렌더 720p / Low / 30 FPS. 권장은 1080p Medium 60 FPS | 미검증 |
| Path of Exile 2 | GTX 960(3GB) / RX 470 | 8GB | 100GB | 미확인 | 검증됨 |
| Last Epoch | GTX 1060 / RX 580 | 8GB | 22GB | 미확인 | 검증됨 |
| No Rest for the Wicked | GTX 1080 / Radeon 5600 XT | 16GB | 46GB SSD | 미확인 | 검증됨 |
| Phantom Blade Zero | GTX 1660 6GB / RX 5500 XT 8GB | 16GB | 145GB SSD | 1080p / 30 FPS / 업스케일링 활성 | 검증됨 |
| Hades 1 | VRAM 1GB, DX10 | 4GB | 15GB | 콘솔 60 FPS 공식 목표만 확인 | 검증됨 |

프레임 간격 환산: 30 FPS = 33.33ms, 60 FPS = 16.67ms, 120 FPS = 8.33ms (계산) [사실, codex_tech_budget §6.1]. 7종 모두 모델 삼각형·텍스처 해상도·화면당 적 수·draw call 상한·동시 파티클·voice 수·GC pause의 **공개 수치는 확인되지 않았다**(codex_tech_budget §3~§9, §12). 이 문서의 해당 수치는 계속 [추정] 시작값이다. 유일한 정량 단서는 Last Epoch의 특정 장면 40 FPS대 중반 → 약 100 FPS 사례(조건 미공개)와 V Rising의 배칭 CPU 절감 "수 ms" 개발자 추산이다. 이를 일반 배율로 쓰지 않는다.

## 4. 제작 도구

| 역할 | Unity 추천 (확정) | UE5 대응 | 대안 |
|---|---|---|---|
| 프레임 시간 측정 | Unity Profiler + Frame Timing Manager, 빌드에서 수집 | Unreal Insights, stat unit | 외부 GPU 캡처(Mac Xcode GPU Capture) |
| GPU 패스 분석 | Xcode Metal Debugger(Mac), RenderDoc(PC) | Unreal GPU Visualizer | — |
| 메모리 | Memory Profiler 패키지 | Memory Insights | — |
| 예산 검사 자동화 | 자체 커스텀 툴 `BudgetCheck` | 같은 개념 | 수동 표 점검 |
| 로그·스모크 | 공용 실행기 스모크 + 로그 파일 | — | — |
| 에셋 검사(TOOLCHAIN d-1) | `AssetPostprocessor` 폴더별 임포트 규칙(텍스처 최대 크기·압축·밉, 모델 단위·Read/Write 끔·삼각형 상한 경고, 오디오 로드 방식). 미리 빌드한 DLL 권장 | Interchange 파이프라인 + Data Validation | — |
| 빌드 크기 감시(TOOLCHAIN d-3) | `IPostprocessBuildWithReport`로 `summary.totalSize`와 큰 파일 20개를 JSON에 기록, 직전 대비 +5% 초과 시 경고 | Size Map·Cook 로그 | 수동 Build Report 열람 |
| 예산 초과 차단(TOOLCHAIN d-2) | `BudgetCheck`를 배치 모드로 실행, 실패 시 비0 종료 코드. 판정 절차의 첫 단계. **자동 실행 연결은 새 자동화라 사용자 승인 뒤**(CLAUDE.md 3.5) | Commandlet + Data Validation | 수동 실행 |

**커스텀 툴 명세 `BudgetCheck`**

| 항목 | 내용 |
|---|---|
| 자동화하는 것 | 에셋 반입 시 삼각형·텍스처 크기·압축·Read/Write 설정 검사, 키샷 씬의 광원·그림자 수·드로우콜(SetPass)·텍스처 메모리·파티클 수·픽셀 액터 RT 수와 ms 집계, 지형-메시 높이 차(0.02u 이하) 검사 (TOOLCHAIN c-5와 같은 툴, 규모 2~3일 [추정]) |
| 입력 | 폴더 경로, 3장 수치 표(데이터 파일) |
| 출력 | 위반 목록(파일·항목·한도·현재값), 씬 집계 CSV |
| 사용자 | 구현 서브에이전트, 총괄(판정 전 점검) |
| 만드는 사람 | 구현 서브에이전트(Sonnet), Mac에서 1회 검증 |
| 주의 | 규칙 코어 수치는 읽기만, 수정 안 함. TOOLCHAIN c-5와 동일 이름·동일 툴이므로 한 번만 만든다 |

## 5. 절차

### 5.1 공통

| 단계 | 입력 | 작업 | 출력 |
|---|---|---|---|
| P1 기준선 | 현재 1-1 장면 | 키샷·밀집 전투·보스 장면 3종 프레임 시간 측정 | CSV: 평균·p95·p99, GPU 항목별 |
| P2 예산 등록 | 3장 표 | 항목별 한도 확정(결정 D15-1 후) | 확정 표 |
| P3 반입 점검 | 새 에셋 | `BudgetCheck` 실행 | 위반 0 확인 |
| P4 장면 점검 | 키샷 씬 | 광원·그림자·드로우콜 집계 | CSV |
| P5 최악 프레임 | 밀집 전투 + 보스 대기술 | p99 측정 10분 | 그래프 PNG |
| P6 옵션 등급 | 그림자·간접광·후처리 | 등급별 시간 표 | 표 |
| P7 후속 관문 측정 | 3.8표 위험 30개, our_tech_audit §7 | CPU(메인·렌더 스레드 p50/p95/p99, GC Alloc 호출 stack, ms/틱)·GPU(카메라별 ms, SetPass, 스키닝, 그림자·데칼·반사, 오버드로)·MEM(실제 텍스처 포맷·상주 byte, 메시 복제, RT, retained heap)·AUD(DSP, 디코드 메모리, 실제/가상 voice, 중요 예고음 가청)·BUILD(Build Report 포함 byte) 5관문을 같은 SHA 플레이어로 측정. 일반/remodel3d/rigpixel 분리, N(적 수)·V(가시 리그 수)·해상도·FPS 제한 기록. QA 자체 부하 분리. PC D3D11/D3D12, Mac 실제 API 각각 | 관문별 CSV·표. 미측정 칸은 "미확인"으로 유지 |

명명: `perf_<장면>_<기기>_<날짜>.csv`. 측정은 같은 카메라 위치·같은 빌드 SHA로.

### 5.2 Unity 반입

| 항목 | 설정 |
|---|---|
| 모델 | Read/Write 끔, Mesh Compression 중간, LOD Group 큰 소품 2단계 |
| 텍스처 | 압축 사용, Mipmap 켬, 지면 aniso 4, 마스크맵 선형 |
| 배칭 | SRP Batcher 호환 셰이더, 식생 GPU Instancing 켬 |
| 렌더러 | Forward+ 전환 시 Mac 실측 후 확정(02 D02-4) |
| 프로브 | APV 메모리 한도 설정 |
| 품질 등급 | 그래픽 옵션(`NativeGraphicsOptions.cs`)에 그림자 거리·광원 한도 연결 |
| 로딩 | 전환 흐름에 진행 보고(`NativeTransitionProgress`) 유지 |
| 임포트 정책 | Default 압축 0(무압축)·cap 8192 일괄 정책을 종류별(지면·소품·UI 글자·픽셀 atlas·마스크)로 나눔(3.8표 #22·#25). 원본 UI 글자·선·픽셀 atlas는 압축·밉을 일괄 적용하지 않는다 |
| 밉 스트리밍 | 월드 큰 텍스처만 후보, UI·픽셀 atlas 제외. 실제 상주량 측정 후 결정(#26) |
| 기기 배정 | URP 자산 선택이 OS가 아닌 품질 인덱스(≥3 = PC)로 정해지는 현 로직(`E/Rm0EngineSetup.cs:84`)을 확인하고 Mac에서 PC 자산이 쓰이는지 점검 |

### 5.3 UE5 반입 (대응만)

Nanite/Virtual Shadow Map/Lumen 사용 여부와 비용을 별도 측정 후 예산 재산정. Mac Apple Silicon에서 Lumen 소프트웨어 레이트레이싱은 동작, 하드웨어 RT는 실험적, Nanite·VSM은 M2 이상 Beta (ENGINE_DECISION §2·§0, 원문 확인은 실험 D1에 사람이 함 → [단일·미확정]). 3장 표는 엔진 독립 목표로 유지하고, 항목별 한도는 UE5 측정으로 재교정.

**3차 정합(ENGINE_TRIAL_UE5_PLAN §3·§9):** UE5 비교 실험의 첫 기준은 Deferred/Metal, 1920×1080, screen percentage 100%, dynamic resolution 끔, Lumen 끔(추가 결과는 설정 별도 표기). 성능은 같은 M5 Pro·전원 조건·같은 장면/배우 수/해상도에서 **warm 10초 구간**의 CPU/GPU frame time p50/p95와 메모리를 기록하고, cold 셰이더 시간과 steady FPS를 섞지 않는다. 잠정 기준 60fps·p95 16.7ms 이하는 총괄 확정 전 합격 기준이 아니며(3.1표와 일치), 3840×1080은 1080p 결과를 외삽하지 않고 따로 잰다. 단일 10초 구간은 장시간 안정성 증거가 아니다. 두 엔진 결과가 다른 기기·계측 누락이면 우열을 주장하지 않는다.

## 6. 합격 기준

| 판정 | 방법 | 합격 |
|---|---|---|
| 기준선 대비 | 변경 전·후 같은 장면 프레임 시간 비교판 | 같음 또는 나아짐. 화면이 바뀌는 병합은 화면도 비교판 통과 |
| 60fps | 밀집 전투 + 보스 대기술 10분 | p99 16.6ms 이하 |
| 1920×1080, 3840×1080 | 둘 다 측정 | 3.1 표 |
| Mac / PC | 둘 다 | Mac 판정이 우선 |
| 10초 무음 영상 | 전투 중 끊김 육안 확인 | 끊김 0 |
| 1x/3x 크롭 | 옵션 낮춤 등급에서도 | 점·밴딩 0 |
| 첫 킬 | 전투 진입 직후 | 끊김 0 |
| 로딩 | 1-1 진입 | 12초 이내, 멈춤 0 |
| 에셋 점검 | `BudgetCheck` | 위반 0 |
| 총 GPU | 3.2표 합계 | 14.7ms 이하(p99), 항목별 초과는 RETOUCH |
| 빌드 크기 | Build Report totalSize, 큰 파일 20개 | 직전 대비 +5% 이내, 데모 4GB 이하(D15-8) |
| 위험 30개 | 3.8표 | 상위 항목 처리 전·후 같은 장면 비교 |
| 예산 초과 | 항목별 | RETOUCH, 구조적 해결 |

## 7. 금지

- 평균 fps만 보고 합격시키기. PC 측정만으로 합격시키기(판정은 Mac).
- 성능을 이유로 먼 적 렌더를 줄이거나 카메라 LOCK을 바꾸기.
- 점·그레인 같은 품질 저하로 속이는 최적화(점 금지).
- 규칙 코어 수치·틱을 성능 이유로 바꾸기.
- 승인 없이 유료 최적화 에셋 도입. 시도마다 새 빌드 폴더 쌓기(CLAUDE.md 3.1).
- 측정 없는 "빨라졌다" 보고. 실패한 측정을 수정 없이 반복하기.
- 웹판 성능 수치를 Unity 예산 근거로 인용하기.
- 원본 byte(Resources 2.88GB)를 설치 용량·VRAM·RAM으로 단정하기. Resources 총량을 RAM 상주 주장으로 바꾸기(our_tech_audit §6).
- 정적 집계만으로 "느리다/병목이다"를 보고하기. 측정 없는 위험 순위를 실측 순위처럼 쓰기.
- 이름만 보고 QA 폴더·원본 파일을 미사용으로 판정해 삭제 제안하기. CJK 폰트 OTF를 언어별 배포 계약 없이 줄이기(our_tech_audit §6).
- 성능을 이유로 TOOLCHAIN의 디더링 기반 가림 페이드를 쓰는 것(점 금지).

## 8. 사용자 결정 필요 항목

| ID | 질문 | 추천안 | 대안 |
|---|---|---|---|
| D15-1 | 하한 기기를 정의할까(예: GTX 1060급 PC, M1 Mac 등). 지금은 PC(High)와 Mac M5 Pro만 기준. 공개 최소 사양(3.9표)은 GTX 660~1080, RAM 8~16GB 범위. ENGINE_DECISION K6은 "GTX 1060급 30fps 이상"을 후보로 둠 | 데모 v0는 PC High + Mac M5 Pro만, 하한 기기는 Steam 출시 전 GTX 1060 6GB·RAM 16GB·SSD·1080p 30fps로 정의 | 지금 정하기(예산 표 재산정) |
| D15-2 | 3장 [추정] 수치를 시작값으로 확정하고 Mac 첫 실측 뒤 개정해도 되나. tech budget 연구 결과 7종 모두 공개 정량 예산이 없어 "연구가 채워 줄 값"은 없다 | 시작값으로 확정, 실측으로 개정 | 실측까지 보류 |
| D15-3 | Forward+ 전환(02 D02-4)을 예산 측정 후 결정하는 것으로 묶을까 | 묶는다 | 먼저 전환 |
| D15-4 | `BudgetCheck`(= TOOLCHAIN c-5) 커스텀 툴 제작 승인. 배치 실행의 자동 연결(d-2)은 새 자동화 장치라 별도 승인(TOOLCHAIN D5) | 툴 제작 승인, 처음엔 수동 실행, 자동 연결은 승인 뒤 | 수동 점검 |
| D15-5 | 프레임 상한 기본값을 60으로 낮출까(코드 기본은 120) | 60(발열·일관성), 옵션으로 120/무제한 | 120 유지 |
| D15-6 | GPU 디버거(Xcode GPU Capture 등) 사용을 위해 Mac에서 창 없는 캡처를 허용 범위로 둘까 | 무창·무음 원칙 안에서 오프스크린 캡처만 | 도구 사용 보류 |
| D15-7★ | GPU 항목 합계를 TOOLCHAIN §3a의 14.7ms(여유 1.9ms)로 확정하고, 이전 초안의 총합 한도(PC 12ms/Mac 14ms)를 폐기할까. 이전 항목 합계는 PC 13.3ms/Mac 16.5ms로 한도를 넘는 모순이었다. 또 PixelActorPass 2.0ms는 현재 액터별 개별 카메라 구조(3.8표 #02)에서 달성 불확실 | 14.7ms로 확정하고 Mac 첫 실측으로 개정. PixelActorPass 구현 전까지는 적 수·V(가시 리그 수)를 줄여 측정 | 한도를 14ms로 유지하고 항목을 줄임 |
| D15-8★ | 데모 패키지 4GB 한도를 유지할까. Resources 원본만 2,881,554,015 byte(≈2.88GB; FullscreenWide 1.11GB, map 0.59GB, fonts 0.11GB)이고 최종 포함 byte는 Build Report 미측정. CJK 폰트 OTF 3개 73.7MB는 언어별 배포 계약 없이 줄일 수 없다 | 한도 유지를 잠정 채택하고 첫 Build Report 후 확정. 와이드 원화·QA·미방문 챕터 자산의 데모 포함 계약을 먼저 정함 | 한도를 6GB로 상향 |
| D15-9 | URP 자산을 OS가 아닌 품질 인덱스로 배정하는 현 로직(Mac이 PC High 자산을 쓸 수 있음)을 기기 기준으로 바꿀까(코드 수정, 사용자 승인 뒤 구현 레인) | 바꾼다. Mac 판정은 Mac 자산이어야 의미가 있다 | 현행 유지하되 판정 빌드의 품질 인덱스를 문서에 고정(TOOLCHAIN D6과 묶음) |
| D15-10 | 상위 위험 30개(3.8표) 중 어느 것을 키샷 전에 처리할까 | 02(적별 카메라)·19·20(모델 삼각형)은 PixelActorPass·캐릭터 매뉴얼과 같이, 22·25(임포트 정책)는 d-1 임포트 규칙과 같이 처리. 나머지는 첫 프로파일 후 | 전부 측정 후 결정 |
| D15-11★ | D15-8의 "데모 패키지 4GB 이하"와 codex_asset_size의 Steam 내부 목표(다운로드 ≤1.0 GiB, 설치 ≤2.0 GiB/OS)가 다르다. 어느 기준을 쓸까 | 4GB는 상한(하드 한도)으로 유지, 1.0/2.0 GiB는 1차 목표로 병기. baseline Build Report(OS별 다운로드·설치 byte)를 먼저 측정한 뒤 확정. 목표를 맞추려고 UI 가독성·32:9·언어·폴백을 삭제하지 않음 | 1.0/2.0 GiB로 교체 |
| D15-12 | Resources 정리 순서(기준 측정 → 도달불가 와이드 68개 → 미참조 → 압축 시험 → 해상도 제한 → 데모 제외 → Addressables)와 실행 담당. 이번 문서는 계획이며 자산 이동·삭제를 실행하지 않았다 | 이 순서를 받아들이되 키샷 작업과 분리된 별도 레인으로. 삭제·이동은 사용자 승인 뒤(CLAUDE.md 파괴적 변경) | 키샷 이후로 미룸 |

## 9. 출처

- `docs/0마스터플랜/GAME_STUDY/poe2.md` §8 성능 예산, §9 E1·L1·L2·F1·P1, S13·S14
- `docs/0마스터플랜/D4_STUDY/01_environment.md` §3 소품 수치, §5.1 베이크, T1~T7
- `docs/0마스터플랜/D4_STUDY/03_camera_occlusion_combat.md` R6 발광 단계
- `docs/0마스터플랜/GAME_STUDY/downfall_of_yellowsky.md` 규칙 3, §4.1
- `docs/0마스터플랜/ARPG_CONVENTIONS_CHECKLIST_20261105.md` J2, K4
- 내부: `docs/12퍼포먼스·최적화/`(웹 이력, 개념 참고만), `unity/Assets/Exoduser/Runtime/NativeScreenTransition.cs`, `NativeGame.cs` 104·737행, `NativeGraphicsOptions.cs`, CLAUDE.md 3.4·4.2
- **3차 반영 입력:** `docs/0마스터플랜/GAME_STUDY/codex_asset_size.md` §1~§7(Resources 집계·참조 대조·.meta 규칙·Steam 목표), `docs/0마스터플랜/MANUAL/FIRST_SCENE_PLAN.md` §3·§7, `docs/0마스터플랜/GAME_STUDY/codex_synthesis.md` §1.14·§2, `docs/0마스터플랜/ENGINE_TRIAL_UE5_PLAN.md` §3·§9
- **2차 반영 입력(저장소 경로):** `docs/0마스터플랜/GAME_STUDY/codex_tech_budget.md`(§3~§12, 공개 7종 조사. 정량 값 대부분 미확인), `docs/0마스터플랜/GAME_STUDY/our_tech_audit.md`(§3 상위 30개, §4 예산 대비, §5 임포트 집계, §6 Resources 범위, §7 후속 관문), `docs/0마스터플랜/MANUAL/TOOLCHAIN_20261105.md`(§3a 패스 예산, §3c c-5 BudgetCheck, §3d d-1~d-4), `docs/0마스터플랜/ENGINE_DECISION_20261105.md`(UE5 Mac 지원 수준: Lumen 소프트웨어 RT 동작, Nanite·VSM은 M2+ Beta)
