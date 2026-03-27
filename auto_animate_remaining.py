#!/usr/bin/env python3
"""
auto_animate_remaining.py — 애니메이션 미완성 33종 몬스터 일괄 큐잉
PixelLab API 직접 호출, 슬롯 한도 자동 대기
사용법: python auto_animate_remaining.py
"""
import requests, time, json, sys
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

API_KEY = 'a7460d9a-bf97-451b-82cc-d3ca4a0f7617'
BASE_URL = 'https://api.pixellab.ai'
HEADERS = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# 세션 재사용으로 소켓 고갈 방지
session = requests.Session()
session.headers.update(HEADERS)
retry_strategy = Retry(total=5, backoff_factor=2,
                       status_forcelist=[429, 500, 502, 503, 504])
adapter = HTTPAdapter(max_retries=retry_strategy, pool_maxsize=2, pool_connections=2)
session.mount('https://', adapter)

# humanoid 필수 애니메이션 4종
HUMANOID_ANIMS = ['breathing-idle', 'walking-4-frames', 'cross-punch', 'taking-punch']
# dog(quadruped) 템플릿 애니메이션 3종
DOG_ANIMS = ['idle', 'walk-4-frames', 'bark']

# 33종 몬스터: (etype, name, character_id, anim_list)
MONSTERS = [
    # === ch3 부식의 숲 사도 (et35~39) ===
    (35, '야수사도',      '59fa9855-42bf-4c97-b758-19a26d1b302d', HUMANOID_ANIMS),
    (36, '뱀사도',        '2f5a7cea-18c4-4963-85c1-3fb64c2c239e', HUMANOID_ANIMS),
    (37, '포식사도',      '8eafaf21-2806-4e49-a66b-5b1dd83d0e0b', HUMANOID_ANIMS),
    (38, '번식사도',      '1a7ad229-7c37-4dfb-a773-5716f2ae80a4', HUMANOID_ANIMS),
    (39, '야생대사도',    'fa65219d-a2f0-4597-b265-4b7b0407e2b2', HUMANOID_ANIMS),
    # === ch5 심해 (et60~69) ===
    (60, '심해보행자',    '8df139d5-aeb6-4fbc-9755-eb45dd9460a0', HUMANOID_ANIMS),
    (61, '아귀악마',      '6ca32217-f1c1-491f-916a-fbafa55223b9', HUMANOID_ANIMS),
    (62, '해파리사도',    'b5e2c693-5c11-40e3-9068-880345d136e4', HUMANOID_ANIMS),
    (63, '게공포',        '5732ed66-84b6-44a7-85d0-8d7de175f82f', HUMANOID_ANIMS),
    (64, '익사떼',        'ad253afc-7765-41aa-b09d-6d7e9b11b8b0', HUMANOID_ANIMS),
    (65, '뱀장어사도',    '09c56658-cec3-4260-8692-dc5cd01a549b', HUMANOID_ANIMS),
    (66, '산호공포',      'f207c06d-da90-4a0e-b266-5d2251a0a837', HUMANOID_ANIMS),
    (67, '세이렌사도',    'e2e21af3-0c56-4a4e-a0a8-ed0eae344e3f', HUMANOID_ANIMS),
    (68, '심연어',        '655de46e-e797-4200-8a94-1df6ca7059c5', HUMANOID_ANIMS),
    (69, '심연대사도',    'ef8092dd-cb2d-485e-9e1f-77656538c22e', HUMANOID_ANIMS),
    # === ch6 화염 (et70~79) ===
    (70, '화염보행',      'dc707f72-8873-4f8d-b6ea-6a6be5030aed', HUMANOID_ANIMS),
    (71, '화산악마',      'e55cb680-ab93-4f48-aada-cd705d921d22', HUMANOID_ANIMS),
    (72, '용암슬라임',    '53de6959-f236-45fd-858e-984cf2fdaabe', HUMANOID_ANIMS),
    (73, '화염박쥐',      'c6065a7a-58f3-4131-9003-5c63de52c6d2', HUMANOID_ANIMS),
    (74, '흑요석기사',    'bd8e715e-dd18-4f41-ac94-2a49c84611a0', HUMANOID_ANIMS),
    (75, '화염뱀',        '2bdcafdb-d69f-402f-bcc2-0c6a1f7c858a', HUMANOID_ANIMS),
    (76, '재떼',          '9eb210f3-b2a3-4b0b-91e1-3b6b9ef4ebb7', HUMANOID_ANIMS),
    (77, '용암거인',      '836c676f-2544-4f16-8552-e2efe362bc6e', HUMANOID_ANIMS),
    (78, '화염사제',      '4dd5b9a9-279e-4489-a07e-59aad62e63ee', HUMANOID_ANIMS),
    (79, '용사도',        '6964333f-4a6e-444d-bc66-a15a57a26424', HUMANOID_ANIMS),
    # === 가죽 (et80~84) ===
    (80, '벌레가죽',      '4f05ab7f-c0ad-4ede-9a42-f3f5ceedd069', HUMANOID_ANIMS),
    (81, '얼음가죽',      'ef8bf5fa-0546-4dbe-9c85-09768da3d526', HUMANOID_ANIMS),
    (82, '용암가죽',      '0118fccf-e5fc-43bb-919a-fda3fffc6c80', HUMANOID_ANIMS),
    (83, '심연가죽',      '52addfdc-e66e-4ea5-8db6-14d34e1c8ee8', HUMANOID_ANIMS),
    (84, '빛가죽',        '3649fbdf-6a24-498c-a623-17a05a99e803', HUMANOID_ANIMS),
    # === 구울 (et100~102) ===
    (100, '소형구울',     'bd186162-d6f8-411a-857e-b33dbfc47f1b', DOG_ANIMS),
    (101, '중형구울',     '6a8d6737-ad13-4e8c-a7d9-593eda18443b', HUMANOID_ANIMS),
    (102, '대형구울',     '13e472ec-c7fa-4cbd-8e9f-4f2d437de89c', HUMANOID_ANIMS),
]

