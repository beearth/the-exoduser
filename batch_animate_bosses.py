#!/usr/bin/env python3
"""
batch_animate_bosses.py — PixelLab 보스 캐릭터 애니메이션 일괄 큐잉
슬롯 한도(8 동시)를 고려해 대기하며 순차 큐잉
사용법: python batch_animate_bosses.py
"""
import subprocess, json, time, sys

# 필요한 애니메이션 5종
ANIMS = ['breathing-idle', 'cross-punch', 'taking-punch', 'walking-4-frames', 'falling-back-death']

# 캐릭터 ID → 이름 매핑 (애니메이션 필요한 전체 목록)
CHARACTERS = {
    # ── 기존 캐릭터 (부분 애니 필요) ──
    # si12 얼어붙은 감시자 (cross-punch 실패분)
    'de630e90-4ca5-4a4b-b47a-b0ccdfcff07a': 'si12 얼어붙은 감시자',
    # si20 화염 감옥지기 (cross-punch 실패분)
    'b04d0dcd-03af-424d-b6c5-b5db33af59af': 'si20 화염 감옥지기',
    # si22 뼈산의 왕 (breathing-idle만 성공)
    '230b5638-1dfb-49dc-86d3-3b1956856640': 'si22 뼈산의 왕',
    # ── 신규 캐릭터 (전체 애니 필요) ──
    'c679b5ef-1899-4af1-8d19-cab6eb95be43': 'si23 악마 사령관',
    '8365fc88-17be-4250-aa00-3be0d000a054': 'si24 철벽 기사단장',
    'ab65ec36-3ca9-40e5-a9bc-619a3d840a4c': 'si25 군단 지휘관',
    '3a2f9e11-d9f2-4360-a783-bf932ea72539': 'si27 인간뼈 감시자',
    'aa962b10-4261-4305-b544-ebc9866a2329': 'si28 뒤틀린 자',
    '0a187d90-4771-40ef-8f13-83c347ca494e': 'si29 촉수의 어미',
    'df60e20d-42c4-4db0-bc2d-5d4a7f5d6a8f': 'si30 불완전 사도',
    '9ad3dabb-b0cd-4df5-a0f5-5d99316b15a6': 'si31 대사도',
    '0591814b-158f-4552-a11b-defe1a7c92df': 'si33 Killu',
    # si10/si14: 기존 atlas에 있지만 애니 보충 필요
    '42c1e9fa-b0e0-43cd-99df-ef0657de215e': 'si10 얼음 망령',
    '1f92d781-b435-4ee3-94d6-6786b1c82aae': 'si14 화염 악마',
}

def call_claude_mcp(char_id, anim_id):
    """MCP를 통해 animate_character 호출 (claude CLI)"""
    # 직접 PixelLab API를 호출하는 대신, 상태만 출력
    print(f'  큐잉: {char_id[:8]}... → {anim_id}')
    return True

def get_char_anims(char_id):
    """캐릭터의 기존 애니메이션 목록 확인 (get_character 대체)"""
    # 이 함수는 실제로 MCP 호출이 필요하므로 수동으로 확인해야 함
    return set()

def main():
    print('=== PixelLab 보스 애니메이션 배치 큐잉 ===')
    print(f'대상: {len(CHARACTERS)}개 캐릭터 × {len(ANIMS)}개 애니 = 최대 {len(CHARACTERS)*len(ANIMS)}건')
    print()
    print('이 스크립트는 참조용입니다.')
    print('실제 큐잉은 Claude Code에서 MCP 도구로 수행하세요.')
    print()

    # 큐잉 순서 출력
    for char_id, name in CHARACTERS.items():
        print(f'\n[{name}] {char_id}')
        for anim in ANIMS:
            print(f'  animate_character(character_id="{char_id}", template_animation_id="{anim}")')

if __name__ == '__main__':
    main()
