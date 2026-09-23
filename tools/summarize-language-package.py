"""Summarize the isolated language EXE run; optionally verify every final file."""
import hashlib
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = (ROOT / os.environ.get('EXODUSER_QA_OUTPUT', 'output/language_package_20260923')).resolve()
APP = (ROOT / os.environ.get('EXODUSER_QA_PACKAGE', 'out/EXODUSER-languages-20260923')).resolve()
assert OUT.is_relative_to((ROOT / 'output').resolve()), 'Evidence must stay under output'
assert APP.is_relative_to((ROOT / 'out').resolve()), 'Package must stay under out'

def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

if '--collect-runtime-artifacts' in sys.argv:
    destination = OUT / 'runtime-artifacts'
    moved = []
    for relative in ['Dictionaries/en-US-10-1.bdic', 'Dictionaries/ko-3-0.bdic', 'package.nw/oauth-debug.log']:
        source, target = APP / relative, destination / relative
        if not source.exists():
            continue
        assert source.is_file() and not source.is_symlink() and not target.exists(), relative
        target.parent.mkdir(parents=True, exist_ok=True)
        source.rename(target)
        moved.append(relative)
    if moved:
        (OUT / 'runtime-artifacts.json').write_text(json.dumps(moved, indent=2) + '\n', encoding='utf-8')

runtime = read(OUT / 'runtime.json') if (OUT / 'runtime.json').exists() else {}
manifest = read(APP / 'language-package-manifest.json')
summary = {
    'sourceCommit': manifest['sourceCommit'],
    'phase': runtime.get('phase', 'starting'),
    'counts': {key: len(runtime.get(key, [])) for key in
               ['lobby', 'tutorials', 'languages', 'deathScreens', 'restartMatrix', 'details']},
    'failure': runtime.get('failure'),
    'errors': runtime.get('errors', []),
    'resourceErrors': runtime.get('resourceErrors', []),
    'settingsOverflow': {row['code']: row['overflow'] for row in runtime.get('languages', []) if row.get('overflow')},
    'collectedRuntimeArtifacts': read(OUT / 'runtime-artifacts.json') if (OUT / 'runtime-artifacts.json').exists() else [],
}
if '--integrity' in sys.argv:
    assert summary['phase'] == 'complete', summary
    assert not summary['failure'] and not summary['errors'] and not summary['resourceErrors'], summary
    assert all(count == 29 for count in summary['counts'].values()), summary['counts']
    if runtime.get('storyTracks'):
        assert len(runtime['storyTracks']) == 29
        assert all(row['cues'] == row['activeCuesVerified'] == 22 and row['mode'] == 'showing' for row in runtime['storyTracks'])
        playback = runtime['storyPlayback']
        assert playback['seen'] and playback['ended'] and playback['frames'] >= 100 and playback['maxTime'] >= 90 and playback['audioBytes'] > 0
        summary['story'] = {'tracks': 29, 'cuesPerTrack': 22, 'playback': playback}
    assert runtime['freshSettings'] is None, 'Expected an isolated fresh profile'
    for key in ['freshGame', 'existingGame', 'restart']:
        assert runtime[key]['actual'] == runtime[key]['expected'], key
    for key in ['lobby', 'languages', 'restartMatrix']:
        rows = runtime[key]
        assert len({row['code'] for row in rows}) == 29, key
        assert all(row['actual'] == row['code'] == row['stored'] for row in rows), key
    for row in runtime['languages']:
        if row['pet']['expected']:
            assert row['pet']['display'] == row['pet']['expected'], row['code']
    restored = read(OUT / 'manifest-restored.json')
    assert restored['restored'] and restored['serverRestored'] and restored['probeRemoved'], restored
    expected = {'language-package-manifest.json'}
    for key, prefix in [('applicationFiles', 'package.nw/'), ('runtimeFiles', '')]:
        for entry in manifest[key]:
            relative = prefix + entry['path']
            expected.add(relative)
            target = APP / relative
            with target.open('rb') as stream:
                digest = hashlib.file_digest(stream, 'sha256').hexdigest()
            assert target.stat().st_size == entry['bytes'] and digest == entry['sha256'], relative
    actual = {p.relative_to(APP).as_posix() for p in APP.rglob('*') if p.is_file()}
    assert actual == expected, {'extra': sorted(actual - expected), 'missing': sorted(expected - actual)}
    summary['restoration'] = restored
    summary['integrity'] = {'status': 'PASS', 'files': len(expected) - 1,
                            'applicationFiles': len(manifest['applicationFiles']),
                            'runtimeFiles': len(manifest['runtimeFiles'])}
    (OUT / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(summary, ensure_ascii=False, indent=2))
