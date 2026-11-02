#!/usr/bin/env python3
"""Offline prepare -> reviewed manifest -> pack -> receiver verify. No build/network/launch."""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath, PureWindowsPath
import re
import stat
import sys
import unicodedata
import zipfile

EXCLUDE = 'EXODUSER-Unity_BackUpThisFolder_ButDontShipItWithYourGame'
EMBEDDED = 'DELIVERY-MANIFEST.json'
EXE = 'EXODUSER-Unity.exe'
DATA = 'EXODUSER-Unity_Data'
MOVIES = [DATA + '/StreamingAssets/Lobby/world_intro_v22b_steam.mp4', DATA + '/StreamingAssets/Lobby/warrior_story_v23_clean.mp4']
REQUIRED = [EXE, 'UnityPlayer.dll', DATA + '/globalgamemanagers', DATA + '/Managed/Exoduser.Runtime.dll', DATA + '/Managed/Exoduser.Core.dll'] + MOVIES
RESERVED = {'CON', 'PRN', 'AUX', 'NUL'} | {p + str(i) for p in ('COM', 'LPT') for i in range(1, 10)}
CHUNK = 1024 * 1024


def demand(condition, message):
    if not condition:
        raise ValueError(message)


def absolute(value, kind='any', new=False):
    p = Path(value)
    demand(p.is_absolute(), 'Absolute path required: ' + str(p))
    demand('..' not in p.parts and '.' not in p.parts, 'Dot path rejected: ' + str(p))
    # Reject symlinks in every existing component, not only the leaf.
    current = Path(p.anchor)
    for part in p.parts[1:]:
        current = current / part
        if os.path.lexists(current):
            demand(not stat.S_ISLNK(current.lstat().st_mode), 'Symlink rejected: ' + str(current))
    if new:
        demand(not os.path.lexists(p), 'Output already exists: ' + str(p))
        demand(p.parent.is_dir(), 'Output parent must exist: ' + str(p.parent))
    elif kind == 'file':
        demand(p.is_file(), 'File required: ' + str(p))
    elif kind == 'dir':
        demand(p.is_dir(), 'Directory required: ' + str(p))
    return p


def relative(value):
    demand(isinstance(value, str) and value and '\\' not in value and '\x00' not in value, 'Unsafe relative path')
    demand(not PurePosixPath(value).is_absolute() and not PureWindowsPath(value).drive and not PureWindowsPath(value).is_absolute(), 'Absolute member rejected: ' + value)
    pieces = value.split('/')
    for part in pieces:
        demand(part not in ('', '.', '..') and not part.endswith((' ', '.')), 'Unsafe member component: ' + value)
        demand(not any(c in part for c in ':<>"|?*') and not any(ord(c) < 32 for c in part), 'Windows-unsafe member: ' + value)
        demand(part.split('.')[0].upper() not in RESERVED, 'Windows reserved member: ' + value)
    return value


def collision_key(name):
    return unicodedata.normalize('NFC', relative(name)).casefold()


def encoded(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + '\n').encode('utf-8')


def write_new(path, content):
    with path.open('xb') as f:
        f.write(content)
        f.flush()
        os.fsync(f.fileno())


def identity(s):
    return [s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns, s.st_ctime_ns, stat.S_IMODE(s.st_mode)]


def hash_file(path, sink=None):
    absolute(str(path), 'file')
    before = path.lstat()
    demand(stat.S_ISREG(before.st_mode), 'Regular file required: ' + str(path))
    flags = os.O_RDONLY | getattr(os, 'O_NOFOLLOW', 0) | getattr(os, 'O_BINARY', 0)
    fd = os.open(path, flags)
    with os.fdopen(fd, 'rb') as f:
        demand(identity(before) == identity(os.fstat(f.fileno())), 'File replaced before read: ' + str(path))
        digest = hashlib.sha256()
        count = 0
        while True:
            block = f.read(CHUNK)
            if not block:
                break
            digest.update(block)
            count += len(block)
            if sink is not None:
                sink.write(block)
        demand(identity(before) == identity(os.fstat(f.fileno())) == identity(path.lstat()), 'Live input changed during read: ' + str(path))
    demand(count == before.st_size, 'Length changed: ' + str(path))
    return {'bytes': count, 'sha256': digest.hexdigest(), 'identity': identity(before)}


