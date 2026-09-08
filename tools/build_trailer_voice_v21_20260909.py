"""Build the female-voice revision, preserving the V2 review MP4 and sources."""
import importlib.util
from pathlib import Path
import shutil

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('trailer_v2',ROOT/'tools/build_gameplay_trailer_v2_20260909.py')
edit=importlib.util.module_from_spec(spec)
spec.loader.exec_module(edit)
edit.RAW=ROOT/'tmp/trailer_voice_v21'
edit.EDIT=edit.RAW/'edit'
edit.FINAL=ROOT/'captures/gameplay_trailer_20260909/EXODUSER_GAMEPLAY_TRAILER_V21_NO_CAPTIONS_70S_1080P60.mp4'

def main():
    edit.RAW.mkdir(parents=True,exist_ok=True)
    for name in ['ch1_altar','ch2_hive','ch3_ritual']:
        shutil.copyfile(ROOT/'tmp/trailer_v2'/f'{name}.webm',edit.RAW/f'{name}.webm')
    edit.main(captions_enabled=False)

if __name__=='__main__':main()
