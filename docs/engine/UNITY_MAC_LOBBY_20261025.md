# Mac 로비·인트로 실제 재생 검수 — 2026-10-25

동일한 ARM64 일반 앱으로 기본 실행 실패 → 단일 스레드 비교 성공 → 기본 실행 재검수 성공을 확인했다. **기본 옵션 재검수도 20/20 PASS**다. 첫 실행의 Metal 표시 대기는 원인이 확정되지 않았으며, 단일 스레드 옵션을 영구 적용하거나 고장 수리 완료로 처리하지 않는다. 런타임·미디어·빌드 설정 변경은 없다.

| 실행 | 관측 결과 |
|---|---|
| 기본 실행 A | PID14769, 101초 동안 첫 진행 영수증/PNG 미생성. main thread sample에서 `GfxDeviceMetal::WaitForLastPresentationAndGetTimestamp → semaphore_wait_trap`. 소유 검수 프로세스만 SIGTERM 종료, 로그·sample 보존 |
| 비교 B | 같은 앱에 `-force-gfx-direct`만 추가. 20/20 PASS, 세계관113.24407075초 자연끝/2718프레임, 최대frame gap0.050478375초, 오디오 버퍼 경고0 |
| 기본 실행 A2 | 추가 렌더링 옵션 없이20/20 PASS. 자연끝113.258526250초/마지막영상113.25초/2718프레임, 최대frame gap0.050515292초, 최대progress stall0.041971250초. speed1, 오디오 버퍼 경고0 |
| 자막·소리·전환 | FDG/여성타이틀/문/세계관/로비5종 decode·실제PNG 확인. 한글자막·원본아트·음성/BGM/최종출력 신호·자연로비전환·replay·5초holdskip 모델경로·프런트 게임진행 차단/명시검수진입 통과 |
| 실제 화면 | 비교 B의1920×1080 세계관 자막 및 로비 화면을 직접 확인. 아래 PNG는 해당 비교 실행의 산출물. 전체 디자인 인수 아님 |
| 미검수 | 일반OS마우스/드래그, 실제키5초홀드, pause/resume·focus 전환,29언어전수·RTL, 주관적 음향청취·클리핑/음량 균형. 기존fixture의 음성 신호PASS를 음질PASS로 확대하지 않음 |
| 색상 경고 | AVFoundation이 FDG/문 일부 미디어의 color primaries 기본값을 사용한다는 경고가 남음. decode 실패와 구분하며 색정확도 인수는 미완료 |
| 최신 원본 | v22b 파일 SHA는실행본/소스동일 `cd9fa7486fd1cf18952605408f5b1bae416a97b2307806476bc329498413199e`. 최신 사용자 승인 여부는 계속 미확인. 영상교체0 |
| 설치·자동화 | Editor6000.6.7f1 설치와기존빌드성공은확정. Mac heartbeat `unity` ACTIVE/10분설정, 현재같은로컬turn활성확인. 실제예약wake증거는미확인; 설치/자동화설정을제품진척으로계산하지않음 |

원본 실패를 버리지 않고 [검수 영수증](UNITY_MAC_LOBBY_VERIFICATION_20261025.json)에 세 실행을 분리했다. 소스 기준 `cd02093f4d7d501dd6106d71a0431c049f1f813f`; 사용 앱은 `/Users/fordeargamers/Documents/Codex/2026-10-24/unity-mac-qa/ui-composition-6000.6.7f1/build-readable/EXODUSER-Unity.app`. 세 실행의 전체 로그는 영수증의 각 directory에 있다.

[세계관 실제 화면](previews/lobby-mac-20261025/world.png) · [로비 실제 화면](previews/lobby-mac-20261025/lobby.png)

비교 인자는 [Unity6000.6 공식 Player 인자](https://docs.unity.com/en-us/engine/6000.6/manual/unity-editor/command-line-arguments/player)의 단일 스레드 렌더링 옵션이다. A2도 성공했으므로 옵션이 근본 원인 해결이라는 인과관계는 확인되지 않았다.

## 다음 한 단위

로비/세계관의 pause/resume·focus 복귀와 표시되는 조작 UI를 원본 경로와 대조하고, 별도 짧은 실제Player 검사로 확인한다. 현재 DrawWorldIntro의 재생 버튼은 paused/error 상태에만 노출되므로 재생 중 일시정지 진입 경로부터 확인한다. 기본 실행이 다시 첫화면에서 멈추면 동일PID의 bounded sample과 실패영수증을 보존하고 무한 재실행하지 않는다. UI검수는 CUA만 사용하며, 기존좌표불일치에 제품보정값을 넣지 않는다. PC·Godot·저장·계정·타인WIP는 보존한다.


후속: 위pause/focus 미검수중제어API범위는별도Player9/9검사로완료했다. OS직접입력은여전히미완료. [후속구현과검수](UNITY_MAC_LOBBY_CONTROLS_20261025.md).
