using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.Video;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // Explicit, sandboxed Player-only inspection of the selected facing and ground-zone changes.
    public sealed partial class NativeGame
    {
        [Serializable] sealed class FgFrame { public string name, mode, capture; public int width,height,tick,dir,walkFrame; public bool moving,bodyEnabled,walkEnabled; public float enemyX,enemyY,playerX,playerY; public double coreFacing,webFacing; }
        [Serializable] sealed class FgSurface { public string name,capture; public int vertices,triangles; public float x,z,terrainY,fieldY,gradient,maxVertexHeightError; public bool sourceHidden,meshEnabled,bridgeFound; public int ringCount,ringPoints; public bool ringsWorldSpace; public float maxRingHeightError; }
        [Serializable] sealed class FgReceipt { public string scope="QA state injection in the real Player; not natural play or user installation", sandbox, mode; public int screenWidth,screenHeight,directVideoPlayers; public float listenerPeak; public bool passed; public List<string> failures=new List<string>(); public List<FgFrame> frames=new List<FgFrame>(); public List<FgSurface> surfaces=new List<FgSurface>(); }
        static float FgGradient(float x,float z) { return Mathf.Abs(NativeRemodel3D.GroundY(x+.5f,z)-NativeRemodel3D.GroundY(x-.5f,z))+Mathf.Abs(NativeRemodel3D.GroundY(x,z+.5f)-NativeRemodel3D.GroundY(x,z-.5f)); }
        Vector2 FgTerrainPoint(bool slope)
        {
            var choice=new Vector2(40, -50);float best=slope?-1:float.PositiveInfinity;
            for(float x=30;x<=60;x+=1)for(float z=-72;z<=-36;z+=1)
            {
                if(!Map.CanMove(x*100,-z*100,15))continue;
                float g=FgGradient(x,z);if(slope?(g>.035f&&g<.6f&&g>best):(g<best)) { best=g;choice=new Vector2(x,z); }
            }
            return choice;
        }
        Vector2 FgBridgePoint(out bool found)
        {
            var choice=new Vector2(40.2f,-74.2f);float best=.08f;found=false;
            if(NativeRemodel3D.Field==null)return choice;
            for(float x=35;x<=45;x+=.25f)for(float z=-78;z<=-66;z+=.25f)
            {
                if(!Map.CanMove(x*100,-z*100,15))continue;
                float delta=NativeRemodel3D.Field.Height(x,z)-NativeRemodel3D.Field.TerrainHeight(x,z);
                if(delta>best){best=delta;choice=new Vector2(x,z);found=true;}
            }
            return choice;
        }
        void FgShot(string output,string name)
        {
            var texture=ScreenCapture.CaptureScreenshotAsTexture();
            try { File.WriteAllBytes(Path.Combine(output,name+".png"),texture.EncodeToPNG()); }
            finally { Destroy(texture); }
        }
        void FgWorldRt(string output,string name)
        {
            var camera=r3Cam;var target=camera.targetTexture;var active=RenderTexture.active;
            var rt=RenderTexture.GetTemporary(3840,1080,24,RenderTextureFormat.ARGB32);Texture2D pixels=null;
            try {
                camera.targetTexture=rt;
                RenderPipeline.SubmitRenderRequest(camera,new UniversalRenderPipeline.SingleCameraRequest{destination=rt});
                RenderTexture.active=rt;pixels=new Texture2D(3840,1080,TextureFormat.RGB24,false);
                pixels.ReadPixels(new Rect(0,0,3840,1080),0,0);pixels.Apply();
                File.WriteAllBytes(Path.Combine(output,name+"-direct-world-3840x1080.png"),pixels.EncodeToPNG());
            } finally { camera.targetTexture=target;RenderTexture.active=active;RenderTexture.ReleaseTemporary(rt);if(pixels!=null)Destroy(pixels); }
        }
        FgSurface FgMeasure(string name,string capture,Vector2 point,bool bridgeFound,string sourceName="thorn")
        {
            var row=new FgSurface{name=name,capture=capture,x=point.x,z=point.y,bridgeFound=bridgeFound,
                terrainY=NativeRemodel3D.Field!=null?NativeRemodel3D.Field.TerrainHeight(point.x,point.y):NativeRemodel3D.GroundY(point.x,point.y),
                fieldY=NativeRemodel3D.GroundY(point.x,point.y),gradient=FgGradient(point.x,point.y)};
            foreach(var filter in FindObjectsByType<MeshFilter>())if(filter.name=="Ground skill surface"&&filter.sharedMesh!=null)
            {
                var m=filter.sharedMesh;row.vertices=m.vertexCount;row.triangles=m.triangles.Length/3;
                row.meshEnabled=filter.GetComponent<MeshRenderer>().enabled;
                foreach(var v in m.vertices){var w=filter.transform.TransformPoint(v);row.maxVertexHeightError=Mathf.Max(row.maxVertexHeightError,Mathf.Abs(w.y-NativeRemodel3D.GroundY(w.x,w.z)-NativeGroundSkillGeometry.SurfaceLift));}
                break;
            }
            foreach(var sprite in FindObjectsByType<SpriteRenderer>())if(sprite.name==sourceName) {row.sourceHidden=!sprite.enabled;break;}
            if(sourceName=="dome")foreach(var ring in FindObjectsByType<LineRenderer>())if(ring.name=="ring")
            {
                row.ringCount++;row.ringPoints=ring.positionCount;row.ringsWorldSpace=ring.useWorldSpace;
                if(ring.useWorldSpace)for(int j=0;j<ring.positionCount;j++){var v=ring.GetPosition(j);row.maxRingHeightError=Mathf.Max(row.maxRingHeightError,Mathf.Abs(v.y-NativeRemodel3D.GroundY(v.x,v.z)-NativeGroundSkillGeometry.RingLift));}
            }
            return row;
        }
        IEnumerator FacingGroundQa()
        {
            string output=Argument("-output"),requestedSandbox=Argument(NativeQaSandbox.Argument);
            if(string.IsNullOrEmpty(output)||!Path.IsPathRooted(output)||string.IsNullOrEmpty(requestedSandbox)||!NativeQaSandbox.Active){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;smokeActive=true;pauseSmoke=true;
            var result=new FgReceipt{sandbox=NativeQaSandbox.Root,mode=NativeRemodel3D.Requested?"3D":"2D"};
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);
            lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();if(!lobby.Flow.EnterTest()){Application.Quit(2);yield break;}
            if(firstPractice!=null)EndFirstPractice(true);frontendEntryInputFence=false;menu=false;SetGameFocus(true);Running=false;
            float deadline=Time.realtimeSinceStartup+45;
            while(NativeRemodel3D.Requested&&!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            if(NativeRemodel3D.Requested&&!Remodel3DReady)result.failures.Add("requested 3D scene not ready");
            while((Screen.width!=1920||Screen.height!=1080)&&Time.realtimeSinceStartup<deadline)yield return null;
            result.screenWidth=Screen.width;result.screenHeight=Screen.height;
            if(Screen.width!=1920||Screen.height!=1080)result.failures.Add("actual 1920x1080 window unavailable");
            var sim=Simulation;var p=sim.Player;sim.Config.EnemyAiEnabled=false;sim.Enemies.Clear();sim.FireZones.Clear();sim.SpawnHoles=null;p.Hp=p.MaxHp;p.Iframes=100000;
            bool holyOnly=Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-facing-ground-holy-only")>=0;
            if(NativeRemodel3D.Requested&&Remodel3DReady)
            {
                if(!holyOnly){
                p.X=4000;p.Y=5000;lastX=p.X;lastY=p.Y;UpdateViews();
                var e=sim.SpawnEnemy(p.X+200,p.Y,0,null,false);
                if(e==null)result.failures.Add("controlled ordinary enemy spawn failed");
                else
                {
                    e.Facing=0;if(e.Web!=null)e.Web.facing=Math.PI;
                    for(int i=0;i<5;i++)
                    {
                        string name=new[]{"idle-west","small-east-west-jitter","vertical-north","actual-east-reversal","attack-east"}[i];
                        e.X=i==3||i==4?p.X-200:i==2?p.X:p.X+200+(i==1?.02f:0);
                        e.Y=i==2?p.Y+200:p.Y;e.State=i==4?"attack":"idle";
                        if(e.Web!=null){e.Web.x=e.X;e.Web.y=e.Y;e.Web.s=e.State;}
                        UpdateViews();var ev=enemies[e.Id];ev.lastX=e.X-(i==0?0:.02f);ev.lastY=e.Y;ev.distance=i==1?384:0;renderedTick=-1;
                        UpdateViews();yield return null;yield return new WaitForEndOfFrame();
                        string capture=name+"-actual-window-1920x1080";FgShot(output,capture);
                        result.frames.Add(new FgFrame{name=name,mode="QA injected",capture=capture+".png",width=Screen.width,height=Screen.height,tick=sim.TickCount,
                            dir=NativeEnemyVisualFacing.Direction(e,p),walkFrame=(int)(ev.distance/128)%4,moving=ev.moving,bodyEnabled=ev.body.enabled,walkEnabled=ev.walk.enabled,
                            enemyX=e.X,enemyY=e.Y,playerX=p.X,playerY=p.Y,coreFacing=e.Facing,webFacing=e.Web!=null?e.Web.facing:double.NaN});
                        if(i==0&&ev.moving||i>0&&!ev.moving)result.failures.Add(name+" moving state");
                        if(!ev.body.enabled||ev.walk.enabled!=ev.moving)result.failures.Add(name+" body/walk renderer state");
                    }
                    sim.Enemies.Clear();UpdateViews();yield return null;
                }
                bool bridgeFound;var bridge=FgBridgePoint(out bridgeFound);
                var points=new[]{FgTerrainPoint(false),FgTerrainPoint(true),bridge};var names=new[]{"flat-soil","slope-soil","bridge-deck"};
                for(int i=0;i<points.Length;i++)
                {
                    var q=points[i];p.X=q.x*100;p.Y=-q.y*100;lastX=p.X;lastY=p.Y;
                    sim.FireZones.Clear();sim.FireZones.Add(new FireZone{Id=7000+i,Type="spikeTrap",X=p.X,Y=p.Y,R=175,T=20,MaxT=600,Lv=1});
                    for(int j=0;j<5;j++){renderedTick=-1;UpdateViews();yield return null;}
                    yield return new WaitForEndOfFrame();string capture=names[i]+"-actual-window-1920x1080";FgShot(output,capture);
                    var surface=FgMeasure(names[i],capture+".png",q,i==2&&bridgeFound);result.surfaces.Add(surface);
                    if(surface.vertices!=289||surface.triangles!=512||!surface.sourceHidden||!surface.meshEnabled||surface.maxVertexHeightError>.002f)result.failures.Add(names[i]+" mesh/height/source contract");
                    if(i==2&&!bridgeFound)result.failures.Add("registered bridge deck point not found");
                    if(i==1&&surface.gradient<.035f)result.failures.Add("slope point is too flat");
                    if(i==2)FgWorldRt(output,names[i]);
                }
                }
                var holy=FgTerrainPoint(false);p.X=holy.x*100;p.Y=-holy.y*100;lastX=p.X;lastY=p.Y;
                sim.FireZones.Clear();sim.FireZones.Add(new FireZone{Id=7099,Type="holyDome",X=p.X,Y=p.Y,R=175,T=20,MaxT=600,Lv=1});
                for(int j=0;j<5;j++){renderedTick=-1;UpdateViews();yield return null;}
                yield return new WaitForEndOfFrame();FgShot(output,"holy-dome-actual-window-1920x1080");
                var dome=FgMeasure("holy-dome","holy-dome-actual-window-1920x1080.png",holy,false,"dome");result.surfaces.Add(dome);
                if(dome.vertices!=289||dome.triangles!=512||!dome.sourceHidden||!dome.meshEnabled||dome.ringCount!=2||dome.ringPoints!=72||!dome.ringsWorldSpace||dome.maxVertexHeightError>.002f||dome.maxRingHeightError>.002f)result.failures.Add("holy dome mesh/ring/height contract");
                if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-facing-ground-diagnose")>=0)
                    yield return StartCoroutine(FacingGroundDiagnose(output,holy,p,sim));
                sim.FireZones.Clear();UpdateViews();yield return null;
            }
            else if(!NativeRemodel3D.Requested)
            {
                sim.FireZones.Add(new FireZone{Id=7100,Type="spikeTrap",X=p.X,Y=p.Y,R=175,T=20,MaxT=600,Lv=1});
                for(int j=0;j<5;j++){renderedTick=-1;UpdateViews();yield return null;}
                yield return new WaitForEndOfFrame();FgShot(output,"2d-zone-actual-window-1920x1080");
                foreach(var sprite in FindObjectsByType<SpriteRenderer>())if(sprite.name=="thorn"&&!sprite.enabled)result.failures.Add("2D thorn sprite hidden");
                sim.FireZones.Clear();UpdateViews();yield return null;
            }
            var sample=new float[1024];AudioListener.GetOutputData(sample,0);foreach(float v in sample)result.listenerPeak=Mathf.Max(result.listenerPeak,Mathf.Abs(v));
            result.directVideoPlayers=FindObjectsByType<VideoPlayer>().Length;
            if(result.listenerPeak!=0||result.directVideoPlayers!=0)result.failures.Add("audio/video output not drained");
            result.passed=result.failures.Count==0;
            File.WriteAllText(Path.Combine(output,"facing-ground-qa.json"),JsonUtility.ToJson(result,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(.5f);
            Debug.Log("QA_MEDIA_DRAIN_COMPLETE FACING_GROUND");Application.Quit(result.passed?0:3);
        }
    }
}
