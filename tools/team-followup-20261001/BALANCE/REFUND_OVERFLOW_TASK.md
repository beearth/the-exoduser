# BALANCE-LEGACY-REFUND-OVERFLOW-CANDIDATE

기존 완료 BALANCE의 승인된 PM-013 저장/경제 일관성 한 건. 새 경제 환수 정책을 정하는 작업이 아닙니다. 최신 BALANCE_ECONOMY_TEAM_MASTER, 인벤토리 SSOT의 분해 보상식, 현재 본편/easy salvageVal·equipItem의 _enhRefund 계산을 먼저 읽고 동일 과제/대기열이 없을 때 진행하세요.

root 실제 원식 추출 재현: rarity4/enh200000/tier0에서 양쪽 salvageVal=-244539796, 동일 레거시 누적합에 수학적 내림을 적용하면4050427500입니다. 현행 UI는 isMax=false/무한강화, 하지만 실제 이 강화수치 달성 실플레이는 미검증입니다. ROOT 출력의 rarity:2 메타데이터는 오기였고 실제 호출/배율은 rarity4/1.8입니다. 코드의 ~~ signed32 변환 때문에 환수값이 음수가 되는 결함입니다. equipItem old._enhRefund도 같은변환이라 기존 저장 시 음수로 기록될 수 있습니다.

현재 레거시 누적항·0.5·등급배율·기본액·티어·강화이전비용을 그대로 보존하고 두 계산의 signed32 overflow만 제거하는 최소 미적용 후보를 소유 폴더에서 구현하세요. PM-013-D의 실제강화지출50%로 바꾸기 금지, 새환수목표/상한/밸런스/피해/보호전투 변경 금지. 현재 SSOT의 '32비트 변환 유지'는 현행구현기록이므로 후보의 차이와 인수대기를 명시하고 생산/SSOT공식은 여기서 바꾸지 마세요. 이미 손실된 저장값의 원강화수치는 추정/복원하지 마세요.

원함수 추출로 RED→GREEN: 일반0/1/10/100/1000 동일, signed32 경계 직전/직후를 실제누적합으로 찾아검사, rarity0~5·legacy환수기록·JSON왕복·강화이전 후old.enh0 저장 경로를 검증하세요. 본인임시fixture만 쓰고 G.mats/실제서버/사용자저장 불가. 계산량은 작은경계검사 범위로 제한, 무한값/거대한값을 무제한루프에 실행하지 마세요. 새폐쇄형근사식/대형시뮬레이션 불필요.

소유 tools/team-followup-20261001/BALANCE/refund-overflow* 및 본지시, docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BALANCE-refund-overflow-result.md/receipt.json만. 생산읽기, 본편/easy표준context미적용diff·실제소스해시·회귀·docs전체검색을 제출. 다른팀/공유대장/Git/새세션/브라우저/서버/빌드수정금지. 한국어 수신·첫Read/Edit·완료/미검증범위를 기록하세요.
