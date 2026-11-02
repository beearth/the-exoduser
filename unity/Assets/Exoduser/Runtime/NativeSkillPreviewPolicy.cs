using System;
namespace Exoduser.UnityPort{
 public static class NativeSkillPreviewPolicy{
  public static string Pick(string[] ids,Func<string,int> level,string preferred){foreach(var id in ids)if(level(id)>0)return id;return Array.IndexOf(ids,preferred)>=0?preferred:ids.Length>0?ids[0]:null;}
  public static int MaliceCost(int raw)=>raw<=0?0:Math.Max(1,(int)Math.Ceiling(raw*.5));
 }
}
