using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using UnityEditor;
using UnityEditor.Compilation;
using UnityEngine;
using Debug = UnityEngine.Debug;

namespace Exoduser.DevTools
{
    // DT-01 Unity 작업 서버. 명령줄에 `-exoJobServer <queueDir>`가 있을 때만 켜진다(없으면 아무 일도 하지 않음).
    // queueDir 구조: inbox\ (제출) running\ (진행 상태) done\ (결과) logs\ (job별 로그), server.json (하트비트), stop (종료 요청)
    // 도메인 리로드(컴파일 뒤)가 일어나면 static이 사라지므로 진행 상태는 running\<id>.json에 저장하고 [InitializeOnLoad]에서 이어 받는다.

    [Serializable]
    public class ExoJobSpec
    {
        public string id;
        public string method;
        public string[] args = new string[0];
        public bool refresh = true;
        public int timeoutSec = 600;
    }

    [Serializable]
    public class ExoJobState
    {
        public string id;
        public string method;
        public string[] args = new string[0];
        public bool refresh = true;
        public int timeoutSec = 600;
        public string phase;            // claimed → refresh → settle → executing
        public long claimedMs;
        public long refreshStartMs;
        public long refreshMs;
        public bool sawCompile;
        public long compileMs;
        public long settleStartMs;
        public int domainReloads;
        public string logFile;
    }

    [Serializable]
    public class ExoJobException
    {
        public string type = "";
        public string message = "";
        public string stack = "";
    }

    [Serializable]
    public class ExoJobResult
    {
        public string id;
        public string method;
        public bool ok;
        public int exitCode;
        public string startedAt;
        public long durMs;
        public long refreshMs;
        public long compileMs;
        public long execMs;
        public ExoJobException exception = new ExoJobException();
        public string[] compileErrors = new string[0];
        public string logFile;
        public int errorLogs;
        public int domainReloads;
        public string note = "";
    }

    [InitializeOnLoad]
    public static class ExoJobServer
    {
        const string KStarted = "Exo.Job.StartedAt";
        const string KDone = "Exo.Job.Done";
        const string KActivity = "Exo.Job.LastActivityMs";

        static readonly string _q;
        static readonly bool _on;
        static string _proj = "", _head = "";
        static ExoJobState _cur;
        static double _nextPoll;
        static Timer _timer;
        static volatile string _state = "idle";
        static volatile string _curId = "";
        static int _jobsDone;
        static long _lastActivityMs;
        static string _startedAt = "";
        static long _lastHeadMs;
        static readonly List<string> _compileErrors = new List<string>();

        static string Inbox { get { return Path.Combine(_q, "inbox"); } }
        static string Running { get { return Path.Combine(_q, "running"); } }
        static string Done { get { return Path.Combine(_q, "done"); } }
        static string Logs { get { return Path.Combine(_q, "logs"); } }
        static string StopFile { get { return Path.Combine(_q, "stop"); } }
        static string CompileErrFile { get { return Path.Combine(_q, "compile-errors.txt"); } }

        static ExoJobServer()
        {
            var a = Environment.GetCommandLineArgs();
            int i = Array.IndexOf(a, "-exoJobServer");
            if (i < 0 || i + 1 >= a.Length) return;
            try
            {
                _q = a[i + 1];
                _on = true;
                foreach (var d in new[] { Inbox, Running, Done, Logs }) Directory.CreateDirectory(d);
                _proj = Path.GetDirectoryName(Application.dataPath) ?? "";

                bool first = string.IsNullOrEmpty(SessionState.GetString(KStarted, ""));
                if (first)
                {
                    SessionState.SetString(KStarted, IsoFromMs(NowMs()));
                    SessionState.SetInt(KDone, 0);
                    SessionState.SetString(KActivity, NowMs().ToString(CultureInfo.InvariantCulture));
                    TryDelete(StopFile);   // 이전 서버가 남긴 stop 요청이 새 서버를 끄지 않게
                }
                _startedAt = SessionState.GetString(KStarted, "");
                _jobsDone = SessionState.GetInt(KDone, 0);
                long.TryParse(SessionState.GetString(KActivity, "0"), NumberStyles.Integer, CultureInfo.InvariantCulture, out _lastActivityMs);

                CompilationPipeline.compilationStarted += OnCompileStarted;
                CompilationPipeline.assemblyCompilationFinished += OnAsmFinished;
                AssemblyReloadEvents.beforeAssemblyReload += OnBeforeReload;
                EditorApplication.update += Tick;
                if (!EditorUtility.scriptCompilationFailed) TryDelete(CompileErrFile);

                ResumeRunningJob();
                _timer = new Timer(BeatSafe, null, 0, 2000);
                Debug.Log("[ExoJobServer] " + (first ? "listening " : "resumed after reload ") + _q);
            }
            catch (Exception e) { Debug.LogError("[ExoJobServer] init failed: " + e); }
        }

