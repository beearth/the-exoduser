# S-11-HOWL-RNG-PRESERVING-CANDIDATE

현재 DEDUP 제출·root 회수·복구 백업을 마쳤습니다. 기존 SOUND 세션의 다음 한 건으로, 동일 과제 진행 여부부터 확인하세요. 기존 원 제출/root 후보·증거는 그대로 두고 별도 rng diff/test/답변을 작성하세요. 관측기 반복이 아니라 중복 수정 후보의 남은 실행 의미 차이를 해결합니다.

root의 `dedup-root-review.cjs`/`dedup-root-evidence.json`과 최신 본편/easy의 **playSample 실제 함수 전체 본문** 및 seal 호출을 직접 읽으세요. 기존 root 후보는 명시적 키/피치 난수만 보존하며 playSample 내부 추가 Math.random을 생략하므로 생산 인수 전입니다.

정상 보스문 phase2 seal에서 **최종 큐 삽입만 억제**하는 좁은 미적용 후보를 검토·구현하세요. 기존 호출과 호환되는 명시적 선택 인수/내부 경로 등은 팀이 판단합니다. `_silvertailVoiceKey`, `_gxVolMul` early return, 30ms dedupe, `_sfxLastT` 갱신, priority, 추가 Math.random까지 호출·상태 순서는 원본과 같고 오직 해당 seal enqueue만 달라야 합니다. 이미 외부 key/pitch 난수를 포함한 원 seal 호출 계산도 보존하세요.

직접진입·재도전·phase-up·일반SFX는 반환/queue/RNG/timestamp 동등성을 실제 source 추출로 검증하세요. null/키 변환·미로딩음원·볼륨 early return·우선순위·30ms 직전/동일/직후를 포함하되 원 함수에 없는 상태 검사를 새로 발명하지 마세요. 본편/easy 개별 원식·소스 hash/patch 범위와 양성/부정 회귀를 제출하세요. 전체 게임·청취·FPS 검수로 부르지 않습니다. 새 매개변수의 기존 호출 호환도 검사하세요.

소유: `tools/team-followup-20261001/SOUND/` 및 `docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/SOUND-rng-result.md`, `SOUND-rng-receipt.json`만. 생산 game/easy/공용·타팀 파일 직접편집, 게임·오디오·브라우저·서버·대형빌드·Git·새세션 금지. 기존 수정 되돌리기 금지. 읽기 전용이면 완성 diff·회귀 코드·한계를 답변 코드블록으로 제출해 root가 회수합니다. 한국어로 실제 수신·첫 Read·완료·미실행을 구분하고 직접 알 수 없는 HEAD/시각/실행 결과를 만들지 마세요.
