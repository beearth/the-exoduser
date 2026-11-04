# 공개 기술 예산 조사: 액션 RPG 7종

조사일: 2026-11-05 KST. 대상: Diablo IV, Path of Exile 2, Last Epoch, V Rising, No Rest for the Wicked, Hades **1편**, Phantom Blade Zero.

## 1. 읽는 기준과 조사 범위

- **[사실]**: 개발사 공지, 개발자 직접 설명·인터뷰, 기술 저자의 문서, 개발사 게시 상점 사양에서 확인한 내용. 발표 당시의 사실이며 현행 모든 플랫폼에 적용된다는 뜻은 아니다.
- **[추정]**: 위 자료에서 도출한 해석·적용 제안. 게임 내부의 확정 예산으로 취급하지 않는다. 근거 URL을 함께 단다.
- **미확인**: 이번에 확인한 공개 자료에서 해당 값을 확보하지 못했다는 뜻이다. 비공개 여부 자체를 확인했다는 뜻은 아니다. **숫자 칸은 비우며, 빈칸은 0이 아니다.** 일반적인 업계 수치로 채우지 않는다.
- 표의 출처 링크는 문서 끝의 URL 정의와 연결된다. 미확인 행의 링크는 **검토한 자료의 범위**이며, 숫자가 비공개라는 증명은 아니다.
- 개발사 직접 발언이 있는 인터뷰는 1차 증언으로 사용한다. 일반 이용자 포럼 글, 팬 모델, 스캔한 피규어, 파일 추출·리버스 엔지니어링 결과, 다른 게임의 수치는 예산 근거에서 제외한다.
- 공개 웹 텍스트만 조사했다. 게임 실행·디컴파일·추출·실측, 이미지·게임 파일·에셋 다운로드 및 반입, 로그인·유료 서비스 이용은 하지 않았다. 직접 인용 없이 요약했다.

## 2. 핵심 근거와 적용 시점

아래는 자료의 성격을 구분한 목록이다. 상점 사양은 조사일 열람 내용이며, 설치 용량이나 요구 사양의 향후 변경을 보장하지 않는다.

| 게임/범위 | 확인한 1차 자료 | 적용 시점·검증 범위 |
|---|---|---|
| Diablo IV | [공식 그래픽 설명][D4-GFX], [VFX 개발 설명][D4-VFX], [사운드 개발 설명][D4-AUDIO], [2.0 패치 노트][D4-PATCH] | [사실] 그래픽은 출시기 설명, VFX·사운드는 2021년 개발 설명. 패치 변경은 해당 버전에 한정 |
| Path of Exile 2 | [GGG의 ExileCon 발표 안내][POE-TALK], [Sannikov의 Radiance Cascades 원문][POE-RC] | [사실] 발표 안내는 2023-11-01. 기술 원문의 PoE2 GI 절과 도해 설명을 텍스트로 확인. 영상 전체의 모든 슬라이드·발언을 검증한 것은 아님 |
| Last Epoch | [성능 개발 문서][LE-PERF], [John Pata 제작 설명][LE-AUDIO] | [사실] 성능 문서는 2023-03-05, 0.9 대상 |
| V Rising | [Stunlock 블로그][VR-DEV], [Unity 개발팀 사례][VR-TECH] | [사실] 각각 2021-07-20, 2024-12-09 |
| No Rest for the Wicked | [EA Patch 1][NR-PATCH], [Gameplay Tech Lead·아트팀 인터뷰][NR-TECH] | [사실] 패치는 2024-05-04 포럼 게시 내용. 인터뷰는 스트리밍·멀티플레이 및 자체 Unity 수정 설명 |
| Hades 1 | [개발자 렌더링 설명][H-RENDER], [콘솔판 공식 발표][H-FPS], [Darren Korb 인터뷰 전문][H-AUDIO] | [사실] 각각 2019-12-11, 2021-08-13, 2020-12-24. Hades II 자료와 구분 |
| Phantom Blade Zero | [S-GAME의 Steam 제품·사양 페이지][PB-STORE] | [사실] 조사일 상점의 UE5 설명과 최소/권장 조건 확인. 제작사 내부 성능 할당표는 확보하지 못함 |
| 비교 방법 | [Unity의 프레임 예산·프로파일링 설명][FRAME] | [사실] FPS와 ms 관계 및 병목 해석을 위한 일반 기술 자료. 아래 게임들의 내부 예산으로 전용하지 않음 |

