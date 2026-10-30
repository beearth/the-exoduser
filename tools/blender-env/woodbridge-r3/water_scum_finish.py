"""Blender 독액 대리면의 반영과 연결된 얇은 부유막을 실제 메시로 검수."""
import bpy,math,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene
for o in list(S.objects):
 if o.name.startswith('수면마감_'):bpy.data.objects.remove(o,do_unlink=True)
m=bpy.data.materials['독액_기준대리물_비납품'];bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Roughness'].default_value=.16;bs.inputs['Specular IOR Level'].default_value=.30
mat=bpy.data.materials.new('수면마감_연속오염막_비납품');mat.use_nodes=True;bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.19,.20,.078,1);bs.inputs['Roughness'].default_value=.62;n=mat.node_tree.nodes;l=mat.node_tree.links;g=n.new('ShaderNodeNewGeometry');noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=4.3;noise.inputs['Detail'].default_value=1.2;l.new(g.outputs['Position'],noise.inputs['Vector']);ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.36;ramp.color_ramp.elements[0].color=(0,0,0,1);ramp.color_ramp.elements[1].position=.64;ramp.color_ramp.elements[1].color=(.72,.72,.72,1);l.new(noise.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs['Color'],bs.inputs['Alpha'])
vs=[];fs=[]
# 물가 방향에 따라 길게 찢어진 곡선 막. 점·사각판 산포가 아니다.
patches=[(-10,-4.8,1.6,.23,.2),(-6,-4.7,1.9,.38,-.1),(-3.2,-4.8,.6,.20,.3),(4.3,-4.8,1.1,.28,.25),(8.5,-4.5,1.8,.36,-.18),(-9,4.6,2,.28,.07),(-5,4.5,1.5,.36,-.12),(4.8,4.4,1.4,.29,.12),(8.8,4.1,1.6,.4,.6),(5.8,.8,2.0,1.5,0),(10.7,2.2,1.7,.7,1.3),(12.7,7.2,1.4,.8,1.2)]
for k,(x,y,sx,sy,a)in enumerate(patches):
 for ring in range(1):
  start=(k*.7+ring*.9)%(math.tau);length=2.2+.7*math.sin(k+ring);base=len(vs);segs=80;sc=1+ring*.13
  for j in range(segs+1):
   t=start+length*j/segs;rad=1+.10*math.sin(t*3+k)+.06*math.sin(t*7+ring)+.025*math.sin(t*17+k);w=(.04+.10*(.5+.5*math.sin(t*4+k)))*math.sin(math.pi*j/segs)**.5
   for edge in [-1,1]:
    xx=(sx*sc*rad+edge*w)*math.cos(t);yy=(sy*sc*rad+edge*w)*math.sin(t);vs.append((x+xx*math.cos(a)-yy*math.sin(a),y+xx*math.sin(a)+yy*math.cos(a),-.071+ring*.0004))
  for j in range(segs):fs.append((base+j*2,base+j*2+1,base+j*2+3,base+j*2+2))
me=bpy.data.meshes.new('실제_연속부유막');me.from_pydata(vs,[],fs);me.materials.append(mat);o=bpy.data.objects.new('수면마감_연속부유막',me);S.collection.objects.link(o);o.visible_shadow=False
(R/'source/독액-대리면마감.json').write_text(json.dumps({'범위':'Blender 색/형태 기준 대리물만. Unity 셰이더/시간 변화/납품 자산 아님','roughness':.16,'SpecularIORLevel':.30,'IOR':1.36,'발광':0,'연속부유막':len(patches),'대리막정점':len(vs),'실패교정':'평행한 가는 윤곽36개를 채택하지 않고, 불규칙 폭/부분 Alpha의 끊기는 막12개로 전환'},ensure_ascii=False,indent=2),encoding='utf8')
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.resolution_percentage=55;S.cycles.samples=32;S.render.filepath=str(R/'renders/중경_독액마감_검수.png');bpy.ops.render.render(write_still=True);print('연속 부유막·말뚝 반영 기준 수정',flush=True)
