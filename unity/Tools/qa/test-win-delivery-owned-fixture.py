#!/usr/bin/env python3
"""Tiny offline owned fixtures only; never points at real build/app/media."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import zipfile

TOOL = Path(__file__).with_name('win_delivery.py')
spec = importlib.util.spec_from_file_location('delivery', TOOL)
d = importlib.util.module_from_spec(spec)
spec.loader.exec_module(d)


def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()


def write_json(p, value):
    p.write_text(json.dumps(value) + '\n')


def call(*args, good=True):
    p = subprocess.run([sys.executable, str(TOOL), *map(str, args)], capture_output=True, text=True)
    assert (p.returncode == 0) == good, (p.returncode, p.stdout, p.stderr)
    return {'exitCode': p.returncode, 'stdout': p.stdout, 'stderr': p.stderr}


def fixture(parent):
    parent.mkdir()
    build = parent / 'build'
    build.mkdir()
    for name in d.REQUIRED + [d.DATA + '/Plugins/x86_64/tiny.dll', 'D3D12/tiny.dll', d.EXCLUDE + '/symbols.pdb', 'Other_BackUpThisFolder_ButDontShipItWithYourGame/keep.txt']:
        p = build / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(('owned-tiny:' + name).encode())
    (build / 'empty-plugin-dir').mkdir()
    inputs = parent / 'build-input-manifest.json'
    write_json(inputs, {'fixtureOnly': True})
    receipt = parent / 'build-receipt.json'
    write_json(receipt, {'passed': True, 'result': 'Succeeded', 'errors': 0, 'target': 'StandaloneWindows64', 'architecture': 'x64', 'settingsQa': False, 'uiQa': False, 'engine': '6000.6.7f1', 'identifier': 'com.ForDearGamers.EXODUSER----Unity-----------------', 'output': str(build / d.EXE), 'fixtureOnly': True})
    source = parent / 'source-identity.json'
    write_json(source, {'sourceSha': 'a' * 40, 'unityVersion': '6000.6.7f1', 'buildReceiptSha256': digest(receipt), 'buildInputManifestPath': str(inputs), 'buildInputManifestSha256': digest(inputs), 'fixtureOnly': True})
    media = parent / 'media-identity.json'
    originals = parent / 'originals'
    originals.mkdir()
    movies = []
    for i, name in enumerate(d.MOVIES):
        original = originals / ('original-' + str(i) + '.mp4')
        original.write_bytes((build / name).read_bytes())
        movies.append({'path': name, 'sourcePath': str(original), 'bytes': original.stat().st_size, 'sha256': digest(original)})
    write_json(media, {'files': movies, 'fixtureOnly': True})
    prep = parent / 'prepare'
    call('prepare', '--build-root', build, '--source-identity', source, '--build-receipt', receipt, '--media-identity', media, '--output', prep)
    return build, prep


def pack_args(prep, out):
    return ['pack', '--manifest', prep / 'manifest.json', '--reviewed-manifest-sha256', digest(prep / 'manifest.json'), '--output', out]


def main():
    a = argparse.ArgumentParser()
    a.add_argument('--output', required=True)
    root = d.absolute(a.parse_args().output, new=True)
    root.mkdir()
    results = []
    build, prep = fixture(root / 'success')
    packed = prep.parent / 'packed'
    results.append({'test': 'prepare-pack-complete', **call(*pack_args(prep, packed))})
    archive = packed / 'package.zip'
    tree = prep.parent / 'received-tree'
    tree.mkdir()
    # This is our just-verified tiny archive, not an arbitrary receiver archive.
    with zipfile.ZipFile(archive) as z:
        assert d.EXCLUDE + '/symbols.pdb' not in z.namelist()
        assert 'Other_BackUpThisFolder_ButDontShipItWithYourGame/keep.txt' in z.namelist()
        assert 'empty-plugin-dir/' in z.namelist()
        z.extractall(tree)
    results.append({'test': 'received-zip-and-full-tree', **call('verify', '--archive', archive, '--manifest', packed / 'manifest.json', '--pack-receipt', packed / 'pack-receipt.json', '--tree', tree, '--output', prep.parent / 'verified')})
    results.append({'test': 'refuse-existing-output', **call(*pack_args(prep, packed), good=False)})
    # Change bytes in an extracted tiny fixture and retain the before bytes separately.
    changed = tree / d.DATA / 'Plugins/x86_64/tiny.dll'
    (root / 'received-plugin-before.bin').write_bytes(changed.read_bytes())
    changed.write_bytes(b'changed-owned-fixture')
    results.append({'test': 'received-content-change-detected', **call('verify', '--archive', archive, '--manifest', packed / 'manifest.json', '--pack-receipt', packed / 'pack-receipt.json', '--tree', tree, '--output', prep.parent / 'verify-changed', good=False)})
    build, prep = fixture(root / 'source-change')
    changed = build / 'UnityPlayer.dll'
    (prep.parent / 'UnityPlayer-before.preserved').write_bytes(changed.read_bytes())
    changed.write_bytes(b'live-owned-fixture-change')
    results.append({'test': 'live-source-content-change-detected', **call(*pack_args(prep, prep.parent / 'rejected-pack'), good=False)})
    assert not (prep.parent / 'rejected-pack/pack-receipt.json').exists()
    build, prep = fixture(root / 'source-missing')
    missing = build / d.DATA / 'Managed/Exoduser.Core.dll'
    missing.rename(prep.parent / 'missing-Core.preserved')
    results.append({'test': 'live-source-missing-file-detected', **call(*pack_args(prep, prep.parent / 'rejected-pack'), good=False)})
    assert (prep.parent / 'missing-Core.preserved').is_file()
    build, prep = fixture(root / 'symlink')
    (build / 'link.dll').symlink_to(build / 'UnityPlayer.dll')
    results.append({'test': 'live-source-symlink-rejected', **call(*pack_args(prep, prep.parent / 'rejected-pack'), good=False)})
    for bad in ['../x', '/x', 'C:/x', 'a\\b', 'a/../b', 'a//b', 'NUL.txt']:
        try:
            d.relative(bad)
        except ValueError:
            continue
        raise AssertionError('unsafe path accepted: ' + bad)
    results.append({'test': 'unsafe-relative-member-paths-rejected', 'count': 7})
    report = {'fixtureOnly': True, 'actualWindowsBuildOrTransferExecuted': False, 'allExpectedOutcomes': True, 'tests': results, 'fixtureFilesTotalBytes': sum(p.stat().st_size for p in root.rglob('*') if p.is_file()), 'preserved': True}
    write_json(root / 'test-receipt.json', report)
    print(json.dumps({'passed': True, 'tests': len(results), 'receipt': str(root / 'test-receipt.json')}))


if __name__ == '__main__':
    main()
