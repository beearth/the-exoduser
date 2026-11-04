# UE5 비교 실험 실행 계획

**이 문서는 UE5 비교 실험의 실행 계획이며 엔진 전환 결정이 아니다. 전환 비용은 범위 밖이다.** 기존 게임의 코드·콘텐츠·세이브·배포 체계를 이식하거나, Unity 개발 방향을 바꾸는 승인을 뜻하지 않는다.

작성일: 2026-11-05 KST. 상태: **계획서 작성 / 엔진 실험 미실행 / 명령 미검증**.

## 1. 범위와 근거

- **[사실·작업 지시]** 이번 산출물은 이 파일 하나다. 설치·다운로드·Unity/Unreal 실행·Python·유료 서비스·로그인·약관 동의·git commit/push를 하지 않는다. 커밋은 총괄 검토 뒤 총괄이 한다. 공통 규칙의 CHANGELOG_SYNC 갱신도 이번 단일 파일 지시 때문에 수행하지 않는다.
- **[사실·열람 기록]** 작업본은 `E:/exoduser-wt/codex-study-urp-mood`, 브랜치는 `codex/unity-study-ue5-trial-plan-20261105`, 작성 시작 HEAD는 `75add6ff4a6209e2590a7a626ffb4c37b5f0268e`이며 시작 시 작업 파일 변경은 없었다. `origin/main`의 운영·작업 매뉴얼은 정본 위치 안내여서, 안내된 `origin/unity/main` 정본도 읽었다. 다른 레인 파일은 수정하지 않는다.
- **[사실·참고 자료]** `I:/EXODUSER-Storage/codex-takeover/ue5-plan/codex_engine_ai_friendliness.md`와 `codex_keyshot_composition.md`를 읽었다. 전자는 자동화 기능의 존재와 실측 성능을 구분한다. 후자의 1-1 좌표는 실측이 아닌 설계 제안이며, 네 참고 게임 이미지의 직접 관찰은 미완이라고 명시돼 있다. 제안 좌표를 Unity MoodLab 실측값으로 사용하지 않는다.
- **[사실·공식 문서]** 아래 URL은 작성일에 확인한 공개 문서다. `[사실]`은 문서에 적힌 기능·조건 또는 명시한 로컬 열람 결과다. `[추정]`은 이 실험의 설계·시간·용량·판정 제안이다. **미확인/미검증**은 자료나 실기 증거가 없다는 뜻이며 불가능하다는 판정이 아니다.
- **[추정·실험 질문]** 같은 Mac M5 Pro, 같은 1-1 구도에서 UE가 배경 깊이·접지·조명·먼 적 가독성과 실시간 픽셀 캐릭터를 재현할 수 있는가? 준비부터 런타임 증거 확보까지 사람이 개입한 시간과 막힘을 함께 기록한다. AI 친화성 문헌 비교만으로 제작 속도의 우열을 정하지 않는다.

## 2. Mac M5 Pro: 설치 전 확인할 요건·디스크·시간

### 2.1 공식 요건과 미확인 사항

**[추정·버전 제안]** 첫 시도는 Launcher의 **UE 5.8 정식 패치 하나**로 고정한다. 실제 제공 패치 번호·설치 가능 여부는 사용자 설치 단계에서 확인한다. 자동 최신 업데이트나 Preview를 실험 도중 섞지 않는다. 기존 Mac 환경과 맞지 않으면 임의로 5.6/5.7로 바꾸지 말고 버전·조건을 다시 고정한다.

| 항목 | `[사실]` 공식 문서에서 확인한 조건 | 적용·미확인 |
|---|---|---|
| UE 5.8 운영체제·개발도구 | 최소 macOS Sonoma 14.5, 최소 Xcode 26.0, 권장 Xcode 26.1.1. Xcode 26.4 비호환이 명시돼 있다. [Mac 요건][S1] | **M5 Pro 실기의 macOS·Xcode 조합은 미확인.** ‘최소 OS’만 보고 개발도구 설치 가능까지 보장하지 않는다. |
| 이전 버전과 차이 | 5.6~5.7 표는 최소 Sonoma 14.0, Xcode 15.2를 기재한다. [Mac 버전 표][S1] | **[추정]** 다른 UE 버전의 요구사항을 섞지 않는다. |
| 메모리·GPU | 최소 메모리 16GB, 권장 32GB 이상, 권장 CPU Apple Silicon M3, Metal 1.2 호환 GPU. [Mac 요건][S1] | 실제 M5 Pro의 통합 메모리·여유 공간·성능은 미확인. M5 Pro 전용 FPS나 설치 시간은 이 자료에서 확인하지 못했다. |
| 렌더 기능 | Software Lumen은 M1+, hardware RT Lumen/MegaLights는 M2+ Experimental, Nanite/VSM은 M2+ Beta로 표기된다. [기능별 표][S1] | **[추정]** 첫 비교는 실험적 hardware RT·MegaLights와 Nanite/VSM을 끈 단순 경로로 시작한다. 지원 표가 특정 장면의 성공·속도를 보장하지 않는다. |
| 설치·인증 | 엔진 다운로드는 Epic 계정 로그인과 가격 조건·UE EULA 동의가 필요하다. 선택 구성요소별 필요 공간은 Launcher Options에 표시된다. [설치 문서][S2] | 이 작업에서 계정·설치 화면에 접근하지 않았다. 실제 필요 공간·다운로드량은 미확인. |

**[사실·문서 주의]** Epic의 같은 Mac 페이지 상단에는 macOS 이름과 숫자가 맞지 않는 권장 OS 표기가 있고, 버전 이력 표에는 Sequoia 15가 적혀 있다. 이 문서는 버전별 최소 조건을 인용하며 권장 OS 오기를 임의로 보정해 요구사항으로 확정하지 않는다. Xcode 자체가 실행 가능한 macOS 범위는 [Apple 공식 표][S3]도 함께 대조해야 한다.

