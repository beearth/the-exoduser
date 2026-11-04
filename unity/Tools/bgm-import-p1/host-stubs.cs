// Silent contract doubles only: product NativeGameMusic/selection/rotation are compiled unchanged.
using System;
using System.Collections.Generic;
namespace UnityEngine {
 public class Object { public static void Destroy(object o){} }
 public class Transform { public void SetParent(Transform t){} }
 public class GameObject { public string name;public Transform transform=new Transform(); public GameObject(string n){name=n;} public T AddComponent<T>() where T:new(){var t=new T();if(t is AudioSource a)AudioSource.All[name]=a;return t;} }
 public class AudioClip { public string name;public void LoadAudioData(){} }
 public class AudioSource { public static Dictionary<string,AudioSource> All=new Dictionary<string,AudioSource>();public bool playOnAwake,loop,isPlaying;public float spatialBlend,volume;public object outputAudioMixerGroup;public AudioClip clip;public void Play(){isPlaying=true;}public void Stop(){isPlaying=false;} }
 public static class Resources { public static T Load<T>(string p) where T:class {return new AudioClip{name=p} as T;} }
 public static class Random { static System.Random r=new System.Random(42);public static int Range(int a,int b){return r.Next(a,b);} }
 public static class Mathf { public static float Min(float a,float b){return Math.Min(a,b);}public static float Max(float a,float b){return Math.Max(a,b);} }
 public static class AudioListener { public static bool pause; }
}
namespace Exoduser.UnityPort {
 public class NativeAudioMixer {public float SfxGain=1;public bool Boss;public object Group(string s){return null;}public void Snapshot(bool b,float t=0){Boss=b;}public void SetSfxPercent(int n){}public void SetMusicPercent(int n){} }
 public static class NativeDecisionSound {public static float MusicGain=1;}
 public static class NativeScreenTransition {public static float Gain=1;}
 public static class NativeSoundWire {public const string AmbForestBed="amb_forest_bed";}
}
