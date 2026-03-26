#!/usr/bin/env python3
"""후보 캐릭터 176개 다운로드 → monsters/mon_104~"""
import requests, json, os

API_KEY = 'a7460d9a-bf97-451b-82cc-d3ca4a0f7617'
BASE = 'https://api.pixellab.ai'
H = {'Authorization': f'Bearer {API_KEY}'}

# 전체 캐릭터
all_chars = []
offset = 0
while True:
    r = requests.get(f'{BASE}/v2/characters?offset={offset}&limit=50', headers=H)
    d = r.json()
    chars = d.get('characters', [])
    all_chars.extend(chars)
    if len(all_chars) >= d.get('total', 0) or len(chars) == 0:
        break
    offset += 50

# 사용중 ID
monsters = 'G:/hell/img/all_assets/monsters'
used_ids = set()
for dd in os.listdir(monsters):
    meta = f'{monsters}/{dd}/metadata.json'
    if os.path.exists(meta):
        m = json.load(open(meta))
        cid = m.get('character', {}).get('id', '')
        if cid:
            used_ids.add(cid)
for i in range(100):
    meta = f'G:/hell/img/mobs/{i}/metadata.json'
    if os.path.exists(meta):
        m = json.load(open(meta))
        cid = m.get('character', {}).get('id', '')
        if cid:
            used_ids.add(cid)
for dd in os.listdir('G:/hell/img/bosses'):
    meta = f'G:/hell/img/bosses/{dd}/metadata.json'
    if os.path.exists(meta):
        m = json.load(open(meta))
        cid = m.get('character', {}).get('id', '')
        if cid:
            used_ids.add(cid)

candidates = [c for c in all_chars if c['id'] not in used_ids]
print(f'후보 {len(candidates)}개 다운로드 시작')

num = 104
for c in candidates:
    cid = c['id']
    raw_name = c.get('name', 'unknown')
    safe_name = raw_name.replace('/', '_').replace('\\', '_').replace(':', '_').replace('"', '_')
    # 너무 긴 이름 자르기
    if len(safe_name) > 40:
        safe_name = safe_name[:40]
    size = c.get('size', {}).get('width', 48)

    folder = f'{monsters}/mon_{num:03d}_{safe_name}'
    os.makedirs(f'{folder}/rotations', exist_ok=True)
    os.makedirs(f'{folder}/animations', exist_ok=True)

    r2 = requests.get(f'{BASE}/v2/characters/{cid}', headers=H)
    if r2.status_code != 200:
        print(f'  #{num} {safe_name}: 조회 실패 ({r2.status_code})')
        num += 1
        continue

    detail = r2.json()

    meta = {'character': {'id': cid, 'name': raw_name, 'size': {'width': size, 'height': size}}}
    with open(f'{folder}/metadata.json', 'w', encoding='utf-8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

    rot_urls = detail.get('rotation_urls', {})
    for direction, url in rot_urls.items():
        if url:
            try:
                img = requests.get(url, timeout=15)
                if img.status_code == 200:
                    with open(f'{folder}/rotations/{direction}.png', 'wb') as f:
                        f.write(img.content)
            except:
                pass

    print(f'  #{num} {safe_name} ({size}px) OK', flush=True)
    num += 1

print(f'\n완료: mon_104 ~ mon_{num-1} ({num-104}개)')
