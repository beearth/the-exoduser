using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Custom art owns every plate. Native controls retain text/input/focus, never a skin background.
    internal static class NativeUiChrome
    {
        static GUIStyle stockButton;
        internal static bool StockProbe;
        internal static bool OpacityProbe;
        internal static int StrippedStates {get;private set;}
        internal static string StockStates {get;private set;}="";
        internal static void RememberStock()
        {
            if(stockButton!=null)return;
            stockButton=new GUIStyle(GUI.skin.button);
            StockStates=Describe(stockButton.normal)+","+Describe(stockButton.hover)+","+Describe(stockButton.active)+","+Describe(stockButton.focused)+","+
                Describe(stockButton.onNormal)+","+Describe(stockButton.onHover)+","+Describe(stockButton.onActive)+","+Describe(stockButton.onFocused);
        }
        static string Describe(GUIStyleState state){return state.background==null?"null":state.background.name;}
        static void ClearState(GUIStyleState state)
        {
            if(state.background!=null)StrippedStates++;
            state.background=null;
            // Unity exposes separate HiDPI skin textures only to Editor assemblies.
#if UNITY_EDITOR
            state.scaledBackgrounds=Array.Empty<Texture2D>();
#endif
        }
        internal static GUIStyle ClearBackgrounds(GUIStyle style,string owner="")
        {
            RememberStock();if(style==null)style=GUIStyle.none;
            int before=StrippedStates;
            ClearState(style.normal);ClearState(style.hover);ClearState(style.active);ClearState(style.focused);
            ClearState(style.onNormal);ClearState(style.onHover);ClearState(style.onActive);ClearState(style.onFocused);
            if(before!=StrippedStates&&Array.IndexOf(Environment.GetCommandLineArgs(),"--unity-death-ui-smoke")>=0)
                Debug.Log("DEATH_UI_SKIN_REMOVED "+owner+" style="+style.name+" states="+(StrippedStates-before));
            return style;
        }
        internal static void DrawStockProbe(Rect rect)
        {
            if(!StockProbe||Event.current.type!=EventType.Repaint)return;
            RememberStock();
            // Deliberate QA control: bypass the sanitized wrapper at the exact production plate rectangle.
            var tint=GUI.color;var background=GUI.backgroundColor;
            try{GUI.color=Color.white;GUI.backgroundColor=Color.white;GUI.Button(rect,GUIContent.none,stockButton);}
            finally{GUI.color=tint;GUI.backgroundColor=background;}
        }
    }
}
