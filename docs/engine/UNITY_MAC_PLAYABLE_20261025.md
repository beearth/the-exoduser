# Mac 현재 조작 가능한 누적 실행본 — 2026-10-25

정상 실행 경로: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/build-inventory-keys-focus/EXODUSER-Unity.app`.

source `219c9d3fed61d4f21bf1faf5a000efe4729de36f`, ARM64/오류0. 해당 source는 캐릭터/스토리 `b45d7af0f42f9f1ce3d0516bd4a414b09b9cb856`의 후손임을 git merge-base로 확인했다. 빌드 입력 QA 프로젝트는 매 단위 변경 Assets를 동일 SHA256으로 이송했다. 따라서 pause만 담긴 데모가 아니라 캐릭터 생성/5슬롯/삭제/재실행 복원·전사 이야기·같은 이름 입장·하단HUD·소지품·스킬·설정을 포함한 누적본이다.

이전 CUA 정상 실행 PID35707에서 시작→지옥문→시네마틱→한국어 로비를 열었다. 일반 저장 캐릭터0/5, 새 캐릭터 N과 이름 없이 미리보기 버튼을 실제 화면에서 확인했다. 새 캐릭터나 테스트 세이브를 일반 저장에 쓰지 않았다. 현재 로비 스크린샷은 대화 CUA 이미지이며 로컬 파일로 저장했다고 주장하지 않는다. 이전 앱은 검수 전 정상 종료했다. 최종 inventory build를 CUA 일반 실행(검수 CLI 없음)으로 다시 열고 시작→지옥문→시네마틱→한국어 로비0/5를 확인해 열어두었다. 새 캐릭터를 만들지 않았으며 일반 저장은 보존했다.

기존 검수 자료의 대표 캡처(현재 정상 사용자 저장과 구분):

- 로비/캐릭터 목록: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/character-store-smoke-d04230fd4/store-footer-ko-1080p.png` — 격리 목록 ‘이야기검수’, story source 이후 읽기 전용 재캡처.
- 생성 후 목록: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/character-store-smoke-d04230fd4/store-created-720p.png` — 저장 fixture.
- 전사 이야기: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/warrior-story-smoke-b45d7af0f/story-natural-middle-720p.png` — 실제 자연재생 중간.
- 플레이/하단 HUD: `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-LOBBY-20261025/warrior-story-smoke-b45d7af0f/story-gameplay-natural-720p.png` — 실제 자연완주 후 진입.

기존 인수 영수증: [캐릭터/슬롯](UNITY_MAC_CHARACTER_SLOTS_20261025.md), [전사 이야기](UNITY_MAC_WARRIOR_STORY_20261025.md), [설정/포커스](UNITY_MAC_PAUSE_KEYS_20261025.md). 기존 검사군을 재실행하지 않았다. 최신 인트로의 사용자 최종 승인·전체 아트·전투 저장·정밀 마우스·전체언어/RTL은 미완료 범위로 유지한다. 소지품 키보드 완료 결과는 [검수 문서](UNITY_MAC_INVENTORY_KEYS_20261025.md)를 따른다.