**[추정·사용자 확인 순서]** 실제 칩·RAM·macOS 버전 → 선택 UE 패치의 요구사항 → Xcode 호스트 OS 조건 → Mac에 이미 설치된 도구 순으로 교집합을 확인한다. 최신 Xcode가 무조건 호환된다고 보지 않는다. 맞는 조합이 없으면 OS/도구를 자동 변경하지 않고 설치 전 중단한다.

### 2.2 디스크 계획

**[사실·공식 문서]** [설치 문서][S2]에서 확인한 공식 기준은 **선택한 구성요소의 공간을 Options에서 확인하는 것**이다. Mac M5 Pro용 UE 5.8 전체 설치량이나 일정한 설치 완료 시간의 보장값은 이 조사에서 확인하지 못했다. 오래된 UE4 교육 자료의 용량을 UE5 수치로 옮기지 않는다.

**[추정·용량 예산, 공식 최소치 아님]** 사용자 설치 전에는 다음과 같이 임시로 잡되, 실제 Options 값이 우선한다.

| 구분 | `[추정]` 임시 여유량 | 계획 |
|---|---:|---|
| 엔진·설치 임시 공간 | 60~100GB | Core·Templates 중심, 불필요한 타깃 플랫폼·심볼·대형 샘플 제외. 엔진은 한 버전만. |
| Xcode·관련 개발도구 | 추가 30~50GB | 이미 설치된 경우 추가량 재산정. 압축 해제·업데이트 여유 포함 제안이며 실측 아님. |
| 프로젝트·선별 에셋·DDC·Intermediate·빌드·캡처 | 20GB 경계 안에서 관리 | 대형 라이브러리 일괄 수령 금지. 원본 텍스처는 필요한 해상도만. |
| 운영 여유 | 100GB | 공통 운영 매뉴얼의 여유 공간 기준. |

**[추정·착수 기준]** 완전 신규 환경은 대략 **210~270GB 여유**를 사전 계획값으로 잡는다. 실제 판정은 `Options의 필요량 + 추가 도구/캐시/임시 공간 + 운영 여유 100GB`로 다시 계산한다. 이 수치를 Epic 공식 설치 요건이라고 인용하지 않는다.

**[사실·프로젝트 규칙 적용]** 작업 증가량이 20GB를 넘으면 정리가 먼저다. 엔진·도구도 증가량 기록에서 숨기지 않는다. 사용자 설치 단계에서 이 경계를 넘는 경우에도 다음 대형 작업 전에 용량을 점검하고 불필요한 선택 구성·자기 임시 산출물을 정리한다. 정리 가능한 자기 파일이 없으면 총괄에게 올리고 추가 작업을 멈춘다. 다른 레인의 빌드·세이브·캐시는 지우지 않는다.

### 2.3 시간 계획

- **[추정]** 다운로드의 이론 하한은 `분 ≈ 다운로드 GB × 8,000 ÷ 유효 Mbps ÷ 60`이다(십진 단위). 예를 들어 **가정한** 40GB를 유효 100Mbps로 받으면 약 53분이며, 이것은 실제 다운로드량이나 총 설치 시간 예측값이 아니다.
- **[추정]** 설치·검증 20~60분, Xcode 준비 30~90분, 첫 프로젝트 셰이더·캐시 준비 20~90분을 별도 일정으로 둔다. 네트워크 대기와 사용자 약관 검토를 합쳐 사전 준비 **2~5시간 이상**을 잠정 예약한다. 느린 회선·도구 비호환이면 범위를 넘을 수 있다.
- **[추정]** 실제 기록은 다운로드 대기/설치/셰이더 대기/사람 작업을 나눈다. 설치에 쓴 시간을 장면 제작 시간이나 UE 성능으로 합산하지 않는다. 사용자 준비 완료 뒤의 장면 실험 예산은 §6으로 제한한다.

## 3. 독립 실험 프로젝트와 렌더 설정

**[사실·공식 문서]** Games → Top Down 템플릿에는 이동 캐릭터·기본 레벨이 있다. 기본형과 Strategy/Twin Stick 변형이 구분되며 **Strategy는 직교 카메라**를 사용한다. [Top Down 문서][S4]

**[추정·설정안]** 후속 실행이 별도 승인되면 독립 UE 시험 프로젝트 `EXO_UE5_Trial`을 만들고 다음을 고정한다. 기존 프로젝트 복사본을 만들어 편집하는 방식이나 Unity 제품 코드 변경은 하지 않는다.

1. **Top Down / Variant None / Blueprint / Desktop / Maximum**을 시작점으로 삼는다. Starter Content와 외부 플러그인은 필요한 것만 선택한다. 템플릿 기본 카메라가 비교 기준이라고 가정하지 않는다.
2. 작은 비 World Partition 레벨 `/Game/Trial/L_11_Keyshot` 하나를 사용한다. 월드 스트리밍·오픈월드·네트워크·게임 전체 이식은 제외한다. 맵·GameMode·런타임 참조 자산을 cook 대상에 명시한다.
3. 원근 CameraComponent를 사용하고 피치 **수평면 아래 34°**를 유지한다. SpringArm 충돌에 의한 길이 변경, 카메라 lag·자동 yaw·사용자 줌은 끈다. Unity의 추적 기준점·오프셋이 있으면 동일하게 재현한다. 피치·FOV·거리로 새 구도를 꾸미지 않는다.
4. 최초 기준은 Deferred/Metal, 고정 해상도 1920×1080, screen percentage 100%, dynamic resolution 끔. AA·그림자·GI·반사·노출 설정을 기록한다. 기능 이름이 같다고 Unity와 같은 비용·그림이라고 보지 않는다.
5. 고정 노출, motion blur·DOF·film grain·비네트 끔을 시작점으로 삼는다. 배경은 일반 해상도, 캐릭터는 §5의 별도 픽셀 경로다. Lumen은 첫 기준에서는 끄고 직접광·환경광으로 구도를 먼저 맞춘다. Lumen을 켠 추가 결과는 설정을 별도 표기한다.
6. 실제 MoodLab의 광원 방향·명암 계층을 먼저 따라간다. UE만 과한 안개·광택·심도·후보 에셋으로 미화해 엔진 차이라고 부르지 않는다.

