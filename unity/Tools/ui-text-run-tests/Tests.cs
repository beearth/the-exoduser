using System;using System.Globalization;using System.IO;using System.Text.Json;using System.Collections.Generic;using Exoduser.UnityPort;
class Program {
 static int checks,failures;static void Check(bool ok,string message){checks++;if(!ok){failures++;Console.WriteLine("FAIL "+message);}}
 static bool Near(float a,float b)=>Math.Abs(a-b)<.0001f;
 static float Width(string s)=>s=="AV"?14:s=="경험치"?39:s=="e\u0301"?7:s=="🚀"?12:10;
 static List<(float x,string text)> Paint(string text,float spacing,out float width){var list=new List<(float,string)>();width=NativeUiTextRun.Layout(text,spacing,Width,(x,s)=>list.Add((x,s)));return list;}
 static int Main(string[] args){
 // Pixel-snapped labels must keep their native advance even when CSS rounded
 // font sizes ask for a smaller one. Already-separated runs remain identical.
 var method=typeof(NativeUiTextRun).GetMethod("PixelAdvance",System.Reflection.BindingFlags.Static|System.Reflection.BindingFlags.NonPublic);
 Check(method!=null,"pixel-safe advance is available");
 if(method!=null){
  float Advance(float native,float desired,float scale)=>(float)method.Invoke(null,new object[]{native,desired,scale});
  foreach(float scale in new[]{1f,2560f/1920f,2f,900f/1080f,1600f/1080f}){
   foreach(float native in new[]{11.16046f,8.125f,7.8479f,34.54f}){
    float desired=native*.96f+.3f,actual=Advance(native,desired,scale);
    Check(actual>=desired,"tracking never squeezes a glyph "+scale+"/"+native);
    for(int phase=0;phase<20;phase++)Check(Math.Round(phase*.05f+actual*scale)-Math.Round(phase*.05f)+.001f>=native*scale,"independently rounded labels do not overlap "+scale+"/"+native+"/"+phase);
   }
   Check(Near(Advance(8,12,scale),12),"already separated ko/en run keeps its original advance "+scale);
   Check(Advance(34.54f,34.54f,scale)>=34.54f,"mixed font boundary preserves full run "+scale);
  }
 }
 float w;var p=Paint("AV",0,out w);Check(Near(w,14),"zero spacing uses shaped width, not glyph sum");Check(p.Count==1&&p[0].text=="AV"&&Near(p[0].x,0),"one shaped draw for zero spacing");
 p=Paint("경험치",0,out w);Check(p.Count==1&&p[0].text=="경험치"&&Near(w,39),"HUD label retains the complete Korean string");
 p=Paint("AV",2,out w);Check(p.Count==2&&Near(p[1].x,12)&&Near(w,24),"existing positive CSS spacing and trailing advance retained");
 p=Paint("e\u0301X",.5f,out w);Check(p.Count==2&&p[0].text=="e\u0301"&&Near(p[1].x,7.5f)&&Near(w,18),"combining accent stays with its base");
 p=Paint("🚀X",1,out w);Check(p.Count==2&&p[0].text=="🚀"&&Near(p[1].x,13)&&Near(w,24),"surrogate pair is one text element");
 int reads=0,draws=0;w=NativeUiTextRun.Layout("",2,s=>{reads++;return 10;},(x,s)=>draws++);Check(w==0&&reads==0&&draws==0,"empty run has no phantom glyph or spacing");
 foreach(string text in new[]{"AV","경험치","e\u0301X","🚀X"})foreach(float spacing in new[]{0f,.4f,2f}){var trace=Paint(text,spacing,out w);string all="";foreach(var entry in trace)all+=entry.text;Check(all==text,"no design text element lost "+text+"/"+spacing);Check(Near(w,NativeUiTextRun.Layout(text,spacing,Width)),"measure and paint use identical layout "+text+"/"+spacing);}

 // Recorded IMGUI advances can round opposite ways at fractional GUI origins.
 float Separate(string text,float spacing,float scale,Func<string,float> measure,Action<float,string> paint=null)=>NativeUiTextRun.Separated(text,spacing,scale,measure,paint);
 foreach(float scale in new[]{.8333333f,1f,1.3333333f,1.4814815f}){
  var glyphs=new List<(float x,string text)>();float advance=Separate("G]",.24f,scale,g=>g=="G"?10.9087f:6.3962f,(x,g)=>glyphs.Add((x,g)));
  Check(glyphs.Count==2&&glyphs[1].x*scale-10.9087f*scale>=.99f,"one physical pixel between independent glyph draws "+scale);
  Check(advance>=glyphs[1].x+6.3962f,"returned advance includes the final glyph "+scale);
  var accents=new List<string>();Separate("e\u0301🚀",.24f,scale,g=>10,(x,g)=>accents.Add(g));Check(accents.Count==2&&accents[0]=="e\u0301"&&accents[1]=="🚀","separated layout preserves text elements "+scale);
  int paints=0;float joined=Separate("빙결→화염 2배 | ",0,scale,g=>86.54f,(x,g)=>{paints++;Check(g=="빙결→화염 2배 | ","zero spacing preserves the shaped run");});
  Check(paints==1&&joined-86.54f>=.99f/scale,"independent shaped runs reserve a physical pixel "+scale);
 }
 Check(Separate("",.24f,1,g=>99)==0,"empty separated run has no phantom gap");
 float hpTop=968.3f,hpHeight=27;Check(Near(NativeUiTextFlow.NextLine(hpTop,hpHeight)-(hpTop+hpHeight),4),"HUD maximum starts after current line and its shadow");
 Check(993.5f<hpTop+hpHeight&&NativeUiTextFlow.NextLine(hpTop,hpHeight)>hpTop+hpHeight,"recorded 1.8px HUD collision gains a positive gap");

 float LabelWidth(string text){float total=0;var it=StringInfo.GetTextElementEnumerator(text);while(it.MoveNext()){var g=it.GetTextElement();total+=g==" "?8:g.Length>1||g[0]>=0xAC00?28:14;}return total;}
 string title="폭발 허수아비";var titleLines=NativeUiTextRun.Wrap(title,154,LabelWidth);Check(titleLines.Count>1&&string.Concat(titleLines)==title,"long skill title wraps without losing text");foreach(var line in titleLines)Check(LabelWidth(line)<=154,"title stays inside154");
 Check(NativeUiTextFlow.TitleExtra(1,43)==0,"one-line title preserves all existing anchors");Check(Near(NativeUiTextFlow.TitleExtra(2,43),43),"wrapped title moves level and description together");
 Check(NativeUiTextFlow.FooterExtra(1)==0&&NativeUiTextFlow.FooterExtra(3)==48,"resource footer grows only for extra lines");
 float available=NativeUiTextFlow.KeyNameWidth(818,8,70,61.7f);Check(Near(available,650.3f),"caption ends ten px before the main key");Check(NativeUiTextFlow.KeyRowHeight(1,32)==56&&NativeUiTextFlow.KeyRowHeight(2,32)==80,"keyboard row grows for wrapped caption");
 foreach(var text in new[]{"AAA BBB CCC","e\u0301e\u0301e\u0301X","🚀🚀X"}){var lines=NativeUiTextRun.Wrap(text,42,LabelWidth);Check(string.Concat(lines)==text,"wrapping preserves text elements "+text);foreach(var line in lines)Check(LabelWidth(line)<=42,"bounded measured line "+text);}
 var table=new List<object>();foreach(var screen in new[]{(1920,1080),(2560,1080),(3840,1080),(1600,900),(2560,1600)}){float scale=screen.Item2/1080f;float titleBefore=Math.Max(0,LabelWidth(title)-154),titleAfter=0;foreach(var line in titleLines)titleAfter=Math.Max(titleAfter,Math.Max(0,LabelWidth(line)-154));
 string caption="Very long action caption with additional keyboard description";var captionLines=NativeUiTextRun.Wrap(caption,available,LabelWidth);float keyBefore=Math.Max(0,LabelWidth(caption)-available),keyAfter=0;foreach(var line in captionLines)keyAfter=Math.Max(keyAfter,Math.Max(0,LabelWidth(line)-available));
 string footer="SP 1000000 · 악의오브 1000000 · LV 999";var footerLines=NativeUiTextRun.Wrap(footer,200,LabelWidth);float footerBefore=Math.Max(0,LabelWidth(footer)-200),footerAfter=0;foreach(var line in footerLines)footerAfter=Math.Max(footerAfter,Math.Max(0,LabelWidth(line)-200));
 Check(titleBefore*scale>.5f&&titleAfter==0,"skill title model before/after "+screen);Check(keyBefore*scale>.5f&&keyAfter==0,"keyboard model before/after "+screen);Check(footerBefore*scale>.5f&&footerAfter==0,"resource model before/after "+screen);
 table.Add(new{width=screen.Item1,height=screen.Item2,scope="CPU stress-width geometry model; not Player/font/pixel proof",skillInfo=new{before=2,after=(titleAfter>0?1:0)+(footerAfter>0?1:0),titleOverflowBefore=titleBefore*scale,titleOverflowAfter=titleAfter*scale,resourceOverflowBefore=footerBefore*scale,resourceOverflowAfter=footerAfter*scale,titleLines=titleLines.Count,footerLines=footerLines.Count},keyboard=new{before=1,after=keyAfter>0?1:0,overflowBefore=keyBefore*scale,overflowAfter=keyAfter*scale,lines=captionLines.Count}});
 }
 if(args.Length>0)File.WriteAllText(args[0],JsonSerializer.Serialize(new{scope="CPU model with supplied stress glyph widths; no new Player captures",rows=table}));
 Console.WriteLine("checks="+checks+" failures="+failures);return failures==0?0:1;
 }
}
