using System;
using System.Globalization;
namespace Exoduser.UnityPort {
 // Measure and paint the same shaped run. CSS spacing applies between text
 // elements, never between the UTF-16 halves or a base and its combining mark.
 internal static class NativeUiTextRun {
  internal static float Layout(string text,float spacing,Func<string,float> measure,Action<float,string> paint=null){
   if(string.IsNullOrEmpty(text))return 0;
   if(spacing==0){float width=measure(text);paint?.Invoke(0,text);return width;}
   float x=0;var elements=StringInfo.GetTextElementEnumerator(text);
   while(elements.MoveNext()){string glyph=elements.GetTextElement();float width=measure(glyph);paint?.Invoke(x,glyph);x+=width+spacing;}
   return x;
  }
 }
}
