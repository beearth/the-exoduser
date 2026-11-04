using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeHud
    {
        NativeHudPrototypeLayout prototypeLayout;
        static NativeHudPrototypeLayout prototypeHitLayout;
        float prototypeWidth,prototypeHeight;
        Material prototypeMaterial;
        NativeHudPrototypeTextShadow prototypeShadows;
        Font prototypeSemibold,prototypeRegular,prototypeBody;
        Texture2D prototypeRail,prototypePlate,prototypePedestal,prototypeFrame,prototypeEmblem,prototypeHair,prototypeChip,prototypeMouseL,prototypeMouseR,prototypeEyeOn,prototypeEyeOff,prototypeEyeGlow;
        RenderTexture prototypeHp,prototypeResources,prototypeShield,prototypeMobility;
        RenderTexture[] prototypeSlots;
        List<Texture2D> prototypeArtwork;
        Dictionary<int,GUIStyle> prototypeStyles;
        static Color ProtoColor(int r,int g,int b,float a=1){return NativeHudPrototypeArt.C(r,g,b,a);}
        static Rect ProtoRect(HudProtoRect r){return new Rect(r.X,r.Y,r.Width,r.Height);}
        static bool PrototypePointerOverSlots(Vector3 screenPoint)
        {
            if(prototypeHitLayout==null)prototypeHitLayout=NativeHudPrototypeLayout.Create(NativeHudPrototypeLayout.CurrentMode,1920,1080);
            var point=NativeUiViewport.Pointer(screenPoint);return prototypeHitLayout.HitTest(point.x,point.y)>=0;
        }
        Texture2D OwnPrototypeArt(Texture2D texture){prototypeArtwork.Add(texture);return texture;}
        static RenderTexture PrototypeTarget(string name,int size)
        {
            var result=new RenderTexture(size,size,0,RenderTextureFormat.ARGB32){name=name,filterMode=FilterMode.Bilinear,wrapMode=TextureWrapMode.Clamp};result.Create();return result;
        }
        void EnsurePrototype(float width,float height)
        {
            if(prototypeLayout!=null&&prototypeWidth==width&&prototypeHeight==height)return;
            DisposePrototype();prototypeWidth=width;prototypeHeight=height;
            prototypeSlots=new RenderTexture[13];prototypeArtwork=new List<Texture2D>();prototypeStyles=new Dictionary<int,GUIStyle>();
            var l=NativeHudPrototypeLayout.Create(NativeHudPrototypeLayout.CurrentMode,width,height);
            try{
            // Exact repository faces. Required() reports an absent face; there is no silent font substitution.
            prototypeSemibold=Required<Font>("Art/fonts/Cinzel-600");prototypeRegular=Required<Font>("Art/fonts/Cinzel-400");prototypeBody=Required<Font>("Art/fonts/Hahmlet-300-ko");
            prototypeMaterial=new Material(Required<Shader>("Shaders/HudPrototype"));
            prototypeRail=OwnPrototypeArt(NativeHudPrototypeArt.Rail(l.Rail.Width));
            prototypePlate=OwnPrototypeArt(NativeHudPrototypeArt.Plate(l.Plate.Width,l.Plate.Height,l.Chamfer));
            if(l.Mode==HudPrototypeMode.B)prototypePedestal=OwnPrototypeArt(NativeHudPrototypeArt.Plate(150,100,12));
            prototypeFrame=OwnPrototypeArt(NativeHudPrototypeArt.Frame(l));prototypeEmblem=OwnPrototypeArt(NativeHudPrototypeArt.Emblem());
            prototypeHair=OwnPrototypeArt(NativeHudPrototypeArt.Hair());prototypeChip=OwnPrototypeArt(NativeHudPrototypeArt.Chip());
            prototypeMouseL=OwnPrototypeArt(NativeHudPrototypeArt.Mouse(false));prototypeMouseR=OwnPrototypeArt(NativeHudPrototypeArt.Mouse(true));
            prototypeEyeOn=OwnPrototypeArt(NativeHudPrototypeArt.Eye(true));prototypeEyeOff=OwnPrototypeArt(NativeHudPrototypeArt.Eye(false));prototypeEyeGlow=OwnPrototypeArt(NativeHudPrototypeArt.EyeGlow(l.EyeWidth*1.4f));
            prototypeHp=PrototypeTarget("H1 HP liquid",512);prototypeResources=PrototypeTarget("H1 MP ST liquid",512);
            prototypeShield=PrototypeTarget("H1 shield groove",512);prototypeMobility=PrototypeTarget("H1 mobility groove",512);
            for(int i=0;i<13;i++)prototypeSlots[i]=PrototypeTarget("H1 slot "+i,128);
            // Publish the successful-init marker only after every required asset and owned target exists.
            prototypeLayout=l;
            }catch{DisposePrototype();throw;}
        }
        GUIStyle PrototypeStyle(float size,bool regular=false,bool body=false)
        {
            // Uniform 0.5 scale below gives the exact 10.5px chip size, without horizontal squeezing.
            int pixels=Mathf.RoundToInt(size*2),key=pixels+(regular?1000:0)+(body?2000:0);GUIStyle style;
            if(prototypeStyles.TryGetValue(key,out style))return style;
            style=new GUIStyle(GUI.skin.label){font=body?prototypeBody:regular?prototypeRegular:prototypeSemibold,fontSize=pixels,fontStyle=FontStyle.Normal,alignment=TextAnchor.UpperLeft,wordWrap=false,clipping=TextClipping.Overflow,padding=new RectOffset(),margin=new RectOffset(),contentOffset=Vector2.zero};
            prototypeStyles.Add(key,style);return style;
        }
        float PrototypeTextWidth(string text,float size,float tracking,bool regular=false)
        {
            var style=PrototypeStyle(size,regular);return NativeUiTextRun.Layout(text,tracking*2,g=>style.CalcSize(new GUIContent(g)).x)*.5f;
        }
        void PrototypeText(Rect box,string text,float size,float tracking,Color color,bool regular=false,bool body=false,HudPrototypeShadow shadow=HudPrototypeShadow.None)
        {
            if(string.IsNullOrEmpty(text))return;
            var style=PrototypeStyle(size,regular,body);float total=NativeUiTextRun.Layout(text,tracking*2,g=>style.CalcSize(new GUIContent(g)).x);
            var matrix=GUI.matrix;var oldColor=GUI.color;var oldText=style.normal.textColor;
            try{
                GUI.color=Color.white;GUI.matrix=matrix*Matrix4x4.TRS(new Vector3(box.center.x-total*.25f,box.y,0),Quaternion.identity,new Vector3(.5f,.5f,1));
                if(shadow!=HudPrototypeShadow.None&&Event.current.type==EventType.Repaint){if(prototypeShadows==null)prototypeShadows=new NativeHudPrototypeTextShadow();prototypeShadows.Draw(style,text,tracking*2,total,shadow);}
                NativeUiTextRun.Layout(text,tracking*2,g=>style.CalcSize(new GUIContent(g)).x,(offset,g)=>{
                    float w=style.CalcSize(new GUIContent(g)).x;
                    style.normal.textColor=color;NativeSilverHellUi.Label(new Rect(offset,0,w+2,box.height*2+4),g,style);
                });
            }finally{style.normal.textColor=oldText;GUI.matrix=matrix;GUI.color=oldColor;}
        }
        void PrototypeBlit(RenderTexture target,int mode,Texture source=null)
        {
            var old=RenderTexture.active;prototypeMaterial.SetFloat("_Mode",mode);
            try{Graphics.Blit(source??Texture2D.whiteTexture,target,prototypeMaterial,0);}finally{RenderTexture.active=old;}
        }
        void RefreshPrototypeLiquids(Simulation simulation)
        {
            var l=prototypeLayout;
            prototypeMaterial.SetFloat("_Diameter",l.Liquid);prototypeMaterial.SetFloat("_HpTranslate",hpLevel.Value);
            prototypeMaterial.SetFloat("_Mana",manaLevel.Value);prototypeMaterial.SetFloat("_Stamina",staminaLevel.Value);
            prototypeMaterial.SetFloat("_Hurt",FeelHurtActive?1:0);PrototypeBlit(prototypeHp,0);PrototypeBlit(prototypeResources,1);
            prototypeMaterial.SetFloat("_Diameter",l.Outer);prototypeMaterial.SetFloat("_RingRadius",(l.Liquid/2+1+l.Outer/2-l.Band)/2+l.Band/4);
            prototypeMaterial.SetFloat("_RingFill",(float)values.ShieldRatio);prototypeMaterial.SetFloat("_RingAlpha",(float)values.ShieldAlpha);prototypeMaterial.SetFloat("_RingCell",0);PrototypeBlit(prototypeShield,2);
            prototypeMaterial.SetFloat("_RingFill",MobilityRatio(simulation));prototypeMaterial.SetFloat("_RingAlpha",1);prototypeMaterial.SetFloat("_RingCell",MobilityCellTurn(simulation));PrototypeBlit(prototypeMobility,2);
        }
        bool TryDrawPrototype(float width,float height,string activeAttack,Simulation simulation)
        {
            if(NativeHudPrototypeLayout.CurrentMode==HudPrototypeMode.None)return false;
            if(values==null)return true;
            EnsurePrototype(width,height);ActiveSkill=activeAttack;var l=prototypeLayout;
            var oldColor=GUI.color;
            try{
                GUI.color=Color.white;
                if(Event.current.type==EventType.Repaint)RefreshPrototypeLiquids(simulation);
                NativeUiAudit.Region(ProtoRect(l.LeftFrame),"component","hud-proto-hp","H1 HP");
                NativeUiAudit.Region(ProtoRect(l.RightFrame),"component","hud-proto-resources","H1 MP/ST");
                NativeUiAudit.Region(ProtoRect(l.Plate),"component","hud-proto-skills","H1 skill plate");
                NativeUiAudit.DrawTexture(ProtoRect(l.Rail),prototypeRail,ScaleMode.StretchToFill,true);
                NativeUiAudit.DrawTexture(ProtoRect(l.Plate),prototypePlate,ScaleMode.StretchToFill,true);
                if(prototypePedestal!=null)NativeUiAudit.DrawTexture(ProtoRect(l.Pedestal),prototypePedestal,ScaleMode.StretchToFill,true);
                NativeUiAudit.DrawTexture(ProtoRect(l.Emblem),prototypeEmblem,ScaleMode.StretchToFill,true);
                PrototypeGlobe(false,simulation);PrototypeGlobe(true,simulation);
                for(int i=0;i<13;i++)PrototypeSlot(i,activeAttack,simulation);
                PrototypeStatus(width,simulation);
            }finally{GUI.color=oldColor;}
            return true;
        }
        void PrototypeGlobe(bool right,Simulation simulation)
        {
            var l=prototypeLayout;var frame=right?l.RightFrame:l.LeftFrame;var liquid=right?l.RightLiquid:l.LeftLiquid;
            NativeUiAudit.DrawTexture(ProtoRect(liquid),right?prototypeResources:prototypeHp,ScaleMode.StretchToFill,true);
            NativeUiAudit.DrawTexture(new Rect(frame.X-10,frame.Y-10,frame.Width+20,frame.Height+24),prototypeFrame,ScaleMode.StretchToFill,true);
            if(!right||simulation!=null)NativeUiAudit.DrawTexture(ProtoRect(frame),right?prototypeMobility:prototypeShield,ScaleMode.StretchToFill,true);
            float cx=frame.X+frame.Width/2,eyeY=frame.Y+l.Band/2+1;
            int eyeIndex=right?2:0;
            if(eyes[eyeIndex]||eyes[eyeIndex+1])NativeUiAudit.DrawTexture(new Rect(cx-l.EyeWidth*.7f,eyeY-7,l.EyeWidth*1.4f,14),prototypeEyeGlow,ScaleMode.StretchToFill,true);
            // The socket stays drawn even while its two live poise indicators are off.
            for(int i=0;i<2;i++)NativeUiAudit.DrawTexture(new Rect(cx+(i==0?-6:6)-3,eyeY-3,6,6),eyes[eyeIndex+i]?prototypeEyeOn:prototypeEyeOff,ScaleMode.StretchToFill,true);
            float cy=l.OrbCenterY-4;
            if(!right&&values.HpValid){
                PrototypeText(new Rect(liquid.X,cy-l.HpCurrentFont*.62f,l.Liquid,l.HpCurrentFont),values.HpCurrentText,l.HpCurrentFont,l.HpCurrentFont*.02f,ProtoColor(230,227,220),shadow:HudPrototypeShadow.Resource);
                NativeUiAudit.DrawTexture(new Rect(cx-22,cy+l.HpCurrentFont*.48f,44,1),prototypeHair,ScaleMode.StretchToFill,true);
                PrototypeText(new Rect(liquid.X,cy+l.HpCurrentFont*.48f+5,l.Liquid,l.HpMaximumFont),PrototypeMaximum(values.HpMaximumText),l.HpMaximumFont,l.HpMaximumFont*.04f,ProtoColor(167,164,157),true,shadow:HudPrototypeShadow.Resource);
            }
            if(right){
                if(values.ManaValid)PrototypeResource(liquid,0,"MP",values.ManaCurrentText,values.ManaMaximumText,cy);
                if(values.StaminaValid)PrototypeResource(liquid,1,"ST",values.StaminaCurrentText,values.StaminaMaximumText,cy);
            }
        }
        void PrototypeResource(HudProtoRect liquid,int side,string label,string current,string maximumText,float cy)
        {
            var l=prototypeLayout;float x=liquid.X+side*l.Liquid/2,w=l.Liquid/2,f=l.ResourceCurrentFont;
            PrototypeText(new Rect(x,cy-f*.62f-16,w,10),label,10,2.4f,ProtoColor(167,164,157),shadow:HudPrototypeShadow.Resource);
            PrototypeText(new Rect(x,cy-f*.62f,w,f),current,f,f*.02f,ProtoColor(230,227,220),shadow:HudPrototypeShadow.Resource);
            NativeUiAudit.DrawTexture(new Rect(x+w/2-14,cy+f*.48f,28,1),prototypeHair,ScaleMode.StretchToFill,true);
            PrototypeText(new Rect(x,cy+f*.48f+4,w,l.ResourceMaximumFont),PrototypeMaximum(maximumText),l.ResourceMaximumFont,l.ResourceMaximumFont*.04f,ProtoColor(167,164,157),true,shadow:HudPrototypeShadow.Resource);
        }
        static string PrototypeMaximum(string text){return text==null?null:text.TrimStart(' ','/');}
        void PrototypeSlot(int index,string activeAttack,Simulation simulation)
        {
            var l=prototypeLayout;Rect r=ProtoRect(l.Slot(index));
            string id=index==6?(activeAttack=="kiSlash"?"kiSlash":null):simulation==null?null:SlotSkillId(simulation,index);
            Texture2D artwork=null;
            if(id!=null&&!slotIcons.TryGetValue(id,out artwork)){artwork=Resources.Load<Texture2D>("Art/ui/skill_icons/orb/"+id);slotIcons[id]=artwork;}
            float total=0,cd=id!=null&&simulation!=null?simulation.SkillCooldown(id,out total):0;
            float rage=index==12&&simulation!=null?RageFill(simulation.Rage,simulation.RageMaximum):0;
            if(Event.current.type==EventType.Repaint){
                prototypeMaterial.SetFloat("_Diameter",r.width);prototypeMaterial.SetFloat("_HasIcon",artwork!=null?1:0);
                prototypeMaterial.SetFloat("_Selected",index==6&&activeAttack=="kiSlash"?1:0);
                prototypeMaterial.SetFloat("_Cooldown",total>0?Mathf.Clamp01(cd/total):0);prototypeMaterial.SetFloat("_Rage",rage);
                PrototypeBlit(prototypeSlots[index],3,artwork);
                if(index==6&&artwork!=null)IconDrawn=true;
            }
            NativeUiAudit.DrawTexture(r,prototypeSlots[index],ScaleMode.StretchToFill,true);
            if(cd>0&&total>0){float font=Mathf.Round(r.width*.36f);PrototypeText(new Rect(r.x,r.center.y-font*.5f,r.width,font),Mathf.CeilToInt(cd/60).ToString(),font,0,ProtoColor(230,227,220),shadow:HudPrototypeShadow.Cooldown);}
            if(rage>0){float font=Mathf.Round(r.width*.24f);PrototypeText(new Rect(r.x,r.y+Mathf.Round(r.width*.12f),r.width,font),Math.Truncate(simulation.Rage).ToString("0")+"%",font,0,ProtoColor(230,227,220),shadow:HudPrototypeShadow.Cooldown);}
            if(index==8&&simulation!=null){
                float ratio=MobilityRatio(simulation);Rect gauge=new Rect(r.x+r.width*.2f,r.yMax-6,r.width*.6f,2);
                PrototypeFill(gauge,ProtoColor(44,46,49,.95f));gauge.width*=ratio;PrototypeFill(gauge,ratio<.5f?ProtoColor(194,26,16):ProtoColor(201,199,195));
            }
            PrototypeKey(index,r,artwork!=null);
            if(NativeSilverHellUi.Button(r,"",GUIStyle.none)){statusSelectionUntil=index==6?Time.unscaledTime+1.6f:0;SlotSelected?.Invoke(index);}
        }
        void PrototypeKey(int index,Rect slot,bool full)
        {
            bool mouse=index==6||index==7;string label=NativeHudPrototypeLayout.KeyLabels[index];
            float w=mouse?19:Mathf.Max(17,PrototypeTextWidth(label,10.5f,.63f)+10);
            Rect chip=new Rect(slot.center.x-w/2,slot.yMax-8,w,15);
            // Fixed borders/corners; only the center of the 2x chip texture stretches.
            NativeSilverHellUi.Slice(chip,prototypeChip,4,4,2,2,true);
            if(mouse)NativeUiAudit.DrawTexture(new Rect(chip.center.x-4.5f,chip.y+2,9,11),index==6?prototypeMouseL:prototypeMouseR,ScaleMode.StretchToFill,true);
            else PrototypeText(new Rect(chip.x+5,chip.y+1,chip.width-10,13),label,10.5f,.63f,full?ProtoColor(167,164,157):ProtoColor(107,105,100));
        }
        static void PrototypeFill(Rect r,Color color)
        {
            var old=GUI.color;try{GUI.color=QualitySettings.activeColorSpace==ColorSpace.Linear?color.linear:color;NativeUiAudit.DrawTexture(r,Texture2D.whiteTexture);}finally{GUI.color=old;}
        }
        void PrototypeStatus(float width,Simulation simulation)
        {
            if(simulation==null)return;
            var l=prototypeLayout;Rect active=ProtoRect(l.Slot(6));
            if(!StatusShouldDisplay(active.Contains(Event.current.mousePosition),simulation.Player.KiChargeActive,Time.unscaledTime<statusSelectionUntil))return;
            string name=simulation.Config.ActiveAttack=="kiSlash"?"기검참":"기본 무기";
            string text=name+" · ST "+SkillUiState.StaminaCost(simulation)+" · "+SkillUiState.Status(simulation)+" [K]";
            var style=PrototypeStyle(14,false,true);float w=Mathf.Max(360,style.CalcSize(new GUIContent(text)).x*.5f+12),y=(l.Mode==HudPrototypeMode.B?l.Pedestal.Y:l.Plate.Y)-45;
            NativeSilverHellUi.ActionPlate(new Rect(width/2-w/2-10,y-8,w+20,36),false,0,false,20,4);
            PrototypeText(new Rect(width/2-w/2,y,w,20),text,14,0,ProtoColor(167,164,157),false,true);
            if(simulation.Player.KiChargeActive){Rect gauge=new Rect(width/2-80,y-4,160,2);PrototypeFill(gauge,ProtoColor(44,46,49,.8f));gauge.width*=Mathf.Clamp01(simulation.Player.KiChargeTicks/120);PrototypeFill(gauge,ProtoColor(201,199,195,.9f));}
        }
        void DisposePrototype()
        {
            if(prototypeArtwork==null)return;
            if(prototypeShadows!=null){prototypeShadows.Dispose();prototypeShadows=null;}
            foreach(var texture in prototypeArtwork)if(texture!=null)Release(texture);prototypeArtwork.Clear();
            DisposePrototypeTarget(ref prototypeHp);DisposePrototypeTarget(ref prototypeResources);DisposePrototypeTarget(ref prototypeShield);DisposePrototypeTarget(ref prototypeMobility);
            for(int i=0;i<prototypeSlots.Length;i++)DisposePrototypeTarget(ref prototypeSlots[i]);
            if(prototypeMaterial!=null)Release(prototypeMaterial);prototypeMaterial=null;prototypeLayout=null;prototypePedestal=null;prototypeStyles.Clear();prototypeArtwork=null;prototypeSlots=null;prototypeStyles=null;
        }
        static void DisposePrototypeTarget(ref RenderTexture texture){if(texture==null)return;texture.Release();Release(texture);texture=null;}
    }
}
