using System;using System.Collections.Generic;using System.Globalization;using System.Text;
namespace Exoduser.UnityPort.Core {
 // Observational only: no simulation RNG, timers or gameplay writes.
 public sealed class CombatStats {
  public readonly Dictionary<string,double> meleeTellStarted=Map("swing","slam","charge","combo","unparryable"),projChargeStarted=Map("physical","magic","forbidden"),parrySuccess=Map("meleeE","meleeQ","projE","projQ"),dmgDealt=Map("normal","skill","reflect","counter"),dmgTaken=Map("meleeEnemy","proj","hazard","boss"),groggy=Map("meleeParry","counter","hit","reflect");
  public readonly Dictionary<string,double> meleeGain=Map("hp","st","mp","rage","malice","harp","hpMaxFrac"),projGain=Map("hp","st","mp","rage","malice","harp","hpMaxFrac");   // hpMaxFrac: sum of each hp gain / max HP at that moment (G1 section 8 recovery line)
  public int parryWrongInput,deaths,hurtCount;public double clearSeconds;
  static Dictionary<string,double> Map(params string[] keys){var d=new Dictionary<string,double>();foreach(var k in keys)d[k]=0;return d;}
  public static void Add(Dictionary<string,double> d,string key,double value=1){if(value==0)return;if(!d.ContainsKey(key))d[key]=0;d[key]+=value;}
  public Action Capture(){var maps=new[]{meleeTellStarted,projChargeStarted,parrySuccess,dmgDealt,dmgTaken,groggy,meleeGain,projGain};var copy=new Dictionary<string,double>[maps.Length];for(int i=0;i<maps.Length;i++)copy[i]=new Dictionary<string,double>(maps[i]);int wrong=parryWrongInput,dead=deaths,hurt=hurtCount;double seconds=clearSeconds;return ()=>{for(int i=0;i<maps.Length;i++){maps[i].Clear();foreach(var pair in copy[i])maps[i][pair.Key]=pair.Value;}parryWrongInput=wrong;deaths=dead;hurtCount=hurt;clearSeconds=seconds;};}
  static string Json(Dictionary<string,double> d){var b=new StringBuilder("{");foreach(var p in d){if(b.Length>1)b.Append(',');b.Append('"').Append(p.Key).Append((char)34).Append(':').Append(p.Value.ToString("R",CultureInfo.InvariantCulture));}return b.Append('}').ToString();}
  public string ToJson(int parries,int hurts,double bank,int ticks){return "{\"meleeTellStarted\":"+Json(meleeTellStarted)+",\"projChargeStarted\":"+Json(projChargeStarted)+",\"parrySuccess\":"+Json(parrySuccess)+",\"parryWrongInput\":"+parryWrongInput+",\"dmgDealt\":"+Json(dmgDealt)+",\"dmgTaken\":"+Json(dmgTaken)+",\"gain\":{\"melee\":"+Json(meleeGain)+",\"proj\":"+Json(projGain)+"},\"groggy\":"+Json(groggy)+",\"deaths\":"+deaths+",\"clearSeconds\":"+clearSeconds.ToString("R",CultureInfo.InvariantCulture)+",\"hurtCount\":"+hurtCount+",\"ParryCount\":"+parries+",\"HurtCount\":"+hurts+",\"ParryBank\":"+bank.ToString("R",CultureInfo.InvariantCulture)+",\"ticks\":"+ticks+"}";}
 }
 [Serializable] public sealed class ParryFeedbackTuning {public float meleeShake=6,projectileShake=4,meleeCameraPushIn=0;}
 public sealed partial class Simulation {
  public readonly CombatStats Stats=new CombatStats();public ParryFeedbackTuning ParryFeedback=new ParryFeedbackTuning();
  public string CombatStatsJson(){return Stats.ToJson(ParryCount,HurtCount,ParryBank,TickCount);}
 }
}
