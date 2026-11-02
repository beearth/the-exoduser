"""Next-run source only. Never import this file to inspect it: top-level launches one owned QA app."""
import datetime, hashlib, json, os, plistlib, stat, subprocess, time, sys
from pathlib import Path

if len(sys.argv) != 2 or not Path(sys.argv[1]).is_absolute():
    raise SystemExit('Usage: run-mac-ground-probe-guarded.py /absolute/owned/qa-artifact-root')
requested_root = Path(sys.argv[1])
if requested_root.is_symlink():
    raise SystemExit('Artifact root must not be a symlink')
root = requested_root.resolve(strict=True)
prefs = Path.home() / 'Library/Preferences'
app = root / 'build-receiverTriadBias-normal/EXODUSER-Unity.app'
run = root / 'profile-guard-runs' / (datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%S%fZ') + '-' + str(os.getpid()))
run.mkdir(mode=0o700, parents=True)
block = root / 'profile-guard-BLOCKED.json'
result = {'diagnosticOnly': True, 'productAccepted': False, 'run': str(run), 'launchCount': 0, 'checkpoints': [], 'restorations': [], 'error': None}
sequence = 0

def digest(data):
    return hashlib.sha256(data).hexdigest()

def semantic(data):
    # Typed, sorted plist encoding: bool/int and byte/string distinctions are retained.
    return digest(plistlib.dumps(plistlib.loads(data), fmt=plistlib.FMT_BINARY, sort_keys=True))

def write_new(path, data, mode=0o600):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, mode)
    with os.fdopen(fd, 'wb') as stream:
        stream.write(data); stream.flush(); os.fsync(stream.fileno())

