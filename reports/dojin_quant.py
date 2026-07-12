# -*- coding: utf-8 -*-
"""
도진 퀀트 킷 v1 — 데일리 시그널 자동화 (판단은 사람, 계산은 기계)
사용법:
  python3 dojin_quant.py            # 데일리 체크리스트 전체 출력
  python3 dojin_quant.py ant        # 개미지수만
  python3 dojin_quant.py decay      # KORU 감쇠 추적만
  python3 dojin_quant.py edgar      # SPCX 공시 감시만
  python3 dojin_quant.py short      # SPCX 공매도 잔고만
  python3 dojin_quant.py macro      # 매크로 티커 세트만
필요: pip install yfinance pandas requests (선택: pykrx + KRX_ID/KRX_PW 환경변수)
"""
import sys, os, json, datetime as dt
from io import StringIO
import pandas as pd, numpy as np, requests
import yfinance as yf
try:  # .env 자동 로드 (스크립트 폴더 기준) — 키는 실측 소스 활성화용, 없으면 해당 모듈만 스킵
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))
except Exception:
    pass

pd.set_option('display.width', 140)
H_SEC = {'User-Agent': 'DojinQuant contact@example.com'}
H_WEB = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
STATE = os.path.expanduser('~/.dojin_quant_state.json')

def _load_state():
    try: return json.load(open(STATE))
    except Exception: return {}
def _save_state(s):
    json.dump(s, open(STATE, 'w'))

# ---------------------------------------------------------------
# 1. 개미지수 (Retail Crowding Index)
#    등급 = 지난 N구간 중 백분위 × 10
#    metric: vol(거래량, 기본) / value(거래대금=종가×거래량) / indiv(개인 실측)
#    * 2026-07 재검증 메모: 거래대금 기준은 주가 5배 랠리 구간에서 등급이
#      9~10에 고착(27주 중 21주)돼 변별력 상실 → 기본값을 거래량으로 변경.
#      실측(indiv)은 KRX 로그인 또는 네이버 폴백 필요.
# ---------------------------------------------------------------
def _grade(s, n):
    return s.rolling(n).apply(lambda w: (w <= w[-1]).mean() * 10, raw=True)

def _indiv_flow(code='005930', days=420):
    """개인 순매수 실측. 1순위 pykrx(KRX_ID/KRX_PW), 2순위 네이버 frgn 역산."""
    end = dt.date.today(); start = end - dt.timedelta(days=days)
    if os.environ.get('KRX_ID') and os.environ.get('KRX_PW'):
        try:
            from pykrx import stock
            df = stock.get_market_trading_value_by_date(
                start.strftime('%Y%m%d'), end.strftime('%Y%m%d'), code)
            if len(df) and '개인' in df.columns:
                return df['개인'].rename('indiv'), 'pykrx(실측)'
        except Exception as e:
            print(f'  [indiv] pykrx 실패: {e}')
    # 네이버 폴백: 기관/외국인 순매매량 → 개인 ≈ -(기관+외인) (기타법인 무시 근사)
    try:
        rows = []
        for page in range(1, 22):  # 페이지당 약 20영업일
            url = f'https://finance.naver.com/item/frgn.naver?code={code}&page={page}'
            tabs = pd.read_html(StringIO(requests.get(url, headers=H_WEB, timeout=10).text))
            t = max(tabs, key=len).dropna(how='all')
            rows.append(t)
        t = pd.concat(rows)
        t.columns = ['날짜','종가','전일비','등락률','거래량','기관','외국인','보유주수','보유율'][:len(t.columns)]
        t = t.dropna(subset=['날짜']).drop_duplicates('날짜')
        t['date'] = pd.to_datetime(t['날짜'], errors='coerce')
        t = t.dropna(subset=['date'])
        for c in ['종가','기관','외국인']:
            t[c] = pd.to_numeric(t[c].astype(str).str.replace(',',''), errors='coerce')
        t = t.set_index('date').sort_index()
        indiv_qty = -(t['기관'] + t['외국인'])          # 수량 근사
        return (indiv_qty * t['종가']).rename('indiv'), '네이버 역산(근사)'
    except Exception as e:
        return None, f'실측 불가({e}) — KRX 계정(KRX_ID/KRX_PW) 설정 권장'

