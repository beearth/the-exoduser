import unreal,os,json,math
G=os.environ['GROUND_FBX'];T=os.environ['GROUND_TEX'];OUT=os.environ['UE_OUT'];E=lambda k,d:float(os.environ.get(k,d))
at=unreal.AssetToolsHelpers.get_asset_tools();mel=unreal.MaterialEditingLibrary;eal=unreal.EditorAssetLibrary
for p in('/Game/Floor',):
    if eal.does_directory_exist(p):eal.delete_directory(p)
def task(src,dst,opts=None):
    t=unreal.AssetImportTask();t.filename=src;t.destination_path=dst;t.automated=True;t.save=True;t.replace_existing=True
    if opts:t.options=opts
    return t
at.import_asset_tasks([task(f'{T}/forest_ground_04_{n}_4k.jpg','/Game/Floor/Tex') for n in('diff','nor_gl','arm')])
td=unreal.load_asset('/Game/Floor/Tex/forest_ground_04_diff_4k');tn=unreal.load_asset('/Game/Floor/Tex/forest_ground_04_nor_gl_4k');ta=unreal.load_asset('/Game/Floor/Tex/forest_ground_04_arm_4k')
tn.set_editor_property('compression_settings',unreal.TextureCompressionSettings.TC_NORMALMAP);tn.set_editor_property('srgb',False);ta.set_editor_property('compression_settings',unreal.TextureCompressionSettings.TC_MASKS);ta.set_editor_property('srgb',False)
for x in(td,tn,ta):eal.save_loaded_asset(x)
m=at.create_asset('M_Floor','/Game/Floor',unreal.Material,unreal.MaterialFactoryNew())
X=lambda c,x,y:mel.create_material_expression(m,c,x,y)
L=mel.connect_material_expressions
wp=X(unreal.MaterialExpressionWorldPosition,-1600,0);xy=X(unreal.MaterialExpressionComponentMask,-1400,0);[xy.set_editor_property(k,v) for k,v in (('r',True),('g',True),('b',False),('a',False))];L(wp,'',xy,'')
def uv(div,rot,ox,oy,y):
    d=X(unreal.MaterialExpressionDivide,-1200,y);d.set_editor_property('const_b',div);L(xy,'',d,'A')
    c=math.cos(rot);s=math.sin(rot)
    a=X(unreal.MaterialExpressionConstant2Vector,-1200,y+120);a.set_editor_property('r',c);a.set_editor_property('g',-s);b=X(unreal.MaterialExpressionConstant2Vector,-1200,y+220);b.set_editor_property('r',s);b.set_editor_property('g',c)
    da=X(unreal.MaterialExpressionDotProduct,-1000,y);L(d,'',da,'A');L(a,'',da,'B');db=X(unreal.MaterialExpressionDotProduct,-1000,y+120);L(d,'',db,'A');L(b,'',db,'B')
    ap=X(unreal.MaterialExpressionAppendVector,-850,y);L(da,'',ap,'A');L(db,'',ap,'B')
    o=X(unreal.MaterialExpressionConstant2Vector,-850,y+120);o.set_editor_property('r',ox);o.set_editor_property('g',oy);ad=X(unreal.MaterialExpressionAdd,-700,y);L(ap,'',ad,'A');L(o,'',ad,'B');return ad
def tex(t,st,u,x,y):
    n=X(unreal.MaterialExpressionTextureSample,x,y);n.texture=t;n.sampler_type=st;L(u,'',n,'UVs');return n
TILE=E('TILE_CM','205')
u1=uv(TILE,0.0,0,0,-900);u2=uv(TILE*1.37,1.07,.37,.19,-500);u3=uv(TILE*.83,2.21,.71,.43,-100)
C=unreal.MaterialSamplerType.SAMPLERTYPE_COLOR;N=unreal.MaterialSamplerType.SAMPLERTYPE_NORMAL;K=unreal.MaterialSamplerType.SAMPLERTYPE_MASKS
L3=[(tex(td,C,u,-500,-900+i*300),tex(tn,N,u,-500,-800+i*300),tex(ta,K,u,-500,-700+i*300)) for i,u in enumerate((u1,u2,u3))]
def noise(sc,y):
    n=X(unreal.MaterialExpressionNoise,-300,y)
    for k,v in (('scale',sc),('levels',4),('output_min',0.0),('output_max',1.0),('turbulence',False),('quality',1)):
        n.set_editor_property(k,v)
    return n
def mask(n,k,y):
    sb=X(unreal.MaterialExpressionSubtract,-150,y);sb.set_editor_property('const_b',.5);L(n,'',sb,'A');ml=X(unreal.MaterialExpressionMultiply,-50,y);ml.set_editor_property('const_b',k);L(sb,'',ml,'A')
    ad=X(unreal.MaterialExpressionAdd,50,y);ad.set_editor_property('const_b',.5);L(ml,'',ad,'A');st=X(unreal.MaterialExpressionSaturate,150,y);L(ad,'',st,'');return st
