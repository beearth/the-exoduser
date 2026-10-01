# SOUND 관측기 root 인수 — 생산 미적용

기존 aa3ac0ed의 OBSERVE-PREP 제출을 로컬 회수했다. 첫 제출은 root 재현4개 모두 실패: 상태 getter 예외가 원 arena를 막음, phase 누락을 direct로 추정, phase4 이전 A 한 번을 PASS, episodes 무한 증가. 게임에 설치하지 않았다.

S-11-HOWL-OBSERVER-FIX는 11:51:34.241Z 수신, 11:51:38.480Z 실제 Read, 11:54:39.815Z 수정 답변 제출. 원문은 `tools/team-followup-20261001/SOUND/howl-fix-submission.md`, 실제 사용할 검토 후보는 `howl-observer.cjs`다. 생산 game/easy에 import하거나 오디오를 재생하지 않았다.

root는 추가로 음수 maxEpisodes의 무한 while 가능성을 제거했다. maxEvents/maxEpisodes 기본512·최대4096, 1 이상 안전 정수만 허용하며 잘못된 값은 wrapper 설치 전에 RangeError. 직접진입 분류는 유한 여부만 보는 대신 실제 알려진 phase0으로 좁혔다. getFrame 기본null, 원래 함수 this/인수/반환/예외 보존, bounded event/episode/drop, cleanup·중복설치·다른wrapper 보존 계약이다.

팀 회귀의 bounded 테스트는 arena hook이 없는데 phaseup5를 기대해 실패했다. 구현의 UNKNOWN 규칙이 맞으므로 기대를 UNKNOWN5로 정정하고 이유를 테스트에 적었다. canonical 후보에 대해 제출12개+root6개 **18PASS**. 원본 첫 제출·수정 제출·root canonical을 별도 파일로 보존했다. canonical만 검수 후보이며 과거제출 source는 사용 대상이 아니다.

판정은 관측기 모의검수 완료다. 실제 보스문/재도전/직행/phase-up 호출량·청취·easy·패키지 검수와 생산 HOWL 중복 수정은 미완료다. PASS는 관측된 해당 episode의 호출 분류이며 음질·실제 재생완료를 증명하지 않는다. DOM/전역 도달 가능성은 실제 설치 때 별도 확인한다.