def _zone(g):
    return ('매수최적(3~5)' if 3<=g<5 else '보유(5~7)' if 5<=g<7 else
            '데드존·신규금지(7~9)' if 7<=g<9 else '극단·당일방향확인(9~10)' if g>=9 else '소진(0~3)')

def ant_index(metric='vol', code='005930.KS'):
    print('\n■ 1. 개미지수 — 삼성전자')
    df = yf.download(code, start='2024-06-01', auto_adjust=False, progress=False)
    if isinstance(df.columns, pd.MultiIndex): df.columns = df.columns.get_level_values(0)
    df['value'] = df['Close'] * df['Volume']
    df['vol'] = df['Volume']

    src = ''
    if metric == 'indiv':
        flow, src = _indiv_flow(code.split('.')[0])
        if flow is None:
            print(f'  {src} → 거래량 기준으로 대체'); metric = 'vol'
        else:
            df = df.join(flow.abs().rename('indiv'))  # 쏠림 = 개인 자금 활동 강도(|순매수|)
            df['indiv_raw'] = flow

    # 일단위(40일) / 주단위(40주) 등급
    df['g_d'] = _grade(df[metric], 40)
    wk = pd.DataFrame({'close': df['Close'].resample('W-FRI').last(),
                       'x': df[metric].resample('W-FRI').sum()}).dropna()
    wk['g_w'] = _grade(wk['x'], 40)
    wk['next'] = wk['close'].shift(-1) / wk['close'] - 1

    gd, gw = df['g_d'].iloc[-1], wk['g_w'].iloc[-1]
    print(f'  기준: {metric}' + (f' [{src}]' if src else ''))
    print(f'  일단위 등급(40일): {gd:.1f} → {_zone(gd)}')
    print(f'  주단위 등급(40주): {gw:.1f} → {_zone(gw)}')
    print(f'  종가 {df["Close"].iloc[-1]:,.0f}원 ({df.index[-1].date()}), 5일 등급 추이 ' +
          '→'.join(f'{v:.1f}' for v in df['g_d'].tail(5)))

    # 백테스트 표 (분기 재검증용)
    bt = wk.loc['2026-01-01':].dropna(subset=['g_w','next'])
    if len(bt) >= 10:
        print(f'  [재검증] 2026년 {len(bt)}주 — 등급별 다음주:')
        for lo,hi in [(0,3),(3,5),(5,7),(7,9),(9,10.01)]:
            m = bt[(bt.g_w>=lo)&(bt.g_w<hi)]
            if len(m): print(f'    {lo}~{int(hi)}: n={len(m):>2} 평균 {m.next.mean()*100:+5.2f}% 상승 {(m.next>0).mean()*100:3.0f}%')
    return gd, gw

# ---------------------------------------------------------------
# 2. KORU 감쇠 추적기 — 기초=EWY(진짜 기초 MSCI Korea 25/50 프록시)
# ---------------------------------------------------------------
def koru_decay():
    print('\n■ 2. KORU 감쇠 추적 (기초=EWY)')
    px = yf.download(['KORU','EWY'], start='2025-06-01', auto_adjust=True, progress=False)['Close'].dropna()
    r = px.pct_change().dropna()
    r['gap'] = r['KORU'] - 3*r['EWY']
    r['gap10'] = r['gap'].rolling(10).sum()*100
    r['ewy10'] = ((1+r['EWY']).rolling(10).apply(np.prod)-1)*100
    r['regime'] = np.where(r['ewy10'].abs() >= 5, '방향성', '톱질')
    cur = r.iloc[-1]
    # 톱질 연속일
    streak = 0
    for v in r['regime'][::-1]:
        if v == '톱질': streak += 1
        else: break
    print(f'  {r.index[-1].date()} 기준 — 10일 기초누적 {cur.ewy10:+.1f}% | 10일 감쇠 {cur.gap10:+.1f}%p | 국면: {cur.regime} (톱질 연속 {streak}일)')
    if streak >= 5 and cur.gap10 < -3:
        print('  ⚠ 톱질 5일+ & 감쇠 가속 → 타임스톱 검토 구간 (파라미터: 5일/-3%p, 조정 가능)')
    # 이번 달 분해
    m = r.loc[r.index[-1].strftime('%Y-%m')]
    ku=(1+m['KORU']).prod()-1; bs=(1+m['EWY']).prod()-1
    print(f'  이번달 누적: 기초 {bs*100:+.1f}% | 이론x3 {bs*300:+.1f}% | KORU {ku*100:+.1f}% | 갭 {(ku-bs*3)*100:+.1f}%p')
    return cur, streak

