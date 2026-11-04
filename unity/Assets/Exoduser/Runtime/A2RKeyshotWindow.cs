using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;

namespace Exoduser.UnityPort
{
    // A hidden QA desktop still inherits the user's monitor bounds. Resize only
    // this Player's client area; never change the monitor or the camera lens.
    static class A2RKeyshotWindow
    {
#if UNITY_STANDALONE_WIN && !UNITY_EDITOR
        [StructLayout(LayoutKind.Sequential)] struct Rect { public int left,top,right,bottom; }
        [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
        [DllImport("user32.dll")] static extern IntPtr GetThreadDesktop(uint threadId);
        [DllImport("user32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool GetUserObjectInformation(IntPtr handle,int index,StringBuilder value,int length,out int needed);
        [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr handle,out uint processId);
        [DllImport("user32.dll")] static extern int GetWindowLong(IntPtr handle,int index);
        [DllImport("user32.dll",SetLastError=true)] static extern bool AdjustWindowRectEx(ref Rect rect,uint style,bool menu,uint extendedStyle);
        [DllImport("user32.dll",SetLastError=true)] static extern bool SetWindowPos(IntPtr handle,IntPtr after,int x,int y,int width,int height,uint flags);
        [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr handle,out Rect rect);
#endif
        internal static string ResizeHiddenClient(int width,int height)
        {
#if UNITY_STANDALONE_WIN && !UNITY_EDITOR
            var name=new StringBuilder(256);int needed;
            if(!GetUserObjectInformation(GetThreadDesktop(GetCurrentThreadId()),2,name,name.Capacity*2,out needed)||!name.ToString().StartsWith("ExoDesk",StringComparison.Ordinal))
                throw new InvalidOperationException("Keyshot resize requires the public runner's hidden desktop");
            using(var process=Process.GetCurrentProcess())
            {
                process.Refresh();var window=process.MainWindowHandle;uint owner;
                if(window==IntPtr.Zero||GetWindowThreadProcessId(window,out owner)==0||owner!=(uint)process.Id)
                    throw new InvalidOperationException("Keyshot own Player window missing");
                var rect=new Rect{right=width,bottom=height};
                if(!AdjustWindowRectEx(ref rect,unchecked((uint)GetWindowLong(window,-16)),false,unchecked((uint)GetWindowLong(window,-20))))
                    throw new InvalidOperationException("Keyshot window frame: "+Marshal.GetLastWin32Error());
                // NOSENDCHANGING avoids the monitor-sized WINDOWPOS constraint.
                if(!SetWindowPos(window,IntPtr.Zero,0,0,rect.right-rect.left,rect.bottom-rect.top,0x0002|0x0004|0x0010|0x0400))
                    throw new InvalidOperationException("Keyshot client resize: "+Marshal.GetLastWin32Error());
                Rect client;GetClientRect(window,out client);
                return name+" client="+(client.right-client.left)+"x"+(client.bottom-client.top);
            }
#else
            throw new PlatformNotSupportedException("Keyshot hidden client resize is Windows Player only");
#endif
        }
    }
}
