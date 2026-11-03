## 12:20 같은 패키지 자연12 실제 완주

- 소스b8214e50957100f82fe80da9df4569b87060b054, 정식14 cdb7c8a4(6000.6.7f1/x64/오류0), 같은M1 8ab9ebcb23/23/USER_SAVE0, 자연12 0824c38e가 실제 GPU에서 드루이드 최종 처치·출구 개방·클리어·난이도 모달 취소/재개방/확인·저장·로비 복귀를 끝냈다. 실제 벽시계1125.949초(18분46초), 클리어 월드1119.513초, 정상 사망/재도전각7회. Core 클리어 화면의 전투 시간은11:56으로 벽시계와 구분한다. 무사망/고정정책 완주라고 적지 않는다.
- 공식 실행기 ok=true/exit0/USER_SAVE0/창0/잔여0/숨김 데스크톱 정상 닫힘. 자기 격리 캐릭터F502266 저장과3840 로비를 직접 확인했다. 원격 Desktop 반영 전이며 source와 이후 문서 커밋SHA를 구분한다. 이전 자연8 실제 완주도 남기되 USER_SAVE6 전체실행기 실패는 재분류하지 않는다.
- 기본 공격 방식에서 정상 재도전7회 후, 기존 가상 입력 옵션 parryOnly를37740틱에1회 전환했다. 일반 공격/마법 버튼을 쉬고 Q/E·정상 자원 스킬·이동은 유지했다. 결정 시점37567틱/HP2142/2142/poison3.560·당시 사망7회 기록과 수락 시점은control-decisions/policy-history에 있다. 처음 관측6회와 실제 변경 시점7회를 구분한다. HP·좌표·보스/전투 규칙/드랍 수정0.
- QA17 초반2508틱 회귀는 필드4/4·굴0/낚시꾼0·327처치Lv11·사망0으로 재확인됐다. QA22 정상 재도전7회, QA24 초기로비/전환은 같은M1과 자연12에서 확인됐다. QA23 수정 후 아레나 강타 쿨다운 양수 샘플33개, 긴프레임 기록의 실제gSlam상태11개가 관측됐다. 기본 공격 방식의 생존 한계는 남기며 패링 우선 시작의 재현성을 별도로 확인할 수 있다.
- 실제1920 출구/클리어·2560 난이도·3840 로비 원본 직접 검수. UI03 아레나 타일/UI04 필드목표의 아레나 숨김, UI01 모달 배경 차단·취소 재무장·정상 복귀, UI02 출구 안내 가림 제거를 확인했다. 표시 처치345/171과Simulation.Kills332는 기존 Core StageKills/SurvivorKills 집계로 구분하며 수치를 임의 수정하지 않는다.
- raw 평균78.51FPS/P95 16.94ms/P99 94.01ms/최장8221.75ms. 500ms초과95개(캡처표기36/빈표기59), 최대빈표기8221.75ms. 캡처·해상도 전환·QA 탐색·동시 공용 작업 포함으로 성능 원인/안정60FPS/실제 인간 플레이 소요시간은 미확정이다. 품질7(Core상자·강화/맵/영웅/카메라/보스가림/아레나)과 성능조사1, 청취 미검증을 유지한다. 기술 진행 성공이 전체 제품PASS는 아니다.

근거: natural-12/{verification-summary.json,visual-review-complete.json,input-performance-observation.json,control-decisions.jsonl,policy-history.jsonl}, 공식_exec/done/0824c38e.json.

## 11:47 QA24 무창 M1 로비 전환 수정