        // ------------------------------------------------------------------ 이어받기
        static void ResumeRunningJob()
        {
            foreach (var f in SortedJson(Running))
            {
                ExoJobState st = null;
                try { st = JsonUtility.FromJson<ExoJobState>(File.ReadAllText(f)); } catch { }
                if (st == null || string.IsNullOrEmpty(st.id)) { TryDelete(f); continue; }
                if (st.phase == "executing")
                {
                    _cur = st;
                    Finish(st, false, 5, null, null, 0, "도메인 리로드가 job 실행 중에 일어나 중단됨(메서드가 AssetDatabase/컴파일을 건드렸을 수 있음)");
                    continue;
                }
                st.domainReloads++;
                _cur = st; _curId = st.id;
                SaveState(st);
                return;   // 한 번에 하나만
            }
        }

        static void OnBeforeReload()
        {
            _state = _cur != null ? "reloading" : "idle";
            try { BeatSafe(null); } catch { }
            try { if (_timer != null) _timer.Dispose(); } catch { }
        }

        static void OnCompileStarted(object o)
        {
            _compileErrors.Clear();
            TryDelete(CompileErrFile);
        }

        static void OnAsmFinished(string asm, CompilerMessage[] msgs)
        {
            bool any = false;
            foreach (var m in msgs)
            {
                if (m.type != CompilerMessageType.Error) continue;
                _compileErrors.Add(m.message);
                any = true;
            }
            if (any)
            {
                try
                {
                    var lines = new List<string>();
                    foreach (var e in _compileErrors) lines.Add(e.Replace("\r", "").Replace("\n", "\\n"));
                    File.WriteAllLines(CompileErrFile, lines.ToArray(), new UTF8Encoding(false));
                }
                catch { }
            }
        }

        // ------------------------------------------------------------------ 메인 루프
        static void Tick()
        {
            if (!_on) return;
            try
            {
                if (_cur == null)
                {
                    double t = EditorApplication.timeSinceStartup;
                    if (t < _nextPoll) return;
                    _nextPoll = t + 0.25;
                    if (File.Exists(StopFile))
                    {
                        TryDelete(StopFile);
                        _state = "stopping";
                        BeatSafe(null);
                        Debug.Log("[ExoJobServer] stop requested");
                        EditorApplication.Exit(0);
                        return;
                    }
                    Claim();
                    if (_cur == null) return;
                }
                Advance(_cur);
            }
            catch (Exception e)
            {
                Debug.LogError("[ExoJobServer] tick error: " + e);
                if (_cur != null)
                {
                    try { Finish(_cur, false, 1, ToEx(e), null, 0, "서버 내부 오류"); } catch { _cur = null; _curId = ""; _state = "idle"; }
                }
            }
        }

        static void Claim()
        {
            foreach (var f in SortedJson(Inbox))
            {
                ExoJobSpec spec = null;
                string raw = null;
                try { raw = File.ReadAllText(f); spec = JsonUtility.FromJson<ExoJobSpec>(raw); } catch { }
                string fallbackId = Path.GetFileNameWithoutExtension(f);
                if (spec == null || string.IsNullOrEmpty(spec.method))
                {
                    var bad = new ExoJobState { id = fallbackId, method = spec != null ? spec.method : "", claimedMs = NowMs() };
                    _cur = bad;
                    TryDelete(f);
                    Finish(bad, false, 4, null, null, 0, "job json을 읽을 수 없거나 method가 없음: " + fallbackId);
                    return;
                }
                if (string.IsNullOrEmpty(spec.id)) spec.id = fallbackId;
                spec.id = Sanitize(spec.id);
                var st = new ExoJobState
                {
                    id = spec.id, method = spec.method, args = spec.args ?? new string[0], refresh = spec.refresh,
                    timeoutSec = spec.timeoutSec > 0 ? spec.timeoutSec : 600, phase = "claimed", claimedMs = NowMs(),
                    logFile = Path.Combine(Logs, spec.id + ".log")
                };
                var runFile = Path.Combine(Running, spec.id + ".json");
                try { File.Move(f, runFile); } catch { TryDelete(f); }
                SaveState(st);
                _cur = st; _curId = st.id;
                _state = "refreshing";
                return;
            }
        }

