#!/usr/bin/env python3
"""Safe anchor-based chest3d replacement for game.html"""
import sys

GAME = r'G:\hell\game.html'
NEW_JS = r'G:\hell\_chest3d_new.js'

with open(GAME, 'r', encoding='utf-8') as f:
    content = f.read()

with open(NEW_JS, 'r', encoding='utf-8') as f:
    new_code = f.read().strip()

# Find anchor
anchor = '// CHEST 3D'
anchor_pos = content.find(anchor)
if anchor_pos == -1:
    print('ERROR: anchor not found'); sys.exit(1)

# Find IIFE start AFTER anchor
iife_start = content.find('(function(){', anchor_pos)
if iife_start == -1:
    print('ERROR: IIFE start not found after anchor'); sys.exit(1)

# Find console.log('[CHEST3D] after IIFE start
log_marker = "console.log('[CHEST3D]"
log_pos = content.find(log_marker, iife_start)
if log_pos == -1:
    print('ERROR: console.log marker not found'); sys.exit(1)

# Find })(); after the log line
iife_end = content.find('})();', log_pos)
if iife_end == -1:
    print('ERROR: IIFE end not found'); sys.exit(1)
iife_end += 5  # include })();

old_len = iife_end - iife_start
print(f'Found IIFE: pos {iife_start}..{iife_end}, len={old_len}')
print(f'New code len: {len(new_code)}')

result = content[:iife_start] + new_code + content[iife_end:]
print(f'Result len: {len(result)} (was {len(content)})')

with open(GAME, 'w', encoding='utf-8') as f:
    f.write(result)

print('DONE: game.html updated with v5 gothic-iron chest')
