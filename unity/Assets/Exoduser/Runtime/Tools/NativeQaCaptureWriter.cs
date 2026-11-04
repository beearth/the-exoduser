using System;using System.Collections.Generic;using System.IO;using System.Threading.Tasks;
namespace Exoduser.UnityPort.Tools {
 // QA only: slow external-storage writes never run on the Player/input thread.
 internal sealed class NativeQaCaptureWriter {
  sealed class FrameWrite {internal string path,timeline,line;internal byte[] bytes;}
  readonly object sync=new object();readonly Queue<FrameWrite> frames=new Queue<FrameWrite>();readonly int capacity;
  readonly Action<string,byte[]> binary;readonly Action<string,string> text,append;
  bool running;Exception error;string receiptPath,receiptText;
  internal NativeQaCaptureWriter(int capacity=4,Action<string,byte[]> binary=null,Action<string,string> text=null,Action<string,string> append=null){if(capacity<1)throw new ArgumentOutOfRangeException(nameof(capacity));this.capacity=capacity;this.binary=binary??File.WriteAllBytes;this.text=text??File.WriteAllText;this.append=append??File.AppendAllText;}
  internal Exception Error{get{lock(sync)return error;}}internal bool Idle{get{lock(sync)return !running&&frames.Count==0&&receiptPath==null;}}
  // PC-QUIT-1: the hard exit must not cut the Task.Run drain mid-write. Blocks the main thread for at most timeoutMs; returns whether the queue drained.
  internal bool WaitIdle(int timeoutMs){var until=DateTime.UtcNow.AddMilliseconds(timeoutMs);while(!Idle&&DateTime.UtcNow<until)System.Threading.Thread.Sleep(10);return Idle;}
  internal bool TryFrame(string path,byte[] bytes,string timeline,string line){lock(sync){if(error!=null||frames.Count>=capacity)return false;frames.Enqueue(new FrameWrite{path=path,bytes=bytes,timeline=timeline,line=line});StartLocked();return true;}}
  internal void Latest(string path,string value){lock(sync){if(error!=null)return;receiptPath=path;receiptText=value;StartLocked();}}
  void StartLocked(){if(running)return;running=true;Task.Run((Action)Drain);}
  void Drain(){while(true){FrameWrite frame=null;string path=null,value=null;lock(sync){if(frames.Count>0)frame=frames.Dequeue();else if(receiptPath!=null){path=receiptPath;value=receiptText;receiptPath=receiptText=null;}else{running=false;return;}}try{if(frame!=null){binary(frame.path,frame.bytes);append(frame.timeline,frame.line);}else text(path,value);}catch(Exception e){lock(sync){error=e;frames.Clear();receiptPath=receiptText=null;running=false;}return;}}}
 }
}
