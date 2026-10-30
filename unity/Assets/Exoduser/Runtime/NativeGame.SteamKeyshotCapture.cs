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
        [Serializable] sealed class KeyshotFrame { public string name; public int tick, enemies, projectiles; public bool arena, remodel; public float heroHeight01, cameraFov,luminance=-1; public Vector3 heroWorld,cameraWorld,bossCenter,bossSize; }
        [Serializable] sealed class KeyshotReceipt { public string scope="실제 NativeGame·격리 세이브·직접 입장·생존 보조·스크립트 입력. 적/탄 직접 주입 없음. 손 조작 검수와 구분"; public List<KeyshotFrame> frames=new List<KeyshotFrame>(); public bool passed; }
        IEnumerator SteamKeyshotCapture()
        {
            string output=Argument("-output");
            if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))){Application.Quit(2);yield break;}
            Directory.CreateDirectory(output);AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;smokeActive=true;pauseSmoke=true;
            Screen.SetResolution(1920,1080,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.4f);
            if(A2Requested){lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();if(!lobby.Flow.EnterTest()){Application.Quit(2);yield break;}}
            else{lobby.ShowLobby();lobby.SelectPreview();if(!lobby.EnterNativeTest()){Application.Quit(2);yield break;}}
            EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;gameFocused=true;
            var sim=Simulation;var p=sim.Player;var receipt=new KeyshotReceipt();
            p.X=A2Requested?4200:3920;p.Y=A2Requested?7460:7300;var loc=Argument("--unity-keyshot-location");if(!string.IsNullOrEmpty(loc)){var xy=loc.Split(':');if(xy.Length==2&&float.TryParse(xy[0],out var lx)&&float.TryParse(xy[1],out var ly)){p.X=lx;p.Y=ly;}}sim.Config.EnemyAiEnabled=false;
            float deadline=Time.realtimeSinceStartup+35;
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            yield return new WaitForSecondsRealtime(1);
            yield return KeyshotSave(output,"01-탐험",receipt);
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
            sim.Config.EnemyAiEnabled=true;if(string.IsNullOrEmpty(loc)&&!A2Requested){p.X=4020;p.Y=6880;}
            File.WriteAllText(Path.Combine(output,"실제-촬영설정.json"),JsonUtility.ToJson(sim.Config,true));
            var combatCenter=new Vector2(p.X,p.Y);int best=0;
            for(int tick=0;tick<1800;tick++)
            {
                p.Hp=p.MaxHp;p.Shield=p.MaxShield;p.Iframes=600;
                int phase=(tick/90)%4;float mx=phase==0?1:phase==2?-1:0,my=phase==1?1:phase==3?-1:0;float ax=p.X+280,ay=p.Y-40,nearest=1e8f;
                foreach(var e in sim.Enemies)if(e.Alive){float d=(e.X-p.X)*(e.X-p.X)+(e.Y-p.Y)*(e.Y-p.Y);if(d<nearest){nearest=d;ax=e.X;ay=e.Y;}}
                var move=KeyshotDistanceInput(sim,combatCenter);mx=move.x;my=move.y;
                StepInput(mx,my,ax,ay,tick%240<30,false);
                if(tick%3==0)yield return null;
                int count=sim.Druid.Projectiles.Count;
                if(count>best&&tick>100){best=count;}
                int visible=0;foreach(var shot in sim.Druid.Projectiles)if(shot.Active){var v=HudCamera.WorldToViewportPoint(NativeRemodel3D.Point(shot.X,shot.Y));if(v.x>.08f&&v.x<.92f&&v.y>.15f&&v.y<.88f)visible++;}
                if(tick%60==0)File.AppendAllText(Path.Combine(output,"실제-입력추적.txt"),tick+"|"+p.X+"|"+p.Y+"|탄="+count+"|가시="+visible+"|최근접="+Mathf.Sqrt(nearest)+"\n");
                if(tick>180&&tick%240>75&&visible>=3&&nearest>10000){yield return KeyshotSave(output,"02-전투",receipt);break;}
                if(tick==1799)yield return KeyshotSave(output,"02-전투",receipt);
            }
            sim.Config.EnemyAiEnabled=false;BossDirectEnter();int entry=0;bool arenaPositioned=false;
            while((!sim.Stage.InArena||sim.Stage.LoadPhase!=0)&&entry++<1000)
            {
                if(sim.Stage.InArena&&!arenaPositioned&&sim.Stage.Arena!=null)
                {
                    var arena=sim.Stage.Arena;p.X=(arena.RoomCx+.5f)*40+260;p.Y=(arena.RoomCy+.5f)*40-150;lastX=p.X;lastY=p.Y;arenaPositioned=true;
                }
                p.Hp=p.MaxHp;p.Iframes=600;StepInput(0,0,p.X+100,p.Y,false,false);if(entry%10==0)yield return null;
            }
            sim.Config.EnemyAiEnabled=true;var boss=sim.Stage.FindBoss();
            if(boss!=null)
            {
                if(!arenaPositioned){p.X=boss.X+260;p.Y=boss.Y-150;}
                for(int tick=0;tick<1100;tick++)
                {
                    p.Hp=p.MaxHp;p.Shield=p.MaxShield;p.Iframes=600;
                    StepInput(0,0,boss.X,boss.Y,false,false);
                    if(tick%3==0)yield return null;
                    if(tick>180&&KeyshotActiveShots(true)>=6){yield return KeyshotSave(output,"03-드루이드",receipt);break;}
                    if(tick==1099)yield return KeyshotSave(output,"03-드루이드",receipt);
                }
            }
            receipt.passed=receipt.frames.Count==3&&receipt.frames.TrueForAll(f=>f.heroHeight01>=.08f&&f.heroHeight01<=.11f&&(!A2Requested||f.luminance>.01f))&&receipt.frames[1].projectiles>=3&&receipt.frames[2].projectiles>=6;
            File.WriteAllText(Path.Combine(output,"검수.json"),JsonUtility.ToJson(receipt,true));
            lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);
            Application.Quit(receipt.passed?0:3);
        }
        int KeyshotActiveShots(bool boss)
        {int count=0;foreach(var shot in Simulation.Druid.Projectiles)if(shot.Active&&!shot.Friendly&&(!boss||shot.DruidPoison))count++;return count;}
        Vector2 KeyshotDistanceInput(Simulation sim,Vector2 centre)
        {
            var p=sim.Player;var result=Vector2.zero;double best=double.NegativeInfinity;
            for(int direction=0;direction<8;direction++)
            {
                double angle=direction*Math.PI/4;float vx=(float)Math.Cos(angle),vy=(float)Math.Sin(angle),nx=p.X+vx*80,ny=p.Y+vy*80;
                if(!sim.CanMove(nx,ny,15)||!sim.CanMove(p.X+vx*40,p.Y+vy*40,15))continue;
                double clearance=1e9;foreach(var e in sim.Enemies)if(e.Alive)clearance=Math.Min(clearance,Math.Sqrt((e.X-nx)*(e.X-nx)+(e.Y-ny)*(e.Y-ny)));
                double score=-Math.Abs(clearance-300)-.1*Math.Sqrt((nx-centre.x)*(nx-centre.x)+(ny-centre.y)*(ny-centre.y));
                if(score>best){best=score;result=new Vector2(vx,vy);}
            }
            return result;
        }
        IEnumerator KeyshotSave(string output,string name,KeyshotReceipt receipt)
        {
            if(Simulation.Stage.InArena){var b=Simulation.Stage.FindBoss();if(b!=null){Simulation.Player.X=b.X+260;Simulation.Player.Y=b.Y-150;lastX=Simulation.Player.X;lastY=Simulation.Player.Y;}}
            menu=false;Running=false;gameFocused=true;UpdateViews();yield return new WaitForSecondsRealtime(Simulation.Stage.InArena?2.8f:.35f);UpdateViews();if(!Application.isBatchMode)yield return new WaitForEndOfFrame();
            var camera=HudCamera;float h=0;
            if(name=="01-탐험"){var objects=new List<string>();foreach(var renderer in FindObjectsByType<Renderer>(FindObjectsInactive.Include,FindObjectsSortMode.None))objects.Add(renderer.gameObject.scene.name+"|"+renderer.name+"|"+renderer.enabled+"|"+renderer.gameObject.activeInHierarchy+"|"+(renderer.sharedMaterial!=null?renderer.sharedMaterial.name:"없음"));var terrain=NativeRemodel3D.Ground;objects.Add("지형|"+terrain.terrainData.size+"|"+terrain.transform.position+"|"+terrain.drawInstanced+"|"+terrain.detailObjectDistance+"|"+terrain.materialTemplate);foreach(var l in FindObjectsByType<Light>(FindObjectsSortMode.None))objects.Add("광원|"+l.name+"|"+l.type+"|"+l.shadows);foreach(var cam in FindObjectsByType<Camera>(FindObjectsSortMode.None))objects.Add("카메라|"+cam.name+"|"+cam.enabled+"|"+cam.cullingMask+"|"+cam.depth);File.WriteAllLines(Path.Combine(output,"필드-렌더러.txt"),objects); }
            if(playerView!=null&&playerView.sprite!=null&&camera!=null)
            {
                var s=playerView.sprite;var rect=s.textureRect;var rt=RenderTexture.GetTemporary(s.texture.width,s.texture.height,0,RenderTextureFormat.ARGB32);var previous=RenderTexture.active;
                Graphics.Blit(s.texture,rt);RenderTexture.active=rt;var tex=new Texture2D((int)rect.width,(int)rect.height,TextureFormat.RGBA32,false);tex.ReadPixels(rect,0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
                var pixels=tex.GetPixels32();int y0=tex.height,y1=0;for(int y=0;y<tex.height;y++)for(int x=0;x<tex.width;x++)if(pixels[y*tex.width+x].a>64){y0=Math.Min(y0,y);y1=Math.Max(y1,y);}
                var low=playerView.transform.TransformPoint(new Vector3(0,(y0-s.pivot.y)/s.pixelsPerUnit,0));var high=playerView.transform.TransformPoint(new Vector3(0,(y1+1-s.pivot.y)/s.pixelsPerUnit,0));h=Mathf.Abs(camera.WorldToViewportPoint(high).y-camera.WorldToViewportPoint(low).y);Destroy(tex);
            }
            // 전사 R5 이후 숨긴 2D 스프라이트가 아닌 실제 현재 스킨 메시로 높이를 판정한다.
            if(NativeRemodel3D.Active&&heroView!=null&&heroView.Ready&&camera!=null)
            {
                float low=float.MaxValue,high=float.MinValue;
                foreach(var renderer in heroView.Model.GetComponentsInChildren<SkinnedMeshRenderer>())
                {
                    var mesh=new Mesh();renderer.BakeMesh(mesh);
                    foreach(var vertex in mesh.vertices){var v=camera.WorldToViewportPoint(renderer.transform.TransformPoint(vertex));low=Mathf.Min(low,v.y);high=Mathf.Max(high,v.y);}
                    Destroy(mesh);
                }
                if(high>=low)h=high-low;
            }
            receipt.frames.Add(new KeyshotFrame{name=name,tick=Simulation.TickCount,enemies=Simulation.Enemies.Count,projectiles=KeyshotActiveShots(Simulation.Stage.InArena),arena=Simulation.Stage.InArena,remodel=NativeRemodel3D.Active,heroHeight01=h,cameraFov=camera.fieldOfView,heroWorld=playerView.transform.position,cameraWorld=camera.transform.position,bossCenter=druidBody!=null?druidBody.Bounds.center:Vector3.zero,bossSize=druidBody!=null?druidBody.Bounds.size:Vector3.zero});
            if(Application.isBatchMode||A2Requested)receipt.frames[receipt.frames.Count-1].luminance=A2CaptureFrame(Path.Combine(output,name+".png"));else ScreenCapture.CaptureScreenshot(Path.Combine(output,name+".png"));yield return null;yield return new WaitForSecondsRealtime(.4f);
        }
    }
}