## 3. 캐릭터·몬스터·보스·소품 폴리곤 수

아래 숫자 칸의 단위는 **런타임 LOD별 삼각형(triangle)/개체**를 요구하는 것으로 정의했다. 원문이 polygon인지 triangle인지 밝히지 않으면 임의 변환하지 않는다. 원본 조형, 컷신, 장비 포함 여부도 확인되지 않은 수치를 합치지 않는다.

| 게임 | 플레이어 캐릭터 | 일반 몬스터 | 보스 | 소품 | 확인 상태·적용 한계 | 검토 출처 |
|---|---:|---:|---:|---:|---|---|
| Diablo IV | | | | | 네 분류의 LOD별 수치 모두 미확인 | [그래픽 설명][D4-GFX] |
| Path of Exile 2 | | | | | 네 분류의 수치 모두 미확인. GI 처리시간으로 메시 수를 역산하지 않음 | [발표 안내][POE-TALK], [기술 원문][POE-RC] |
| Last Epoch | | | | | 네 분류의 수치 모두 미확인 | [성능 개발 문서][LE-PERF] |
| V Rising | | | | | 네 분류의 수치 모두 미확인 | [개발팀 기술 사례][VR-TECH] |
| No Rest for the Wicked | | | | | 네 분류의 수치 모두 미확인 | [개발자 인터뷰][NR-TECH], [패치][NR-PATCH] |
| Hades 1 | | | | | [사실] 개발자 설명상 실시간 3D 렌더링을 사용하지 않음. 제작용 3D 모델 수치와 런타임 스프라이트의 도형 수 모두 미확인 | [개발자 답변][H-RENDER] |
| Phantom Blade Zero | | | | | 네 분류의 수치 모두 미확인. UE5 사용만으로 Nanite 채택·삼각형 수를 확정하지 않음 | [공식 상점 설명][PB-STORE] |

**[추정] 비교의 한계:** Hades의 제작용 메시를 다른 게임의 런타임 메시와 같은 표준으로 비교하면 비용 해석이 어긋난다. 모델 제작과 화면에 표시하는 방식을 먼저 나누는 편이 타당하다. [근거: Hades 개발자 설명][H-RENDER]

## 4. 텍스처 해상도·메모리

해상도는 출력 화면의 1080p/4K가 아니라 **에셋 텍스처의 가로×세로 texel**을 뜻한다. 캐릭터·몬스터·보스·소품별 맵 크기를 확인하지 못한 경우 전부 비워 두었다.

| 게임 | 캐릭터 맵 | 몬스터 맵 | 보스 맵 | 소품 맵 | 확인한 방식·조건 | 수치 상태·출처 |
|---|---:|---:|---:|---:|---|---|
| Diablo IV | | | | | [사실] 근접 장면에 고상세 텍스처를 통합. 지형은 여러 텍스처의 합성을 virtual texture로 처리. 출시기 Ultra 텍스처 옵션에는 고해상도 에셋 설치와 시스템 RAM 최소 32GB를 명시 | 맵별 해상도·텍스처 상주량·VRAM 배분 미확인. 32GB는 VRAM 값이 아님. [공식 설명][D4-GFX] |
| Path of Exile 2 | | | | | [사실] 상점은 최소 VRAM 3GB를 요구 | 맵 크기·상주 예산 미확인. 3GB는 텍스처 전용 예산이 아님. [사양][POE-STORE] |
| Last Epoch | | | | | [사실] 셰이더·지오메트리 비용 검토 | 해상도·상주 예산 미확인. [개발 문서][LE-PERF] |
| V Rising | | | | | [사실] 서로 다른 재질의 submesh를 합치는 변형 UDIM 도구를 사용 | UDIM 타일 크기·texel density·상주 예산 미확인. [기술 사례][VR-TECH] |
| No Rest for the Wicked | | | | | [사실] EA Patch 1에서 다수 메시·텍스처 최적화를 공지 | 최적화 전후 해상도·메모리 할당 미확인. [패치][NR-PATCH] |
| Hades 1 | | | | | [사실] 여러 방향의 사전 렌더 애니메이션 프레임을 사용 | 스프라이트 프레임·atlas 크기·상주 예산 미확인. [개발자 설명][H-RENDER] |
| Phantom Blade Zero | | | | | 검토한 상점 사양에서 에셋별 해상도는 확보하지 못함 | 맵 크기·상주 예산 미확인. [상점][PB-STORE] |

