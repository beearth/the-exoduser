# Monica 확장프로그램 Untrusted event 진단 (2026-09-10)

## 원인 확인

사용자 스크린샷 `스크린샷 2026-09-10 125525.png`의 빨간 오류는 게임이 아닌 Chrome 확장프로그램의 키 감시 리스너에서 발생했다. 실행 중 게임 탭 로그의 전체 출처:

```text
Error: Untrusted event
  q7n.ensureTrustedEvent (chrome-extension://ofpnmcalabcbjgholdjcjblkibolbppb/content.js:3994:4090)
  aZt.handleKeyDown (chrome-extension://ofpnmcalabcbjgholdjcjblkibolbppb/content.js:7377:63987)
  HTMLDocument.<anonymous> (chrome-extension://ofpnmcalabcbjgholdjcjblkibolbppb/content.js:7377:63682)
```

확장 ID `ofpnmcalabcbjgholdjcjblkibolbppb`는 Monica로 식별된다([확장 메타데이터](https://extpose.com/ext/ofpnmcalabcbjgholdjcjblkibolbppb)). 게임의 `_gpInjectKey`와 좌스틱 WASD 전달은 `new KeyboardEvent`에 `_fromGp=true`를 붙이고 `document.dispatchEvent`로 전달한다. 해당 합성 이벤트의 `isTrusted=false`이며 Monica가 예외를 발생시킨다. `_fromGp`는 게임 내부 식별 플래그로, 브라우저가 부여하는 `isTrusted`와 별개다.

## 독립 재현 결과

게임 코드·렌더러·세이브를 로드하지 않는 `tmp/monica_input_probe_20260910.html`에서 같은 브라우저/localhost로 확인했다.

| 입력 | 페이지 관찰 | 확장 오류 | 입력 전달 |
|---|---|---|---|
| 브라우저 키 입력 `KeyW` | `isTrusted=true`, `_fromGp=false` | 없음 | document와 window keydown 모두 수신 |
| 버튼으로 게임패드와 같은 합성 `KeyW` down/up 전달 | `isTrusted=false`, `_fromGp=true` | 위와 동일한 확장 URL·함수·행 번호의 `Untrusted event` 1회 재현 | document와 window keydown 모두 수신, dispatch 이후 코드 실행 완료 |

따라서 이 오류 자체는 지옥강타/VFX 오류가 아니며, 게임 없이도 발생하는 확장프로그램과 합성 키 입력 간 호환 문제다. 이번 재현에서 입력 전달은 막히지 않았다. 장시간 콘솔 누적의 성능 영향이나 전체 게임패드 기능은 측정하지 않았다.

## 대응과 범위

- 오류 발생 주체인 Monica가 게임 페이지에서 실행되지 않도록 사용자가 해당 사이트 실행 제한 또는 확장 비활성화 후 새로고침하면 이 리스너 경로를 제거할 수 있다. 해당 설정 변경/변경 후 재검증은 하지 않았다.
- 확장프로그램의 예외를 게임에서 숨기거나 `isTrusted`를 위조하지 않는다. 다수 게임 리스너와 키 재설정·인트로·UI가 공유하는 패드 이벤트 전달 경로도 이번 진단에서는 변경하지 않았다.
- 브라우저 확장 관리 페이지는 자동화 도구의 URL 보안 정책에 의해 접근이 차단되어 설정을 변경하지 않았다.
- 별도 광원 잔상 결함은 [조명 GPU 갱신 수정](../12퍼포먼스·최적화/LIGHTING_TEXTURE_FRESHNESS_20260910.md)에 기록되어 있다.