def read_json(path):
    before = hash_file(path)
    raw = path.read_bytes()
    demand(hashlib.sha256(raw).hexdigest() == before['sha256'] and hash_file(path) == before, 'Metadata changed during read: ' + str(path))
    return json.loads(raw), before['sha256']


def inventory(root):
    files, directories, seen = [], [], set()
    def visit(folder):
        absolute(str(folder), 'dir')
        before = folder.lstat()
        demand(stat.S_ISDIR(before.st_mode), 'Directory required')
        entries = sorted(os.scandir(folder), key=lambda e: e.name)
        for entry in entries:
            p = Path(entry.path)
            name = relative(p.relative_to(root).as_posix())
            key = collision_key(name)
            demand(key not in seen, 'Case/Unicode path collision: ' + name)
            seen.add(key)
            mode = entry.stat(follow_symlinks=False).st_mode
            demand(not stat.S_ISLNK(mode), 'Symlink rejected: ' + name)
            if stat.S_ISDIR(mode):
                directories.append({'path': name, 'identity': identity(p.lstat())})
                visit(p)
            else:
                demand(stat.S_ISREG(mode), 'Special file rejected: ' + name)
                files.append({'path': name, 'excluded': name.startswith(EXCLUDE + '/'), **hash_file(p)})
        demand(identity(before) == identity(folder.lstat()), 'Directory changed during scan: ' + str(folder))
    visit(root)
    return {'files': sorted(files, key=lambda r: r['path']), 'directories': sorted(directories, key=lambda r: r['path']), 'rootIdentity': identity(root.lstat())}


def create_output(value, source=None):
    p = absolute(value, new=True)
    if source is not None:
        demand(p != source and source not in p.parents and p not in source.parents, 'Input/output trees must be separate')
    p.mkdir(mode=0o700)
    return p


def source_unchanged(manifest):
    root = absolute(manifest['buildRoot'], 'dir')
    demand(inventory(root) == manifest['inventory'], 'Build tree changed since prepare; preserve output and prepare a new reviewed manifest')
    for row in manifest['evidence']:
        demand(hash_file(absolute(row['path'], 'file'))['sha256'] == row['sha256'], 'Evidence changed: ' + row['path'])
    return root


def validate_manifest(m):
    demand(m.get('schema') == 'EXODUSER_WIN_DELIVERY_V1' and m.get('excludeExactRootDirectory') == EXCLUDE, 'Unsupported manifest contract')
    rows = m['inventory']['files']
    seen = set()
    for row in rows:
        name = relative(row['path'])
        key = collision_key(name)
        demand(key not in seen and key != collision_key(EMBEDDED), 'Duplicate/reserved manifest path')
        seen.add(key)
        demand(row['excluded'] == (name.startswith(EXCLUDE + '/')), 'Exclusion contract changed')
        demand(isinstance(row['bytes'], int) and row['bytes'] >= 0 and re.fullmatch('[0-9a-f]{64}', row['sha256']), 'Invalid file digest metadata')
    for row in m['inventory']['directories']:
        name = relative(row['path'])
        key = collision_key(name)
        demand(key not in seen, 'Duplicate file/directory path')
        seen.add(key)
    dir_names = {r['path'] for r in m['inventory']['directories']}
    for name in [r['path'] for r in rows] + list(dir_names):
        parent = PurePosixPath(name).parent
        while str(parent) != '.':
            demand(parent.as_posix() in dir_names, 'Missing parent directory contract: ' + name)
            parent = parent.parent
    shipped = {r['path']: r for r in rows if not r['excluded']}
    demand(all(name in shipped for name in REQUIRED), 'Required exe/Data/UnityPlayer/original movies missing')
    demand(all(shipped[name]['bytes'] > 0 for name in REQUIRED), 'Required file is empty')
    demand(len(m['approvedMovies']) == 2 and {r['path'] for r in m['approvedMovies']} == set(MOVIES), 'Original movie contract mismatch')
    for row in m['approvedMovies']:
        demand(shipped[row['path']]['sha256'] == row['sha256'] and shipped[row['path']]['bytes'] == row['bytes'], 'Original movie mismatch')
    return shipped


