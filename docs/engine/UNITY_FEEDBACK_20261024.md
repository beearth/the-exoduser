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
| 실제 Editor/build/Player | 진행 중. 이 표와 외부 영수증을 후속 실제 결과로 갱신한다. 모델 PASS를 GPU·오디오 PASS로 읽지 않는다 |

시각 판정은 기존 **RETOUCH** 유지. HUD fill/아이콘·원본1x·카메라/자연 플레이·전체 기능은 남아 있다. 문서·검수·백업은 I: Junction 또는 I: QA 폴더, 실제 런타임은 E:에 둔다.
