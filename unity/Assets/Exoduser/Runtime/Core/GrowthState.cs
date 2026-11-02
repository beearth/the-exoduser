using System;
using System.Collections.Generic;
namespace Exoduser.UnityPort.Core {
 // Web stat-panel-ui.js createPlan/evaluatePlan and game.html _processPassiveQueue.
 // The model owns allocation only. Derived combat values stay in the existing equipment/executor paths.
 public sealed class GrowthState {
  public static readonly string[] StatKeys={"str","dex","int","vit","lck"};
  public static readonly string[] PassiveKeys={"pAtk","pCharge","pParry","pMagic","pBow","pGuard","pRegen","pCrit","pDrop","pPierce","pMRegen","pXbow","pMelee","pCombo","pAbund","pPred","pDot","pVital","pStamina","pMalice","pFortify","pArmor","pHunter","pHuman","pDemon","pRage"};
  static readonly int[] Costs={1,1,1,2,2,2,3,3,3,5};
  public readonly Dictionary<string,int> Stats=new Dictionary<string,int>(),Passives=new Dictionary<string,int>();
  public readonly List<string> Queue=new List<string>();
  public int Grit;
  int legacySpRefund;
  // Consume the old nonlinear GRIT cost refund once; saving writes gritCostModeV2=true.
  public bool TryMigrateSp(int current,out int migrated){migrated=current;long next=(long)current+legacySpRefund;if(current<0||next>int.MaxValue)return false;migrated=(int)next;legacySpRefund=0;return true;}
  public GrowthState(){foreach(var k in StatKeys)Stats[k]=0;foreach(var k in PassiveKeys)Passives[k]=0;}
  public int Value(string key){int v;return key=="grit"?Grit:Stats.TryGetValue(key,out v)||Passives.TryGetValue(key,out v)?v:0;}
  public static bool IsStat(string key){return key=="grit"||Array.IndexOf(StatKeys,key)>=0;}
  public static bool IsPassive(string key){return Array.IndexOf(PassiveKeys,key)>=0;}
  public static int Cap(string key){return key=="grit"?int.MaxValue:IsStat(key)?500:IsPassive(key)?10:0;}
  public static int RankCost(int rank){return rank>=0&&rank<Costs.Length?Costs[rank]:5;}
  public static long PassiveSpent(int rank){long sum=0;for(int n=0;n<Math.Min(rank,Costs.Length);n++)sum+=RankCost(n);return sum+Math.Max(0L,(long)rank-Costs.Length)*5;}
  public long SpentSp(){long n=Grit;foreach(var v in Stats.Values)n+=v;return n;}
  public long SpentAp(){long n=0;foreach(var v in Passives.Values)n+=PassiveSpent(v);return n;}
  public GrowthState Copy(){var d=new GrowthState();d.CopyFrom(this);return d;}
  public void CopyFrom(GrowthState from){foreach(var k in StatKeys)Stats[k]=from.Stats[k];foreach(var k in PassiveKeys)Passives[k]=from.Passives[k];Grit=from.Grit;Queue.Clear();Queue.AddRange(from.Queue);}
  public bool SameAllocations(GrowthState o){if(o==null||Grit!=o.Grit)return false;foreach(var k in StatKeys)if(Stats[k]!=o.Stats[k])return false;foreach(var k in PassiveKeys)if(Passives[k]!=o.Passives[k])return false;return true;}
  public GrowthPlan CreatePlan(){return new GrowthPlan(this);}
  public int Queued(string key){int n=0;foreach(var k in Queue)if(k==key)n++;return n;}
  public bool Reserve(string key,int amount){if(!IsPassive(key)||amount<1||(long)Value(key)+Queued(key)+amount>Cap(key))return false;for(int i=0;i<amount;i++)Queue.Add(key);return true;}
  public bool CancelReservation(int index){if(index<0||index>=Queue.Count)return false;Queue.RemoveAt(index);return true;}
  public int ProcessQueue(PlayerState p){int n=0;while(Queue.Count>0){var k=Queue[0];int rank=Value(k);if(!IsPassive(k)||rank>=Cap(k)){Queue.RemoveAt(0);continue;}int cost=RankCost(rank);if(p.PassivePoints<cost)break;p.PassivePoints-=cost;Passives[k]=rank+1;Queue.RemoveAt(0);n++;}return n;}
  public bool TryApply(GrowthPlan plan,PlayerState p){int sp,ap,changes;if(!plan.Evaluate(this,p.StatPoints,p.PassivePoints,out sp,out ap,out changes)||changes==0)return false;for(int i=Queue.Count-1;i>=0;i--)if(plan.Draft.Value(Queue[i])<Value(Queue[i]))Queue.RemoveAt(i);var queue=new List<string>(Queue);CopyFrom(plan.Draft);Queue.Clear();Queue.AddRange(queue);p.StatPoints=sp;p.PassivePoints=ap;ProcessQueue(p);return true;}
  static bool ReadAllocation(JsonValue obj,string key,out int value){value=0;var v=obj==null?null:obj.Get(key);if(v==null)return true;if(v.Kind!=JsonKind.Number||v.Number<0||v.Number>int.MaxValue||v.Number!=Math.Floor(v.Number))return false;value=(int)v.Number;return true;}
  public static bool TryRead(JsonValue raw,out GrowthState state,out string error){
   state=new GrowthState();error=null;if(raw==null)return true;
   if(raw.Kind!=JsonKind.Object){error="growth save root is not an object";return false;}
   var stats=raw.Get("stats");var passives=raw.Get("passives");var player=raw.Get("player");
   if(stats!=null&&stats.Kind!=JsonKind.Object){error="growth stats is not an object";return false;}
   if(passives!=null&&passives.Kind!=JsonKind.Object){error="growth passives is not an object";return false;}
   if(player!=null&&player.Kind!=JsonKind.Object){error="growth player is not an object";return false;}
   var q=player==null?null:player.Get("passiveQueue");
   if(q!=null&&q.Kind!=JsonKind.Array){error="growth passiveQueue is not an array";return false;}
   foreach(var k in StatKeys){int v;if(!ReadAllocation(stats,k,out v)){error="invalid growth stat "+k;return false;}state.Stats[k]=v;}
   foreach(var k in PassiveKeys){int v;if(!ReadAllocation(passives,k,out v)){error="invalid growth passive "+k;return false;}state.Passives[k]=v;}
   int grit;if(!ReadAllocation(raw,"grit",out grit)){error="invalid growth grit";return false;}state.Grit=grit;
   var mode=raw.Get("gritCostModeV2");if(mode!=null&&mode.Kind!=JsonKind.Bool){error="growth gritCostModeV2 is not a boolean";return false;}
   if(grit>0&&(mode==null||!mode.Bool)){long refund=(long)grit*(grit+3L)/2;if(refund>int.MaxValue){error="legacy growth SP refund exceeds the player range";return false;}state.legacySpRefund=(int)refund;}
   if(q!=null)foreach(var v in q.Items){if(v==null||v.Kind!=JsonKind.String){error="growth passiveQueue entry is not a string";return false;}if(IsPassive(v.Text)&&state.Value(v.Text)+state.Queued(v.Text)<Cap(v.Text))state.Queue.Add(v.Text);}
   return true;
  }
  static JsonValue ObjectAt(JsonValue root,string key){var v=root.Get(key);if(v==null||v.Kind!=JsonKind.Object){v=JsonValue.NewObject();root.Set(key,v);}return v;}
  public JsonValue WriteInto(JsonValue raw){if(legacySpRefund>0)throw new InvalidOperationException("Apply the legacy GRIT SP refund before saving");var root=raw==null?JsonValue.NewObject():SaveJson.Parse(SaveJson.Write(raw));var stats=ObjectAt(root,"stats");foreach(var k in StatKeys)stats.Set(k,JsonValue.Of((double)Stats[k]));var passives=ObjectAt(root,"passives");foreach(var k in PassiveKeys)passives.Set(k,JsonValue.Of((double)Passives[k]));root.Set("grit",JsonValue.Of((double)Grit));root.Set("gritCostModeV2",JsonValue.Of(true));var q=JsonValue.NewArray();foreach(var k in Queue)q.Add(JsonValue.Of(k));ObjectAt(root,"player").Set("passiveQueue",q);return root;}
 }
 public sealed class GrowthPlan {
  public readonly GrowthState Base,Draft;
  public GrowthPlan(GrowthState state){Base=state.Copy();Draft=state.Copy();}
  public bool Evaluate(GrowthState live,int liveSp,int liveAp,out int sp,out int ap,out int changes){sp=ap=changes=0;if(!Base.SameAllocations(live)||liveSp<0||liveAp<0)return false;foreach(var k in GrowthState.StatKeys){if(Draft.Value(k)<0||Draft.Value(k)>Math.Max(GrowthState.Cap(k),live.Value(k)))return false;if(Draft.Value(k)!=live.Value(k))changes++;}foreach(var k in GrowthState.PassiveKeys){if(Draft.Value(k)<0||Draft.Value(k)>Math.Max(GrowthState.Cap(k),live.Value(k)))return false;if(Draft.Value(k)!=live.Value(k))changes++;}if(Draft.Grit<0)return false;if(Draft.Grit!=live.Grit)changes++;long s=(long)liveSp+live.SpentSp()-Draft.SpentSp(),a=(long)liveAp+live.SpentAp()-Draft.SpentAp();if(s<0||a<0||s>int.MaxValue||a>int.MaxValue)return false;sp=(int)s;ap=(int)a;return true;}
  public bool Change(string key,int amount,GrowthState live,int sp,int ap){if(amount==0||(!GrowthState.IsStat(key)&&!GrowthState.IsPassive(key)))return false;long next=(long)Draft.Value(key)+amount;if(next<0||next>int.MaxValue)return false;int before=Draft.Value(key);Set(key,(int)next);int s,a,c;if(Evaluate(live,sp,ap,out s,out a,out c))return true;Set(key,before);return false;}
  void Set(string key,int value){if(key=="grit")Draft.Grit=value;else if(GrowthState.IsStat(key))Draft.Stats[key]=value;else Draft.Passives[key]=value;}
  public void RefundAll(){foreach(var k in GrowthState.StatKeys)Draft.Stats[k]=0;foreach(var k in GrowthState.PassiveKeys)Draft.Passives[k]=0;Draft.Grit=0;}
 }
}
