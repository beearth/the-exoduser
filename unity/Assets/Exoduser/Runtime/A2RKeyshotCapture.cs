using System;
using System.Collections;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Text;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class A2RKeyshotPlan {public uint seed;public string status;public A2RKeyshotView[] views;}
        [Serializable] sealed class A2RKeyshotView {public string id,scene;public float x,y,facing;public int waitTicks,captureTick;public bool selected;}
        [Serializable] sealed class A2RKeyshotBox {public int enemyId;public float x,y,w,h;public bool visible;}
        [Serializable] sealed class A2RKeyshotCamera {public Vector3 position;public float pitch,fov,distance;}
        [Serializable] sealed class A2RKeyshotFrame
        {
            public string id,scene,file,state;public int width,height,tick,heroOverlap;public uint seed;public bool hud;
            public float seconds,facing;public Vector2 player;public A2RKeyshotCamera camera;public A2RKeyshotBox hero;public List<A2RKeyshotBox> enemies=new List<A2RKeyshotBox>();
        }
        [Serializable] sealed class A2RKeyshotReceipt
        {
            public string scope="자연 스폰·어그로·원래 StepInput 보행, 고정 starter 시드. Core/카메라/조명 무변경. 가림 수치는 투영·물리 근사이며 최종 시각 판정은 별도.";
            public string sourceCommit,sandbox;public bool passed;public List<string> failures=new List<string>();public List<A2RKeyshotFrame> frames=new List<A2RKeyshotFrame>();
        }
        A2RKeyshotReceipt keyshot;string keyshotRoot;float keyshotPitch,keyshotFov,keyshotDistance;
        IEnumerator A2RKeyshotRun()
        {
            keyshotRoot=a2rPlayOutput;keyshot=new A2RKeyshotReceipt{sandbox=NativeQaSandbox.Root,sourceCommit=Argument("--keyshot-source")};
            var routine=A2RKeyshotSequence();
            while(true){bool more=false;object next=null;try{more=routine.MoveNext();if(more)next=routine.Current;}catch(Exception e){keyshot.failures.Add(e.ToString());}if(!more)break;yield return next;}
            enabled=true;Time.timeScale=1;Time.captureDeltaTime=0;
            keyshot.failures.AddRange(a2rPlay.failures);if(a2rPlay.errors>0)keyshot.failures.Add("실행 오류 "+a2rPlay.errors);
            keyshot.passed=keyshot.failures.Count==0&&keyshot.frames.Count>0;
            File.WriteAllText(Path.Combine(keyshotRoot,"keyshot.json"),JsonUtility.ToJson(keyshot,true));
            Application.logMessageReceived-=A2RPlayLog;LobbyKeys.ReleaseAll();lobby.CloseStartupCaptureMedia();sound.Reset();Application.Quit(keyshot.passed?0:3);
        }
        IEnumerator A2RKeyshotSequence()
        {
            string custom=Argument("--keyshot-views");var resource=Resources.Load<TextAsset>("A2R/keyshot-views");
            var plan=JsonUtility.FromJson<A2RKeyshotPlan>(string.IsNullOrEmpty(custom)?resource.text:File.ReadAllText(custom));
            if(plan==null||plan.views==null||plan.views.Length<9||plan.seed!=SourceStarterFixture.Seed)throw new InvalidOperationException("Invalid keyshot views/seed");
            // ResetRun is the product's seeded run factory: keep every ordinary spawn and AI callback.
            Running=false;ResetRun();if(firstPractice!=null)EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;
            Time.captureDeltaTime=1f/60f;UnityEngine.Random.InitState(unchecked((int)plan.seed));
            for(int i=0;i<20;i++){UpdateViews();yield return null;}
            if(r3Cam==null||r3Cam.orthographic)throw new InvalidOperationException("A2R perspective camera missing");
            keyshotPitch=r3Cam.transform.eulerAngles.x;keyshotFov=r3Cam.fieldOfView;
            keyshotDistance=Vector3.Distance(r3Cam.transform.position,r3Marker.position);
            if(Mathf.Abs(Mathf.DeltaAngle(keyshotPitch,34))>.1f)throw new InvalidOperationException("Camera pitch LOCK mismatch");
            bool selected=Array.IndexOf(Environment.GetCommandLineArgs(),"--keyshot-selected")>=0;
            foreach(var target in plan.views)
            {
                var start=new Vector2(Simulation.Player.X,Simulation.Player.Y);var goal=new Vector2(target.x,target.y);
                var route=A2RWalkPath(start,goal);if(route.Count==0)throw new InvalidOperationException("No Core route: "+target.id);
                int ticks=0,stall=0;
                foreach(var point in route)
                {
                    while(Vector2.Distance(new Vector2(Simulation.Player.X,Simulation.Player.Y),point)>5)
                    {
                        var old=new Vector2(Simulation.Player.X,Simulation.Player.Y);var move=(point-old).normalized;
                        KeyshotStep(move,target.facing);if(++ticks>6000)throw new InvalidOperationException("Route timeout: "+target.id);
                        if(Vector2.Distance(old,new Vector2(Simulation.Player.X,Simulation.Player.Y))<.01f)stall++;else stall=0;
                        if(stall>120)throw new InvalidOperationException("Core route stalled: "+target.id);
                        yield return null;
                    }
                }
                for(int i=0;i<target.waitTicks;i++){KeyshotStep(Vector2.zero,target.facing);yield return null;}
                if(selected&&target.captureTick>0&&target.captureTick!=Simulation.TickCount)throw new InvalidOperationException("Replay tick mismatch: "+target.id);
                Time.timeScale=0;bool save=!selected||target.selected;
                foreach(var size in new[]{new Vector2Int(1920,1080),new Vector2Int(3840,2160),new Vector2Int(3840,1080)})
                {
                    Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);
                    float deadline=Time.realtimeSinceStartup+12;
                    while((Screen.width!=size.x||Screen.height!=size.y)&&Time.realtimeSinceStartup<deadline)yield return null;
                    if(Screen.width!=size.x||Screen.height!=size.y)throw new InvalidOperationException("Native resolution failed "+size);
                    for(int i=0;i<6;i++){UpdateViews();yield return null;}
                    foreach(bool showHud in new[]{true,false})
                    {
                        enabled=showHud;UpdateViews();yield return null;yield return new WaitForEndOfFrame();
                        if(save)KeyshotSave(target,plan.seed,showHud);
                    }
                    enabled=true;
                }
                Time.timeScale=1;
            }
        }
        void KeyshotStep(Vector2 move,float facing)
        {
            var p=Simulation.Player;if(p.Hp<=0||p.State=="fallen"||p.State=="dead")throw new InvalidOperationException("Natural route player died; no invulnerability fixture used");
            float angle=facing*Mathf.Deg2Rad;
            StepInput(move.x,move.y,p.X+Mathf.Cos(angle)*300,p.Y+Mathf.Sin(angle)*300,false,false);
        }
        A2RKeyshotBox KeyshotProject(Bounds bounds,int enemyId=0)
        {
            float left=float.PositiveInfinity,top=float.PositiveInfinity,right=float.NegativeInfinity,bottom=float.NegativeInfinity;
            for(int i=0;i<8;i++){var p=r3Cam.WorldToScreenPoint(bounds.center+Vector3.Scale(bounds.extents,new Vector3((i&1)==0?-1:1,(i&2)==0?-1:1,(i&4)==0?-1:1)));if(p.z<=0)return new A2RKeyshotBox();left=Mathf.Min(left,p.x);right=Mathf.Max(right,p.x);top=Mathf.Min(top,Screen.height-p.y);bottom=Mathf.Max(bottom,Screen.height-p.y);}
            var ray=new Ray(r3Cam.transform.position,bounds.center-r3Cam.transform.position);RaycastHit hit;
            bool blocked=Physics.Raycast(ray,out hit,Vector3.Distance(ray.origin,bounds.center)-Mathf.Max(.1f,bounds.extents.magnitude),r3Cam.cullingMask,QueryTriggerInteraction.Ignore);
            return new A2RKeyshotBox{enemyId=enemyId,x=left,y=top,w=right-left,h=bottom-top,visible=!blocked&&left>=0&&top>=0&&right<=Screen.width&&bottom<=Screen.height};
        }
        void KeyshotSave(A2RKeyshotView target,uint seed,bool showHud)
        {
            float pitch=r3Cam.transform.eulerAngles.x,distance=Vector3.Distance(r3Cam.transform.position,r3Marker.position);
            if(Mathf.Abs(Mathf.DeltaAngle(pitch,keyshotPitch))>.001f||Mathf.Abs(r3Cam.fieldOfView-keyshotFov)>.001f||Mathf.Abs(distance-keyshotDistance)>.01f)throw new InvalidOperationException("Camera LOCK changed");
            var p=Simulation.Player;string file=target.id+"-"+Screen.width+"x"+Screen.height+"-hud-"+(showHud?"on":"off")+".png";
            var f=new A2RKeyshotFrame{id=target.id,scene=target.scene,file=file,width=Screen.width,height=Screen.height,hud=showHud,tick=Simulation.TickCount,seconds=Simulation.TickCount/60f,seed=seed,player=new Vector2(p.X,p.Y),facing=p.Facing,state=KeyshotState(),
                camera=new A2RKeyshotCamera{position=r3Cam.transform.position,pitch=pitch,fov=r3Cam.fieldOfView,distance=distance},hero=KeyshotProject(a2rLighting.Readability.HeroBounds),heroOverlap=a2rLighting.Readability.OverlapCount};
            foreach(var e in Simulation.Enemies)if(e.Alive&&!Simulation.IsRemodelProp(e)&&enemies.TryGetValue(e.Id,out var ev)&&ev.body!=null&&ev.body.enabled&&ev.body.gameObject.activeInHierarchy)
            {
                var box=KeyshotProject(ev.body.bounds,e.Id);var body=CombatEnemyBody(e.Id);
                if(body.HasValue){var foot=r3Cam.WorldToScreenPoint(body.Value.foot);var top=r3Cam.WorldToScreenPoint(body.Value.top);box.y=Screen.height-top.y;box.h=top.y-foot.y;}
                f.enemies.Add(box);
            }
            var image=new Texture2D(Screen.width,Screen.height,TextureFormat.RGB24,false);
            try{image.ReadPixels(new Rect(0,0,Screen.width,Screen.height),0,0);image.Apply();File.WriteAllBytes(Path.Combine(keyshotRoot,file),image.EncodeToPNG());}finally{Destroy(image);}
            keyshot.frames.Add(f);File.WriteAllText(Path.Combine(keyshotRoot,"keyshot.json"),JsonUtility.ToJson(keyshot,true));
        }
        string KeyshotState()
        {
            // A compact stable signature catches natural-spawn/aggro divergence independently of pixel noise.
            var rows=new List<string>();foreach(var e in Simulation.Enemies)if(e.Alive)rows.Add(e.Id+":"+e.X.ToString("R",CultureInfo.InvariantCulture)+":"+e.Y.ToString("R",CultureInfo.InvariantCulture)+":"+e.Hp);
            rows.Sort(StringComparer.Ordinal);return string.Join("|",rows);
        }
    }
}
