using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
  [Serializable] sealed class HeroFrame {
   public int frame,tick,combo;public string section,state,motion;public float phase,x,y,footError,screenHeight,screenX,screenY;public bool spriteVisible;public Vector3 root;
  }
  [Serializable] sealed class HeroReview {
   public string scope="실제 Player·격리 세이브·Core 입력과 별도 피격/사망 fixture, OS 손조작 아님. PNG 연속프레임을30fps 영상으로 조립";
   public string device;public bool passed,world3D;public float idleMeshHeight;public List<string> checks=new List<string>();public List<HeroFrame> frames=new List<HeroFrame>();
  }
  IEnumerator HeroCapture(){
   string output=Argument("-output");
   if(string.IsNullOrEmpty(output)||string.IsNullOrEmpty(Argument("--unity-qa-sandbox"))){Debug.LogError("전사 검수는 명시적 출력·격리 세이브가 필요");Application.Quit(2);yield break;}
   Directory.CreateDirectory(output);Directory.CreateDirectory(Path.Combine(output,"frames"));
   AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;Application.targetFrameRate=60;smokeActive=true;dropSmoke=true;pauseSmoke=true;Running=false;
   Screen.SetResolution(1600,900,FullScreenMode.Windowed);lobby.ShowLobby();lobby.SelectPreview();lobby.EnterNativeTest();
   EndFirstPractice(true);frontendEntryInputFence=false;menu=false;Running=false;
   yield return new WaitForSecondsRealtime(.6f);
   float deadline=Time.realtimeSinceStartup+45;while(NativeRemodel3D.Requested&&!NativeRemodel3D.Active&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
   var report=new HeroReview{device=SystemInfo.graphicsDeviceName,world3D=NativeRemodel3D.Active};bool ok=true;
   Action<bool,string> check=(pass,label)=>{report.checks.Add((pass?"통과 ":"실패 ")+label);ok&=pass;};
   check(heroView!=null&&heroView.Ready,"실제 Resources 전사·대검·망토 생성");
   check(!NativeRemodel3D.Requested||NativeRemodel3D.Active,"요청된 3D 필드 로드");
   if(heroView==null||!heroView.Ready){Application.Quit(2);yield break;}
   var sim=Simulation;var p=sim.Player;sim.Config.EnemyAiEnabled=false;sim.Enemies.Clear();sim.SpawnHoles=null;sim.CrossbowAuto=false;
   p.Iframes=10000;p.Mana=p.MaxMana;p.Stamina=p.MaxStamina;
   float moveX=1,moveY=0;bool free=false;
   foreach(var d in new[]{new Vector2(1,0),new Vector2(-1,0),new Vector2(0,-1),new Vector2(0,1)}){
    bool good=true;for(int q=1;q<=12;q++)if(!Map.CanMove(p.X+d.x*q*25,p.Y+d.y*q*25,p.Radius)){good=false;break;}
    if(good){moveX=d.x;moveY=d.y;free=true;break;}
   }
   check(free,"충돌을 유지한 이동·구르기 방향 확보");
   string[] sections={"대기","달리기","구르기","대검3타","검기3타","E충전강타","시전","보조시전","패링","피격","사망"};
   int[] lengths={60,90,36,180,180,120,90,60,45,45,90};int frame=0,shot=0;var motions=new HashSet<string>();
   foreach(string section in sections){
    int index=Array.IndexOf(sections,section);p.State="idle";p.StateTicks=0;
    sim.Config.ActiveAttack=section=="대검3타"?"weapon":"kiSlash";
    if(section=="구르기"){sim.HarpGauge=225;sim.SetRollInput(moveY<0,moveY>0,moveX<0,moveX>0,false);}
    if(section=="피격"){p.Iframes=0;p.Hp=p.MaxHp;p.Shield=p.MaxShield;sim.HurtPlayer(80);}
    if(section=="사망"){p.Iframes=0;p.Hp=0;p.Shield=0;p.State="dead";p.StateTicks=0;}
    var sectionMotions=new HashSet<string>();var sectionCombos=new HashSet<int>();
    for(int f=0;f<lengths[index];f++,frame++){
     bool attack=section=="대검3타"||section=="검기3타"&&f<130;
     if(section=="구르기")sim.SetRollInput(moveY<0,moveY>0,moveX<0,moveX>0,f==0);
     sim.SetPlayerCombatInput(section=="패링"&&f<30,section=="E충전강타"&&f<70,false);
     sim.SetSkillInput(section=="보조시전"&&f==0,false,false,false,section=="시전"&&f==0,false,false,false);
     StepInput(section=="달리기"?moveX:0,section=="달리기"?moveY:0,p.X+moveX*300,p.Y+moveY*300,attack,false);
     Running=false;yield return null;yield return new WaitForEndOfFrame();
     var motion=heroView.Motion;motions.Add(motion.MotionKind.ToString());sectionMotions.Add(motion.MotionKind.ToString());
     if(motion.MotionKind==HeroMotionKind.Swing)sectionCombos.Add(motion.ComboStep);
     if(f%2==0){
      if(section=="대기"&&f==30){
       float meshLow=float.MaxValue,meshHigh=float.MinValue;
       foreach(var r in heroView.Model.GetComponentsInChildren<SkinnedMeshRenderer>()){
        var mesh=new Mesh();r.BakeMesh(mesh);foreach(var vertex in mesh.vertices){var v=HudCamera.WorldToViewportPoint(r.transform.TransformPoint(vertex));meshLow=Mathf.Min(meshLow,v.y);meshHigh=Mathf.Max(meshHigh,v.y);}Destroy(mesh);
       }
       report.idleMeshHeight=meshHigh-meshLow;check(report.idleMeshHeight>=.08f&&report.idleMeshHeight<=.10f,"대기 실제 스킨 메시 높이8~10%: "+(report.idleMeshHeight*100).ToString("F2")+"%");
      }
      float low=float.MaxValue,high=float.MinValue;
      foreach(var r in heroView.Model.GetComponentsInChildren<SkinnedMeshRenderer>()){
       var b=r.bounds;for(int a=0;a<8;a++){var v=b.center+Vector3.Scale(b.extents,new Vector3((a&1)==0?-1:1,(a&2)==0?-1:1,(a&4)==0?-1:1));var screen=HudCamera.WorldToViewportPoint(v);low=Mathf.Min(low,screen.y);high=Mathf.Max(high,screen.y);}
      }
      var anchor=HudCamera.WorldToScreenPoint(heroView.Model.transform.parent.position);
      report.frames.Add(new HeroFrame{frame=frame,tick=sim.TickCount,section=section,state=p.State,motion=motion.MotionKind.ToString(),phase=motion.MotionPhase,combo=motion.ComboStep,x=p.X,y=p.Y,footError=heroView.FootError(),screenHeight=high-low,screenX=anchor.x,screenY=Screen.height-anchor.y,spriteVisible=playerView.enabled,root=heroView.Model.transform.parent.position});
      ScreenCapture.CaptureScreenshot(Path.Combine(output,"frames","hero-"+(shot++).ToString("0000")+".png"));
     }
    }
    if(section=="E충전강타"){check(sectionMotions.Contains("Charge"),"E 충전 구간 실제 Charge");check(sectionMotions.Contains("Bash"),"E 해제 실제 강타");check(sectionMotions.Contains("BashRecover"),"E 강타 실제 회복");}
    if(section=="대검3타"||section=="검기3타")foreach(int combo in new[]{1,2,3})check(sectionCombos.Contains(combo),section+" 실제 휘두르기 "+combo);
    if(section=="검기3타")check(!p.KiChargeActive,"검기130틱 눌림→해제로3타 발사 후 충전 상태 종료");
    if(section=="사망")check(sectionMotions.Contains("Dead"),"오버레이를 분리한 사망 모션");
    if(section=="달리기"){
     menu=true;Running=false;int frozenTick=sim.TickCount;var animator=heroView.Model.GetComponent<Animator>();
     var hand=animator.GetBoneTransform(HumanBodyBones.RightHand);var foot=animator.GetBoneTransform(HumanBodyBones.LeftFoot);
     Vector3 handBefore=hand.position,footBefore=foot.position;float error=0;
     for(int hold=0;hold<12;hold++){yield return null;yield return new WaitForEndOfFrame();error=Mathf.Max(error,Vector3.Distance(hand.position,handBefore),Vector3.Distance(foot.position,footBefore));}
     check(sim.TickCount==frozenTick&&error<.0001f,"달리기 중 메뉴12프레임: Core·손발 본 정지 오차 "+error.ToString("F6"));
     menu=false;Running=false;
    }
   }
   check(!playerView.enabled,"3D 생성 성공 시 기존 플레이어 빌보드 숨김");
   foreach(string kind in new[]{"Idle","Run","Roll","Swing","Recover","Charge","SlamWindup","SlamStrike","SlamRecover","Hurt","Dead"})check(motions.Contains(kind),"실제 상태 샘플 "+kind);
   report.passed=ok;File.WriteAllText(Path.Combine(output,"hero-review.json"),JsonUtility.ToJson(report,true));
   lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();
   yield return new WaitForSecondsRealtime(.8f);Application.Quit(ok?0:2);
  }
 }
}