- 재부팅 후755 소스의 정식13(0e3e3f08)은156.408초/컴파일 오류0/빌드오류0/예외0/USER_SAVE0으로 완료됐다. 같은 패키지 M1(1f6d7adf)은203.361초, 게임23항목 통과 및 추가 초기 로비 경계1건 실패로 exit2/USER_SAVE0/창0/잔여0이었다. 자연12는 아직 실행하지 않았다. 실패 원본은 그대로 보존한다.
- QA24: 무창 환경에서는 NativeLobby의 재생 포커스가 꺼질 수 있다. M1WaitFrontend는 포커스를 유지하지 않았으며 실제 TransitionMediaReady는 Prepared와 첫 Frame>=0을 요구한다. 준비된 디코더라도 재생 권한이 없으면 첫 프레임이 없고12초 복구 실패가 된다. FullRunWaitFrontend와 같은 방식으로 M1 전환 대기 중 SetPlaybackFocus(true)를 호출한다. 전환 제한시간·실제 영상 오류·실패 판정을 숨기거나 완화하지 않는다.
- 실제 M1 대기/로비 포커스/영상 준비·재생 메서드를 추출하고 실제 Core ScreenTransitionFlow 시계를 사용한 회귀 RED3/5→GREEN5/5. 최초 무포커스, 대기 중 포커스 유실, 정상 디코더 시작을 확인하며 실제 영상 오류와25초 경계 지연은 계속 실패한다. Unity GPU 결과는 새 정식14/M1/자연12에서 확인한다. Core·제품 로비/영상 코드 수정0.
- 매뉴얼v4를 최신 origin/main에서 재확인했다. 현재 공용unity/main은c741로 이미 조상이다. 기존 소스755의 당일 정상 커밋·push 및 재부팅 뒤 원격 일치를 확인했다. 이전 자연11/정식13 대기 세션은 비정상 종료로 무효이며 정식13은 이번 재개 빌드 영수증으로만 판정한다. 사용자 신고11:51과 로컬 이벤트41의10:51:09를 구분하며 종료 원인은 미확정이다.

근거: formal-13-build.json, 공식codex-unity-uisound/done/0e3e3f08.json, formal-13-m1/failure-summary.json, m1-focus-{red,green}/focus-check.json.

## 10:43 QA23 보스전 입력 우선순위 수정

- 자연10(1c2f414b, 소스836fcf6247)은 1012.405초, 337처치/Lv12, 필드4/4, 사망9·정상 재도전8 뒤 player-death/exit2였다. 창0·잔여0·USER_SAVE0. 초반2508틱 회귀는 재발하지 않았고 QA22의 검정 전환 후 재도전은 실제8회 통과했다. 전체 완주 성공으로 세지 않는다.
- QA23 원인 확정: FullRunControlInputs.Apply의 보스 선회가 앞서 선택된 회피·정지와 Q/E 탄환 조준을 무조건 덮었다. 정지+Space(강타)가 WASD+Space(구르기)로 바뀌며 실제 Core SetRollInput→SetSkillInput→Tick에서 강타가 발동하지 않았다. 얼음보주 정지·회피 방향·마법/물리 패링 조준도 같은 우선순위 충돌이다. 이것이 모든 사망의 단일 원인이라는 주장은 하지 않는다.
- 새 회귀6건의 RED6/69→수정 후보 GREEN69/69→실제 채택 소스 GREEN69/69. 기존 경로54+정책9와 신규6으로 총69건이며 중복 합산하지 않는다. 보조 스킬/방어/회피의 기존 이동·조준을 선회보다 우선한다. Core/제품 전투 수치·실제 자원·좌표 수동 수정0.
- 자연11은 정식formal12의 불변 패키지(836)를 그대로 사용하는 비교 실행으로 공용 Player FIFO 대기/진행한다. 새 소스 수정이 이전 실행에 들어갔다고 주장하지 않는다. 수정본은 별도formal13→동일M1→자연12의 실제 GPU 완주가 필요하다. 현재 unity/main 반영 전이다.

근거: natural-10/fullrun.json, 공식_exec/done/1c2f414b.json, policy-priority-final-red/policy-result.json, policy-priority-adopted-green/policy-result.json.

# 10시 실제 재도전 결함 수정