## 5. 화면당 적 수·드로우콜·배칭

여기서 화면당 적 수는 **같은 프레임에 보이는 적의 상한**이다. 서버 인원, 전체 월드의 오브젝트 수, 적 종류 수와 구분한다. 드로우콜 수에는 측정 장면·플랫폼·그림자/깊이 패스 포함 여부가 필요하므로, 다른 범위의 숫자를 옮기지 않는다.

| 게임 | 화면당 적 상한(마리) | 프레임당 draw call 상한 | 공개된 처리 방식 | 미확인·범위 주의 | 출처 |
|---|---:|---:|---|---|---|
| Diablo IV | | | [사실] deferred renderer와 정적 그림자 계산 저장·동적 요소 중첩을 설명 | 적 상한·draw call·배치 크기 미확인. deferred 사용이 draw call 상한을 뜻하지 않음 | [공식 그래픽 설명][D4-GFX] |
| Path of Exile 2 | | | [사실] 상점은 최대 6인 협동을 명시 | 6은 플레이어 인원. 적 상한·draw call·배치 크기 미확인 | [상점][POE-STORE], [발표 안내][POE-TALK] |
| Last Epoch | | | [사실] 장면 benchmark에서 draw call·shadow caster 등을 검토 | 적 상한·draw call 상한·배칭 정책 미확인 | [개발 문서][LE-PERF] |
| V Rising | | | [사실] SRP Batcher·submesh 병합·CPU Job System | 상한 미확인. 60인은 서버 규모, 160,000 초과 오브젝트는 월드 규모. 화면당 적 수가 아님 | [기술 사례][VR-TECH] |
| No Rest for the Wicked | | | [사실] GPU visibility culling·화면 밖 콘텐츠 처리 개선 공지 | 적 상한·draw call·배치 크기 미확인 | [EA Patch 1][NR-PATCH] |
| Hades 1 | | | [사실] 사전 렌더 2D 프레임 기반 표현 | 적 상한·sprite batch 크기·draw call 상한 미확인 | [개발자 설명][H-RENDER] |
| Phantom Blade Zero | | | [사실] UE5 사용을 명시 | 적 상한·draw call·instancing·배치 크기 미확인 | [상점][PB-STORE] |

## 6. 프레임 목표와 CPU/GPU ms 예산

### 6.1 FPS에서 계산한 프레임 간격

**[사실·계산]** `프레임 간격(ms) = 1000 / FPS`다. 아래는 산술 환산이며 게임별 CPU/GPU 할당의 공개 수치가 아니다. CPU와 GPU에 각각 절반씩 나누는 근거도 없다. Unity는 각 CPU thread와 GPU 작업의 프레임 예산 충족 여부를 따로 확인하도록 설명한다. [근거][FRAME]

| 목표 | 계산한 간격(ms/frame, 소수 둘째 자리 반올림) | CPU 전체 할당(ms) | GPU 전체 할당(ms) | 판정 |
|---:|---:|---:|---:|---|
| 30 FPS | 33.33 | | | CPU/GPU 분배 미확인. [계산 근거][FRAME] |
| 60 FPS | 16.67 | | | CPU/GPU 분배 미확인. [계산 근거][FRAME] |
| 120 FPS | 8.33 | | | CPU/GPU 분배 미확인. 특정 게임의 120 FPS 지원을 뜻하지 않음. [계산 근거][FRAME] |

### 6.2 게임별 공개 목표

미확인은 미지원과 다르다. 실제 달성률·최저 FPS·프레임 생성 사용 여부를 확인하지 못한 목표를 실측 결과처럼 쓰지 않는다.

