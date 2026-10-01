# R 입력·GL 후속 검수 도구

생산 게임 코드·에셋은 바꾸지 않는 수동 QA 도구다. 기존 결과는 docs/0마스터플랜/mac-resume-20261001/R-입력과-GL-후속검수.md 및 evidence.zip을 따른다.

- input-probe.js: 격리된 로컬 개발 게임에서만 설치. DOM 입력·K/KH·update·획득을 관측하며 dispose로 복원한다. tagged QA fixture만 정리한다. untrusted DOM 입력과 native 도구 입력, 사람 물리 입력을 구분한다.
- interact-diagnostic.mjs: `node --test --test-reporter=tap tools/qa/r-input-followup/interact-diagnostic.mjs`. 기준16만족/10미충족, 예상 exit1. 일반 CI 회귀가 아니며 update 없는 입력·repeat에 대한 강화된 계약 가정이다. 실제 일반 사용자 결함으로 해석하지 않는다.
- build-assets.py: 게임 실측 종료 후 `python3 tools/qa/r-input-followup/build-assets.py --output /absolute/new/output`. 957파일 읽기/해시, LFS 제작원본·출처3개로 exit1. 실제 패키징/게임 로드 검수와 다르다.
- sound-loop-review.html: 3340 서버의 이 경로에서 원본/후보를 개별 선택한다. 기본UI/390px만 검수했다. 파일 권한·실제재생·청취·다운로드 완료는 별도다. 파일 URL 권한 차단을 우회하지 않는다.
- 별도 BALANCE 하니스: `node --test test/onHitFireballStack.test.js`. 8PASS/2SKIP는 MISSING_HOOK 관측이며 효과 완성이 아니다.

ART/MAP/SKILL/ENEMY/ANIMVFX CLI 후보는 evidence.zip의 candidates에 원문과 정적 판정을 보존했다. 구문5/5 PASS이지만 상태 변경·정리·판정 결함이 있으므로 그대로 실행하지 않는다.