- 이전후보57155521db의 formal11 aa91fdfe는컴파일/빌드오류0,같은M1 fdebf58223/23·USER_SAVE0. 실제자연9 9643bb2c는343처치/Lv12·필드4/4·굴0/낚시꾼0·드루이드전투뒤최종사망1회에서death-retry-blocked로791.535초실패. exit2/window0/leftover0/USER_SAVE0. 이전자연8의실제완주1회는그대로보존하지만이번후보성공으로쓰지않는다.
- QA22 원인확정: 공용NativeGame.RetryFromDeath는death-retry 검정전환콜백에서정상RetryInsideArena를실행한다. QA는호출1프레임뒤PlayerDown/아레나를읽어실패했다. 실제NativeRetry/실제Busy&&!Executing 가드·실제QA 재도전문장을추출한지연프레임검사에서RED1/18→GREEN18/18. QA가전환완료를기다린뒤재도전을판정하고자동게임틱소유플래그Running을다시내린다. 제품전환/사망/보상/HP수치변경0,Core수동변경0.
- QA19 새캐릭터생성/입장6비동기경계,QA21 실제실패exit2,UI04 실제필드목표·게이트해제/아레나숨김은이번Player에서확인했다. QA20/새QA22의실제클리어·재도전완료는formal12→M1→natural10에서확인한다.
- 기존route/policy 회귀실행기는활성csproj/obj/temp를기본I:출력에만들수있었다. 현재작업본NTFS Library의고유case를사용하고완료텍스트/소스영수증만I:로내보내도록수정했다. 절대PowerShell -NoProfile -Command 하위호출·기존증거보존·기본ProjectRoot 검증. 채택한실제Tools에서route54+정책9=63/63,오류0(기존경고8)확인. 실행중게임소스와섞지않고자연9종료후적용했다.

근거: frontend-death-retry-{red,green}/frontend-check.json,ntfs-runners-adopted-green/{policy-result.json,route-runner-scope.json,policy-runner-scope.json},natural-9/fullrun.json,공식_exec/done/9643bb2c.json.

# 09시 공용 병합 후 다음 후보

공용c741을 정상 merge한 1ab3c75f8134d13abd828b7e8c5035e7950b9cd3 위에 QA19~21의 비동기 경계/종료 의도 및 UI04 필드 목표 표시를 적용했다. 현재 작업본 실제 소스로 PowerShell 전환15/15·미니맵18/18 통과. 활성 테스트 캐시는 G: Library, 완료 영수증은I: frontend-after-common/objectives-after-common에 보관했다. Core 수동 변경0. 원본 메타/재질 등 WIP는 I:/EXODUSER-Storage/codex-takeover/unity-11-fullrun/source-adoption-2026-11-03T00-37-11-182Z에 패치/목록을 보존했고 커밋 대상에서 제외한다.

이 새 후보의 실제 Unity 빌드·Player·자연 주행·저장 보호 검수는 다음 formal11/M1/natural9 대상이다. 아래 자연8 실제 완주 증거는 이전735 소스에 한정한다. 사용자 세이브 변경6을 지운 PASS로 고치지 않는다.

main 전용 UX 원장은 현재Unity 줄기에 없어 원격main의 정확한 원문을 읽고 추가할1-1 갱신을 I: ux-ledger-handoff.md로 전달한다. 전체165행의같음/전체게임완성을 주장하지 않는다.

# 09:34 현재 실제 검증 결과


## 2026-11-03 09:34 자연8 실제 완주