| 게임·플랫폼/시점 | 30 FPS | 60 FPS | 120 FPS | CPU 전체 예산(ms) | GPU 전체 예산(ms) | 근거·조건 |
|---|---|---|---|---:|---:|---|
| Diablo IV / 조사일 PC 상점 | [사실] 최소 조건 | [사실] 권장 조건 | 미확인 | | | 30: 출력 1080p/렌더 720p·Low. 60: 1080p·Medium. [상점 사양][D4-STORE] |
| Path of Exile 2 / 조사일 PC 상점·기술 원문 | 미확인 | 미확인 | 미확인 | | | 상점에서 FPS 조건 미확인. 아래 GI 부분 처리시간과 구분. [사양][POE-STORE], [기술 원문][POE-RC] |
| Last Epoch / 0.9 개발 자료 | 미확인 | 미확인 | 미확인 | | | 제품 목표·CPU/GPU 할당표 미확인. [개발 문서][LE-PERF] |
| V Rising / 2024 개발 사례 | 미확인 | 미확인 | 미확인 | | | 플랫폼별 목표·총배분 미확인. [기술 사례][VR-TECH] |
| No Rest for the Wicked / PC 상점·EA Patch 1 | 미확인 | 미확인 | 미확인 | | | 최소/권장 사양과 별도로 FPS 조건·총배분 미확인. [상점][NR-STORE], [패치][NR-PATCH] |
| Hades 1 / 2021 콘솔판 | 미확인 | [사실] 공식 목표 | 미확인 | | | PS4·Xbox One: 1080p. PS5·Xbox Series X/S: 4K라는 발표 문구. PC·Switch의 목표로 확장하지 않음. [개발사 발표][H-FPS] |
| Phantom Blade Zero / 조사일 PC 상점 | [사실] 최소 조건 | [사실] 권장 조건 | 미확인 | | | 각각 1080p/1440p, 모두 업스케일링 활성·SSD 설치 조건. 네이티브 해상도 성능 보장으로 읽지 않음. [사양][PB-STORE] |

### 6.3 부분 처리시간·benchmark: 전체 예산과 구분

| 게임 | 공개 값·관찰 | 분류 | 빠진 조건·사용 제한 | 출처 |
|---|---|---|---|---|
| Path of Exile 2 | [사실] GTX 1050에서 Radiance Cascades GI 약 **3ms**. 발광 캐릭터의 간접광을 계산한 예시 | 특정 GI 구현의 처리시간 | 해당 도해 설명에서 해상도·전체 GPU 시간·CPU 시간·버전별 총배분 미확인. 전체 게임이 3ms라는 뜻이 아님 | [저자 원문: Path of Exile 2 GI 절][POE-RC] |
| V Rising | [사실] 배칭의 CPU 절감을 개발자가 수 ms 수준으로 추산 | 개발자 **[추정]** | 정확한 절감량·전체 frame time 미확인 | [개발팀 발언][VR-TECH] |
| Last Epoch | [사실] Ancient Dragon 공격 중 40 FPS대 중반 → 개선 후 약 100 FPS 예시 | 특정 장면 비교 | 하드웨어·해상도 조건 미확인. 다른 최적화도 포함되어 범용 배율·제품 목표로 사용 불가 | [0.9 개발 문서][LE-PERF] |

**[추정] 적용 해석:** 확인된 GI 부분 비용과 배칭 절감량은 최적화 대상을 고르는 단서다. 이를 조합해 특정 게임의 CPU/GPU/AI/VFX/오디오 ms 배분표를 재구성할 근거는 부족하다. [근거][POE-RC], [근거][VR-TECH], [프로파일링 원칙][FRAME]

## 7. VFX 파티클·오버드로

동시 활성 particle 수, particle system 개수, 프로젝트가 보유한 VFX 종류 수는 별도 항목으로 취급한다. 오버드로 제한은 중첩 횟수 또는 화면 점유량 등 원문의 측정 정의와 숫자가 있어야 채택한다.

| 게임 | 동시 활성 파티클 상한(개) | 효과별 파티클 상한(개) | 오버드로 수치 제한 | 확인한 관리 방식·주의 | 출처 |
|---|---:|---:|---:|---|---|
| Diablo IV | | | | [사실] 전투 가독성을 VFX 원칙으로 제시. 강도 조절 시 spawn rate·속도·발광·색 범위를 개별 조정. 정량 상한은 미확인 | [VFX 개발 설명][D4-VFX] |
| Path of Exile 2 | | | | 세 상한 모두 미확인. GI의 ms를 파티클 예산으로 환산하지 않음 | [발표 안내][POE-TALK], [GI 원문][POE-RC] |
| Last Epoch | | | | [사실] alpha-test 전환·왜곡/효과 재설계로 overdraw 감소. 상한 미확인 | [최적화 설명][LE-PERF] |
| V Rising | | | | [사실] **2,700 particle systems**를 관리. 동시 활성 particle 수·상한은 미확인 | [기술 사례][VR-TECH] |
| No Rest for the Wicked | | | | [사실] Ice/Frost 전투 효과와 여러 VFX의 최적화 공지. 파티클·overdraw 제한은 미확인 | [패치][NR-PATCH] |
| Hades 1 | | | | 세 상한 모두 미확인. [사실] 개발자는 일부 3D 제작 효과도 엔진에서는 2D 애니메이션이라고 설명 | [개발자 답변][H-RENDER] |
| Phantom Blade Zero | | | | 세 상한 모두 미확인 | [검토한 상점 자료][PB-STORE] |