# ---------------------------------------------------------------
# 3. SPCX 공시 감시 (SEC EDGAR) — Form 144/4 = 내부자 매도 신호
# ---------------------------------------------------------------
def spcx_edgar(cik='0001181412'):
    print('\n■ 3. SPCX 공시 감시 (EDGAR)')
    j = requests.get(f'https://data.sec.gov/submissions/CIK{cik}.json', headers=H_SEC, timeout=15).json()
    f = pd.DataFrame(j['filings']['recent'])[['form','filingDate','accessionNumber']]
    st = _load_state(); seen = set(st.get('edgar_seen', []))
    new = f[~f['accessionNumber'].isin(seen)]
    ins = f[f['form'].isin(['4','144','144/A'])]
    print(f'  전체 {len(f)}건 | Form4 {len(f[f.form=="4"])}건 | Form144 {len(f[f.form.isin(["144","144/A"])])}건')
    if len(new) and seen:
        print(f'  🆕 지난 실행 이후 신규 {len(new)}건:')
        for _,row in new.head(8).iterrows():
            flag = ' ← 내부자!' if row.form in ('4','144','144/A') else ''
            print(f'    {row.filingDate} {row.form}{flag}')
    elif not seen:
        print('  (첫 실행 — 기준선 저장. 다음 실행부터 신규분만 표시)')
    if len(ins):
        print('  내부자 신고 최근:')
        for _,row in ins.head(3).iterrows(): print(f'    {row.filingDate} Form {row.form}')
    st['edgar_seen'] = f['accessionNumber'].tolist(); _save_state(st)
    new_ins = new[new['form'].isin(['4','144','144/A'])] if seen else new.iloc[0:0]
    return [(r.filingDate, r.form) for _, r in new_ins.iterrows()]

# ---------------------------------------------------------------
# 4. SPCX 공매도 잔고 (나스닥, 월 2회 결제일 기준)
# ---------------------------------------------------------------
def spcx_short():
    print('\n■ 4. SPCX 공매도 잔고 (나스닥 SI)')
    try:
        r = requests.get('https://api.nasdaq.com/api/quote/SPCX/short-interest?assetclass=stocks',
                         headers={**H_WEB,'Accept':'application/json'}, timeout=10).json()
        rows = r['data']['shortInterestTable']['rows'][:3]
        for row in rows:
            si = int(row['interest'].replace(',','')); adv = int(row['avgDailyShareVolume'].replace(',',''))
            print(f"  {row['settlementDate']}: 숏 {si/1e6:,.1f}M주 | 일평균거래 {adv/1e6:,.1f}M주 | 커버 {row['daysToCover']}일")
        if len(rows) >= 2:
            d = int(rows[0]['interest'].replace(',','')) - int(rows[1]['interest'].replace(',',''))
            print(f'  직전 대비 {"+" if d>=0 else ""}{d/1e6:,.1f}M주 → 숏 {"증가(비관 확대)" if d>0 else "감소(커버링)"}')
            return rows[0]['settlementDate'], int(rows[0]['interest'].replace(',',''))/1e6, d/1e6
        return rows[0]['settlementDate'], int(rows[0]['interest'].replace(',',''))/1e6, None
    except Exception as e:
        print(f'  조회 실패: {e}')

