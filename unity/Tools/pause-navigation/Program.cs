using System;
using Exoduser.UnityPort.Core;
class Program {
 static int count;
 static PauseNavigation n=new PauseNavigation();
 static void Check(bool ok,string name){count++;if(!ok)throw new Exception(name);Console.WriteLine("PASS "+name);}
 static PauseAction Key(PauseKey key,bool dead=false){n.ObserveReleased(false);return n.Handle(key,dead);}
 static void Main(){
 n.Reset();Check(n.Page==PausePage.Main&&n.Cursor==0,"main defaults");
 Check(n.Handle(PauseKey.Accept,false)==PauseAction.None,"opening key fenced");
 n.ObserveReleased(true);Check(n.WaitingForRelease,"held opening key stays fenced");
 Check(Key(PauseKey.Back)==PauseAction.Resume,"main Escape resumes");
 n.Reset();Key(PauseKey.Up);Check(n.Cursor==3,"reverse wrap");Key(PauseKey.Down);Check(n.Cursor==0,"forward wrap");
 Key(PauseKey.Next);Key(PauseKey.Accept);Check(n.Page==PausePage.Settings&&n.Cursor==0,"keyboard opens settings");
 Check(n.Handle(PauseKey.Accept,false)==PauseAction.None&&n.Page==PausePage.Settings,"held Enter does not act again");
 Key(PauseKey.Down);Check(n.Tab==0&&n.Cursor==1,"focus does not activate tab");Key(PauseKey.Accept);Check(n.Tab==1&&n.Count==7,"audio tab activates");
 Key(PauseKey.Down);Key(PauseKey.Down);Check(Key(PauseKey.Left)==PauseAction.SfxDown,"SFX left");Check(Key(PauseKey.Right)==PauseAction.SfxUp,"SFX right");
 Key(PauseKey.Down);Check(Key(PauseKey.Left)==PauseAction.BgmDown,"BGM left");Check(Key(PauseKey.Right)==PauseAction.BgmUp,"BGM right");
 Key(PauseKey.End);Key(PauseKey.Previous);Check(Key(PauseKey.Accept)==PauseAction.Defaults,"keyboard defaults");
 Key(PauseKey.End);Key(PauseKey.Accept);Check(n.Page==PausePage.Main&&n.Cursor==1,"settings Back restores parent focus");
 Key(PauseKey.Accept);Key(PauseKey.Home);Key(PauseKey.Accept);Key(PauseKey.Down);Key(PauseKey.Down);Key(PauseKey.Down);
 Check(Key(PauseKey.Left)==PauseAction.FramePrevious,"frame previous");Check(Key(PauseKey.Right)==PauseAction.FrameNext,"frame next");Key(PauseKey.Down);Check(Key(PauseKey.Accept)==PauseAction.ToggleFullscreen,"fullscreen action");
 Key(PauseKey.Home);Key(PauseKey.Left);Check(n.Tab==2&&n.Cursor==2&&n.Count==5,"tab wraps to controls");Key(PauseKey.End);Key(PauseKey.Accept);Check(n.Page==PausePage.Main,"controls back");
 Key(PauseKey.End);Key(PauseKey.Accept);Check(n.Page==PausePage.Quit&&n.Cursor==0,"quit defaults to cancel");
 Check(n.Handle(PauseKey.Accept,false)==PauseAction.None&&n.Page==PausePage.Quit,"long Enter cannot cancel or quit");
 Key(PauseKey.Right);Check(n.Cursor==1,"explicit quit selection");n.SetFocus(false);Check(n.Cursor==0&&!n.Focused,"focus loss resets dangerous selection");
 n.ObserveReleased(false);Check(n.Handle(PauseKey.Accept,false)==PauseAction.None&&n.Page==PausePage.Quit,"unfocused input ignored");
 n.SetFocus(true);n.ObserveReleased(true);Check(n.Handle(PauseKey.Accept,false)==PauseAction.None,"focus return with held key fenced");
 Key(PauseKey.Accept);Check(n.Page==PausePage.Main&&n.Cursor==3,"cancel restores quit parent");
 Key(PauseKey.Accept);Key(PauseKey.Next);Check(Key(PauseKey.Accept)==PauseAction.Quit,"fresh deliberate confirm quits");
 n.Reset();Check(Key(PauseKey.Back,true)==PauseAction.None,"dead Escape cannot resume");Check(Key(PauseKey.Accept,true)==PauseAction.Restart,"dead primary restarts");
 n.Reset();Key(PauseKey.Down);Key(PauseKey.Down);Check(Key(PauseKey.Accept)==PauseAction.ReturnLobby,"lobby action");
 n.Open(PausePage.Settings);n.SetFocus(false);var tab=n.Tab;var cursor=n.Cursor;n.SetFocus(true);Check(n.Page==PausePage.Settings&&n.Tab==tab&&n.Cursor==cursor,"settings focus preserved");
 Console.WriteLine("PASS "+count+"/"+count);
 }
}