## 4. Unity MoodLab과 같은 화면을 만드는 환산

### 4.1 먼저 받아야 할 기준값

**[추정·필수 입력]** Unity 담당자가 확정한 MoodLab의 읽기 전용 기준 묶음을 사용한다: 커밋 SHA, 장면/실행본 버전, 원본 1920×1080 화면, 카메라 위치·forward/up·투영 방식·세로 FOV·aspect·추적 대상·오프셋·거리 정의·clip plane·lens shift/물리 카메라 여부, 영웅/다리/고목/먼 적의 좌표·스케일, 캐릭터 RT 크기·필터·팔레트·외곽선과 AA 조건. 현재 이 문서는 그 실제 값들을 확인하지 않았다. **34° 외 FOV·거리·RT 크기는 미확인**이다.

**[추정·공정성]** 기준 입력이 없으면 승인된 원본 화면과 함께 ‘구도 보정 전’ 상태로 멈춘다. 참고 문서의 발 좌표 `(50%,60%)`나 먼 적 높이 `2~4%H`를 실측값 대신 채우지 않는다.

### 4.2 FOV·거리·좌표

**[사실·공식 문서]** Unity `Camera.fieldOfView`는 세로 FOV이며, UE `UCameraComponent.FieldOfView`는 원근 모드의 가로 FOV다. UE의 aspect-axis constraint도 실제 투영에 영향을 준다. [Unity FOV][S5], [UE CameraComponent][S6]

**[추정·수학적 환산안]** 대칭 원근 투영이며 lens shift가 없다는 조건에서, 같은 종횡비 `a=W/H`에 대해 다음을 쓴다. 삼각함수에는 각도 단위를 일관되게 적용한다.

```text
UE 가로 FOV θh = 2 × atan(tan(Unity 세로 FOV θv / 2) × a)
세로 FOV θv    = 2 × atan(tan(가로 FOV θh / 2) / a)
광축 거리 d의 수직 평면에 보이는 높이 H = 2 × d × tan(θv / 2)
```

**[추정·계산 예시]** Unity 세로 FOV가 **가정상 60°**이고 16:9이면 UE 가로 FOV는 약 **91.49°**다. 60°는 현재 MoodLab 수치가 아니다. 실제 FOV가 들어오면 다시 계산한다. UE에서는 `AspectRatio`와 axis constraint를 명시하고, 최종 유효 세로 FOV를 다시 역산해 확인한다. 초광폭 비교에서는 Unity의 세로 FOV 유지 규칙과 일치시키며 16:9 가로 FOV를 그대로 고정하지 않는다.

**[사실·공식 문서]** UE는 기본 길이 단위 cm, Z-up 좌표계를 쓴다. [단위][S7], [좌표계][S8]

**[추정·변환안]** Unity에서 `X=오른쪽, Y=위, Z=장면 북쪽`이고 **1 unit=1m로 확인된 경우에만** UE `X=북쪽, Y=오른쪽, Z=위`로 다음 변환을 사용한다.

```text
UE 위치(cm) = 100 × (Unity z, Unity x, Unity y)
UE 카메라-대상 거리(cm) = 100 × Unity 카메라-동일 대상 거리(unit)
```

**[추정]** 실제 스케일이 다르면 알려진 모델 높이·다리 길이에서 공통 계수를 먼저 구한다. 카메라와 대상·오프셋·모든 장면 좌표에 **같은 계수**를 적용한다. 높이와 수평거리 중 하나만 ‘거리’로 비교하지 않는다. 회전 Euler 값을 그대로 복사하지 않고 forward/up 벡터를 좌표 변환해 회전을 만든다. UE 수평 기준 하향 pitch는 통상 `-34°`로 표현하되, 숫자 부호보다 최종 forward 벡터의 하향 34°를 검증한다.

**[추정·거리 원칙]** FOV·좌표·스케일을 정확히 환산했다면 거리는 추가 미용 조정 없이 환산값을 유지한다. 같은 크기의 한 평면만 맞추는 식 `d2=d1×tan(θv1/2)/tan(θv2/2)`은 진단용일 뿐이다. FOV와 거리를 함께 바꾸면 전경 고목과 먼 적의 원근 비율이 달라지므로 동일 화면의 해법으로 채택하지 않는다. 위 `H`도 지면 전체의 보이는 깊이를 뜻하지 않는다.

### 4.3 구도 보정 절차

**[추정·설계]** 회색 단계에서 영웅 발·다리 양쪽 끝·고목 밑동·먼 적 발을 공통 앵커로 찍고, 화면 좌상단 `(0,0)` 기준 정규화 좌표와 표시 높이를 기록한다. 최소 전경·중경·원경에 앵커를 둔다. 기준과 다르면 순서대로 aspect/viewport → FOV 축 → 단위/좌표 → 카메라 기준점/오프셋 → lens shift/custom projection → SpringArm 자동 변경을 점검한다. 최종 이미지를 크롭하거나 영웅·먼 적을 개별 확대해 맞추지 않는다. 물리 카메라·비대칭 투영이면 위 단순식의 적용을 중단하고 유효 투영행렬 대응부터 정한다.

## 5. 저해상도 픽셀 캐릭터 패스 후보

**[사실·공식 문서]** `SceneCaptureComponent2D`는 장면을 Render Target으로 캡처한다. 상위 SceneCapture에는 ShowOnly/Hidden 목록이 있다. Post Process Material은 커스텀 화면 처리를 넣을 수 있고 Custom Depth/Stencil을 활용할 수 있다. 이것은 **완성된 캐릭터 전용 픽셀 파이프라인이 기본 제공된다는 뜻이 아니다.** [SceneCapture2D][S9], [SceneCapture][S10], [Post Process Materials][S11]

