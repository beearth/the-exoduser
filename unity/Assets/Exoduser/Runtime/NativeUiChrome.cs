using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.UnityPort
{
    // Remove only default IMGUI skin textures. Artist-authored GUIStyle backgrounds must survive.
    internal static class NativeUiChrome
    {
        static bool remembered;
        static readonly HashSet<Texture2D> skinTextures=new HashSet<Texture2D>();
        internal static int StrippedStates {get;private set;}
        internal static string StockStates {get;private set;}="";
        internal static void RememberStock()
        {
            if(remembered)return;remembered=true;
            var stock=GUI.skin.button;
            StockStates=Describe(stock.normal)+","+Describe(stock.hover)+","+Describe(stock.active)+","+Describe(stock.focused)+","+
                Describe(stock.onNormal)+","+Describe(stock.onHover)+","+Describe(stock.onActive)+","+Describe(stock.onFocused);
            RememberStyle(GUI.skin.button);RememberStyle(GUI.skin.box);RememberStyle(GUI.skin.label);
            RememberStyle(GUI.skin.window);RememberStyle(GUI.skin.toggle);RememberStyle(GUI.skin.textField);RememberStyle(GUI.skin.textArea);
        }
        static string Describe(GUIStyleState state){return state.background==null?"null":state.background.name;}
        static void RememberStyle(GUIStyle style)
        {
            RememberState(style.normal);RememberState(style.hover);RememberState(style.active);RememberState(style.focused);
            RememberState(style.onNormal);RememberState(style.onHover);RememberState(style.onActive);RememberState(style.onFocused);
        }
        static void RememberState(GUIStyleState state)
        {
            if(state.background!=null)skinTextures.Add(state.background);
#if UNITY_EDITOR
            foreach(var texture in state.scaledBackgrounds??Array.Empty<Texture2D>())if(texture!=null)skinTextures.Add(texture);
#endif
        }
        static void ClearState(GUIStyleState state)
        {
            if(state.background!=null&&skinTextures.Contains(state.background)){StrippedStates++;state.background=null;}
#if UNITY_EDITOR
            var scaled=state.scaledBackgrounds;
            if(scaled!=null&&scaled.Length>0){
                Texture2D[] kept=null;
                for(int i=0;i<scaled.Length;i++)if(scaled[i]!=null&&skinTextures.Contains(scaled[i])){
                    if(kept==null)kept=(Texture2D[])scaled.Clone();kept[i]=null;
                }
                if(kept!=null)state.scaledBackgrounds=kept;
            }
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
    }
}
