# Mac 월드 아이템 스킨 첫 가공 — 원인 분리 및 후보 기각

2026-10-01. 입력 원격 `b918a4d35c6033025217b4f233ae6fb54eb0f288`. **진단 완료, 성능 수정은 미채택**. 본편·쉬운판 생산 변경은 0이다. 읽기 최적화 힌트 후보는 픽셀·폴백 검사를 통과했지만 최초 그리기 비용이 커진 표본 때문에 원복했다. QA-B01 전체 해결이나 PC 329ms 해결을 선언하지 않는다.

## 측정 조건과 원본 보존

- 기준 본편 SHA256 `78c3a0c763eb32cb39056835d3eaf30f3402bc054a463028bde783bf4e4f0e28`. 후보 SHA256 `95d135c3d23fca3ba7e1af79ff9d82f454eded64816c0dda17c9145eb01818a9`. 후보는 `_worldItemSkin` 최초 `canvas.getContext('2d')`에 `{willReadFrequently:true}`만 전달했다. 최종 본편은 기준과 바이트 단위 동일하며 3340 HTTP 응답도 같다.
- Chrome 152 / WebGL `webgpu=0`, 1352×663, DPR1. 단일 게임만 실행. 전후 별도 새 localhost 원점이며 같은 브라우저 프로필이다. 원점 분리는 새 OS/GPU/브라우저 프로세스를 의미하지 않는다.
- 정상 입력창: 기준 19,303.7ms·6처치, 후보 17,686.8ms·4처치. 모두 25초 전에 자연 HP0 종료. HP·공격·적·아이템·RNG 직접 조정 없음. 초기 HP527/565와 랜덤 드롭이 다르므로 전후 개선율·전체 FPS 비교 불가. atmos1/cap0, 전체 OPT는 raw에 보존했다.
- 도입 컷신만 DOM Space 2.2초로 건너뛰었다. 게임 관측창은 native W·좌클릭 입력이다. 기준에서 튜토리얼이 열린 초기 입력 관측은 `setup-excluded.json.gz`로 분리했다. 막타 피해원은 미분리다.
- 관측기는 원본 함수/Canvas 메서드를 감싸 실제 호출만 기록한다. 이미지 로드·아이템 생성·가공을 추가하지 않는다. `loopIntervalMs`는 **읽기 종료→쓰기 시작 경과시간**이며 계측 정리 비용을 포함한다. 순수 루프 CPU 시간이나 GPU 대기 시간이라고 해석하지 않는다.
- 스킨 관측기는 타임라인 정지 후 수집까지 집계가 계속됐다. `calls` 전체를 입력창 호출 수로 사용하지 않는다. 아래 비용은 `inputAt <= row.start <= timeline.end.at`로 잘랐다. 타임라인→스킨 순서로 종료하여 모든 바인딩 복구 true를 확인했다. 최종 도구는 종료된 래퍼를 다른 소유자가 복원해도 기록하지 않도록 보강했고, 측정 당시 도구도 별도 보존했다.

## 실제 로드 소스와 최초 비용

| 버전 | 실제 아이템 ID / base / element | 실제 currentSrc 경로 | 크기 | drawImage | getImageData | 읽기→쓰기 구간 | putImageData | 전체 skin |
|---|---|---|---|---:|---:|---:|---:|---:|
| 기준 | 1790845300693.1355 / dagger / phys | output/imagegen/item-skins/dagger_phys.png | 256² | 0.1ms | 98.4ms | 0.4ms | 0.1ms | 99.1ms |
| 기각 후보 | 1790845432782.6155 / ring / phys | output/imagegen/item-skins/ring_phys.png | 256² | 0.3ms | 0.4ms | 0.6ms | 0ms | 1.4ms |
| 기각 후보 | 1790845436507.1565 / ring / light | output/imagegen/item-skins/ring_light.png | 256² | 0.3ms | 0.4ms | 0.2ms | 0ms | 0.9ms |

URL의 원점은 각각 `http://qa-item-skin-base-20261001.localhost:3340` / `http://qa-item-skin-final-20261001.localhost:3340`다. 전체 src/currentSrc·캐시 키·Image/Canvas 객체 ID·item 필드는 [summary](item-skin-evidence/summary.json)와 raw에 있다. 기준 dagger는 Image 객체3·새 Canvas4, `maskObject:null`에서 첫 가공 후4가 됐다. 같은 키가 반복 가공된 스파이크가 아니다. 후보 ring은 서로 다른 phys/light 키와 객체이므로 두 최초 가공이다. 정상 컷아웃 cape/belt는 Image 그대로 반환되고 마스킹0이다.

이전 드롭 빔 검수의 86.7/136.5ms는 repeater_phys/hammer_phys의 생성 시각과 상관관계만 있었다. 당시 실제 src 기록이 없으므로 이번 dagger 기록으로 과거 두 아이템을 확정하지 않는다.

## 후보를 기각한 근거

별도 페이지에서 실제 HTML 함수를 추출하고 동일 원화를 사용했다. 전후 서로 새 원점에서 각 이미지의 load 및 decode 뒤 최초 가공을 측정했다. 이 실험은 게임 플레이가 아니며 실행 순서·브라우저 상태를 통제한 통계적 벤치마크도 아니다.

