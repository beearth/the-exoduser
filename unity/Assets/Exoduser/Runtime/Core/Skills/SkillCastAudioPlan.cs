using System;using System.Collections.Generic;
namespace Exoduser.UnityPort.Core {
 public sealed class SkillAudioNote {public string Kind,Key,Wave;public double[] Args;}
 public static class SkillCastAudioPlan {
  public static List<SkillAudioNote> Build(string id,bool fused,Func<double> random){if(random==null)throw new ArgumentNullException(nameof(random));var notes=new List<SkillAudioNote>();Func<double,double,double> rate=(v,s)=>v*(1+(random()-.5)*2*(s==0?.05:s));Action<string,double,double> sample=(key,volume,pitch)=>notes.Add(new SkillAudioNote{Kind="Sample",Key=key,Args=new[]{volume,pitch*(.92+random()*.16)}});Action<string,string,double[]> synth=(kind,wave,args)=>notes.Add(new SkillAudioNote{Kind=kind,Wave=wave,Args=args});
   if(id=="timeWarp"||id=="ghostWalk"||id=="maliceDome"||id=="holyPrison"){synth("FM","sine",new[]{1400.0,700,200,.07,.06,2200});synth("FM","sine",new[]{2000.0,1000,150,.06,.035,2800});synth("Tone","sine",new[]{3200.0,.04,.015,0,.004});if(id=="holyPrison")sample("voice_holyPrison",1,1);}
   else if(id=="darkPillar"){sample("fire_magic1",.75,1);synth("Noise","bandpass",new[]{.45,1800,.10,650,.025});}
   else if(id=="iceStorm"){synth("Noise","bandpass",new[]{.06,3000,.04,1500,.002});synth("Sub","sine",new[]{55.0,.08,.05,35});sample("fire_magic2",.3,rate(1.5,.06));synth("Noise","highpass",new[]{.06,12000,.02,8000,.001});sample("ice_storm",.7,1);sample("voice_magic",1,1);}
   else if(id=="venomBlade"||id=="ltnChaser"){synth("Noise","bandpass",new[]{.06,3000,.04,1500,.002});synth("Sub","sine",new[]{55.0,.08,.05,35});if(id=="venomBlade"){sample("fire_magic1",.35,rate(.6,.06));synth("FM","sawtooth",new[]{150.0,40,300,.12,.05,80});synth("Dist","square",new[]{80.0,.1,.03,30,30});}else{sample("fire_magic2",.5,rate(1.8,.08));synth("FM","square",new[]{100.0,2000,3000,.05,.05,3000});synth("Noise","lowpass",new[]{.05,10000,.04,4000,.001});}}
   else if(id=="maliceHunt"||id=="plagueBurst"){int index=Math.Min(2,(int)(random()*3));sample("sword_swing"+(index+1),.85,rate(1,.08));string voice=random()<.5?"voice_dark_skill":"voice_bladefuse";sample(voice,id=="maliceHunt"&&!fused?.8:1,rate(1,id=="maliceHunt"&&!fused?.08:.05));}else throw new ArgumentException("Unsupported skill audio plan: "+id);return notes;
  }
 }
}
