using System;
using System.Globalization;
using System.Collections.Generic;
namespace Exoduser.UnityPort {
 // Measure and paint the same shaped run. CSS spacing applies between text
 // elements, never between the UTF-16 halves or a base and its combining mark.
 internal static class NativeUiTextRun {
  internal static List<string> Wrap(string text,float width,Func<string,float> measure){
   var lines=new List<string>();if(string.IsNullOrEmpty(text))return lines;
   if(!(width>0))throw new ArgumentOutOfRangeException(nameof(width));
   foreach(string paragraph in text.Replace("\r\n","\n").Split('\n')){
    if(paragraph.Length==0){lines.Add("");continue;}
    var starts=StringInfo.ParseCombiningCharacters(paragraph);int first=0;
    while(first<starts.Length){
     int fitted=first,lastSpace=-1,next=first;
     for(;next<starts.Length;next++){
      int end=next+1<starts.Length?starts[next+1]:paragraph.Length;
      string candidate=paragraph.Substring(starts[first],end-starts[first]);float measured=measure(candidate);
      if(measured>width&&next>first)break;
      fitted=next+1;if(char.IsWhiteSpace(paragraph[end-1]))lastSpace=fitted;
      if(measured>width)break; // Preserve an oversized text element intact; never hide it.
     }
     int take=fitted;if(next<starts.Length&&lastSpace>first)take=lastSpace;if(take<=first)take=first+1;
     int endChar=take<starts.Length?starts[take]:paragraph.Length;
     lines.Add(paragraph.Substring(starts[first],endChar-starts[first]));first=take;
    }
   }
   return lines;
  }
  // Independent IMGUI draws round their origins separately. Reserve at least
  // one physical pixel, and use the same advances for measurement and paint.
  // Zero spacing still paints a complete shaped run (kerning/combining intact).
  internal static float Separated(string text,float spacing,float pixelsPerUnit,Func<string,float> measure,Action<float,string> paint=null){
   if(string.IsNullOrEmpty(text))return 0;
   if(!(pixelsPerUnit>0))throw new ArgumentOutOfRangeException(nameof(pixelsPerUnit));
   if(spacing==0)return Layout(text,0,measure,paint)+1/pixelsPerUnit;
   float x=0;var elements=StringInfo.GetTextElementEnumerator(text);
   while(elements.MoveNext()){
    string glyph=elements.GetTextElement();float width=measure(glyph);paint?.Invoke(x,glyph);
    x+=(float)Math.Ceiling(width*pixelsPerUnit+Math.Max(1,spacing*pixelsPerUnit))/pixelsPerUnit;
   }
   return x;
  }
  internal static float Layout(string text,float spacing,Func<string,float> measure,Action<float,string> paint=null){
   if(string.IsNullOrEmpty(text))return 0;
   if(spacing==0){float width=measure(text);paint?.Invoke(0,text);return width;}
   float x=0;var elements=StringInfo.GetTextElementEnumerator(text);
   while(elements.MoveNext()){string glyph=elements.GetTextElement();float width=measure(glyph);paint?.Invoke(x,glyph);x+=width+spacing;}
   return x;
  }
 }
}