- 고정735의 정식formal10/M1/자연8 같은 패키지다. buildGuid a278a7093fca475d8c7e399d65ff1599, actual GPU Radeon RX9070XT. 강제 처치·좌표/HP/자원 변경0. 정상 사망 화면 재도전3회 포함이다. 입력 정책은 시작 때부터 거리600/선회/얼음 점멸로1회 수락됐고 도중 정책 변경0이다. 정상 부활력으로 반복 부활하는 보스를 최종 처치했으며 이를 제품의 임의 회복 버그로 적지 않는다.
- worldClearSeconds 847.898초, 전체 854.310초. clearModalBlockedBackground/clearCancelRearmed/clearReturnedLobby/clearSaveExists 모두true. UI 콜백/가상 Escape 검증이며 OS 버튼 클릭으로 확대하지 않는다. 초반 회귀 QA17, 출구 정렬 QA18, 모달UI01, 고정 +4 토스트UI02의 실제 동작을 확인했다. 미니맵UI03도 필드가 아닌 아레나 타일로 전환됐으나 색/범례 등 전체 시각 PASS는 아니다.
- 실행기 a9997b87는 exit0/타임아웃false/사용자 데스크톱 창0/잔여0/숨김 데스크톱 정상 닫힘이지만 USER_SAVE changed=6으로ok=false다. QA의 실제 새 캐릭터F214121 및 전투 저장은 sandbox/a9997b87에 있으며 변경된 사용자 캐릭터 save-534444와 다르다. 같은 기간 별도 게임 창pid59948도 관측됐지만 파일 쓰기 추적이 없으므로 귀속을 확정하거나 전체 실행기를PASS로 바꾸지 않는다. 사용자 세이브 복구/삭제/수정0. 다음 같은 후보 검수에서 보호 게이트를 다시 확인한다.
- 실제1920 clear/exit-open,2560 난이도,3840 로비 원본을 직접 확인했다. 상자 미이식·낮은 전사 윤곽·전경 가림·먼 보스 카메라·보스/VFX 가림·갈색 아레나는 남은 품질 결함이다. 새 화면 전환 적응/필드 미니맵 목표 패치를 준비한 정상 소스 커밋→정식빌드→M1→자연 주행으로 계속한다.
- raw 평균83.53FPS/P95 14.41ms/P99 33.42ms/최장17878.77ms. 캡처·해상도 전환·동시 공용 작업 포함이며 긴 프레임 원인 미확정, 성능 PASS 아님.

근거: natural-8/{fullrun.json,verification-summary.json,telemetry.jsonl,policy-history.jsonl,capture-sizes.jsonl,long-frames.jsonl,caps/}, 공식 _exec/done/a9997b87.json.

아래06~08시 대기 기록보다 이 갱신이 우선한다.

# 1-1 실주행 및 수정 대기 기록

2026-11-03 06:42 KST 작성, 06:54 KST 작업본 문서로 보존. I: 응답 지연 중의 G: 보조 기록이다. 공용 보고서를 대체한 최신 실물 검증으로 해석하지 않는다. I: 복구 후 기존 REPORT.md/DEFECTS.md에 정확한 실행 결과와 함께 반영한다.

- 후보 소스: `735397a7e00556bb14c8e3161fda4abe2fc7f712`. 후속 공식 실행이 이 SHA를 요구하므로 소스를 고정했다.
- 마지막 정식 검증: 소스 `3a56b3ece`, formal-9 빌드 `59fcc1f8` 오류0, 같은 패키지 M1 `12188527` 23/23. 최신 후보의 정식 빌드가 아니다.
- 실제 자연7: 필드 4지역·낚시꾼0, 295처치/Lv11로 보스에 도달했다. 첫 사망 및 정상 콜백 재도전1을 확인했다. 마지막 읽힌 상태는 게임시간432.999초, HP2179, 보스HP105634. 이후 결과는 I: 지연으로 미수신이다. **실제 자연 클리어 0회 확인**.
- 후속 공식 실행 요청: 절대 경로 PowerShell `-NoProfile -Command`로 공용 실행기 예약→formal-10→같은 패키지 M1→natural-8을 요청해 대기한다. 예약 접수·순번 진입은 아직 응답으로 확인하지 못했다. 중복 실행하지 않는다.
- 현재 후보의 코드 사전 검증: 저장소 회귀 정의 63/63(Node/.NET 호스트), 실제 Unity Bee 참조 Core117/Runtime234 정적 컴파일 오류0. CPU 근사모델은367처치/Lv13, 보스 처치·출구 타일 진입·StageCleared까지25062틱(417.7sim초) 진행했다. **Unity Player·화면·저장·UI 완주 증거가 아니다.**