# ---------------------------------------------------------------
# 5. 매크로/시그널 티커 세트
# ---------------------------------------------------------------
def macro():
    print('\n■ 5. 시그널 보드 (직전 종가 기준)')
    tk = {'^SOX':'SOX(마스터)','NVDA':'NVDA(앵커)','MU':'마이크론','SKHY':'SK하이닉스ADR',
          'SPCX':'SpaceX','EWY':'EWY','KORU':'KORU','SOXL':'SOXL','SOXS':'SOXS',
          'KRW=X':'환율','^VIX':'VIX','^TNX':'10년금리x10'}
    px = yf.download(list(tk), period='7d', auto_adjust=True, progress=False)['Close']
    for t,name in tk.items():
        try:
            s = px[t].dropna()
            chg = (s.iloc[-1]/s.iloc[-2]-1)*100
            print(f'  {name:<12} {s.iloc[-1]:>10,.2f}  {chg:+.2f}%')
        except Exception:
            print(f'  {name:<12} (데이터 없음)')

# ---------------------------------------------------------------
# 7. FOMC 시장 프라이싱 — 연방기금선물(ZQ)로 CME FedWatch 대체
# ---------------------------------------------------------------
def fomc(meeting_month=7, meeting_label='7/28-29 FOMC'):
    print(f'\n■ 7. FOMC 프라이싱 ({meeting_label})')
    MC = {1:'F',2:'G',3:'H',4:'J',5:'K',6:'M',7:'N',8:'Q',9:'U',10:'V',11:'X',12:'Z'}
    yy = dt.date.today().year % 100
    months = [meeting_month + i for i in range(3)]
    imp = {}
    for m in months:
        mm, y2 = (m-1) % 12 + 1, yy + (m-1)//12
        t = f'ZQ{MC[mm]}{y2}.CBT'
        try:
            s = yf.download(t, period='5d', progress=False, auto_adjust=True)['Close'].dropna()
            imp[mm] = 100 - float(s.iloc[-1].item() if hasattr(s.iloc[-1],'item') else s.iloc[-1])
            print(f'  {y2+2000}-{mm:02d}월물 내재금리 {imp[mm]:.2f}%')
        except Exception:
            print(f'  {t} 조회 실패')
    m0, m1 = meeting_month, (meeting_month % 12) + 1
    if m0 in imp and m1 in imp:
        move = imp[m1] - imp[m0]
        prob = abs(move) / 0.25 * 100
        direction = '인상' if move > 0 else '인하'
        print(f'  → 회의 통과 시 {move*100:+.0f}bp 반영 = 25bp {direction} 확률 약 {min(prob,100):.0f}% 프라이싱')
        return move
    return None

# ---------------------------------------------------------------
# 8. OpenDART 공시 감시 — 삼성/하이닉스 (무료 API키: opendart.fss.or.kr)
# ---------------------------------------------------------------
def opendart():
    print('\n■ 8. 국장 공시 (OpenDART)')
    key = os.environ.get('DART_API_KEY')
    if not key:
        print('  DART_API_KEY 없음 → 건너뜀 (opendart.fss.or.kr에서 무료 발급, 즉시)')
        return
    corps = {'00126380':'삼성전자', '00164779':'SK하이닉스'}
    st = _load_state(); seen = set(st.get('dart_seen', []))
    bgn = (dt.date.today()-dt.timedelta(days=7)).strftime('%Y%m%d')
    new_ids = []
    for cc, name in corps.items():
        try:
            r = requests.get('https://opendart.fss.or.kr/api/list.json',
                params={'crtfc_key':key,'corp_code':cc,'bgn_de':bgn,'page_count':20}, timeout=12).json()
            for it in r.get('list', []):
                new_ids.append(it['rcept_no'])
                mark = '🆕 ' if (seen and it['rcept_no'] not in seen) else '   '
                print(f"  {mark}{it['rcept_dt']} [{name}] {it['report_nm']}")
        except Exception as e:
            print(f'  {name} 조회 실패: {e}')
    st['dart_seen'] = list(seen | set(new_ids)); _save_state(st)

