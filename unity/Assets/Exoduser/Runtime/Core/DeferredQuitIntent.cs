namespace Exoduser.UnityPort.Core {public sealed class DeferredQuitIntent {public int ExitCode{get;private set;}public void Request(int code){if(code!=0||ExitCode==0)ExitCode=code;}}}