def prepare(args, out):
    root = absolute(args.build_root, 'dir')
    source, source_hash = read_json(absolute(args.source_identity, 'file'))
    receipt_path = absolute(args.build_receipt, 'file')
    receipt, receipt_hash = read_json(receipt_path)
    media, media_hash = read_json(absolute(args.media_identity, 'file'))
    demand(re.fullmatch('[0-9a-f]{40}', source['sourceSha']), 'Full approved source SHA required')
    demand(source['buildReceiptSha256'] == receipt_hash, 'Source identity does not bind this build receipt')
    input_path = absolute(source['buildInputManifestPath'], 'file')
    input_sha = hash_file(input_path)['sha256']
    demand(input_sha == source['buildInputManifestSha256'], 'Build input manifest hash mismatch')
    demand(receipt.get('passed') is True and receipt.get('result') == 'Succeeded' and receipt.get('errors') == 0, 'Build receipt not passed')
    demand(receipt.get('target') == 'StandaloneWindows64' and receipt.get('architecture') == 'x64' and receipt.get('settingsQa') is False and receipt.get('uiQa') is False, 'Normal Win64 build required')
    demand(receipt.get('engine') == source['unityVersion'], 'Unity version mismatch')
    demand(receipt.get('identifier') == 'com.ForDearGamers.EXODUSER----Unity-----------------', 'Normal identifier required')
    demand(absolute(receipt['output'], 'file') == root / EXE, 'Build receipt output does not identify this tree')
    evidence = [{'path': str(absolute(p, 'file')), 'sha256': h} for p, h in [(args.source_identity, source_hash), (args.build_receipt, receipt_hash), (args.media_identity, media_hash), (str(input_path), input_sha)]]
    approved_movies = []
    demand({r['path'] for r in media['files']} == set(MOVIES) and len(media['files']) == 2, 'Exactly two approved original movies required')
    for row in media['files']:
        relative(row['path'])
        original = absolute(row['sourcePath'], 'file')
        measured = hash_file(original)
        demand(measured['bytes'] == row['bytes'] and measured['sha256'] == row['sha256'], 'Approved original movie changed')
        evidence.append({'path': str(original), 'sha256': measured['sha256']})
        approved_movies.append({k: row[k] for k in ['path', 'bytes', 'sha256']})
    demand(not (root / EXCLUDE).exists() or (root / EXCLUDE).is_dir(), 'Exact backup exclusion is a directory, not a file')
    first = inventory(root)
    m = {'schema': 'EXODUSER_WIN_DELIVERY_V1', 'buildRoot': str(root), 'sourceSha': source['sourceSha'], 'unityVersion': source['unityVersion'], 'buildInputManifestSha256': input_sha, 'buildReceiptSha256': receipt_hash, 'excludeExactRootDirectory': EXCLUDE, 'inventory': first, 'approvedMovies': approved_movies, 'evidence': evidence, 'limits': ['Source provenance is Root-attested and receipt-bound; binaries alone do not prove their source commit.', 'Packaging byte checks do not prove Windows execution, gameplay, natural Mac QA, signing, or movie playback.']}
    shipped = validate_manifest(m)
    source_unchanged(m)
    raw = encoded(m)
    write_new(out / 'manifest.json', raw)
    write_new(out / 'prepare-receipt.json', encoded({'stage': 'prepared-review-required', 'manifestSha256': hashlib.sha256(raw).hexdigest(), 'shippedFiles': len(shipped), 'shippedBytes': sum(r['bytes'] for r in shipped.values()), 'sourceFilesIncludingExcluded': len(first['files']), 'packed': False}))


def shipped_directories(manifest):
    return {r['path'] for r in manifest['inventory']['directories'] if r['path'] != EXCLUDE and not r['path'].startswith(EXCLUDE + '/')}


