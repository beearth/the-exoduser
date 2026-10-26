"""Derive the opt-in regional caption oracle without changing the baseline oracle."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
source = root / 'caption-font-plan.json'
output = root / 'caption-font-plan-regional.json'
resources = {
    'zh': 'Art/fonts/NotoSerifCJKsc-Regular',
    'zht': 'Art/fonts/NotoSerifCJKtc-Regular',
    'ja': 'Art/fonts/NotoSerifCJKjp-Regular',
    'th': 'Art/fonts/NotoSerifThai-Regular',
}
plan = json.loads(source.read_text(encoding='utf-8'))
assert plan['languageCount'] == len(plan['rows']) == 29
rows = {row['code']: row for row in plan['rows']}
assert len(rows) == 29
for code, resource in resources.items():
    row = rows[code]
    assert row['cueCount'] == 32 and row['nanumMissing'] and not row['notoFallbackEligible']
    row['fontResource'] = resource
resolved = [row['code'] for row in plan['rows'] if not row['nanumMissing'] or row['notoFallbackEligible'] or row.get('fontResource')]
unresolved = [row['code'] for row in plan['rows'] if row['code'] not in resolved]
assert len(resolved) == 28 and unresolved == ['ar'], (resolved, unresolved)
output.write_text(json.dumps(plan, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(output)
print('resolved=', len(resolved), 'unresolved=', unresolved)
