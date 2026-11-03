using System.Runtime.InteropServices;
namespace Exoduser.UnityPort {
 internal static class NativeOsReducedMotion {
#if UNITY_STANDALONE_WIN || UNITY_EDITOR_WIN
  [DllImport("user32.dll",SetLastError=true)] [return:MarshalAs(UnmanagedType.Bool)]static extern bool SystemParametersInfo(uint action,uint param,ref int value,uint flags);
#endif
  internal static bool Enabled {get{
#if UNITY_STANDALONE_WIN || UNITY_EDITOR_WIN
   int animations=1;return SystemParametersInfo(0x1042,0,ref animations,0)&&animations==0;
#else
   return false;
#endif
  }}
 }
}
