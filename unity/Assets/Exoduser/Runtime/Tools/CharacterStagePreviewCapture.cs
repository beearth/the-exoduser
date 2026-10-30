using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using UnityEngine;

namespace Exoduser.UnityPort.Tools
{
 // 명시적 검토 플래그만 자동 진입. 일반 실행/M1 자체 흐름은 건드리지 않는다.
 [DefaultExecutionOrder(3000)]
 internal sealed class CharacterStagePreviewCapture:MonoBehaviour
 {
  [Serializable] sealed class Check {public string id;public bool passed;public string detail;}
  [Serializable] sealed class Frame {public string name;public int width,height,visual,renderedFrames;public string language;public bool heroVisible;public NativeCharacterStagePreview.PoseSample pose;}
  [Serializable] sealed class Receipt {public string scope="격리 Player의 현재 UI API·기존 IMGUI KeyDown/MouseDown/MouseUp 주입. OS 손조작·자연진행과 구분";public string runtimeSha256,coreSha256,device,unityVersion,sandbox;public bool passed;public List<Check> checks=new List<Check>();public List<Frame> frames=new List<Frame>();public List<NativeCharacterStagePreview.PoseSample> motion=new List<NativeCharacterStagePreview.PoseSample>();}
  static string Arg(string key){var a=Environment.GetCommandLineArgs();int at=Array.IndexOf(a,key);return at>=0&&at+1<a.Length?a[at+1]:null;}
  static bool Has(string key){return Array.IndexOf(Environment.GetCommandLineArgs(),key)>=0;}
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.AfterSceneLoad)]
  static void Boot(){if(!NativeLobby.CharacterStageReviewRequested||Has("--unity-m1-check")||Has("--unity-ui-overlap-check"))return;if(!NativeQaSandbox.Active){Debug.LogError("3D 무대 후보는 격리 저장 경로 필요");Application.Quit(3);return;}var go=new GameObject("검토 전용 캐릭터 선택 진입");DontDestroyOnLoad(go);go.AddComponent<CharacterStagePreviewCapture>();}
  NativeLobby lobby;Receipt receipt;string output,language;bool checking;
  void Awake(){AudioListener.volume=0;AudioListener.pause=true;Application.runInBackground=true;Application.targetFrameRate=60;checking=Has("--unity-character-stage-check");if(checking){output=Arg("-output");if(string.IsNullOrEmpty(output)||!Path.IsPathRooted(output))throw new InvalidOperationException("무대 검수 절대 출력 필요");Directory.CreateDirectory(output);receipt=new Receipt{runtimeSha256=Hash(typeof(NativeLobby).Assembly.Location),coreSha256=Hash(typeof(Exoduser.UnityPort.Core.Simulation).Assembly.Location),device=SystemInfo.graphicsDeviceName,unityVersion=Application.unityVersion,sandbox=NativeQaSandbox.Root};}StartCoroutine(Guard(Run()));}
  static string Hash(string p){using(var h=System.Security.Cryptography.SHA256.Create())using(var f=File.OpenRead(p))return BitConverter.ToString(h.ComputeHash(f)).Replace("-","").ToLowerInvariant();}
  IEnumerator Guard(IEnumerator body){var stack=new Stack<IEnumerator>();stack.Push(body);while(stack.Count>0){bool more=false;object current=null;Exception error=null;try{more=stack.Peek().MoveNext();if(more)current=stack.Peek().Current;}catch(Exception e){error=e;}if(error!=null){if(receipt!=null){receipt.checks.Add(new Check{id="검수 예외",passed=false,detail=error.ToString()});Save();}Debug.LogError("CHARACTER_STAGE_CHECK_FAILED "+error);Application.Quit(2);yield break;}if(!more){stack.Pop();continue;}if(current is IEnumerator child)stack.Push(child);else yield return current;}}
  void Add(string id,bool passed,string detail=""){receipt.checks.Add(new Check{id=id,passed=passed,detail=detail});if(!passed)throw new InvalidOperationException(id+": "+detail);}
  void Save(){if(receipt==null)return;receipt.passed=receipt.checks.Count>0&&receipt.checks.TrueForAll(c=>c.passed);File.WriteAllText(Path.Combine(output,"기능_무대_검수.json"),JsonUtility.ToJson(receipt,true));}
  IEnumerator Run()
  {
   float deadline=Time.realtimeSinceStartup+20;while(lobby==null&&Time.realtimeSinceStartup<deadline){lobby=FindAnyObjectByType<NativeLobby>();yield return null;}if(lobby==null)throw new InvalidOperationException("실제 로비 없음");yield return new WaitForSecondsRealtime(.8f);
   lobby.SetPlaybackFocus(true);lobby.ShowLobby();lobby.OpenCharacterCreation();
   if(!checking)yield break;
   lobby.AutomatedInput=true;gameObject.AddComponent<NativeUiAudit.Host>();
   foreach(int width in new[]{1920,1600})foreach(string code in new[]{"ko","de","fr"})
   {
    language=code;lobby.SetLanguage(code);Screen.SetResolution(width,width*9/16,FullScreenMode.Windowed);yield return new WaitForSecondsRealtime(.45f);
    lobby.CloseCharacterCreation();yield return null;Add("생성열기 "+width+code,lobby.OpenCharacterCreation());
    for(int visual=0;visual<5;visual++){Add("선택 "+width+code+visual,lobby.ChooseCharacterVisual(visual));yield return Shot("캐릭터선택"+visual);var stage=lobby.CharacterStage;Add("실제RT "+width+code+visual,stage!=null&&stage.Ready&&stage.Output!=null&&stage.RenderedFrames>0,stage?.Error??"무대 없음");Add("전사1명/잠금 "+width+code+visual,stage.HeroVisible==(visual==0));if(visual==0){var pose=stage.Measure();Add("실제 신체높이 "+width+code,Mathf.Abs(pose.bodyHeight-1.85f)<.04f,pose.bodyHeight.ToString());Add("실제 전면축 "+width+code,pose.frontalDot>.9f,pose.frontalDot.ToString());}if(visual>0)Add("잠금 생성차단 "+width+code+visual,!lobby.ConfirmCharacterVisual()&&lobby.CharacterStageStep==1);}
    lobby.ChooseCharacterVisual(0);yield return new WaitForSecondsRealtime(.2f);
    // 기존 키보드 이동/Tab/Enter와 Escape 경로를 실제 핸들러에 전달한다.
    yield return Key(KeyCode.RightArrow,"visual-icon-0");Add("키보드 다음직업 "+width+code,lobby.CharacterStageVisual==1);
    yield return Key(KeyCode.Home,"visual-icon-1");Add("키보드 Home "+width+code,lobby.CharacterStageVisual==0);
    yield return Key(KeyCode.End,"visual-icon-0");Add("키보드 End "+width+code,lobby.CharacterStageVisual==4);
    yield return Key(KeyCode.Tab,"visual-icon-4"); // 다음은 취소. 잠긴 생성은 Tab 대기열에 없다.
    yield return Key(KeyCode.Escape,null);Add("Escape 뒤로 "+width+code,lobby.CharacterStageStep==0);
    yield return null;yield return Key(KeyCode.N,null);Add("키보드 N 열기 "+width+code,lobby.CharacterStageStep==1);
    // 실제 GUI.Button에 좌클릭 down/up. 오른쪽 네 번째 잠긴 슬롯 선택과 비활성 생성 유지.
    float size=Screen.height<=940?54:64,x=Screen.width-420;float rail=RailY();
    yield return Mouse(new Vector2(x+3*(380-size)/4+size*.5f,rail+size*.5f));Add("마우스 직업 "+width+code,lobby.CharacterStageVisual==3);
    yield return Mouse(new Vector2(x+290,Screen.height-62));Add("마우스 잠금차단 "+width+code,lobby.CharacterStageStep==1);
    yield return Mouse(new Vector2(x+size*.5f,rail+size*.5f));Add("마우스 전사 "+width+code,lobby.CharacterStageVisual==0);
    yield return Key(KeyCode.Return,"visual-create");Add("키보드 이름진입 "+width+code,lobby.CharacterStageStep==2);yield return Shot("이름입력");
    yield return Key(KeyCode.Escape,null);Add("이름 취소 "+width+code,lobby.CharacterStageStep==0);yield return null;
    Add("재열기 "+width+code,lobby.OpenCharacterCreation());lobby.ChooseCharacterVisual(0);
    yield return Mouse(new Vector2(x+290,Screen.height-62));Add("마우스 이름진입 "+width+code,lobby.CharacterStageStep==2);
    yield return Mouse(new Vector2(Screen.width*.5f-83,Screen.height*.5f+111));Add("마우스 이름취소 "+width+code,lobby.CharacterStageStep==0);yield return null;
    if(width==1920&&code=="ko"){
     lobby.OpenCharacterCreation();lobby.ChooseCharacterVisual(0);yield return new WaitForSecondsRealtime(.4f);
     Directory.CreateDirectory(Path.Combine(output,"대기연속"));for(int n=0;n<36;n++){yield return new WaitForSecondsRealtime(1f/12f);yield return new WaitForEndOfFrame();var pose=lobby.CharacterStage.Measure();receipt.motion.Add(pose);ScreenCapture.CaptureScreenshot(Path.Combine(output,"대기연속",n.ToString("000")+".png"));yield return null;}
     Add("대검 표시",receipt.motion.TrueForAll(p=>p.bladePresent));Add("발 접지",receipt.motion.TrueForAll(p=>Mathf.Abs(p.leftSole-.48f)<.035f&&Mathf.Abs(p.rightSole-.48f)<.035f));
     var first=receipt.motion[0];Add("발 미끄러짐",receipt.motion.TrueForAll(p=>Vector3.Distance(p.leftFoot,first.leftFoot)<.012f&&Vector3.Distance(p.rightFoot,first.rightFoot)<.012f));
     lobby.CloseCharacterCreation();yield return null;
    }
   }
   // 키 입력으로 이름을 실제 TextField에 넣고 기존 생성→스토리 진입을 확인한다.
   foreach(bool mouseCreate in new[]{false,true}){
    lobby.ShowLobby();yield return null;Add("최종 생성창",lobby.OpenCharacterCreation());lobby.ChooseCharacterVisual(0);lobby.ConfirmCharacterVisual();yield return null;
    string name=mouseCreate?"Review02":"Review01";foreach(char c in name){yield return Text(c);}int before=lobby.Characters.Count;
    if(mouseCreate)yield return Mouse(new Vector2(Screen.width*.5f+83,Screen.height*.5f+111));else yield return Key(KeyCode.Return,"character-create");
    Add((mouseCreate?"마우스":"키보드")+" 생성 저장/스토리",lobby.Characters.Count==before+1&&lobby.Characters.SelectedName==name&&lobby.CharacterStoryActive);
   }
   lobby.ShowLobby();yield return null;Save();lobby.enabled=false;lobby.CloseStartupCaptureMedia();AudioListener.volume=0;AudioListener.pause=true;yield return new WaitForSecondsRealtime(1);Debug.Log("CHARACTER_STAGE_CHECK_COMPLETE "+receipt.checks.Count);Application.Quit(0);
  }
  // 실제 이번 프레임의 UI 기록에서 아이콘 영역을 찾는다. 고정 해상도 좌표 추측으로 검사하지 않는다.
  float RailY(){var field=typeof(NativeLobby).GetField("silverVisualCaption",BindingFlags.Instance|BindingFlags.NonPublic);var font=((GUIStyle)field.GetValue(lobby)).font;var body=(GUIStyle)typeof(NativeLobby).GetField("silverBody",BindingFlags.Instance|BindingFlags.NonPublic).GetValue(lobby);var nameStyle=new GUIStyle(body){wordWrap=true,alignment=TextAnchor.UpperCenter};var small=new GUIStyle((GUIStyle)field.GetValue(lobby)){wordWrap=true};var visualLabel=typeof(NativeLobby).GetMethod("VisualSelectionLabel",BindingFlags.Instance|BindingFlags.NonPublic);var wrap=typeof(NativeLobby).GetMethod("SilverRailName",BindingFlags.Static|BindingFlags.NonPublic);float nh=0;string[] labels={"전사","실버테일","헬거너","변성술사","창법사"},en={"Warrior","Silvertail","Hellgunner","Transmuter","Spearmage"};for(int n=0;n<5;n++){string t=(string)visualLabel.Invoke(lobby,new object[]{labels[n],en[n]});nameStyle.font=NativeSilverHellUi.TextFont(body.font,t);t=(string)wrap.Invoke(null,new object[]{t,nameStyle,76f});nh=Mathf.Max(nh,nameStyle.CalcHeight(new GUIContent(t),76));}string soon=(string)visualLabel.Invoke(lobby,new object[]{"출시 준비 중","Coming soon"});small.font=NativeSilverHellUi.TextFont(font,soon);return Screen.height-84-18-(Screen.height<=940?54:64)-9-nh-9-small.CalcHeight(new GUIContent(soon),76);}
  IEnumerator Shot(string name){yield return new WaitForSecondsRealtime(.5f);NativeUiAudit.Active=true;yield return null;yield return new WaitForEndOfFrame();string id=Screen.width+"-"+language+"-"+name;NativeUiAudit.Save(Path.Combine(output,id+".json"),name,language);NativeUiAudit.Active=false;ScreenCapture.CaptureScreenshot(Path.Combine(output,id+".png"));var stage=lobby.CharacterStage;receipt.frames.Add(new Frame{name=id,width=Screen.width,height=Screen.height,visual=lobby.CharacterStageVisual,language=language,heroVisible=stage!=null&&stage.HeroVisible,renderedFrames=stage?.RenderedFrames??0,pose=stage==null?null:stage.Measure()});yield return null;Save();}
  IEnumerator Key(KeyCode key,string control){yield return Send(new Event{type=EventType.KeyDown,keyCode=key},control);yield return null;}
  IEnumerator Text(char c){yield return Send(new Event{type=EventType.KeyDown,character=c},"character-name");yield return null;}
  IEnumerator Mouse(Vector2 p){yield return Send(new Event{type=EventType.MouseDown,button=0,mousePosition=p},null);yield return Send(new Event{type=EventType.MouseUp,button=0,mousePosition=p},null);yield return null;}
  IEnumerator Send(Event e,string control){lobby.CharacterStageReviewInput(e,control);float deadline=Time.realtimeSinceStartup+4;while(lobby.CharacterStageReviewInputPending&&Time.realtimeSinceStartup<deadline)yield return null;if(lobby.CharacterStageReviewInputPending)throw new InvalidOperationException("로비 OnGUI 이벤트 미수신");}

 }
}
