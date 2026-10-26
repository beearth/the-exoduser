using System;
using System.Collections.Generic;

namespace Exoduser.UnityPort.Core
{
    [Serializable] public sealed class PetDialogueEntry {
        public string id,who,txt,pw,pt,mode;public float dur,cd,pd;public int tier,source_line;
    }
    [Serializable] public sealed class PetTranslation {public string ko,text;}
    [Serializable] public sealed class PetLanguage {public string code;public PetTranslation[] lines;}
    [Serializable] public sealed class PetDialogueData {public string sourceSha256;public PetDialogueEntry[] entries;public PetLanguage[] languages;}

    // Source9282-9814. Fixed arrays, independent cosmetic RNG, no text/collection allocation in Tick.
    public sealed class SourcePetDialogue
    {
        static readonly int[] TierCool={1200,720,480,360,240,0};
        readonly PetDialogueEntry[] entries;
        readonly Dictionary<string,int> ids=new Dictionary<string,int>();
        readonly string[][] main,pair;
        readonly string[] codes;
        readonly int[] cooldown;
        readonly int[] tierCooldown=new int[6];
        readonly bool[] once;
        readonly int[] nags=new int[6],tips=new int[18],talks=new int[5];
        readonly int[] nagBag=new int[6],tipBag=new int[18],talkBag=new int[5];
        int nagCount,tipCount,talkCount,current=-1,pending=-1,urgentId=-1,bid=-1,bidTier=-1,bidWeight;
        int remaining,duration,language,frame,idleTicks,talkTicks,environmentTicks,lastEnemyCount;
        int kills;
        float averageAttack;
        bool isPair,environmentSeen,stageCleared;
        uint random=0x50455431;
        public string Who => current<0?null:isPair?entries[current].pw:entries[current].who;
        public string Text => current<0?"":(isPair?pair:main)[language][current];
        public string CurrentId => current<0?"":entries[current].id;
        public int Remaining => remaining;
        public float Alpha => remaining<=0?0:(float)(Math.Pow(Math.Max(0,Math.Min(1,(double)remaining/duration)),.6)*.6);
        public SourcePetDialogue(PetDialogueData data)
        {
            entries=data.entries;cooldown=new int[entries.Length];once=new bool[entries.Length];
            for(int i=0;i<entries.Length;i++)ids.Add(entries[i].id,i);
            codes=new string[data.languages.Length+1];main=new string[codes.Length][];pair=new string[codes.Length][];codes[0]="ko";
            for(int l=0;l<codes.Length;l++){
                var dict=new Dictionary<string,string>();
                if(l>0){var lang=data.languages[l-1];codes[l]=lang.code;foreach(var row in lang.lines)dict[row.ko]=row.text;}
                main[l]=new string[entries.Length];pair[l]=new string[entries.Length];
                for(int i=0;i<entries.Length;i++){
                    var e=entries[i];main[l][i]=Translate(dict,e.txt);pair[l][i]=Translate(dict,e.pt);
                    // Only the base no-escape-skill branch has an admitted owner in Unity.
                    if(e.id=="stun_warn"){
                        main[l][i]=Translate(dict,"기절!")+" "+Translate(dict,"Shift 사슬")+" "+Translate(dict,"으로 탈출!");
                        pair[l][i]=Translate(dict,"스킬 없으면 방향키 연타뿐이야.");
                    }
                }
            }
            for(int i=0;i<6;i++)nags[i]=ids["idle_nag"+i];
            for(int i=0;i<18;i++)tips[i]=ids["idle_tip"+i];
            for(int i=0;i<5;i++)talks[i]=ids["petTalk_"+i];
        }
        static string Translate(Dictionary<string,string> dict,string text){if(text==null)return "";return dict.TryGetValue(text,out var t)?t:text;}
        public void SetLanguage(string code){language=0;for(int i=1;i<codes.Length;i++)if(codes[i]==code){language=i;break;}}
        public void Reset()
        {
            Array.Clear(cooldown,0,cooldown.Length);Array.Clear(once,0,once.Length);Array.Clear(tierCooldown,0,6);
            current=pending=urgentId=bid=-1;remaining=duration=frame=kills=0;
            idleTicks=talkTicks=environmentTicks=lastEnemyCount=0;nagCount=tipCount=talkCount=0;
            environmentSeen=stageCleared=isPair=false;averageAttack=0;
        }
        public bool Say(string id){return Offer(ids[id],false);}
        public void OnKill(Simulation sim){
            kills++;if(kills==50)Say("combo_50");if(kills==100)Say("combo_100");
            if(sim.Player.Hp>0&&sim.Player.Hp<sim.Player.MaxHp*.1)Say("low_hp_kill");
        }
        bool Offer(int i,bool urgent)
        {
            var e=entries[i];if(cooldown[i]>0)return false;
            int tier=urgent?5:e.tier;
            if(urgent){if(urgentId==i&&remaining>0)return false;remaining=0;pending=-1;}
            else if(remaining>0||tierCooldown[tier]>0)return false;
            current=i;isPair=false;duration=remaining=(int)(e.dur*60);pending=string.IsNullOrEmpty(e.pw)?-1:i;
            cooldown[i]=(int)(e.cd*60);tierCooldown[tier]=TierCool[tier];
            if(urgent){urgentId=i;for(int t=0;t<5;t++)tierCooldown[t]=Math.Max(tierCooldown[t],300);}
            return true;
        }
        void Bid(string id,int weight=0)
        {
            int i=ids[id];if(cooldown[i]>0)return;int tier=weight>0?5:entries[i].tier;
            if(tier<bidTier||(tier==bidTier&&(tier!=5||weight<=bidWeight)))return;
            bid=i;bidTier=tier;bidWeight=weight;
        }
        void Fire(){if(bid>=0)Offer(bid,bidTier==5);bid=-1;bidTier=-1;bidWeight=0;}
        bool Tutorial(string id,bool condition,bool acceptedOnly=false)
        {
            int i=ids[id];if(!condition||once[i])return false;
            bool ok=Offer(i,false);if(ok||!acceptedOnly)once[i]=true;return ok||!acceptedOnly;
        }
        double Random01(){random=unchecked(random*1664525+1013904223);return random/4294967296.0;}
        int Bag(int[] source,int[] bag,ref int count){
            if(count==0){count=source.Length;for(int i=0;i<count;i++)bag[i]=source[i];
                for(int i=count-1;i>0;i--){int j=(int)(Random01()*(i+1)),v=bag[i];bag[i]=bag[j];bag[j]=v;}}
            return bag[--count];
        }
        public void Tick(Simulation sim,bool lesson,int bagCount,bool heroicEquipment,bool unenhancedHero)
        {
            frame++;for(int i=0;i<cooldown.Length;i++)if(cooldown[i]>0)cooldown[i]--;
            for(int i=0;i<6;i++)if(tierCooldown[i]>0)tierCooldown[i]--;
            if(remaining>0&&--remaining<=0&&pending>=0){
                current=pending;pending=-1;isPair=true;duration=remaining=(int)((entries[current].pd>0?entries[current].pd:5)*60);
            }
            var p=sim.Player;int alive=0,near=0;float attack=0;int attackCount=0;
            foreach(var e in sim.Enemies){if(!e.Alive)continue;alive++;double dx=e.X-p.X,dy=e.Y-p.Y,d=dx*dx+dy*dy;
                if(d<90000)near++;if(d<250000){attack+=e.Attack;attackCount++;}}
            if(frame%60==0)averageAttack=attackCount==0?0:attack/attackCount;
            if(p.Hp>0&&p.Hp<p.MaxHp*.5&&p.Hp>=p.MaxHp*.3)Bid("warn_hp50",40);
            if(p.Hp>0&&p.Hp<p.MaxHp*.3&&p.Hp>=p.MaxHp*.1)Bid("crisis_hp30",60);
            if(p.Hp>0&&p.Hp<p.MaxHp*.1)Bid("hp_critical",100);
            if(p.Hp>0&&averageAttack>0&&p.Hp<averageAttack*1.2)Bid("hp_oneshot",95);
            if(p.State=="pStun")Bid("stun_warn",80);
            if(p.Stamina<p.MaxStamina*.5&&p.Level<=100)Bid("low_st");
            Fire();if(p.Level>500)return;
            int atk=lesson?0:sim.PetAttackCount,hit=lesson?0:sim.PetHitCount;
            // Web lesson hurtEnemy returns before pet attack/kill callbacks (42113).
            if(sim.Config.StageIndex==0&&p.Level<=200){
                if(Tutorial("tut_start",true))return;
                if(Tutorial("tut_atk3",atk>=3&&atk<7))return;
                if(Tutorial("tut_charge",atk>=7))return; // chain owner absent; never alias KiChargeActive.
                if(Tutorial("tut_1sthit",hit>=1))return;
                if(Tutorial("tut_hit2",hit>=2))return;
                if(Tutorial("tut_parry",atk>=8))return;
                if(Tutorial("tut_1stkill",kills>=1))return;
                if(Tutorial("tut_bow",kills>=3))return;
                if(Tutorial("tut_firstItem",bagCount>=1,true))return;
                if(Tutorial("tut_potionCraft",p.Level>=100))return;
            }
            if(p.Level<=200){
                Tutorial("tut_keyG",sim.Materials>=30&&heroicEquipment);
                Tutorial("tut_keyV",bagCount>=20);
                Tutorial("tut_keyESC",p.Level>=10);
            }
            // Unity owns no trap/slam/dome/rage state. Base no-skill source branches only.
            if(near>=10)Bid("melee_trap_no");if(near>=20)Bid("melee_slam_no");
            if(p.Hp<p.MaxHp*.5||p.Mana<p.MaxMana*.5||p.Stamina<p.MaxStamina*.5)Bid("resource_parry");
            if(p.Hp<p.MaxHp*.3||p.Mana<p.MaxMana*.3||p.Stamina<p.MaxStamina*.3)Bid("resource_low_no");
            if(atk>=15)Bid("shift_hint");if(bagCount>=15)Bid("bag_full");
            if(sim.Materials<10)Bid("low_mats");if(sim.Materials>=50&&unenhancedHero)Bid("enh_hint");
            Bid("parry_low"); // actual parry owner absent: source counter remains zero.
            if(alive==0&&p.State=="idle")Bid("idle_noE");
            if(p.State=="idle"){
                if(++idleTicks>1200){idleTicks=0;
                    if(Random01()<.5){int i=Bag(nags,nagBag,ref nagCount);Bid(entries[i].id);}
                    else if(Random01()<.5){int i=Bag(tips,tipBag,ref tipCount);Bid(entries[i].id);}}
                if(++talkTicks>7200&&alive==0){talkTicks=0;int i=Bag(talks,talkBag,ref talkCount);Bid(entries[i].id);}
            }else idleTicks=talkTicks=0;
            if(sim.Config.StageIndex==0){
                Bid("chapter_0");if(!environmentSeen&&++environmentTicks>1800){environmentSeen=true;Bid("env_ch0");}}
            if(lastEnemyCount>=5&&alive==0&&!stageCleared){stageCleared=true;Bid("stage_clear");}
            if(alive>0)stageCleared=false;lastEnemyCount=alive;
            Fire();
        }
    }
}
