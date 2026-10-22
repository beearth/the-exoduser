# BOOT-01 (PC, 2026-10-22) — 진입 예열 목록 생성기.
# 입력: Godot --verbose 로그(로비 → 새 캐릭터 → 전사 이야기 → 진입). 시작/끝 표식 사이에서
#       메인 스레드(thread -1)가 동기로 끝낸 리소스 읽기만 뽑아 godot/data/native_boot_prewarm_manifest.json에 쓴다.
# 목록은 성능 힌트다. 빠지거나 낡아도 동작은 같고, 그 항목만 진입 중 동기로 읽힌다.
# 사용: python boot01_gen_prewarm_manifest.py <verbose.log> <out.json> [--start 정규식] [--end 정규식]
import argparse, json, re, datetime

ap = argparse.ArgumentParser()
ap.add_argument('log')
ap.add_argument('out')
ap.add_argument('--start', default=r'PROBE after_create')
ap.add_argument('--end', default=r'PROBE main_scene_current_ms')
a = ap.parse_args()
start, end = re.compile(a.start), re.compile(a.end)
on = False
seen, order = set(), []
pat = re.compile(r"^Completed load for: '([^']+)'.* at thread (-?\d+)")
for line in open(a.log, encoding='utf-8', errors='replace'):
    if not on and start.search(line):
        on = True
        continue
    if on and end.search(line):
        break
    if not on:
        continue
    m = pat.match(line.strip())
    if not m or m.group(2) != '-1':
        continue
    p = m.group(1)
    if p.startswith('res://.godot/') or p.endswith(('.gd', '.tscn', '.scn')):
        continue
    if p not in seen:
        seen.add(p)
        order.append(p)
doc = {
    'schema': 'fdg.native-boot-prewarm-manifest.v1',
    'purpose': 'BOOT-01 entry prewarm hint: resources main-thread-loaded during add_child(main); order = first load order',
    'generated': datetime.date.today().isoformat(),
    'generator': 'godot/tools/boot01_gen_prewarm_manifest.py',
    'count': len(order),
    'resources': order,
}
open(a.out, 'w', encoding='utf-8', newline='\n').write(json.dumps(doc, ensure_ascii=False, indent=1) + '\n')
print(len(order), 'resources ->', a.out)
