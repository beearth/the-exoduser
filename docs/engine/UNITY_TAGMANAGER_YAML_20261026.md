# Unity TagManager YAML 빈 레이어 파싱 복구 — 2026-10-26

원본은 `add3949002221ad6ff2b3af8044b3fe69d02d520`의 TagManager와 byte-identical이었다. Unity6000.4.8/6000.6.7 모두 line41의 sorting layer에서 parser warning을 출력했다. 빈 layer 항목27개가 `  -` 뒤 공백 없이 끝나고 있었고, 같은 저장소의 Unity 생성 참고본은 `  - `였다.

| 변경 | 이전 | 이후 |
|---|---|---|
| 파일 크기 | 416 bytes | 443 bytes |
| 빈 layer27줄 | 하이픈으로 끝남 | 뒤에 ASCII공백1 byte |
| 32 layer 슬롯/이름/정렬/렌더링 ID | 기존 | 그대로 |

새 파일은 Unity 생성 참고본과 byte-identical이며 다른 byte 변경0이다. 생성 YAML이 요구하는27개의 공백은 의도된 것이므로 일반 trailing-whitespace 검사와 구별한다. 나머지 변경 문서의 diff check는 적용한다.

수정 후 실제6000.6.7 Editor를 -batchmode -nographics -noUpm -quit로 다시 열었다. `editor-tagmanager.log`에서 기존 TagManager parser warning이 사라졌고 `Application will exit with return code 0`을 확인했다. 제품 전체 플레이/레이어를 사용하는 전투의 별도 검수를 뜻하지 않는다.

docs/ 전체 검색의 유일한 기존 일치는 CHANGELOG_SYNC.md의 assets/vfx_impact/_unity_preview 파일 목록이며 수치/설계 변경 문서가 아니다. 원본 백업과 변경 byte 증거는 I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/symbol-lookup에 보존했다.
