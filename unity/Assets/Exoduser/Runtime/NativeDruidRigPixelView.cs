using System;using System.Collections.Generic;using System.IO;using UnityEngine;using UnityEngine.Rendering;using UnityEngine.Rendering.Universal;using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    // The hero/enemy Point-RT contract, isolated boss layer. No Core or camera pose writer.
    [DefaultExecutionOrder(1002)] public sealed class NativeDruidRigPixelView:MonoBehaviour
    {
        const int Layer=27;const string Resource="Art/Bosses/Druid/OldmanV91",HeapResource="Art/Bosses/Druid/HuskHeapP3";
        [Serializable] sealed class ImportData {public string sourceVersion,sourceSha256;public float hornHeight,meshHeight,huskFootRadiusMetres,oldManFootRadiusMetres,huskTopMetres;public int boneCount,chestEmissionFaces;}
        GameObject root,model,heap;Transform orb;Renderer[] skins,huskSkins,manSkins,heapSkins;
        // v9.1 husk/old-man/heap state. Scale rule (PREP 10.1): the footprint circle at the feet equals the Core hit radius in world units, no display multiplier.
        Simulation.DruidLifeState life;int introStart=int.MinValue;bool heapPlaced,heapOnly;Vector3 heapPosition,anchorLocal;Quaternion heapRotation;float heapScale,unitsPerMetre,huskFootUnits,manFootUnits;
        float rootScale,oldManFactor,anchorWeight,coreRadiusPx,coreRadiusWorld,footprintWorld,bodyHeightWorld,ankleSpanWorld;int lifeIndex;string drawnParts="";Camera capture;MeshRenderer image,contact;Material composite,shadow;RenderTexture texture;
        readonly List<Material> materials=new List<Material>();readonly Dictionary<Camera,int> masks=new Dictionary<Camera,int>();
        Func<Camera> cameraSource;Action hideDefault;string output;ImportData imported;NativeDruidRigAnimator motion;
        UniversalRenderPipeline.SingleCameraRequest request;EnemyState enemy;DruidData data;Bounds bounds;Vector3 ground;
        int tick,sinkTick,renderedFrame=-1,lastMotionTick=int.MinValue;float lastX,lastY;bool coreMoving;bool failed,active,sinking,frozen;float hornUnits,baseRadius,projectedHeight;
        Light[] lights=Array.Empty<Light>();int nextLights;readonly Vector4[] lightPositions=new Vector4[4],lightColors=new Vector4[4];readonly float[] lightDistances=new float[4];Light moon;
        public bool Ready {get;private set;}public int RenderCount {get;private set;}public int TexelScale {get;private set;}public int TextureWidth {get{return texture==null?0:texture.width;}}public float RenderMilliseconds {get;private set;}
        public Bounds Bounds {get{return bounds;}}
        // Read-only lantern_orb socket for VFX (slash-3 telegraph). Live transform of the orb under StaffSocket_L, sampled by this view's LateUpdate; no authored offset.
        public bool HasOrbSocket {get{return !failed&&Ready&&orb!=null;}}
        public Vector3 OrbSocketWorldPosition {get{return orb!=null?orb.position:Vector3.zero;}}
        public static NativeDruidRigPixelView Current {get;private set;}
        public static bool TryGetOrbSocketWorldPosition(out Vector3 position)
        {
            var view=Current;if(view!=null&&view.HasOrbSocket){position=view.OrbSocketWorldPosition;return true;}
            position=Vector3.zero;return false;
        }
        public void Initialize(Func<Camera> cameraSource,Action hideDefault,string output)
        {
            this.cameraSource=cameraSource;this.hideDefault=hideDefault;this.output=output;
            try
            {
                var info=Resources.Load<TextAsset>("Art/Bosses/Druid/oldman-import");if(info==null)throw new InvalidOperationException("oldman import receipt missing");imported=JsonUtility.FromJson<ImportData>(info.text);
                var prefab=Resources.Load<GameObject>(Resource);var toon=Resources.Load<Shader>("Shaders/DruidRigPixelToon");var compose=Resources.Load<Shader>("Shaders/RigPixelComposite");
                if(prefab==null||toon==null||compose==null||imported.hornHeight<=0||imported.meshHeight<=0)throw new InvalidOperationException("v9.1 model/metadata/shared pixel shaders missing");
                if(imported.huskFootRadiusMetres<=0||imported.oldManFootRadiusMetres<=0)throw new InvalidOperationException("v9.1 footprint radii missing from the import receipt");
                root=new GameObject("Druid rig-pixel Core root");root.transform.SetParent(transform,false);model=Instantiate(prefab,root.transform);model.transform.localPosition=Vector3.zero;model.transform.localRotation=Quaternion.identity;model.transform.localScale=Vector3.one;
                foreach(var tr in model.GetComponentsInChildren<Transform>(true))tr.gameObject.layer=Layer;
                skins=model.GetComponentsInChildren<Renderer>(true);if(skins.Length==0)throw new InvalidOperationException("v9.1 has no renderer");
                var huskList=new List<Renderer>();var manList=new List<Renderer>();foreach(var r in skins)(r.name.StartsWith("Husk_",StringComparison.Ordinal)?huskList:manList).Add(r);huskSkins=huskList.ToArray();manSkins=manList.ToArray();
                if(huskSkins.Length<10||manSkins.Length!=4)throw new InvalidOperationException("v9.1 renderer split unexpected: husk "+huskSkins.Length+" old man "+manSkins.Length);
                Renderer body=null;Transform left=null,right=null,socket=null;
                foreach(var tr in model.GetComponentsInChildren<Transform>(true)){if(tr.name=="LeftFoot")left=tr;if(tr.name=="RightFoot")right=tr;if(tr.name=="StaffSocket_L")socket=tr;}
                foreach(var r in skins)if(r.name=="char1")body=r;
                if(body==null||left==null||right==null||socket==null)throw new InvalidOperationException("v9.1 body/feet/staff socket missing");
                if(socket.parent==null||socket.parent.name!="OM_Staff"||socket.parent.parent==null||socket.parent.parent.name!="LeftHand")throw new InvalidOperationException("StaffSocket_L must hang under OM_Staff under LeftHand");
                foreach(var tr in socket.GetComponentsInChildren<Transform>(true))if(tr.name=="lantern_orb"){orb=tr;break;}
                if(orb==null)throw new InvalidOperationException("v9.1 lantern_orb under StaffSocket_L missing");
                var bodyBox=body.bounds;unitsPerMetre=bodyBox.size.y/imported.meshHeight;hornUnits=unitsPerMetre*imported.hornHeight;if(hornUnits<=.0001f)throw new InvalidOperationException("v9.1 horn units invalid");
                huskFootUnits=imported.huskFootRadiusMetres*unitsPerMetre;manFootUnits=imported.oldManFootRadiusMetres*unitsPerMetre;
                var foot=(left.position+right.position)*.5f;foot.y=bodyBox.min.y;model.transform.position-=foot-root.transform.position;
                Retarget(skins,toon);
                var heapPrefab=Resources.Load<GameObject>(HeapResource);if(heapPrefab==null)throw new InvalidOperationException("HuskHeapP3 model missing");
                heap=Instantiate(heapPrefab,transform);heap.name="Druid husk heap";foreach(var tr in heap.GetComponentsInChildren<Transform>(true))tr.gameObject.layer=Layer;
                heapSkins=heap.GetComponentsInChildren<Renderer>(true);if(heapSkins.Length==0)throw new InvalidOperationException("HuskHeapP3 has no renderer");Retarget(heapSkins,toon);heap.SetActive(false);
                motion=new NativeDruidRigAnimator(model,Resource);
                foreach(string clip in NativeDruidRigPolicy.AllClips)if(Array.IndexOf(motion.AvailableClips,clip)<0)throw new InvalidOperationException("Provided v9.1 clip did not import: "+clip);
                if(!motion.HasOverlays)throw new InvalidOperationException("v9.1 state_P1/2/3 overlays or their bones are missing");
                if(!motion.AvatarValid||motion.Humanoid)throw new InvalidOperationException("Expected valid Generic Avatar; keep existing boss");
                // Static P3 anchor: where the old man's feet stand relative to the husk origin (OM_Lift offset of state_P3), measured once at unit scale. Used to put the P3 feet on the Core boss position.
                motion.Configure(true,-1,null);motion.Sample(new DruidData{S="idle",BossPhase=2},int.MinValue+7,false,false);
                var feetMid=root.transform.InverseTransformPoint((motion.LeftFoot+motion.RightFoot)*.5f);anchorLocal=new Vector3(feetMid.x,0,feetMid.z);
                capture=new GameObject("Druid rig-pixel capture").AddComponent<Camera>();capture.transform.SetParent(transform,false);capture.enabled=false;capture.orthographic=true;capture.clearFlags=CameraClearFlags.SolidColor;capture.backgroundColor=Color.clear;capture.cullingMask=1<<Layer;capture.nearClipPlane=.05f;capture.farClipPlane=24;capture.allowHDR=false;capture.allowMSAA=false;
                var extra=capture.GetUniversalAdditionalCameraData();extra.renderPostProcessing=false;extra.renderShadows=false;extra.requiresColorOption=CameraOverrideOption.Off;extra.requiresDepthOption=CameraOverrideOption.Off;extra.volumeLayerMask=0;
                composite=new Material(compose);image=Quad("Druid rig-pixel composite",composite);var contactShader=Resources.Load<Shader>("Shaders/HD2DContact");if(contactShader!=null){shadow=new Material(contactShader);contact=Quad("Druid rig ground contact",shadow);}request=new UniversalRenderPipeline.SingleCameraRequest();
                Current=this;Debug.Log("[DruidRig] imported="+imported.sourceVersion+" selected=Generic avatarValid="+motion.AvatarValid+" humanoid="+motion.Humanoid+" clips="+string.Join(",",motion.AvailableClips)+" source="+imported.sourceSha256);
            }
            catch(Exception error){Fail(error);}
        }
        void Retarget(Renderer[] renderers,Shader toon)
        {
                foreach(var r in renderers)
                {
                    var old=r.sharedMaterials;var replacement=new Material[old.Length];
                    for(int i=0;i<old.Length;i++)
                    {
                        string name=old[i]==null?"":old[i].name.Replace(" (Instance)","");string hex=NativeDruidRigPolicy.Palette(name);Color color;if(hex==null||!ColorUtility.TryParseHtmlString(hex,out color))throw new InvalidOperationException("Unmapped v9.1 material: "+name);
                        var mat=new Material(toon){name="Druid rig-pixel "+name};mat.SetColor("_PaletteColor",color);mat.SetColor("_BaseColor",Color.white);mat.SetFloat("_MetallicPlane",0);
                        float tag=name=="druid_feather"||name=="front_panel_cloth"?.7f:name=="staff_leather"?.8f:name=="druid_bark"||name=="staff_bark"||name=="druid_husk_bark"?.6f:1;
                        mat.SetFloat("_SurfaceTag",tag);mat.SetFloat("_DruidGroundClip",1);mat.SetFloat("_DruidGroundY",0);mat.SetFloat("_DruidGlow",name=="lantern_orb"||name=="druid_glow"?1:0);Color amber;ColorUtility.TryParseHtmlString("#d49a5c",out amber);mat.SetColor("_DruidEmission",amber);
                        replacement[i]=mat;materials.Add(mat);
                    }
                    r.sharedMaterials=replacement;r.shadowCastingMode=ShadowCastingMode.Off;r.receiveShadows=false;r.forceRenderingOff=true;if(r is SkinnedMeshRenderer skin)skin.updateWhenOffscreen=true;
                }
        }
        MeshRenderer Quad(string name,Material material)
        {
            var go=GameObject.CreatePrimitive(PrimitiveType.Quad);go.name=name;go.transform.SetParent(transform,false);Destroy(go.GetComponent<Collider>());var renderer=go.GetComponent<MeshRenderer>();renderer.sharedMaterial=material;renderer.shadowCastingMode=ShadowCastingMode.Off;renderer.receiveShadows=false;renderer.enabled=false;return renderer;
        }
        // lifeState = Simulation.DruidLife(boss) (Core, read only). null = the web-phase boss without lives: old man alone (state_P3), no collapse.
        public void Sync(EnemyState boss,DruidData state,int coreTick,bool sink,int sinkAge,bool poseFrozen,Simulation.DruidLifeState lifeState=null)
        {
            if(failed)return;enemy=boss;data=state;tick=coreTick;sinking=sink;sinkTick=sinkAge;frozen=poseFrozen;life=lifeState;
            bool arena=boss!=null&&state!=null&&NativeRemodel3D.ArenaActive&&(boss.Alive||sink);
            // The heap is a world prop: while the old man is burrowed (bossDruidUnder) the view keeps drawing the heap alone.
            heapOnly=arena&&heapPlaced&&!sink&&state.S=="bossDruidUnder";
            active=arena&&(state.S!="bossDruidUnder"||heapOnly);
            if(!active){Hide();return;}
            if(lastMotionTick!=coreTick){coreMoving=lastMotionTick!=int.MinValue&&(Mathf.Abs(boss.X-lastX)+Mathf.Abs(boss.Y-lastY)>.001f);lastX=boss.X;lastY=boss.Y;lastMotionTick=coreTick;}
            if(baseRadius<=0)baseRadius=(float)Math.Max(.01,state.R);
        }
        // Core raised StageEventKind.BossIntro (boss stunned NativeDruidRigPolicy.IntroTicks): play intro_reveal over that window, view only.
        public void BeginIntro(int coreTick){introStart=coreTick;heapPlaced=false;}
        public void Deactivate(){active=false;Hide();}
        void Hide(){Ready=false;if(image!=null)image.enabled=false;if(contact!=null)contact.enabled=false;}
        static Rect ScreenBounds(Camera camera,Bounds box)
        {
            float x0=float.PositiveInfinity,y0=x0,x1=float.NegativeInfinity,y1=x1;
            for(int n=0;n<8;n++){var p=camera.WorldToScreenPoint(box.center+Vector3.Scale(box.extents,new Vector3((n&1)==0?-1:1,(n&2)==0?-1:1,(n&4)==0?-1:1)));if(p.z<=camera.nearClipPlane)throw new InvalidOperationException("Boss intersects capture near plane");x0=Mathf.Min(x0,p.x);x1=Mathf.Max(x1,p.x);y0=Mathf.Min(y0,p.y);y1=Mathf.Max(y1,p.y);}
            return Rect.MinMaxRect(x0,y0,x1,y1);
        }
        void HideLayer(Camera camera){if(camera==null||camera==capture)return;if(!masks.ContainsKey(camera))masks[camera]=camera.cullingMask;camera.cullingMask&=~(1<<Layer);}
  void Lighting(Vector3 ground){
   if(lights.Length==0||Time.frameCount>=nextLights){lights=FindObjectsByType<Light>(FindObjectsSortMode.None);nextLights=Time.frameCount+120;}moon=null;for(int i=0;i<4;i++){lightPositions[i]=lightColors[i]=Vector4.zero;lightDistances[i]=float.MaxValue;}
   foreach(var l in lights){if(l==null||!l.isActiveAndEnabled||l.intensity<=0)continue;if(l.type==LightType.Directional){if(moon==null||l.intensity>moon.intensity)moon=l;continue;}if(l.type!=LightType.Point)continue;float d=(l.transform.position-ground).sqrMagnitude;if(d>l.range*l.range||d>=lightDistances[3])continue;int k=3;while(k>0&&d<lightDistances[k-1]){lightDistances[k]=lightDistances[k-1];lightPositions[k]=lightPositions[k-1];lightColors[k]=lightColors[k-1];k--;}lightDistances[k]=d;var p=l.transform.position;lightPositions[k]=new Vector4(p.x,p.y,p.z,l.range);var c=l.color.linear*l.intensity;lightColors[k]=new Vector4(c.r,c.g,c.b,1);}
   Shader.SetGlobalVector("_RigPixelMoonDirection",moon!=null?-moon.transform.forward:Vector3.up);Shader.SetGlobalColor("_RigPixelMoonColor",moon!=null?moon.color.linear*moon.intensity:Color.black);Shader.SetGlobalColor("_RigPixelAmbient",RenderSettings.ambientEquatorColor.linear);Shader.SetGlobalVectorArray("_RigPixelPointPositions",lightPositions);Shader.SetGlobalVectorArray("_RigPixelPointColors",lightColors);
  }

        static float Smooth(float x){x=Mathf.Clamp01(x);return x*x*(3-2*x);}
        double RadiusPx(int index)
        {   // the Core's own rule (Simulation.DruidRemodel RemodelNextLife): BossRemodelSet.RadiusFor = LifeRadius, else Max(10, Round(OrigR * BodyScale[life]))
            if(life!=null&&life.Set!=null&&life.Set.BodyScale!=null&&index<life.Set.BodyScale.Length)return life.Set.RadiusFor(index,life.OrigR);
            return Math.Max(.01,data.R);
        }
        void LateUpdate()
        {
            if(failed||!active||enemy==null||data==null||renderedFrame==Time.frameCount){if(!active)Hide();return;}
            if(!enemy.Alive&&!sinking){Hide();return;}
            var camera=cameraSource==null?null:cameraSource();if(camera==null||!camera.isActiveAndEnabled||!NativeRemodel3D.ArenaActive){Hide();return;}
            try
            {
                HideLayer(camera);HideLayer(Camera.main);
                bool showMan,showHusk,showHeap;float sortY;
                if(heapOnly)
                {
                    ground=heapPosition;sortY=-heapPosition.z*100;showMan=showHusk=false;showHeap=true;
                }
                else
                {
                    bool remodel=life!=null;
                    int collapse=remodel&&life.Collapsing?life.Set.CollapseTicks-life.CollapseTicks:-1;
                    NativeDruidRigPolicy.Plan? forced=null;
                    if(sinking)forced=NativeDruidRigPolicy.Death(sinkTick,NativeGame.SinkBodyTicks);
                    else if(introStart!=int.MinValue)
                    {
                        int elapsed=tick-introStart;
                        if(elapsed>=0&&elapsed<NativeDruidRigPolicy.IntroTicks&&NativeDruidRigPolicy.StateMove(data.S)==null)forced=NativeDruidRigPolicy.Intro(elapsed);
                        else if(elapsed>=NativeDruidRigPolicy.IntroTicks||NativeDruidRigPolicy.StateMove(data.S)!=null)introStart=int.MinValue;
                    }
                    motion.Configure(remodel,collapse,forced);
                    var plan=motion.PlanFor(data,coreMoving);lifeIndex=plan.Life;
                    ground=NativeRemodel3D.Point(enemy.X,enemy.Y);sortY=enemy.Y;
                    float pxToWorld=Vector3.Distance(NativeRemodel3D.Point(enemy.X+1,enemy.Y),ground);
                    float[] husk=new float[3];for(int n=0;n<3;n++)husk[n]=(float)RadiusPx(n)*pxToWorld/huskFootUnits;
                    float man=(float)RadiusPx(2)*pxToWorld/manFootUnits;
                    bool c12=plan.Name=="phase12_collapse",c23=plan.Name=="phase23_collapse";
                    float frame=(float)plan.Frame;
                    if(c12){rootScale=Mathf.Lerp(husk[0],husk[1],Smooth(frame/120f));oldManFactor=1;}
                    else if(c23){rootScale=husk[1];oldManFactor=Mathf.Lerp(1,man/husk[1],Smooth((frame-40f)/68f));}
                    else if(plan.Name=="intro_reveal"){rootScale=husk[0];oldManFactor=1;}
                    else{rootScale=husk[plan.Life];oldManFactor=plan.Life==2?man/husk[2]:1;}
                    anchorWeight=c23?Smooth((frame-NativeDruidRigPolicy.Phase23WalkFrom)/(NativeDruidRigPolicy.Phase23HuskOffFrame-NativeDruidRigPolicy.Phase23WalkFrom)):plan.Life==2&&plan.Name!="intro_reveal"?1:0;
                    bool huskOff=plan.Life==2&&!c23||c23&&frame>=NativeDruidRigPolicy.Phase23HuskOffFrame;
                    showHusk=!huskOff;showMan=plan.Life>=1||c12||c23;showHeap=huskOff;
                    if(plan.Name=="intro_reveal")showMan=false;
                    root.transform.SetPositionAndRotation(ground,Quaternion.Euler(0,Mathf.Atan2(Mathf.Cos(enemy.Facing),-Mathf.Sin(enemy.Facing))*Mathf.Rad2Deg,0));root.transform.localScale=Vector3.one*rootScale;
                    motion.OldManScale=oldManFactor;
                    motion.Sample(data,tick,coreMoving,frozen);
                    if(anchorWeight>0)
                    {   // P3: the old man stands 2.7 m in front of the husk origin as authored; move the root so his feet are on the Core boss position
                        var feet=root.transform.TransformPoint(anchorLocal*oldManFactor);var shift=ground-feet;shift.y=0;root.transform.position+=shift*anchorWeight;
                    }
                    if(showHusk||plan.Name=="intro_reveal")heapPlaced=false;
                    else if(showHeap&&!heapPlaced){heapPosition=model.transform.position;heapRotation=model.transform.rotation;heapScale=model.transform.lossyScale.x;heapPlaced=true;}
                    coreRadiusPx=(float)data.R;coreRadiusWorld=coreRadiusPx*pxToWorld;
                }
                if(showHeap)
                {
                    float sunk=0;if(sinking&&motion.Phase.Name=="death_sink")sunk=Smooth(((float)motion.Phase.Frame-30f)/120f)*(imported.huskTopMetres*unitsPerMetre*heapScale+.2f);
                    heap.transform.SetPositionAndRotation(heapPosition-Vector3.up*sunk,heapRotation);heap.transform.localScale=Vector3.one*heapScale;
                }
                if(heap.activeSelf!=showHeap)heap.SetActive(showHeap);
                var drawList=new List<Renderer>();
                if(showMan)drawList.AddRange(manSkins);if(showHusk)drawList.AddRange(huskSkins);if(showHeap)drawList.AddRange(heapSkins);
                if(drawList.Count==0){Hide();return;}
                drawnParts=(showHusk?"husk ":"")+(showMan?"oldman ":"")+(showHeap?"heap":"");
                foreach(var mat in materials){mat.SetFloat("_DruidGroundY",ground.y);mat.SetFloat("_DruidGlowStrength",mat.name.EndsWith("druid_glow",StringComparison.Ordinal)?(motion==null?1:motion.ChestPulse):1);}
                bounds=drawList[0].bounds;foreach(var renderer in drawList)bounds.Encapsulate(renderer.bounds);
                if(!heapOnly)
                {
                    ankleSpanWorld=showHusk?Vector3.Distance(motion.HuskLeftFoot,motion.HuskRightFoot):Vector3.Distance(motion.LeftFoot,motion.RightFoot);
                    footprintWorld=(showHusk?huskFootUnits:manFootUnits)*root.transform.lossyScale.x*(showHusk?1:oldManFactor);
                    bodyHeightWorld=showHusk?imported.huskTopMetres*unitsPerMetre*root.transform.lossyScale.x:hornUnits*root.transform.lossyScale.x*oldManFactor;
                }
                var foot=camera.WorldToScreenPoint(ground);if(foot.z<=0){Hide();return;}
                var box=ScreenBounds(camera,bounds);projectedHeight=box.height;float wpp=(camera.ScreenToWorldPoint(foot+Vector3.up)-ground).magnitude;TexelScale=NativeRigPixelPolicy.TexelScale(camera.pixelHeight);
                int size=NativeRigPixelPolicy.TextureSize(wpp,TexelScale,(Mathf.Max(box.width,box.height)+4*TexelScale)*wpp);if(size==0)throw new InvalidOperationException("Druid exceeds safe RT canvas");
                if(texture==null||texture.width!=size){if(texture!=null){texture.Release();Destroy(texture);}texture=new RenderTexture(size,size,24,RenderTextureFormat.ARGB32,RenderTextureReadWrite.Linear){name="Druid Point RT",filterMode=FilterMode.Point,wrapMode=TextureWrapMode.Clamp,antiAliasing=1,useMipMap=false,autoGenerateMips=false};texture.Create();composite.SetTexture("_MainTex",texture);}
                float extent=size*wpp*TexelScale,cx=Mathf.Round((box.center.x-foot.x)/TexelScale)*wpp*TexelScale,cy=Mathf.Round((box.center.y-foot.y)/TexelScale)*wpp*TexelScale;
                capture.orthographicSize=extent*.5f;capture.aspect=1;capture.transform.SetPositionAndRotation(ground+camera.transform.right*cx+camera.transform.up*cy-camera.transform.forward*8,camera.transform.rotation);request.destination=texture;
                var snap=NativeHd2D.SnapAnchor(camera,ground);image.transform.SetPositionAndRotation(snap+camera.transform.right*cx+camera.transform.up*cy,camera.transform.rotation);image.transform.localScale=new Vector3(extent,extent,1);image.sortingOrder=(int)sortY;
                Lighting(ground);var direction=moon!=null?-moon.transform.forward:Vector3.up;composite.SetVector("_RimDirection",new Vector4(Vector3.Dot(direction,camera.transform.right),Vector3.Dot(direction,camera.transform.up),0,0));composite.SetColor("_RimColor",(moon!=null?moon.color:Color.white)*.08f);
                double before=Time.realtimeSinceStartupAsDouble;foreach(var renderer in drawList)renderer.forceRenderingOff=false;
                try{if(!RenderPipeline.SupportsRenderRequest(capture,request))throw new InvalidOperationException("URP SingleCameraRequest unavailable");RenderPipeline.SubmitRenderRequest(capture,request);}finally{foreach(var renderer in drawList)renderer.forceRenderingOff=true;}
                RenderMilliseconds=(float)((Time.realtimeSinceStartupAsDouble-before)*1000);RenderCount++;renderedFrame=Time.frameCount;Ready=true;image.enabled=true;hideDefault?.Invoke();
                if(contact!=null){contact.enabled=!sinking&&!heapOnly;if(contact.enabled){float r=coreRadiusWorld;contact.transform.SetPositionAndRotation(ground+Vector3.up*.018f,Quaternion.Euler(90,0,0));contact.transform.localScale=new Vector3(2.73f*r,1.59f*r,1);contact.sortingOrder=image.sortingOrder-1;}}
            }
            catch(Exception error){Fail(error);}
        }
        [Serializable] public sealed class Frame
        {
            public string mode="rigpixel",modelResource=Resource,sourceVersion,sourceSha,coreState,moveId,pose,clip,gate="Mac import/visual/performance pending";
            public string overlay,drawnParts;public int life;public bool heapPlaced;public float coreRadiusPx,coreRadiusWorld,rootScale,oldManFactor,anchorWeight,footprintRadiusWorld,bodyHeightWorld,bodyHeightHeroRatio,ankleSpanWorld,heroIdleWorld;public bool ready,failed,missingClip,humanoid,avatarValid;public int tick,frame,renders,rtSize,texelScale,missingStates,chestEmissionFaces;public float renderMs,hornWorldHeight,projectedBoundsHeightPx;public int rawAlphaHeightPx;public string rawAlphaScope="isolated raw RT before composite cleanup/outline and world occlusion; includes roots and staff";public Bounds bounds;public Vector3 leftFoot,rightFoot;public float sampleSeconds,sourceFrame,coreStageTicks,elapsedStageTicks,footDeltaCm;public bool horizontalRootStripped,held;public string footDeltaScope="per rendered Core sample world ankle displacement, includes Core movement/turning and authored vertical lifts; not a slip PASS";
        }
        public Frame CaptureFrame(){return new Frame{overlay=motion==null?"":motion.Overlay,drawnParts=drawnParts,life=lifeIndex,heapPlaced=heapPlaced,coreRadiusPx=coreRadiusPx,coreRadiusWorld=coreRadiusWorld,rootScale=rootScale,oldManFactor=oldManFactor,anchorWeight=anchorWeight,footprintRadiusWorld=footprintWorld,bodyHeightWorld=bodyHeightWorld,bodyHeightHeroRatio=NativeArenaActorMetrics.HeroIdleWorld>0?bodyHeightWorld/NativeArenaActorMetrics.HeroIdleWorld:0,ankleSpanWorld=ankleSpanWorld,heroIdleWorld=NativeArenaActorMetrics.HeroIdleWorld,sourceVersion=imported==null?"":imported.sourceVersion,sourceSha=imported==null?"":imported.sourceSha256,chestEmissionFaces=imported==null?0:imported.chestEmissionFaces,coreState=data==null?"":data.S,moveId=data==null?"":data.RmMoveId,pose=motion==null?"":motion.Role,clip=motion==null?"":motion.Clip,ready=Ready,failed=failed,missingClip=motion==null||motion.MissingClip,humanoid=motion!=null&&motion.Humanoid,avatarValid=motion!=null&&motion.AvatarValid,tick=tick,frame=renderedFrame,renders=RenderCount,rtSize=TextureWidth,texelScale=TexelScale,missingStates=motion==null?0:motion.MissingStates,renderMs=RenderMilliseconds,projectedBoundsHeightPx=projectedHeight,hornWorldHeight=bodyHeightWorld,bounds=bounds,leftFoot=motion==null?Vector3.zero:motion.LeftFoot,rightFoot=motion==null?Vector3.zero:motion.RightFoot,sampleSeconds=motion==null?0:motion.SampleSeconds,sourceFrame=motion==null?0:motion.SampleSeconds*60,coreStageTicks=motion==null?0:(float)motion.Phase.CoreTicks,elapsedStageTicks=motion==null?0:(float)motion.Phase.ElapsedTicks,footDeltaCm=motion==null?0:motion.FootDeltaCm,horizontalRootStripped=motion!=null&&motion.Phase.StripHorizontalRoot,held=motion!=null&&motion.Phase.Held};}
        public int CaptureRawRt(string path)
        {
            if(!Ready||texture==null)return -1;
            var previous=RenderTexture.active;var sample=new Texture2D(texture.width,texture.height,TextureFormat.RGBA32,false,true);
            try
            {
                RenderTexture.active=texture;sample.ReadPixels(new Rect(0,0,texture.width,texture.height),0,0);sample.Apply(false);
                var pixels=sample.GetRawTextureData<Color32>();int lo=texture.height,hi=-1;
                for(int y=0;y<texture.height;y++)for(int x=0;x<texture.width;x++)if(pixels[y*texture.width+x].a>32){lo=Mathf.Min(lo,y);hi=Mathf.Max(hi,y);break;}
                File.WriteAllBytes(path,sample.EncodeToPNG());return hi>=lo?(hi-lo+1)*TexelScale:0;
            }
            finally{RenderTexture.active=previous;Destroy(sample);}
        }
        public void WriteReceipt(string directory){if(string.IsNullOrEmpty(directory))return;Directory.CreateDirectory(directory);File.WriteAllText(Path.Combine(directory,"druid-rigpixel.json"),JsonUtility.ToJson(CaptureFrame(),true));}
        void Fail(Exception error){failed=true;Hide();if(root!=null)root.SetActive(false);Debug.LogWarning("[DruidRig] existing boss fallback, once: "+error.Message);}
        void OnDestroy(){if(Current==this)Current=null;WriteReceipt(output);motion?.Dispose();foreach(var pair in masks)if(pair.Key!=null)pair.Key.cullingMask=(pair.Key.cullingMask&~(1<<Layer))|(pair.Value&(1<<Layer));if(texture!=null){texture.Release();Destroy(texture);}foreach(var mat in materials)Destroy(mat);if(composite!=null)Destroy(composite);if(shadow!=null)Destroy(shadow);if(root!=null)Destroy(root);if(capture!=null)Destroy(capture.gameObject);if(image!=null)Destroy(image.gameObject);if(contact!=null)Destroy(contact.gameObject);}
    }
}
