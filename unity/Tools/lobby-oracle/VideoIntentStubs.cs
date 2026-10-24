// Boundary doubles only: execute the production adapter's asynchronous callbacks.
// These tests do not decode a movie or substitute for real Unity Player QA.
using System;
namespace UnityEngine
{
 public class Object{public static void Destroy(Object o){}}
 public class Transform{public void SetParent(Transform t,bool world){}}
 public class GameObject:Object{public Transform transform=new Transform();public GameObject(string name){}public T AddComponent<T>()where T:new(){return new T();}}
 public class Texture:Object{}
 public enum RenderTextureFormat{ARGB32}
 public class RenderTexture:Texture{public RenderTexture(int w,int h,int depth,RenderTextureFormat format){}public void Create(){}public void Release(){}}
 public class AudioSource:Object{public bool playOnAwake,mute;public float spatialBlend,volume;public void Stop(){}}
 public static class Application{public static string streamingAssetsPath="test-streaming";}
 public static class Mathf{public static float Min(float a,float b){return Math.Min(a,b);}public static float Max(float a,float b){return Math.Max(a,b);}public static int Max(int a,int b){return Math.Max(a,b);}public static float Clamp01(float a){return Math.Max(0,Math.Min(1,a));}}
}
namespace UnityEngine.Video
{
 public enum VideoSource{Url}public enum VideoRenderMode{RenderTexture}public enum VideoAudioOutputMode{AudioSource,Direct}
 public enum VideoTimeUpdateMode{DSPTime,GameTime,UnscaledGameTime}
 public class VideoPlayer:UnityEngine.Object
 {
  public int playCalls,pauseCalls;public bool isPrepared,isPlaying,playOnAwake,isLooping,waitForFirstFrame,skipOnDrop,sendFrameReadyEvents;
  public VideoTimeUpdateMode timeUpdateMode;public bool canSetTimeUpdateMode=true,canSetDirectAudioVolume=true,directMute;public float directVolume=1;public UnityEngine.AudioSource targetAudioSource;
  public VideoSource source;public string url;public VideoRenderMode renderMode;public VideoAudioOutputMode audioOutputMode;public ushort controlledAudioTrackCount;public uint width=1920,height=1080;public double time,length=10;public long frame=-1;public UnityEngine.RenderTexture targetTexture;
  public event Action<VideoPlayer> prepareCompleted,loopPointReached;public event Action<VideoPlayer,long> frameReady;public event Action<VideoPlayer,string> errorReceived;
  public void EnableAudioTrack(ushort track,bool enable){}public void SetTargetAudioSource(ushort track,UnityEngine.AudioSource source){targetAudioSource=source;}
  public void SetDirectAudioVolume(ushort track,float value){directVolume=value;}public void SetDirectAudioMute(ushort track,bool muted){directMute=muted;}
  public void Prepare(){}public void Play(){playCalls++;isPlaying=true;}public void Pause(){pauseCalls++;isPlaying=false;}public void Stop(){isPlaying=false;isPrepared=false;}
  public void CompletePreparation(){isPrepared=true;prepareCompleted?.Invoke(this);}public void EmitFrame(){frame=0;frameReady?.Invoke(this,0);}public void End(){loopPointReached?.Invoke(this);}public void Fail(){errorReceived?.Invoke(this,"test codec error");}
 }
}
