using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort
{
 internal static class NativeLoadingSelection
 {
  static readonly int[] ids={1,2,3,4,5,6,7,8,9,10,11,12,15,16,18,19};
  internal static readonly IReadOnlyList<int> Images=Array.AsReadOnly(ids);
  internal static bool IsAllowed(int id){return Array.IndexOf(ids,id)>=0;}
  internal static int ForStage(int stage){int n=stage%ids.Length;return ids[n<0?n+ids.Length:n];}
 }
}
