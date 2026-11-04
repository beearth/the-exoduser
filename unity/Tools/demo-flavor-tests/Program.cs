using System;using System.IO;using System.Collections.Generic;using Exoduser.UnityPort;using Exoduser.UnityPort.Core;
static class Program {
 static int count;static void Check(bool b,string message){if(!b)throw new Exception(message);count++;Console.WriteLine("PASS "+message);}
 static int Main(string[] args){try{
  string work=Path.GetFullPath(args[0]),resources=Path.GetFullPath(args[1]);
  // Caller supplies one dedicated fixture path. Never enumerate or touch persistent user data.
  if(!work.Replace('\\','/').EndsWith("/Library/demo-flavor-tests-fixture",StringComparison.Ordinal))throw new Exception("Dedicated fixture path required");
  if(Directory.Exists(work))Directory.Delete(work,true);Directory.CreateDirectory(work);
  Environment.SetEnvironmentVariable("EXO_TEST_RESOURCE_ROOT",resources);
  string support=Path.Combine(work,"Application Support"),lowRoot=Path.Combine(work,"LocalLow","ForDearGamers"),oldName=NativeFlavorSavePaths.LegacyProductName;
  const string macBundle="com.ForDearGamers.EXODUSER----Unity-----------------";
  // Pure root calculation, chosen by platform (never by probing which folder exists).
  string winNew=Path.Combine(lowRoot,"EXODUSER_ HELL LORD"),winOld=Path.Combine(lowRoot,oldName);
  Check(NativeFlavorSavePaths.FullRoot(winNew,"ForDearGamers",NativeFlavorSavePaths.RootKind.Windows)==winOld,"Windows full root = LocalLow/company/old product folder");
  Check(NativeFlavorSavePaths.FullRoot(winOld,"ForDearGamers",NativeFlavorSavePaths.RootKind.Windows)==winOld,"Windows full root is the same from the old product path (old and new builds share one folder)");
  Check(NativeFlavorSavePaths.BundleIdentifier("ForDearGamers",oldName)==macBundle,"bundle id rule reproduces the real old Mac Player folder name");
  string macPlayer=Path.Combine(support,"com.ForDearGamers.EXODUSER---HELL-LORD"),macEditor=Path.Combine(support,"ForDearGamers","EXODUSER-HELL-LORD");
  Check(NativeFlavorSavePaths.FullRoot(macPlayer,"ForDearGamers",NativeFlavorSavePaths.RootKind.MacPlayer)==Path.Combine(support,macBundle),"Mac Player full root = Application Support/bundle id folder");
  Check(NativeFlavorSavePaths.FullRoot(macEditor,"ForDearGamers",NativeFlavorSavePaths.RootKind.MacPlayer)==Path.Combine(support,macBundle),"Mac Player full root is the same when persistentDataPath is company/product shaped");
  Check(NativeFlavorSavePaths.FullRoot(macEditor,"ForDearGamers",NativeFlavorSavePaths.RootKind.Other)==macEditor&&NativeFlavorSavePaths.FullRoot(winNew,"ForDearGamers",NativeFlavorSavePaths.RootKind.Other)==winNew,"other platforms (Editor) keep persistentDataPath");
  string root=Path.Combine(work,"root");bool rejected;
  Check(NativeFlavorSavePaths.NamespacedRoot(root,"EXODUSER-HELL-DEMO")==Path.Combine(Path.GetFullPath(root),"EXODUSER-HELL-DEMO"),"namespaced root is root/namespace");
  foreach(var bad in new[]{"../escape","a/b","a\\b","",null}){rejected=false;try{NativeFlavorSavePaths.NamespacedRoot(root,bad);}catch(ArgumentException){rejected=true;}Check(rejected,"namespace rejected: "+(bad??"null"));}
  rejected=false;try{NativeFlavorSavePaths.NamespacedRoot("relative","EXODUSER-HELL-DEMO");}catch(ArgumentException){rejected=true;}Check(rejected,"relative save root rejected");
  // Flavor isolation through the real storage entry point. Resolving never creates or touches a folder.
  string dir,full,demo,fullFromOld;
  UnityEngine.Application.platform=UnityEngine.RuntimePlatform.WindowsPlayer;UnityEngine.Application.persistentDataPath=winNew;
  BuildFlavor.Override(BuildFlavor.Kind.Full);Check(NativeFlavorStorage.TryResolve(out full)&&full==Path.GetFullPath(winOld),"full on Windows resolves to the old product folder");
  UnityEngine.Application.persistentDataPath=winOld;Check(NativeFlavorStorage.TryResolve(out fullFromOld)&&fullFromOld==full,"full resolves to the same folder whichever product name the build carries");
  UnityEngine.Application.persistentDataPath=winNew;
  var seen=new List<string>{full};
  foreach(var kind in new[]{BuildFlavor.Kind.Demo,BuildFlavor.Kind.Bic,BuildFlavor.Kind.Ea}){
   BuildFlavor.Override(kind);Check(NativeFlavorStorage.TryResolve(out demo)&&demo==Path.Combine(Path.GetFullPath(winNew),NativeFlavorStorage.Namespace),kind+" lives under the new product root in its own namespace");
   Check(!seen.Contains(demo)&&!demo.StartsWith(full,StringComparison.OrdinalIgnoreCase),kind+" never shares or nests inside the full folder");seen.Add(demo);
  }
  Check(!Directory.Exists(winOld)&&!Directory.Exists(winNew),"resolving creates no folder");
  UnityEngine.Application.platform=UnityEngine.RuntimePlatform.OSXPlayer;UnityEngine.Application.persistentDataPath=macPlayer;
  BuildFlavor.Override(BuildFlavor.Kind.Full);Check(NativeFlavorStorage.TryResolve(out dir)&&dir==Path.GetFullPath(Path.Combine(support,macBundle)),"full on Mac Player resolves to the bundle id folder");
  BuildFlavor.Override(BuildFlavor.Kind.Demo);Check(NativeFlavorStorage.TryResolve(out dir)&&dir==Path.Combine(Path.GetFullPath(macPlayer),NativeFlavorStorage.Namespace),"demo on Mac Player lives under the new product root");
  UnityEngine.Application.platform=UnityEngine.RuntimePlatform.OSXEditor;UnityEngine.Application.persistentDataPath=macEditor;
  BuildFlavor.Override(BuildFlavor.Kind.Full);Check(NativeFlavorStorage.TryResolve(out dir)&&dir==Path.GetFullPath(macEditor),"full on other platforms (Editor) uses persistentDataPath");
  // QA sandbox never sees the real root, for every flavor.
  string qaSandbox=Path.Combine(work,"qa-sandbox");UnityEngine.Application.platform=UnityEngine.RuntimePlatform.WindowsPlayer;UnityEngine.Application.persistentDataPath=Path.Combine(work,"never-used");NativeQaSandbox.Active=true;NativeQaSandbox.Root=qaSandbox;
  foreach(var kind in new[]{BuildFlavor.Kind.Full,BuildFlavor.Kind.Demo,BuildFlavor.Kind.Bic,BuildFlavor.Kind.Ea}){BuildFlavor.Override(kind);Check(NativeFlavorStorage.TryResolve(out dir)&&dir==Path.Combine(Path.GetFullPath(qaSandbox),NativeFlavorStorage.Namespace),"QA sandbox "+kind+" lives under the sandbox namespace folder");}
  NativeQaSandbox.Active=false;
  Check(!Directory.Exists(Path.Combine(work,"never-used")),"persistent root untouched during QA");
  BuildFlavor.Override(BuildFlavor.Kind.Demo);
  Check(BuildFlavor.Current.DemoEndAtStage(0)&&!BuildFlavor.Current.DemoEndAtStage(1),"demo stage-0 end threshold unchanged");
  for(int i=0;i<LobbyLanguage.Count;i++){string code=LobbyLanguage.GetCode(i);Check(!string.IsNullOrWhiteSpace(BuildFlavor.Current.DemoEndSub(code))&&!string.IsNullOrWhiteSpace(BuildFlavor.Current.DemoEndButton(code))&&!string.IsNullOrWhiteSpace(NativeDemoEndText.ForLocale(code).demoWishlist),"actual flavor API locale "+code);}
  Check(BuildFlavor.Current.DemoEndButton(true)==NativeDemoEndText.ForLocale("en").demoNext&&BuildFlavor.Current.DemoEndButton(true)!=NativeDemoEndText.ForLocale("ko").demoNext,"bool English compatibility follows current English locale, no Korean fallback");
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
