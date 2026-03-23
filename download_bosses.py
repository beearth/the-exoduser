#!/usr/bin/env python3
"""
download_bosses.py — PixelLab 보스 캐릭터 ZIP 다운로드 + img/bosses/ 추출
사용법: python download_bosses.py
"""
import os, sys, zipfile, shutil, subprocess

BASE = os.path.dirname(os.path.abspath(__file__))
BOSS_DIR = os.path.join(BASE, 'img', 'bosses')

# PixelLab character ID → 폴더명 매핑
# 빌드 스크립트의 BOSSES 배열과 폴더명 일치해야 함
CHAR_MAP = {
    # ── 1장 썩은 숲 ──
    'cff5daa1-c871-49ce-9c32-432738a75677': 'boss_si0_forest_watcher',
    'a0a4e68c-56da-4c12-96ac-46636bf9de4f': 'boss_si1_mushroom_giant',
    '58aa13c3-4e1a-49e2-936b-15a084c2ec03': 'boss_si2_forest_hunter',
    '14b3c407-d092-4083-b85f-c0e419d354f5': 'boss_si3_parasitic_tree',
    # ── 2장 벌레굴 ──
    '121292d0-b9ce-4f88-891b-10738f2b2fb7': 'boss_si4_worm_guard',
    'c73619fd-bd04-4b18-84ed-0cb09db43624': 'boss_si5_slime_beast',
    '162874ce-f514-4077-95a2-376510aa4a90': 'boss_si6_parasite_mother',
    '8353a6f7-caf0-465c-a994-3bd9f91314ab': 'boss_si7_egg_sac',
    'b985a1de-0195-4da6-8e83-70c7f56d7c0a': 'boss_si8_flesh_lord',
    '53a3a7c0-0e5f-40bb-9c76-2e0a955df846': 'boss_si9_queen_maggot',
    # ── 3장 얼음굴 ──
    '42c1e9fa-b0e0-43cd-99df-ef0657de215e': 'boss_si10_ice_wraith',
    '89a37326-5f0a-4e03-9d77-a82d4ad9ea0e': 'boss_si11_frost_knight',
    'de630e90-4ca5-4a4b-b47a-b0ccdfcff07a': 'boss_si12_frozen_guard',
    '1a9bd635-0306-44bd-98c6-3db2a4ad2159': 'boss_si13_sealed_ice',
    # ── 4장 화염지대 ──
    '1f92d781-b435-4ee3-94d6-6786b1c82aae': 'boss_si14_flame_demon',
    '252e3e15-9aeb-401e-8453-438326313fdf': 'boss_si15_fire_pillar',
    '6471e881-a4c6-4abc-a8e2-aa8ae49589bd': 'boss_si16_lava_heart',
    '2fd3c8db-6a82-4089-8b24-925e7fe20a5b': 'boss_si17_flame_warrior',
    '00b37385-d785-4ac6-894f-1c364bc68e47': 'boss_si18_twin_flame',
    '6fdbe9af-e54a-469d-bf5e-ddecc2364086': 'boss_si19_fire_bug_lord',
    'b04d0dcd-03af-424d-b6c5-b5db33af59af': 'boss_si20_flame_jailer',
    # ── 5장 지옥 군단 ──
    '55a9bb18-6bd9-4590-ab7c-a1753ddf4f0e': 'boss_si21_war_remnant',
    '332a4758-5a34-4f64-9c6b-1f76806041a3': 'boss_si22_bone_king',
    'c2fb4c54-7763-40d2-bfb0-6fbc614939e4': 'boss_si23_demon_commander',
    '658086fe-7dd2-467d-8e11-8e12c099d274': 'boss_si24_iron_knight',
    '67ebcdc0-6a73-49d6-ac74-90da2579cced': 'boss_si25_legion_commander',
    # ── 6장 사도의 마굴 ──
    # si26: 기존 boss_ch6_flesh 폴더에서 복사 (별도 처리)
    '0951644b-b8de-41f4-8832-31ce627e3577': 'boss_si27_bone_watcher',
    'c0cf9b14-e0c4-46a4-8df4-28af7ec6987e': 'boss_si28_twisted',
    '96279bb0-8389-4137-b648-01cdb6b2e9ad': 'boss_si29_tentacle_mother',
    'a1129084-6360-4711-85e6-712bfb93c1cb': 'boss_si30_imperfect_apostle',
    '436dd7d4-6659-4dda-8502-7b0f885e4bfd': 'boss_si31_grand_apostle',
    # ── 7장 지옥성 ──
    '2aaadbfe-de01-47d8-acdc-22a6118a4130': 'boss_si32_dark_guardian',
    '63eae882-1711-45b7-9f5f-9885225ac732': 'boss_si33_killu',
    'ae6c7740-cb0c-46d2-a9fd-9ce43349c62e': 'boss_si34_hell_lord',
}

def download_and_extract(char_id, folder_name):
    """ZIP 다운로드 → img/bosses/{folder_name}/ 추출"""
    url = f'https://api.pixellab.ai/mcp/characters/{char_id}/download'
    zip_path = os.path.join(BOSS_DIR, f'{folder_name}.zip')
    dest = os.path.join(BOSS_DIR, folder_name)

    # 이미 폴더가 있고 animations/ 하위에 파일이 있으면 스킵
    anim_dir = os.path.join(dest, 'animations')
    if os.path.isdir(anim_dir) and os.listdir(anim_dir) if os.path.isdir(anim_dir) else []:
        print(f'  [{folder_name}] 이미 존재, 스킵')
        return True

    print(f'  [{folder_name}] 다운로드 중... {char_id[:8]}')
    try:
        result = subprocess.run(
            ['curl', '--fail', '-sL', '-o', zip_path, url],
            capture_output=True, text=True, timeout=60
        )
        if result.returncode != 0:
            print(f'  [{folder_name}] 다운로드 실패 (HTTP 에러, 애니 미완료?)')
            if os.path.exists(zip_path):
                os.remove(zip_path)
            return False
    except subprocess.TimeoutExpired:
        print(f'  [{folder_name}] 다운로드 타임아웃')
        return False

    # ZIP 크기 확인
    if os.path.getsize(zip_path) < 1024:
        print(f'  [{folder_name}] ZIP 너무 작음 (에러 응답), 삭제')
        os.remove(zip_path)
        return False

    # 추출
    if os.path.isdir(dest):
        shutil.rmtree(dest)
    os.makedirs(dest, exist_ok=True)

    try:
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(dest)
        print(f'  [{folder_name}] ✅ 추출 완료')
        os.remove(zip_path)
        return True
    except zipfile.BadZipFile:
        print(f'  [{folder_name}] 잘못된 ZIP 파일')
        os.remove(zip_path)
        return False

def main():
    os.makedirs(BOSS_DIR, exist_ok=True)
    ok = 0
    fail = 0
    for char_id, folder in CHAR_MAP.items():
        if download_and_extract(char_id, folder):
            ok += 1
        else:
            fail += 1

    # si26: 기존 boss_ch6_flesh → boss_si26_flesh_guard 복사
    src26 = os.path.join(BOSS_DIR, 'boss_ch6_flesh')
    dst26 = os.path.join(BOSS_DIR, 'boss_si26_flesh_guard')
    if os.path.isdir(src26) and not os.path.isdir(dst26):
        shutil.copytree(src26, dst26)
        print('  [boss_si26_flesh_guard] ← boss_ch6_flesh 복사')
        ok += 1

    print(f'\n완료: {ok} 성공, {fail} 실패')

if __name__ == '__main__':
    main()