m1=mask(noise(E('N1','.0031'),300),E('NK','5'),300);m2=mask(noise(E('N2','.0047'),500),E('NK','5'),500)
def tri(i,pin,y):
    l1=X(unreal.MaterialExpressionLinearInterpolate,250,y);L(L3[0][i],pin,l1,'A');L(L3[1][i],pin,l1,'B');L(m1,'',l1,'Alpha')
    l2=X(unreal.MaterialExpressionLinearInterpolate,350,y);L(l1,'',l2,'A');L(L3[2][i],pin,l2,'B');L(m2,'',l2,'Alpha');return l2
bc=tri(0,'RGB',-600);nr=tri(1,'RGB',-300);ao=tri(2,'R',0);ro=tri(2,'G',150)
# fade normal strength with distance so the far field cannot read as a repeating bump grid
mac=noise(E('N3','.00055'),700);vm=X(unreal.MaterialExpressionMultiply,100,700);vm.set_editor_property('const_b',E('MACRO','.55'));L(mac,'',vm,'A');vc=X(unreal.MaterialExpressionAdd,200,700);vc.set_editor_property('const_b',E('MACRO0','.68'));L(vm,'',vc,'A')
ds=X(unreal.MaterialExpressionDesaturation,450,-600);ds.set_editor_property('luminance_factors',unreal.LinearColor(.3,.59,.11,0));L(bc,'',ds,'');f=X(unreal.MaterialExpressionConstant,350,-500);f.set_editor_property('r',E('DESAT','0.45'));L(f,'',ds,'Fraction')
g=X(unreal.MaterialExpressionMultiply,600,-600);L(ds,'',g,'A');L(vc,'',g,'B');t=X(unreal.MaterialExpressionMultiply,750,-600);L(g,'',t,'A');tc=X(unreal.MaterialExpressionConstant3Vector,600,-450);tc.set_editor_property('constant',unreal.LinearColor(E('TR','.62'),E('TG','.62'),E('TB','.64')));L(tc,'',t,'B')
P=unreal.MaterialProperty;mel.connect_material_property(t,'',P.MP_BASE_COLOR);mel.connect_material_property(nr,'',P.MP_NORMAL);mel.connect_material_property(ao,'',P.MP_AMBIENT_OCCLUSION);mel.connect_material_property(ro,'',P.MP_ROUGHNESS)
mel.recompile_material(m);eal.save_loaded_asset(m)
o=unreal.FbxImportUI();o.import_mesh=True;o.import_textures=False;o.import_materials=False;o.import_as_skeletal=False;o.mesh_type_to_import=unreal.FBXImportType.FBXIT_STATIC_MESH;o.static_mesh_import_data.generate_lightmap_u_vs=False;o.static_mesh_import_data.auto_generate_collision=False;o.static_mesh_import_data.combine_meshes=True
at.import_asset_tasks([task(G,'/Game/Floor/Mesh',o)])
gm=unreal.load_asset('/Game/Floor/Mesh/ground');gm=gm or unreal.load_asset(eal.list_assets('/Game/Floor/Mesh')[0]);gm.set_material(0,m);eal.save_loaded_asset(gm);bb=gm.get_bounding_box();print('GROUND_BOUNDS',bb.min,bb.max,gm.get_num_triangles(0))

C1=os.environ.get('C1_FBX')
hero=None
if C1:
    o=unreal.FbxImportUI();o.import_mesh=True;o.import_as_skeletal=True;o.import_animations=True;o.import_materials=False;o.import_textures=False;o.mesh_type_to_import=unreal.FBXImportType.FBXIT_SKELETAL_MESH;o.create_physics_asset=False
    o.skeletal_mesh_import_data.set_editor_property('import_morph_targets',False);o.skeletal_mesh_import_data.set_editor_property('normal_import_method',unreal.FBXNormalImportMethod.FBXNIM_IMPORT_NORMALS)
    at.import_asset_tasks([task(C1,'/Game/Floor/Hero',o)])
    names=eal.list_assets('/Game/Floor/Hero');print('HERO_ASSETS',names)
    sk=None;an=None
    for n in names:
        a=unreal.load_asset(n)
        if isinstance(a,unreal.SkeletalMesh):sk=a
        if isinstance(a,unreal.AnimSequence):an=a
    hm=at.create_asset('M_Clay','/Game/Floor',unreal.Material,unreal.MaterialFactoryNew())
    cc_=mel.create_material_expression(hm,unreal.MaterialExpressionConstant3Vector,-300,0);cc_.set_editor_property('constant',unreal.LinearColor(.46,.43,.41));mel.connect_material_property(cc_,'',P.MP_BASE_COLOR)
    rr=mel.create_material_expression(hm,unreal.MaterialExpressionConstant,-300,150);rr.set_editor_property('r',.62);mel.connect_material_property(rr,'',P.MP_ROUGHNESS);mel.recompile_material(hm);eal.save_loaded_asset(hm)
    mats=sk.get_editor_property('materials')
    for i in range(len(mats)):mats[i].set_editor_property('material_interface',hm)
    sk.set_editor_property('materials',mats);eal.save_loaded_asset(sk);print('HERO_SK',sk.get_name(),len(mats),an.get_name() if an else None)
    hero=(sk,an)
