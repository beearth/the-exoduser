using System;using System.IO;using System.Collections.Generic;using Exoduser.UnityPort;using Exoduser.UnityPort.Core;
static class Program {
 static int count;static void Check(bool b,string message){if(!b)throw new Exception(message);count++;Console.WriteLine("PASS "+message);}
 static string Fixture(string root,string folder,string value){string p=Path.Combine(root,folder);Directory.CreateDirectory(p);p=Path.Combine(p,"marker.v1.json");File.WriteAllText(p,value);return p;}
 static string Prepare(string root,string ns,bool full,string old,bool qa=false){string target,error;if(!NativeFlavorSavePaths.TryPrepare(root,ns,full,old,qa,out target,out error))throw new Exception(error);return target;}
 static int Main(string[] args){try{
  string work=Path.GetFullPath(args[0]),resources=Path.GetFullPath(args[1]);
  // Caller supplies one dedicated fixture path. Never enumerate or touch persistent user data.
  if(!work.Replace('\\','/').EndsWith("/Library/demo-flavor-tests-fixture",StringComparison.Ordinal))throw new Exception("Dedicated fixture path required");
  if(Directory.Exists(work))Directory.Delete(work,true);Directory.CreateDirectory(work);
  Environment.SetEnvironmentVariable("EXO_TEST_RESOURCE_ROOT",resources);
  string support=Path.Combine(work,"Application Support");
  string editor=Path.Combine(support,"ForDearGamers","EXODUSER: HELL LORD"),player=Path.Combine(support,"unity.ForDearGamers.EXODUSER: HELL LORD");
  var editorRoots=NativeFlavorSavePaths.LegacyRoots(editor,"ForDearGamers",true);var playerRoots=NativeFlavorSavePaths.LegacyRoots(player,"ForDearGamers",true);
  Check(editorRoots[0]==playerRoots[0]&&editorRoots[1]==playerRoots[1]&&editorRoots[1].Contains("unity.ForDearGamers."),"macOS Editor and Player legacy layouts both resolved");
  string old=Path.Combine(work,"company",NativeFlavorSavePaths.LegacyProductName),root=Path.Combine(work,"company","official");
  string roster=Fixture(old,"character-roster-v1","roster-7"),combat=Fixture(old,"combat-save-v1","combat-99"),settings=Fixture(old,"native-settings-v1","settings-2");
  File.WriteAllText(Path.Combine(old,"Player.log"),"not a save");
  string demo=Prepare(root,"EXODUSER-HELL-DEMO",false,old);
  Check(!Directory.Exists(demo),"demo does not import unqualified legacy full data");
  string full=Prepare(root,"EXODUSER-HELL-FULL",true,old);
  Check(demo!=full,"full and demo destinations differ");
  foreach(var folder in new[]{"character-roster-v1","combat-save-v1","native-settings-v1"})Check(File.ReadAllText(Path.Combine(full,folder,"marker.v1.json"))==File.ReadAllText(Path.Combine(old,folder,"marker.v1.json")),"migration bytes preserved "+folder);
  Check(File.ReadAllText(roster)=="roster-7"&&File.ReadAllText(combat)=="combat-99"&&File.ReadAllText(settings)=="settings-2","legacy source remains unchanged");
  Check(!File.Exists(Path.Combine(full,"Player.log")),"Unity log is never imported");
  Fixture(full,"character-roster-v1","new-save");Prepare(root,"EXODUSER-HELL-FULL",true,old);
  Check(File.ReadAllText(Path.Combine(full,"character-roster-v1","marker.v1.json"))=="new-save","existing canonical save is never overwritten");
  string qaRoot=Path.Combine(work,"qa");string qa=Prepare(qaRoot,"EXODUSER-HELL-FULL",true,old,true);
  Check(!Directory.Exists(qa),"sandbox never imports real legacy saves");
  string same=Path.Combine(old,"EXODUSER-HELL-DEMO");Fixture(same,"character-roster-v1","old-demo");
  demo=Prepare(root,"EXODUSER-HELL-DEMO",false,old);
  Check(File.ReadAllText(Path.Combine(demo,"character-roster-v1","marker.v1.json"))=="old-demo","demo imports only explicitly namespaced legacy demo");
  string intermediate=Path.Combine(work,"intermediate");Fixture(intermediate,"combat-save-v1","intermediate-full");
  string inter=Prepare(intermediate,"EXODUSER-HELL-FULL",true,null);
  Check(File.ReadAllText(Path.Combine(inter,"combat-save-v1","marker.v1.json"))=="intermediate-full","unqualified current product full save is retained");
  string err,dir,blocked=Path.Combine(work,"blocked");Directory.CreateDirectory(Path.Combine(blocked,"EXODUSER-HELL-FULL.legacy-import"));
  Check(!NativeFlavorSavePaths.TryPrepare(blocked,"EXODUSER-HELL-FULL",true,old,false,out dir,out err)&&dir=="","interrupted migration fails closed");
  Check(!NativeFlavorSavePaths.TryPrepare(root,"../escape",true,old,false,out dir,out err),"namespace traversal rejected");
  using(var locked=new FileStream(roster,FileMode.Open,FileAccess.ReadWrite,FileShare.None))Check(!NativeFlavorSavePaths.TryPrepare(Path.Combine(work,"busy"),"EXODUSER-HELL-FULL",true,old,false,out dir,out err),"active legacy writer blocks import");
  Check(File.ReadAllText(roster)=="roster-7","failed import leaves source unchanged");
  BuildFlavor.Override(BuildFlavor.Kind.Demo);
  Check(BuildFlavor.Current.DemoEndAtStage(0)&&!BuildFlavor.Current.DemoEndAtStage(1),"demo stage-0 end threshold unchanged");
  for(int i=0;i<LobbyLanguage.Count;i++){string code=LobbyLanguage.GetCode(i);Check(!string.IsNullOrWhiteSpace(BuildFlavor.Current.DemoEndSub(code))&&!string.IsNullOrWhiteSpace(BuildFlavor.Current.DemoEndButton(code))&&!string.IsNullOrWhiteSpace(NativeDemoEndText.ForLocale(code).demoWishlist),"actual flavor API locale "+code);}
  Check(BuildFlavor.Current.DemoEndButton(true)=="End demo","bool English compatibility no Korean fallback");
  BuildFlavor.Override(BuildFlavor.Kind.Full);Check(!BuildFlavor.Current.DemoEndAtStage(0)&&BuildFlavor.Current.DemoEndButton("fr")==null,"full does not acquire demo end");
  var model=NativeStageClearPresentation.Build(new NativeStageClearPresentation.Summary{Kills=100,Total=100,Seconds=400,SpAwarded=10,Regions=4,Potions=5,Deaths=0,Score=200,Rank="S"});
  foreach(var size in new[]{(1920f,1080f),(3840f,1080f),(960f,540f),(640f,360f)}){
   var l=NativeStageClearPresentation.Arrange(size.Item1,size.Item2,model,true);
   Check(l.Next.Y+l.Next.Height<l.Wishlist.Y&&l.Panel.Contains(l.Wishlist.X+l.Wishlist.Width,l.Wishlist.Y+l.Wishlist.Height),"separate contained demo buttons "+size);
   Check(!l.HitNext(l.Wishlist.X+1,l.Wishlist.Y+1),"store click cannot hit next "+size);
  }
  int opens=0;string url=null;Action<string> open=x=>{opens++;url=x;};
  Check(!NativeStageClearPresentation.RequestWishlist(false,true,1,open)&&!NativeStageClearPresentation.RequestWishlist(true,false,1,open)&&!NativeStageClearPresentation.RequestWishlist(true,true,.1f,open)&&opens==0,"store action obeys visibility flavor and fade fence");
  Check(NativeStageClearPresentation.RequestWishlist(true,true,1,open)&&opens==1&&url=="steam://store/4749590","store action opens exact full app only via injected callback");
  Console.WriteLine("PASS TOTAL "+count);return 0;
 }catch(Exception e){Console.Error.WriteLine(e);return 1;}}
}
