using System;
using System.IO;
using System.Reflection;
using UnityEditor;
using UnityEditor.SceneManagement;
using UnityEngine;
using Exoduser.UnityPort;

namespace Exoduser
{
    // 제품 규칙 테스트가 아닌 실제 Unity 투영/발밑 회귀 검사. 별도 빈 장면에서만 실행한다.
    public static class Hd2dRuntimeVerification
    {
        static void Check(bool ok,string message) { if(!ok)throw new Exception("HD2D verification: "+message); }
        public static void ActorAnchors()
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var camera=new GameObject("HD2D test camera").AddComponent<Camera>();
            var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
            var texture=Resources.Load<Texture2D>("Art/player/north-east");
            var sprite=Sprite.Create(texture,new Rect(0,0,48,48),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
            var actor=new GameObject("HD2D test actor").AddComponent<SpriteRenderer>();actor.sprite=sprite;
            int cases=0;float worst=0;
            foreach(bool orthographic in new[]{false,true}) foreach(float pitch in new[]{35f,48.7014126f,65f})
            foreach(float scale in new[]{2f,4f})foreach(float roll in new[]{0f})
            {
                camera.orthographic=orthographic;camera.orthographicSize=5.4f;camera.fieldOfView=46.9453f;
                camera.transform.rotation=Quaternion.Euler(pitch,0,0);camera.transform.position=-camera.transform.forward*14;
                var ground=new Vector3(.137f,.41f,.263f);actor.transform.position=ground;actor.transform.localScale=Vector3.one*scale;
                NativeHd2D.Actor(actor);NativeHd2D.BeginProjection();NativeHd2D.ProjectActor(actor,camera,roll);
                // 원본 north-east 첫프레임 alpha>64 발선 = 하단5px. 데이터 테이블 계산식을 기대값으로 재사용하지 않는다.
                var foot=actor.transform.TransformPoint(new Vector3(0,(5f-24f)/100f,0));
                var a=camera.WorldToScreenPoint(foot);var b=camera.WorldToScreenPoint(ground);
                float error=Vector2.Distance(new Vector2(a.x,a.y),new Vector2(b.x,b.y));worst=Mathf.Max(worst,error);
                Check(error<=.72f,"actor visible foot / Core anchor gap "+error+"px");
                Check(actor.sharedMaterial.shader.name=="EXODUSER/HD2D/SpriteLit","actor lighting shader");
                Check(texture.filterMode==FilterMode.Point,"point sampling");cases++;
            }
            camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);
            Debug.Log("[HD2D] ACTOR_ANCHORS PASS cases="+cases+" worstPx="+worst);
        }
        public static void RollCentre()
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var camera=new GameObject("HD2D roll camera").AddComponent<Camera>();
            camera.transform.SetPositionAndRotation(new Vector3(0,8,-8),Quaternion.Euler(48.7014126f,0,0));
            var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
            var texture=Resources.Load<Texture2D>("Art/player/north-east");
            var sprite=Sprite.Create(texture,new Rect(0,0,48,48),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
            var actor=new GameObject("HD2D roll actor").AddComponent<SpriteRenderer>();actor.sprite=sprite;
            var ground=new Vector3(.137f,.41f,.263f);
            foreach(float roll in new[]{0f,90f,180f,270f})
            {
                actor.transform.position=ground;actor.transform.localScale=Vector3.one*4;NativeHd2D.Actor(actor,false,.72f);
                NativeHd2D.BeginProjection();NativeHd2D.ProjectActor(actor,camera,roll);
                Check(actor.transform.position.y>ground.y+.4f,"rolling actor centre sank into terrain at "+roll);
            }
            camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);
            Debug.Log("[HD2D] ROLL_CENTRE PASS 4 quadrants; full silhouette requires Player sequence");
        }
        public static void DruidPivotFoot()
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var type=typeof(NativeGame).Assembly.GetType("Exoduser.UnityPort.NativeDruidArt");
            var sprite=(Sprite)type.GetMethod("EmergeCell",BindingFlags.Public|BindingFlags.Static).Invoke(null,new object[]{3});
            var camera=new GameObject("HD2D druid test camera").AddComponent<Camera>();
            camera.orthographic=true;camera.orthographicSize=5.4f;camera.transform.position=new Vector3(0,0,-10);
            var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
            var actor=new GameObject("Druid actual emerge cell").AddComponent<SpriteRenderer>();actor.sprite=sprite;
            var ground=new Vector3(.137f,.263f,0);actor.transform.position=ground;actor.transform.localScale=Vector3.one*1.4f;
            NativeHd2D.Actor(actor,true);NativeHd2D.ProjectFlatActors(camera);
            float error=Vector2.Distance(camera.WorldToScreenPoint(ground),camera.WorldToScreenPoint(actor.transform.position));
            Check(error<=.72f,"druid emerge pivot unexpectedly lifted "+error+"px");
            Check(GameObject.Find("HD2D contact: Druid actual emerge cell")!=null,"arena contact shadow missing");
            camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);
            Debug.Log("[HD2D] DRUID_PIVOT PASS gapPx="+error);
        }
        public static void RepeatedProjection()
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var camera=new GameObject("HD2D repeat camera").AddComponent<Camera>();
            new GameObject("HD2D repeat light").AddComponent<Light>().type=LightType.Directional;
            var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
            var texture=Resources.Load<Texture2D>("Art/player/north-east");
            var sprite=Sprite.Create(texture,new Rect(0,0,48,48),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
            int cases=0;float worst=0;
            try
            {
                foreach(bool flat in new[]{false,true})foreach(bool ortho in new[]{false,true})
                foreach(bool footPivot in new[]{false,true})foreach(float roll in new[]{0f,90f,180f,270f})
                {
                    var parent=new GameObject("source parent");
                    var actor=new GameObject("repeat actor").AddComponent<SpriteRenderer>();
                    var overlay=new GameObject("repeat overlay").AddComponent<SpriteRenderer>();
                    actor.transform.SetParent(parent.transform,false);overlay.transform.SetParent(parent.transform,false);
                    actor.sprite=overlay.sprite=sprite;
                    var raw=new Vector3(.137f,.41f,.263f);
                    var rawRotation=Quaternion.Euler(0,0,roll);
                    actor.transform.localPosition=overlay.transform.localPosition=raw;
                    actor.transform.localRotation=overlay.transform.localRotation=rawRotation;
                    actor.transform.localScale=overlay.transform.localScale=Vector3.one*4;
                    NativeHd2D.Actor(actor,footPivot,.72f);NativeHd2D.Overlay(overlay,actor);
                    camera.orthographic=ortho;camera.fieldOfView=46.9453f;camera.orthographicSize=5.4f;
                    camera.transform.SetPositionAndRotation(new Vector3(0,0,-14),Quaternion.identity);
                    for(int phase=0;phase<5;phase++)
                    {
                        if(phase==1){camera.orthographicSize=6.8f;camera.transform.rotation=Quaternion.Euler(48.7f,13f,0);}
                        if(phase==2){camera.orthographicSize=5.4f;camera.transform.rotation=Quaternion.identity;}
                        if(phase==3){parent.transform.SetPositionAndRotation(new Vector3(.29f,.17f,.11f),Quaternion.Euler(0,0,17));}
                        if(phase==4)
                        {
                            NativeHd2D.RestoreSourcePoses();
                            raw+=new Vector3(.37f,-.19f,.13f);
                            // 적 writer처럼 rotation을 다시 쓰지 않고 위치만 갱신한다.
                            actor.transform.localPosition=overlay.transform.localPosition=raw;
                            NativeHd2D.Actor(actor,footPivot,.72f);NativeHd2D.Overlay(overlay,actor);
                        }
                        float sourceRoll=(parent.transform.rotation*rawRotation).eulerAngles.z;
                        var source=parent.transform.TransformPoint(raw);
                        var control=new GameObject("fresh control").AddComponent<SpriteRenderer>();
                        control.sprite=sprite;control.transform.position=source;
                        control.transform.rotation=Quaternion.Euler(0,0,sourceRoll);control.transform.localScale=Vector3.one*4;
                        NativeHd2D.Actor(control,footPivot,.72f);
                        NativeHd2D.ProjectActor(control,camera,sourceRoll,!flat);
                        var expected=control.transform.position;
                        var expectedRotation=control.transform.rotation;
                        for(int repeat=0;repeat<4;repeat++)
                        {
                            NativeHd2D.BeginProjection();
                            NativeHd2D.ProjectActor(actor,camera,sourceRoll,!flat);
                            NativeHd2D.ProjectActor(overlay,camera,sourceRoll,!flat);
                            float px=Vector2.Distance(camera.WorldToScreenPoint(expected),camera.WorldToScreenPoint(actor.transform.position));
                            worst=Mathf.Max(worst,px);
                            Check(px<.02f,"repeat/source-parent error "+px+"px phase="+phase);
                            Check(Quaternion.Angle(actor.transform.rotation,expectedRotation)<.02f,"original roll lost");
                            Check((overlay.transform.position-actor.transform.position).sqrMagnitude<1e-10f,"overlay foot separated");
                            Check(GameObject.Find("HD2D contact: repeat overlay")==null,"overlay duplicated contact");
                            cases++;
                        }
                        UnityEngine.Object.DestroyImmediate(control.gameObject);
                    }
                    UnityEngine.Object.DestroyImmediate(parent);NativeHd2D.BeginProjection();
                }
            }
            finally
            {
                camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);
                UnityEngine.Object.DestroyImmediate(sprite);
            }
            Debug.Log("[HD2D] REPEATED_PROJECTION PASS cases="+cases+" worstPx="+worst);
        }
        public static void FarWorldPixelGrid()
        {
UnityEditor.SceneManagement.EditorSceneManager.NewScene(UnityEditor.SceneManagement.NewSceneSetup.EmptyScene,UnityEditor.SceneManagement.NewSceneMode.Single);
var camera=new GameObject("translated snap camera").AddComponent<Camera>();
var light=new GameObject("translated snap light").AddComponent<Light>();light.type=LightType.Directional;
var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
camera.fieldOfView=Exoduser.UnityPort.NativeRemodelCamera.FieldOfView;camera.transform.rotation=Exoduser.UnityPort.NativeRemodelCamera.Rotation;
float worst=0;int failures=0,cases=0;string worstCase="";
try {
foreach(bool ortho in new[]{false,true}) foreach(int width in new[]{1920,3840}) {
camera.orthographic=ortho;camera.orthographicSize=5.4f;
rt.Release();rt.width=width;
foreach(float x in new[]{0f,40.2f,80.137f,150.137f})
foreach(float z in new[]{-.263f,-73.96f,-120.137f,-190.137f})
for(int k=0;k<32;k++) {
var source=new Vector3(x,.004f*k,z+.0317f*k);
camera.transform.position=source+Exoduser.UnityPort.NativeRemodelCamera.FollowOffset+Exoduser.UnityPort.NativeRemodelCamera.TargetOffset;
var anchor=Exoduser.UnityPort.NativeHd2D.SnapAnchor(camera,source);
var centre=anchor+camera.transform.up*.76f;
var foot=centre-camera.transform.up*.76f;
var screen=camera.WorldToScreenPoint(foot);
float error=Vector2.Distance(new Vector2(screen.x,screen.y),new Vector2(Mathf.Round(screen.x),Mathf.Round(screen.y)));
if(error>worst){worst=error;worstCase=width+" "+source+" "+screen;}if(error>.02f)failures++;cases++;
}
}
Check(failures==0,"far-world pixel grid failures="+failures+" max="+worst+" "+worstCase);
Debug.Log("[HD2D] FAR_WORLD_PIXEL_GRID PASS cases="+cases+" worstPx="+worst);
} finally {camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);UnityEngine.Object.DestroyImmediate(camera.gameObject);UnityEngine.Object.DestroyImmediate(light.gameObject);}

        }
        public static void ArenaFraming()
        {
UnityEditor.SceneManagement.EditorSceneManager.NewScene(UnityEditor.SceneManagement.NewSceneSetup.EmptyScene,UnityEditor.SceneManagement.NewSceneMode.Single);
var host=new GameObject("HD2D framing fixture");var game=host.AddComponent<Exoduser.UnityPort.NativeGame>();
var camera=new GameObject("HD2D framing camera").AddComponent<Camera>();camera.orthographic=true;camera.orthographicSize=6.75f;
var light=new GameObject("HD2D framing light").AddComponent<Light>();light.type=LightType.Directional;
var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
var texture=Resources.Load<Texture2D>("Art/player/north-east");var sprite=Sprite.Create(texture,new Rect(0,0,48,48),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
var player=new GameObject("framing hero").AddComponent<SpriteRenderer>();player.transform.SetParent(host.transform,false);player.sprite=sprite;player.transform.localScale=Vector3.one*4;
var flags=System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic;
var gt=typeof(Exoduser.UnityPort.NativeGame);
gt.GetField("view",flags).SetValue(game,camera);gt.GetField("playerView",flags).SetValue(game,player);
var sim=new Exoduser.UnityPort.Core.Simulation(Exoduser.UnityPort.Core.SourceStarterFixture.CreateKiSlash(),1);
sim.AttachDruidBoss();var boss=sim.Stage.BossSpawners[0](sim,2560,2560);sim.Stage.InArena=true;
gt.GetProperty("Simulation").SetValue(game,sim,null);
var bodyType=gt.Assembly.GetType("Exoduser.UnityPort.NativeDruidBody");
var body=System.Activator.CreateInstance(bodyType,new object[]{host.transform,sprite});gt.GetField("druidBody",flags).SetValue(game,body);
var draw=bodyType.GetMethod("Draw");var fit=gt.GetMethod("Hd2dArenaFrame",flags);
var d=sim.Druid.Data[boss];int cases=0;float minY=1,maxY=0,minX=1,maxX=0;var errors=new System.Collections.Generic.List<string>();
try{
foreach(int width in new[]{1920,3840})foreach(var offset in new[]{new Vector2(650,0),new Vector2(-650,150),new Vector2(100,650)})
foreach(string state in new[]{"idle","bossFanWind","bossCharge","bossDruidDive"}){
Exoduser.UnityPort.NativeHd2D.RestoreSourcePoses();rt.Release();rt.width=width;
sim.Player.X=boss.X+offset.x;sim.Player.Y=boss.Y+offset.y;
player.transform.position=Exoduser.UnityPort.NativeRemodel3D.Point2D(sim.Player.X,sim.Player.Y);player.transform.rotation=Quaternion.identity;
Exoduser.UnityPort.NativeHd2D.Actor(player);
d.S=state;d.St2=25;d.DiveMax=50;draw.Invoke(body,new object[]{boss,d,true});
camera.transform.position=new Vector3(sim.Player.X/100,-sim.Player.Y/100,-10);camera.orthographicSize=6.75f;
fit.Invoke(game,null);
var unshaken=camera.transform.position;var shake=new Vector3(.03f,-.02f,0);
gt.GetField("hd2dCameraShake",flags).SetValue(game,shake);fit.Invoke(game,null);
if((camera.transform.position-unshaken-shake).magnitude>.00001f)errors.Add("arena shake lost");
gt.GetField("hd2dCameraShake",flags).SetValue(game,Vector3.zero);fit.Invoke(game,null);
var core=Exoduser.UnityPort.NativeRemodel3D.Point2D(sim.Player.X,sim.Player.Y);var screen=camera.WorldToScreenPoint(core);screen.z=0;var inverse=camera.ScreenToWorldPoint(screen);
if(Vector2.Distance(inverse,core)*100>.02f)errors.Add("arena AimWorld roundtrip");
Exoduser.UnityPort.NativeHd2D.ProjectFlatActors(camera);
foreach(var renderer in host.GetComponentsInChildren<SpriteRenderer>())if(renderer.enabled){
var b=renderer.bounds;foreach(var point in new[]{b.min,b.max}){
var v=camera.WorldToViewportPoint(point);minX=Mathf.Min(minX,v.x);maxX=Mathf.Max(maxX,v.x);minY=Mathf.Min(minY,v.y);maxY=Mathf.Max(maxY,v.y);
if(v.x<.077f||v.x>.923f||v.y<.197f||v.y>.883f)errors.Add(width+" "+state+" "+renderer.name+" "+v);
}}
cases++;
}
Check(errors.Count==0,"arena framing "+(errors.Count>0?errors[0]:""));Debug.Log("[HD2D] ARENA_FRAMING PASS cases="+cases+" viewport="+new Vector4(minX,minY,maxX,maxY)+" shake/Aim retained");
}finally{camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);UnityEngine.Object.DestroyImmediate(host);UnityEngine.Object.DestroyImmediate(camera.gameObject);UnityEngine.Object.DestroyImmediate(light.gameObject);UnityEngine.Object.DestroyImmediate(sprite);Exoduser.UnityPort.NativeHd2D.BeginProjection();}

        }
        public static void ArenaApproach()
        {
UnityEditor.SceneManagement.EditorSceneManager.NewScene(UnityEditor.SceneManagement.NewSceneSetup.EmptyScene,UnityEditor.SceneManagement.NewSceneMode.Single);
var host=new GameObject("HD2D framing fixture");var game=host.AddComponent<Exoduser.UnityPort.NativeGame>();
var camera=new GameObject("HD2D framing camera").AddComponent<Camera>();camera.orthographic=true;camera.orthographicSize=6.75f;
var light=new GameObject("HD2D framing light").AddComponent<Light>();light.type=LightType.Directional;
var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
var texture=Resources.Load<Texture2D>("Art/player/north-east");var sprite=Sprite.Create(texture,new Rect(0,0,48,48),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
var player=new GameObject("framing hero").AddComponent<SpriteRenderer>();player.transform.SetParent(host.transform,false);player.sprite=sprite;player.transform.localScale=Vector3.one*4;
var flags=System.Reflection.BindingFlags.Instance|System.Reflection.BindingFlags.NonPublic;
var gt=typeof(Exoduser.UnityPort.NativeGame);
gt.GetField("view",flags).SetValue(game,camera);gt.GetField("playerView",flags).SetValue(game,player);
var sim=new Exoduser.UnityPort.Core.Simulation(Exoduser.UnityPort.Core.SourceStarterFixture.CreateKiSlash(),1);
sim.AttachDruidBoss();var boss=sim.Stage.BossSpawners[0](sim,2560,2560);sim.Stage.InArena=true;
gt.GetProperty("Simulation").SetValue(game,sim,null);
var bodyType=gt.Assembly.GetType("Exoduser.UnityPort.NativeDruidBody");
var body=System.Activator.CreateInstance(bodyType,new object[]{host.transform,sprite});gt.GetField("druidBody",flags).SetValue(game,body);
var draw=bodyType.GetMethod("Draw");var fit=gt.GetMethod("Hd2dArenaFrame",flags);
var d=sim.Druid.Data[boss];int cases=0;float minY=1,maxY=0,minX=1,maxX=0;var errors=new System.Collections.Generic.List<string>();
try{
var sizes=new System.Collections.Generic.List<float>();
for(int phase=0;phase<3;phase++){
Exoduser.UnityPort.NativeHd2D.RestoreSourcePoses();
if(phase==2){sim.Stage.InArena=false;gt.GetMethod("BossCameraZoom",flags).Invoke(game,null);sim.Stage.InArena=true;}
sim.Player.X=boss.X+(phase==0?0:650);sim.Player.Y=boss.Y+(phase==0?2000:0);
player.transform.position=Exoduser.UnityPort.NativeRemodel3D.Point2D(sim.Player.X,sim.Player.Y);player.transform.rotation=Quaternion.identity;
Exoduser.UnityPort.NativeHd2D.Actor(player);
d.S="idle";draw.Invoke(body,new object[]{boss,d,true});
camera.transform.position=new Vector3(sim.Player.X/100,-sim.Player.Y/100,-10);camera.orthographicSize=6.75f;
fit.Invoke(game,null);sizes.Add(camera.orthographicSize);Exoduser.UnityPort.NativeHd2D.ProjectFlatActors(camera);
}
Check(sizes[1]<=sizes[2]+.001f,"arena entrance zoom retained "+sizes[1]+" vs "+sizes[2]);Debug.Log("[HD2D] ARENA_APPROACH PASS entry="+sizes[0]+" approach="+sizes[1]+" fresh="+sizes[2]);
}finally{camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);UnityEngine.Object.DestroyImmediate(host);UnityEngine.Object.DestroyImmediate(camera.gameObject);UnityEngine.Object.DestroyImmediate(light.gameObject);UnityEngine.Object.DestroyImmediate(sprite);Exoduser.UnityPort.NativeHd2D.BeginProjection();}

        }
        public static void CollisionCentre()
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var game=new GameObject("HD2D centre fixture").AddComponent<NativeGame>();
            var camera=new GameObject("HD2D centre camera").AddComponent<Camera>();
            camera.transform.SetPositionAndRotation(new Vector3(0,8,-8),Quaternion.Euler(48.7014126f,0,0));
            var rt=new RenderTexture(1920,1080,24);camera.targetTexture=rt;
            typeof(NativeGame).GetField("r3Cam",BindingFlags.Instance|BindingFlags.NonPublic).SetValue(game,camera);
            var texture=new Texture2D(64,64);var sprite=Sprite.Create(texture,new Rect(0,0,64,64),new Vector2(.5f,.5f),100,0,SpriteMeshType.FullRect);
            var bullet=new GameObject("projectile").AddComponent<SpriteRenderer>();bullet.sprite=sprite;
            var anchor=new Vector3(.2f,.1f,0);bullet.transform.position=anchor;
            typeof(NativeGame).GetMethod("Remodel3DBillboards",BindingFlags.Instance|BindingFlags.NonPublic).Invoke(game,null);
            float gap=Vector2.Distance(camera.WorldToScreenPoint(anchor),camera.WorldToScreenPoint(bullet.transform.position));
            camera.targetTexture=null;rt.Release();UnityEngine.Object.DestroyImmediate(rt);
            Check(gap<=.72f,"projectile centre shifted from Core by "+gap+"px");
            Debug.Log("[HD2D] COLLISION_CENTRE PASS gapPx="+gap);
        }
        public static void Shaders()
        {
            foreach(string name in new[]{"Shaders/HD2DSpriteLit","Shaders/HD2DContact"})
            {
                var shader=Resources.Load<Shader>(name);Check(shader!=null,"shader missing "+name);
                foreach(var msg in ShaderUtil.GetShaderMessages(shader))
                    Check(msg.severity!=UnityEditor.Rendering.ShaderCompilerMessageSeverity.Error,msg.message);
            }
            Debug.Log("[HD2D] SHADERS PASS");
        }
    }
}