les=unreal.get_editor_subsystem(unreal.LevelEditorSubsystem);eas=unreal.get_editor_subsystem(unreal.EditorActorSubsystem)
les.new_level('/Game/Floor/L_11_Floor')
def S(c,loc=(0,0,0),rot=(0,0,0),lb=None):
    a=eas.spawn_actor_from_class(c,unreal.Vector(*loc),unreal.Rotator(roll=rot[2],pitch=rot[0],yaw=rot[1]));a.set_actor_label(lb or c.__name__);return a
g=S(unreal.StaticMeshActor,lb='Ground');g.static_mesh_component.set_static_mesh(gm);g.set_actor_scale3d(unreal.Vector(3,3,1))
sun=S(unreal.DirectionalLight,(0,0,3000),(E('SUN_P','-24'),E('SUN_Y','205'),0),'BackRim');lc=sun.light_component;lc.set_mobility(unreal.ComponentMobility.MOVABLE);lc.set_intensity(E('SUN_LUX','9'));lc.set_light_color(unreal.LinearColor(.74,.82,1));lc.set_editor_property('atmosphere_sun_light',True)
S(unreal.SkyAtmosphere,lb='Atmos')
sk=S(unreal.SkyLight,(0,0,2000),lb='Sky');sc=sk.light_component;sc.set_mobility(unreal.ComponentMobility.MOVABLE);sc.set_editor_property('real_time_capture',True);sc.set_intensity(E('SKY','0.55'));sc.set_light_color(unreal.LinearColor(.72,.8,1))
f=S(unreal.ExponentialHeightFog,(0,0,0),lb='Fog');fc=f.component;fc.set_editor_property('start_distance',E('FOG_START','0'));fc.set_editor_property('fog_density',E('FOG_D','.07'));fc.set_editor_property('fog_height_falloff',E('FOG_F','.35'));fc.set_editor_property('fog_inscattering_luminance',unreal.LinearColor(E('FOG_R','.06'),E('FOG_G','.085'),E('FOG_B','.11')))

if hero:
    sc_=.632;gz=E('GROUND_H_CM','0');ha=S(unreal.SkeletalMeshActor,(0,0,gz),(0,E('HERO_YAW','150'),0),'C1Hero');ha.set_actor_scale3d(unreal.Vector(sc_,sc_,sc_));sm=ha.skeletal_mesh_component;sm.set_skinned_asset_and_update(hero[0]);sm.set_editor_property('cast_shadow',True)
    if hero[1]:
        sm.set_animation_mode(unreal.AnimationMode.ANIMATION_SINGLE_NODE);ad=sm.get_editor_property('animation_data');ad.set_editor_property('anim_to_play',hero[1]);ad.set_editor_property('saved_position',E('HERO_T','0.0416667'));ad.set_editor_property('saved_play_rate',0.0);sm.set_editor_property('animation_data',ad)
    print('HERO_PLACED',gz)
pp=S(unreal.PostProcessVolume,(0,0,200),lb='PP');pp.set_editor_property('unbound',True);ps=pp.settings
for n,v in(('auto_exposure_method',unreal.AutoExposureMethod.AEM_MANUAL),('auto_exposure_apply_physical_camera_exposure',False),('auto_exposure_bias',E('EV','0.7')),('bloom_intensity',0.0),('motion_blur_amount',0.0),('vignette_intensity',0.0),('film_grain_intensity',0.0),('depth_of_field_fstop',32.0)):
    ps.set_editor_property('override_'+n,True);ps.set_editor_property(n,v)
pp.set_editor_property('settings',ps)
PIT=E('PITCH','33');b=1650*math.cos(math.radians(PIT))-148;u=1650*math.sin(math.radians(PIT))
cam=S(unreal.CameraActor,(-b,0,u),(-PIT,0,0),'GameCam');cc=cam.camera_component;cc.set_editor_property('constrain_aspect_ratio',False);cc.set_editor_property('field_of_view',75.3356);cam.set_editor_property('auto_activate_for_player',unreal.AutoReceiveInput.PLAYER0)
les.save_current_level();print('FLOOR_DONE',b,u)