## 8. 사운드 동시 발음·우선순위·믹스 버스

동시 발음은 실제 재생 voice와 virtual voice를 구분하는 값이 필요하다. 음악 stem 수, 이벤트 수, 출력 채널 수와 섞지 않는다. 공개된 재생 규칙이 있어도 내부 버스 트리를 임의로 그리지 않는다.

| 게임 | 전체 실제 voice 상한 | virtual voice 상한 | 이벤트별 동시 발음 상한 | 확인한 우선순위·재생 규칙 | 확인한 믹스 구조 / 미확인 | 출처 |
|---|---:|---:|---:|---|---|---|
| Diablo IV | | | | [사실] 소리별 동시 인스턴스 제한을 설정. 2.0 패치에서는 Mythic Unique 드롭음을 다른 소리보다 우선하도록 변경 | [사실] 상황별 적응 믹스. voice 수·우선순위 숫자·stealing 방식·버스 트리·ducking 수치 미확인 | [사운드 설명][D4-AUDIO], [패치][D4-PATCH] |
| Path of Exile 2 | | | | 미확인 | 전체 voice·우선순위·믹스 버스 구조 미확인. 이용자의 사운드 채널 옵션 경험담을 내부 예산으로 채택하지 않음 | [검토한 공식 제품 자료][POE-STORE] |
| Last Epoch | | | | 미확인 | [사실] 오디오 리드가 FMOD 이벤트의 Unity 통합·Master Bank 작업 흐름을 설명. 완성 게임의 버스 이름·수·voice 할당 미확인. Master Bank를 버스 개수로 세지 않음 | [John Pata 제작 설명][LE-AUDIO] |
| V Rising | | | | 미확인 | [사실] volume profile로 음악·효과음 설정. 버스·voice 할당 미확인 | [개발팀 사례][VR-TECH] |
| No Rest for the Wicked | | | | 미확인 | [사실] 기술 리드는 자체 Unity 수정 영역에 오디오도 포함한다고 설명. voice·우선순위·버스 트리 미확인 | [개발자 인터뷰][NR-TECH] |
| Hades 1 | | | | [사실] 전투 여부에 따라 음악 stem을 켜고 끄며 보스 진행에 맞춰 음악 구간을 전환 | [사실] 도입곡 설명에는 드럼·베이스·나머지 악기의 **3개 stem**이 등장. 이는 voice 상한·mixer bus 개수가 아님. 버스 트리·voice 우선순위 미확인 | [Darren Korb 직접 설명][H-AUDIO] |
| Phantom Blade Zero | | | | 미확인 | 실제/virtual voice·우선순위·내부 버스 구조 모두 미확인 | [검토한 공식 상점][PB-STORE] |

## 9. 로딩·스트리밍·GC와 순간 멈춤 관리

GC 수집 주기·할당량·최대 정지시간은 별도의 계측 값이다. pooling이나 스트리밍 채택만으로 GC 정지시간을 확인했다고 쓰지 않는다.

