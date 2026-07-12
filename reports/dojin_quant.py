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
import pandas as pd, numpy as np, requests
import yfinance as yf

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
            tabs = pd.read_html(requests.get(url, headers=H_WEB, timeout=10).text)
            t = max(tabs, key=len).dropna(how='all')
            rows.append(t)
        t = pd.concat(rows)
        t.columns = ['날짜','종가','전일비','등락률','거래량','기관','외국인','보유주수','보유율'][:len(t.columns)]
        t = t.dropna(subset=['날짜']).drop_duplicates('날짜')
        t['date'] = pd.to_datetime(t['날짜'])
        for c in ['종가','기관','외국인']:
            t[c] = pd.to_numeric(t[c].astype(str).str.replace(',',''), errors='coerce')
        t = t.set_index('date').sort_index()
        indiv_qty = -(t['기관'] + t['외국인'])          # 수량 근사
        return (indiv_qty * t['종가']).rename('indiv'), '네이버 역산(근사)'
    except Exception as e:
        return None, f'실측 불가({e}) — KRX 계정(KRX_ID/KRX_PW) 설정 권장'

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
    def zone(g):
        return ('매수최적(3~5)' if 3<=g<5 else '보유(5~7)' if 5<=g<7 else
                '데드존·신규금지(7~9)' if 7<=g<9 else '극단·당일방향확인(9~10)' if g>=9 else '소진(0~3)')
    print(f'  기준: {metric}' + (f' [{src}]' if src else ''))
    print(f'  일단위 등급(40일): {gd:.1f} → {zone(gd)}')
    print(f'  주단위 등급(40주): {gw:.1f} → {zone(gw)}')
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
    return cur

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
def calendar():
    print('\n■ 6. 캘린더')
    today = dt.date.today()
    ev = [(dt.date(2026,7,16),'한은 금통위'), (dt.date(2026,7,28),'FOMC(~29)'),
          (dt.date(2026,8,6),'SPCX Q2 실적(예상) → +2거래일 락업 20% 해제'),
          (dt.date(2026,12,8),'SPCX 락업 전체 해제 완료')]
    for d,name in ev:
        dd = (d-today).days
        if dd >= -1: print(f'  D{dd:+d}  {d.strftime("%m/%d")}  {name}')

if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'
    print(f'=== 도진 퀀트 데일리 체크 — {dt.date.today()} ===')
    if cmd in ('all','ant'):   ant_index(metric=os.environ.get('ANT_METRIC','vol'))
    if cmd in ('all','decay'): koru_decay()
    if cmd in ('all','edgar'): spcx_edgar()
    if cmd in ('all','short'): spcx_short()
    if cmd in ('all','macro'): macro()
    if cmd == 'all':           calendar()
