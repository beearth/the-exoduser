// Editor build staging only. Pure .NET recovery can be tested without launching Unity.
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Globalization;
using System.Security.Cryptography;
using System.Collections.Generic;

namespace Exoduser.DevTools
{
    internal sealed class WebBuildFileStage
    {
        sealed class Entry { public string path, mode, backup, digest; public long length; }
        const string Header = "EXO_WEB_HOLD_V1";
        readonly string projectRoot, holdRoot, journal;
        readonly List<Entry> entries = new List<Entry>();
        readonly Dictionary<string,Entry> byPath = new Dictionary<string,Entry>(StringComparer.OrdinalIgnoreCase);
        public string HoldDirectory { get { return holdRoot; } }

        public WebBuildFileStage(string projectRoot, string holdRootRelative="Library/WebBuildS2Hold")
            : this(projectRoot,holdRootRelative,false) { }
        WebBuildFileStage(string project,string relative,bool recovery)
        {
            projectRoot=Path.GetFullPath(project).TrimEnd(Path.DirectorySeparatorChar,Path.AltDirectorySeparatorChar);
            if(!Directory.Exists(projectRoot))throw new DirectoryNotFoundException(projectRoot);
            NoReparse(projectRoot); relative=Relative(relative,"Library/"); holdRoot=UnderRoot(relative);
            NoReparse(holdRoot); journal=Path.Combine(holdRoot,"journal.tsv");
            if(recovery)
            {
                if(!File.Exists(journal))throw new InvalidOperationException("Missing recovery journal: "+journal);
                LoadJournal();
            }
            else
            {
                if(Directory.Exists(holdRoot)&&Directory.EnumerateFileSystemEntries(holdRoot).Any())
                    throw new InvalidOperationException("Unrestored WebBuild hold exists; recover first: "+holdRoot);
                Directory.CreateDirectory(holdRoot);
                File.WriteAllText(journal,Header+"\n",new UTF8Encoding(false));
            }
        }
        static string Relative(string path,string prefix)
        {
            if(string.IsNullOrWhiteSpace(path)||Path.IsPathRooted(path))throw new ArgumentException("Expected relative asset/hold path.");
            path=path.Replace('\\','/');
            if(!path.StartsWith(prefix,StringComparison.Ordinal)||
                path.Split('/').Any(p=>p.Length==0||p=="."||p==".."||p.IndexOf(':')>=0))
                throw new ArgumentException("Invalid path: "+path);
            return path;
        }
        string UnderRoot(string relative)
        {
            string result=Path.GetFullPath(Path.Combine(projectRoot,relative.Replace('/',Path.DirectorySeparatorChar)));
            if(!result.StartsWith(projectRoot+Path.DirectorySeparatorChar,StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Path escaped project root.");
            return result;
        }
        static void NoReparse(string path)
        {
            for(string current=Path.GetFullPath(path);!string.IsNullOrEmpty(current);current=Path.GetDirectoryName(current))
            {
                if(!File.Exists(current)&&!Directory.Exists(current))continue;
                if((File.GetAttributes(current)&FileAttributes.ReparsePoint)!=0)
                    throw new IOException("Reparse point is not a staging target: "+current);
            }
        }
        string AssetPath(string relative)
        {
            string absolute=UnderRoot(Relative(relative,"Assets/")); NoReparse(absolute); return absolute;
        }
        static string Digest(string path)
        {
            using(var stream=File.Open(path,FileMode.Open,FileAccess.Read,FileShare.Read))
            using(var hash=SHA256.Create())
                return BitConverter.ToString(hash.ComputeHash(stream)).Replace("-","").ToLowerInvariant();
        }
        static string Encode(string value){return Convert.ToBase64String(Encoding.UTF8.GetBytes(value));}
        static string Decode(string value){return Encoding.UTF8.GetString(Convert.FromBase64String(value));}
        void LoadJournal()
        {
            string[] rows=File.ReadAllLines(journal,Encoding.UTF8);
            if(rows.Length==0||rows[0]!=Header)throw new InvalidDataException("Invalid WebBuild journal header.");
            foreach(string row in rows.Skip(1))
            {
                if(row.Length==0)continue;
                string[] p=row.Split('\t');
                if(p.Length!=5||(p[0]!="move"&&p[0]!="copy"))
                    throw new InvalidDataException("Incomplete WebBuild journal; retain hold for manual inspection.");
                string relative=Relative(Decode(p[1]),"Assets/");
                var e=new Entry{mode=p[0],path=relative,backup=entries.Count.ToString("D6",CultureInfo.InvariantCulture)+".bin",
                    length=long.Parse(p[3],CultureInfo.InvariantCulture),digest=p[4]};
                if(p[2]!=e.backup||e.length<0||e.digest.Length!=64||e.digest.Any(c=>!"0123456789abcdef".Contains(c)))
                    throw new InvalidDataException("Invalid WebBuild journal record.");
                AssetPath(relative);
                if(byPath.ContainsKey(relative))throw new InvalidDataException("Duplicate WebBuild journal path.");
                entries.Add(e);byPath.Add(relative,e);
            }
        }
        void Ready(string relative,string mode)
        {
            string source=AssetPath(relative); Entry old;
            if(byPath.TryGetValue(relative,out old))
            {
                if(old.mode!=mode)throw new InvalidOperationException("Conflicting staging actions for "+relative);
                return;
            }
            if(!File.Exists(source))throw new FileNotFoundException("Staging source must exist.",source);
        }
        void Capture(string relative,string mode)
        {
            relative=Relative(relative,"Assets/"); Ready(relative,mode);
            if(byPath.ContainsKey(relative))return;
            NoReparse(holdRoot); string source=AssetPath(relative);
            var e=new Entry{path=relative,mode=mode,backup=entries.Count.ToString("D6",CultureInfo.InvariantCulture)+".bin",
                length=new FileInfo(source).Length,digest=Digest(source)};
            string backup=Path.Combine(holdRoot,e.backup);
            if(File.Exists(backup))throw new IOException("Backup already exists: "+backup);
            // Persist intent before IO, including partial source/meta moves.
            File.AppendAllText(journal,e.mode+"\t"+Encode(e.path)+"\t"+e.backup+"\t"+
                e.length.ToString(CultureInfo.InvariantCulture)+"\t"+e.digest+"\n",new UTF8Encoding(false));
            entries.Add(e);byPath.Add(relative,e);
            if(mode=="move")File.Move(source,backup);else File.Copy(source,backup,false);
        }
        void Pair(string asset,string mode)
        {
            asset=Relative(asset,"Assets/");
            if(asset.EndsWith(".meta",StringComparison.OrdinalIgnoreCase))throw new ArgumentException("Pass asset, not .meta.");
            Ready(asset,mode);Ready(asset+".meta",mode);
            Capture(asset,mode);Capture(asset+".meta",mode);
        }
        public void HoldAsset(string assetRelativePath){Pair(assetRelativePath,"move");}
        public void PreserveAsset(string assetRelativePath){Pair(assetRelativePath,"copy");}
        public void PreserveMeta(string assetRelativePath)
        {
            string asset=Relative(assetRelativePath,"Assets/");
            if(asset.EndsWith(".meta",StringComparison.OrdinalIgnoreCase))throw new ArgumentException("Pass asset, not .meta.");
            string source=AssetPath(asset);
            if(!File.Exists(source))throw new FileNotFoundException("Asset must exist before preserving importer.",source);
            Capture(asset+".meta","copy");
        }
        static bool Matches(string file,Entry e)
        {return File.Exists(file)&&new FileInfo(file).Length==e.length&&Digest(file)==e.digest;}

        public List<string> Restore(){return Restore(null);}
        public List<string> Restore(Action afterFilesRestored)
        {
            var errors=new List<string>();
            try{NoReparse(projectRoot);NoReparse(holdRoot);}
            catch(Exception e){errors.Add("hold: "+e.Message);return errors;}
            foreach(var e in entries.AsEnumerable().Reverse())
            {
                try
                {
                    string source=AssetPath(e.path),backup=Path.Combine(holdRoot,e.backup);NoReparse(backup);
                    if(!Matches(source,e))
                    {
                        if(!Matches(backup,e))throw new IOException("Original backup missing or changed.");
                        if(e.mode=="move"&&(File.Exists(source)||Directory.Exists(source)))
                            throw new IOException("Restore destination collision; preserved both copies.");
                        Directory.CreateDirectory(Path.GetDirectoryName(source));
                        // Keep originals in hold until synchronous import and byte verification finish.
                        File.Copy(backup,source,e.mode=="copy");
                        if(!Matches(source,e))throw new IOException("Restored bytes did not match original.");
                    }
                }
                catch(Exception ex){errors.Add(e.path+": "+ex.Message);}
            }
            try{if(afterFilesRestored!=null)afterFilesRestored();}
            catch(Exception ex){errors.Add("post-restore import: "+ex.Message);}
            foreach(var e in entries)
            {
                try{if(!Matches(AssetPath(e.path),e))errors.Add(e.path+": bytes changed after restore/import.");}
                catch(Exception ex){errors.Add(e.path+": verification failed: "+ex.Message);}
            }
            if(errors.Count==0&&Directory.Exists(holdRoot))
            {
                try
                {
                    NoReparse(holdRoot);
                    var known=new HashSet<string>(entries.Select(e=>Path.Combine(holdRoot,e.backup)),StringComparer.OrdinalIgnoreCase){journal};
                    if(Directory.EnumerateFileSystemEntries(holdRoot).Any(p=>!known.Contains(p)||Directory.Exists(p)))
                        throw new IOException("Unknown files retained in hold; no recursive cleanup.");
                    foreach(var e in entries){string backup=Path.Combine(holdRoot,e.backup);NoReparse(backup);if(File.Exists(backup))File.Delete(backup);}
                    File.Delete(journal);Directory.Delete(holdRoot,false);
                }
                catch(Exception ex){errors.Add("hold cleanup: "+ex.Message);}
            }
            return errors;
        }
        public static List<string> Recover(string projectRoot,string holdRootRelative="Library/WebBuildS2Hold")
        {return Recover(projectRoot,holdRootRelative,null);}
        public static List<string> Recover(string projectRoot,string holdRootRelative,Action afterFilesRestored)
        {
            string relative=Relative(holdRootRelative,"Library/"),root=Path.GetFullPath(projectRoot);
            string hold=Path.GetFullPath(Path.Combine(root,relative));NoReparse(root);NoReparse(hold);
            if(!Directory.Exists(hold))return new List<string>();
            return new WebBuildFileStage(projectRoot,holdRootRelative,true).Restore(afterFilesRestored);
        }
    }

    internal static class WebBuildAudioSelection
    {
        public static string Try(IEnumerable<string> selectors,Func<string,bool> applyAndVerify,
            Action<string> rollback,List<string> attempts)
        {
            if(selectors==null||applyAndVerify==null||rollback==null||attempts==null)throw new ArgumentNullException();
            var seen=new HashSet<string>(StringComparer.Ordinal);
            foreach(string selector in selectors)
            {
                if(string.IsNullOrEmpty(selector)||!seen.Add(selector))continue;
                bool accepted=false;
                try{accepted=applyAndVerify(selector);attempts.Add(selector+(accepted?": accepted":": rejected/readback mismatch"));}
                catch(Exception e){attempts.Add(selector+": "+e.GetType().Name+": "+e.Message);}
                if(accepted)return selector;
                try{rollback(selector);}
                catch(Exception e){attempts.Add(selector+": rollback failed: "+e.Message);throw;}
            }
            return "";
        }
    }

    internal static class WebBuildResizePixels
    {
        public static int[] AlignedSize(int width,int height,int maxSize)
        {
            if(width<=0||height<=0||maxSize<4)throw new ArgumentOutOfRangeException();
            int cap=maxSize-maxSize%4;
            double scale=Math.Min(1.0,(double)cap/Math.Max(width,height));
            Func<int,int> align=v=>Math.Max(4,Math.Min(cap,(int)Math.Round(v*scale/4.0,MidpointRounding.AwayFromZero)*4));
            return new[]{align(width),align(height)};
        }
        public static byte[] ResizeRgba(byte[] rgba,int width,int height,int outWidth,int outHeight)
        {
            if(rgba==null||width<=0||height<=0||outWidth<=0||outHeight<=0)throw new ArgumentException("Positive dimensions and RGBA required.");
            if((long)width*height>int.MaxValue/4||(long)outWidth*outHeight>int.MaxValue/4||(long)width*height*4!=rgba.LongLength)throw new ArgumentException("RGBA byte length/size mismatch.");
            if(width==outWidth&&height==outHeight)return(byte[])rgba.Clone();
            var result=new byte[outWidth*outHeight*4];
            Func<double,byte> channel=v=>(byte)Math.Max(0,Math.Min(255,(int)Math.Round(v,MidpointRounding.AwayFromZero)));
            for(int y=0;y<outHeight;y++)
            {
                double sy=Math.Max(0,Math.Min(height-1,(y+.5)*height/outHeight-.5));
                int y0=(int)sy,y1=Math.Min(y0+1,height-1);double fy=sy-y0;
                for(int x=0;x<outWidth;x++)
                {
                    double sx=Math.Max(0,Math.Min(width-1,(x+.5)*width/outWidth-.5));
                    int x0=(int)sx,x1=Math.Min(x0+1,width-1);double fx=sx-x0;
                    int s00=(y0*width+x0)*4,s10=(y0*width+x1)*4,s01=(y1*width+x0)*4,s11=(y1*width+x1)*4;
                    double a00=rgba[s00+3]*(1-fx)*(1-fy),a10=rgba[s10+3]*fx*(1-fy),
                        a01=rgba[s01+3]*(1-fx)*fy,a11=rgba[s11+3]*fx*fy;
                    double alpha=a00+a10+a01+a11;
                    double red=rgba[s00]*a00+rgba[s10]*a10+rgba[s01]*a01+rgba[s11]*a11;
                    double green=rgba[s00+1]*a00+rgba[s10+1]*a10+rgba[s01+1]*a01+rgba[s11+1]*a11;
                    double blue=rgba[s00+2]*a00+rgba[s10+2]*a10+rgba[s01+2]*a01+rgba[s11+2]*a11;
                    int dest=(y*outWidth+x)*4;
                    if(alpha>0){result[dest]=channel(red/alpha);result[dest+1]=channel(green/alpha);result[dest+2]=channel(blue/alpha);}
                    result[dest+3]=channel(alpha);
                }
            }
            return result;
        }
    }
}