| 동일 원화 | 기준 전체 / draw / read | 후보 전체 / draw / read |
|---|---|---|
| repeater_phys | 9.8 / 0.5 / 6.5ms | **47.9 / 41.4 / 2.3ms** |
| hammer_phys | 3.5 / 0 / 2.6ms | 1.8 / 0.7 / 0.7ms |
| ring_light | 3.5 / 0.1 / 2.7ms | 3.0 / 0.8 / 1.5ms |

첫 4종 픽셀 실험에서도 repeater 총시간은 기준10.0ms/후보37.6ms였다. 따뜻한 캐시 실험의 후보 최초 draw19.5ms도 보존했다. read만 감소해도 최초 전체 비용 개선을 보장하지 않는다. 그리기 지연의 내부 원인은 아직 미확정이다. `willReadFrequently`는 브라우저 힌트이며 CPU backend 선택이나 GPU wait를 확정 측정한 것이 아니다. 안전한 개선으로 채택할 충분한 근거가 없어 **본편 한 줄을 원복**했다.

따뜻한 이미지 캐시에서는 src 대입 직후 `complete/naturalWidth`가 이미 유효하여 첫 `_worldItemSkin`에서 가공되고, 뒤늦은 load 이벤트가 마스크를 무효화해 다음 호출에서 다시 가공되는 사례도 별도 fixture에서 관측했다. 이는 로드 이벤트를 건너뛰어 해결할 문제가 아니다. dd3bdc의 같은 Image 소스 교체 보호를 유지해야 한다. 정상 관측의 큰 단검 스파이크는 이 중복 경로였다는 증거가 없다.

## 외형·캐시·폴백 검수

- 실제 PNG 137개, **40,958,608 RGBA 바이트 비교·색/알파 차이0**. 생성 에셋·알파24/72·크기·스킨 선택 불변. 137개 모두의 가공 픽셀 검사이며 실제 게임에서 137개 모두를 드롭시킨 검수는 아니다.
- 함수 fixture의 repeater/hammer/ring/belt 각각120회 동일 반환 객체 재사용. 원화3종은 Canvas, 정상 belt 컷아웃1254²는 Image. 따뜻한 캐시 실험의 load 전후 무효화와 한 번의 load 이후 재사용을 구분한다.
- 실제 브라우저 source 전환 cutout→phys→cutout, cutout 차단→phys 성공, 둘 다 차단→null 및120회 안정 반환을 통과했다. 요청 차단은 fixture 탭에만 적용하고 finally에서 해제했다.
- 첫 전환 실험은 캐시된 컷아웃 복귀도 반드시 pending이라고 가정하여1개 실패했다. 실제 `complete:true/naturalWidth:1254`가 즉시 로드 상태였으므로 상태에 맞는 기대값으로 고쳤다. 실패 원자료를 삭제하지 않고 최종10/10을 별도로 저장했다. 강제 pending과 load 무효화는 기존 Node 회귀에서도 검사한다.
- 후보 당시 관련26회귀와 guard/6개 inline 문법 PASS. 원복 후 최종25회귀·guard/6개 inline 문법 PASS이며 tests-final.txt/guard-final.txt에 보존했다. 후보용 first-context 테스트 변경도 원복했으며 최종 새 회귀는 관측 도구4건이다.
- 256² Canvas당 명목 RGBA256KiB. 후보는 기존 Image/Canvas 수명·캐시 수·요청 수를 늘리지 않았지만 브라우저 실제 총 메모리·GPU 메모리는 미측정이다. 전 스킨 선가공·부트 추가작업은 하지 않았다. 최종 생산코드0이므로 새로운 로딩/메모리 비용은 없다.

## 인수와 다음 한 건

HP/적/공격/옵션/원화/RNG/드롭/저장·쉬운판·패키지 코드는 원본 그대로다. 사용자 저장·원래 Mac3333·PC·기존 정규화22경로·공용 인덱스·VS Code 신뢰 대기를 보존했다. 게임 이탈, 계측 원복, 요청 차단 해제, viewport 복구 완료. Claude11팀 done/대화형1개 idle, root만 측정·문서·Git 수행, 기존 qa_review는 읽기 독립 검토 후 완료했다. 새 팀·게임 동시 실행·빌드·인코딩0.

다음 한 건은 **같은 원화의 최초 draw와 read를 함께 계측하여 총비용을 낮출 수 있는 좁은 준비/처리 경로 검증**이다. 이미지 디코드/첫 컨텍스트/업로드 비용을 근거 없이 특정하지 않는다. 14종 컷아웃 우회, 로드 무효화, 실패 폴백, 정확한 픽셀, 캐시 수명과 로딩 예산을 함께 통과해야 한다. 전체 스킨 선가공이나 외형 제거로 숨기지 않는다. 현재 QA-B01 스킨·홀리돔·기타 긴 draw/loop 밖 구간은 미해결이다.

[전체 증거 목록과 해시](item-skin-evidence/manifest.json) · [최종 요약](item-skin-evidence/summary.json). fixture HTML은 로컬3340에서 열며 `<base href="/">`로 실제 원화를 읽는다. candidate 파일은 기각 실험용이고 생산 페이지가 아니다. raw .json.gz는 원본 JSON을 무손실 압축했다. 원격 체크포인트 검증값은 작업 outputs/item-skin-20261001/checkpoint.json에 남긴다.