def verify_archive(archive, manifest, manifest_bytes):
    expected = validate_manifest(manifest)
    expected_dirs = shipped_directories(manifest)
    seen = set()
    with zipfile.ZipFile(archive) as z:
        for item in z.infolist():
            is_dir = item.is_dir()
            name = relative(item.filename[:-1] if is_dir else item.filename)
            key = collision_key(name)
            demand(key not in seen, 'Duplicate ZIP member rejected')
            seen.add(key)
            mode = item.external_attr >> 16
            demand(not stat.S_ISLNK(mode) and not item.flag_bits & 1, 'Symlink/encrypted ZIP member rejected')
            demand(item.compress_type == zipfile.ZIP_STORED, 'Unexpected compression contract')
            if is_dir:
                demand(name in expected_dirs and item.file_size == 0 and stat.S_IFMT(mode) in (0, stat.S_IFDIR), 'Unexpected/special ZIP directory')
                continue
            demand(stat.S_IFMT(mode) in (0, stat.S_IFREG), 'Special ZIP file rejected')
            demand(name == EMBEDDED or name in expected, 'Unexpected ZIP member: ' + name)
            demand(item.file_size == (len(manifest_bytes) if name == EMBEDDED else expected[name]['bytes']), 'ZIP advertised size mismatch')
            h = hashlib.sha256()
            size = 0
            with z.open(item) as f:
                while True:
                    block = f.read(CHUNK)
                    if not block:
                        break
                    h.update(block)
                    size += len(block)
            if name == EMBEDDED:
                demand(size == len(manifest_bytes) and h.hexdigest() == hashlib.sha256(manifest_bytes).hexdigest(), 'Embedded manifest mismatch')
            else:
                demand(size == expected[name]['bytes'] == item.file_size and h.hexdigest() == expected[name]['sha256'], 'ZIP content mismatch: ' + name)
    demand(seen == {collision_key(n) for n in expected} | {collision_key(n) for n in expected_dirs} | {collision_key(EMBEDDED)}, 'ZIP file/directory missing')


