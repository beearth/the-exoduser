using System;
using System.Collections.Generic;
using System.Linq;
namespace Exoduser.UnityPort.Core.Skills {
 public sealed class FullSkillDefinition { public string Id,Category;public int LearnSp,LearnMalice,RequiredLevel;public bool Active,Ultimate,Fixed,Upgrade;public FullSkillDefinition(string id,string category,int sp,int malice,int required,bool active,bool ultimate,bool fixedSkill,bool upgrade){Id=id;Category=category;LearnSp=sp;LearnMalice=malice;RequiredLevel=required;Active=active;Ultimate=ultimate;Fixed=fixedSkill;Upgrade=upgrade;} }
 public sealed class FullSkillFusion {public string Key;public string[] Members,Absorbed;public int Star;public bool DemoAllowed;public FullSkillFusion(string key,int star,bool demo,string[] members,string[] absorbed){Key=key;Star=star;DemoAllowed=demo;Members=members;Absorbed=absorbed;} }
 public sealed class FullSkillRecommendation {public string[] Skills;public string Fusion;public bool Pick;public FullSkillRecommendation(string[] skills,string fusion,bool pick){Skills=skills;Fusion=fusion;Pick=pick;} }
 // Latest web catalogue and transactions. Simulation adapters may enable writes only for verified executors.
 public sealed class FullSkillLedger {
  public const string SourceSha="740722e1ac3a5f4b0143f55b6088b01b8517be0f";
  public readonly Dictionary<string,int> Levels=new Dictionary<string,int>();public readonly List<string> Fused=new List<string>();public readonly string[] Slots=new string[6];
  public int Sp,Malice,PlayerLevel=1;public bool Demo;public double MaliceCostMultiplier=.5;
  public string Lmb="kiSlash",Magic="fireball",Rmb="maliceSwipe",Charge="charge",Q="parry",Ct="ghostWalk",Bow="normal",Tech,Ultimate;
  public Func<string,bool> ExecutorReady=id=>false;public Func<string,bool> FusionReady=key=>true;
  public int Level(string id){return id!=null&&Levels.TryGetValue(id,out int level)?level:0;}
  public static int LevelLock(int playerLevel){return Math.Min(20,playerLevel/50+1);}
  public static int UpgradeCost(int level){return 1;}
  public static int FusionUpgradeCost(int level,int count){int stars=count>0?count:2;return level>=9?(stars>=4?8:stars>=2?6:stars):stars;}
  public int Cost(int value){return value<=0?0:Math.Max(1,(int)Math.Ceiling(value*MaliceCostMultiplier));}
  public static FullSkillDefinition Definition(string id){return Array.Find(Definitions,s=>s.Id==id);}
  public static FullSkillFusion Fusion(string key){return Array.Find(Fusions,s=>s.Key==key);}
  public bool IsFused(string key){return Fused.Contains(key);}
  public bool CanLearn(string id){var d=Definition(id);return d!=null&&ExecutorReady(id)&&Level(id)==0&&PlayerLevel>=d.RequiredLevel&&Sp>=d.LearnSp&&Malice>=Cost(d.LearnMalice);}
  public bool Learn(string id){if(!CanLearn(id))return false;LearnAccepted(Definition(id));return true;}
  void LearnAccepted(FullSkillDefinition d){Levels[d.Id]=1;Sp-=d.LearnSp;Malice-=Cost(d.LearnMalice);if(d.Id=="chainAssault"&&Level("chainSlam")==0)Levels["chainSlam"]=1;
   if(InFixed("charge",d.Id))Charge=d.Id;if(InFixed("bow",d.Id)&&(Bow==null||Bow=="normal"))Bow=d.Id;if(InFixed("tech",d.Id))Tech=d.Id;if(InFixed("magic",d.Id)&&(Magic==null||Magic=="fireball"))Magic=d.Id;if(InFixed("q",d.Id)&&d.Id!="parry")Q=d.Id;if(InFixed("lmb",d.Id)&&d.Id!="kiSlash")Lmb=d.Id;
   ClearAbsorbed();if(d.Ultimate){if(Ultimate==null)Ultimate=d.Id;}else if(d.Active&&!Absorbed().Contains(d.Id))AutoAssign(d.Id);
  }
  public static int NumericWindowSlot(int slot){return slot>=0&&slot<4?slot:slot==4?5:slot==12?4:-1;}
  static string FixedKind(int slot){switch(slot){case 6:return "lmb";case 7:return "magic";case 8:return "charge";case 9:return "rmb";case 10:return "q";case 11:return "ct";case 15:return "bow";default:return null;}}
  public string Equipped(int slot){int n=NumericWindowSlot(slot);if(n>=0)return Slots[n];switch(slot){case 5:return Ultimate;case 6:return Lmb;case 7:return Magic;case 8:return Charge;case 9:return Rmb;case 10:return Q;case 11:return Ct;case 15:return Bow;default:return null;}}
  public bool CanEquip(int slot,string id){if(id==null)return false;bool ready=id=="charge"||id=="parry"||id=="normal"||ExecutorReady(id);if(!ready)return false;string kind=FixedKind(slot);if(kind!=null)return InFixed(kind,id)&&(Definition(id)==null||Level(id)>=1||id=="charge"||id=="parry"||id=="normal"||id=="fireball"||id=="kiSlash"||id=="ghostWalk");if(slot==5)return Definition(id)?.Ultimate==true&&Level(id)>=1;int n=NumericWindowSlot(slot);return n>=0&&Level(id)>=1&&!Absorbed().Contains(id)&&CanAssign(id,n);}
  public bool Equip(int slot,string id){if(!CanEquip(slot,id))return false;int n=NumericWindowSlot(slot);if(n>=0){for(int i=0;i<Slots.Length;i++)if(Slots[i]==id)Slots[i]=null;Slots[n]=id;}else switch(slot){case 5:Ultimate=id;break;case 6:Lmb=id;break;case 7:Magic=id;break;case 8:Charge=id;break;case 9:Rmb=id;break;case 10:Q=id;break;case 11:Ct=id;break;case 15:Bow=id;break;}return true;}
  public bool CanUnequip(int slot){return (NumericWindowSlot(slot)>=0||slot==5)&&Equipped(slot)!=null;}
  public bool Unequip(int slot){if(!CanUnequip(slot))return false;int n=NumericWindowSlot(slot);if(n>=0)Slots[n]=null;else Ultimate=null;return true;}
  public static bool CanAssign(string id,int slot){var d=Definition(id);if(d==null||!d.Active||d.Ultimate||d.Fixed)return false;return d.Category=="tech"?slot==5:d.Category=="rage"||id=="giantSlam"||id=="giantSlam2"?slot==4:slot>=0&&slot<4;}
  void AutoAssign(string id){if(Array.IndexOf(Slots,id)>=0)return;for(int i=0;i<6;i++)if(Slots[i]==null&&CanAssign(id,i)){Slots[i]=id;return;}}
  public HashSet<string> Absorbed(){var result=new HashSet<string>();foreach(var key in Fused){var f=Fusion(key);if(f!=null)foreach(var id in f.Absorbed)result.Add(id);}return result;}
  void ClearAbsorbed(){var absorbed=Absorbed();for(int i=0;i<6;i++)if(Slots[i]!=null&&absorbed.Contains(Slots[i]))Slots[i]=null;}
  public bool CanFuse(string key){var f=Fusion(key);return f!=null&&FusionReady(key)&&!IsFused(key)&&(!Demo||f.DemoAllowed)&&f.Members.All(id=>Level(id)>0&&ExecutorReady(id));}
  public bool TryFuse(string key){var f=Fusion(key);if(!CanFuse(key)||Sp<f.Star*3)return false;Sp-=f.Star*3;foreach(var id in f.Members){var d=Definition(id);if(d==null)continue;int level=Level(id);if(level>1){Sp+=level-1;Levels[id]=1;}}
   Fused.Add(key);if(key=="whirlDet"||key=="slamStorm"||key=="stormBeam")Lmb="whirlwind";if(key=="stormBeam"){if(Level("peaceShield")==0)Levels["peaceShield"]=1;if(Level("hellRay")==0)Levels["hellRay"]=1;Magic="hellRay";}
   foreach(var id in f.Absorbed){for(int i=0;i<6;i++)if(Slots[i]==id)Slots[i]=null;if(Ultimate==id)Ultimate=null;}
   if(FusionAutoHosts.TryGetValue(key,out string host)&&Level(host)>0)AutoAssign(host);SyncFixed(f.Absorbed);return true;
  }
  FullSkillFusion LargestGroup(string id){FullSkillFusion best=null;foreach(var f in Fusions)if(IsFused(f.Key)&&Array.IndexOf(f.Members,id)>=0&&(best==null||f.Members.Length>best.Members.Length))best=f;return best;}
  static string Host(FullSkillFusion f){return f.Key=="elemFuse"?"omniBeam":f.Members[0];}
  FullSkillFusion UpgradeGroup(string id){bool _dimFuse=IsFused("dimBreach");
    bool _dimSlamF=Level("chargeBoost")>=1&&Level("magicBlink")>=1&&Level("chainAssault")>=1&&IsFused("dimSlam");
    bool _dimThunderF=_dimSlamF&&Level("chainSlam")>=1&&IsFused("dimThunder");
    bool _dimRushF=_dimThunderF&&Level("chainSlash")>=1&&IsFused("dimRush");
    bool _dimBlastF=_dimRushF&&Level("giantSlam")>=1&&IsFused("dimBlast");
    bool _isDimBlast=id=="chargeBoost"&&_dimBlastF;
    bool _isDimRush=id=="chargeBoost"&&_dimRushF&&!_dimBlastF;
    bool _isDimThunder=id=="chargeBoost"&&_dimThunderF&&!_dimRushF&&!_dimBlastF;
    bool _isDimSlam=id=="chargeBoost"&&_dimSlamF&&!_dimThunderF&&!_dimRushF&&!_dimBlastF;
    bool _isDimFuse=id=="chargeBoost"&&_dimFuse&&!_dimSlamF&&!_dimThunderF&&!_dimRushF&&!_dimBlastF;
    
    bool _stormBeamF=IsFused("stormBeam");
    bool _slamStormF=Level("whirlwind")>=1&&Level("detonate")>=1&&Level("giantSlam")>=1&&IsFused("slamStorm");
    bool _synth=Level("whirlwind")>=1&&Level("detonate")>=1&&IsFused("whirlDet");
    bool _isStormBeam=id=="whirlwind"&&_stormBeamF;
    bool _isSlamStorm=id=="whirlwind"&&_slamStormF&&!_stormBeamF;
    bool _isSynth=id=="whirlwind"&&_synth&&!_slamStormF&&!_stormBeamF;
    bool _bladeFuse=Level("maliceHunt")>=1&&Level("guardian")>=1&&IsFused("bladeFuse");
    bool _isBladeFuse=id=="maliceHunt"&&_bladeFuse&&!(Level("plagueBurst")>=1&&IsFused("plagueFuse"));
    bool _iceMortarFuse=Level("maliceMortar")>=1&&Level("iceOrb")>=1&&IsFused("iceMortar");
    bool _isIceFuse=id=="maliceMortar"&&_iceMortarFuse;
    bool _elemFuseF=Level("fanShot")>=1&&Level("omniBeam")>=1&&Level("elemMissile")>=1&&IsFused("elemFuse");
    bool _sixFuse=Level("fanShot")>=1&&Level("omniBeam")>=1&&IsFused("sixFuse");
    bool _isElemFuse=id=="omniBeam"&&_elemFuseF&&!_stormBeamF;
    bool _isSixFuse=id=="fanShot"&&_sixFuse&&!_elemFuseF&&!_stormBeamF;
    bool _elecRepentF=Level("maliceStorm")>=1&&Level("hellRay")>=1&&IsFused("elecRepent");
    bool _boneStormF=Level("maliceStorm")>=1&&Level("boneWall")>=1&&IsFused("boneStorm")&&!_elecRepentF;
    bool _isElecRepent=id=="maliceStorm"&&_elecRepentF;
    bool _isBoneStorm=id=="maliceStorm"&&_boneStormF&&!_elecRepentF;
    bool _shieldFuseF=Level("maliceSwipe")>=1&&Level("shieldThrow")>=1&&IsFused("shieldFuse");
    bool _isShieldFuse=id=="maliceSwipe"&&_shieldFuseF;
    bool _plagueFuseF=Level("maliceHunt")>=1&&Level("plagueBurst")>=1&&IsFused("plagueFuse");
    bool _plagueVenomF=Level("maliceHunt")>=1&&Level("venomBlade")>=1&&IsFused("plagueVenom");
    bool _isPlagueVenom=id=="maliceHunt"&&Level("venomBlade")>=1&&IsFused("plagueVenom");
    bool _isPlagueFuse=id=="maliceHunt"&&_plagueFuseF&&!_isPlagueVenom;
    bool _holyW4F=IsFused("holyWeak4")&&Level("holyDome")>=1&&Level("weakRev")>=1;
    bool _holyW3F=!_holyW4F&&IsFused("holyWeak3")&&Level("holyDome")>=1&&Level("weakPj")>=1;
    bool _holyW2F=!_holyW4F&&!_holyW3F&&IsFused("holyWeak2")&&Level("holyDome")>=1&&Level("weakMag")>=1;
    bool _holyW1F=!_holyW4F&&!_holyW3F&&!_holyW2F&&IsFused("holyWeak1")&&Level("holyDome")>=1&&Level("weakPhys")>=1;
    bool _holyIceF=!_holyW4F&&!_holyW3F&&!_holyW2F&&!_holyW1F&&Level("holyDome")>=1&&Level("holyPrison")>=1&&Level("iceStorm")>=1&&IsFused("holyIce");
    bool _holyFuseF=!_holyW4F&&!_holyW3F&&!_holyW2F&&!_holyW1F&&!_holyIceF&&(Level("holyDome")>=1&&Level("holyPrison")>=1&&IsFused("holyFuse"));
    bool _isHolyW4=id=="holyDome"&&_holyW4F;
    bool _isHolyW3=id=="holyDome"&&_holyW3F;
    bool _isHolyW2=id=="holyDome"&&_holyW2F;
    bool _isHolyW1=id=="holyDome"&&_holyW1F;
    bool _isHolyIce=id=="holyDome"&&_holyIceF;
    bool _isHolyFuse=id=="holyDome"&&_holyFuseF;
    bool _pillarSlamF=Level("giantSlam2")>=1&&Level("darkPillar")>=1&&IsFused("pillarSlam");
    bool _pillarSpikeF=Level("darkPillar")>=1&&Level("spikeTrap")>=1&&IsFused("pillarSpike")&&!_pillarSlamF;
    bool _isPillarSlam=id=="giantSlam2"&&_pillarSlamF;
    bool _isPillarSpike=id=="darkPillar"&&_pillarSpikeF;
    bool _infernoSlamF=Level("giantSlam2")>=1&&Level("fireAura")>=1&&IsFused("infernoSlam")&&!_pillarSlamF;
    bool _isInfernoSlam=id=="giantSlam2"&&_infernoSlamF;
    bool _siegeGhostF=Level("ghostXbowTurret")>=1&&Level("voidScarecrow")>=1&&IsFused("siegeGhost");
    bool _isSiegeGhost=id=="ghostXbowTurret"&&_siegeGhostF;
    bool _dualScarecrowF=Level("voidScarecrow")>=1&&Level("explodeScarecrow")>=1&&IsFused("dualScarecrow");
    bool _isDualScarecrow=id=="voidScarecrow"&&_dualScarecrowF;
    bool _thunderGhostF=Level("bladeDash")>=1&&Level("thunderStake")>=1&&IsFused("thunderGhost");
    bool _isThunderGhost=id=="bladeDash"&&_thunderGhostF;
    bool _timeStepF=Level("timeWarp")>=1&&Level("ghostWalk")>=1&&IsFused("timeStep");
    bool _isTimeStep=id=="timeWarp"&&_timeStepF;
    bool _stormBurstF=_stormBeamF&&Level("burstLoop")>=1&&IsFused("stormBurst");
    bool _isStormBurst=id=="whirlwind"&&_stormBurstF;
    bool active=_isStormBurst||_isStormBeam||_isDimBlast||_isDimRush||_isDimFuse||_isDimSlam||_isDimThunder||_isSlamStorm||_isSynth||_isElemFuse||_isSixFuse||_isBladeFuse||_isIceFuse||_isBoneStorm||_isElecRepent||_isShieldFuse||_isPlagueFuse||_isPlagueVenom||_isHolyFuse||_isHolyIce||_isHolyW1||_isHolyW2||_isHolyW3||_isHolyW4||_isPillarSlam||_isPillarSpike||_isInfernoSlam||_isSiegeGhost||_isDualScarecrow||_isThunderGhost||_isTimeStep;if(!active)return null;string key=_isStormBurst?"stormBurst":_isStormBeam?"stormBeam":_isDimBlast?"dimBlast":_isDimRush?"dimRush":_isDimThunder?"dimThunder":_isDimSlam?"dimSlam":_isDimFuse?"dimBreach":_isSlamStorm?"slamStorm":_isSynth?"whirlDet":_isElemFuse?"elemFuse":_isSixFuse?"sixFuse":_isBladeFuse?"bladeFuse":_isBoneStorm?"boneStorm":_isElecRepent?"elecRepent":_isShieldFuse?"shieldFuse":_isPlagueVenom?"plagueVenom":_isPlagueFuse?"plagueFuse":_isPillarSlam?"pillarSlam":_isPillarSpike?"pillarSpike":_isInfernoSlam?"infernoSlam":_isSiegeGhost?"siegeGhost":_isDualScarecrow?"dualScarecrow":_isThunderGhost?"thunderGhost":_isTimeStep?"timeStep":_isHolyW4?"holyWeak4":_isHolyW3?"holyWeak3":_isHolyW2?"holyWeak2":_isHolyW1?"holyWeak1":_isHolyIce?"holyIce":_isHolyFuse?"holyFuse":"iceMortar";return Fusion(key);}
public int UpgradeSpCost(string id){var g=UpgradeGroup(id);return g==null?1:FusionUpgradeCost(g.Members.Min(Level),g.Members.Length);}
public bool CanUpgrade(string id){var d=Definition(id);int lv=Level(id);if(d==null||!ExecutorReady(id)||!d.Upgrade||lv<1||lv>=LevelLock(PlayerLevel))return false;var group=UpgradeGroup(id);return group!=null?group.Members.All(ExecutorReady)&&group.Members.Min(Level)<20&&Sp>=FusionUpgradeCost(group.Members.Min(Level),group.Star):lv<20&&Sp>=1;}
  public bool Upgrade(string id){if(!CanUpgrade(id))return false;var group=UpgradeGroup(id);if(group!=null){int level=group.Members.Min(Level);int cost=FusionUpgradeCost(level,group.Members.Length);if(Sp<cost)return false;Sp-=cost;foreach(var member in group.Members)Levels[member]=Math.Max(Level(member),level+1);}else{Sp--;Levels[id]=Level(id)+1;}return true;}
  public int BatchUpgrade(){int count=0;var claimed=new HashSet<string>();foreach(var f in Fusions.Where(x=>IsFused(x.Key)).OrderByDescending(x=>x.Members.Length)){if(f.Members.All(claimed.Contains))continue;foreach(var id in f.Members)claimed.Add(id);if(!f.Members.All(ExecutorReady))continue;int level=f.Members.Min(id=>Math.Max(1,Level(id)));while(level<20&&level<LevelLock(PlayerLevel)){int cost=FusionUpgradeCost(level,f.Members.Length);if(Sp<cost)break;foreach(var id in f.Members)Levels[id]=Math.Max(Math.Max(1,Level(id)),level+1);Sp-=cost;level++;count++;}}
   foreach(var d in Definitions){if(!d.Upgrade||claimed.Contains(d.Id)||!ExecutorReady(d.Id))continue;int level=Level(d.Id);if(level<1)continue;while(level<20&&level<LevelLock(PlayerLevel)&&Sp>=1){Levels[d.Id]=++level;Sp--;count++;}}return count;
  }
  public int[] Recommend(){int learned=0,fused=0;foreach(var phase in Recommendations){if(phase.Pick){if(!phase.Skills.Any(id=>Level(id)>0)&&phase.Skills.Length>0&&Learn(phase.Skills[0]))learned++;continue;}foreach(var id in phase.Skills)if(Learn(id))learned++;if(phase.Fusion!=null&&TryFuse(phase.Fusion))fused++;}return new[]{learned,fused};}
  void SyncFixed(string[] reset){var ids=new HashSet<string>(reset);var hosts=new HashSet<string>();foreach(var key in Fused)if(SyncHosts.TryGetValue(key,out string host))hosts.Add(host);Func<string,string,bool> ok=(id,kind)=>id!=null&&(!ids.Contains(id)||hosts.Contains(id))&&(Level(id)>=1||InFixed(kind,id));
   if(!ok(Lmb,"lmb"))Lmb="kiSlash";if(!ok(Charge,"charge")&&Charge!="charge")Charge="charge";if(!ok(Magic,"magic")&&Magic!="fireball")Magic="fireball";if(!ok(Q,"q")&&Q!="parry")Q="parry";if(!ok(Ct,"ct")&&Ct!="ghostWalk")Ct="ghostWalk";if(!ok(Bow,"bow")&&Bow!="normal")Bow="normal";if(Rmb!=null&&ids.Contains(Rmb))Rmb="maliceSwipe";
  }
  public bool Lower(string id){if(!ExecutorReady(id)||Level(id)<=1)return false;var f=LargestGroup(id);if(f!=null){if(!f.Members.All(ExecutorReady))return false;int level=f.Members.Min(x=>Math.Max(1,Level(x)));if(level<=1)return false;foreach(var x in f.Members)if(Math.Max(1,Level(x))>=level)Levels[x]=level-1;Sp+=FusionUpgradeCost(level-1,f.Star);}else{Levels[id]=Level(id)-1;Sp++;}return true;}
  static bool FreeBase(string id){return id=="kiSlash"||id=="fireball"||id=="spikeTrap";}
  public int ResetRefund(string id){var d=Definition(id);if(d==null||Level(id)<1)return 0;var f=LargestGroup(id);if(f==null)return (FreeBase(id)?0:d.LearnSp)+Level(id)-1;if(f.Key=="shieldFuse"){int lv=Math.Max(1,f.Members.Min(x=>Math.Max(1,Level(x))));int refund=0;for(int n=1;n<lv;n++)refund+=FusionUpgradeCost(n,2);return refund;}int result=f.Members.Sum(x=>Definition(x)?.LearnSp??0);foreach(var key in Fused){var g=Fusion(key);if(g==null||!g.Members.Any(x=>Array.IndexOf(f.Members,x)>=0))continue;result+=g.Star*3;int level=g.Members.Min(x=>Math.Max(1,Level(x)));for(int n=1;n<level;n++)result+=FusionUpgradeCost(n,g.Star);}return result;}
  public bool Reset(string id,bool confirmed){if(!confirmed||!ExecutorReady(id)||Level(id)<1)return false;var f=LargestGroup(id);if(f!=null&&!f.Members.All(ExecutorReady))return false;int refund=ResetRefund(id);if(f==null&&FreeBase(id)&&refund<=0)return false;if(f!=null&&f.Key=="shieldFuse"){int level=f.Members.Min(x=>Math.Max(1,Level(x)));if(level<=1)return false;foreach(var x in f.Members)Levels[x]=Level(x)-level+1;Sp+=refund;return true;}var reset=f==null?new[]{id}:f.Members;foreach(var x in reset){Levels[x]=f==null&&FreeBase(x)?1:0;for(int i=0;i<6;i++)if(Slots[i]==x)Slots[i]=null;if(Ultimate==x)Ultimate=null;}if(f!=null)Fused.RemoveAll(key=>{var known=Fusion(key);return known!=null&&known.Members.Any(x=>Array.IndexOf(reset,x)>=0);});Sp+=refund;SyncFixed(reset);return true;}
  public static bool InFixed(string kind,string id){return FixedSlots.TryGetValue(kind,out string[] ids)&&Array.IndexOf(ids,id)>=0;}
public static readonly FullSkillDefinition[] Definitions={
new FullSkillDefinition("chargeBoost","move",10,100,0,false,false,false,true),
new FullSkillDefinition("magicBlink","move",10,100,0,false,false,false,true),
new FullSkillDefinition("ghostWalk","def",10,100,0,true,false,false,true),
new FullSkillDefinition("bladeDash","move",10,60,0,false,false,false,true),
new FullSkillDefinition("kiSlash","phys",10,0,0,false,false,false,true),
new FullSkillDefinition("fireball","magic",10,0,0,false,false,false,true),
new FullSkillDefinition("whirlwind","phys",10,100,0,false,false,false,true),
new FullSkillDefinition("detonate","def",10,100,0,false,false,false,true),
new FullSkillDefinition("maliceSwipe","def",10,80,0,false,false,false,true),
new FullSkillDefinition("fanShot","bow",10,100,0,false,false,false,true),
new FullSkillDefinition("omniBeam","magic",10,100,0,false,false,false,true),
new FullSkillDefinition("elemMissile","bow",10,80,0,false,false,false,true),
new FullSkillDefinition("guardian","summon",10,100,0,false,false,false,true),
new FullSkillDefinition("maliceHunt","bow",10,100,0,true,false,false,true),
new FullSkillDefinition("venomBlade","bow",10,0,0,true,false,false,true),
new FullSkillDefinition("ltnChaser","bow",10,80,0,true,false,false,true),
new FullSkillDefinition("maliceMortar","magic",10,100,0,true,false,false,true),
new FullSkillDefinition("boneWall","magic",10,100,0,true,false,false,true),
new FullSkillDefinition("blackStar","ult",10,100,0,true,true,false,true),
new FullSkillDefinition("lavaSummon","ult",10,100,0,true,true,false,true),
new FullSkillDefinition("execution","ult",10,100,0,true,true,false,true),
new FullSkillDefinition("iceOrb","def",10,100,0,true,false,false,true),
new FullSkillDefinition("needleShot","bow",10,80,0,true,false,false,true),
new FullSkillDefinition("arcLaser","magic",10,100,0,false,false,false,true),
new FullSkillDefinition("fireBeam","bow",10,100,0,false,false,false,true),
new FullSkillDefinition("maliceDome","def",10,100,0,true,false,false,true),
new FullSkillDefinition("fireAura","magic",10,100,0,false,false,false,true),
new FullSkillDefinition("plagueBurst","bow",10,80,0,true,false,false,true),
new FullSkillDefinition("maliceStorm","magic",10,90,0,true,false,false,true),
new FullSkillDefinition("darkPillar","magic",10,100,0,true,false,false,true),
new FullSkillDefinition("holyDome","tech",10,90,0,true,false,false,true),
new FullSkillDefinition("holyPrison","tech",10,80,0,true,false,false,true),
new FullSkillDefinition("iceStorm","magic",10,90,0,true,false,false,true),
new FullSkillDefinition("giantSlam","rage",10,120,0,true,false,false,true),
new FullSkillDefinition("giantSlam2","rage",10,120,0,true,false,false,true),
new FullSkillDefinition("skyCrusher","rage",10,120,0,true,false,false,true),
new FullSkillDefinition("chainAssault","move",10,0,0,false,false,false,true),
new FullSkillDefinition("chainSlam","move",10,100,0,false,false,false,true),
new FullSkillDefinition("chainSlash","move",0,0,0,false,false,true,true),
new FullSkillDefinition("peaceShield","def",0,0,0,false,false,true,true),
new FullSkillDefinition("hellRay","magic",0,0,0,false,false,true,true),
new FullSkillDefinition("shieldThrow","def",10,80,0,false,false,true,true),
new FullSkillDefinition("weakPhys","tech",10,80,0,true,false,false,true),
new FullSkillDefinition("weakMag","tech",10,80,0,true,false,false,true),
new FullSkillDefinition("weakPj","tech",10,80,0,true,false,false,true),
new FullSkillDefinition("weakRev","tech",10,80,0,true,false,false,true),
new FullSkillDefinition("spikeTrap","phys",10,80,0,true,false,false,true),
new FullSkillDefinition("blueShot","bow",10,100,300,false,false,true,true),
new FullSkillDefinition("burstLoop","magic",0,0,700,false,false,true,true),
new FullSkillDefinition("voidScarecrow","summon",10,100,0,true,false,false,true),
new FullSkillDefinition("explodeScarecrow","summon",10,100,0,true,false,false,true),
new FullSkillDefinition("ancestorSummon","summon",10,100,0,true,false,false,true),
new FullSkillDefinition("ghostXbowTurret","bow",10,120,500,true,false,false,true),
new FullSkillDefinition("timeWarp","def",15,150,500,true,false,false,true),
new FullSkillDefinition("thunderStake","magic",10,100,0,true,false,false,true)};
public static readonly FullSkillFusion[] Fusions={
new FullSkillFusion("dimBreach",2,true,new[]{"chargeBoost","magicBlink"},new[]{"magicBlink"}),
new FullSkillFusion("dimSlam",3,true,new[]{"chargeBoost","magicBlink","chainAssault"},new[]{"magicBlink","chainAssault"}),
new FullSkillFusion("dimThunder",4,false,new[]{"chargeBoost","magicBlink","chainAssault","chainSlam"},new[]{"magicBlink","chainAssault","chainSlam"}),
new FullSkillFusion("dimRush",5,false,new[]{"chargeBoost","magicBlink","chainAssault","chainSlash","chainSlam"},new[]{"magicBlink","chainAssault","chainSlash","chainSlam"}),
new FullSkillFusion("dimBlast",6,false,new[]{"chargeBoost","magicBlink","chainAssault","chainSlash","chainSlam","giantSlam"},new[]{"magicBlink","chainAssault","chainSlash","chainSlam","giantSlam"}),
new FullSkillFusion("whirlDet",2,true,new[]{"whirlwind","detonate"},new[]{"detonate"}),
new FullSkillFusion("slamStorm",3,true,new[]{"whirlwind","detonate","giantSlam"},new[]{"detonate","giantSlam"}),
new FullSkillFusion("stormBeam",4,false,new[]{"whirlwind","detonate","giantSlam","fanShot","omniBeam","elemMissile"},new[]{"detonate","giantSlam","fanShot","omniBeam","elemMissile"}),
new FullSkillFusion("stormBurst",5,false,new[]{"whirlwind","detonate","giantSlam","fanShot","omniBeam","elemMissile","burstLoop"},new[]{"detonate","giantSlam","fanShot","omniBeam","elemMissile","burstLoop"}),
new FullSkillFusion("bladeFuse",2,true,new[]{"maliceHunt","guardian"},new[]{"guardian"}),
new FullSkillFusion("bladeEcho",2,true,new[]{"maliceHunt","bladeDash"},new string[0]),
new FullSkillFusion("iceMortar",2,true,new[]{"maliceMortar","iceOrb"},new[]{"iceOrb"}),
new FullSkillFusion("sixFuse",2,true,new[]{"fanShot","omniBeam"},new[]{"omniBeam"}),
new FullSkillFusion("elemFuse",3,true,new[]{"fanShot","omniBeam","elemMissile"},new[]{"fanShot","omniBeam","elemMissile"}),
new FullSkillFusion("boneStorm",2,true,new[]{"maliceStorm","boneWall"},new[]{"boneWall"}),
new FullSkillFusion("elecRepent",2,true,new[]{"maliceStorm","hellRay"},new[]{"hellRay","boneWall"}),
new FullSkillFusion("shieldFuse",2,true,new[]{"maliceSwipe","shieldThrow"},new[]{"shieldThrow"}),
new FullSkillFusion("plagueFuse",3,true,new[]{"maliceHunt","guardian","plagueBurst"},new[]{"guardian","plagueBurst"}),
new FullSkillFusion("plagueVenom",4,true,new[]{"maliceHunt","guardian","plagueBurst","venomBlade"},new[]{"guardian","plagueBurst","venomBlade"}),
new FullSkillFusion("holyFuse",2,true,new[]{"holyDome","holyPrison"},new[]{"holyPrison"}),
new FullSkillFusion("holyIce",3,true,new[]{"holyDome","holyPrison","iceStorm"},new[]{"holyPrison","iceStorm"}),
new FullSkillFusion("holyWeak1",4,false,new[]{"holyDome","holyPrison","iceStorm","weakPhys"},new[]{"holyPrison","iceStorm","weakPhys"}),
new FullSkillFusion("holyWeak2",5,false,new[]{"holyDome","holyPrison","iceStorm","weakPhys","weakMag"},new[]{"holyPrison","iceStorm","weakPhys","weakMag"}),
new FullSkillFusion("holyWeak3",6,false,new[]{"holyDome","holyPrison","iceStorm","weakPhys","weakMag","weakPj"},new[]{"holyPrison","iceStorm","weakPhys","weakMag","weakPj"}),
new FullSkillFusion("holyWeak4",7,false,new[]{"holyDome","holyPrison","iceStorm","weakPhys","weakMag","weakPj","weakRev"},new[]{"holyPrison","iceStorm","weakPhys","weakMag","weakPj","weakRev"}),
new FullSkillFusion("pillarSpike",2,true,new[]{"darkPillar","spikeTrap"},new[]{"spikeTrap"}),
new FullSkillFusion("pillarSlam",2,true,new[]{"giantSlam2","darkPillar"},new[]{"darkPillar"}),
new FullSkillFusion("infernoSlam",2,true,new[]{"giantSlam2","fireAura"},new[]{"fireAura"}),
new FullSkillFusion("siegeGhost",3,true,new[]{"ghostXbowTurret","voidScarecrow"},new[]{"voidScarecrow"}),
new FullSkillFusion("dualScarecrow",2,true,new[]{"voidScarecrow","explodeScarecrow"},new[]{"explodeScarecrow"}),
new FullSkillFusion("thunderGhost",2,true,new[]{"bladeDash","thunderStake"},new[]{"thunderStake"}),
new FullSkillFusion("timeStep",2,false,new[]{"timeWarp","ghostWalk"},new[]{"ghostWalk"})};
public static readonly FullSkillRecommendation[] Recommendations={
new FullSkillRecommendation(new[]{"darkPillar","spikeTrap"},"pillarSpike",false),
new FullSkillRecommendation(new[]{"boneWall","maliceStorm"},"boneStorm",false),
new FullSkillRecommendation(new[]{"thunderStake","iceStorm"},null,false),
new FullSkillRecommendation(new[]{"chargeBoost","magicBlink","chainAssault","chainSlam"},"dimBreach",false),
new FullSkillRecommendation(new[]{"maliceHunt","guardian","plagueBurst"},"bladeFuse",false),
new FullSkillRecommendation(new[]{"blackStar","lavaSummon","execution"},null,true),
new FullSkillRecommendation(new[]{"omniBeam","fanShot","elemMissile"},"elemFuse",false),
new FullSkillRecommendation(new[]{"voidScarecrow","explodeScarecrow"},"dualScarecrow",false),
new FullSkillRecommendation(new[]{"maliceSwipe","shieldThrow"},"shieldFuse",false),
new FullSkillRecommendation(new[]{"maliceMortar","iceOrb","ghostWalk"},"iceMortar",false),
new FullSkillRecommendation(new[]{"holyDome","holyPrison"},"holyFuse",false),
new FullSkillRecommendation(new[]{"whirlwind","detonate","giantSlam","fanShot","omniBeam","elemMissile"},"stormBeam",false),
new FullSkillRecommendation(new[]{"iceStorm"},"holyIce",false),
new FullSkillRecommendation(new[]{"giantSlam2"},null,false),
new FullSkillRecommendation(new[]{"chainSlash"},"dimRush",false)};
static readonly Dictionary<string,string[]> FixedSlots=new Dictionary<string,string[]>{{"charge",new[]{"charge","magicBlink"}},{"magic",new[]{"fireball","omniBeam","elemMissile","hellRay","blueShot","burstLoop","fireAura","fireBeam","arcLaser"}},{"bow",new[]{"normal","bladeShot","blastShot","fanShot","needleShot"}},{"tech",new[]{"giantSlam"}},{"lmb",new[]{"kiSlash","whirlwind"}},{"rmb",new[]{"maliceSwipe"}},{"q",new[]{"parry","detonate","peaceShield"}},{"ct",new[]{"ghostWalk","iceOrb","timeWarp"}}};
static readonly Dictionary<string,string> FusionAutoHosts=new Dictionary<string,string>{{"whirlDet","whirlwind"},{"slamStorm","whirlwind"},{"stormBeam","whirlwind"},{"stormBurst","whirlwind"},{"dimBreach","chargeBoost"},{"dimSlam","chargeBoost"},{"dimThunder","chargeBoost"},{"dimBlast","chargeBoost"},{"sixFuse","fanShot"},{"elemFuse","omniBeam"},{"bladeFuse","maliceHunt"},{"plagueFuse","maliceHunt"},{"plagueVenom","maliceHunt"},{"iceMortar","maliceMortar"},{"boneStorm","maliceStorm"},{"elecRepent","maliceStorm"},{"shieldFuse","maliceSwipe"},{"pillarSlam","giantSlam2"},{"pillarSpike","darkPillar"},{"holyFuse","holyDome"},{"holyIce","holyDome"},{"siegeGhost","ghostXbowTurret"},{"dualScarecrow","voidScarecrow"},{"thunderGhost","bladeDash"},{"timeStep","timeWarp"},{"infernoSlam","giantSlam2"}};
static readonly Dictionary<string,string> SyncHosts=new Dictionary<string,string>{{"elemFuse","omniBeam"},{"sixFuse","omniBeam"},{"stormBeam","whirlwind"},{"stormBurst","whirlwind"},{"whirlDet","whirlwind"},{"slamStorm","whirlwind"},{"dimBreach","chargeBoost"},{"dimSlam","chargeBoost"},{"dimThunder","chargeBoost"},{"dimBlast","chargeBoost"},{"bladeFuse","maliceHunt"},{"plagueFuse","maliceHunt"},{"plagueVenom","maliceHunt"},{"iceMortar","maliceMortar"},{"boneStorm","maliceStorm"},{"elecRepent","maliceStorm"},{"shieldFuse","maliceSwipe"},{"holyFuse","holyDome"},{"holyIce","holyDome"},{"holyWeak1","holyDome"},{"holyWeak2","holyDome"},{"holyWeak3","holyDome"},{"holyWeak4","holyDome"},{"pillarSpike","darkPillar"},{"pillarSlam","giantSlam2"},{"infernoSlam","giantSlam2"},{"siegeGhost","ghostXbowTurret"},{"thunderGhost","bladeDash"},{"timeStep","timeWarp"}};
 }
}