        static void Advance(ExoJobState c)
        {
            switch (c.phase)
            {
                case "claimed":
                    c.phase = c.refresh ? "refresh" : "settle";
                    c.settleStartMs = NowMs();
                    SaveState(c);
                    break;

                case "refresh":
                {
                    // 리로드가 Refresh 도중 일어나도 같은 Refresh를 되풀이하지 않도록 먼저 settle로 저장한다.
                    c.phase = "settle";
                    c.refreshStartMs = NowMs();
                    c.settleStartMs = c.refreshStartMs;
                    SaveState(c);
                    _state = "refreshing";
                    AssetDatabase.Refresh();
                    c.refreshMs = NowMs() - c.refreshStartMs;
                    SaveState(c);
                    _settleTicks = 0;
                    break;
                }

                case "settle":
                {
                    bool compiling = EditorApplication.isCompiling;
                    if (compiling || EditorApplication.isUpdating)
                    {
                        _state = compiling ? "compiling" : "refreshing";
                        if (compiling && !c.sawCompile) { c.sawCompile = true; SaveState(c); }
                        if (NowMs() - c.settleStartMs > c.timeoutSec * 1000L)
                            Finish(c, false, 6, null, CollectCompileErrors(), 0, "컴파일/임포트 대기 시간 초과");
                        return;
                    }
                    if (c.refresh && !c.sawCompile && _settleTicks < 4) { _settleTicks++; return; }   // Refresh 직후 컴파일이 시작되는 지연을 4틱 기다린다
                    if (c.sawCompile) c.compileMs = Math.Max(0, NowMs() - (c.refreshStartMs + c.refreshMs));
                    if (EditorUtility.scriptCompilationFailed)
                    {
                        Finish(c, false, 3, null, CollectCompileErrors(), 0, "컴파일 실패 — 메서드를 실행하지 않음");
                        return;
                    }
                    c.phase = "executing";
                    SaveState(c);
                    Execute(c);
                    break;
                }

                default:
                    Finish(c, false, 1, null, null, 0, "알 수 없는 phase: " + c.phase);
                    break;
            }
        }

        static int _settleTicks;

        static string[] CollectCompileErrors()
        {
            if (_compileErrors.Count > 0) return _compileErrors.ToArray();
            try { if (File.Exists(CompileErrFile)) return File.ReadAllLines(CompileErrFile); } catch { }
            return new[] { "scriptCompilationFailed=true (오류 문구를 수집하지 못함 — 서버 로그 확인)" };
        }

        static void Execute(ExoJobState c)
        {
            _state = "running";
            string err;
            bool takesArgs;
            var mi = Resolve(c.method, out takesArgs, out err);
            if (mi == null) { Finish(c, false, 4, null, null, 0, err); return; }

            int errorLogs = 0;
            StreamWriter sw = null;
            try { sw = new StreamWriter(new FileStream(c.logFile, FileMode.Create, FileAccess.Write, FileShare.ReadWrite), new UTF8Encoding(false)) { AutoFlush = true }; } catch { }
            Application.LogCallback h = (cond, st, type) =>
            {
                if (type == LogType.Error || type == LogType.Exception || type == LogType.Assert) errorLogs++;
                if (sw == null) return;
                lock (sw)
                {
                    sw.WriteLine("[" + type + "] " + cond);
                    if (type != LogType.Log && !string.IsNullOrEmpty(st)) sw.WriteLine(st);
                }
            };
            Application.logMessageReceivedThreaded += h;
            int exit = 0;
            ExoJobException ex = null;
            var sw0 = Stopwatch.StartNew();
            ExoArgs.Begin(c.args);
            try
            {
                object r = takesArgs ? mi.Invoke(null, new object[] { c.args }) : mi.Invoke(null, null);
                if (r is int) exit = (int)r;
            }
            catch (Exception e)
            {
                var inner = e is TargetInvocationException && e.InnerException != null ? e.InnerException : e;
                ex = ToEx(inner);
                exit = 1;
                Debug.LogException(inner);
            }
            finally
            {
                ExoArgs.End();
                Application.logMessageReceivedThreaded -= h;
                sw0.Stop();
                if (sw != null) { try { sw.Dispose(); } catch { } }
            }
            FinishWithExec(c, exit == 0 && ex == null, exit, ex, errorLogs, sw0.ElapsedMilliseconds);
        }

