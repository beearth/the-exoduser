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

## v1.1 추가 (7/12)
| 모듈 | 명령 | 소스 | 상태 |
|---|---|---|---|
| FOMC 프라이싱 | `fomc` | 연방기금선물 ZQ (야후) | ✅ 라이브 — FedWatch 대체 |
| 국장 공시 | `dart` | OpenDART (DART_API_KEY 필요, 무료 즉시발급) | 키 대기 |
| 국장 공매도 | `kshort` | pykrx (KRX_ID/KRX_PW 필요) | 키 대기 |
| 하이닉스 등급 | ant에 포함 | yfinance 000660.KS | ✅ 라이브 |

키 2개(DART, KRX) 환경변수만 넣으면 9개 모듈 전부 활성화.

## v1.2 — 알림 레이어 (7/12)
`python3 dojin_quant.py alert` — 전체 체크 실행 후 **변화가 있을 때만** 폰으로 푸시.

**트리거 5종:** ①개미지수 존 변경(일/주) ②KORU 톱질 5일+ & 감쇠 -3%p(타임스톱) ③SPCX Form 4/144 신규(내부자) ④FOMC 프라이싱 ±10%p 급변 ⑤SPCX 숏 잔고 신규 결제일

**채널 셋업 (하나만):**
- 텔레그램: @BotFather로 봇 생성→토큰, 봇에 아무 메시지 1개 보낸 뒤 `api.telegram.org/bot토큰/getUpdates`에서 chat_id 확인 → `export TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=...`
- 디스코드: 채널 설정→연동→웹훅 URL 복사 → `export DISCORD_WEBHOOK_URL=...`
- 둘 다 없으면 콘솔 출력(드라이런)

**스케줄 연결:** 클코/cron에 `python3 dojin_quant.py alert`를 하루 2회(아침 07:40 개장 전 + 저녁 22:00 미장 전) 걸면 끝. 조용한 날은 안 울림 — 그게 정상.

## v1.3 — 실배포 완료 (2026-07-12)
전 모듈 라이브. 위치 `G:\hell\reports\`.

**환경 배선**
- `.env` 자동 로드(python-dotenv) — `reports\.env` (gitignore됨). 템플릿 `.env.example`.
- 출력 tee → `reports\logs\YYYY-MM-DD_HHMM_명령.txt` 매 실행 자동 축적(등급 경계 재검증용).
- 상태파일 `~/.dojin_quant_state.json` (edgar_seen/dart_seen/zone_d/zone_w/streak_ge5/fomc_bp/si_date).

**활성화 상태 (전부 실측 검증)**
| 기능 | 상태 |
|---|---|
| 개미지수 (기본 `ANT_METRIC=indiv` = pykrx 실측, 실패시 네이버역산→vol 폴백) | ✅ 라이브 |
| KORU 감쇠 / SPCX EDGAR / SPCX 나스닥 공매도 / FOMC(ZQ) / 시그널보드 / 캘린더 | ✅ 라이브 |
| 국장 공시 `dart` (OpenDART) | ✅ 라이브 (키 검증 status 000) |
| 국장 공매도 `kshort` (pykrx, KRX 로그인) | ✅ 라이브 |
| 텔레그램 알림 (@dojin2_quant_bot) | ✅ 라이브 (테스트 전송 성공) |

**스케줄 (Windows 작업 스케줄러 — cron 대체)**
- `DojinQuant_Morning` 평일 07:40 KST / `DojinQuant_Evening` 평일 22:00 KST → `run_alert.cmd` → `alert`
- 로그인 상태에서만 실행(암호 미저장). 로그오프 중 실행하려면 `schtasks /RU` 자격증명 저장 필요.
- 관리: `schtasks /Query /TN DojinQuant_Morning` · 삭제 `schtasks /Delete /TN DojinQuant_Morning /F`

**주의 — 산식 변경 이력**: 기본을 `indiv`(개인 순매수 실측)로 승격. `vol`은 폴백, `value`(거래대금)는 랠리 고착으로 비권장. 존 경계(데드존=7 등)는 원본 정의 유지 — 실측 데이터 축적 후 재캘리브레이션 예정(문서의 분기 재검증 규정).
