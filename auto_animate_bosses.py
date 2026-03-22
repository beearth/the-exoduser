#!/usr/bin/env python3
"""
auto_animate_bosses.py — PixelLab API 직접 호출로 보스 애니메이션 일괄 큐잉
슬롯 한도(8 동시)를 자동 대기하며 처리
사용법: python auto_animate_bosses.py
"""
import requests, time, json, sys

API_KEY = 'a7460d9a-bf97-451b-82cc-d3ca4a0f7617'
BASE_URL = 'https://api.pixellab.ai'
HEADERS = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# 필요한 애니메이션 5종
ANIMS = ['breathing-idle', 'cross-punch', 'taking-punch', 'walking-4-frames', 'falling-back-death']
DIRECTIONS = ['south', 'east', 'north', 'west']

# 캐릭터별 필요 애니메이션 (이미 있는 것은 제외)
TASKS = [
    # si22 뼈산의 왕 — breathing-idle 완료, cross-punch/taking-punch 큐잉됨
    ('230b5638-1dfb-49dc-86d3-3b1956856640', 'si22 뼈산의 왕',
     ['walking-4-frames', 'falling-back-death']),
    # si23 악마 사령관
    ('c679b5ef-1899-4af1-8d19-cab6eb95be43', 'si23 악마 사령관', ANIMS),
    # si24 철벽 기사단장
    ('8365fc88-17be-4250-aa00-3be0d000a054', 'si24 철벽 기사단장', ANIMS),
    # si25 군단 지휘관
    ('ab65ec36-3ca9-40e5-a9bc-619a3d840a4c', 'si25 군단 지휘관', ANIMS),
    # si27 인간뼈 감시자
    ('3a2f9e11-d9f2-4360-a783-bf932ea72539', 'si27 인간뼈 감시자', ANIMS),
    # si28 뒤틀린 자
    ('aa962b10-4261-4305-b544-ebc9866a2329', 'si28 뒤틀린 자', ANIMS),
    # si29 촉수의 어미
    ('0a187d90-4771-40ef-8f13-83c347ca494e', 'si29 촉수의 어미', ANIMS),
    # si30 불완전 사도
    ('df60e20d-42c4-4db0-bc2d-5d4a7f5d6a8f', 'si30 불완전 사도', ANIMS),
    # si31 대사도
    ('9ad3dabb-b0cd-4df5-a0f5-5d99316b15a6', 'si31 대사도', ANIMS),
    # si33 Killu
    ('0591814b-158f-4552-a11b-defe1a7c92df', 'si33 Killu', ANIMS),
    # ── 기존 캐릭터 애니 보충 ──
    # si2 숲의 사냥꾼 (큐잉됐으나 미처리된 것들 재큐잉)
    ('58aa13c3-4e1a-49e2-936b-15a084c2ec03', 'si2 숲의 사냥꾼', ANIMS),
    # si3 숲의 기생수
    ('14b3c407-d092-4083-b85f-c0e419d354f5', 'si3 숲의 기생수', ANIMS),
    # si6 기생충 모체
    ('162874ce-f514-4077-95a2-376510aa4a90', 'si6 기생충 모체', ANIMS),
    # si8 살벽의 군주
    ('b985a1de-0195-4da6-8e83-70c7f56d7c0a', 'si8 살벽의 군주', ANIMS),
    # si20 화염 감옥지기
    ('b04d0dcd-03af-424d-b6c5-b5db33af59af', 'si20 화염 감옥지기', ANIMS),
    # si32 검은 성의 수호자
    ('2aaadbfe-de01-47d8-acdc-22a6118a4130', 'si32 검은 성의 수호자', ANIMS),
    # si34 지옥 군주 (128px)
    ('ae6c7740-cb0c-46d2-a9fd-9ce43349c62e', 'si34 지옥 군주', ANIMS),
    # si19 불벌레 군주 (부분)
    ('6fdbe9af-e54a-469d-bf5e-ddecc2364086', 'si19 불벌레 군주',
     ['cross-punch', 'taking-punch', 'falling-back-death']),
    # si21 전쟁의 잔해 (부분)
    ('55a9bb18-6bd9-4590-ab7c-a1753ddf4f0e', 'si21 전쟁의 잔해',
     ['breathing-idle', 'cross-punch', 'walking-4-frames', 'falling-back-death']),
]

