# Unity 기검참 피드백 — 2026-10-24

Godot 보존·Unity 비교 시험의 독립 단위 UNITY-FEEDBACK-01이다. 최종 엔진 결정은 보류한다. 웹/Godot/세이브/Q·E는 변경하지 않는다.

| 항목 | 원본 계약 / Unity 적용 |
|---|---|
| 코어 | [원본 함수·이벤트·RNG·26검사](UNITY_FEEDBACK_CORE_20261024.md). 발사 직전 샘플 요청; 풀 포화에도 소리 유지. 샘플 rate는 caller 난수와 queue 난수를 이미 반영한 QueuedRate 사용 |
| 실제 미디어 | 원 MP3 5개: sword_swing1/2/3, scarecrow_charge, sword_parry. 원본 hit silver 1254×1254/2×2/셀627, PNG·MP3 바이트 무변환 복사. 전체 export138항목/186207576bytes, 각 SHA256 확인 |
| 차지 | 40/80f scarecrow_charge(.35,1),120f sword_parry(.72,1.08),120f 중심 섬광 scale.26/4frames/2ticks. 완료 후 홀드·해제 중 재발동 없음 |
| 명중 | hurtE 후 실제 적 위치/발사 각도. 일반 width140,3타184×chargeScale.4frames/3ticks. 별도 명중음 없음 |
| 합성·풀 | additive20/oldest eviction, alpha1-frame/4×.3; ink8/FIFO,width×1.14,alpha.85×(1-frame×.18). 기존 additive·ink shader 공유. fixed60Hz additive는 생성 tick부터 먼저1 증가, ink는 age/3 |
| 오디오 | Resources 원음5개를 PCM/DecompressOnLoad/preload/원 sample rate로 import. priority swing/parry10, charge2. priority queue unshift, nonpriority30ms debounce, 프레임6/category2 제한·동일key 감쇠, voices48/HIT3 및 priority eviction. OPT60의 sample×master 이중gain 유지: min(1,volume×.6)×.6 |
| 미이식 믹스 | 원본 high shelf6000Hz/-9dB, mid3000Hz/Q.8/-5dB, low250Hz/+4dB 및 compressor 미이식. 전체 오디오/사용자 볼륨 설정 UI/기본무기·적 소리는 이번5샘플 범위 밖 |
| 시간 한계 | 고정60Hz 모델. 원본 additive의 render별 dtSp 누적·초과 나머지 폐기 및 variable/high-FPS 전체 clock 동등성은 별도. 화면 흔들림·slowMo 미이식 |
| 히트스톱 정정 | source32585–32586에서 G.hitStop 소비 직전0으로 강제 비활성화. 기존 문서의 ‘히트스톱 scheduler 미이식’ 표현을 구현 요구로 읽지 않는다. 임의 freeze 추가 없음 |
| probe | 실제 AudioListener.GetOutputData1024의 peak. 짧은 출력 history 검사이며 연속 WAV/OS loopback/물리 스피커 청음·원본 mix 동등성 증거가 아님 |