아래 구현·시간·위험은 모두 **[추정·미검증 후보]**다. 새 손그림 스프라이트 생성이나 전체 화면 저해상도화로 대체하지 않는다. 동일한 권리의 리깅 메시·애니메이션을 두 엔진에서 쓰는 것이 우선이며, 확보하지 못하면 캐릭터 품질 우열은 판정 보류다.

| 후보 | 방법 | 맞춰야 할 점·한계 | 추가 시간 `[추정]` |
|---|---|---|---:|
| A. 캐릭터 전용 SceneCapture2D + RT + 합성 | 주 카메라와 같은 위치·원근·aspect의 캡처를 만들고 캐릭터만 ShowOnly로 렌더. RT는 Unity 기준과 같은 논리 해상도. nearest/Point 샘플, 정수 배율 확대, RT 기준 1텍셀 외곽선. | 알파 확보·캡처 source·조명/톤매핑 차이를 확인. 원본 메시의 메인 뷰 노출을 분리하고 그림자는 유지. depth를 주 장면과 비교해 고목·난간 뒤에 올바르게 가려지게 합성. 그림자 이중화·가림 누출이 가장 큰 위험. | 2~4시간 |
| B. 메인 뷰 Custom Stencil + 픽셀화 Post Process | 캐릭터 stencil 영역에서만 UV를 저해상도 격자로 양자화하고 외곽선을 처리. 배경 픽셀은 유지. | 실제 저해상도 캐릭터 RT와 다른 근사 방식. 격자 셀이 배경 색을 집거나 경계가 떨릴 수 있음. TAA/TSR 전후 처리 순서·깊이·외곽선 누출 검증 필요. | 1~3시간 |
| C. 커스텀 렌더 패스 | C++ 렌더 확장으로 캐릭터 색·depth를 분리해 저해상도 버퍼로 그리고 주 뷰와 깊이 합성. | A/B로 해결하지 못한 경우의 연구 경로. 엔진 내부·Metal·업데이트 유지 검증이 필요하고 이번 짧은 실험의 기본 경로로 쓰지 않음. | 1~3일 이상, 본 실험 밖 |

**[추정·선택]** A를 우선 시험한다. 가림 합성이 시간 상한을 넘으면 B는 별도 근사 결과로만 비교하고 A와 동등하다고 쓰지 않는다. A와 B를 모두 완성해야 하는 계획은 아니다. C가 필요하다는 결론이면 이번 픽셀 동등성 실험을 중단한다.

**[추정·세부 판정]** 1920×1080과 3840×1080에서 같은 세로 논리 해상도를 유지한다. 논리 RT 크기 `Wl×Hl`, 확대 `k`라면 `W=kWl`, `H=kHl`을 만족시켜야 하며, 미확인 Unity RT 크기를 임의의 64/128로 채우지 않는다. 캐릭터 수가 늘 때 캡처가 개체별로 늘어나는지, 한 번의 공유 캡처인지도 기록한다.

**[추정·검증 장면]** 정지 실루엣, 다리 위 10초 이동, 고목/난간 뒤 통과, 먼 적 이동을 포함한다. 발 접지·원근 크기·정수 픽셀·1텍셀 외곽선·가림·접촉 그림자·잔상·반짝이는 낱픽셀을 1x와 3x로 본다. 캐릭터 전용 패스에 temporal jitter·AA·보간·후속 업스케일이 다시 섞이지 않게 설정과 최종 출력을 대조한다. AA off/FXAA는 후보이며 성공값으로 단정하지 않는다.

## 6. 1-1 키샷 제작 순서와 예상 시간

**[추정·장면 목표]** 남→북 나무다리, 양쪽 늪, 가장자리 큰 고목, 중경 영웅, 북쪽 작은 먼 적을 유지한다. 구도 참고 문서의 안 1을 관찰 항목으로 삼되 실제 배치·비율은 Unity MoodLab 기준에 맞춘다. 새 평면도나 새 카메라를 설계하지 않는다.

아래는 **[추정]**, 준비된 기준 자료·사용자 설치 완료·기존 리깅 자산 사용·담당자 1명 기준이다. 셰이더/다운로드 대기는 별도 기록하며, 다른 레인의 완료를 기다리면서 그 레인을 수정하지 않는다.

| 단계 | 작업과 관문 | 사람 작업 시간 `[추정]` |
|---|---|---:|
| G0 기준 고정 | Unity SHA·원본 화면·카메라/RT 값·자산 사용권·실험 상한 확보. 없으면 해당 비교 보류. | 0.5시간 |
| G1 프로젝트 | 템플릿 None, 시험 레벨, 고정 카메라, 해상도·노출·렌더 기능 기록. | 0.5~1시간 |
| G2 회색 구도 | 다리 바닥·난간, 양쪽 늪의 평면, 고목의 큰 외곽, 영웅·먼 적 대체 메시. 실제 좌표 환산 뒤 다중 깊이 앵커 비교. | 1~2시간 |
| G3 접지·길 | 다리 두 끝과 영웅 발 접점, 고목 밑동을 맞추고 먼 적까지 접근 경로 확보. 복잡한 Water 시스템 대신 단순 물 머티리얼부터. | 1~2시간 |
| G4 재질·빛 | 권리가 확인된 기존 자산 우선. 필요한 목재/습지/수피만 교체. 기존 명암·그림자 방향·늪 반사를 맞추고 안개는 먼 적을 가리지 않는 범위. | 0.5~1시간 |
| G5 캐릭터 | §5 A의 최소 패스와 기존 이동 애니메이션 연결. 실루엣·가림 검증. 실패 시 시간 상한 안에서 B 근사 여부 판단. | 2~4시간 |
| G6 런타임 증거 | 무창 준비/캡처 fixture, 패키징 1회, 패키지의 게임 카메라 캡처와 10초 이동 증거. | 1~2시간 |
| G7 비교·판정 | 동일 크기 비교, 3x 결함 점검, 동등한 warm 구간의 프레임 시간·메모리·수동 개입 기록. | 1~2시간 |
| G8 정리·보고 | 최신 증거만 정리, SHA/설정/미확인 범위/중단 이유 기록. 확인된 빌드 삭제는 공통 규칙에 따름. | 0.5~1시간 |

