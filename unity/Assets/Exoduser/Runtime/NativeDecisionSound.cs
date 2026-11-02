using System;
using UnityEngine;
using UnityEngine.Audio;
namespace Exoduser.UnityPort {
 // Same files and candidate 1 default as web; this is not a final user listening selection.
 internal sealed class NativeDecisionSound:MonoBehaviour {
  static NativeDecisionSound current; static int sfxPercent=60;
  readonly NativeDecisionSoundPolicy policy=new NativeDecisionSoundPolicy();
  AudioSource source;AudioClip normal,dark;internal static int LastDecisionFrame=-1;internal static int Events;
  internal static float MusicGain=>current==null?1:current.policy.MusicGain(Time.realtimeSinceStartupAsDouble);
  internal static void Ensure(GameObject owner){if(current==null)current=owner.AddComponent<NativeDecisionSound>();}
  internal static void SetSfxPercent(int percent){sfxPercent=Mathf.Clamp(percent,0,100);}
  void Awake(){current=this;source=gameObject.AddComponent<AudioSource>();source.playOnAwake=false;source.loop=false;source.spatialBlend=0;
   var mixer=Resources.Load<AudioMixer>("Audio/FrontendUI");if(mixer!=null)foreach(var group in mixer.FindMatchingGroups("Master/UI"))if(group.name=="UI"){source.outputAudioMixerGroup=group;break;}
   int candidate=1;var args=Environment.GetCommandLineArgs();for(int i=0;i<args.Length-1;i++)if(args[i]=="--unity-ddung-candidate"&&int.TryParse(args[i+1],out var value))candidate=Mathf.Clamp(value,1,3);
   normal=Resources.Load<AudioClip>("Audio/UI/ddung_"+candidate);dark=Resources.Load<AudioClip>("Audio/UI/ddung_"+candidate+"_dark");normal?.LoadAudioData();dark?.LoadAudioData();
  }
  internal static bool Play(string kind){if(current==null)return false;var c=current;var clip=kind=="delete"?c.dark:c.normal;
   if(clip==null||!c.policy.TryPlay(kind,sfxPercent,Time.realtimeSinceStartupAsDouble))return false;
   c.source.clip=clip;c.source.volume=.8f*sfxPercent/100f;c.source.Play();LastDecisionFrame=Time.frameCount;Events++;
   Debug.Log("UI_DECISION kind="+kind+" gain="+c.source.volume+" duck=0.501187 duration=0.8 file="+clip.name+" frame="+Time.frameCount);return true;
  }
  void OnDestroy(){if(current==this)current=null;}
 }
}
