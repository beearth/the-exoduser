using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;
using UnityEngine.Rendering;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort.Tools
{
    // 명시적 격리 HeroCapture에서만 쓰는 앵커/고정 적탄 회귀 도구. 일반 실행은 생성조차 하지 않는다.
    [DefaultExecutionOrder(-2000)]
    public sealed class HeroAnchorCapture : MonoBehaviour
    {
        [Serializable] sealed class BulletSample { public string kind,textureRect; public double x,y,vx,vy; public bool active,drawn; public Vector3 screen,rendererScreen; public Bounds bounds; }
        [Serializable] sealed class WaveSample { public string name; public int waveId,age; public bool bash,enabled; public float coreX,coreY,error,sizePx; public Vector3 actual,expected,screen; public Color color; }
        [Serializable] sealed class FrameSample {
            public int tick; public string state; public Vector3 playerScreen;
            public int mouths,comets,orbs,fallbacks;
            public List<BulletSample> bullets=new List<BulletSample>(); public List<WaveSample> waves=new List<WaveSample>();
        }
        [Serializable] sealed class Receipt {
            public string scope="검수 Tools 고정표본. 자연 AI 탄막/회피/히트 검증 아님. baseline은 동일 새 빌드에서 새 강타 registry만 비워 R5 기존 lift 식을 재현";
            public string mode,device; public int bulletCount=24; public float[] columns={-180,-90,90,180}; public float[] rows={-140,-84,-28,28,84,140};
            public string[] kinds={"물리입","번개마법혜성","불속성구"};
            public string speed="Vx=Vy=0, Dmg=0, R=4, Sz=1, Life=Ml=6000. 각 LateUpdate에서 같은 상대좌표로 고정";
            public List<FrameSample> frames=new List<FrameSample>();
        }
        static string Arg(string key) { var a=Environment.GetCommandLineArgs();int i=Array.IndexOf(a,key);return i>=0&&i+1<a.Length?a[i+1]:null; }
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
        static void Boot()
        {
            var args=Environment.GetCommandLineArgs();
            if(Array.IndexOf(args,"--unity-hero-anchor-check")<0)return;
            if(Array.IndexOf(args,"--unity-hero-review")<0||string.IsNullOrEmpty(Arg("--unity-qa-sandbox"))||string.IsNullOrEmpty(Arg("-output")))
            { Debug.LogError("중심 앵커 검수는 기존 HeroCapture·명시적 세이브격리·출력이 필요");Application.Quit(2);return; }
            var go=new GameObject("중심앵커 고정표본 검수 Tools");DontDestroyOnLoad(go);go.AddComponent<HeroAnchorCapture>();
        }
        static readonly BindingFlags Private=BindingFlags.Instance|BindingFlags.NonPublic;
        NativeGame game; NativeBossView boss; Simulation bound,fixedSim;
        readonly List<BossProjectile> shots=new List<BossProjectile>();
        readonly List<string> shotKinds=new List<string>();
        Receipt report; string output; int lastTick=-1,pendingTick=-1; HashSet<SpriteRenderer> centered;
        void Awake()
        {
            output=Path.Combine(Arg("-output"),"anchor");Directory.CreateDirectory(output);
            string mode=Arg("-anchor-mode")??"current";
            if(mode!="current"&&mode!="baseline"&&mode!="control"){Debug.LogError("알 수 없는 앵커 검수모드");enabled=false;Application.Quit(2);return;}
            report=new Receipt{mode=mode,device=SystemInfo.graphicsDeviceName};
            centered=(HashSet<SpriteRenderer>)typeof(NativeSkillView).GetField("centeredSlamSprites",BindingFlags.Static|BindingFlags.NonPublic).GetValue(null);
            RenderPipelineManager.endCameraRendering+=OnCameraRendered;
        }
        void LateUpdate()
        {
            if(game==null)game=FindAnyObjectByType<NativeGame>();
            if(game==null||game.Simulation==null||!(bool)typeof(NativeGame).GetField("heroReviewActive",Private).GetValue(game))return;
            var sim=game.Simulation;if(sim.TickCount<1)return;
            if(bound!=sim)Bind(sim);
            var p=sim.Player;
            fixedSim.TickCount=sim.TickCount;fixedSim.Player.X=p.X;fixedSim.Player.Y=p.Y;
            for(int i=0;i<shots.Count;i++){
                var b=shots[i];b.X=p.X+report.columns[i/6];b.Y=p.Y+report.rows[i%6];b.Vx=b.Vy=0;b.Active=true;b.Life=b.Ml=6000;
            }
            // 별도 검수 Simulation의 고정탄을 기존 NativeBossView 코드로 그린다.
            // 실제 게임 Simulation·AI·히트·피해·RNG에는 표본을 넣거나 Tick하지 않는다.
            boss.Update(fixedSim);
            if(report.mode=="baseline")centered.Clear();
            if(report.mode=="control")foreach(var sr in FindObjectsByType<SpriteRenderer>())
                if(IsWave(sr))sr.enabled=false;
            if(sim.SlamWaves.Count>0&&sim.TickCount!=lastTick){
                lastTick=sim.TickCount;
                if(sim.SlamWaves[0].T%2==0)pendingTick=sim.TickCount;
            }
        }
        void Bind(Simulation sim)
        {
            bound=sim;if(boss!=null)boss.Dispose();
            fixedSim=new Simulation(new SimulationConfig{EnemyAiEnabled=false},0x4845524f);fixedSim.Stage.Enabled=false;fixedSim.AttachDruidBoss();
            boss=new NativeBossView(transform);shots.Clear();shotKinds.Clear();
            for(int col=0;col<4;col++)for(int row=0;row<6;row++){
                int kind=(col*6+row)%3;
                var b=new BossProjectile{X=sim.Player.X+report.columns[col],Y=sim.Player.Y+report.rows[row],Vx=0,Vy=0,Dmg=0,R=4,Sz=1,Life=6000,Ml=6000,El=kind==0?0:kind==1?4:1,ParryClass=kind==0?"physical":"magic",ElemBall=kind==2,Active=true};
                fixedSim.Druid.Projectiles.Add(b);shots.Add(b);shotKinds.Add(report.kinds[kind]);
            }
        }
        static bool IsWave(SpriteRenderer sr) {return sr!=null&&(sr.name=="wave"||sr.name=="flash")&&sr.transform.parent!=null&&sr.transform.parent.name.StartsWith("slam",StringComparison.Ordinal);}
        void OnCameraRendered(ScriptableRenderContext context,Camera camera)
        {
            // 기존 HeroCapture는 EndOfFrame 직후 다음 Core 틱을 진행한다.
            // 그보다 앞선 실제 3D 카메라 렌더종료에서 같은 화면의 현재 틱을 읽는다.
            if(pendingTick<0||game==null||bound==null||camera!=game.Remodel3DCamera)return;
            int tick=pendingTick;pendingTick=-1;var sim=bound;if(sim.TickCount!=tick)return;
            var cam=camera;
            var row=new FrameSample{tick=tick,state=sim.Player.State,playerScreen=cam.WorldToScreenPoint(NativeRemodel3D.Point(sim.Player.X,sim.Player.Y)),mouths=boss.FieldMouthsDrawn,comets=boss.FieldCometsDrawn,orbs=boss.FieldOrbsDrawn,fallbacks=boss.FieldBulletFallbacks};
            var pool=(List<SpriteRenderer>)typeof(NativeBossView).GetField("pool",Private).GetValue(boss);
            for(int i=0;i<shots.Count;i++){var b=shots[i];var sr=i<pool.Count?pool[i]:null;row.bullets.Add(new BulletSample{kind=shotKinds[i],x=b.X,y=b.Y,vx=b.Vx,vy=b.Vy,active=b.Active,screen=cam.WorldToScreenPoint(NativeRemodel3D.Point((float)b.X,(float)b.Y)),drawn=sr!=null&&sr.enabled,rendererScreen=sr!=null?cam.WorldToScreenPoint(sr.transform.position):Vector3.zero,bounds=sr!=null?sr.bounds:new Bounds(),textureRect=sr!=null?sr.sprite.rect.ToString():"없음"});}
            foreach(var wave in sim.SlamWaves)foreach(var sr in FindObjectsByType<SpriteRenderer>()){
                if(!IsWave(sr)||sr.transform.parent.name!="slam"+wave.Id)continue;
                var expected=NativeRemodel3D.Point(wave.X,wave.Y);
                row.waves.Add(new WaveSample{name=sr.name,waveId=wave.Id,age=wave.T,bash=wave.Bash,enabled=sr.enabled,coreX=wave.X,coreY=wave.Y,actual=sr.transform.position,expected=expected,error=Vector3.Distance(sr.transform.position,expected),screen=cam.WorldToScreenPoint(sr.transform.position),sizePx=sr.sprite.rect.height*sr.transform.lossyScale.y,color=sr.color});
            }
            report.frames.Add(row);File.WriteAllText(Path.Combine(output,"고정표본.json"),JsonUtility.ToJson(report,true));
            ScreenCapture.CaptureScreenshot(Path.Combine(output,"tick-"+tick.ToString("0000")+".png"));
        }
        void OnDestroy(){RenderPipelineManager.endCameraRendering-=OnCameraRendered;if(boss!=null)boss.Dispose();}
    }
}
