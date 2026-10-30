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
  [Serializable] sealed class EntryFrame {public int second;public float elapsed;public string stage,videoError;public long videoFrame;public double videoTime;}
  [Serializable] sealed class EntryReceipt {public bool storedSeen,scriptedKeys,passed;public string scope;public List<EntryFrame> frames=new List<EntryFrame>();}
  EntryReceipt entryReceipt;
  void InitializeEntryFlowCapture(string[] args)
  {
   if(Array.IndexOf(args,"--unity-entry-flow-capture")<0)return;
   string output=Argument("-output");
   if(!NativeQaSandbox.Active||string.IsNullOrWhiteSpace(output)||!Path.IsPathRooted(output))throw new InvalidOperationException("진입 검수는 명시적 격리 저장소와 절대 출력 경로가 필요합니다.");
   // 기존 QA 정책은 설정 I/O를 끈다. 이 명시 fixture만 격리 사본을 실제 codec/store로 읽어 최초 분기 직전에 완료 표식을 공급한다.
   var store=new NativeSettingsStore(Path.Combine(NativeQaSandbox.Root,"native-settings-v1"),NativeSettingsJsonCodec.Encode,NativeSettingsJsonCodec.Decode,settings,false);
   NativeSettingsSnapshot snapshot;NativeSettingsStoreStatus status;
   if(!store.TryLoad(out snapshot,out status))throw new InvalidOperationException("진입 검수 설정 사본 읽기 실패: "+status);
   string raw;cinSeen=snapshot!=null&&snapshot.extra!=null&&snapshot.extra.TryGetValue("cinSeen",out raw)&&raw=="true";
   entryReceipt=new EntryReceipt{storedSeen=cinSeen,scriptedKeys=Array.IndexOf(args,"--entry-flow-keys")>=0,scope="1600x900 실제 Player, 1초 간격 90장. 격리 설정 사본의 완료 표식만 주입. 선택적 LobbyKeys는 제품 입력 경로를 호출하며 OS 손조작이 아님."};
  }
  IEnumerator EntryFlowCapture()
  {
   string output=Argument("-output");Directory.CreateDirectory(output);lobby.SetPlaybackFocus(true);
   float start=Time.realtimeSinceStartup;bool menuKey=false,sealKey=false,skip=false;
   for(int second=0;second<90;second++)
   {
    while(Time.realtimeSinceStartup-start<second)yield return null;
    yield return new WaitForEndOfFrame();
    var video=lobby.CurrentVideo;
    entryReceipt.frames.Add(new EntryFrame{second=second,elapsed=Time.realtimeSinceStartup-start,stage=lobby.StageName,videoError=lobby.VideoError,videoFrame=video.Frame,videoTime=video.Time});
    var tex=ScreenCapture.CaptureScreenshotAsTexture();File.WriteAllBytes(Path.Combine(output,"frame_"+second.ToString("000")+".png"),tex.EncodeToPNG());Destroy(tex);
    if(entryReceipt.scriptedKeys)
    {
     if(!menuKey&&second>=10&&lobby.StageName=="SplashTitle"){LobbyKeys.Press(KeyCode.Return);menuKey=true;}
     else if(menuKey&&!sealKey&&second>=25&&lobby.StageName=="Title"){LobbyKeys.Press(KeyCode.Return);sealKey=true;}
     else if(sealKey&&!skip&&second>=65&&lobby.StageName=="WorldIntro"){LobbyKeys.Hold(KeyCode.Escape,true);skip=true;}
     if(second>=72)LobbyKeys.ReleaseAll();
    }
   }
   var stages=new HashSet<string>();foreach(var f in entryReceipt.frames)stages.Add(f.stage);
   entryReceipt.passed=stages.Contains("FDG")&&stages.Contains("SplashTitle")&&(!entryReceipt.scriptedKeys||stages.Contains("Title")&&stages.Contains("WorldIntro")&&stages.Contains("Lobby"));
   File.WriteAllText(Path.Combine(output,"entry-flow.json"),JsonUtility.ToJson(entryReceipt,true));LobbyKeys.ReleaseAll();lobby.CloseStartupCaptureMedia();
   Debug.Log("ENTRY_FLOW_CAPTURE frames="+entryReceipt.frames.Count+" storedSeen="+cinSeen+" passed="+entryReceipt.passed);
   // 자동 종료 대신 실행기의 명시 KillAfterSec가 촬영 전용 프로세스를 끝낸다. 숨은 desktop의 기존 InputSystem 종료 지연과 기능 판정을 분리한다.
  }
 }
}