def pack(args, out):
    manifest_path = absolute(args.manifest, 'file')
    raw = manifest_path.read_bytes()
    manifest_hash = hashlib.sha256(raw).hexdigest()
    demand(manifest_hash == args.reviewed_manifest_sha256, 'Reviewed manifest hash mismatch')
    manifest = json.loads(raw)
    shipped = validate_manifest(manifest)
    root = source_unchanged(manifest)
    target = out / 'package.zip'
    with target.open('xb') as raw_zip:
        with zipfile.ZipFile(raw_zip, 'w', compression=zipfile.ZIP_STORED, allowZip64=True) as z:
            for name in sorted(shipped_directories(manifest)):
                info = zipfile.ZipInfo(name + '/', (1980, 1, 1, 0, 0, 0))
                info.external_attr = ((stat.S_IFDIR | 0o755) << 16) | 0x10
                with z.open(info, 'w', force_zip64=True):
                    pass
            for name, row in sorted(shipped.items()):
                info = zipfile.ZipInfo(name, (1980, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_STORED
                info.external_attr = (stat.S_IFREG | 0o644) << 16
                with z.open(info, 'w', force_zip64=True) as dest:
                    demand(hash_file(root / name, dest) == {k: row[k] for k in ['bytes', 'sha256', 'identity']}, 'Source changed while packing: ' + name)
            info = zipfile.ZipInfo(EMBEDDED, (1980, 1, 1, 0, 0, 0))
            info.external_attr = (stat.S_IFREG | 0o644) << 16
            with z.open(info, 'w', force_zip64=True) as dest:
                dest.write(raw)
        raw_zip.flush()
        os.fsync(raw_zip.fileno())
    source_unchanged(manifest)
    demand(hash_file(manifest_path)['sha256'] == manifest_hash, 'Reviewed manifest changed during pack')
    before_verify = hash_file(target)
    verify_archive(target, manifest, raw)
    digest = hash_file(target)
    demand(digest == before_verify, 'Archive changed during sender verification')
    write_new(out / 'manifest.json', raw)
    write_new(out / 'pack-receipt.json', encoded({'stage': 'pack-complete-byte-verified', 'sourceSha': manifest['sourceSha'], 'unityVersion': manifest['unityVersion'], 'manifestSha256': manifest_hash, 'zipBytes': digest['bytes'], 'zipSha256': digest['sha256'], 'zip64Allowed': True, 'eachMemberForcedZip64': True, 'compression': 'ZIP_STORED', 'files': len(shipped), 'executionVerified': False, 'transferVerified': False}))


def verify(args, out):
    mpath = absolute(args.manifest, 'file')
    raw = mpath.read_bytes()
    manifest = json.loads(raw)
    receipt, receipt_hash = read_json(absolute(args.pack_receipt, 'file'))
    demand(receipt.get('stage') == 'pack-complete-byte-verified', 'Completed sender pack receipt required')
    demand(hashlib.sha256(raw).hexdigest() == receipt['manifestSha256'], 'Received manifest hash mismatch')
    archive = absolute(args.archive, 'file')
    first = hash_file(archive)
    demand(first['bytes'] == receipt['zipBytes'] and first['sha256'] == receipt['zipSha256'], 'Received ZIP bytes/hash mismatch')
    verify_archive(archive, manifest, raw)
    tree_ok = None
    if args.tree:
        tree = absolute(args.tree, 'dir')
        actual = inventory(tree)
        expected = validate_manifest(manifest)
        rows = {r['path']: r for r in actual['files']}
        demand(set(rows) == set(expected) | {EMBEDDED}, 'Received extracted tree missing/extra files')
        demand({r['path'] for r in actual['directories']} == shipped_directories(manifest), 'Received extracted directory tree differs')
        for name, row in expected.items():
            demand(rows[name]['bytes'] == row['bytes'] and rows[name]['sha256'] == row['sha256'], 'Received extracted bytes changed: ' + name)
        demand(rows[EMBEDDED]['sha256'] == receipt['manifestSha256'], 'Extracted embedded manifest mismatch')
        demand(inventory(tree) == actual, 'Received extracted tree changed during verify')
        tree_ok = True
    demand(hash_file(archive) == first and hash_file(mpath)['sha256'] == receipt['manifestSha256'] and hash_file(absolute(args.pack_receipt, 'file'))['sha256'] == receipt_hash, 'Received files changed during verification')
    write_new(out / 'receiver-receipt.json', encoded({'stage': 'receiver-byte-verification-complete', 'senderPackReceiptSha256': receipt_hash, 'zipSha256': first['sha256'], 'zipBytes': first['bytes'], 'manifestSha256': receipt['manifestSha256'], 'sourceSha': manifest['sourceSha'], 'unityVersion': manifest['unityVersion'], 'archiveContentsVerified': True, 'extractedTreeVerified': tree_ok, 'executionVerified': False, 'limits': 'Byte parity only; does not authenticate sender or prove Windows/gameplay/movie playback.'}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='stage', required=True)
    p = sub.add_parser('prepare')
    for name in ['build-root', 'source-identity', 'build-receipt', 'media-identity', 'output']:
        p.add_argument('--' + name, required=True)
    p = sub.add_parser('pack')
    for name in ['manifest', 'reviewed-manifest-sha256', 'output']:
        p.add_argument('--' + name, required=True)
    p = sub.add_parser('verify')
    for name in ['manifest', 'pack-receipt', 'archive', 'output']:
        p.add_argument('--' + name, required=True)
    p.add_argument('--tree')
    args = parser.parse_args()
    out = None
    try:
        source = absolute(args.build_root, 'dir') if args.stage == 'prepare' else None
        if args.stage == 'pack':
            m, _ = read_json(absolute(args.manifest, 'file'))
            source = absolute(m['buildRoot'], 'dir')
        if args.stage == 'verify' and args.tree:
            source = absolute(args.tree, 'dir')
        out = create_output(args.output, source)
        {'prepare': prepare, 'pack': pack, 'verify': verify}[args.stage](args, out)
        print(json.dumps({'stage': args.stage, 'output': str(out), 'completed': True}))
    except Exception as exc:
        if out is not None:
            try:
                write_new(out / 'FAILURE.json', encoded({'stage': args.stage, 'completed': False, 'error': type(exc).__name__ + ': ' + str(exc), 'preserved': True, 'instruction': 'Do not distribute partial files; retain this directory and use a new output after review.'}))
            except Exception:
                pass
        print(type(exc).__name__ + ': ' + str(exc), file=sys.stderr)
        return 2
    return 0


if __name__ == '__main__':
    sys.exit(main())