| ID | 근거 및 문제 | 조치 | 남은 검증 |
|---|---|---|---|
| QA-17 | 실제 자연5/6이 모두35처치/Lv3·2508틱에 사망. 초반 소환자 우선·근접 선회가 후퇴를 방해 | Lv6 이후 소환자 우선, 낚시꾼 거리 유지, 근접 시 후퇴 보존 | 자연7에서 필드4/4·보스 도달 확인. 보스 완주 미확인 |
| QA-18 | CPU 실제 Core 출구 fixture에서8px 입력 사각으로 폭40 통로 중앙 정렬 실패 | 열린 아레나 출구 접근만1px 정렬. 필드는 기존8px 유지 | 실제 Player 출구 진입 미확인 |
| QA-QROLL | 실제 조작 helper에서 행동 중 Q press 소모 및 연속 Space edge 부족 재현 | Q 수락 가능 상태 한정, 구르기 가능 여부·짝수 틱으로 press/release 보장 | 회귀8/8. 실제 후보 Player 전 |
| UI-01 | 다음 난이도 모달보다 배경 hotkey가 먼저 처리됨 | 모달 활성 중 배경 핸들러 앞에서 반환 | 회귀3/3. 실제 자연 클리어 모달 취소·재개방·확정 전 |
| UI-02 | 고정 +4 처치 토스트가 실제 보상과 다르고 출구 안내를 덮을 수 있음 | 임의 고정 토스트 제거. 실제 보상 규칙 변경0 | 실제 보스 처치 후 안내 전 |
| UI-03 | 자연7 보스 입장1920 원본에서 미니맵이 필드를 계속 표시 | Stage.Arena 읽기 전용 타일 선택 및 전환 시 캐시 무효화 | 회귀 통과. 수정 후 실제 GPU 전 |
| CAM-01 | 자연4 보스 입장 때 영웅이 과도하게 작아짐 | 전체 몸체 fit 상한1.35배·영웅 안전영역 적용 | 자연7 영웅 크기 개선 확인. 먼 보스 화면 밖 tradeoff 남음. 전체 PASS 아님 |
| CORE-01 | 웹 보스 처치 상자와 달리 Native 이벤트 수신/WorldDrops에 생성·열기 없음 | 정적 결함 후보 기록. Core 수정 금지 준수 | 실제 자연 보스 처치 후 대조 전 |
| CORE-02 | 강화 카드 handler 부재, Core 소유물 계약이 enh!=0 거절 | 수치 우회 금지. 미이식 기능 기록 | Core 소유 담당 통합 필요 |
| MAP-01 | 실제 전경 나무가 영웅·적·탄을 가림 | 맵 소유 담당에 근거 전달, 타인 아트 수정0 | 수정된 맵의 같은 패키지 1x 검수 전 |
| ACTOR-01 | 실제 영웅 윤곽이 주변 큰 몬스터보다 흐리고 분홍 덩어리처럼 보임 | Point/비압축/밉맵 설정 확인. 무근거 필터 변경 안 함 | 소스 아트 개선 및 GPU 검수 필요 |
| BOSS-01 | 실제 거대 몸체·밝은 뿌리 효과가 영웅을 가림 | 모델/물리 크기 계약 임의 변경0. 결함 기록 | 실제 패턴 가독성 개선 필요 |
| ARENA-01 | 실제3D 필드에서 평면 갈색 아레나로 전환 | 현재 의도된 분기 확인. 맵/타 소유 영역 수정0 | 공용 아레나 후보 통합 후 실물 검수 전 |
| PERF-01 | 자연4/5에 긴 프레임. 기존 빈 capture 표기만으로 제품 프리즈라고 판정할 수 없음 | 프레임 로그를 메모리에 수집 후 종료 시 저장. 이전 프레임 capture stamp 포함 | 귀속 회귀11/11. 실제 GPU 원인·개선량 미확정 |
| INFRA-I | 05:27경 이후 I: 읽기/공식 실행 응답 지연. 06:39 소유 Player39100의2초 표본 입출력0, CPU0.015625초, 모든 스레드 대기 | 기존 공식 요청 유지. 새 중복 Player0, 타 프로세스 종료0, 볼륨 수리/설정 변경0 | I: 응답·자연7 최종 영수증·formal10 실행 대기 |

