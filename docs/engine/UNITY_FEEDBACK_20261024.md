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
