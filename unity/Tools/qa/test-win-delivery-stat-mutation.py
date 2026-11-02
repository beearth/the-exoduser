#!/usr/bin/env python3
"""Owned 3MiB hash mutation fixture; no real build, network or launch."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import time

TOOL = Path(__file__).with_name('win-delivery.py')
spec = importlib.util.spec_from_file_location('delivery', TOOL)
d = importlib.util.module_from_spec(spec)
spec.loader.exec_module(d)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', required=True)
    root = d.absolute(parser.parse_args().output, new=True)
    root.mkdir()
    path = root / 'owned.bin'
    original = b'a' * (3 * 1024 * 1024)
    (root / 'before.preserved').write_bytes(original)
    path.write_bytes(original)
    time.sleep(.02)
    before = path.stat()
    observations = {}
    class Sink:
        triggered = False
        def write(self, block):
            if self.triggered:
                return
            self.triggered = True
            with path.open('r+b') as changed:
                changed.seek(-1, 2)
                changed.write(b'z')
                changed.flush()
                os.fsync(changed.fileno())
            os.utime(path, ns=(before.st_atime_ns, before.st_mtime_ns))
            observations['pathAfterMutation'] = d.identity(path.stat())
    sink = Sink()
    try:
        d.hash_file(path, sink)
        result = {'passed': False, 'error': 'Mutation was accepted'}
    except ValueError as error:
        result = {'passed': 'Live input changed during read' in str(error), 'error': str(error)}
    result.update(fixtureOnly=True, triggered=sink.triggered, originalBytes=len(original),
                  originalSha256=hashlib.sha256(original).hexdigest(), before=d.identity(before),
                  observations=observations, actualGameDeliveryVerified=False,
                  scope='Owned last-byte mutation during streaming hash; original mtime restored; all files preserved')
    (root / 'test-receipt.json').write_bytes(d.encoded(result))
    print(json.dumps({'passed': result['passed'], 'receipt': str(root / 'test-receipt.json')}))
    return 0 if result['passed'] and sink.triggered else 2

if __name__ == '__main__':
    raise SystemExit(main())
