# Mac 표시 릴리스 메타 source 동기화 — 2026-10-27

## 결정 근거

원격 main을 `607110d52a56a1e5622a78e2ce7d09582946920a`로 고정해 확인했다. main `docs/engine/orders/PC_TO_MAC_INBOX_20261021.md`의 최신 항목은 2026-10-26 밤 12 맵 아트 바이블이며, 0.7.7을 Unity 통합 표시 기준으로 승인한 명시 항목은 없다. 사용자 확정 최신 원격 main 공통 기준에 따라 Mac `unity/Assets/Exoduser/Resources/Data/release_web.json` **한 파일의 표시 메타만** main `release-version.json` bytes로 맞춘다. 기존 0.7.7은 원본 SHA가 적히지 않은 2026-10-26 스냅샷이었으며 현행 공통 릴리스 근거로 사용하지 않는다.

| 기준/적용 | 값·증거 |
|---|---|
| main commit | `607110d52a56a1e5622a78e2ce7d09582946920a` |
| main `release-version.json` | version `0.7.5`, date `2026-10-20`, channel `ea-full`; Git blob `528ad945f68c8740a8f8fe77fa33518d18db296e`; SHA256 `21639192625b3db96c95db067d943d173cff6e297226ff9724e3022f0cb549da` |
| main `package.json`/`release-version.js` | 각각 version `0.7.5`, `window.EXODUSER_RELEASE={version:"0.7.5",date:"2026-10-20"}` |
| Mac `release_web.json` | main 명세와 `cmp` 동일 bytes, SHA256 동일. `BuildFlavor.VersionLine` 표시 `v0.7.5 · 20261020` |
| Mac `patch_notes.json` | 기존 `0.7.5`·`0.7.0` 두 항목 유지, SHA256 `e4eac388fee4d9030b5a7731b74c0bb14e5075256570fc35ed3e9b52ea1d8962` |
| 범위 밖 | 게임 내용, 세계관 v22b/전사 v23 미디어, app identifier, target flavor, 다른 Resources JSON/.meta 불변. 새 Player build 없음 |

사전 백업은 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-RELEASE-META-20261027/before/release_web.json`. `rg -l 'release_web|release-version|0\.7\.7|0\.7\.5' docs` 전체 검색에서 6개 문서를 대조했다. 과거 A03 UI 검수·원본 로비 추적 문서의 당시 관찰은 소급 변경하지 않았다. 최종 Editor Verify 영수증은 아래 후속에 기록한다.