# ---------------------------------------------------------------
# 9. 국장 공매도 잔고 — KRX 로그인 필요 (KRX_ID/KRX_PW)
# ---------------------------------------------------------------
def krx_short(code='005930'):
    print('\n■ 9. 국장 공매도 잔고 (삼성전자, T+2 공시)')
    if not (os.environ.get('KRX_ID') and os.environ.get('KRX_PW')):
        print('  KRX_ID/KRX_PW 없음 → 건너뜀 (data.krx.co.kr 무료 계정)')
        return
    try:
        from pykrx import stock
        end = dt.date.today(); start = end - dt.timedelta(days=30)
        df = stock.get_shorting_balance_by_date(start.strftime('%Y%m%d'), end.strftime('%Y%m%d'), code)
        if len(df):
            last = df.iloc[-1]; prev = df.iloc[-6] if len(df) > 5 else df.iloc[0]
            print(f"  잔고 {last['공매도잔고']/1e6:.1f}M주 (비중 {last['비중']:.2f}%) | 5일전 대비 {(last['공매도잔고']-prev['공매도잔고'])/1e6:+.1f}M주")
    except Exception as e:
        print(f'  조회 실패: {e}')

# ---------------------------------------------------------------
# 10. 알림 레이어 — 트리거 발생 시에만 텔레그램/디스코드 푸시
#     python3 dojin_quant.py alert  (스케줄 태스크는 이 모드로)
# ---------------------------------------------------------------
def _send_alert(text):
    tok, cid = os.environ.get('TELEGRAM_BOT_TOKEN'), os.environ.get('TELEGRAM_CHAT_ID')
    hook = os.environ.get('DISCORD_WEBHOOK_URL')
    if tok and cid:
        r = requests.post(f'https://api.telegram.org/bot{tok}/sendMessage',
                          json={'chat_id': cid, 'text': text}, timeout=10)
        print(f'\n[텔레그램 전송 {r.status_code}]')
    elif hook:
        r = requests.post(hook, json={'content': text}, timeout=10)
        print(f'\n[디스코드 전송 {r.status_code}]')
    else:
        print('\n[알림 채널 미설정 — 콘솔 출력]\n' + text)

def alerts():
    st = _load_state()
    msgs = []
    # 1. 개미지수 존 변경 (삼성 일/주)
    gd, gw = ant_index(metric=os.environ.get('ANT_METRIC', 'vol'))
    zd, zw = _zone(gd), _zone(gw)
    if st.get('zone_d') and st['zone_d'] != zd:
        msgs.append(f"개미지수(일) 존 변경: {st['zone_d']} → {zd} (등급 {gd:.1f})")
    if st.get('zone_w') and st['zone_w'] != zw:
        msgs.append(f"개미지수(주) 존 변경: {st['zone_w']} → {zw} (등급 {gw:.1f})")
    st['zone_d'], st['zone_w'] = zd, zw
    # 2. KORU 톱질 타임스톱 트리거
    cur, streak = koru_decay()
    fire = streak >= 5 and cur.gap10 < -3
    if fire and not st.get('streak_ge5'):
        msgs.append(f"KORU 톱질 {streak}일 연속 + 10일 감쇠 {cur.gap10:+.1f}%p → 타임스톱 검토")
    st['streak_ge5'] = bool(fire)
    # 3. SPCX 내부자 신고 (락업 테제 핵심)
    new_ins = spcx_edgar() or []
    if new_ins:
        forms = ', '.join(f'{d} Form{f}' for d, f in new_ins[:5])
        msgs.append(f"SPCX 내부자 신고 신규 {len(new_ins)}건: {forms}")
    # 4. FOMC 프라이싱 급변 (±10%p = 2.5bp)
    bp = fomc()
    if bp is not None:
        prev = st.get('fomc_bp')
        if prev is not None and abs(bp - prev) >= 0.025:
            msgs.append(f"FOMC 프라이싱 급변: {prev/0.25*100:+.0f}% → {bp/0.25*100:+.0f}% (25bp 기준)")
        st['fomc_bp'] = bp
    # 5. SPCX 공매도 신규 결제일
    si = spcx_short()
    if si:
        date, mil, delta = si
        if st.get('si_date') and st['si_date'] != date:
            d_txt = f' ({delta:+.1f}M)' if delta is not None else ''
            msgs.append(f"SPCX 숏 갱신 {date}: {mil:.1f}M주{d_txt}")
        st['si_date'] = date
    # 11. 익절 트리거 (보유 포지션) — 추가 전용, 위 5종 트리거 무수정
    tp_blocks = _take_profit(st)
    _save_state(st)
    if msgs:
        _send_alert(f"🔔 도진 퀀트 — {dt.date.today()}\n" + '\n'.join(f'• {m}' for m in msgs))
    else:
        print('\n[알림] 트리거 없음 — 전송 안 함 (정상)')
    for block in tp_blocks:      # 익절 신호는 포지션별 독립 메시지로 발송
        _send_alert(block)

