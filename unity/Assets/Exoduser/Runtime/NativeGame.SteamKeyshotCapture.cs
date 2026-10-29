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
        [Serializable] sealed class KeyshotFrame { public string name; public int tick, enemies, projectiles; public bool arena, remodel; public float heroHeight01, cameraFov; }
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
            p.X=3920;p.Y=7300;sim.Config.EnemyAiEnabled=false;
            float deadline=Time.realtimeSinceStartup+35;
            while(!Remodel3DReady&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
            yield return new WaitForSecondsRealtime(1);
            yield return KeyshotSave(output,"01-탐험",receipt);
            sim.Config.EnemyAiEnabled=true;p.X=4020;p.Y=6880;
            int best=0;
            for(int tick=0;tick<1100;tick++)
            {
                p.Hp=p.MaxHp;p.Shield=p.MaxShield;p.Iframes=600;
                StepInput(0,0,p.X+280,p.Y-40,false,false);
                if(tick%3==0)yield return null;
                int count=sim.Druid.Projectiles.Count;
                if(count>best&&tick>100){best=count;}
                if(tick>180&&count>=6){yield return KeyshotSave(output,"02-전투",receipt);break;}
                if(tick==1099)yield return KeyshotSave(output,"02-전투",receipt);
            }
            BossDirectEnter();int entry=0;
            while((!sim.Stage.InArena||sim.Stage.LoadPhase!=0)&&entry++<1000){p.Hp=p.MaxHp;p.Iframes=600;StepInput(0,0,p.X+100,p.Y,false,false);if(entry%10==0)yield return null;}
            var boss=sim.Stage.FindBoss();
            if(boss!=null)
            {
                p.X=boss.X+160;p.Y=boss.Y+250;
                for(int tick=0;tick<1100;tick++)
                {
                    p.Hp=p.MaxHp;p.Shield=p.MaxShield;p.Iframes=600;
                    StepInput(0,0,boss.X,boss.Y,false,false);
                    if(tick%3==0)yield return null;
                    if(tick>180&&sim.Druid.Projectiles.Count>=6){yield return KeyshotSave(output,"03-드루이드",receipt);break;}
                    if(tick==1099)yield return KeyshotSave(output,"03-드루이드",receipt);
                }
            }
            receipt.passed=receipt.frames.Count==3&&receipt.frames.TrueForAll(f=>f.heroHeight01>=.08f&&f.heroHeight01<=.11f);
            File.WriteAllText(Path.Combine(output,"검수.json"),JsonUtility.ToJson(receipt,true));
            Application.Quit(receipt.passed?0:3);
        }
        IEnumerator KeyshotSave(string output,string name,KeyshotReceipt receipt)
        {
            if(Simulation.Stage.InArena){var b=Simulation.Stage.FindBoss();if(b!=null){Simulation.Player.X=b.X+160;Simulation.Player.Y=b.Y+250;lastX=Simulation.Player.X;lastY=Simulation.Player.Y;}}
            menu=false;Running=false;gameFocused=true;UpdateViews();yield return new WaitForSecondsRealtime(.35f);UpdateViews();yield return new WaitForEndOfFrame();
            var camera=HudCamera;float h=0;
            if(playerView!=null&&playerView.sprite!=null&&camera!=null)
            {
                var s=playerView.sprite;var rect=s.textureRect;var rt=RenderTexture.GetTemporary(s.texture.width,s.texture.height,0,RenderTextureFormat.ARGB32);var previous=RenderTexture.active;
                Graphics.Blit(s.texture,rt);RenderTexture.active=rt;var tex=new Texture2D((int)rect.width,(int)rect.height,TextureFormat.RGBA32,false);tex.ReadPixels(rect,0,0);tex.Apply();RenderTexture.active=previous;RenderTexture.ReleaseTemporary(rt);
                var pixels=tex.GetPixels32();int y0=tex.height,y1=0;for(int y=0;y<tex.height;y++)for(int x=0;x<tex.width;x++)if(pixels[y*tex.width+x].a>64){y0=Math.Min(y0,y);y1=Math.Max(y1,y);}
                var low=playerView.transform.TransformPoint(new Vector3(0,(y0-s.pivot.y)/s.pixelsPerUnit,0));var high=playerView.transform.TransformPoint(new Vector3(0,(y1+1-s.pivot.y)/s.pixelsPerUnit,0));h=Mathf.Abs(camera.WorldToViewportPoint(high).y-camera.WorldToViewportPoint(low).y);Destroy(tex);
            }
            receipt.frames.Add(new KeyshotFrame{name=name,tick=Simulation.TickCount,enemies=Simulation.Enemies.Count,projectiles=Simulation.Stage.InArena?Simulation.Druid.Projectiles.Count:Simulation.Druid.Projectiles.Count,arena=Simulation.Stage.InArena,remodel=NativeRemodel3D.Active,heroHeight01=h,cameraFov=camera.fieldOfView});
            ScreenCapture.CaptureScreenshot(Path.Combine(output,name+".png"));yield return null;yield return new WaitForSecondsRealtime(.4f);
        }
    }
}
