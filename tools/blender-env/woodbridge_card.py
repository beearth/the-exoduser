from pathlib import Path
p=Path(__file__).with_name('forest_card.py')
code=p.read_text(encoding='utf8').replace('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1','I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2').replace('cam=S.camera;','cam=S.camera;cam.data.type="ORTHO";')
code=code.replace("src=bpy.data.objects['RF_Ancient_Rotten_Tree']","src=bpy.data.objects['RF_Gnarled_Split_Trunk' if j%3==1 else 'RF_Ancient_Rotten_Tree']")
if (Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2/source/전체목질스캔완료.json')).exists():code=code.replace('o.scale=(sz,)*3','o.scale=(sz*.48,)*3')
exec(compile(code,str(p),'exec'))
