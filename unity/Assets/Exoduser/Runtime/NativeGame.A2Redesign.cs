using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        A2RLighting a2rLighting;A2RWebAssets a2rWeb;A2ROcclusion a2rOcclusion;A2RNatureDynamics a2rNature;
        static bool A2RRequested {get {var a=Environment.GetCommandLineArgs();return A2RHumanSave.CandidateDefault||Array.IndexOf(a,"--a2r1-light")>=0||Array.IndexOf(a,"--a2r1-light-capture")>=0||Array.IndexOf(a,"--a2-plan-capture")>=0;}}
        void A2RSetup()
        {
            if(!A2RRequested||a2rLighting!=null)return;
            var volumes=new List<Volume>();foreach(var root in r3Roots)volumes.AddRange(root.GetComponentsInChildren<Volume>(true));
            a2rLighting=a2Root.AddComponent<A2RLighting>();a2rLighting.Initialize(a2Root.transform,r3Cam,FindObjectsByType<Light>(FindObjectsInactive.Include,FindObjectsSortMode.None),volumes,()=>NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y));
            a2rLighting.SetHeroSprite(playerView);a2rLighting.Readability.SetOverlaps(A2RCollectOverlapRenderers);
            foreach(var p in Map.Data.props){if(p.id=="m_c1camp"){var at=NativeRemodel3D.Point(p.x,p.y);a2rLighting.AddLamp("A2R1 C10 camp fire",at+Vector3.up*1.3f,7.5f,9.5f,new Color(1,.32f,.08f));a2rLighting.AddLamp("A2R1 C10 camp glow",at+Vector3.up*.8f,4.8f,5.2f,new Color(1,.52f,.20f),false);}else if(p.id=="m_ctree15"||p.id=="m_c1altar")a2rLighting.AddLamp("A2R1 C10 red "+p.id,NativeRemodel3D.Point(p.x,p.y)+Vector3.up*1.2f,4.4f,4.56f,new Color(.92f,.18f,.14f));}
            a2rOcclusion=a2Root.AddComponent<A2ROcclusion>();a2rOcclusion.Initialize(a2Root.transform,r3Cam,()=>NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y));a2rOcclusion.SetCombatSource(A2RCollectCombat);a2rOcclusion.SetHeroBounds(()=>a2rLighting.Readability.HeroBounds);a2rWeb=a2Root.AddComponent<A2RWebAssets>();a2rWeb.Initialize(a2Root.transform,r3Cam,props,a2FieldSoil,a2Water,a2rOcclusion);a2rLighting.AnchorCamp(a2rWeb.CampFoot);a2rNature=a2Root.AddComponent<A2RNatureDynamics>();a2rNature.Initialize(a2Root.transform,a2rWeb.CampFoot,()=>NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y),A2RCollectNature);A2RSetLook(true);
        }
        void A2RCollectOverlapRenderers(List<SpriteRenderer> result)
        {
            foreach(var ev in enemies.Values){if(ev.body!=null)result.Add(ev.body);if(ev.walk!=null)result.Add(ev.walk);if(ev.arc!=null)result.Add(ev.arc);}
            foreach(var sr in GetComponentsInChildren<SpriteRenderer>())if(sr.name.StartsWith("Bolt ",StringComparison.Ordinal)||sr.transform.parent!=null&&sr.transform.parent.name=="BossView")result.Add(sr);
        }
        void A2RCollectNature(List<A2RNatureDynamics.Actor> result)
        {
            result.Add(new A2RNatureDynamics.Actor{id=int.MinValue,position=NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y),radius=1.2f});
            foreach(var e in Simulation.Enemies)if(e.Alive&&!Simulation.IsRemodelProp(e))result.Add(new A2RNatureDynamics.Actor{id=e.Id,position=NativeRemodel3D.Point(e.X,e.Y),radius=.95f});
            var center=NativeRemodel3D.Point(Simulation.Player.X,Simulation.Player.Y);result.Sort((a,b)=>(a.position-center).sqrMagnitude.CompareTo((b.position-center).sqrMagnitude));if(result.Count>32)result.RemoveRange(32,result.Count-32);
            foreach(var p in Simulation.Bolts)if(p.Active)result.Add(new A2RNatureDynamics.Actor{id=1000000+p.Id,position=NativeRemodel3D.Point(p.X,p.Y),projectile=true});
        }
        void A2RCollectCombat(List<Vector4> points)
        {
            // Read-only presentation data: no actor material/drawing or Core behavior changes.
            foreach(var e in Simulation.Enemies)if(e.Alive&&!Simulation.IsRemodelProp(e)){EnemyView ev;Vector3 at=enemies.TryGetValue(e.Id,out ev)&&ev.body.enabled?ev.body.bounds.center:NativeRemodel3D.Point(e.X,e.Y)+Vector3.up*.8f;points.Add(new Vector4(at.x,at.y,at.z,enemies.TryGetValue(e.Id,out ev)&&ev.body.enabled?Mathf.Max(.2f,ev.body.bounds.size.y):1.4f));}
            foreach(var p in Simulation.Bolts)if(p.Active){var at=NativeRemodel3D.Point(p.X,p.Y)+Vector3.up*.25f;points.Add(new Vector4(at.x,at.y,at.z,-.25f));}
            if(Simulation.Druid!=null)foreach(var p in Simulation.Druid.Projectiles)if(p.Active){var at=NativeRemodel3D.Point(p.X,p.Y)+Vector3.up*.35f;points.Add(new Vector4(at.x,at.y,at.z,-.35f));}
        }
        void A2RSetLook(bool on){a2rLighting.SetLook(on);a2rWeb.SetLook(on);a2rOcclusion.SetLook(on);if(a2rNature!=null)a2rNature.SetLook(on);}
        [Serializable] sealed class A2RPoint {public string id,kind;public float x,y;public int region;}
        [Serializable] sealed class A2RFrame {public string id,look;public float x,y,heroGroundY;public int width,height,fadedRenderers,maskTargets;public float cameraFov,cameraPitch;public Vector3 cameraPosition;public bool orthographic;}
        [Serializable] sealed class A2RReceipt {public string scope="Same-package fixed-position A/B assets/lighting fixture. Existing A2Field/SourceMap/actor renderer, no natural walk claim. Three occlusion poses are fixed-position samples. Structure uses a separate orthographic camera only.";public bool passed;public int errors;public List<A2RFrame> frames=new List<A2RFrame>();public List<A2RFrame> occlusionFrames=new List<A2RFrame>();public List<A2RFrame> foregroundFrames=new List<A2RFrame>();public List<Vector2> foregroundEnemies=new List<Vector2>();public int foregroundEnemyCount,foregroundVisibleEnemies,peakDroppedTargets;public Vector2 foregroundRequested,foregroundActual;public string foregroundPositionSource="Inferred from the user image's bridge torch; image has no Core coordinates. Verify same place on Mac; optional --a2r-foreground-x/y overrides are recorded.";}
        [Serializable] sealed class A2RStructure
        {
            public string scope="Actual A2Field world rendered by separate orthographic camera. HUD and actors hidden only during this image. Core unchanged. Ground/scenery are original A2Field.";
            public int imageWidth=4096,imageHeight=4096,tilesWide=200,tilesHigh=200,tilePixels=40;public float corePixelsPerUnit=100,worldMinX=-4,worldMaxX=84,worldMinZ=-84,worldMaxZ=4,pixelScale=4096f/8800,offsetCoreX=400,offsetCoreY=400,regionMidX,regionMidY;public string pixelFormula="imageX=(coreX+400)*4096/8800; imageY=(coreY+400)*4096/8800; worldX=coreX/100; worldZ=-coreY/100";public byte[] walk0,walkActor;public List<A2RPoint> points=new List<A2RPoint>();
        }
        IEnumerator A2RedesignCapture()
        {
            string output=Argument("-output");if(string.IsNullOrEmpty(output)||!NativeQaSandbox.Active){Application.Quit(2);yield break;}Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;smokeActive=true;pauseSmoke=true;keyshotErrors=0;Application.logMessageReceived+=KeyshotLog;
            lobby.AutomatedInput=true;lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;gameFocused=true;
            Simulation.Config.EnemyAiEnabled=false;float deadline=Time.realtimeSinceStartup+60;while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}if(!Remodel3DReady||a2Root==null){Debug.LogError("A2R original field did not become ready");Application.Quit(3);yield break;}A2RSetup();
            // Structure goes first, so its one-hour delivery does not depend on the lighting review.
            A2RSetLook(true);for(int i=0;i<4;i++){UpdateViews();yield return null;}A2RCaptureStructure(output);
            var receipt=new A2RReceipt();var shots=new[]{new Vector2(2200,4400),new Vector2(4320,7180)};var names=new[]{"camp","bridge"};var keyshots=new KeyshotReceipt();
            foreach(int width in new[]{1920,3840})
            {
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
#if UNITY_STANDALONE_WIN
                if(Screen.width!=width||Screen.height!=1080)FieldCaptureResize(width,1080);
#endif
                deadline=Time.realtimeSinceStartup+8;while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;if(Screen.width!=width||Screen.height!=1080){Debug.LogError("A2R actual native size mismatch");Application.Quit(3);yield break;}
                for(int s=0;s<shots.Length;s++)
                {
                    var p=shots[s];if(!Map.CanMove(p.x,p.y,Simulation.Player.Radius)){bool found=false;for(int radius=1;radius<=12&&!found;radius++)for(int n=0;n<32;n++){float a=n*Mathf.PI/16;var q=p+new Vector2(Mathf.Cos(a),Mathf.Sin(a))*radius*20;if(Map.CanMove(q.x,q.y,Simulation.Player.Radius)){p=q;found=true;break;}}if(!found)throw new InvalidOperationException("A2R capture position inaccessible");}
                    Simulation.Player.X=p.x;Simulation.Player.Y=p.y;lastX=p.x;lastY=p.y;Vector3 beforePosition=Vector3.zero;float beforeFov=0;
                    foreach(bool on in new[]{false,true})
                    {
                        A2RSetLook(on);for(int i=0;i<14;i++){UpdateViews();yield return null;}yield return new WaitForSecondsRealtime(.25f);UpdateViews();yield return null;string id=width+"-"+names[s]+(on?"-c10":"-original");yield return KeyshotSave(output,id,keyshots);
                        var f=new A2RFrame{id=id,look=on?"C10 lighting":"original unity/main",x=p.x,y=p.y,heroGroundY=NativeRemodel3D.GroundY(p.x/100,-p.y/100),width=Screen.width,height=Screen.height,cameraFov=r3Cam.fieldOfView,cameraPitch=r3Cam.transform.eulerAngles.x,cameraPosition=r3Cam.transform.position,orthographic=r3Cam.orthographic};receipt.frames.Add(f);if(!on){beforePosition=f.cameraPosition;beforeFov=f.cameraFov;}else if(Vector3.Distance(beforePosition,f.cameraPosition)>.0001f||Mathf.Abs(beforeFov-f.cameraFov)>.0001f||f.orthographic)Debug.LogError("A2R A/B camera lock mismatch");
                    }
                }
            }
            File.WriteAllText(Path.Combine(output,"web-assets-receipt.json"),JsonUtility.ToJson(a2rWeb.Result,true));
            A2RSetLook(true);Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