def json_new(path, value):
    write_new(path, (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode())

def raw_now(name):
    path = prefs / name
    if not path.exists():
        return None
    if path.is_symlink() or not stat.S_ISREG(path.lstat().st_mode):
        raise RuntimeError('Nonregular preference; no overwrite: ' + name)
    return path.read_bytes()

def idle():
    # Match executable identity, not a parent's arguments mentioning an app path.
    rows = subprocess.check_output(['ps', '-Ao', 'pid=,comm='], text=True).splitlines()
    busy = []
    for row in rows:
        parts = row.strip().split(None, 1)
        if len(parts) != 2:
            continue
        pid, executable = parts
        name = Path(executable).name.casefold()
        if executable.endswith('/Unity.app/Contents/MacOS/Unity') or ('/Contents/MacOS/' in executable and (name == 'exoduser' or name.startswith(('exoduser ', 'exoduser-')))):
            busy.append({'pid': int(pid), 'executable': executable})
    if busy:
        evidence = run / 'slot-busy-evidence.json'
        if not evidence.exists():
            json_new(evidence, {'processes': busy})
        result['busySlotEvidence'] = str(evidence)
        raise RuntimeError('Unity/EXODUSER process present; launch/restore forbidden')

def domains():
    text = subprocess.check_output(['/usr/bin/defaults', 'domains'], text=True)
    return {s.strip() for s in text.strip().split(',') if s.strip() and 'exoduser' in s.casefold()}

def raw_names():
    return {p.name for p in prefs.iterdir() if 'exoduser' in p.name.casefold() and (p.is_file() or p.is_symlink())}

def export_cache(domain, folder, label):
    # Hashed filenames avoid filesystem case/Unicode alias collisions in the evidence.
    path = folder / (label + '-' + digest(domain.encode()) + '.plist')
    proc = subprocess.run(['/usr/bin/defaults', 'export', domain, str(path)], capture_output=True)
    if proc.returncode:
        raise RuntimeError('Cache export failed; no inferred absence: ' + domain)
    os.chmod(path, 0o700)
    data = path.read_bytes()
    with path.open('rb') as stream:
        os.fsync(stream.fileno())
    return {'path': str(path), 'sha256': digest(data), 'semantic': semantic(data)}

def raw_pass(folder, label):
    dest = folder / label; dest.mkdir(mode=0o700)
    rows = {}
    for name in sorted(raw_names()):
        data = raw_now(name)
        if data is None:
            raise RuntimeError('Raw disappeared during snapshot: ' + name)
        target = dest / name; write_new(target, data, 0o600)
        rows[name] = {'path': str(target), 'sha256': digest(data), 'bytes': len(data)}
    return rows

def snapshot(label):
    global sequence
    sequence += 1; folder = run / ('%03d-' % sequence + label); folder.mkdir(mode=0o700)
    started = time.monotonic(); first = raw_pass(folder, 'raw-a'); listed_a = domains()
    domain_set = listed_a | {n[:-6] for n in first if n.endswith('.plist')}
    cache_dir = folder / 'cache'; cache_dir.mkdir(mode=0o700)
    cache = {d: export_cache(d, cache_dir, 'cache') for d in sorted(domain_set)}
    second = raw_pass(folder, 'raw-b'); listed_b = domains()
    stable = ({n: r['sha256'] for n, r in first.items()} == {n: r['sha256'] for n, r in second.items()} and listed_a == listed_b)
    record = {'label': label, 'startedMonotonic': started, 'finishedMonotonic': time.monotonic(), 'raw': second, 'rawFirst': first, 'cache': cache, 'listedDomainsBefore': sorted(listed_a), 'listedDomainsAfter': sorted(listed_b), 'stableDuringSnapshot': stable}
    json_new(folder / 'manifest.json', record)
    return record

def changes(baseline, current):
    raw = {n for n in set(baseline['raw']) | set(current['raw']) if baseline['raw'].get(n, {}).get('sha256') != current['raw'].get(n, {}).get('sha256')}
    # Include transitions caught inside the snapshot; do not erase immediate evidence.
    raw |= {n for n in set(baseline['raw']) | set(current['rawFirst']) if baseline['raw'].get(n, {}).get('sha256') != current['rawFirst'].get(n, {}).get('sha256')}
    cache = {d for d in set(baseline['cache']) | set(current['cache']) if baseline['cache'].get(d, {}).get('semantic') != current['cache'].get(d, {}).get('semantic')}
    listed = set(current['listedDomainsBefore']) | set(current['listedDomainsAfter'])
    new_listed = listed - (set(baseline['listedDomainsBefore']) | set(baseline['listedDomainsAfter']))
    return raw, cache, new_listed

def unrelated_guard(baseline, current, owned_raw, owned_domains):
    raw, cache, new_listed = changes(baseline, current)
    if raw - owned_raw or cache - owned_domains or new_listed:
        raise RuntimeError('Unrelated/new preference change preserved; no overwrite: ' + repr({'raw': sorted(raw - owned_raw), 'cache': sorted(cache - owned_domains), 'newListed': sorted(new_listed)}))

def checkpoint(label, deadline):
    time.sleep(max(0, deadline - time.monotonic())); idle()
    state = snapshot(label); idle()
    result['checkpoints'].append({'label': label, 'requestedMonotonic': deadline, 'manifest': str(run / ('%03d-' % sequence + label) / 'manifest.json')})
    return state

def current_domain(name, domain, folder, label):
    data = raw_now(name)
    cache = export_cache(domain, folder, label)
    if raw_now(name) != data:
        raise RuntimeError('Raw changed during cache CAS export; no overwrite: ' + name)
    return data, cache

def restore_owned(name, domain, baseline, observed):
    idle(); folder = run / ('restore-' + digest(domain.encode())); folder.mkdir(mode=0o700)
    old_raw = Path(baseline['raw'][name]['path']).read_bytes()
    old_cache = Path(baseline['cache'][domain]['path']).read_bytes()
    if digest(old_raw) != baseline['raw'][name]['sha256'] or digest(old_cache) != baseline['cache'][domain]['sha256']:
        raise RuntimeError('Known-before evidence changed; restore forbidden')
    data, cache = current_domain(name, domain, folder, 'preserved-current')
    if data is None:
        raise RuntimeError('Owned raw disappeared; no absence normalization')
    write_new(folder / 'current-raw.plist', data)
    json_new(folder / 'current-manifest.json', {'rawSha256': digest(data), 'cache': cache})
    if digest(data) != observed['raw'][name]['sha256'] or cache['semantic'] != observed['cache'][domain]['semantic']:
        raise RuntimeError('Current raw/cache differs from checkpoint CAS; no overwrite')
    # Second independent current-cache observation immediately before mutation.
    cas_raw, cas_cache = current_domain(name, domain, folder, 'pre-import-CAS')
    if cas_raw != data or cas_cache['semantic'] != cache['semantic']:
        raise RuntimeError('Concurrent owned raw/cache change; no overwrite')
    global_cas = snapshot('global-pre-import-' + digest(domain.encode())[:12])
    unrelated_guard(baseline, global_cas, set(owned), set(owned.values()))
    if not global_cas['stableDuringSnapshot']:
        raise RuntimeError('Global pre-import snapshot unstable; no overwrite')
    cas_raw, cas_cache = current_domain(name, domain, folder, 'final-pre-import-CAS')
    if cas_raw != data or cas_cache['semantic'] != cache['semantic']:
        raise RuntimeError('Raw/cache changed during global CAS; no import')
    idle()
    subprocess.run(['/usr/bin/defaults', 'import', domain, str(baseline['cache'][domain]['path'])], check=True, capture_output=True)
    imported_raw, imported_cache = current_domain(name, domain, folder, 'after-import')
    if imported_cache['semantic'] != baseline['cache'][domain]['semantic'] or imported_raw is None or semantic(imported_raw) != baseline['cache'][domain]['semantic']:
        raise RuntimeError('Known-before cache import semantic verification failed')
    write_new(folder / 'post-import-raw.plist', imported_raw)
    # An unrelated simultaneous change stops further owned-domain writes as well.
    global_cas = snapshot('global-pre-raw-' + digest(domain.encode())[:12])
    unrelated_guard(baseline, global_cas, set(owned), set(owned.values()))
    if not global_cas['stableDuringSnapshot']:
        raise RuntimeError('Global pre-raw snapshot unstable; no raw overwrite')
    # Cache is checked again, then raw is checked through the final opened descriptor.
    final_raw, final_cache = current_domain(name, domain, folder, 'pre-raw-write-CAS')
    if final_raw != imported_raw or final_cache['semantic'] != baseline['cache'][domain]['semantic']:
        raise RuntimeError('Concurrent change after import; raw left untouched')
    idle(); path = prefs / name
    fd = os.open(path, os.O_RDWR | os.O_NOFOLLOW)
    with os.fdopen(fd, 'r+b') as stream:
        if stream.read() != imported_raw or (os.fstat(stream.fileno()).st_dev, os.fstat(stream.fileno()).st_ino) != (path.stat().st_dev, path.stat().st_ino):
            raise RuntimeError('Final raw descriptor CAS failed; no overwrite')
        stream.seek(0); stream.write(old_raw); stream.truncate(); stream.flush(); os.fsync(stream.fileno())
    if raw_now(name) != old_raw:
        raise RuntimeError('Exact raw restoration verification failed')
    result['restorations'].append({'raw': name, 'domain': domain, 'rawRestored': True, 'cacheSemanticsRestored': True, 'evidence': str(folder)})

# Reviewed recovery only: no Player launch. Baseline is successful immediately previous M1 guard.
try:
    idle()
    before=json.loads((root/'profile-guard-runs/20261102T054151392326Z-22746/001-before-launch/manifest.json').read_text())
    owned=json.loads((root/'profile-guard-runs/20261102T054151392326Z-22746/owned-domains.json').read_text())['resolvedExactRawAndCacheDomains']
    assert len(owned)==2 and len(before['raw'])==26 and len(before['cache'])==27
    result['reason']='CUA getApp first selection launched app before guard; closed immediately with CmdQ; previous successful M1 known-before baseline retained'
    states=[checkpoint('recovery-observed-immediate',time.monotonic()),checkpoint('recovery-observed-2s',time.monotonic()+2),checkpoint('recovery-observed-7s',time.monotonic()+7)]
    for state in states: unrelated_guard(before,state,set(owned),set(owned.values()))
    for name,domain in owned.items():
        current=snapshot('pre-recovery-'+digest(domain.encode())[:12]);unrelated_guard(before,current,set(owned),set(owned.values()))
        if not current['stableDuringSnapshot']:raise RuntimeError('Unstable recovery snapshot')
        raw,cache,_=changes(before,current)
        if name in raw or domain in cache:restore_owned(name,domain,before,current)
    restored=time.monotonic()
    for state in [checkpoint('recovered-immediate',restored),checkpoint('recovered-2s',restored+2),checkpoint('recovered-7s',restored+7)]:
        raw,cache,listed=changes(before,state)
        if raw or cache or listed or not state['stableDuringSnapshot']:raise RuntimeError('Recovery exact comparison failed')
    result.update(exitCode=0,preferencesFinal={'rawCount':26,'cacheCount':27,'allRawExact':True,'allCacheTypedSemanticsExact':True})
except BaseException as ex:
    result.update(error=type(ex).__name__+': '+str(ex),exitCode=3)
    if not block.exists():json_new(block,{'error':result['error'],'run':str(run)})
json_new(run/'cua-initial-selection-recovery.json',result)
print(json.dumps(result,ensure_ascii=False))
raise SystemExit(result['exitCode'])
