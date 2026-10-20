#!/usr/bin/env python3
"""Opt-in LOOK-001 launcher; default A, one owned Godot process, isolated data."""
import argparse
import fcntl
import json
import re
import subprocess
import time
from pathlib import Path

GODOT = Path('/Users/fordeargamers/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot')
USERDIR = 'EXODUSER-look-001-Isolated-20261020'


def wait_for_slot(output):
    # Same process predicate as: pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l
    while True:
        probe = subprocess.run(['pgrep', '-f', 'Godot.app/Contents/MacOS/Godot'],
                               text=True, capture_output=True, check=False)
        if probe.returncode not in (0, 1):
            raise RuntimeError('BLOCKED: cannot inspect global Godot count')
        count = len(probe.stdout.splitlines())
        with (output / 'process-guard.jsonl').open('a') as stream:
            stream.write(json.dumps({'time': time.time(), 'godot_count': count}) + '\n')
        print('Godot process count:', count, flush=True)
        if count < 2:
            return
        print('Global limit reached; waiting 30 seconds', flush=True)
        time.sleep(30)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--mode', choices=list('ABCD'), default='A')
    parser.add_argument('--seconds', type=float, default=30)
    parser.add_argument('--sources-only', action='store_true')
    parser.add_argument('--import-only', action='store_true')
    parser.add_argument('--test', help='Existing test basename; its isolation constant is honored')
    parser.add_argument('--output', type=Path, default=Path.home() / 'exoduser-wt/_out/look-001')
    args = parser.parse_args()
    if args.seconds < 1:
        parser.error('--seconds must be at least 1')
    project = Path(__file__).resolve().parents[1] / 'godot'
    output = args.output.expanduser().resolve()
    output.mkdir(parents=True, exist_ok=True)
    # All launch modes for this worktree share the same advisory lock.
    lock_path = Path.home() / 'exoduser-wt/_out/look-001/launcher.lock'
    lock_path.parent.mkdir(parents=True, exist_ok=True)
    with lock_path.open('a') as owner_lock:
        try:
            fcntl.flock(owner_lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise SystemExit('BLOCKED: LOOK-001 already owns a Godot execution')
        override = project / 'override.cfg'
        if override.exists() and override.read_text().strip():
            raise SystemExit('BLOCKED: preserve nonempty override.cfg; refusing overwrite')
        command = [str(GODOT), '--path', str(project)]
        userdir = USERDIR
        if args.test:
            if not re.fullmatch(r'test_[a-z0-9_]+', args.test):
                parser.error('invalid test basename')
            source = (project / 'tests' / (args.test + '.gd')).read_text()
            match = re.search(r'const (?:USERDIR|ISOLATED_DIRECTORY)\s*(?::=|=)\s*"([^"]+)"', source)
            if match:
                userdir = match.group(1)
            command += (['--resolution', '1920x1080'] if args.test == 'test_p2003a_lighting' else ['--headless'])
            command += ['--script', 'res://tests/' + args.test + '.gd']
            label = args.test
        elif args.import_only:
            command += ['--headless', '--editor', '--import']
            label = 'import'
        else:
            command += ['--rendering-method', 'forward_plus' if args.mode == 'C' else 'gl_compatibility']
            if args.mode == 'C':
                command += ['--rendering-driver', 'metal']
            command += ['--resolution', '1920x1080', '--max-fps', '120', '--disable-vsync',
                        '--script', 'res://tests/capture_look001.gd', '--',
                        '--look001-mode=' + args.mode, '--look001-output=' + str(output),
                        '--look001-seconds=' + str(args.seconds)]
            if args.sources_only:
                command.append('--look001-sources-only')
            label = args.mode
        wait_for_slot(output)
        override.write_text('[application]\nconfig/use_custom_user_dir=true\n'
                            'config/custom_user_dir_name="' + userdir + '"\n')
        started = time.time()
        try:
            (output / (label + '-command.json')).write_text(json.dumps(command, ensure_ascii=False, indent=2))
            with (output / (label + '.stdout.log')).open('w') as stdout, \
                    (output / (label + '.stderr.log')).open('w') as stderr:
                completed = subprocess.run(command, stdout=stdout, stderr=stderr, timeout=1200)
            summary = {'mode': label, 'exit_code': completed.returncode, 'output': str(output),
                       'duration_s': time.time() - started, 'userdir': userdir}
            (output / (label + '-exit.json')).write_text(json.dumps(summary, ensure_ascii=False))
            print(json.dumps(summary, ensure_ascii=False), flush=True)
            return completed.returncode
        finally:
            override.write_text('')


if __name__ == '__main__':
    raise SystemExit(main())