**[추정·일정]** 사람 작업 합계 **8~15.5시간**, 준비 2~5시간 이상과 첫 캐시 대기는 별도다. **2일·사람 작업 16시간**을 실험 상한으로 제안한다. G2까지 누적 3.5시간 안에 동일 구도가 안 나오면 재질 작업으로 넘어가지 않는다. 픽셀 패스는 4시간에서 정지한다. 신규 에셋 제작·AI 생성·전투 시스템 이식이 필요해지면 이 일정에 억지로 넣지 않고 범위 밖으로 분리한다.

## 7. 무료 에셋과 라이선스 확인

### 7.1 Fab

**[사실·공식 문구 확인]** Fab의 공개 Standard License 요약에는 **“Use the assets commercially or privately”**라고 적혀 있다. 호환 도구에서의 사용, 프로젝트에 포함한 배포, 수정과 프로젝트 협업자 공유를 허용하며 에셋 단독 재판매·재배포는 허용하지 않는다고 설명한다. 이 페이지 스스로 **요약은 법적 구속력이 없고 전문 EULA가 우선**이라고 명시한다. 이번 열람에서는 요약을 확인했으며, 전문 전체의 추출·대조 완료를 주장하지 않는다. [Fab 공개 라이선스 요약][S12]

**[사실·공식 문서]** Fab에는 무료 CC-BY와 무료/유료 Standard가 있다. Personal은 직전 12개월 상업활동 총매출이 $100,000을 넘지 않는 구매자, Professional은 이를 넘는 구매자용이며 실제 계산 범위는 EULA를 봐야 한다. Reference Only는 원본 메시 취득 권한과 다르다. 기존 UE Marketplace 라이선스로 제공되는 이관 제품도 있을 수 있다. [라이선스·가격][S13]

**[사실·공식 문서]** CC BY 4.0은 상업 이용·변형을 허용하되 적절한 저작자 표시, 라이선스 링크, 변경 표시 등을 요구한다. 실제 listing의 CC 버전을 먼저 확인해야 한다. [Creative Commons 공식 조건][S14]

**[추정·에셋 선별안]** Fab에서 Free 필터와 `wood bridge`, `wet ground`, `dead tree`, `bark` 등을 검색하되, 이번 계획서에서는 개별 상품의 현재 무료 가격·다운로드 가능·Mac 호환·권리를 **확정하지 않는다**. 목재/습지 재질 각 1개와 고목 1개 이내로 시작한다. 기존 소유 자산으로 동등성을 만들 수 있으면 새 취득을 생략한다.

### 7.2 Quixel Megascans

**[사실·공식 계약]** 기존 Quixel/Megascans는 취득 당시 가입 플랜·자격에 따라 권리가 달라진다. Epic Content License의 Megascans Addendum은 Unreal Engine plan 취득분을 UE-Only로 제한하며, Megascans plan 미가입 계정의 Free Assets는 내부 평가에만 사용하고 프로젝트 포함 배포도 허용하지 않는다고 명시한다. **이 조항을 Fab Standard 취득 자산 전체에 적용하거나 그 반대로 적용하면 안 된다.** [Content EULA, Megascans Addendum §1(c)/(e)][S15]

**[추정·사용 원칙]** ‘Megascans이므로 지금 모두 무료’, ‘UE용으로 예전에 받았으므로 Unity에도 사용 가능’이라고 가정하지 않는다. Fab에서 현재 무료로 제공되는 개별 Megascans 또는 이미 취득한 자산도 **취득 경로·날짜·라이선스·계정 권리**부터 확인한다. 이 계정의 과거 취득 이력·현재 무료 목록·권리 이전 상태는 로그인하지 않았으므로 **미확인**이다. 권리가 불분명하면 사용하지 않고 기존 자산/회색 대체물로 남긴다. UE-Only 자산을 Unity 비교판에 복제하지 않는다.

**[추정·후속 자산 기록 항목]** 자산명/판매자/listing URL/확인일/당시 가격 0 여부/취득일/적용 약관·tier/사용 가능 엔진/재배포·표시 조건/파일 형식/선택 UE 버전·ARM64 의존성/사용 장면을 기록한다. 지금은 전부 미선정이다. 원본 에셋 공개 업로드·약관 동의·라이브러리 추가는 하지 않는다. 무료 메시가 없다고 유료 자산으로 대체하지 않는다.

## 8. 헤드리스 빌드·캡처 명령 초안 — 전부 미실행·미검증

### 8.1 공식 근거와 선행 조건

- **[사실·공식 문서]** UAT `BuildCookRun`은 build/cook/stage/package 등의 단계로 구성된다. `RunUAT.sh`와 Mac arm64 지정 예시는 공식 문서에 있으나, 아래 조합 전체를 M5 Pro·UE 5.8에서 검증한 것은 아니다. ARM64 예시 문서는 **UE 5.1 자료**임을 구분한다. [빌드 작업][S16], [ARM64 예시][S17]
- **[사실·공식 문서]** `RenderOffScreen`은 화면 밖 렌더링, `nullrhi`는 null RHI, `unattended`는 무인 실행 옵션이다. `-unattended`만으로 창이 안 뜬다는 보장은 아니다. 캡처에 `-nullrhi`를 붙이지 않는다. `-nosound` 근거는 공식 FApp API 설명이다. [옵션][S18], [오디오 API][S19]
- **[사실·공식 문서]** `Shot`은 현재 게임 해상도 캡처, `HighResShot`은 별도 고해상도/타일 캡처다. [스크린샷 문서][S20] MRQ의 queue/config 명령행 경로는 Epic 튜토리얼에 있으나 예시 대상은 UE4.27/5.0/5.1이다. [MRQ 명령행 튜토리얼][S21]
- **[추정·선행 구현]** 아래 프로젝트·맵·MRQ Queue·출력 폴더는 **아직 존재한다고 확인한 것이 아니라 후속 실행 때 만들 대상**이다. `-RenderOffScreen`의 Mac Metal 무창 동작은 미확인이다. 첫 최소 캡처에서 창·음향·검은 출력 여부를 확인하고 실패하면 자동으로 보이는 창 모드로 전환하지 않는다.

