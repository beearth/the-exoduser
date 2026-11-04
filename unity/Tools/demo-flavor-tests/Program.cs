using System;using System.IO;using System.Collections.Generic;using Exoduser.UnityPort;using Exoduser.UnityPort.Core;
static class Program {
 static int count;static void Check(bool b,string message){if(!b)throw new Exception(message);count++;Console.WriteLine("PASS "+message);}
 static string Fixture(string root,string folder,string value){string p=Path.Combine(root,folder);Directory.CreateDirectory(p);p=Path.Combine(p,"marker.v1.json");File.WriteAllText(p,value);return p;}
 static string Prepare(string root,string ns,bool full,string old,bool qa=false){string target,error;if(!NativeFlavorSavePaths.TryPrepare(root,ns,full,old,qa,out target,out error))throw new Exception(error);return target;}
 static void RejectsPromotion(string source,string stage,object snapshot,string message){bool rejected=false;try{typeof(NativeFlavorSavePaths).GetMethod("ValidateImport",System.Reflection.BindingFlags.NonPublic|System.Reflection.BindingFlags.Static).Invoke(null,new[]{source,stage,snapshot});}catch(System.Reflection.TargetInvocationException e){rejected=e.InnerException is IOException;}Check(rejected,message);}
 static void AcceptsPromotion(string source,string stage,object snapshot,string message){bool accepted=true;try{typeof(NativeFlavorSavePaths).GetMethod("ValidateImport",System.Reflection.BindingFlags.NonPublic|System.Reflection.BindingFlags.Static).Invoke(null,new[]{source,stage,snapshot});}catch(System.Reflection.TargetInvocationException){accepted=false;}Check(accepted,message);}
 static int Main(string[] args){try{
  string work=Path.GetFullPath(args[0]),resources=Path.GetFullPath(args[1]);
  // Caller supplies one dedicated fixture path. Never enumerate or touch persistent user data.
  if(!work.Replace('\\','/').EndsWith("/Library/demo-flavor-tests-fixture",StringComparison.Ordinal))throw new Exception("Dedicated fixture path required");
  if(Directory.Exists(work))Directory.Delete(work,true);Directory.CreateDirectory(work);
  Environment.SetEnvironmentVariable("EXO_TEST_RESOURCE_ROOT",resources);
  string support=Path.Combine(work,"Application Support");
  string editor=Path.Combine(support,"ForDearGamers","EXODUSER: HELL LORD"),player=Path.Combine(support,NativeFlavorSavePaths.BundleIdentifier("ForDearGamers","EXODUSER: HELL LORD"));
  var editorRoots=NativeFlavorSavePaths.LegacyRoots(editor,"ForDearGamers",true);var playerRoots=NativeFlavorSavePaths.LegacyRoots(player,"ForDearGamers",true);
  Check(editorRoots.Length==3&&editorRoots[0]==playerRoots[0]&&editorRoots[1]==playerRoots[1]&&editorRoots[2]==playerRoots[2]&&editorRoots[1].Contains("unity.ForDearGamers."),"macOS Editor and Player legacy layouts both resolved");
  // #7: the real old Player folder is the bundle id; it is computed by Unity's rule, not typed into the product.
  const string macBundle="com.ForDearGamers.EXODUSER----Unity-----------------";
  Check(NativeFlavorSavePaths.BundleIdentifier("ForDearGamers",NativeFlavorSavePaths.LegacyProductName)==macBundle,"bundle id rule reproduces the real old Mac Player folder name");
  Check(editorRoots[2]==Path.Combine(support,macBundle),"macOS legacy roots include the bundle-id folder for Editor and Player layouts");
  Fixture(Path.Combine(support,macBundle),"character-roster-v1","mac-bundle-save");string macDestination,macError;
  Check(NativeFlavorSavePaths.TryPrepare(player,"EXODUSER-HELL-FULL",true,playerRoots,false,out macDestination,out macError)&&File.ReadAllText(Path.Combine(macDestination,"character-roster-v1","marker.v1.json"))=="mac-bundle-save","macOS Player imports the old save from the bundle-id folder");
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
  var snapshot=typeof(NativeFlavorSavePaths).GetMethod("CaptureStores",System.Reflection.BindingFlags.NonPublic|System.Reflection.BindingFlags.Static).Invoke(null,new object[]{old});
  string copied=Path.Combine(full,"character-roster-v1","marker.v1.json");byte[] copiedBytes=File.ReadAllBytes(copied);
  File.Delete(copied);RejectsPromotion(old,full,snapshot,"promotion rejects a missing copied file");File.WriteAllBytes(copied,copiedBytes);
  File.AppendAllText(copied,"changed-size");RejectsPromotion(old,full,snapshot,"promotion rejects staging size mismatch");File.WriteAllBytes(copied,copiedBytes);
  string added=Path.Combine(old,"combat-save-v1","added.json");File.WriteAllText(added,"new");RejectsPromotion(old,full,snapshot,"promotion rejects source file-set change");File.Delete(added);
  string temp=Path.Combine(full,"combat-save-v1","inflight.tmp");File.WriteAllText(temp,"inflight");AcceptsPromotion(old,full,snapshot,"#5 promotion ignores a stray .tmp in staging (a temporary is never a save)");File.Delete(temp);
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
  Check(NativeFlavorSavePaths.TryPrepare(blocked,"EXODUSER-HELL-FULL",true,old,false,out dir,out err)&&!Directory.Exists(Path.Combine(blocked,"EXODUSER-HELL-FULL.legacy-import")),"interrupted migration reclaims staging and retries once");
  Check(!NativeFlavorSavePaths.TryPrepare(root,"../escape",true,old,false,out dir,out err),"namespace traversal rejected");
  using(var locked=new FileStream(roster,FileMode.Open,FileAccess.ReadWrite,FileShare.None))Check(!NativeFlavorSavePaths.TryPrepare(Path.Combine(work,"busy"),"EXODUSER-HELL-FULL",true,old,false,out dir,out err),"active legacy writer blocks import");
  Check(File.ReadAllText(roster)=="roster-7","failed import leaves source unchanged");
  string cacheRoot=Path.Combine(work,"cache","official"),cacheLegacy=Path.Combine(work,"cache",NativeFlavorSavePaths.LegacyProductName);Directory.CreateDirectory(cacheRoot);Fixture(cacheLegacy,"character-roster-v1","cached-source");
  UnityEngine.Application.persistentDataPath=cacheRoot;BuildFlavor.Override(BuildFlavor.Kind.Full);
  using(var lease=new FileStream(Path.Combine(cacheRoot,".EXODUSER-HELL-FULL.legacy-import.lock"),FileMode.CreateNew,FileAccess.ReadWrite,FileShare.None))Check(!NativeFlavorStorage.TryResolve(out dir),"TryResolve rejects lease contention");
  Check(NativeFlavorStorage.TryResolve(out dir)&&File.ReadAllText(Path.Combine(dir,"character-roster-v1","marker.v1.json"))=="cached-source","TryResolve retries same root after contention ends, without cached failure");
  Check(!NativeFlavorStorage.ImportFailed,"clean import does not flag a failed import");
  // #5: an old folder the importer cannot read must not block saving: start fresh, flag it, keep every old byte.
  string badRoot=Path.Combine(work,"bad","official"),badLegacy=Path.Combine(work,"bad",NativeFlavorSavePaths.LegacyProductName);Fixture(badLegacy,"character-roster-v1","bad-source");Directory.CreateDirectory(Path.Combine(badLegacy,"character-roster-v1","unexpected-subfolder"));
  UnityEngine.Application.persistentDataPath=badRoot;
  Check(NativeFlavorStorage.TryResolve(out dir)&&NativeFlavorStorage.ImportFailed&&!Directory.Exists(dir)&&File.ReadAllText(Path.Combine(badLegacy,"character-roster-v1","marker.v1.json"))=="bad-source","unreadable old save: storage resolves, player starts fresh, import failure flagged, old bytes kept");
  // #8: QA sandbox path uses the flavor namespace; callers take it from code, not from a typed folder name.
  Check(NativeFlavorStorage.Namespace==BuildFlavor.Current.SaveNamespace||BuildFlavor.Current.SaveNamespace==""||BuildFlavor.Current.SaveNamespace==null,"flavor namespace comes from the flavor definition");
  string qaSandbox=Path.Combine(work,"qa-sandbox");UnityEngine.Application.persistentDataPath=Path.Combine(work,"never-used");NativeQaSandbox.Active=true;NativeQaSandbox.Root=qaSandbox;
  Check(NativeFlavorStorage.TryResolve(out dir)&&dir==Path.Combine(qaSandbox,NativeFlavorStorage.Namespace),"QA sandbox storage lives under the flavor namespace folder");NativeQaSandbox.Active=false;
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
