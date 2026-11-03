using System;
using System.Collections;
using System.IO;
using UnityEngine;
namespace Exoduser.UnityPort
{
 // 로비 묘왕 위치 검수: `--unity-ancestor-lobby-capture -output <dir>`.
 // 16:9·1600×900·21:9·32:9에서 실제 로비를 찍고, 발 위치와 배경 원본 사각형 안 원형 단 중심을 영수증에 남긴다.
 public sealed partial class NativeGame
 {
  IEnumerator AncestorLobbyCapture()
  {
   string output=Argument("-output");if(string.IsNullOrEmpty(output))yield break;Directory.CreateDirectory(output);
   var rows=new System.Collections.Generic.List<string>();
   try{
    foreach(var size in new[]{new Vector2Int(1920,1080),new Vector2Int(1600,900),new Vector2Int(2560,1080),new Vector2Int(3840,1080)})
    {
     Screen.SetResolution(size.x,size.y,FullScreenMode.Windowed);
     double limit=LobbyNow+12;while(!(lobby.CurrentVideo.Prepared&&lobby.CurrentVideo.Frame>=0)&&LobbyNow<limit)yield return null;
     yield return new WaitForSecondsRealtime(1f);yield return new WaitForEndOfFrame();
     string name="ancestor-lobby-"+Screen.width+"x"+Screen.height;
     ScreenCapture.CaptureScreenshot(Path.Combine(output,name+".png"));yield return null;
     var art=lobby.AncestorArtRect;var foot=lobby.AncestorFoot;
     rows.Add("{\"requested\":\""+size.x+"x"+size.y+"\",\"screen\":\""+Screen.width+"x"+Screen.height+"\",\"png\":\""+name+".png\",\"art\":["+art.x.ToString("0.0")+","+art.y.ToString("0.0")+","+art.width.ToString("0.0")+","+art.height.ToString("0.0")+"],\"foot\":["+foot.x.ToString("0.0")+","+foot.y.ToString("0.0")+"],\"videoReady\":"+(lobby.CurrentVideo.Prepared?"true":"false")+"}");
    }
   }finally{
    File.WriteAllText(Path.Combine(output,"ancestor-lobby.json"),"{\"rows\":["+string.Join(",",rows)+"]}");
    lobbySmoke=false;lobby.AutomatedInput=false;Running=false;
   }
   lobby.enabled=false;lobby.CloseStartupCaptureMedia();sound.Reset();yield return new WaitForSecondsRealtime(1);
   Debug.Log("QA_MEDIA_DRAIN_COMPLETE ANCESTOR_LOBBY");Application.Quit(rows.Count==4?0:2);
  }
 }
}
