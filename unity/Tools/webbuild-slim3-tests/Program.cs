using System;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Collections.Generic;
using System.Runtime.ExceptionServices;
using System.Diagnostics;

static class Program
{
    static string Root;
    static int passed, failed;
    static readonly Assembly Assembly = typeof(Program).Assembly;
    static void Check(bool value, string why) { if (!value) throw new Exception(why); }
    static Type Type(string name) { var t=Assembly.GetType("Exoduser.DevTools."+name); Check(t!=null,"missing production helper "+name); return t; }
    static object Invoke(object obj, string name, params object[] args)
    {
        try { return obj.GetType().GetMethods().Single(m=>m.Name==name&&m.GetParameters().Length==args.Length).Invoke(obj,args); }
        catch(TargetInvocationException e) { ExceptionDispatchInfo.Capture(e.InnerException).Throw(); throw; }
    }
    static object Static(string type,string method,params object[] args)
    {
        try { return Type(type).GetMethods().Single(m=>m.Name==method&&m.GetParameters().Length==args.Length).Invoke(null,args); }
        catch(TargetInvocationException e) { ExceptionDispatchInfo.Capture(e.InnerException).Throw(); throw; }
    }
    static object New(string project)
    {
        try { return Activator.CreateInstance(Type("WebBuildFileStage"),new object[]{project,"Library/WebBuildS2Hold"}); }
        catch(TargetInvocationException e) { ExceptionDispatchInfo.Capture(e.InnerException).Throw(); throw; }
    }
    static List<string> Restore(object stage) { return (List<string>)Invoke(stage,"Restore"); }
    static List<string> Recover(string project) { return (List<string>)Static("WebBuildFileStage","Recover",project,"Library/WebBuildS2Hold"); }
    static bool Throws(Action action) { try { action(); return false; } catch { return true; } }
    static string Asset(string root,string name,byte value=12)
    {
        string path="Assets/"+name; Directory.CreateDirectory(Path.GetDirectoryName(Path.Combine(root,path)));
        File.WriteAllBytes(Path.Combine(root,path),new[]{value,(byte)0,(byte)255,(byte)10});
        File.WriteAllText(Path.Combine(root,path+".meta"),"fileFormatVersion: 2\r\nguid: "+name+"\r\n  userData: \r\n");
        return path;
    }
    static void Run(string name, Action<string> action)
    {
        string dir=Path.Combine(Root,Guid.NewGuid().ToString("N")); Directory.CreateDirectory(dir);
        try { action(dir); passed++; Console.WriteLine("PASS "+name); }
        catch(Exception e) { failed++; Console.WriteLine("FAIL "+name+": "+e.GetType().Name+": "+e.Message); }
        finally { if(Directory.Exists(dir)) Directory.Delete(dir,true); }
    }
    static string Audio(IEnumerable<string> candidates,Func<string,bool> apply,Action<string> rollback,List<string> attempts)
    { return (string)Static("WebBuildAudioSelection","Try",candidates,apply,rollback,attempts); }
    static int[] Size(int w,int h,int max) { return (int[])Static("WebBuildResizePixels","AlignedSize",w,h,max); }
    static byte[] Pixels(byte[] b,int w,int h,int ow,int oh) { return (byte[])Static("WebBuildResizePixels","ResizeRgba",b,w,h,ow,oh); }
    static int Main(string[] args)
    {
        Root=Path.GetFullPath(args.Length>0?args[0]:Path.Combine(Path.GetTempPath(),"webbuild-slim3-tests"));
        Directory.CreateDirectory(Root);
        Run("hold asset and meta exact round trip",root=>{
            var p=Asset(root,"image.png"); var bytes=File.ReadAllBytes(Path.Combine(root,p)); var meta=File.ReadAllBytes(Path.Combine(root,p+".meta"));
            var stage=New(root); Invoke(stage,"HoldAsset",p);
            Check(!File.Exists(Path.Combine(root,p))&&!File.Exists(Path.Combine(root,p+".meta")),"held pair must be outside Assets");
            Check(Restore(stage).Count==0,"restore errors"); Check(File.ReadAllBytes(Path.Combine(root,p)).SequenceEqual(bytes),"source bytes");
            Check(File.ReadAllBytes(Path.Combine(root,p+".meta")).SequenceEqual(meta),"raw meta bytes"); Check(!Directory.Exists(Path.Combine(root,"Library/WebBuildS2Hold")),"hold cleaned");
        });
        Run("resize and importer changes restore exact originals",root=>{
            var p=Asset(root,"resize.png"); var old=File.ReadAllBytes(Path.Combine(root,p)); var meta=File.ReadAllBytes(Path.Combine(root,p+".meta")); var stage=New(root);
            Invoke(stage,"PreserveAsset",p); Invoke(stage,"PreserveMeta",p); File.WriteAllBytes(Path.Combine(root,p),new byte[]{1,2,3}); File.WriteAllText(Path.Combine(root,p+".meta"),"temporary import");
            Check(Restore(stage).Count==0,"restore errors"); Check(File.ReadAllBytes(Path.Combine(root,p)).SequenceEqual(old),"resize restored"); Check(File.ReadAllBytes(Path.Combine(root,p+".meta")).SequenceEqual(meta),"meta restored");
        });
        Run("preserve meta then preserve asset deduplicates safely",root=>{
            var p=Asset(root,"audio.wav"); var meta=File.ReadAllText(Path.Combine(root,p+".meta")); var stage=New(root); Invoke(stage,"PreserveMeta",p);
            File.WriteAllText(Path.Combine(root,p+".meta"),"changed"); Invoke(stage,"PreserveAsset",p); File.WriteAllBytes(Path.Combine(root,p),new byte[]{5});
            Check(Restore(stage).Count==0,"restore errors"); Check(File.ReadAllText(Path.Combine(root,p+".meta"))==meta,"original meta not recaptured"); Check(File.ReadAllBytes(Path.Combine(root,p)).Length==4,"original source");
        });
        Run("finally restores after simulated build exception",root=>{
            var p=Asset(root,"map.asset"); var stage=New(root);
            try { Invoke(stage,"HoldAsset",p); throw new InvalidOperationException("simulated build failure"); }
            catch(InvalidOperationException) {} finally { Check(Restore(stage).Count==0,"finally restore"); }
            Check(File.Exists(Path.Combine(root,p)),"asset recovered");
        });
        Run("partial hold failure still restores prior moves",root=>{
            var a=Asset(root,"a.asset"); var b=Asset(root,"b.asset"); var stage=New(root); Invoke(stage,"HoldAsset",a);
            using(var locked=new FileStream(Path.Combine(root,b+".meta"),FileMode.Open,FileAccess.Read,FileShare.None)){
                Check(Throws(()=>Invoke(stage,"HoldAsset",b)),"locked meta must fail");
                Check(Restore(stage).Count==0,"partial restore errors");
            }
            Check(File.Exists(Path.Combine(root,a))&&File.Exists(Path.Combine(root,b)),"partial transaction source recovery");
        });
        Run("unfinished journal refused and recoverable",root=>{
            var p=Asset(root,"unfinished.png"); var stage=New(root); Invoke(stage,"HoldAsset",p);
            Check(Throws(()=>New(root)),"stale journal overwrite"); Check(Recover(root).Count==0,"recovery errors"); Check(File.Exists(Path.Combine(root,p)),"recovered");
        });
        Run("collision retained while other files restore then retry",root=>{
            var a=Asset(root,"a.png"); var b=Asset(root,"b.png"); var stage=New(root); Invoke(stage,"HoldAsset",a); Invoke(stage,"HoldAsset",b);
            File.WriteAllText(Path.Combine(root,a),"external collision");
            var errors=Restore(stage); Check(errors.Count>0,"collision error"); Check(File.ReadAllText(Path.Combine(root,a))=="external collision","collision overwritten");
            Check(File.Exists(Path.Combine(root,b)),"other entry skipped"); Check(Directory.Exists(Path.Combine(root,"Library/WebBuildS2Hold")),"failed evidence lost");
            File.Delete(Path.Combine(root,a)); Check(Recover(root).Count==0,"retry restore"); Check(File.ReadAllBytes(Path.Combine(root,a)).Length==4,"original recovered");
        });
        Run("invalid paths and missing meta rejected",root=>{
            var stage=New(root); var p=Asset(root,"valid.png"); File.Delete(Path.Combine(root,p+".meta"));
            Check(Throws(()=>Invoke(stage,"HoldAsset",p)),"missing meta"); Check(File.Exists(Path.Combine(root,p)),"missing meta moved source");
            foreach(var bad in new[]{"../outside","Assets/../outside","Assets2/no.png",Path.Combine(root,p),"Assets//bad.png"}) Check(Throws(()=>Invoke(stage,"PreserveAsset",bad)),"path accepted "+bad);
            Check(Restore(stage).Count==0,"empty restore");
        });
        Run("reparse source ancestor rejected",root=>{
            string outside=Path.Combine(root,"outside"),link=Path.Combine(root,"Assets","link"); Directory.CreateDirectory(outside); Directory.CreateDirectory(Path.GetDirectoryName(link));
            File.WriteAllText(Path.Combine(outside,"x.png"),"x"); File.WriteAllText(Path.Combine(outside,"x.png.meta"),"meta");
            var start=new ProcessStartInfo("cmd.exe","/d /c mklink /J \""+link+"\" \""+outside+"\""){UseShellExecute=false,CreateNoWindow=true,RedirectStandardOutput=true,RedirectStandardError=true};
            using(var process=Process.Start(start)){process.WaitForExit(); Check(process.ExitCode==0,"junction setup");}
            try { var stage=New(root); Check(Throws(()=>Invoke(stage,"HoldAsset","Assets/link/x.png")),"junction accepted"); Check(Restore(stage).Count==0,"empty stage"); }
            finally { Directory.Delete(link); }
        });
        Run("synchronous import byte mutation retains recovery evidence",root=>{
            var p=Asset(root,"import.png"); var stage=New(root); Invoke(stage,"PreserveAsset",p);
            File.WriteAllBytes(Path.Combine(root,p),new byte[]{3});
            var errors=(List<string>)Invoke(stage,"Restore",new Action(()=>File.WriteAllText(Path.Combine(root,p+".meta"),"postprocessor changed")));
            Check(errors.Count>0,"post-import mutation hidden"); Check(Directory.Exists(Path.Combine(root,"Library/WebBuildS2Hold")),"backup removed before post-import verification");
            Check(Recover(root).Count==0,"meta copy recovery"); Check(File.ReadAllText(Path.Combine(root,p+".meta")).Contains("guid: import.png"),"original meta recovery");
        });
        Run("synchronous import exception preserves backups",root=>{
            var p=Asset(root,"refresh.png"); var stage=New(root); Invoke(stage,"HoldAsset",p);
            var errors=(List<string>)Invoke(stage,"Restore",new Action(()=>throw new IOException("refresh failed")));
            Check(errors.Count>0&&Directory.Exists(Path.Combine(root,"Library/WebBuildS2Hold")),"refresh failure lost");
            Check(Recover(root).Count==0,"retry after callback exception");
        });
        Run("corrupt backup cannot overwrite source",root=>{
            var p=Asset(root,"corrupt.png"); var stage=New(root); Invoke(stage,"HoldAsset",p);
            File.WriteAllText(Path.Combine(root,"Library/WebBuildS2Hold/000000.bin"),"bad backup");
            Check(Restore(stage).Count>0,"corrupt original accepted"); Check(!File.Exists(Path.Combine(root,p)),"corrupt source emitted");
        });
        Run("audio rejects then accepts with distinct order",root=>{
            var visits=new List<string>(); var rolls=new List<string>(); var log=new List<string>();
            string selected=Audio(new[]{"group","Web","Web","WebGL"},s=>{visits.Add(s);return s=="Web";},s=>rolls.Add(s),log);
            Check(selected=="Web"&&visits.SequenceEqual(new[]{"group","Web"})&&rolls.SequenceEqual(new[]{"group"}),"candidate order or rollback"); Check(log.Count>=2,"attempt log");
        });
        Run("audio readback rejection and exception rollback",root=>{
            var rolls=new List<string>(); var log=new List<string>();
            var accepted=Audio(new[]{"bad-readback","throws","ok"},s=>{if(s=="throws")throw new IOException("native failed");return s=="ok";},s=>rolls.Add(s),log);
            Check(accepted=="ok"&&rolls.SequenceEqual(new[]{"bad-readback","throws"}),"rollback coverage");
        });
        Run("audio rollback failure aborts candidates",root=>{
            int calls=0; Check(Throws(()=>Audio(new[]{"one","two"},s=>{calls++;return false;},s=>throw new IOException("restore failed"),new List<string>())),"restore failure swallowed"); Check(calls==1,"next candidate after failed rollback");
        });
        Run("audio all rejected and duplicate selectors tried once",root=>{
            int calls=0; var selected=Audio(new[]{"a","a","b"},s=>{calls++;return false;},s=>{},new List<string>()); Check(selected==""&&calls==2,"dedup/exhaustion");
        });
        Run("aligned size bounded and aspect approximation",root=>{
            Check(Size(1024,512,2048).SequenceEqual(new[]{1024,512}),"aligned identity");
            foreach(var dims in new[]{new[]{1931,814},new[]{1254,1254},new[]{4260,3031},new[]{1,1}}){
                var s=Size(dims[0],dims[1],2048); Check(s.All(x=>x>=4&&x<=2048&&x%4==0),"bounds and alignment");
            }
            Check(Throws(()=>Size(0,4,2048))&&Throws(()=>Size(4,4,3)),"invalid size accepted");
        });
        Run("rgba identity and solid color",root=>{
            var rgba=new byte[]{20,40,60,128}; Check(Pixels(rgba,1,1,1,1).SequenceEqual(rgba),"identity");
            var scaled=Pixels(rgba,1,1,4,4); Check(scaled.Length==64,"length");
            for(int i=0;i<scaled.Length;i++)Check(scaled[i]==rgba[i%4],"solid");
        });
        Run("rgba bilinear midpoint and premultiplied alpha",root=>{
            var opaque=Pixels(new byte[]{255,0,0,255,0,0,255,255},2,1,3,1); Check(opaque[4]==128&&opaque[6]==128&&opaque[7]==255,"midpoint color");
            var alpha=Pixels(new byte[]{255,0,0,0,0,0,255,255},2,1,3,1); Check(alpha[4]==0&&alpha[6]==255&&alpha[7]==128,"transparent color halo");
            Check(Throws(()=>Pixels(new byte[3],1,1,2,2))&&Throws(()=>Pixels(new byte[4],0,1,2,2)),"invalid input");
        });
        Console.WriteLine("RESULT "+passed+" passed, "+failed+" failed");
        return failed==0?0:1;
    }
}