#if UNITY_STANDALONE_WIN
            if(Screen.width!=1920||Screen.height!=1080)FieldCaptureResize(1920,1080);
#endif
            deadline=Time.realtimeSinceStartup+8;while((Screen.width!=1920||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;
            if(Screen.width!=1920||Screen.height!=1080){Debug.LogError("A2R occlusion native size mismatch");Application.Quit(3);yield break;}
            var occlusionPoints=new[]{new Vector2(4780,7350),new Vector2(4790.811f,7142.689f),new Vector2(4780,6900)};
            for(int i=0;i<occlusionPoints.Length;i++)
            {
                var p=occlusionPoints[i];
                if(!Map.CanMove(p.x,p.y,Simulation.Player.Radius))
                {
                    bool found=false;for(int radius=1;radius<=12&&!found;radius++)for(int n=0;n<32;n++){float a=n*Mathf.PI/16;var q=p+new Vector2(Mathf.Cos(a),Mathf.Sin(a))*radius*20;if(Map.CanMove(q.x,q.y,Simulation.Player.Radius)){p=q;found=true;break;}}
                    if(!found){Debug.LogError("A2R occlusion pose inaccessible: "+(i+1));Application.Quit(3);yield break;}
                }
                Simulation.Player.X=p.x;Simulation.Player.Y=p.y;lastX=p.x;lastY=p.y;for(int j=0;j<24;j++){UpdateViews();yield return null;}yield return new WaitForSecondsRealtime(.25f);UpdateViews();yield return null;
                string id="1920-occlusion-"+(i+1);yield return KeyshotSave(output,id,keyshots);
                receipt.occlusionFrames.Add(new A2RFrame{id=id,look="web assets + C10 + circular fade",x=p.x,y=p.y,heroGroundY=NativeRemodel3D.GroundY(p.x/100,-p.y/100),width=Screen.width,height=Screen.height,cameraFov=r3Cam.fieldOfView,cameraPitch=r3Cam.transform.eulerAngles.x,cameraPosition=r3Cam.transform.position,orthographic=r3Cam.orthographic});
            }
            yield return A2RForegroundCapture(output,receipt,keyshots);
            receipt.errors=keyshotErrors;receipt.peakDroppedTargets=a2rOcclusion.PeakDroppedTargets;receipt.passed=keyshotErrors==0&&receipt.frames.Count==8&&receipt.occlusionFrames.Count==3&&receipt.foregroundFrames.Count==4&&receipt.foregroundVisibleEnemies>0&&receipt.peakDroppedTargets==0&&File.Exists(Path.Combine(output,"3840-foreground-current-vs-applied.png"))&&File.Exists(Path.Combine(output,"1920-foreground-current-vs-applied.png"))&&File.Exists(Path.Combine(output,"structure-original.png"))&&File.Exists(Path.Combine(output,"structure-coordinates.json"));File.WriteAllText(Path.Combine(output,"a2r1-capture.json"),JsonUtility.ToJson(receipt,true));Application.logMessageReceived-=KeyshotLog;lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();Application.Quit(receipt.passed?0:3);
        }
        IEnumerator A2RForegroundCapture(string output,A2RReceipt receipt,KeyshotReceipt keyshots)
        {
            // Same static scene for both sides: only masks toggle, not lighting/art/actors/camera.
            A2RSetLook(true);var desired=new Vector2(3640,7420);float value;
            if(float.TryParse(Argument("--a2r-foreground-x"),System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out value))desired.x=value;
            if(float.TryParse(Argument("--a2r-foreground-y"),System.Globalization.NumberStyles.Float,System.Globalization.CultureInfo.InvariantCulture,out value))desired.y=value;
            receipt.foregroundRequested=desired;var point=WideLegal(desired.x,desired.y);receipt.foregroundActual=point;
            Simulation.Player.X=point.x;Simulation.Player.Y=point.y;lastX=point.x;lastY=point.y;Simulation.Enemies.Clear();Simulation.SpawnHoles=null;Simulation.CrossbowAuto=false;
            for(int n=0;n<128&&receipt.foregroundEnemyCount<12;n++){float angle=n*2.399963f;var at=point+new Vector2(Mathf.Cos(angle)*(220+n%4*40),-120-Mathf.Abs(Mathf.Sin(angle))*280);if(!Map.CanMove(at.x,at.y,20))continue;if(Simulation.SpawnEnemy(at.x,at.y,n%4,null,false)!=null){receipt.foregroundEnemyCount++;receipt.foregroundEnemies.Add(at);}}
            if(receipt.foregroundEnemyCount<4){Debug.LogError("A2R foreground fixture has too few legal enemies");yield break;}
            foreach(int width in new[]{3840,1920})
            {
                Screen.SetResolution(width,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.5f);
#if UNITY_STANDALONE_WIN
                if(Screen.width!=width||Screen.height!=1080)FieldCaptureResize(width,1080);
#endif
                float deadline=Time.realtimeSinceStartup+8;while((Screen.width!=width||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;
                if(Screen.width!=width||Screen.height!=1080){Debug.LogError("A2R foreground native size mismatch");yield break;}
                Vector3 before=Vector3.zero;float fov=0;
                foreach(bool on in new[]{false,true})
                {
                    a2rOcclusion.SetMasksEnabled(on);for(int j=0;j<24;j++){UpdateViews();yield return null;}yield return new WaitForSecondsRealtime(.35f);UpdateViews();yield return null;
                    string id=width+"-foreground-"+(on?"applied":"current");yield return KeyshotSave(output,id,keyshots);
                    var frame=new A2RFrame{id=id,look=on?"battle occlusion alpha .35":"same A2R look, masks OFF",x=point.x,y=point.y,width=Screen.width,height=Screen.height,cameraPosition=r3Cam.transform.position,cameraFov=r3Cam.fieldOfView,cameraPitch=r3Cam.transform.eulerAngles.x,orthographic=r3Cam.orthographic,heroGroundY=NativeRemodel3D.GroundY(point.x/100,-point.y/100),fadedRenderers=a2rOcclusion.FadedRenderers,maskTargets=a2rOcclusion.VisibleTargets};receipt.foregroundFrames.Add(frame);if(on&&frame.fadedRenderers==0)Debug.LogError("A2R foreground fixture did not exercise an occluding tree");
                    if(!on){before=frame.cameraPosition;fov=frame.cameraFov;}else if(Vector3.Distance(before,frame.cameraPosition)>.0001f||Mathf.Abs(fov-frame.cameraFov)>.0001f||frame.orthographic)Debug.LogError("A2R foreground A/B camera mismatch");
                    int visible=0;foreach(var e in Simulation.Enemies)if(e.Alive){var v=r3Cam.WorldToViewportPoint(NativeRemodel3D.Point(e.X,e.Y)+Vector3.up*.8f);if(v.z>0&&v.x>0&&v.x<1&&v.y>0&&v.y<1)visible++;}receipt.foregroundVisibleEnemies=visible;if(visible==0)Debug.LogError("A2R foreground image has no visible enemy targets");
                }
                A2RJoinForeground(output,width);
            }
        }
        static void A2RJoinForeground(string output,int width)
        {
            var left=new Texture2D(2,2,TextureFormat.RGBA32,false);var right=new Texture2D(2,2,TextureFormat.RGBA32,false);Texture2D board=null;
            try{if(!left.LoadImage(File.ReadAllBytes(Path.Combine(output,width+"-foreground-current.png")))||!right.LoadImage(File.ReadAllBytes(Path.Combine(output,width+"-foreground-applied.png")))||left.width!=width||right.width!=width||left.height!=1080||right.height!=1080)throw new InvalidOperationException("A2R foreground comparison input size mismatch");board=new Texture2D(width*2,1080,TextureFormat.RGB24,false);board.SetPixels32(0,0,width,1080,left.GetPixels32());board.SetPixels32(width,0,width,1080,right.GetPixels32());board.Apply();File.WriteAllBytes(Path.Combine(output,width+"-foreground-current-vs-applied.png"),board.EncodeToPNG());}finally{Destroy(left);Destroy(right);if(board!=null)Destroy(board);}
        }
        void A2RCaptureStructure(string output)
        {
            var data=new A2RStructure{regionMidX=(float)Simulation.RegMidX*Map.Data.tileSize,regionMidY=(float)Simulation.RegMidY*Map.Data.tileSize,walk0=new byte[40000],walkActor=new byte[40000]};
            for(int y=0;y<200;y++)for(int x=0;x<200;x++){float px=(x+.5f)*40,py=(y+.5f)*40;data.walk0[y*200+x]=Map.CanMove(px,py,0)?(byte)1:(byte)0;data.walkActor[y*200+x]=Map.CanMove(px,py,Simulation.Player.Radius)?(byte)1:(byte)0;}
            data.points.Add(new A2RPoint{id="START",kind="start",x=Map.Data.startX,y=Map.Data.startY});int n=0;foreach(var h in Exoduser.UnityPort.Core.SpawnHoleSystem.Stage0Holes)data.points.Add(new A2RPoint{id="H"+(++n).ToString("00"),kind="spawnHole",x=(float)h[0],y=(float)h[1],region=Simulation.RegionIdxAt(h[0],h[1])});
            if(Simulation.FieldBosses!=null)foreach(var b in Simulation.FieldBosses)if(b!=null)data.points.Add(new A2RPoint{id="FB"+(b.Index+1),kind="fieldBoss",x=(float)b.HomeX,y=(float)b.HomeY,region=Simulation.RegionIdxAt(b.HomeX,b.HomeY)});
            if(data.points.FindAll(p=>p.kind=="fieldBoss").Count!=4)
            {
                // Capture metadata only: read the Core definition without spawning or changing bosses.
                var definition=typeof(Exoduser.UnityPort.Core.Simulation).GetField("FieldBossSites",System.Reflection.BindingFlags.Static|System.Reflection.BindingFlags.NonPublic);
                var sites=definition!=null?definition.GetValue(null) as int[][]:null;if(sites==null||sites.Length!=4)throw new InvalidOperationException("A2R Core field-boss definition unavailable");
                data.points.RemoveAll(p=>p.kind=="fieldBoss");for(int i=0;i<sites.Length;i++){float x=(sites[i][0]+.5f)*Map.Data.tileSize,y=(sites[i][1]+.5f)*Map.Data.tileSize;data.points.Add(new A2RPoint{id="FB"+(i+1),kind="fieldBoss",x=x,y=y,region=Simulation.RegionIdxAt(x,y)});}
            }
            foreach(var p in Map.Data.props)if(p.id=="m_c1camp"||p.id=="m_ctree15")data.points.Add(new A2RPoint{id=p.id,kind=p.id=="m_c1camp"?"camp":"portal",x=p.x,y=p.y});
            for(int i=0;i<Map.Data.tiles.Length;i++)if(Map.Data.tiles[i]==2||Map.Data.tiles[i]==3)data.points.Add(new A2RPoint{id=(Map.Data.tiles[i]==2?"EXIT":"GATE")+i,kind=Map.Data.tiles[i]==2?"arenaEntrance":"gate",x=(i%200+.5f)*40,y=(i/200+.5f)*40});
            var bridge=a2Root.transform.Find("A2 시작 목교");if(bridge!=null)data.points.Add(new A2RPoint{id="BRIDGE",kind="bridge",x=bridge.position.x*100,y=-bridge.position.z*100});
            a2rOcclusion.SetLook(false);Shader.SetGlobalInt("_A2RTargetCount",0);var hidden=new List<Renderer>();foreach(var r in FindObjectsByType<Renderer>(FindObjectsInactive.Exclude,FindObjectsSortMode.None))if(r.enabled&&(r is SpriteRenderer&&NativeHd2D.IsActor((SpriteRenderer)r)||r is SkinnedMeshRenderer||r.name.StartsWith("HD2D contact: ",StringComparison.Ordinal)||r.name=="A2R1 short hero ground contact")){hidden.Add(r);r.enabled=false;}
            var go=new GameObject("A2R structure-only camera");var camera=go.AddComponent<Camera>();camera.CopyFrom(r3Cam);camera.enabled=false;camera.orthographic=true;camera.orthographicSize=44;camera.aspect=1;camera.transform.SetPositionAndRotation(new Vector3(40,125,-40),Quaternion.Euler(90,0,0));camera.nearClipPlane=.1f;camera.farClipPlane=250;camera.cullingMask&=~((1<<5)|(1<<30)|(1<<31));var aa=camera.GetUniversalAdditionalCameraData();aa.renderPostProcessing=true;aa.requiresDepthTexture=true;
            var rt=RenderTexture.GetTemporary(4096,4096,24,RenderTextureFormat.ARGB32);var previous=RenderTexture.active;try{camera.targetTexture=rt;camera.Render();RenderTexture.active=rt;var image=new Texture2D(4096,4096,TextureFormat.RGB24,false);image.ReadPixels(new Rect(0,0,4096,4096),0,0);image.Apply();File.WriteAllBytes(Path.Combine(output,"structure-original.png"),image.EncodeToPNG());Destroy(image);}finally{RenderTexture.active=previous;camera.targetTexture=null;RenderTexture.ReleaseTemporary(rt);Destroy(go);foreach(var r in hidden)if(r!=null)r.enabled=true;a2rOcclusion.SetLook(true);}
            File.WriteAllText(Path.Combine(output,"structure-coordinates.json"),JsonUtility.ToJson(data,true));
        }
    }
}
