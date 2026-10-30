"""기존 재수입 검사를 새14종 입력의 실제 FBX SHA에 대해 수행한다."""
from pathlib import Path
p=Path(__file__).with_name('forest_verify.py')
code=p.read_text(encoding='utf8').replace('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1','I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2')
exec(compile(code,str(p),'exec'))
