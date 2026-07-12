# 도진 퀀트 킷 v1 — 셋업 노트

## 설치 & 실행
```
pip install yfinance pandas requests
python3 dojin_quant.py          # 전체 데일리 체크
python3 dojin_quant.py ant      # 개미지수만 (decay/edgar/short/macro 동일)
```
클코 스케줄 태스크에는 프롬프트 대신 `python3 dojin_quant.py 실행하고 결과 해석해서 브리핑` 한 줄이면 끝 — 수치 지어낼 여지가 없어짐.

## 개인 실측 데이터 활성화 (개미지수 업그레이드)
KRX가 2025년부터 데이터 다운로드에 로그인을 요구함 → pykrx도 계정 필요.
1. data.krx.co.kr 무료 회원가입
2. `export KRX_ID=아이디  KRX_PW=비번` 후 `ANT_METRIC=indiv python3 dojin_quant.py ant`
3. KRX 실패 시 네이버 frgn 페이지 역산(개인≈-(기관+외인))으로 자동 폴백
   — 폴백 코드는 이 샌드박스에서 네이버가 차단이라 **미검증**, 니 컴에서 첫 실행 때 확인 필요

## 등급 기준 변경 사유 (중요)
원본 정의(거래대금 백분위)는 주가 5배 랠리에서 등급이 9~10에 고착(2026년 27주 중 21주) → 변별력 상실.
기본값을 거래량(vol) 기준으로 변경. 원본으로 돌리려면 `ANT_METRIC=value`.
**단 어떤 정의로도 원본 문서의 28주 백테스트 표는 정확히 재현 안 됨** — 등급 경계(데드존=7 등)는
실측(indiv) 데이터 확보 후 재캘리브레이션 필요. 문서의 "분기별 재검증" 규정 발동 상태.

## 모듈별 데이터 소스
| 모듈 | 소스 | 상태 |
|---|---|---|
| 개미지수 | yfinance(005930.KS) + pykrx/네이버 | ✅ 라이브 (실측은 니 컴에서) |
| KORU 감쇠 | yfinance(KORU, EWY) | ✅ 라이브 |
| SPCX 공시 | SEC EDGAR (CIK 1181412) | ✅ 라이브, Form144/4 신규분 자동 감지 |
| SPCX 공매도 | 나스닥 SI API (월 2회 갱신) | ✅ 라이브 |
| 시그널 보드 | yfinance 12종 | ✅ (SKHY는 상장 직후라 데이터 대기중, 잡히면 자동 표시) |
| FRED/ECOS | — | 금리·VIX는 야후로 커버, 필요시 추후 추가 |

## 상태 파일
`~/.dojin_quant_state.json` — EDGAR 마지막 확인 시점 저장. 지우면 기준선 리셋.
