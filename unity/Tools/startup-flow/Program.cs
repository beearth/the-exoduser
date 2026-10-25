using System;
using System.IO;
using System.Text.Json;
using Exoduser.UnityPort.Core;
static class Program
{
 static int passed;static void Check(bool value,string label){if(!value)throw new Exception(label);passed++;}
 static void Main(string[] args){var data=JsonSerializer.Deserialize<StartupIntroData>(File.ReadAllText(args[0]),new JsonSerializerOptions{IncludeFields=true});var ko=data.languages[0].lines;
  Check(data.sourceSha256=="d73d691989c1cb847cb500ce02ae81430c575fb90d732a5af131742c96d2c8c5","current served game source");
  Check(ko.Length==27&&data.languages[1].lines.Length==26,"source language record counts retained");
  var f=new FrontendEntryFlow();f.Begin(ko,false);Check(f.Page==FrontendEntryPage.Loading,"ordinary entry displays loading");f.Advance();Check(f.Page==FrontendEntryPage.Loading,"input cannot skip loading");f.Tick(1.19,false,true);Check(f.Page==FrontendEntryPage.Loading,"loading minimum1200ms");f.Tick(.01,false,true);Check(f.Page==FrontendEntryPage.Nemesis,"loading enters Nemesis");
  f.Tick(2.49,false,true);Check(f.LineIndex==0,"silent cut waits full duration");f.Tick(.02,false,true);Check(f.LineIndex==1,"silent cut advances at source duration");f.Advance();Check(f.LineIndex==2,"pointer advance moves silent cut");f.Tick(.1,false,true);Check(f.VisibleCharacters<ko[2].text.Length,"dialogue types with source clock");f.Advance();Check(f.FullText&&f.LineIndex==2,"first advance reveals whole dialogue");f.Advance();Check(f.LineIndex==3&&!f.FullText,"second advance moves and resets reveal");
  f.Tick(.1,true,true);f.Tick(5,true,false);Check(f.HoldProgress==0,"focus loss clears hold without advancing");f.Skip();Check(f.Page==FrontendEntryPage.Guide&&f.GuideStep==0,"Nemesis skip starts guide rather than gameplay");f.Advance();Check(f.GuideStep==0,"initial250ms guide fence");f.Tick(.25,false,true);f.Advance();Check(f.GuideStep==1,"guide advances after250ms");f.Advance();Check(f.GuideStep==1,"repeat advance debounced");f.Tick(.25,false,true);f.Advance();f.Tick(.25,false,true);f.Advance();Check(f.GuideStep==3,"fourth guide is Start page");f.Tick(.25,false,true);f.Advance();Check(f.Page==FrontendEntryPage.Curtain,"Start opens curtain");f.Tick(.899,false,true);Check(f.Active,"curtain absorbs input for900ms");f.Tick(.002,false,true);Check(!f.Active&&f.Page==FrontendEntryPage.Complete,"curtain ends once");f.Tick(9,false,true);Check(f.Page==FrontendEntryPage.Complete,"completion is stable");
  f.Begin(ko,true);Check(f.Page==FrontendEntryPage.Nemesis,"story gate reuses already shown loading");f.Skip();f.Tick(1.99,true,true);Check(f.Page==FrontendEntryPage.Guide,"guide hold not premature");f.Tick(.011,true,true);Check(f.Page==FrontendEntryPage.Curtain,"guide2s hold skips to curtain");
  f.Begin(ko,true);while(f.LineIndex<ko.Length-1)f.Advance();Check(f.Line.exit,"last source line is exit");f.Tick(1.499,false,true);Check(f.Page==FrontendEntryPage.Nemesis,"exit fade waits1500ms");f.Tick(.002,false,true);Check(f.Page==FrontendEntryPage.Guide,"exit fade ends into guide");f.Cancel();Check(!f.Active&&f.Page==FrontendEntryPage.Idle,"cancel drops only presentation state");Console.WriteLine("STARTUP FLOW PASS "+passed);if(args.Length>1)File.WriteAllText(args[1],JsonSerializer.Serialize(new{passed,failed=0,scope="pure presentation state; no Unity or OS input"}));
 }
}