# ---------------------------------------------------------------
# 11. 익절 트리거 — 보유 포지션의 개미지수 고쏠림 + 수익 중일 때만 사다리 익절 신호
#     positions.json 기반. 기존 산식(_grade)·존·트리거 5종 무수정, 추가 전용.
# ---------------------------------------------------------------
_POSITIONS = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'positions.json')
_POS_TEMPLATE = {"positions": [
    {"ticker": "KORU", "ant_source": "005930.KS", "avg_price": 931980, "qty": 89, "note": "러너49+회전40"}
]}

def _load_positions():
    """positions.json 로드. 없으면 템플릿 생성 후 None(미등록 신호) 반환."""
    if not os.path.exists(_POSITIONS):
        json.dump(_POS_TEMPLATE, open(_POSITIONS, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
        return None
    try:
        return json.load(open(_POSITIONS, encoding='utf-8')).get('positions', [])
    except Exception as e:
        print(f'  positions.json 파싱 실패: {e}'); return []

def _daily_grade(code, metric='indiv'):
    """ant_source의 일단위(40일) 등급 — 기존 _grade/_indiv_flow 재사용(산식 무수정)."""
    df = yf.download(code, start='2024-06-01', auto_adjust=False, progress=False)
    if isinstance(df.columns, pd.MultiIndex): df.columns = df.columns.get_level_values(0)
    df['value'] = df['Close'] * df['Volume']; df['vol'] = df['Volume']
    m = metric
    if m == 'indiv':
        flow, _ = _indiv_flow(code.split('.')[0])
        if flow is None: m = 'vol'
        else: df = df.join(flow.abs().rename('indiv'))
    return float(_grade(df[m], 40).iloc[-1])

def _tp_ladder(grade, day_chg):
    """등급/당일등락률 → (밴드키, 문구). 8 미만이면 None."""
    if grade < 8.0: return None
    if grade < 8.5: return ('8.0~8.5', '1차 익절 구간 — 1/3 사다리 지정가')
    if grade < 9.0: return ('8.5~9.0', '2차 익절 구간 — 추가 1/3')
    if day_chg < 0: return ('9.0+되돌림', '되돌림 시작 — 잔량 정리 검토')
    return ('9.0+지속', '고쏠림 지속 — 사다리 유지, 연타 금지')

def _take_profit(st, price_fn=None, grade_fn=None):
    """포지션별 익절 신호 블록 리스트 반환. 등급>=8 AND 수익중(ret>0) AND 밴드변경 시에만 발화.
    price_fn(p)->(현재가, 당일등락%), grade_fn(p)->등급: 테스트용 강제주입 훅(없으면 실측)."""
    positions = _load_positions()
    if positions is None:
        print('\n■ 11. 익절 트리거 — positions.json 미등록(템플릿 생성) → 스킵'); return []
    if not positions:
        print('\n■ 11. 익절 트리거 — 등록 포지션 없음'); return []
    print('\n■ 11. 익절 트리거')
    bands = st.setdefault('tp_band', {})
    metric = os.environ.get('ANT_METRIC', 'vol')
    out = []
    for p in positions:
        tkr = p.get('ticker'); src = p.get('ant_source', tkr); avg = p.get('avg_price')
        try:
            grade = grade_fn(p) if grade_fn else _daily_grade(src, metric)
            if price_fn:
                cur, day_chg = price_fn(p)
            else:
                h = yf.Ticker(tkr).history(period='7d', auto_adjust=False)['Close'].dropna()
                cur = float(h.iloc[-1]); day_chg = (cur / float(h.iloc[-2]) - 1) * 100
            ret = (cur / avg - 1) * 100 if avg else 0.0
        except Exception as e:
            print(f'  {tkr}: 조회 실패 {e}'); continue
        line = f'  {tkr}: 등급(일) {grade:.1f} | 평가 {ret:+.1f}% | 당일 {day_chg:+.1f}%'
        if grade < 8.0:                       # 등급 8 아래 → 상태 리셋(다음 8돌파 때 1차부터)
            reset = bands.pop(tkr, None) is not None
            print(line + (' → 8 아래, 상태 리셋' if reset else ' → 등급<8')); continue
        if ret <= 0:                          # 손실 중 고쏠림은 익절 신호 아님(바닥 신호일 수 있음)
            print(line + ' → 고쏠림이나 수익 중 아님(무시)'); continue
        band, phrase = _tp_ladder(grade, day_chg)
        if bands.get(tkr) == band:            # 같은 밴드 반복 억제(한 방 익절 방지)
            print(line + f' → 이미 {band} 발화(중복 억제)'); continue
        bands[tkr] = band
        avg_txt = f'{avg:,.0f}' if avg else 'N/A'
        out.append(f"🔔 익절 신호 — {tkr}\n"
                   f"- 개미지수(일) {grade:.1f} / 평가 {ret:+.1f}% (평단 {avg_txt} → 현재 {cur:,.0f})\n"
                   f"- {phrase}\n"
                   f"- 당일 {day_chg:+.1f}%")
        print(line + f' → 발화[{band}]')
    return out

# ---------------------------------------------------------------
def calendar():
    print('\n■ 6. 캘린더')
    today = dt.date.today()
    ev = [(dt.date(2026,7,16),'한은 금통위'), (dt.date(2026,7,28),'FOMC(~29)'),
          (dt.date(2026,8,6),'SPCX Q2 실적(예상) → +2거래일 락업 20% 해제'),
          (dt.date(2026,12,8),'SPCX 락업 전체 해제 완료')]
    for d,name in ev:
        dd = (d-today).days
        if dd >= -1: print(f'  D{dd:+d}  {d.strftime("%m/%d")}  {name}')

class _Tee:
    """stdout을 콘솔+로그파일 동시 출력 — 실행마다 logs/날짜_시각.txt 축적(등급 경계 재검증용)."""
    def __init__(self, *streams): self.streams = streams
    def write(self, d):
        for s in self.streams:
            try: s.write(d)
            except Exception: pass
    def flush(self):
        for s in self.streams:
            try: s.flush()
            except Exception: pass

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'
    _logdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'logs')
    os.makedirs(_logdir, exist_ok=True)
    _logpath = os.path.join(_logdir, f'{dt.datetime.now():%Y-%m-%d_%H%M}_{cmd}.txt')
    _logf = open(_logpath, 'a', encoding='utf-8')
    sys.stdout = _Tee(sys.__stdout__, _logf)
    print(f'=== 도진 퀀트 데일리 체크 — {dt.date.today()} ({dt.datetime.now():%H:%M} KST) ===')
    if cmd == 'alert':
        alerts(); sys.exit(0)
    if cmd == 'tp':          # 익절 트리거 수동 확인(상태 저장 안 함 — 실제 state 무오염)
        for b in _take_profit(_load_state()): print('\n' + b)
        sys.exit(0)
    if cmd in ('all','ant'):
        ant_index(metric=os.environ.get('ANT_METRIC','vol'))
        try:  # 하이닉스 등급 한 줄 (KORU 최대비중 24.65%)
            h = yf.download('000660.KS', start='2024-06-01', auto_adjust=False, progress=False)
            if isinstance(h.columns, pd.MultiIndex): h.columns = h.columns.get_level_values(0)
            gd = _grade(h['Volume'], 40).iloc[-1]
            gw = _grade(h['Volume'].resample('W-FRI').sum().dropna(), 40).iloc[-1]
            print(f'  (참고) SK하이닉스: 일단위 {gd:.1f} / 주단위 {gw:.1f}')
        except Exception: pass
    if cmd in ('all','decay'): koru_decay()
    if cmd in ('all','edgar'): spcx_edgar()
    if cmd in ('all','short'): spcx_short()
    if cmd in ('all','kshort'):krx_short()
    if cmd in ('all','dart'):  opendart()
    if cmd in ('all','fomc'):  fomc()
    if cmd in ('all','macro'): macro()
    if cmd == 'all':           calendar()