현재 공용 unity/main 반영은 하지 않았다. 사운드는 의무 mute로 청취 검증하지 않았다. 새2560×1080 캡처와 최신 미니맵·입력·출구 수정의 실제 Player 검증은 후속 실행 전이다.

## 공용 c741 통합 전 정적 점검

연결된 GitHub의 읽기 전용 비교에서 공용 `unity/main`은 `c741c11c27a76ae891cad7294adc24f28243314e`로 확인됐다. 현재 후보에 들어 있는 공용 `7e1cd03d0`보다7커밋 앞이며 화면 전환·로비·영상/오디오 및 관련 순수 정책을 포함한다. 이 변경을 현재 대기 중인735 후보에 섞지 않았다. 개인 원격은 여전히 `3a56b3ece`와 동일했고, 로컬735의 push 완료로 보고하지 않는다.

| ID | 통합 후 위험·근거 | 준비 조치 및 검증 경계 |
|---|---|---|
| QA-19 | 새 OpenCharacterCreation은 화면 전환을 요청하고 실제 characterStep=1 변경을 다음 black 콜백까지 미룬다. 기존 FullRunQa는 같은 프레임에 Choose/Confirm/Create를 호출한다. 실제 수신 메서드를 추출한 검사에서 입장 실패 RED1/1 재현 | 콜백 완료 후 다음 API 호출. 전환 우회/AutomatedInput 활성화0. 실제 API+Core roster 및 준비한 대기 helper의 근사 시간/렌더 경계 fixture14/14. 실제 공용 통합·Player 전 |
| QA-20 | StageClearContinue의 ShowLobby가 비동기로 바뀌지만 QA는1프레임 뒤 clearReturnedLobby를 판정한다. 정상 화면 전환 중에도 실패로 기록할 정적 위험 | clear-lobby 경계가 끝난 뒤 판정하는 패치 준비. 실제 자연 클리어 UI 미검증 |
| QA-21 | 공용 영상 정리 helper는 DeferredQuitIntent의 종료 코드를 다시 요청한다. FullRunQa의 직접 Application.Quit(2)는 decoder가 남아 있을 때 intent에 실패를 등록하지 않는다 | NativeLobbyVideo.RequestQuit 경로 사용 준비. 실제 Core 종료 의도의 비0 보존 사전 검사 통과. 실제 decoder 활성 상태 종료 코드 검증 전 |

준비 패치는 `unity/Library/FullRunControlCache/integration-c741/after-main-merge.patch`이며 현재 Assets에 적용하지 않았다. 적용 순서: 기존735 공식 실행의 결과 수신→정식 common fetch/정상 merge 및 소유 경계 확인→이 정확 경로 패치 적용→전체 컴파일/회귀→새 정식 빌드·동일 패키지M1·실제 자연 주행이다. 검정 경계·제품12초 준비 timeout·홀드 시간·Core 수치를 우회하거나 완화하지 않는다. 공용의 기존 GUI.depth=-1000000 유지에는 실제 검정 배경 오염 재현·수정 근거가 있으므로 임의 복원하지 않는다.

추가 격리 점검: `git merge-tree`로735+c741을 검사한 순수 병합 tree는 `ad5ba8ebb0d5a2c7dda3f065d63b6140532039a9`, 충돌0이다. HEAD/index/현재 Assets가 바뀌지 않았음을 전후 확인했다. 이 tree의 C#을 Library 내부로만 추출하고 준비한 QA 패치를 해당 복사본에만 적용한 뒤 실제 Unity Bee 참조로 Core121/Runtime239를 컴파일해 오류0을 확인했다. 기존 난이도 모달 guard와 새 전환 입력 guard가 함께 보존됐다. 같은 격리본에735의 정확한 회귀 정의·맵 입력을 연결한 Node/.NET 검사63/63도 통과했다. 이 결과는 실제 branch merge·정식 Unity 빌드·Player·자연 클리어가 아니다. 영수증은 `integration-c741/{overlay-manifest.json,compile/receipt.json,repo-checks-host.json}`에 보존했다.

