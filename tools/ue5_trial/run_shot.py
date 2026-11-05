import unreal,os,time,json
OUT=os.environ['UE_OUT'];TAG=os.environ['UE_TAG'];FOV=float(os.environ.get('UE_FOV','75.3356'));WARM=float(os.environ.get('UE_WARM','45'))
t0=time.time();st={'phase':0,'dt':[],'shot':0};CV=['r.DynamicGlobalIlluminationMethod','r.ReflectionMethod','r.Shadow.Virtual.Enable','r.AntiAliasingMethod','r.ScreenPercentage','r.Nanite','r.RayTracing','r.Lumen.HardwareRayTracing','r.DefaultFeature.AutoExposure','r.GenerateMeshDistanceFields']
def W():
    return unreal.find_object(None,'/Game/Floor/L_11_Floor.L_11_Floor')
def tick(dt):
    try:
        _t(dt)
    except Exception as e:
        print('RUN_SHOT_ERR',e);unreal.unregister_slate_post_tick_callback(H);unreal.SystemLibrary.execute_console_command(W(),'quit')
def _t(dt):
    w=W();el=time.time()-t0
    if w is None:
        if el>600:unreal.SystemLibrary.quit_editor()
        return
    if st['phase']==0:
        for c in unreal.GameplayStatics.get_all_actors_of_class(w,unreal.CameraActor):
            c.camera_component.set_editor_property('field_of_view',FOV);c.camera_component.set_editor_property('aspect_ratio',float(os.environ.get('UE_ASPECT','1.7777778')));c.camera_component.set_editor_property('constrain_aspect_ratio',True);print('CAM',c.get_actor_location(),c.get_actor_rotation())
        for a in unreal.GameplayStatics.get_all_actors_of_class(w,unreal.Pawn):
            a.set_actor_hidden_in_game(True)
        cv={n:unreal.SystemLibrary.get_console_variable_int_value(n) for n in CV}
        json.dump(cv,open(f'{OUT}/{TAG}.cvars.json','w'),indent=1);st['phase']=1;st['t1']=time.time();return
    if st['phase']==1:
        if time.time()-st['t1']>WARM:st['phase']=2;st['t2']=time.time();return
        return
    if st['phase']==2:
        st['dt'].append(dt)
        if time.time()-st['t2']>10:
            a=sorted(st['dt']);n=len(a);json.dump({'frames':n,'mean_ms':sum(a)/n*1000,'p50_ms':a[n//2]*1000,'p95_ms':a[int(n*.95)]*1000,'fps':n/sum(a),'warm_s':WARM},open(f'{OUT}/{TAG}.perf.json','w'),indent=1)
            unreal.SystemLibrary.execute_console_command(w,'Shot');st['phase']=3;st['t3']=time.time()
        return
    if st['phase']==3 and time.time()-st['t3']>6:
        print('SHOT_DONE',TAG);unreal.SystemLibrary.execute_console_command(w,'quit');st['phase']=4
H=unreal.register_slate_post_tick_callback(tick);print('RUN_SHOT_ARMED',TAG)