**[추정·명령 공통 전제]** Mac zsh/bash용이다. `UE_ROOT`, `TRIAL_PROJECT`, `TRIAL_OUT`, `TRIAL_APP_BIN`은 실행 담당자가 실제 절대 경로로 치환한다. OUT은 그 담당자가 미리 마련한 고정 출력 디렉터리다. `/절대경로/...`는 예시 자리표시자이며 실행 가능한 현재 경로가 아니다. 모든 프로세스 명령은 **stdin을 `</dev/null`로 닫는다**. 무인 실행에 로그인·동의 프롬프트를 숨겨 통과시키지 않는다. 셸 출력은 고정 로그에 덮어쓴다.

### 8.2 무인 패키징 후보

**[추정·미검증 명령]** 에디터 UI를 조작하지 않는 Mac Development 패키징 1회다. `-build`는 필요한 프로젝트 코드를 빌드하며, Blueprint-only라고 cook/셰이더 준비가 사라지는 것은 아니다. 엔진 소스 전체 빌드는 계획하지 않는다. `-run`/`-deploy`를 넣지 않는다.

```bash
UE_ROOT="/절대경로/UE_5.8"
TRIAL_PROJECT="/절대경로/EXO_UE5_Trial/EXO_UE5_Trial.uproject"
TRIAL_OUT="/절대경로/ue5-trial-current"

"${UE_ROOT}/Engine/Build/BatchFiles/RunUAT.sh" BuildCookRun \
  -project="${TRIAL_PROJECT}" -platform=Mac -architecture=arm64 \
  -clientconfig=Development -build -cook -stage -pak -package -archive \
  -archivedirectory="${TRIAL_OUT}/build-current" \
  -map=/Game/Trial/L_11_Keyshot -nop4 -unattended -utf8output \
  </dev/null >"${TRIAL_OUT}/build.log" 2>&1
```

**[추정·확인 항목]** UAT 종료 코드, cook된 맵·의존 자산, arm64 실행 파일, 치명적 오류 유무를 확인한다. 미확인 인자가 무시됐는데 성공한 것으로 처리하지 않는다. 성공 로그만으로 시각 PASS를 주지 않는다.

### 8.3 게임 카메라의 패키지 캡처 후보

**[추정·선행 구현 필요]** 시험 레벨의 Blueprint/C++ fixture가 기준 카메라를 설정하고, 자산/셰이더 준비를 확인한 뒤 정지 화면 `Shot`과 10초 이동 표본을 얻고 종료하도록 만든다. 파일 생성 완료와 출력 경로를 로그로 확인한다. 이 fixture는 UE 기본 제공 완성 기능이 아니며 아직 구현하지 않았다. 시작 직후 `Shot`을 던져 빈 화면을 합격시키지 않는다. 무창 자동 이동은 고정 경로 재생 증거이며, 자연스러운 조작 품질 확인을 대체하지 않는다.

**[추정·미검증 명령]** 실제 `.app/Contents/MacOS/…` 실행 파일 경로를 package 결과에서 확인해 치환한다. 아래 명령 자체가 fixture를 생성하거나 준비 완료를 보장하지 않는다. `-nullrhi` 없이 GPU 렌더링한다.

```bash
TRIAL_APP_BIN="/절대경로/build-current/실제앱.app/Contents/MacOS/실제실행파일"

"${TRIAL_APP_BIN}" /Game/Trial/L_11_Keyshot \
  -RenderOffScreen -unattended -nosound -ResX=1920 -ResY=1080 \
  -stdout \
  </dev/null >"${TRIAL_OUT}/capture.log" 2>&1
```

**[추정·실행 판정]** fixture가 준비 상태 뒤 호출할 기본 콘솔 명령은 `Shot`이다. 원본 PNG가 1920×1080이고 실제 게임 카메라 출력인지 검사한다. 공식 문서의 `Saved/Screenshots/Windows` 예시를 Mac 실제 출력 위치로 단정하지 않고 로그/생성 파일에서 찾는다. 3840×1080은 aspect 환산을 고정한 뒤 해상도 인자를 바꿔 같은 빌드로 캡처한다. 화면 일부 크롭·초해상도 보정·바탕화면 대체 캡처는 동일 구도 증거로 쓰지 않는다.

**[추정·감시]** fixture 정상 종료와 별도로 실행 담당자의 감시가 필요하다. 런타임 캡처는 준비 대기 포함 5분 상한을 제안한다. 초과하면 해당 시험 프로세스만 종료하고 로그로 원인을 분리한다. 같은 이유로 수정 없이 반복 실행하지 않는다. 빌드·셰이더 작업의 장시간 상한은 시작 전 별도로 정한다.

### 8.4 MRQ 보조 렌더 후보

**[추정·미검증 명령]** `Movie Render Queue` 플러그인, 저장된 Queue `/Game/Trial/Q_11_Keyshot`, Level Sequence·Camera Cuts, 출력 해상도/폴더/프레임 범위가 먼저 필요하다. 이 명령은 공식 튜토리얼의 Windows 예시를 Mac 실행 파일 경로와 무창 옵션으로 **응용한 초안**이다. UE 5.8 Mac에서의 조합 성공은 미확인이다. Queue 출력은 `${TRIAL_OUT}/capture-current`로 미리 지정한다.

```bash
"${UE_ROOT}/Engine/Binaries/Mac/UnrealEditor.app/Contents/MacOS/UnrealEditor" \
  "${TRIAL_PROJECT}" /Game/Trial/L_11_Keyshot -game \
  -MoviePipelineConfig="/Game/Trial/Q_11_Keyshot" \
  -RenderOffScreen -unattended -nosound -stdout \
  </dev/null >"${TRIAL_OUT}/mrq.log" 2>&1
```