| 게임 | 공개된 로딩·스트리밍·스파이크 관리 | GC 할당/수집/최대 pause(ms) | 남은 미확인 | 출처 |
|---|---|---:|---|---|
| Diablo IV | [사실] 장치에 맞춰 mesh/texture LOD 등 품질을 낮춰 로드할 수 있도록 설계 | | 이동 중 I/O 처리량·로딩 초·GC 방식·할당량·pause 미확인 | [공식 그래픽 설명][D4-GFX] |
| Path of Exile 2 | [사실] 상점의 권장 조건에 SSD 사용을 명시 | | SSD 권장이 스트리밍 구현 공개는 아님. 로딩 초·I/O 예산·GC·shader warm-up 할당 미확인 | [사양][POE-STORE] |
| Last Epoch | [사실] 로딩 때 미리 생성·초기화하고 pool에서 재사용. 0.9 대상은 플레이어 스킬 VFX·빈번한 hit/ailment 효과 | | GC 정책·할당량·pause·풀 크기 미확인 | [개발 문서][LE-PERF] |
| V Rising | [사실] chunk/subscene·asset streaming. Profiler로 불필요한 garbage 검출 | | GC 정책·byte/frame·pause 미확인 | [개발 블로그][VR-DEV], [기술 사례][VR-TECH] |
| No Rest for the Wicked | [사실] preload·streaming time-slicing·pooling·로드/언로드 개선 | | I/O·time-slice ms·풀 상한·GC pause 미확인 | [EA Patch 1][NR-PATCH] |
| Hades 1 | 검토한 렌더링·오디오 설명에서 정량 로딩/GC 예산은 확보하지 못함 | | 방 전환 로딩 초·sprite 상주/해제 정책·GC·pause 미확인 | [개발자 설명][H-RENDER], [오디오 인터뷰][H-AUDIO] |
| Phantom Blade Zero | [사실] 최소/권장 모두 SSD 설치 요구 | | 로딩 초·World Partition 등 구체적 스트리밍 채택·GC 정책·pause 미확인 | [사양][PB-STORE] |

**[추정] 렉 원인 분류:** 이 자료들만으로 순간 멈춤을 모두 GC로 분류할 수 없다. 생성·초기화, 로드/언로드, 렌더 제출 비용은 각기 조사 대상이며, GC 여부는 별도 증거가 필요하다. [근거][LE-PERF], [근거][NR-PATCH], [프로파일링 원칙][FRAME]

## 10. 공개 PC 최소 사양

**[사실] 아래는 조사일에 열람한 각 게임 상점의 Windows 최소 조건 요약**이다. 발표기의 권장 사양을 최소 사양 대신 넣지 않았다. 용량은 상점의 여유 공간 요구이며 RAM·VRAM·스트리밍 예산과 구분한다. FPS 조건이 없으면 임의로 30/60을 붙이지 않는다. 각 행의 URL이 해당 행 전체의 근거다.

| 게임 | CPU 최소 | GPU 최소 | RAM | OS·API | 저장 공간·매체 | FPS 조건·기타 | 출처 |
|---|---|---|---:|---|---|---|---|
| Diablo IV | Core i5-2500K / FX-8350 | GTX 660 / Arc A380 / Radeon R9 280 | 8GB | Windows 10 1909 이상·64bit / DX12 | 90GB·SSD 필수 | 출력 1080p / 렌더 720p·Low·30 FPS. 광대역 인터넷 | [D4 상점][D4-STORE] |
| Path of Exile 2 | Core i7-7700 / Ryzen 5 2500X | GTX 960(3GB) / Arc A380 / Radeon RX 470 | 8GB | Windows 10 / DX12 | 100GB. SSD는 권장 항목에 명시 | GPU VRAM 최소 3GB. 광대역 인터넷. FPS 조건 미확인 | [PoE2 상점][POE-STORE] |
| Last Epoch | Core i5-2500 / FX-4350 | GTX 1060 / RX 580, 원문 VRAM 6GB 조건 | 8GB | Windows 10·64bit / DX11 | 22GB·SSD 강력 권장 | 광대역 인터넷. FPS 조건 미확인. GPU 표기의 모델/VRAM 조합을 임의 수정하지 않음 | [LE 상점][LE-STORE] |
| V Rising | Core i5-6600 3.3GHz / Ryzen 5 1500X 3.5GHz | GTX 750 Ti(Maxwell 이상) 2GB / Radeon R7 360 2GB | 12GB | Windows 10·64bit / DX11 | 19GB·최소 항목의 SSD 필수 여부 미확인 | 광대역 인터넷. FPS 조건 미확인. 상점은 사양 변경 가능성을 명시 | [VR 상점][VR-STORE] |
| No Rest for the Wicked | Core i5-8400 / Ryzen 5 2600 | GTX 1080 / Radeon 5600 XT | 16GB | Windows 10 / API 조건 미확인 | 46GB·SSD 필수 | Intel Iris Xe 내장 그래픽 미지원. FPS 조건 미확인 | [Wicked 상점][NR-STORE] |
| Hades 1 | Dual Core 2.4GHz | VRAM 1GB / DirectX 10 이상 지원 | 4GB | 게임 표기: Windows 7 SP1 | 15GB·매체 조건 미확인 | **상점은 Steam 클라이언트가 2024-01-01부터 Windows 10 이상만 지원한다고 별도 고지.** 게임의 오래된 OS 표기를 현재 Steam 실행 지원으로 해석하지 않음. FPS 조건 미확인 | [Hades 상점][H-STORE] |
| Phantom Blade Zero | Core i7-8700K / Ryzen 5 3600 | GTX 1660 6GB / RX 5500 XT 8GB | 16GB | Windows 10/11·64bit / DX12 | 145GB·SSD 필수 | 1080p·30 FPS·업스케일링 활성 조건 | [PBZ 상점][PB-STORE] |

