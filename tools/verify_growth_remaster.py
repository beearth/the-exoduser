"""Compatibility entry point for the current character-growth UI verifier."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name('verify_passive_body_tree.py')),run_name='__main__')