**[추정·증거 구분]** MRQ는 조명/형태 진단에만 사용한다. 시간·공간 샘플 누적이나 다른 카메라 설정으로 더 좋아진 MRQ 정지 렌더를 패키지 런타임 PASS로 대체하지 않는다. MRQ만 성공하면 ‘보조 렌더 가능 / 실제 런타임 비교 미검증’이다. Python 자동화·외부 인코더 설치를 전제하지 않는다.

## 9. Unity MoodLab과 비교하는 판정 기준

**[추정·비교 계약]** 아래 수치 허용치는 실험용 제안이며 현재 통과값이 아니다. 두 엔진에 같은 허용치를 적용한다. 원본은 동일 출력 크기·동일 모니터 배율의 1x로 나란히 보고, 결함 확인용 3x 확대는 nearest로 한다. 원본 기준을 받지 못하면 비교판을 만들었다고 보고하지 않는다.

| 항목 | `[추정]` 판정 제안 | 보류/FAIL |
|---|---|---|
| 구도 동등성 | 피치 34°, 환산 FOV/위치/거리 고정. 영웅 발·먼 적 발·다리 끝·고목 앵커가 기준의 화면 W/H 각각 1% 이내. 영웅·먼 적 높이 차이는 각각 2px 또는 기준 높이 5% 중 큰 값 이내. | 카메라 조정·크롭·개별 모델 확대가 필요하거나 전경/원경 크기 관계가 다름. |
| 1-1 공간 | 다리·늪 양쪽·고목 전경·먼 적이 동시에 읽히고 북쪽 진행 경로 유지. | 먼 적을 어둠·안개·비네트·가림으로 지움. |
| 픽셀 캐릭터 | 같은 리그·동작·논리 해상도·정수 배율·Point·1텍셀 외곽선. 이동 중 발 접지와 depth 가림 정상. | 배경 샘플 누출·지속 잔상·납작한 카드·낱픽셀/점·틀린 얼굴/장비. RT/자산이 다르면 직접 품질 우열 보류. |
| 배경·조명 | 같은 물체 배치와 광원 방향·명암 계층에서 깊이, 접촉 그림자, 수면/수피/목재 구분을 육안 대조. | 재질 수치가 같다는 이유만으로 PASS, 엔진마다 다른 소품으로 차이를 숨김. |
| 실행 증거 | 동일 UE 빌드의 1920×1080 및 3840×1080 게임 카메라 화면, 10초 무음 이동 증거, 빌드/캡처 핵심 로그·SHA. 21:9도 같은 카메라 규칙의 화면 확인. | Editor 미리보기·MRQ·컴파일만 존재. 영상 도구가 없으면 정지 화면만의 한계 표기. |
| 성능·작업성 | 같은 M5 Pro·전원 조건, 같은 장면/배우 수/해상도/품질 목표에서 warm 구간 CPU/GPU frame time, p50/p95, 메모리와 수동 개입 시간을 기록. | cold 셰이더 시간과 steady FPS 혼합, 계측 누락/다른 기기 결과로 우열 주장. |

**[추정·기본 성능 목표]** 1920×1080의 warm 10초 경로에서 목표 60fps, frame time p95 16.7ms 이하를 잠정 기준으로 제안한다. 이를 총괄이 고정하기 전에는 합격 기준으로 확정하지 않는다. 3840×1080은 가독성과 실제 성능을 별도로 기록하고 1080p 결과를 외삽하지 않는다. 단일 10초 구간은 장시간 안정성 증거가 아니며, 선택한 관측 도구·구간·warm-up을 함께 남긴다.

**[추정·최종 상태]** 판정은 `비교 가능·목표 충족`, `부분 확인`, `실험 중단`, `판정 보류` 중 하나로 남긴다. 구도 동등성·실게임 화면·픽셀 가림 중 하나가 빠지면 전체 PASS를 주지 않는다. 합격해도 결론은 **‘이 장면·이 설정의 비교 실험 통과’**까지다. 엔진 전환 권고나 개발 전체 생산성 우열로 확대하지 않는다.

## 10. 실험 중단 조건

다음은 모두 **[추정·운영 제안]**이며, 실행 승인이 있을 때도 적용한다.

1. **기준 부재:** Unity MoodLab의 확정 SHA·원본 화면·FOV/거리/RT 정보가 없어서 동일 구도를 검증할 수 없다. 해당 비교를 보류하고 값을 지어내지 않는다.
2. **환경 불일치:** 선택 UE·macOS·Xcode 교집합을 확보하지 못하거나 Mac ARM64 플러그인 의존성이 해결되지 않는다. 다른 버전 설치/OS 변경으로 자동 확장하지 않는다.
3. **권리/비용:** 사용권·취득 이력·무료 가격이 불명확하거나 결제·유료 API가 필요하다. 그 자산을 제외하고, 핵심 비교가 불가능하면 중단한다.
4. **시간 초과:** 회색 구도 누적 3.5시간, 픽셀 패스 4시간, 전체 사람 작업 16시간/2일 상한을 넘는다. 미달 항목과 다음 연구 질문을 기록하고 실험을 끝낸다.
5. **두 번 실패:** 같은 핵심 결함이 원인 수정 뒤에도 두 번 발생하면 같은 방식 재시도 중지. 코드·설정 변경 없는 실패 재실행 금지. 대안도 시간·권리 범위 안에서만 선택한다.
6. **디스크/운영:** 여유 100GB 미만 또는 작업 증가량 20GB 초과 시 정리가 먼저다. 자기 산출물로 해결하지 못하면 중단한다. 사용자 앱·세이브·타 레인 프로세스·공유 실행본을 종료/삭제/교체하지 않는다.
7. **무창/무음 실패:** 창이 뜨거나 소리가 나거나 Metal offscreen에서 캡처가 검게 나오면 그 경로를 중단한다. `nullrhi` 결과로 이미지 성공을 주장하지 않는다.
8. **품질 미달:** 먼 적 소실, 전경/원경 원근 불일치, 픽셀 캐릭터의 가림/접지 오류가 남는다. UE 화면만 확대·블러·안개로 결함을 숨기지 않는다.