재사용할 프런트엔드 검사도 `integration-c741/frontend-tests/{run.cjs,run.ps1}`로 준비했다. GitHub 캐시 대신 지정한 실제 소스 파일과 Core를 직접 읽고, 실제 QA 시작 coroutine의 캐릭터 생성 호출 순서를 추출해 검사한다. 격리 통합본에서15/15 통과(`green2/frontend-check.json`). 이는 앞선14검사에 실제 호출 순서1개를 더한 것으로 중복 합산하지 않는다. 첫 `green/build.log`의 gateEnterDelay fixture 필드 누락 컴파일 실패는 보존했고 제품 결함/기능 RED로 세지 않는다. PowerShell wrapper 자체 실행은 I:/PowerShell 응답 지연 때문에 아직 하지 않았으며 Node/.NET 호스트 결과다. 이 도구 역시 현재 Tools/Assets에 적용하지 않았다.

후속 `green4`는 stub의 LegacyFrontendFixture=false 가정도 제거하고 실제 NativeLobby.StartupPresentation의 판정 메서드를 직접 추출했다. 테스트 프로세스에 실제 `--unity-fullrun-qa`도 전달해15/15 통과했다. 판정은 `--unity-`로 시작하고 `-smoke`로 끝나는 인자만 우회하므로 자연 주행 플래그에는 적용되지 않는다. 런타임/우회 조건을 수정한 것이 아니라 기존 준비 패치가 정상 전환 경로를 검사하는지 확인한 것이다.

## 시간 초과 자기 QA 회수 요청 — 결과 대기

07:14:53 KST의 읽기 전용 guard에서 Player39100의 정확한 formal-9 경로·시작 시각20:18:59.8949466Z·natural-7 출력·fullrun QA/격리저장/무음 인자가 모두 일치했다. 시작 후115.86분으로 원래45분 제한을 넘겼고, 새2초 표본 CPU/읽기/쓰기 변화0을 확인했다. 이후 이 정확한 자기 Player만 회수하는 요청을 실행했으나 요청 프로세스의 응답도 지연 중이다. OS 종료 명령 도달 여부·실제 종료·I: 복구는 아직 확인하지 못했다. 성공한 회수로 세거나 중복 회수 명령을 보내지 않는다. 후속 공식 예약/빌드/M1/자연8 대기는 그대로이며 사용자 앱/타 소유 프로세스 종료0이다. 이 회수의 목적은 만료된 자기 검수의 정리이며 자연7 완주나 제품 사망 판정의 증거가 아니다. guard와 반환 로그는 `owned-player-recovery/`에 보존한다.

## 미니맵 진행 안내 재점검

UI-03 후보의 영웅/적 좌표는 선택한 타일의 TileSize/mapSc와 같은 mapW/mapH로 계산하고 있어 필드 크기를 그대로 사용하는 추가 오류는 찾지 못했다. 다만 UI-04 정적 미이식 항목을 확인했다. 웹 drawMM은 남은 소환굴, 살아 있는 낚시꾼과 속성색, 보스 게이트의 잠금/해제를 표시하지만 현재 NativeFieldHud는 일반 적과 영웅만 표시한다. 실제 일반 플레이어가 남은 진행 목표를 찾는 데 필요한 HUD 정보가 빠져 있다. Core/맵 지형을 바꾸지 않는 읽기 전용 표시 후보를 준비한다. 아직 현재 Runtime 수정이나 GPU 확인으로 세지 않는다.

