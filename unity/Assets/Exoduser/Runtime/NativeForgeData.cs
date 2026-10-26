using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort {
 // Definitions of the web forge window (#forge) extracted from game.html at d5f32ff57 (Resources/Data/forge_web.json): names, copy, tab layout,
 // formula text. No state lives here; money/equipment/bag/level are read from the Unity simulation and inventory at draw time.
 [Serializable] public sealed class ForgeSource {public string commit,file,extractedAt,note;}
 [Serializable] public sealed class ForgeLoreRun {public string g,t;}
 [Serializable] public sealed class ForgeTabDef {public string id,label;}
 [Serializable] public sealed class ForgeSlotDef {public string key,label,emoji;public float chipW;}
 [Serializable] public sealed class ForgeUpgradeDef {public string header,aiTitle,aiDesc,hint,noItem,targetLabel,estLabel,haveSlash,startLabel,haveLabel,enoughLabel,shortLabel,needMore,successLabel,costLabel,bonusDefault;}
 [Serializable] public sealed class ForgePotionDef {public string header,hpName,healLabel,costLabel,maxLabel,needLabel;}
 [Serializable] public sealed class ForgeSlotFilter {public string k,g;}
 [Serializable] public sealed class ForgeSalvageDef {public string header,rarLabel,slotLabel,all,arrowLabel,costLabel,empty,selPrefix,selUnit,selSuffix;public ForgeSlotFilter[] slotFilters;public string[] bulk;public int[] valueTable;public int tierMul;}
 [Serializable] public sealed class ForgeRerollDef {public string header,empty,noAffix;public int rerollCost;}
 [Serializable] public sealed class ForgeCrystalDef {public string[] sub,filters;public string owned,dust,malice,note,bulk,empty;public int cap;}
 [Serializable] public sealed class ForgeRate {public string name;public int pct;public int[] col;}
 [Serializable] public sealed class ForgeCraftSlot {public string key,label,g;}
 [Serializable] public sealed class ForgeCraftDef {public string header,headerGlyph,costLabel,costUnit,tip,empty;public int cost;public ForgeRate[] rates;public ForgeCraftSlot[] slots;}
 [Serializable] public sealed class ForgeDefs {
  public ForgeSource source;public string title,matsLabel,closeLabel;
  public ForgeLoreRun[] lore;public ForgeTabDef[] tabs;public string[] rarityNames,slotKr;public ForgeSlotDef[] slots;
  public ForgeUpgradeDef upgrade;public ForgePotionDef potion;public ForgeSalvageDef salvage;public ForgeRerollDef reroll;public ForgeCrystalDef crystal;public ForgeCraftDef craft;
 }
 [Serializable] public sealed class ForgeGlyph {public string n;public int x,y,w,h;public float ox,oy,adv,lw,lh;}
 [Serializable] public sealed class ForgeGlyphFile {public int atlasW,atlasH;public ForgeGlyph[] glyphs;}

 // Web formulas ported verbatim (line numbers are game.html at d5f32ff57). Pure functions of the item, no stored values.
 public static class ForgeFormulas {
  static readonly double[] RarityMul={0.5,0.7,1.0,1.3,1.8};
  // 28188
  public static int EconomyRarity(int r){return r>=0?Math.Min(r,4):0;}
  // 28078 enhRate: percent, never below 0.5
  public static double RatePercent(int n){return Math.Max(0.5,99*Math.Pow(0.99,n));}
  // 28083 _malCost (50% malice discount)
  public static int MalCost(double v){if(v<=0)return 0;return Math.Max(1,(int)Math.Ceiling(v*0.5));}
  // 28088 enhCostRaw
  public static double CostRaw(int n){return Math.Max(20000,Math.Ceiling((20000+n*3500)*1.5));}
  // 28091 enhCost
  public static void Cost(int enh,int rarity,out double rate,out int cost){rate=RatePercent(enh)/100;cost=MalCost(Math.Ceiling(CostRaw(enh)*RarityMul[EconomyRarity(rarity)]));}
  // 28095/28099: 0.25 per enhancement level (DEF and ATK)
  public static double Mul(int n){return n*0.25;}
  // 50546.. rate text: >=10 integer, >=1 one decimal, >=0.01 two decimals, else three
  public static string RateText(double rate){
   double raw=rate*100;var ci=System.Globalization.CultureInfo.InvariantCulture;
   if(raw>=10)return ((int)raw).ToString(ci);if(raw>=1)return raw.ToString("0.0",ci);if(raw>=0.01)return raw.ToString("0.00",ci);return raw.ToString("0.000",ci);
  }
  // 28118 enhRateColor
  public static Color RateColor(double rate){
   if(rate>=0.7)return new Color32(68,255,68,255);if(rate>=0.4)return new Color32(255,221,68,255);if(rate>=0.1)return new Color32(255,136,68,255);return new Color32(255,68,68,255);
  }
  // 28107 enhColor. The web recolours inline #44ff88 to #f0d7b8 (#forge [style*='#44ff88']), so the default tier is that bone colour.
  public static Color EnhColor(int enh){
   if(enh>=1000)return new Color32(255,0,255,255);if(enh>=500)return new Color32(255,221,0,255);if(enh>=200)return new Color32(255,0,136,255);
   if(enh>=100)return new Color32(255,68,68,255);if(enh>=75)return new Color32(204,68,255,255);if(enh>=50)return new Color32(255,136,68,255);
   if(enh>=25)return new Color32(255,204,0,255);if(enh>=10)return new Color32(68,170,255,255);return new Color32(240,215,184,255);
  }
  // 28189 salvageVal (the stored _enhRefund of transferred web items does not exist in Unity)
  public static int SalvageValue(InventoryItem it,int[] table){
   int e=it.enh,refund=0;
   if(e>0){double m=RarityMul[EconomyRarity(it.rarity)],total=0;for(int i=0;i<e;i++)total+=Math.Ceiling(Math.Max(1,Math.Ceiling((1+i*0.15)*1.5))*m);refund=(int)Math.Floor(total*0.5);}
   return table[EconomyRarity(it.rarity)]+refund+it.tier*2;
  }
  // 50546.. bonus text per equipment class (ATK from atk, DEF/HP/ST/MP from the slot)
  public static string BonusText(InventoryItem it,string fallback){
   int enh=it.enh;string t="";
   if(it.atk>0)t+="ATK +"+(int)(Mul(enh)*100)+"% → +"+(int)(Mul(enh+1)*100)+"%";
   string s=it.slot;
   if(s=="shield"||s=="armor"||s=="cape")t+=(t.Length>0?" | ":"")+"DEF +"+(int)Mul(enh)+" → +"+(int)Mul(enh+1);
   if(s=="gloves"||s=="pants"||s=="boots")t+=(t.Length>0?" | ":"")+"HP +"+(int)(enh*1.0)+" → +"+(int)((enh+1)*1.0);
   if(s=="ring1"||s=="ring2"||s=="belt")t+=(t.Length>0?" | ":"")+"ST +"+(int)(enh*0.2)+" → +"+(int)((enh+1)*0.2);
   if(s=="bracelet"||s=="necklace"||s=="headband"||s=="headband2"||s=="ossuary")t+=(t.Length>0?" | ":"")+"MP +"+(int)(enh*0.2)+" → +"+(int)((enh+1)*0.2);
   return t.Length>0?t:fallback;
  }
  // AI auto-enhance expected malice: sum of cost/rate from the current level to the target (50587..)
  public static double AutoCost(int from,int target,int rarity){double sum=0;for(int i=from;i<target;i++){Cost(i,rarity,out var rate,out var cost);sum+=cost/rate;}return sum;}
 }
}