## 11. 확인된 공통점과 적용 해석

여기서 공통점은 **명시한 복수 사례 사이의 공통점**이다. 7개 게임 모두가 같은 수치·엔진·구현을 쓴다는 뜻은 아니다.

| 공통 주제 | [사실] 공개 자료에서 겹치는 관행 | [추정] 연구 결과의 적용 해석 | 출처 |
|---|---|---|---|
| 전투 전 비용 지불 | Last Epoch와 Wicked의 사전 준비·pooling | 첫 사용 스파이크를 따로 측정. 풀 크기는 미확인 | [LE][LE-PERF], [Wicked][NR-PATCH] |
| 공간별 콘텐츠 관리 | V Rising의 streaming, Wicked의 로드/언로드·culling | 월드 규모와 프레임당 활성 비용을 분리 | [VR][VR-DEV], [Wicked][NR-PATCH] |
| 효과 구성 관리 | Diablo IV의 가독성, Last Epoch의 overdraw 개선 | 개수 외에 겹침·가독성·패스 시간도 확인 | [D4][D4-VFX], [LE][LE-PERF] |
| 실행 조건과 목표 연결 | Diablo IV와 Phantom Blade Zero는 해상도·FPS·업스케일/렌더 조건을 사양에 연결 | 최소 사양과 목표 FPS를 항상 한 쌍으로 적되, 조건이 없는 게임에는 목표를 추정 기입하지 않음 | [D4][D4-STORE], [PBZ][PB-STORE] |
| 상황에 따라 소리 구성 변경 | Diablo IV는 동시 인스턴스·중요 드롭음 우선 처리, Hades는 전투 상태에 맞춰 음악 stem 변경 | 전투 정보와 분위기의 우선순위를 설계할 근거. 두 게임의 내부 믹스 버스·voice 상한이 같다는 증거는 없음 | [D4 사운드][D4-AUDIO], [D4 패치][D4-PATCH], [Hades][H-AUDIO] |
| 구체적 비용 확인 | PoE2의 GI 시간·V Rising의 배칭·Last Epoch의 장면 비교 | 장면·기기·패스 범위를 맞춰 해석 | [PoE2][POE-RC], [VR][VR-TECH], [LE][LE-PERF] |

## 12. 미확인 항목과 후속 확인 기준

| 아직 확보하지 못한 값 | 이번 조사 상태 | 값으로 채택하기 위해 필요한 공개 근거 |
|---|---|---|
| 캐릭터·몬스터·보스·소품 triangle/LOD, 텍스처 해상도·상주 예산 | 7종의 분류별 정량 표는 미확인. Hades의 표현 방식 차이만 별도 확인 | 제작자 자료에 런타임/제작용, LOD, 장비·머리카락 포함 범위, 맵 종류·크기 명시. [검토 범위][D4-GFX], [검토 범위][NR-TECH], [Hades][H-RENDER] |
| 화면당 적 수·draw call 상한 | 상한 수치 미확인 | 개발사 문서의 장면·플랫폼·패스 정의와 상한. 서버 규모·종류 수로 대체하지 않음. [검토 범위][VR-TECH], [검토 범위][POE-STORE] |
| CPU/GPU 세부 ms 배분 | 총배분 미확인. PoE2의 약 3ms는 GI 부분 비용만 확인 | CPU main/render/worker·GPU 패스·전체 frame time·기기·설정이 명시된 발표. [부분 비용][POE-RC], [비교 방법][FRAME] |
| 동시 파티클·overdraw 상한 | 미확인. VR의 2,700 systems는 다른 측정 대상 | active particle·effect 인스턴스·화면 중첩·패스 비용의 단위와 상한. [검토 범위][VR-TECH], [검토 범위][LE-PERF] |
| 실제/virtual voice, priority 숫자, mixer bus tree | 미확인. D4의 제한 정책과 Hades 음악 stem 예시만 확인 | 완성 게임의 voice 설정·stealing/virtualization·실제 버스 라우팅 공개. 미들웨어 기본값으로 채우지 않음. [D4][D4-AUDIO], [Hades][H-AUDIO], [LE 제작 설명][LE-AUDIO] |
| 로딩 초·I/O 예산·GC pause | 미확인. 채택한 관리 방식과 정량 결과는 구분 | 기기·버전·장면·최대/백분위·시간 단위가 있는 개발사 측정 자료. [검토 범위][NR-PATCH], [검토 범위][VR-TECH] |

