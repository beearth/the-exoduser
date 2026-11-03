using System;using System.Collections.Generic;using Exoduser.UnityPort;
class Program {
 static int checks,failures;static void Check(bool ok,string message){checks++;if(!ok){failures++;Console.WriteLine("FAIL "+message);}}
 static bool Near(float a,float b)=>Math.Abs(a-b)<.0001f;
 static float Width(string s)=>s=="AV"?14:s=="경험치"?39:s=="e\u0301"?7:s=="🚀"?12:10;
 static List<(float x,string text)> Paint(string text,float spacing,out float width){var list=new List<(float,string)>();width=NativeUiTextRun.Layout(text,spacing,Width,(x,s)=>list.Add((x,s)));return list;}
 static int Main(){float w;var p=Paint("AV",0,out w);Check(Near(w,14),"zero spacing uses shaped width, not glyph sum");Check(p.Count==1&&p[0].text=="AV"&&Near(p[0].x,0),"one shaped draw for zero spacing");
 p=Paint("경험치",0,out w);Check(p.Count==1&&p[0].text=="경험치"&&Near(w,39),"HUD label retains the complete Korean string");
 p=Paint("AV",2,out w);Check(p.Count==2&&Near(p[1].x,12)&&Near(w,24),"existing positive CSS spacing and trailing advance retained");
 p=Paint("e\u0301X",.5f,out w);Check(p.Count==2&&p[0].text=="e\u0301"&&Near(p[1].x,7.5f)&&Near(w,18),"combining accent stays with its base");
 p=Paint("🚀X",1,out w);Check(p.Count==2&&p[0].text=="🚀"&&Near(p[1].x,13)&&Near(w,24),"surrogate pair is one text element");
 int reads=0,draws=0;w=NativeUiTextRun.Layout("",2,s=>{reads++;return 10;},(x,s)=>draws++);Check(w==0&&reads==0&&draws==0,"empty run has no phantom glyph or spacing");
 foreach(string text in new[]{"AV","경험치","e\u0301X","🚀X"})foreach(float spacing in new[]{0f,.4f,2f}){var trace=Paint(text,spacing,out w);string all="";foreach(var entry in trace)all+=entry.text;Check(all==text,"no design text element lost "+text+"/"+spacing);Check(Near(w,NativeUiTextRun.Layout(text,spacing,Width)),"measure and paint use identical layout "+text+"/"+spacing);}
 Console.WriteLine("checks="+checks+" failures="+failures);return failures==0?0:1;
 }
}