[Unity AudioListener.GetOutputData](https://docs.unity3d.com/6000.4/Documentation/ScriptReference/AudioListener.GetOutputData.html)에 따라 power-of-two buffer를 쓰고 초기 empty history 이후 실제 프레임에서 조사한다. 실검수는 --unity-smoke의60Hz 입력→same Tick→queue→native renderer/AudioSource 경로다. Godot를 열거나 수정하지 않는다. 사용자가 열어둔 Unity Editor도 종료하지 않고 I: 독립 프로젝트 복사본에서 Editor/build를 실행한다.

| 검증 | 현재 결과 |
|---|---|
| 코어 RED→GREEN | API 없는 상태의 의미 RED→26/26; 기존93/93·7/7·36/36 유지. 원본10함수 실행·현재 G: 원문10/10 동일 |
| 통합 RED | 기존 실제 Player 영수증에 새 gate 적용:6검사중4실패(피드백/오디오 출력/명중 캡처 없음). I:/EXODUSER-Storage/qa/unity-port-20261024/feedback-player-red.json |
| 정적 컴파일 | 초기 AudioImporter.preloadAudioData 제거 API 오류1개→settings.preloadAudioData로 수정, 설치 Unity assemblies 대상0오류/0경고 |
| 실제 Editor | `feedback-verify-2026-10-24T07-49-44-984Z/receipt.json`:6000.4.8f1/process0/PASS. 원음5개와1254시트·shader import 및 실제 SpriteRenderer frame sequence(동일tick2회 렌더 포함) 통과 |
| 실제 Windows build | `feedback-build-2026-10-24T07-50-23-682Z/EXODUSER-Unity.exe`,Succeeded/errors0/869342703bytes/process0 |
| 실제 Player | `feedback-player-2026-10-24T07-51-06-243Z/player-smoke.json`: X4020→4101.58496,120f charge/release,4kills,totalDamage48509,청크10. 실제 native process43432/HWND266366 창 확인 |
| 실제 오디오 | requested8/played8/dropped0,loaded5keys,voicesPeak4,listenerPeak0.30688885. 실제 엔진 전체 출력 신호 확인이며 음원별 wave/물리청음/전체 믹스 동등성은 미검증 |
| 실제 VFX | hit4/charge1/drawnFrames163,peakInk3/peakAdditive4. impact/charge/release PNG3종 픽셀 검토: 적 위치 원본 명중광과 플레이어 중심 완충광·3타 검기를 확인. 전체 시각 동등성은 RETOUCH |
| 통합 GREEN | `feedback-player-green.json`:6/6. runtime exception/shader error 없음. D3D12 debug info queue 조회 failed 경고1건은 남아 있으므로 완전 무경고/성능 PASS 아님 |
| 최소 Git 복원 | `fresh-feedback-2026-10-24T07-51-21-063Z/RECEIPT.json`: HEAD의 tracked19파일만 새I폴더에 복원→SDK8 build0오류/0경고 및26/26. SDK workload 확인 안내는 있으나 build/test 성공. 전체 게임 clone 검증과 구분 |
| 독립 검토 | source spec: additive1tick P2 발견→additive만age+1/ink유지로 보정→재검토PASS. 코드품질 현재 범위 미해결P1/P2없음. 실제 검사 결과는 위 별도 근거 |

위 상대 영수증 경로의 기준은 `I:/EXODUSER-Storage/qa/unity-port-20261024/`다. actual build input은 `feedback-project-2026-10-24T07-48-57-399Z/SOURCE-COPY.json`의334파일/183916879bytes를 source-before/after/destination SHA256으로 확인한 독립 복사본이다(중복 source receipt 항목 합계와 고유 파일 합계는 다름). 사용자 Editor PID34780을 유지했다. 코드 checkpoint와 원격 expected-SHA fast-forward 및 동일 tree 대조 뒤 build를 실행했다. 최종 로컬/원격 SHA·아티팩트 전체 hash는 외부 `UNITY-FEEDBACK-01_DONE.json`에 기록한다. 사용자 runtime 검사창은 새 시작 메뉴로 돌아온 상태로 유지한다.

시각 판정은 기존 **RETOUCH** 유지. HUD fill/아이콘·원본1x·카메라/자연 플레이·전체 기능은 남아 있다. 문서·검수·백업은 I: Junction 또는 I: QA 폴더, 실제 런타임은 E:에 둔다.

2026-10-31 후속: 실제3D 기검3타 영상의 중심이 위로 뜨는 결함은 캐릭터용 billboard 반높이 보정이 원인이었다. KiSlashView의 검기·충전·단계 renderer를 중심형으로 분류하고 생성/파괴 수명에 맞춰 registry를 관리한다. 크기·프레임·색·알파·Core 수치는 그대로다. 오프라인8/8·기존 강타 회귀14/14이며 새 Player 검수는 [게임 동작 대조](UNITY_GAMEPLAY_PARITY_20261031.md)의 최신 절을 따른다. 이전 빌드의 수치 통과를 새 표시 검수로 재사용하지 않는다.

중심 수정 빌드53ac26ee의 실제3타는 지형 깊이에 아래쪽이 잘려 시각FAIL이다. 후속은 기검 전용Material 두 개만3D에서_ZTest=Always(8),2D에서는 기본LessEqual(4)로 표시한다. 공유Shader의 기본값4와 별도 명중 효과는 유지한다. 이 새 후보의 Shader 빌드·실제 전체 검기·M1은 미검증이며 전달하지 않았다.


## 2026-10-31 04:18 시작 스킬 실제 대조

새 3D 빌드 1c4b8e34(f4238e241 입력)는 오류0, 같은 실행본 hidden M1 8ce69de8의23단계·이동540틱·기검1040틱·구르기80틱·스킬창6장·시작14입력1350틱 검사를 통과했다. 실제1600×900의 Combo210-210에서 기검 하단 수평 잘림이 사라지고 중심 오차0을 확인했다. 다만 실제 웹1350틱의 추가 대조에서 자원·상태·위치260틱 차이, 쿨다운까지 포함하면303틱 차이가 발견되어 이 빌드는 공통/바탕화면에 채택하지 않았다. 해당 화면은 새 Core 수정의 실행 증거로 재사용하지 않는다.

| 항목 | 현재 원문과 수정 내용 | 근거와 한계 |
|---|---|---|
| Shift 3단 자동 발사 | 홀드12틱 도달 시 키업 전에 발사. 키업 발사는 이벤트 단계, 자동 발사는 홀드 증가 뒤, 비행63px/틱·끌림16틱·거리700px은 기존 원문 수치 유지 | 14틱 홀드 사례의 첫 발사11번 틱·최대131.25px 시간차 해소. 벽 도우미·장기 홀드 착지 재발사·파생 이동기는 이 사례로 검증하지 않음 |
| 스킬 키 이벤트 | DispatchSkillKeys를 일반 자원 재생·StateTicks 감소 앞에 실행. Roll 우선순위·Space 중복 시전 차단은 유지 | 지옥강타 첫 상태 타이머10→9, iceOrb 진입 첫 틱의 비idle 재생 배율 일치 |
| 얼음보주 종료 | idle 복귀 때 기존 StateTicks 보존. 마법 자세→기존 투사체 이동→쿨다운→얼음보주 자동 파쇄→장판 순서 | 119번 틱에 파편8발을 원점 반경47px에 생성, 첫 이동은 다음 틱. 임의 타이머0 초기화·생성 틱8.5px 선행 이동 제거 |
| 회복의 영역 | 자원 재생 앞에서 첫 겹침 영역의 평탄 회복(10+Lv×2)/60을 적용한 뒤 기본 HP/MP/ST 재생을2배. 장판 후반 중복 회복 제거 | Lv1·idle·MP330에서 첫 틱330.2125, 80틱 뒤347.0(웹 double 기준). 다중 영역은 첫 영역만 적용하는 원문 계약 |
| Q 보호막 쿨다운 | sBlock 동안 SbCd 감소 정지, 해제 다음 틱부터 감소 | 기본30틱. 기존 실제 hold14 사례에서43틱 쿨다운 차이 해소. 보호 설계 문서2_3은 변경하지 않음 |
| 비교 난수 | SkillRandom01은 검수에서만 .5를 공급하며 기본null일 때 기존 독립 LCG를 그대로 사용 | 실제 웹 Math.random=.5 통제와 얼음 파편 좌표를 대조하기 위한 주입점. 정상 게임 난수 고정 아님 |

현재 제품 소스의 설치 Unity Core/Runtime 독립 컴파일 오류0(기존 경고2/15), 실제 원문1350틱의 위치·자원·상태/타이머·쿨다운·악의·무적·게이지·보주·파편 좌표 모두 차이0이다. 기존 이동540·기검1040·구르기80·E14경계도 차이0. 도구는 unity/Tools/gameplay-parity/StartingSkillsTrace.cs, 실행은 GameplayParity.dll --starting-skills-trace <web-all-skills.json> <inventory_seed.json> <출력.json>. NativeGame.PlaytestCapture에는 네 쿨다운·Q 쿨다운·악의·보주 상태/타이머를 추가해 새 Player에서도 같은 값을 확인한다.

증거: I:/EXODUSER-Storage/demo-art/gameplay-parity/starting-skill-red01/결과.json, starting-skill-red02-strict/결과.json, starting-skill-candidate05-source-phases/결과.json, starting-skill-product-gates/영수증.json, starting-skill-independent-compile/영수증.json. 변경 전7파일은 starting-skill-source-before/목록.json에 byte 보존했다. **이 새 Core의 정식 빌드·동일 M1·실제 Player·영상/1배율·공통/바탕화면 전달은 아직 미완료**다. 전체55개 중 기존 실행 소유8개의 이번 입력 범위만 다뤘으며 전체 스킬·자연 전투·후반 진행 완료가 아니다.


### 2026-10-31 04:22 제품 회귀 재확인

현재 제품 소스로 시작 스킬1350·이동540·기검1040·구르기80·E14경계가 모두 불일치0이다. 보호막 쿨다운이 경직/기절 동안 멈추던 추가 결함은 현재 원문33211과 생존4자세×5쿨다운20조건으로8실패를 재현한 뒤, 입력 차단과 독립적으로 쿨다운을 감소시켜20/0으로 수정했다. sBlock 유지 중에는 감소하지 않는다. 도구 옵션은 --shield-cooldown-trace <Q쿨다운-생존자세-원문.json> <출력.json>이며, RED는 I:/EXODUSER-Storage/demo-art/gameplay-parity/Q쿨다운-생존자세-RED.json에 보존했다.

현재 Core로 새로 추출·컴파일한 저장2604·돌진패링187165·스킬13216도 모두0, 최초 연습88·기존 스킬 실행107도 통과했다. 새 oracle은 starting-source-oracle/suite-save-oracle.json, 제품 회귀는 starting-skill-product-gates/영수증.json 및 starting-skill-integrations/영수증.json에 있다. 현재 전체는 여전히 진행 중이며 새 정식 빌드·같은 M1/Player·영상·공통/바탕화면은 미완료다.


## 2026-10-31 04:44 게임 동작 대조 — 전투·장판 후속 진행

상태: **제품 소스 수정·오프라인 회귀 완료, 새 정식 Player/영상/공통/바탕화면은 아직 미검증**. 최신 시작 스킬 빌드 d7c2d1f8은 M1 23/23, 실제 웹 대조 시작1,350·이동540·기검1,040·구르기80틱 모두 차이0이다. 비교 영상3개(9초·17.4초·22.5초)를 전체 디코드했다. 그러나 거대 강타 하단의 지형 수평 잘림·신성 돔의 수직 부유를 발견해 최종 채택을 보류했다. 이 이전 실행본의 수치 통과를 아래 새 소스의 실제 검증으로 재사용하지 않는다.

| 항목 | 웹 원문/현재 소스 계약 | 검수·제약 |
|---|---|---|
| 석궁 발사 기준 | 일반 실행 ResetRun에서 유령 석궁을 활성화, 펫 위치로 표적 탐색/발사. t+=1, 목표 X=P.x+cos(t×.02+π)×44, Y=P.y−28+sin(t×.03+1.5)×8. 거리>3이면 min(18,거리×.12) 이동, >520이면 P−(30,28)로 복귀 | EnableCrossbowPet를 호출하지 않는 순수 Core 소비자는 기존 플레이어 원점 경로 유지. 실제 펫 출발 위상을 기록한 웹900틱과 제품 Core 차이0 |
| 자동발사 설정 | T 토글은 OPT.xbowAuto와 설정 저장 예약에 반영. 설정 변경/재시작도 같은 값 적용, 값이 바뀔 때만 발사 타이머/표적 초기화 | 실제 UI 클릭·재기동 검수 전 |
| 속성 없는 적탄 | ProjSpec→BossProjectile에 ElementAbsent 전달, 없는 el을 물리속성0 빨간콩으로 임의 변환하지 않음 | etype0 원문 일반탄의 피해 반감 오류 수정. 원문상 플레이어 피해 분류 Magic은 유지 |
| 일반탄 넉백 | 실제 속도 벡터 정규화×2px. 속도0이면 탄→플레이어 방향, 그마저0이면 (0,2). 기존 접촉 피격은 피해 비례1..12px 그대로 | 기본 IBossHost 계약은 유지하고 실제 Simulation 어댑터만 명시적 넉백 전달 |
| 에너지 방어 | 무기/활/유골함을 제외한14슬롯 eDef 합 + eDefFlat + trunc((레벨보너스+bGrit+gritFlatN+gritFlatR)×.5) | 허용 장비·강화0·결정없음·능력치 투자0의 원문1,344례/차이0. 인벤토리 실제 현행 원문892검사/차이0 |
| 미정의 적 필드 | boss·_groggy·groggyT는 최초 null(undefined). _groggy/groggyT만 첫 파동 피격 때 생성하며 ib 보스를 boss로 치환하지 않음 | 엄격 적 Tick 원문3,282,906검사: 기존21,696실패→0. oracle 비교 조건을 완화하지 않음 |
| 중심형 스킬 표시 | 강타·얼음보주·파편은 중심 pivot, 캐릭터 발끝 보정 제외. 전용 재질의 3D 깊이 비교8, 2D기본4. 기존 강타 전후검수 registry는 분리 보존 | 실제 d7c2d1f8 시각 RED를 I:starting-visual-red에 보존. 새 Player에서 중심/깊이/지면 진단과 직접1x 검수 예정 |
| 지면 장판 | holyDome/spikeTrap은 3D XZ 지면에 +.025u, billboard 대상 제외. 돔 링72점은 각 지형 높이에 +.03u. 2D XY 경로 유지 | 범위·지속·피해·재생·색/알파/크기는 유지. 새 실제 시각 검수 전 |

근거 폴더: `I:/EXODUSER-Storage/demo-art/gameplay-parity/`의 `starting-final/`, `combat-source-before/`, `combat-product-gates/`, `combat-product-independent-compile/`, `combat-source-oracle/`, `enemy-optional-red/`, `전투-장판-문서전체검색.log`. A2 기존 작업자가 단일PC GPU를 사용하는 동안 본 담당은 오프라인 코드·원문 회귀만 진행한다. 원본55개 중 현재 실행 소유8개 이외의 스킬, 성장 UI, 사슬 경계, 자연 전투·진행·저장 전체 검수는 계속 미완료이며 이 묶음으로 전수 완료/전체 아트 PASS를 선언하지 않는다.


### 2026-10-31 04:53 파쇄 수명·설정 복원 검수 보강

실제 웹 Ctrl120/144 PNG는 보주 비활성 후에도 별도 `ice_orb` 파쇄 시트를 표시한다. Unity d7c2d1f8은 파편만 표시하여 해당 연출이 누락됐다. 원문47117–47124/54891에 맞춰 `IceShattered` 출력 이벤트와 전용 표시를 연결한다. 직경=(플레이어반경+32)×(1+(Lv−1)×.1)×6.6px, 셀0→8·셀당13물리틱·총117틱, 이웃 셀 보간, 알파=1−floor(경과틱/13)/9×.3이며 Core 중심을 유지한다. 파쇄 시 IceOrbT=0으로 원문과 일치시킨다. 전용 표시의 구독·Reset·Dispose를 정리하며 일반 입력·쿨다운·피해·자원은 바꾸지 않는다.

Player 검수에 `-playtest-ticks 1..600` 명시적 길이 인자와 현재 파쇄 셀을 추가해 Ctrl260틱에서 시전→자동 파쇄→117틱 후 소멸까지 대조한다. 기존1350틱/영상은 이전 입력 증거로 보존한다. Settings QA의 기존 별도 제품·식별자 및 격리 출력 경로를 그대로 사용하며 write/read 별도 프로세스에서 설정ON→T OFF→디스크저장→재시작OFF를 확인하도록 보강했다. 일반 실행 저장 경로/격리 규칙은 바꾸지 않는다. 기존 HUD 검수는 무창 Player에서도 `--quit-after-hud-smoke`를 명시하면 종료한다. 코드후 전체docs 검색 근거는 `파쇄-설정-문서전체검색.log`, 새 독립 컴파일은 `ice-settings-independent-compile/`이다. 현재 새 실제 Player/영상·공통/바탕화면은 아직 미완료다.