        static MethodInfo Resolve(string full, out bool takesArgs, out string err)
        {
            takesArgs = false; err = null;
            int d = full.LastIndexOf('.');
            if (d <= 0) { err = "method 형식은 Namespace.Type.Method 이어야 함: " + full; return null; }
            string tn = full.Substring(0, d), mn = full.Substring(d + 1);
            const BindingFlags bf = BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic;
            MethodInfo noArg = null;
            foreach (var asm in AppDomain.CurrentDomain.GetAssemblies())
            {
                Type t = null;
                try { t = asm.GetType(tn, false); } catch { }
                if (t == null) continue;
                foreach (var m in t.GetMethods(bf))
                {
                    if (m.Name != mn) continue;
                    var ps = m.GetParameters();
                    if (ps.Length == 1 && ps[0].ParameterType == typeof(string[])) { takesArgs = true; return m; }
                    if (ps.Length == 0) noArg = m;
                }
                if (noArg != null) return noArg;
            }
            err = "메서드를 찾지 못함(static ()/(string[]) 시그니처): " + full;
            return null;
        }

        // ------------------------------------------------------------------ 결과
        static long _execMsForFinish;

        static void FinishWithExec(ExoJobState c, bool ok, int exit, ExoJobException ex, int errorLogs, long execMs)
        {
            _execMsForFinish = execMs;
            Finish(c, ok, exit, ex, null, errorLogs, "");
        }

        static void Finish(ExoJobState c, bool ok, int exit, ExoJobException ex, string[] compileErrors, int errorLogs, string note)
        {
            long now = NowMs();
            var r = new ExoJobResult
            {
                id = c.id, method = c.method, ok = ok, exitCode = exit,
                startedAt = IsoFromMs(c.claimedMs), durMs = Math.Max(0, now - c.claimedMs),
                refreshMs = c.refreshMs, compileMs = c.compileMs, execMs = _execMsForFinish,
                exception = ex ?? new ExoJobException(), compileErrors = compileErrors ?? new string[0],
                logFile = c.logFile ?? "", errorLogs = errorLogs, domainReloads = c.domainReloads, note = note ?? ""
            };
            _execMsForFinish = 0;
            WriteAtomic(Path.Combine(Done, c.id + ".json"), JsonUtility.ToJson(r, true));
            TryDelete(Path.Combine(Running, c.id + ".json"));
            _cur = null; _curId = ""; _state = "idle";
            _jobsDone++;
            _lastActivityMs = now;
            SessionState.SetInt(KDone, _jobsDone);
            SessionState.SetString(KActivity, now.ToString(CultureInfo.InvariantCulture));
            Debug.Log("[ExoJobServer] job " + c.id + " " + (ok ? "ok" : "FAILED exit=" + exit) + " " + c.method + " dur=" + r.durMs + "ms");
        }

        static void SaveState(ExoJobState c) { WriteAtomic(Path.Combine(Running, c.id + ".json"), JsonUtility.ToJson(c, true)); }


