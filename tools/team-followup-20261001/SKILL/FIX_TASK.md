# SKILL-RECHARGE-EXCEPTION-FIX

기존 SKILL203377cc-64c4-47ea-af27-95b66ae829fa의 다음 한 건. 최신 SKILL-next-result/receipt 및 ROOT_NEXT_REVIEW.md의 root 재현근거를 먼저 읽고 동일 과제 수신/진행중이면 중복 실행하지 마세요.

진단후보 두결함: 한update에서 rech100→99/stk0→1/조준취소인데 prev.rech>0만으로 recharge1/refund0로 오판정함. 실제rAF사이 여러update일수있으므로 timer만료/리셋·update수 등 증거부족시UNKNOWN으로 남기고 합법충전/취소환급을근거없이구별하지마세요. 두번째install중readRaw가throw하면3listener등록뒤API반환없이남음. 설치부분실패및rAFreader예외에도예약과listener정리/명시UNKNOWN·오류기록을보장하고dispose각remove실패가다음정리를막지않게하세요.

원본원격62652a19·3921dfc9복구본보존. 별도수정후보와원실패→수정회귀/정상66회귀, 실제게임원식/충전단위대조, docs전체검색을작성하세요. 소유 tools/team-followup-20261001/SKILL/ 및 docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/SKILL-rechargefix-result.md/receipt.json만. 생산/공용마스터/다른팀/Git/새세션/게임/브라우저/서버/이미지생성금지. 한국어수신/첫Read/Edit/완료기록. 과거잘못된자기시각을새증거로재사용하지마세요.