## 11. 사용자가 직접 해야 할 일과 후속 기록

**[사실·공식 절차]** Epic 계정 생성/로그인과 설치용 가격 조건·EULA 동의는 설치 문서에 명시돼 있다. Fab 자산 취득도 Epic 계정 로그인이 필요하다. [설치][S2], [Fab 취득 절차][S22]

**[추정·역할 구분]** 후속 실험 전에 사용자가 직접 수행한다.

- Epic 계정·2FA·필요한 Apple 계정 접근을 준비하고 직접 로그인한다. 비밀번호/토큰은 보고서나 Git에 넣지 않는다.
- 호환 UE 패치·Xcode·설치 위치·Options 용량을 확인하고 직접 설치한다. 다운로드·실행·라이선스 동의는 이번 문서 작성 범위에 포함되지 않는다.
- UE EULA, Fab 전문과 해당 자산 약관·적절한 tier를 읽고 동의 여부를 결정한다. 과거 Quixel 취득 권리를 확인한다. 미확인 자산의 사용을 허용된 것으로 간주하지 않는다.
- **로열티·seat 조건을 직접 확인한다.** 아래 계약 요약이 본인/회사/제품에 어떻게 적용되는지 결정하고, 공개 배포가 필요해지면 별도로 검토한다.
- 총괄을 통해 실험 실행 시점·작업 시간 상한·Unity 비교 기준 묶음을 고정한다. 전환이나 제품 배포는 별도 결정이다.

**[사실·공식 계약 요약]** UE EULA는 Royalty Product의 기본 로열티율 5%, 제품별 평생 총매출 첫 $1,000,000 제외와 다른 제외·조건을 규정한다. Launch Everywhere with Epic의 3.5%도 자격 조건이 있다. 로열티 제품 개발의 seat 예외와 다른 이용의 seat/매출 예외는 별개이며, 렌더 이미지 같은 Non-Engine Product의 로열티 예외가 모든 seat 의무까지 없애는 것은 아니다. **‘실험은 언제나 무조건 무료’ 또는 ‘매출 100만 달러 이하 회사는 모든 용도가 무료’로 요약하지 않는다.** [UE EULA §3/§4/§6 및 Royalty Addendum][S23]

**[추정·후속 영수증 항목]** 엔진 정확한 버전·Mac 사양/OS/Xcode·기준 Unity SHA/UE SHA·맵/카메라/RT/렌더 설정·자산 라이선스 출처·실제 명령/종료 코드·출력 경로와 존재·스크린샷/영상·1x 비교 판정·사람 시간/대기 시간·디스크 증가량·남은 미검증 조건을 한 기록으로 정리한다. 빌드·캡처는 고정 폴더의 최신 한 벌만 사용하며, 새 시도별 폴더·manifest·해시 readback을 쌓지 않는다. 검토가 끝난 빌드는 공통 규칙에 따라 정리하고 재현 기준은 커밋 SHA로 남긴다.

**[사실·현재 결과]** 이번에는 계획서만 작성했다. 설치 크기·설치 시간·M5 Pro 호환 실기·UE 빌드·무창 캡처·픽셀 패스·동일 구도·실게임 품질·성능을 검증하지 않았다. Unity/Unreal 프로젝트나 다른 레인의 결과물에는 변경이 없다.

## 출처 URL

공식 문서 조회일: 2026-11-05 KST. 버전이 명시된 옛 예시는 그 범위로만 사용한다. 개별 Fab 자산의 현재 가격·권리 확인을 대신하는 목록이 아니다.

[S1]: https://dev.epicgames.com/documentation/en-us/unreal-engine/macos-development-requirements-for-unreal-engine
[S2]: https://dev.epicgames.com/documentation/en-us/unreal-engine/install-unreal-engine
[S3]: https://developer.apple.com/xcode/system-requirements/
[S4]: https://dev.epicgames.com/documentation/en-us/unreal-engine/top-down-template-in-unreal-engine
[S5]: https://docs.unity.com/en-us/engine/6000.0/script-reference/unityengine/camera/fieldofview
[S6]: https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/UCameraComponent
[S7]: https://dev.epicgames.com/documentation/en-us/unreal-engine/units-of-measurement-in-unreal-engine
[S8]: https://dev.epicgames.com/documentation/en-us/unreal-engine/coordinate-system-and-spaces-in-unreal-engine
[S9]: https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/USceneCaptureComponent2D
[S10]: https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Runtime/Engine/USceneCaptureComponent
[S11]: https://dev.epicgames.com/documentation/en-us/unreal-engine/post-process-materials-in-unreal-engine
[S12]: https://www.fab.com/eula
[S13]: https://dev.epicgames.com/documentation/fab/licenses-and-pricing-in-fab
[S14]: https://creativecommons.org/licenses/by/4.0/
[S15]: https://www.unrealengine.com/en-US/eula/content
[S16]: https://dev.epicgames.com/documentation/en-us/unreal-engine/build-operations-cooking-packaging-deploying-and-running-projects-in-unreal-engine
[S17]: https://dev.epicgames.com/documentation/en-us/unreal-engine/supporting-arm64-and-universal-binaries-for-apple-arcade-in-unreal-engine?application_version=5.1
[S18]: https://dev.epicgames.com/documentation/en-us/unreal-engine/unreal-engine-command-line-arguments-reference
[S19]: https://dev.epicgames.com/documentation/unreal-engine/API/Runtime/Core/FApp/CanEverRenderAudio?lang=en-US
[S20]: https://dev.epicgames.com/documentation/en-us/unreal-engine/taking-screenshots-in-unreal-engine
[S21]: https://dev.epicgames.com/community/learning/tutorials/nZ2e/command-line-rendering-with-unreal-engine-movie-render-queue
[S22]: https://dev.epicgames.com/documentation/en-us/fab/purchasing-and-downloading-assets-in-fab
[S23]: https://www.unrealengine.com/en-US/eula/unreal
