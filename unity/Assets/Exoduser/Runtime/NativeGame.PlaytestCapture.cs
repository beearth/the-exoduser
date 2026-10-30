using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using UnityEngine;
using UnityEngine.InputSystem;
using Unity.Cinemachine;
using UnityEngine.InputSystem.LowLevel;
using Exoduser.UnityPort.Core;
namespace Exoduser.UnityPort {
 public sealed partial class NativeGame {
   [Serializable] sealed class PlaytestKi {public float x,y,life,r;public int dmg,step;}
   [Serializable] sealed class SkillViewAudit {public string key;public int frame,sprites,depthFailures;public float centerError,groundTiltError;}
   [Serializable] sealed class PlaytestFrame { public bool charging,roll,orb;public float trapCd,slamCd,domeCd,iceCd;public double qCd;public int materials,iceT;public float charge,combo,kiCd,iframes;public double rollTicks,gauge;public int step;public List<PlaytestKi> kiDetails=new List<PlaytestKi>(); public string key; public int frame,tick; public float x,y,facing,aimError,maxSpriteError,maxKiSpriteError,stateTicks,stamina,mana; public string state; public List<Vector2> ki=new List<Vector2>(),magic=new List<Vector2>(),magicVelocity=new List<Vector2>(),blades=new List<Vector2>(); public float harpX,harpY; public bool harp,dash; public int zones,waves,blasts,burstViews,shieldWaves; public bool shieldAura,flameArc;public List<Vector2> shieldWavePositions=new List<Vector2>();public float shieldRange;public double shieldCd,wingTicks; }
    [Serializable] sealed class PlaytestResult { public string scope="실제 Player, 가상 Input System 장치 → 기존 FixedUpdate → Core → LateUpdate. OS 손조작 아님"; public bool passed,remodel3d,maliceTrailDefaultColorSpace,kiOverlayDepth;public float fieldOfView,heroScale,pitchDegrees,distance,lookAhead,baselineHp,baselineMana,baselineStamina,baselineSpeed,baselineCastSpeed; public int failures; public List<string> checks=new List<string>(); public List<PlaytestFrame> frames=new List<PlaytestFrame>();public List<SkillViewAudit> skillViewAudit=new List<SkillViewAudit>(); }
  IEnumerator PlaytestCapture() {
    if(Argument("-combat-parity")=="1"){yield return CombatParityCapture();yield break;}
   string output=Argument("-output"); if(string.IsNullOrEmpty(output)){Application.Quit(2);yield break;} Directory.CreateDirectory(output);
   AudioListener.volume=0;AudioListener.pause=true;smokeActive=true;dropSmoke=true;Running=false;
   Screen.SetResolution(1600,900,FullScreenMode.Windowed);lobby.Flow.ShowLobby();lobby.Flow.SelectPreview();lobby.Flow.EnterTest();
   if(firstPractice!=null)EndFirstPractice(true);frontendEntryInputFence=false;menu=false;SetGameFocus(true);Running=false;
   yield return new WaitForSecondsRealtime(.5f);
   float deadline=Time.realtimeSinceStartup+40;while(NativeRemodel3D.Requested&&!NativeRemodel3D.Active&&Time.realtimeSinceStartup<deadline){UpdateViews();yield return null;}
   var result=new PlaytestResult{remodel3d=NativeRemodel3D.Active,fieldOfView=NativeRemodelCamera.FieldOfView,heroScale=NativeRemodelCamera.HeroScale,pitchDegrees=NativeRemodelCamera.Pitch*Mathf.Rad2Deg,distance=NativeRemodelCamera.Distance,lookAhead=NativeRemodelCamera.TargetOffset.z,baselineHp=Simulation.Player.MaxHp,baselineMana=Simulation.Player.MaxMana,baselineStamina=Simulation.Player.MaxStamina,baselineSpeed=Simulation.Player.Speed,baselineCastSpeed=(float)Simulation.MagicCastSpeed()};
   Action<bool,string> check=(ok,label)=>{result.checks.Add((ok?"통과 ":"실패 ")+label);if(!ok)result.failures++;};
   check(!NativeRemodel3D.Requested||NativeRemodel3D.Active,"요청된 3D 필드 로드");
   var manualBrain=NativeRemodel3D.Active&&r3Cam!=null?r3Cam.GetComponent<CinemachineBrain>():null;var oldCameraUpdate=manualBrain!=null?manualBrain.UpdateMethod:CinemachineBrain.UpdateMethods.SmartUpdate;if(Application.isBatchMode&&manualBrain!=null){r3Late.enabled=false;manualBrain.UpdateMethod=CinemachineBrain.UpdateMethods.ManualUpdate;}
   var oldKeyboard=Keyboard.current;var oldMouse=Mouse.current;var keyboard=InputSystem.AddDevice<Keyboard>();var mouse=InputSystem.AddDevice<Mouse>();
   try {
    var controls=new List<string>{"LMB","RMB","Shift","E","Q","Ctrl","Space","1","2","3","4","F","Z","Roll"};
    if(Argument("-movement-parity")=="1")controls=new List<string>{"MoveWalk","MoveDiagonal","MoveRMB","MoveLMB","MoveQ","MoveE"};
    if(Argument("-combo-parity")=="1")controls=new List<string>{"Combo119","Combo159","Combo210","ComboQ110"};
    if(Argument("-malice-directions")=="1"){for(int i=0;i<8;i++){controls.Add("RMB-"+i);controls.Add("LMB-"+i);}controls.Add("RMB-sweep");controls.Add("RMB-lv3");}
    string selectedControls=Argument("-playtest-controls");if(!string.IsNullOrEmpty(selectedControls)){var selected=selectedControls.Split(',');controls.RemoveAll(c=>Array.IndexOf(selected,c)<0);}
    foreach(string control in controls) {
     bool comboCase=control.StartsWith("Combo",StringComparison.Ordinal);bool moving=comboCase||control.StartsWith("Move",StringComparison.Ordinal);string action=comboCase?"LMB":moving?control.Substring(4):control.Split('-')[0];bool directional=control.Contains("-");
     ResetRun();if(firstPractice!=null)EndFirstPractice(true);menu=false;frontendEntryInputFence=false;SetGameFocus(true);Running=false;
     var s=Simulation;var p=s.Player;s.Random01=()=>.5;s.SkillRandom01=()=>.5;s.Config.EnemyAiEnabled=false;s.Enemies.Clear();s.SpawnHoles=null;s.CrossbowAuto=false;s.Materials=1000;p.Iframes=100000;
     // 웹 이동 비교 하니스도 매 사례 시작에 자원을 가득 채운다. 실제 신규 게임의 장착·clamp 정책은 바꾸지 않는다.
      if(moving||action=="Roll"){p.Hp=p.MaxHp;p.Mana=p.MaxMana;p.Stamina=p.MaxStamina;p.Shield=p.MaxShield;}if(action=="Roll")p.Iframes=0;
     if(control=="RMB-lv3")s.Skills.Levels["fireball"]=3;
     // 맵 충돌을 끄지 않고 시작점의 열린 방향을 선택한다.
     float dx=1,dy=0;bool free=false;float[][] dirs={new[]{1f,0f},new[]{-1f,0f},new[]{0f,-1f},new[]{0f,1f}};
     foreach(var d in dirs){bool ok=true;for(int t=1;t<=20;t++)if(!Map.CanMove(p.X+d[0]*t*25,p.Y+d[1]*t*25,p.Radius)){ok=false;break;}if(ok){dx=d[0];dy=d[1];free=true;break;}}
     if(directional){int dir=control=="RMB-sweep"||control=="RMB-lv3"?0:int.Parse(control.Split('-')[1]);
      // 웹 MouseEvent.clientX/Y는 정수로 전달된다. 같은1600×900 입력 격자의 실제 방향을 대조한다.
      dx=(float)(Math.Floor(800+Math.Cos(dir*Math.PI/4)*300)-800);dy=(float)(Math.Floor(450+Math.Sin(dir*Math.PI/4)*300)-450);float length=Mathf.Sqrt(dx*dx+dy*dy);dx/=length;dy/=length;
      free=Map.CanMove(p.X+dx*25,p.Y+dy*25,p.Radius);}
     check(free,control+" 열린 발사 시작점");float x0=p.X,y0=p.Y,aimX=p.X+dx*300,aimY=p.Y+dy*300;
     UpdateViews();yield return null;if(Application.isBatchMode&&NativeRemodel3D.Active){Remodel3DLate();manualBrain?.ManualUpdate();}else if(!Application.isBatchMode)yield return new WaitForEndOfFrame();
      float maxMotion=0,maxError=0,maxKiError=0,maxAimError=0;bool spawned=false,zone=false,orb=false,blades=false,block=false,wave=false,burstSeen=false,guardSeen=false,flameSeen=false;int cast0=s.SkillCastCount;
     for(int f=0;f<(comboCase?260:moving?90:action=="RMB"?240:control=="Ctrl"?150:80);f++) {
      if(control=="RMB-sweep"&&f==1){aimX=x0;aimY=y0+300;}
      if(comboCase){aimX=p.X+dx*300;aimY=p.Y+dy*300;}
      bool held=f<(comboCase?(control=="Combo119"?119:control=="Combo159"?159:210):moving?14:action=="E"||action=="Roll"?1:14);var keys=new List<Key>();if(held){switch(action){case "Roll":keys.Add(Key.Space);keys.Add(dx>0?Key.D:dx<0?Key.A:dy>0?Key.S:Key.W);break;case "Shift":keys.Add(Key.LeftShift);break;case "E":keys.Add(Key.E);break;case "Q":keys.Add(Key.Q);break;case "Ctrl":keys.Add(Key.LeftCtrl);break;case "Space":keys.Add(Key.Space);break;case "1":keys.Add(Key.Digit1);break;case "2":keys.Add(Key.Digit2);break;case "3":keys.Add(Key.Digit3);break;case "4":keys.Add(Key.Digit4);break;case "F":keys.Add(Key.F);break;case "Z":keys.Add(Key.Z);break;}}
      if(control=="ComboQ110"&&f>=110&&f<130)keys.Add(Key.Q);
      if(moving){keys.Add(Key.D);if(action=="Diagonal")keys.Add(Key.W);}
      keyboard.MakeCurrent();mouse.MakeCurrent();InputState.Change(keyboard,new KeyboardState(keys.ToArray()));
      var aimPoint=NativeRemodel3D.Point(aimX,aimY);if(NativeRemodel3D.Active)aimPoint.y=NativeRemodel3D.Point(p.X,p.Y).y;var screen=HudCamera.WorldToScreenPoint(aimPoint);var ms=new MouseState{position=new Vector2(screen.x,screen.y)};if(held&&action=="LMB")ms=ms.WithButton(MouseButton.Left);if(held&&action=="RMB")ms=ms.WithButton(MouseButton.Right);InputState.Change(mouse,ms);
      var actualAim=AimWorld();float aimError=Vector2.Distance(new Vector2(actualAim.x*100,-actualAim.y*100),new Vector2(aimX,aimY));maxAimError=Mathf.Max(maxAimError,aimError);
      Running=true;FixedUpdate();Running=false;UpdateViews();
      yield return null;if(Application.isBatchMode&&NativeRemodel3D.Active){Remodel3DLate();manualBrain?.ManualUpdate();}else if(!Application.isBatchMode)yield return new WaitForEndOfFrame();
      var row=new PlaytestFrame{orb=s.IceOrbActive,iceT=s.IceOrbT,trapCd=s.SpikeTrapCd,slamCd=s.GiantSlamCd,domeCd=s.HolyDomeCd,iceCd=s.IceOrbCd,qCd=s.SbCd,materials=s.Materials,charging=p.KiChargeActive,charge=p.KiChargeTicks,step=s.KiComboStep,combo=s.KiComboTicks,kiCd=s.KiCooldownTicks,key=control,frame=f,tick=s.TickCount,x=p.X,y=p.Y,facing=p.Facing,state=p.State,stateTicks=p.StateTicks,stamina=p.Stamina,mana=p.Mana,aimError=aimError,harp=(s.HarpActive),dash=s.DashActive,harpX=(float)s.HarpX,harpY=(float)s.HarpY,zones=s.FireZones.Count,waves=s.SlamWaves.Count,blasts=s.MaliceOrbBlasts,burstViews=skillView.ActiveMaliceBursts,shieldWaves=s.ShieldWaves.Count,shieldCd=s.ShieldThrowCd,wingTicks=s.ShieldWingTicks,shieldAura=skillView.ShieldAuraShown,flameArc=skillView.FlameArcShown,shieldRange=skillView.ShieldRangeShown};guardSeen|=row.shieldAura;flameSeen|=row.flameArc;burstSeen|=row.burstViews>0;
      row.roll=s.RollActive;row.rollTicks=s.RollMoveT;row.gauge=s.HarpGauge;row.iframes=p.Iframes;
       if(NativeRemodel3D.Active){skillView.AuditPresentation(s,out float center,out float tilt,out int depth,out int sprites);result.skillViewAudit.Add(new SkillViewAudit{key=control,frame=f,sprites=sprites,centerError=center,groundTiltError=tilt,depthFailures=depth});if(center>.02f||tilt>.001f||depth!=0){result.failures++;result.checks.Add("실패 스킬 표시 "+control+"/"+f+" 중심="+center+" 지면="+tilt+" 깊이="+depth);}}
      maxMotion=Mathf.Max(maxMotion,Vector2.Distance(new Vector2(p.X,p.Y),new Vector2(x0,y0)));
      foreach(var b in s.Projectiles)if(b.Active){row.ki.Add(new Vector2(b.X,b.Y));row.kiDetails.Add(new PlaytestKi{x=b.X,y=b.Y,dmg=b.Damage,step=b.Step,life=b.Life,r=b.Radius});spawned=true;maxMotion=Mathf.Max(maxMotion,Vector2.Distance(new Vector2(b.X,b.Y),new Vector2(x0,y0)));if(NativeRemodel3D.Active){var go=GameObject.Find("Ki crescent "+b.Id+" layer 4");row.maxKiSpriteError=Mathf.Max(row.maxKiSpriteError,go!=null?Vector3.Distance(go.transform.position,NativeRemodel3D.Point(b.X,b.Y)):1000);}}
      if(p.KiChargeActive&&NativeRemodel3D.Active){var go=GameObject.Find("Ki third charge 1");row.maxKiSpriteError=Mathf.Max(row.maxKiSpriteError,go!=null?Vector3.Distance(go.transform.position,NativeRemodel3D.Point(p.X,p.Y)):1000);}maxKiError=Mathf.Max(maxKiError,row.maxKiSpriteError);
      foreach(var b in s.MaliceOrbs)if(b.Active){row.magic.Add(new Vector2(b.X,b.Y));row.magicVelocity.Add(new Vector2(b.Vx,b.Vy));spawned=true;maxMotion=Mathf.Max(maxMotion,Vector2.Distance(new Vector2(b.X,b.Y),new Vector2(x0,y0)));if(NativeRemodel3D.Active){var go=GameObject.Find("malice"+b.Id);if(go!=null){var sr=go.transform.Find("orb").GetComponent<SpriteRenderer>();var expected=NativeSkillView.MalicePosition(b.X,b.Y);row.maxSpriteError=Mathf.Max(row.maxSpriteError,Vector3.Distance(sr.transform.position,expected));}}}
      foreach(var w in s.ShieldWaves)row.shieldWavePositions.Add(new Vector2((float)w.X,(float)w.Y));
      foreach(var b in s.SkillBlades)if(b.Active)row.blades.Add(new Vector2(b.X,b.Y));zone|=s.FireZones.Count>0;orb|=s.IceOrbActive;blades|=row.blades.Count>0;block|=p.State=="sBlock";wave|=row.waves>0;maxError=Mathf.Max(maxError,row.maxSpriteError);result.frames.Add(row);
      if(f%3==0){string shot=Path.Combine(output,control+"-"+f.ToString("000")+".png");if(Application.isBatchMode)RmIntShot(shot);else{var texture=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(shot,texture.EncodeToPNG());Destroy(texture);}}
     }
     check(maxAimError<1,control+" 조준 오차 "+maxAimError.ToString("F2")+"px");
     if(action=="LMB"||action=="RMB")check(spawned&&maxMotion>100,control+" 투사체 전진 "+maxMotion.ToString("F1")+"px");
      if(action=="RMB"&&NativeRemodel3D.Active)check(maxError<.02f,"악의구 Core→화면 위치 오차 "+maxError.ToString("F3")+"u");
      if(action=="LMB"&&NativeRemodel3D.Active){check(maxKiError<.02f,"기검·충전 Core→화면 중심 오차 "+maxKiError.ToString("F3")+"u");result.kiOverlayDepth=kiView.OverlayDepth;check(result.kiOverlayDepth,"기검 전용3D 재질 합성 깊이");}
     if(action=="RMB"&&directional){var first=result.frames.Find(r=>r.key==control&&r.magicVelocity.Count>0);check(first!=null&&Vector2.Distance(first.magicVelocity[0],new Vector2(dx*5.5f,dy*5.5f))<.01f,control+" 시전 시작 방향·속도5.5px");}
     if(action=="RMB"&&!moving)check(s.MaliceOrbBlasts==1&&burstSeen&&skillView.ActiveMaliceBursts==0,control+" 실제 폭발1회·원본 표시·수명 종료");
     if(control=="ComboQ110"){var canceled=result.frames.Find(r=>r.key==control&&r.frame==110);check(canceled!=null&&canceled.state=="sBlock"&&!canceled.charging&&canceled.step==0,"기검3타 Q 취소 순간 자세·충전·콤보 초기화");}
     if(comboCase&&control!="ComboQ110")check(result.frames.Exists(r=>r.key==control&&r.kiDetails.Exists(k=>k.step==3)),control+" 실제 충전3타 발사");
     if(moving)check(maxMotion>0,control+" 실제 방향키 동시 이동");
     if(action=="Q")check(guardSeen,"Q 원본 오라와 판정 반경 표시");if(action=="E")check(flameSeen&&s.ShieldThrowCount==1,"E 기본 합체1회·원본 불꽃 스윙 표시");
     if(control=="E")check(s.BashStrikeCount>0,"E 짧게 눌러 강타 판정");if(control=="Q")check(block,"Q 패링 자세");if(control=="Space")check(wave&&s.SkillCastCount>cast0,"Space 지옥강타");
     if(control=="Roll")check(maxMotion>=174&&maxMotion<=176&&s.SkillCastCount==cast0&&!wave,"이동+Space 구르기175px·스킬 중복시전0");
     if(control=="Shift")check(maxMotion>100,"사슬 이동 "+maxMotion.ToString("F1")+"px");
     if(control=="1"||control=="F")check(zone,"원본 고정 장판 "+control);if(control=="Ctrl")check(orb&&blades,"얼음보주→자동 파쇄→얼음 파편");
     if(control=="2"||control=="3"||control=="4"||control=="Z")check(s.SkillCastCount==cast0,"미배정 슬롯 "+control+" 무시");
    }
   } finally {InputSystem.RemoveDevice(keyboard);InputSystem.RemoveDevice(mouse);if(oldKeyboard!=null)oldKeyboard.MakeCurrent();if(oldMouse!=null)oldMouse.MakeCurrent();if(manualBrain!=null)manualBrain.UpdateMethod=oldCameraUpdate;if(r3Late!=null)r3Late.enabled=true;}
   result.maliceTrailDefaultColorSpace=NativeSkillView.MaliceTrailDefaultColorSpace;result.passed=result.failures==0;File.WriteAllText(Path.Combine(output,"playtest.json"),JsonUtility.ToJson(result,true));lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);Application.Quit(result.passed?0:2);
  }
 }
}