def get_balance():
    r = requests.get(f'{BASE_URL}/v1/balance', headers=HEADERS)
    if r.ok:
        return r.json()
    return None

def get_character(char_id):
    """MCP 엔드포인트로 캐릭터 정보 조회"""
    r = requests.get(f'{BASE_URL}/mcp/characters/{char_id}', headers=HEADERS)
    if r.ok:
        return r.json()
    return None

def get_pending_jobs(char_id):
    """캐릭터의 pending job 수 확인"""
    info = get_character(char_id)
    if info and 'pending_jobs' in info:
        return len(info['pending_jobs'])
    return 0

def animate(char_id, anim_id):
    """MCP animate 엔드포인트 호출"""
    payload = {
        'character_id': char_id,
        'template_animation_id': anim_id
    }
    r = requests.post(f'{BASE_URL}/mcp/characters/{char_id}/animate',
                       headers=HEADERS, json=payload)
    return r.ok, r.text

def has_animation(char_id, anim_name):
    """캐릭터가 이미 해당 애니메이션을 가지고 있는지 확인"""
    info = get_character(char_id)
    if not info:
        return False
    anims = info.get('animations', [])
    for a in anims:
        if a.get('animation_name') == anim_name or a.get('template_animation_id') == anim_name:
            return True
    return False

def wait_for_slots(max_wait=600):
    """슬롯이 비을 때까지 대기 (최대 10분)"""
    waited = 0
    while waited < max_wait:
        # 간단한 테스트: 아무 animate 호출로 슬롯 확인
        time.sleep(10)
        waited += 10
        if waited % 30 == 0:
            print(f'    대기 중... {waited}초', flush=True)
        # 슬롯은 직접 확인할 방법이 없으므로 일정 시간 후 리턴
        if waited >= 30:
            return True
    return True

def main():
    bal = get_balance()
    print(f'잔액: {bal}')

    total_queued = 0
    total_skipped = 0
    total_failed = 0

    for char_id, name, anims in TASKS:
        print(f'\n[{name}] {char_id[:8]}...')

        for anim in anims:
            # 큐잉 시도 (실패하면 대기 후 재시도)
            retries = 0
            while retries < 10:
                ok, resp = animate(char_id, anim)
                if ok:
                    print(f'  ✅ {anim}', flush=True)
                    total_queued += 1
                    time.sleep(1)  # 연속 호출 간 1초 대기
                    break
                elif 'Insufficient job slots' in resp or 'slots' in resp.lower():
                    if retries == 0:
                        print(f'  ⏳ {anim} — 슬롯 대기...', end='', flush=True)
                    time.sleep(15)
                    retries += 1
                    print('.', end='', flush=True)
                elif 'already exists' in resp.lower() or 'duplicate' in resp.lower():
                    print(f'  ⏭️ {anim} — 이미 존재, 스킵')
                    total_skipped += 1
                    break
                elif 'Insufficient generations' in resp or 'insufficient' in resp.lower():
                    print(f'\n❌ 크레딧 소진! 중단.')
                    print(f'\n완료: {total_queued}개 큐잉, {total_skipped}개 스킵, {total_failed}개 실패')
                    sys.exit(1)
                else:
                    print(f'  ❌ {anim} — {resp[:100]}')
                    total_failed += 1
                    break
            else:
                print(f' 타임아웃')
                total_failed += 1

    print(f'\n=== 완료 ===')
    print(f'큐잉: {total_queued}개')
    print(f'스킵: {total_skipped}개')
    print(f'실패: {total_failed}개')

    bal = get_balance()
    print(f'잔액: {bal}')

if __name__ == '__main__':
    main()
