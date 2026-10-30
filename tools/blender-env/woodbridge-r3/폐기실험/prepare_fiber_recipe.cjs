const fs=require('fs'),r=__dirname;let s=fs.readFileSync(r+'/bake_moss_core.py','utf8'),a=s.indexOf('vs=[];fs=[];U=40;V=24'),b=s.indexOf("me=bpy.data.meshes.new",a);if(a<0||b<0)throw Error('경계');s=s.slice(0,a)+`vs=[];fs=[];V=18;U=6
for j in range(70):
 bx=(j/69-.5)*1.35+.04*math.sin(j*1.9);by=.27*math.sin(j*2.39);length=1.12+.61*(.5+.5*math.sin(j*1.7));top=2.30+.12*math.sin(j*2);base=len(vs)
 for k in range(V+1):
  t=k/V;cx=bx+.075*math.sin(t*5+j)*t;cy=by+.065*math.sin(t*4+j*1.3)*t;cz=top-length*t;rad=(.013+.012*(.5+.5*math.sin(j*1.1)))*(1-.88*t)*(.85+.15*math.sin(k*2.2+j))
  for i in range(U):
   ang=math.tau*i/U+j*.6+t*4;vs.append((cx+rad*math.cos(ang),cy+rad*math.sin(ang),cz))
 for k in range(V):
  for i in range(U):a=base+k*U+i;b=base+k*U+(i+1)%U;fs.append((a,b,b+U,a+U))
 fs.append(tuple(base+i for i in range(U-1,-1,-1)));fs.append(tuple(base+V*U+i for i in range(U)))
`+s.slice(b);s=s.replaceAll('이끼코어베이크','이끼섬유베이크').replaceAll('MOSS_CORE','MOSS_FIBER').replaceAll('MossCore','MossFiber').replaceAll('이끼코어_베이크.blend','이끼섬유_베이크.blend').replace("h.inputs['Value'].default_value=.65","h.inputs['Value'].default_value=.90").replace('(.68,.66,.48,1)','(.85,.80,.62,1)').replaceAll('연속 이끼 질량','분리된 이끼 섬유');fs.writeFileSync(r+'/bake_moss_fiber.py',s);
let c=fs.readFileSync(r+'/pack_moss_mass.cjs','utf8').replaceAll('이끼코어베이크','이끼섬유베이크').replaceAll('Atlas_moss_mass_','Atlas_moss_fiber_');fs.writeFileSync(r+'/pack_moss_fiber.cjs',c);