소스 근거: 현재 Unity checkout game.html SHA256 `189899b47b2efa464cd0d99dc75480b27232e89a94c868c87fa514fd13f86c7e`, 읽기 전용 G:/exoduser/game.html 작업파일 SHA256 `8a2abf3f096a0cfa8f673cae96b1f8aa06ae330deead46fcc0bcd3b2d4b885f4`의 같은 drawMM 계약을 확인했다. 앞선 Core oracle의 고정 웹 CE6A...와 다른 입력이므로 기존 수백만 비교를 이 새 전체 웹 파일의 검증으로 확대하지 않는다. `web-minimap-audit.json`에 경로/SHA/함수 구간을 보존했다. 경계에서 영웅 표식을 통째로 숨기는 `<56` 조건도 웹의 항상 그리기/clip과 다를 수 있어 후속 실물 확인 후보로 남긴다.

UI-04 표시 후보는 `minimap-objectives/after-active-pipeline.patch`로 준비했다. NativeMinimapObjectives는 실제 남은 소환굴 목록·HP가 남은 낚시꾼·Core의 게이트 좌표와 BossUnlocked를 읽는다. 스폰 전4개 표식의 위치/속성은 실제 Core의 첫 스폰 표와 대조한다. 아레나/비활성 연습에서는 필드 목표를 숨기고, 종료된 목표는 다음 표시에서 사라진다. Core 상태를 바꾸지 않는 새 모델의 RED12/18→GREEN18/18 및19개 목표를 읽어도 스폰/위치/HP/게이트가 불변임을 확인했다. HUD 연결 후 공용+QA 격리본의121-source Core ref와 실제 Unity Bee 참조를 사용한 Runtime240 정적 컴파일도 오류0이다(기존 경고는 남음). 게이트 색/잠금 모양·낚시꾼 속성색·소환굴 크기를 연결했지만 실제 GPU/1x 검수 전이다. 지역 클리어 틴트와 경계 영웅 clip까지 완전 동기화했다고 세지 않는다.

영수증: `minimap-objectives/{red-readonly/result.json,green/result.json,portable-green/objective-check.json,compile/receipt.json,receipt.json}`. 준비 helper SHA256 `3ed9fdac00c7162dbcd6c7bcaefa2c520f3a02a30b64a4e393f93e3cdd6774b4`, HUD `912d71586676f10ec4cbfbd147b247f376e05a29993fa10e331b9fccd2420bb2`, 새 helper meta GUID `c62b80c186f640adb8cf406b38b6b6fd`. 소유한 신규 파일과 NativeFieldHud만의 패치이며 현재 Assets에는 적용하지 않았다.

프런트엔드/미니맵 재사용 검사 도구는 활성 `.NET` 프로젝트/obj/temp를 지정한 Unity 작업본의 G: Library 아래 독립 case 디렉터리에 만들고, 완료한 로그·소스 입력·결과만 보관 경로로 복사하도록 정리했다. I:에 활성 빌드 캐시를 두지 않는다. 격리 소스에서 새 오케스트레이션의 frontend `green3`15/15, objective `portable-green`18/18 확인. 기존 통과를 새 기능 수로 중복 합산하지 않는다.

07:56:44 KST 읽기 전용 부가 점검: 소유 Player39100/대기 PS3340/Node13748/회수 helper48248/Node9908과 조회기 모두 프로세스 I/O hint2였다([Microsoft의 기본 normal 값](https://learn.microsoft.com/en-us/windows-hardware/drivers/ddi/wdm/ne-wdm-_io_priority_hint)). 이 표본만으로 스레드/개별 요청/디스크 상태는 알 수 없다. 낮은 프로세스 설정을 이유로 우선순위를 조정하지 않았고 전역 설정 변경0이다. `io-priority/latest.json`에 보존했다. I: 응답 지연의 원인은 여전히 미확정이다.

별도의 Windows ADODB.Stream 읽기로 I: COMMON_RULES 한 파일의 읽기도 확인했으나5초 뒤 pending이었고 최종 응답이 없다. 새 읽기 성공/새 규칙 적용으로 세지 않는다. `storage-read-probe-owner.json`에 그 읽기 전용 프로세스와 성공 시 생성할 자기 G: 사본 경로를 보존했다. 원본/큐 변경0이며 추가 I: 파일 요청을 반복하지 않는다.
