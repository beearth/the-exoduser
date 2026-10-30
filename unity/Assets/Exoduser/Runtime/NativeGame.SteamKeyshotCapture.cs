using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort
{
    public sealed partial class NativeGame
    {
        [Serializable] sealed class KeyshotFrame { public string name; public int tick, enemies, projectiles, visibleProjectiles; public bool arena, remodel, bossPresented; public string bossState; public float heroHeight01, cameraFov; public Vector3 heroWorld,cameraWorld,bossCenter,bossSize; }
        [Serializable] sealed class KeyshotReceipt { public string scope="실제 NativeGame·격리 세이브·직접 입장·생존 보조·스크립트 입력. 적/탄 직접 주입 없음. 손 조작 검수와 구분"; public List<KeyshotFrame> frames=new List<KeyshotFrame>(); public bool passed; }
        IEnumerator SteamKeyshotCapture()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;smokeActive=true;pauseSmoke=true;
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);
            lobby.ShowLobby();lobby.SelectPreview();if(!lobby.EnterNativeTest()){Application.Quit(2);yield break;}
            EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;gameFocused=true;
            var sim=Simulation;var p=sim.Player;var receipt=new KeyshotReceipt();
            p.X=3920;p.Y=7300;var loc=Argument("--unity-keyshot-location");if(!string.IsNullOrEmpty(loc)){var xy=loc.Split(':');if(xy.Length==2&&float.TryParse(xy[0],out var lx)&&float.TryParse(xy[1],out var ly)){p.X=lx;p.Y=ly;}}sim.Config.EnemyAiEnabled=false;
            float deadline=Time.realtimeSinceStartup+35;
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            yield return new WaitForSecondsRealtime(1);
            yield return KeyshotSave(output,"01-탐험",receipt);
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-keyshot-material-probe")>=0)
            {yield return HellMaterialProbe(output,receipt);Application.Quit(0);yield break;}
            if(Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-keyshot-diagnostic")>=0)
            {
                hellDiagnosticFilter=1;yield return KeyshotSave(output,"분리1-메시끔",receipt);
                hellDiagnosticFilter=2;yield return KeyshotSave(output,"분리2-스프라이트끔",receipt);
                hellDiagnosticFilter=3;yield return KeyshotSave(output,"분리3-지형끔",receipt);
                hellDiagnosticFilter=2;NativeRemodel3D.Ground.drawHeightmap=true;HellAtmosphereEnabled=false;yield return KeyshotSave(output,"분리4-지형만-AO안개끔",receipt);
                NativeRemodel3D.Ground.drawTreesAndFoliage=false;yield return KeyshotSave(output,"분리5-풀끔",receipt);
                NativeRemodel3D.Ground.drawInstanced=false;yield return KeyshotSave(output,"분리6-인스턴싱끔",receipt);
                foreach(var l in FindObjectsByType<Light>(FindObjectsSortMode.None))l.shadows=UnityEngine.LightShadows.None;yield return KeyshotSave(output,"분리7-전체그림자끔",receipt);
                HellAtmosphereEnabled=false;Shader.DisableKeyword("_SCREEN_SPACE_OCCLUSION");yield return KeyshotSave(output,"진단1-AO안개끔",receipt);
                foreach(var root in r3Roots)if(root!=null)foreach(var l in root.GetComponentsInChildren<Light>(true))l.shadows=UnityEngine.LightShadows.None;yield return KeyshotSave(output,"진단2-그림자끔",receipt);
                var td=NativeRemodel3D.Ground.terrainData;var alpha=td.GetAlphamaps(0,0,td.alphamapWidth,td.alphamapHeight);for(int y=0;y<td.alphamapHeight;y++)for(int x=0;x<td.alphamapWidth;x++)for(int i=0;i<td.alphamapLayers;i++)alpha[y,x,i]=i==0?1:0;td.SetAlphamaps(0,0,alpha);yield return KeyshotSave(output,"진단3-PBR혼합끔",receipt);
                UnityEngine.Rendering.Universal.CameraExtensions.GetUniversalAdditionalCameraData(r3Cam).renderPostProcessing=false;yield return KeyshotSave(output,"진단4-후처리끔",receipt);
                Application.Quit(0);yield break;
            }
            sim.Config.EnemyAiEnabled=true;p.X=2750;p.Y=6320;
            int best=0;
            var waypoints=new[]{new Vector2(2750,6320),new Vector2(2950,6100),new Vector2(2950,6570),new Vector2(2620,6700)};int waypoint=1;
            for(int tick=0;tick<1800;tick++)
            {
                p.Hp=p.MaxHp;p.Shield=p.MaxShield;p.Iframes=600;
                float ax=p.X+280,ay=p.Y-40,nearest=1e8f;
                foreach(var e in sim.Enemies)if(e.Alive){float d=(e.X-p.X)*(e.X-p.X)+(e.Y-p.Y)*(e.Y-p.Y);if(d<nearest){nearest=d;ax=e.X;ay=e.Y;}}
                var target=waypoints[waypoint]-new Vector2(p.X,p.Y);if(target.sqrMagnitude<6400)waypoint=(waypoint+1)%waypoints.Length;
                var move=target.normalized;
                if(nearest<160000)
                {
                    float bestMove=float.NegativeInfinity;
                    for(int dir=0;dir<24;dir++)
                    {
                        float angle=dir*Mathf.PI/12;var candidate=new Vector2(Mathf.Cos(angle),Mathf.Sin(angle));var future=new Vector2(p.X,p.Y)+candidate*110;
                        if(sim.CanMove!=null&&(!sim.CanMove(future.x,future.y,p.Radius)||!sim.CanMove(p.X+candidate.x*25,p.Y+candidate.y*25,p.Radius)))continue;
                        float clearance=1e8f;foreach(var e in sim.Enemies)if(e.Alive)clearance=Mathf.Min(clearance,(future-new Vector2(e.X,e.Y)).sqrMagnitude);
                        if(sim.FieldBosses!=null)foreach(var fb in sim.FieldBosses)if(fb!=null&&fb.Alive)clearance=Mathf.Min(clearance,Mathf.Pow(Mathf.Max(0,Vector2.Distance(future,new Vector2((float)fb.X,(float)fb.Y))-100),2));
                        float score=clearance+Vector2.Dot(candidate,target.normalized)*5000;
                        if(score>bestMove){bestMove=score;move=candidate;}
                    }
                }
                StepInput(move.x,move.y,ax,ay,tick<100&&tick%60<20,false);
                if(tick%3==0)yield return null;
                int count=sim.Druid.Projectiles.Count;
                if(count>best&&tick>100){best=count;}
                int visible=0;foreach(var shot in sim.Druid.Projectiles)if(shot.Active){var v=HudCamera.WorldToViewportPoint(NativeRemodel3D.Point(shot.X,shot.Y));if(v.x>.08f&&v.x<.92f&&v.y>.15f&&v.y<.88f)visible++;}
                if(tick>280&&visible>=3&&nearest>67600){yield return KeyshotSave(output,"02-전투",receipt);break;}
                if(tick==1799)yield return KeyshotSave(output,"02-전투",receipt);
            }
            BossDirectEnter();int entry=0;
            while((!sim.Stage.InArena||sim.Stage.LoadPhase!=0)&&entry++<1000){p.Hp=p.MaxHp;p.Iframes=600;StepInput(0,0,p.X+100,p.Y,false,false);if(entry%10==0)yield return null;}
            var boss=sim.Stage.FindBoss();
            if(boss!=null)
            {
                p.X=boss.X+160;p.Y=boss.Y+250;
                for(int tick=0;tick<1500;tick++)
                {
                    p.Hp=p.MaxHp;p.Shield=p.MaxShield;p.Iframes=600;
                    StepInput(0,0,boss.X,boss.Y,false,false);
                    if(tick%3==0)yield return null;
                    if(tick>180&&sim.Druid.Projectiles.Count>=6&&druidBody!=null&&druidBody.Visible&&druidBody.Bounds.size.y>3.2f){yield return KeyshotSave(output,"03-드루이드",receipt);break;}
                    if(tick==1499)yield return KeyshotSave(output,"03-드루이드",receipt);
                }
            }
            receipt.passed=receipt.frames.Count==3&&receipt.frames.TrueForAll(f=>f.heroHeight01>=.08f&&f.heroHeight01<=.10f)&&receipt.frames[1].visibleProjectiles>=3&&receipt.frames[2].bossPresented;
            File.WriteAllText(Path.Combine(output,"검수.json"),JsonUtility.ToJson(receipt,true));
            Application.Quit(receipt.passed?0:3);
        }
        IEnumerator KeyshotSave(string output,string name,KeyshotReceipt receipt)
        {
            if(Simulation.Stage.InArena){var b=Simulation.Stage.FindBoss();if(b!=null){Simulation.Player.X=b.X+260;Simulation.Player.Y=b.Y-150;lastX=Simulation.Player.X;lastY=Simulation.Player.Y;}}
            menu=false;Running=false;gameFocused=true;UpdateViews();yield return new WaitForSecondsRealtime(Simulation.Stage.InArena?2.8f:.35f);UpdateViews();yield return new WaitForEndOfFrame();
            var camera=HudCamera;float h=0;
            if(name=="01-탐험"){var objects=new List<string>();foreach(var renderer in FindObjectsByType<Renderer>(FindObjectsInactive.Include,FindObjectsSortMode.None))objects.Add(renderer.gameObject.scene.name+"|"+renderer.name+"|"+renderer.enabled+"|"+renderer.gameObject.activeInHierarchy+"|"+(renderer.sharedMaterial!=null?renderer.sharedMaterial.name:"없음"));var terrain=NativeRemodel3D.Ground;objects.Add("지형|"+terrain.terrainData.size+"|"+terrain.transform.position+"|"+terrain.drawInstanced+"|"+terrain.detailObjectDistance+"|"+terrain.materialTemplate);foreach(var l in FindObjectsByType<Light>(FindObjectsSortMode.None))objects.Add("광원|"+l.name+"|"+l.type+"|"+l.shadows);foreach(var cam in FindObjectsByType<Camera>(FindObjectsSortMode.None))objects.Add("카메라|"+cam.name+"|"+cam.enabled+"|"+cam.cullingMask+"|"+cam.depth);File.WriteAllLines(Path.Combine(output,"필드-렌더러.txt"),objects); }
            if(playerView!=null&&playerView.sprite!=null&&camera!=null)
            {
                var s=playerView.sprite;var rect=s.textureRect;var rt=RenderTexture.GetTemporary(s.texture.width,s.texture.height,0,RenderTextureFormat.ARGB32);var previous=RenderTexture.active;
                Graphics.Blit(s.texture,rt);RenderTexture.active=rt;var tex=new Texture2D((int)rect.width,(int)rect.height,TextureFormat.RGBA32,false);tex.ReadPixels(rect,0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
                var pixels=tex.GetPixels32();int y0=tex.height,y1=0;for(int y=0;y<tex.height;y++)for(int x=0;x<tex.width;x++)if(pixels[y*tex.width+x].a>64){y0=Math.Min(y0,y);y1=Math.Max(y1,y);}
                var low=playerView.transform.TransformPoint(new Vector3(0,(y0-s.pivot.y)/s.pixelsPerUnit,0));var high=playerView.transform.TransformPoint(new Vector3(0,(y1+1-s.pivot.y)/s.pixelsPerUnit,0));h=Mathf.Abs(camera.WorldToViewportPoint(high).y-camera.WorldToViewportPoint(low).y);Destroy(tex);
            }
            int visibleShots=0;foreach(var shot in Simulation.Druid.Projectiles)if(shot.Active){var v=camera.WorldToViewportPoint(NativeRemodel3D.Point(shot.X,shot.Y));if(v.z>0&&v.x>.08f&&v.x<.92f&&v.y>.15f&&v.y<.88f)visibleShots++;}
            var bossNow=Simulation.Stage.FindBoss();string state="";if(bossNow!=null&&Simulation.Druid.Data.TryGetValue(bossNow,out var data))state=data.S;
            bool presented=Simulation.Stage.InArena&&druidBody!=null&&druidBody.Visible&&druidBody.Bounds.size.y>3.2f;
            if(presented){var lo=camera.WorldToViewportPoint(druidBody.Bounds.min);var hi=camera.WorldToViewportPoint(druidBody.Bounds.max);presented=lo.x>.04f&&hi.x<.96f&&lo.y>.15f&&hi.y<.88f;}
            receipt.frames.Add(new KeyshotFrame{name=name,tick=Simulation.TickCount,enemies=Simulation.Enemies.Count,projectiles=Simulation.Druid.Projectiles.Count,visibleProjectiles=visibleShots,arena=Simulation.Stage.InArena,remodel=NativeRemodel3D.Active,bossPresented=presented,bossState=state,heroHeight01=h,cameraFov=camera.fieldOfView,heroWorld=playerView.transform.position,cameraWorld=camera.transform.position,bossCenter=druidBody!=null?druidBody.Bounds.center:Vector3.zero,bossSize=druidBody!=null?druidBody.Bounds.size:Vector3.zero});
            ScreenCapture.CaptureScreenshot(Path.Combine(output,name+".png"));yield return null;yield return new WaitForSecondsRealtime(.4f);
        }
    }
}