        // Mono 의 Process.WorkingSet64 는 0 을 돌려주므로 psapi 로 직접 읽는다(PagefileUsage = 프로세스 커밋).
        [StructLayout(LayoutKind.Sequential)]
        struct PMC
        {
            public uint cb, PageFaultCount;
            public UIntPtr PeakWorkingSetSize, WorkingSetSize, QuotaPeakPagedPoolUsage, QuotaPagedPoolUsage, QuotaPeakNonPagedPoolUsage, QuotaNonPagedPoolUsage, PagefileUsage, PeakPagefileUsage;
        }
        [DllImport("psapi.dll")] static extern bool GetProcessMemoryInfo(IntPtr hProcess, out PMC counters, uint size);
        // ------------------------------------------------------------------ 하트비트(백그라운드 스레드: 메인 스레드가 job으로 막혀 있어도 계속 갱신)
        static void BeatSafe(object o)
        {
            try
            {
                long now = NowMs();
                if (now - _lastHeadMs > 30000) { _lastHeadMs = now; _head = GitHead(_proj); }
                var p = Process.GetCurrentProcess();
                string state = _state;
                long idle = state == "idle" ? (now - _lastActivityMs) / 1000 : 0;
                var sb = new StringBuilder();
                sb.Append("{");
                sb.Append("\"pid\":").Append(p.Id);
                sb.Append(",\"projectPath\":").Append(Q(_proj));
                sb.Append(",\"headSha\":").Append(Q(_head));
                sb.Append(",\"startedAt\":").Append(Q(_startedAt));
                sb.Append(",\"lastBeat\":").Append(Q(IsoFromMs(now)));
                sb.Append(",\"state\":").Append(Q(state));
                sb.Append(",\"currentJob\":").Append(Q(_curId));
                sb.Append(",\"jobsDone\":").Append(_jobsDone);
                sb.Append(",\"idleSec\":").Append(idle);
                long wsB = 0, peakWsB = 0, commitB = 0, peakCommitB = 0;
                PMC pmc;
                if (GetProcessMemoryInfo(p.Handle, out pmc, (uint)Marshal.SizeOf(typeof(PMC))))
                {
                    wsB = (long)(ulong)pmc.WorkingSetSize; peakWsB = (long)(ulong)pmc.PeakWorkingSetSize;
                    commitB = (long)(ulong)pmc.PagefileUsage; peakCommitB = (long)(ulong)pmc.PeakPagefileUsage;
                }
                sb.Append(",\"workingSetMB\":").Append(wsB >> 20);
                sb.Append(",\"privateMB\":").Append(commitB >> 20);
                sb.Append(",\"peakWorkingSetMB\":").Append(peakWsB >> 20);
                sb.Append(",\"peakPrivateMB\":").Append(peakCommitB >> 20);
                sb.Append(",\"queueDir\":").Append(Q(_q));
                sb.Append("}");
                WriteAtomic(Path.Combine(_q, "server.json"), sb.ToString());
            }
            catch { }
        }

        static string GitHead(string dir)
        {
            foreach (var exe in new[] { "git", @"C:\Program Files\Git\cmd\git.exe" })
            {
                try
                {
                    var psi = new ProcessStartInfo(exe, "rev-parse HEAD") { WorkingDirectory = dir, UseShellExecute = false, RedirectStandardOutput = true, RedirectStandardError = true, CreateNoWindow = true };
                    using (var pr = Process.Start(psi))
                    {
                        if (!pr.WaitForExit(4000)) { try { pr.Kill(); } catch { } continue; }
                        var s = pr.StandardOutput.ReadToEnd().Trim();
                        if (s.Length >= 7) return s;
                    }
                }
                catch { }
            }
            return "";
        }

        // ------------------------------------------------------------------ 유틸
        static IEnumerable<string> SortedJson(string dir)
        {
            string[] files;
            try { files = Directory.GetFiles(dir, "*.json"); } catch { return new string[0]; }
            Array.Sort(files, StringComparer.Ordinal);
            return files;
        }

        static void WriteAtomic(string path, string text)
        {
            var tmp = path + "." + Guid.NewGuid().ToString("N").Substring(0, 6) + ".tmp";
            File.WriteAllText(tmp, text, new UTF8Encoding(false));
            try
            {
                if (File.Exists(path)) File.Replace(tmp, path, null);
                else File.Move(tmp, path);
            }
            catch
            {
                try { File.Copy(tmp, path, true); } catch { }
                TryDelete(tmp);
            }
        }

        static void TryDelete(string p) { try { if (File.Exists(p)) File.Delete(p); } catch { } }
        static long NowMs() { return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(); }
        static string IsoFromMs(long ms) { return DateTimeOffset.FromUnixTimeMilliseconds(ms).ToString("yyyy-MM-ddTHH:mm:ss.fffZ", CultureInfo.InvariantCulture); }

        static string Sanitize(string s)
        {
            var sb = new StringBuilder();
            foreach (var ch in s) sb.Append(char.IsLetterOrDigit(ch) || ch == '-' || ch == '_' ? ch : '_');
            return sb.Length == 0 ? "job" : sb.ToString();
        }

        static ExoJobException ToEx(Exception e)
        {
            return new ExoJobException { type = e.GetType().FullName, message = e.Message, stack = e.StackTrace ?? "" };
        }

        static string Q(string s)
        {
            if (s == null) s = "";
            var sb = new StringBuilder("\"");
            foreach (var ch in s)
            {
                switch (ch)
                {
                    case '"': sb.Append("\\\""); break;
                    case '\\': sb.Append("\\\\"); break;
                    case '\n': sb.Append("\\n"); break;
                    case '\r': sb.Append("\\r"); break;
                    case '\t': sb.Append("\\t"); break;
                    default: if (ch < 0x20) sb.Append("\\u").Append(((int)ch).ToString("x4")); else sb.Append(ch); break;
                }
            }
            return sb.Append("\"").ToString();
        }
    }
}