**조사 한계:** 검색으로 찾은 Diablo IV GDC 2024 「H2O in H3LL」 [발표 자료 URL][D4-GDC]는 본문 접근이 403으로 실패하여 정량 근거로 사용하지 않았다. PoE2 발표는 공식 안내와 저자의 텍스트 원문까지만 확인했다. 따라서 미확인 항목은 추가 공개 자료에서 해소될 수 있다. 팬 제작·피규어 스캔·추출 모델의 숫자를 빈칸에 대입하지 않았다.

## 출처 URL

아래 링크 정의는 본문·표의 출처 표기에 사용한다. 출처 제목 외 원문 문장을 직접 인용하지 않았다.

[D4-GFX]: https://news.blizzard.com/en-gb/article/23964183/peeling-back-the-varnish-the-graphics-of-diablo-iv
[D4-VFX]: https://news.blizzard.com/en-us/article/23746639/diablo-iv-quarterly-updatedecember-2021
[D4-AUDIO]: https://news.blizzard.com/en-gb/article/23731236/diablo-iv-quarterly-updateoctober-2021
[D4-PATCH]: https://news.blizzard.com/en-us/article/24140808/diablo-iv-patch-notes-2-0
[D4-STORE]: https://store.steampowered.com/app/2344520/Diablo_IV/
[D4-GDC]: https://media.gdcvault.com/gdc2024/Slides/GDC%2Bslide%2Bpresentations/Aikman_Aaron_H2O_in_H3LL.pdf
[POE-TALK]: https://www.pathofexile.com/forum/view-thread/3447463/filter-account-type/staff
[POE-RC]: https://github.com/Raikiri/RadianceCascadesPaper/blob/main/RadianceCascades.tex
[POE-STORE]: https://store.steampowered.com/app/2694490/Path_of_Exile_2/
[LE-PERF]: https://forum.lastepoch.com/t/performance-optimization-coming-in-convergence/52263
[LE-AUDIO]: https://blog.prosoundeffects.com/game-audio-integration-workflow-with-fmod-and-unity-video
[LE-STORE]: https://store.steampowered.com/app/899770/Last_Epoch/
[VR-DEV]: https://blog.stunlock.com/fr/v-rising-dev-update-4-v-rising-engine-and-cutting-edge-technology/
[VR-TECH]: https://unity.com/resources/stunlock-studios-v-rising
[VR-STORE]: https://store.steampowered.com/app/1604030/V_Rising/
[NR-PATCH]: https://forum.norestforthewicked.com/t/patch-notes-early-access-patch-1/9963
[NR-TECH]: https://80.lv/articles/interview-inside-the-tech-and-artistic-inspirations-of-no-rest-for-the-wicked-from-moon-studios
[NR-STORE]: https://store.steampowered.com/app/1371980/No_Rest_for_the_Wicked/?curator_clanid=44756906&l=english
[H-RENDER]: https://steamcommunity.com/app/1145360/discussions/0/1738883810796606862/
[H-FPS]: https://www.supergiantgames.com/blog/hades-out-now-on-xbox-and-playstation/
[H-AUDIO]: https://gameplay.co/hades-game-music-sound-design-darren-korb-supergiant-games/
[H-STORE]: https://store.steampowered.com/app/1145360/Hades/
[PB-STORE]: https://store.steampowered.com/app/4115450/Phantom_Blade_Zero/
[FRAME]: https://unity.com/how-to/best-practices-for-profiling-game-performance
