using System;using System.Collections.Generic;using System.Linq;using Exoduser.UnityPort.Core.Skills;
namespace Exoduser.UnityPort.Core {
 public sealed class SkillForgeCandidate {public string Id,Key;public string[] Unit;public bool Allowed,Completes,Learned,DemoLocked,Hidden,Later;}
 public sealed class SkillForgeModel {
  public string Host,Ready;public string[] Set,Base,Keys;public readonly List<SkillForgeCandidate> Candidates=new List<SkillForgeCandidate>();
  static readonly HashSet<string> HiddenSkills=new HashSet<string>{"chainSlash","hellRay","burstLoop"};
  static readonly Dictionary<string,string[]> Fixed=new Dictionary<string,string[]>{
   {"charge",new[]{"charge","magicBlink"}},
   {"magic",new[]{"fireball","omniBeam","elemMissile","hellRay","blueShot","burstLoop","fireAura","fireBeam","arcLaser"}},
   {"bow",new[]{"normal","bladeShot","blastShot","fanShot","needleShot"}},
   {"tech",new[]{"giantSlam"}},
   {"lmb",new[]{"kiSlash","whirlwind"}},
   {"rmb",new[]{"maliceSwipe"}},
   {"q",new[]{"parry","detonate","peaceShield"}},
   {"ct",new[]{"ghostWalk","iceOrb","timeWarp"}}
  };
  static string Kind(int slot){switch(slot){case 6:return "lmb";case 7:return "magic";case 8:return "charge";case 9:return "rmb";case 10:return "q";case 11:return "ct";case 15:return "bow";default:return null;}}
  public static string FusionHost(string key){return key=="elemFuse"?"omniBeam":FullSkillLedger.Fusion(key)?.Members.FirstOrDefault();}
  public static bool IsHost(string id){return id!=null&&FullSkillLedger.Fusions.Any(f=>FusionHost(f.Key)==id);}
  public static string GroupKey(FullSkillLedger ledger,string id){string best=null;int count=0;foreach(var f in FullSkillLedger.Fusions)if(ledger.IsFused(f.Key)&&Array.IndexOf(f.Members,id)>=0&&f.Members.Length>count){best=f.Key;count=f.Members.Length;}return best;}
  public static string[] Group(FullSkillLedger ledger,string id){string key=GroupKey(ledger,id);return key==null?new[]{id}:(string[])FullSkillLedger.Fusion(key).Members.Clone();}
  static bool Subset(IEnumerable<string> small,IEnumerable<string> big){var all=new HashSet<string>(big);return small.All(all.Contains);}
  static bool Same(IEnumerable<string> a,IEnumerable<string> b){return new HashSet<string>(a).SetEquals(b);}
  public static bool IsHidden(FullSkillLedger ledger,string key){return key=="stormBurst"&&!ledger.IsFused(key);}
  public static bool DemoLocked(FullSkillLedger ledger,string key){return ledger.Demo&&FullSkillLedger.Fusion(key)?.DemoAllowed==false;}
  public static string[] Eligible(FullSkillLedger ledger,int slot){if(slot==13||slot==14||slot<0||slot>15)return new string[0];var output=new List<string>();string kind=Kind(slot);if(kind!=null)output.AddRange(Fixed[kind]);else if(slot==5)output.AddRange(FullSkillLedger.Definitions.Where(d=>d.Ultimate).Select(d=>d.Id));else{int n=FullSkillLedger.NumericWindowSlot(slot);output.AddRange(FullSkillLedger.Definitions.Where(d=>d.Active&&!d.Ultimate&&!d.Fixed&&FullSkillLedger.CanAssign(d.Id,n)).Select(d=>d.Id));}var absorbed=ledger.Absorbed();return output.Where(id=>!absorbed.Contains(id)&&!(HiddenSkills.Contains(id)&&ledger.Level(id)<1&&(FullSkillLedger.Definition(id)?.RequiredLevel??0)==0)).ToArray();}
  public static SkillForgeModel Build(FullSkillLedger ledger,int slot,IEnumerable<string> staged=null){if(ledger==null)throw new ArgumentNullException(nameof(ledger));var m=new SkillForgeModel{Set=new string[0],Base=new string[0],Keys=new string[0]};if(slot==13||slot==14||slot<0||slot>15)return m;string value=ledger.Equipped(slot);if(value==null)return m;m.Host=slot==8&&!IsHost(value)&&ledger.Level("chargeBoost")>=1?"chargeBoost":value;m.Keys=FullSkillLedger.Fusions.Where(f=>FusionHost(f.Key)==m.Host).OrderBy(f=>f.Members.Length).Select(f=>f.Key).ToArray();m.Base=Group(ledger,m.Host);m.Set=m.Base.Concat(staged??new string[0]).Distinct().ToArray();foreach(string key in m.Keys)if(!ledger.IsFused(key)&&Same(FullSkillLedger.Fusion(key).Members,m.Set)){m.Ready=key;break;}
   foreach(string key in m.Keys){if(ledger.IsFused(key))continue;var members=FullSkillLedger.Fusion(key).Members;if(!Subset(m.Set,members))continue;foreach(string id in members){if(m.Set.Contains(id)||m.Candidates.Any(c=>c.Id==id))continue;var unit=Group(ledger,id);var next=m.Set.Concat(unit).Distinct().ToArray();m.Candidates.Add(new SkillForgeCandidate{Id=id,Unit=unit,Key=key,Allowed=Subset(next,members),Completes=m.Keys.Any(k=>!ledger.IsFused(k)&&Same(FullSkillLedger.Fusion(k).Members,next)),Learned=ledger.Level(id)>=1,DemoLocked=DemoLocked(ledger,key),Hidden=IsHidden(ledger,key)});}}
   foreach(string key in m.Keys)foreach(string id in FullSkillLedger.Fusion(key).Members)if(!m.Set.Contains(id)&&!m.Candidates.Any(c=>c.Id==id))m.Candidates.Add(new SkillForgeCandidate{Id=id,Unit=Group(ledger,id),Key=key,Learned=ledger.Level(id)>=1,DemoLocked=DemoLocked(ledger,key),Hidden=IsHidden(ledger,key),Later=true});return m;
  }
  public bool TryStage(string id,IList<string> staged){var c=Candidates.FirstOrDefault(v=>v.Id==id);if(c==null||!c.Allowed||!c.Learned||c.DemoLocked)return false;foreach(var x in c.Unit)if(!staged.Contains(x))staged.Add(x);return true;}
  public static void Unstage(FullSkillLedger ledger,string id,IList<string> staged){var unit=new HashSet<string>(Group(ledger,id));for(int i=staged.Count-1;i>=0;i--)if(unit.Contains(staged[i]))staged.RemoveAt(i);}
 }
}