def get_character(char_id):
    """캐릭터 상세 조회 — 완료된 애니메이션 목록 리턴"""
    try:
        r = session.get(f'{BASE_URL}/mcp/characters/{char_id}')
        if not r.ok:
            return set()
        data = r.json()
        done = set()
        for anim in data.get('animations', []):
            done.add(anim.get('animation_name', ''))
        return done
    except requests.ConnectionError:
        print('    (연결 에러, 10초 대기 후 재시도)')
        time.sleep(10)
        return set()

def animate(char_id, anim_id):
    payload = {
        'character_id': char_id,
        'template_animation_id': anim_id
    }
    try:
        r = session.post(f'{BASE_URL}/v2/animate-character', json=payload)
        return r.ok, r.text
    except requests.ConnectionError as e:
        return False, f'ConnectionError: {e}'

def get_balance():
    try:
        r = session.get(f'{BASE_URL}/v1/balance')
        if r.ok:
            return r.json()
    except Exception:
        pass
    return None

def main():
    bal = get_balance()
    print(f'잔액: {bal}')
    print()

    # 이미 완료된 애니는 스킵
    tasks = []
    for etype, name, char_id, anims in MONSTERS:
        done = get_character(char_id)
        needed = [a for a in anims if a not in done]
        if needed:
            tasks.append((etype, name, char_id, needed))
        else:
            print(f'  ✅ et{etype} {name} — 전부 완료, 스킵')
        time.sleep(0.5)  # API 부하 방지

    total_anims = sum(len(t[3]) for t in tasks)
    print(f'\n미완성 몬스터: {len(tasks)}종, 필요 애니메이션: {total_anims}개')
    print('=' * 60)

    total_queued = 0
    total_skipped = 0
    total_failed = 0

    for etype, name, char_id, anims in tasks:
        print(f'\n[et{etype:3d}] {name} ({char_id[:8]}...) — 필요: {anims}')

        for anim in anims:
            retries = 0
            while retries < 60:  # 최대 20분 대기
                ok, resp = animate(char_id, anim)
                if ok:
                    print(f'  ✅ {anim}', flush=True)
                    total_queued += 1
                    time.sleep(2)
                    break
                elif 'ConnectionError' in resp:
                    if retries == 0:
                        print(f'  🔌 {anim} — 연결 에러, 재시도', end='', flush=True)
                    time.sleep(15)
                    retries += 1
                    if retries % 2 == 0:
                        print('.', end='', flush=True)
                elif ('Insufficient job slots' in resp or 'slots' in resp.lower()
                      or 'Failed to start' in resp):
                    if retries == 0:
                        print(f'  ⏳ {anim} — 슬롯 대기', end='', flush=True)
                    time.sleep(20)
                    retries += 1
                    if retries % 3 == 0:
                        print('.', end='', flush=True)
                elif 'already exists' in resp.lower() or 'duplicate' in resp.lower():
                    print(f'  ⏭️ {anim} — 이미 존재')
                    total_skipped += 1
                    break
                elif 'Insufficient generations' in resp or 'insufficient' in resp.lower():
                    print(f'\n❌ 크레딧 소진! 중단.')
                    print(f'\n큐잉: {total_queued} | 스킵: {total_skipped} | 실패: {total_failed}')
                    sys.exit(1)
                else:
                    print(f'  ❌ {anim} — {resp[:200]}')
                    total_failed += 1
                    break
            else:
                print(f' 타임아웃')
                total_failed += 1

    print(f'\n{"=" * 60}')
    print(f'=== 완료 ===')
    print(f'큐잉: {total_queued}개')
    print(f'스킵: {total_skipped}개')
    print(f'실패: {total_failed}개')
    bal = get_balance()
    print(f'잔액: {bal}')

if __name__ == '__main__':
    main()
