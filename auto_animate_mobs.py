#!/usr/bin/env python3
"""
auto_animate_mobs.py — 일반 몬스터(etype 0~89) 미완성 애니메이션 일괄 큐잉
PixelLab API 직접 호출, 슬롯 한도 자동 대기
사용법: python auto_animate_mobs.py
"""
import requests, time, json, sys, os

API_KEY = 'a7460d9a-bf97-451b-82cc-d3ca4a0f7617'
BASE_URL = 'https://api.pixellab.ai'
HEADERS = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json'
}

# 일반 몬스터 필수 애니메이션 4종
REQUIRED = ['breathing-idle', 'cross-punch', 'taking-punch', 'walking-4-frames']

def get_balance():
    r = requests.get(f'{BASE_URL}/v1/balance', headers=HEADERS)
    if r.ok:
        return r.json()
    return None

def animate(char_id, anim_id):
    payload = {
        'character_id': char_id,
        'template_animation_id': anim_id
    }
    r = requests.post(f'{BASE_URL}/v2/animate-character',
                       headers=HEADERS, json=payload)
    return r.ok, r.text

def build_tasks():
    """img/mobs/0~89 폴더를 스캔하여 미완성 애니메이션 목록 생성"""
    tasks = []
    for i in range(90):
        meta_path = f'G:/hell/img/mobs/{i}/metadata.json'
        anim_dir = f'G:/hell/img/mobs/{i}/animations'
        if not os.path.exists(meta_path):
            continue
        m = json.load(open(meta_path))
        char_id = m.get('character', {}).get('id', '')
        name = m.get('character', {}).get('name', f'etype{i}')
        if not char_id:
            continue
        existing = set(os.listdir(anim_dir)) if os.path.exists(anim_dir) else set()
        needed = [a for a in REQUIRED if a not in existing]
        if needed:
            tasks.append((i, char_id, name, needed))
    return tasks

def main():
    bal = get_balance()
    print(f'잔액: {bal}')

    tasks = build_tasks()
    total_anims = sum(len(t[3]) for t in tasks)
    print(f'미완성 몬스터: {len(tasks)}종, 필요 애니메이션: {total_anims}개')
    print()

    total_queued = 0
    total_skipped = 0
    total_failed = 0

    for etype, char_id, name, anims in tasks:
        print(f'\n[etype {etype:2d}] {name} ({char_id[:8]}...) — 필요: {anims}')

        for anim in anims:
            retries = 0
            while retries < 20:
                ok, resp = animate(char_id, anim)
                if ok:
                    print(f'  ✅ {anim}', flush=True)
                    total_queued += 1
                    time.sleep(1)
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
                    print(f'  ❌ {anim} — {resp[:150]}')
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
