using System;

namespace Exoduser.UnityPort
{
    // U1 8af73fc3a: mock_A/B.html:16-21 and _hud_mock.js:43-70.
    // Pure design pixels; NativeUiViewport applies the existing uniform 1920x1080 transform.
    public enum HudPrototypeMode { None, A, B, C }
    public struct HudProtoRect
    {
        public readonly float X,Y,Width,Height;
        public HudProtoRect(float x,float y,float w,float h){X=x;Y=y;Width=w;Height=h;}
        public float Right {get{return X+Width;}}
        public float Bottom {get{return Y+Height;}}
        public bool Contains(float x,float y){return x>=X&&x<Right&&y>=Y&&y<Bottom;}
    }
    public sealed class NativeHudPrototypeLayout
    {
        // Explicit CLI only. A missing, malformed or ambiguous argument never enables a prototype.
        public static HudPrototypeMode Parse(string[] args)
        {
            if(args==null)return HudPrototypeMode.None;
            const string prefix="--hud-proto=";int count=0;HudPrototypeMode mode=HudPrototypeMode.None;
            foreach(var arg in args){if(arg==null||!arg.StartsWith(prefix,StringComparison.OrdinalIgnoreCase))continue;
                count++;string value=arg.Substring(prefix.Length);
                mode=string.Equals(value,"a",StringComparison.OrdinalIgnoreCase)?HudPrototypeMode.A:
                    string.Equals(value,"b",StringComparison.OrdinalIgnoreCase)?HudPrototypeMode.B:
                    string.Equals(value,"c",StringComparison.OrdinalIgnoreCase)?HudPrototypeMode.C:HudPrototypeMode.None;}
            return count==1?mode:HudPrototypeMode.None;
        }
        // Initialized once, without loading art, fonts, materials or textures on the legacy path.
        public static readonly HudPrototypeMode CurrentMode=Parse(Environment.GetCommandLineArgs());
        public readonly HudPrototypeMode Mode;
        public readonly float Outer,Liquid,Band,EyeWidth,Chamfer,OrbCenterY,RowWidth,SlotInk,HpCurrentFont,HpMaximumFont,ResourceCurrentFont,ResourceMaximumFont;
        public readonly HudProtoRect Plate,Pedestal,Rail,LeftFrame,RightFrame,LeftLiquid,RightLiquid,Emblem;
        readonly HudProtoRect[] slots=new HudProtoRect[13];
        public static readonly string[] KeyLabels={"1","2","3","4","F","Z",null,null,"SHFT","E","Q","CTRL","SPC"};
        public static NativeHudPrototypeLayout Create(HudPrototypeMode mode,float width,float height){return new NativeHudPrototypeLayout(mode,width,height);}
        NativeHudPrototypeLayout(HudPrototypeMode mode,float width,float height)
        {
            if(mode!=HudPrototypeMode.A&&mode!=HudPrototypeMode.B&&mode!=HudPrototypeMode.C)throw new ArgumentException("A, B or C prototype required",nameof(mode));
            if(mode==HudPrototypeMode.C){
                // H4: A slot rhythm plus the existing source frame's 263:175 registration.
                Mode=mode;Liquid=156;Outer=Liquid*263/175;Band=17;EyeWidth=30;Chamfer=12;
                HpCurrentFont=26;HpMaximumFont=13;ResourceCurrentFont=18;ResourceMaximumFont=11;
                RowWidth=665;SlotInk=572;float baseC=height-14,scale=Liquid/175,radiusC=Outer/2;
                Plate=new HudProtoRect(width/2-354.5f,baseC-74,709,74);
                OrbCenterY=baseC+6-radiusC;
                float leftC=Plate.X-radiusC+17,rightC=Plate.Right+radiusC-17;
                LeftFrame=new HudProtoRect(leftC-135.5f*scale,OrbCenterY-radiusC,Outer,Outer);
                RightFrame=new HudProtoRect(rightC-135.5f*scale,OrbCenterY-radiusC,Outer,Outer);
                LeftLiquid=new HudProtoRect(leftC-78,OrbCenterY-78,156,156);
                RightLiquid=new HudProtoRect(rightC-78,OrbCenterY-78,156,156);
                Rail=new HudProtoRect(leftC-radiusC+18,baseC,rightC-leftC+Outer-36,14);
                float rowC=Plate.X+22;
                for(int i=0;i<13;i++){
                    if(i>0)rowC+=(i==4||i==6||i==8)?16:5;
                    slots[i]=new HudProtoRect(rowC,Plate.Y+8,44,44);rowC+=44;
                }
                // No B lift. Support both actual mouse slots and their chips, with eight px side margins.
                Pedestal=new HudProtoRect(slots[6].X-8,Plate.Y,slots[7].Right-slots[6].X+16,Plate.Height);
                Emblem=new HudProtoRect(Pedestal.X+(Pedestal.Width-110)/2,Plate.Y-31*.86f,110,31);
                return;
            }
            Mode=mode;bool b=mode==HudPrototypeMode.B;Outer=b?212:190;Liquid=b?176:156;Band=b?18:17;EyeWidth=b?34:30;Chamfer=b?14:12;
            HpCurrentFont=b?30:26;HpMaximumFont=b?14:13;ResourceCurrentFont=b?20:18;ResourceMaximumFont=b?12:11;
            float radius=Outer/2,baseY=height-14,overlap=b?16:14,pad=b?20:22,plateH=b?84:74;
            OrbCenterY=baseY+4-radius;float x=0,ink=0;
            for(int i=0;i<13;i++){if(i>0)x+=(i==4||i==6||i==8)?(b?14:16):5;float d=b?(i==6||i==7?56:48):44;slots[i]=new HudProtoRect(x,0,d,d);x+=d;ink+=d;}
            RowWidth=x;SlotInk=ink;float plateW=x+pad*2,plateX=(width-plateW)/2,plateY=baseY-plateH;
            Plate=new HudProtoRect(plateX,plateY,plateW,plateH);
            Pedestal=b?new HudProtoRect(width/2-75,plateY-16,150,100):new HudProtoRect();
            Emblem=new HudProtoRect(width/2-11,(b?Pedestal.Y:plateY)-11,22,22);
            float leftCenter=plateX-radius+overlap,rightCenter=plateX+plateW+radius-overlap;
            LeftFrame=new HudProtoRect(leftCenter-radius,OrbCenterY-radius,Outer,Outer);
            RightFrame=new HudProtoRect(rightCenter-radius,OrbCenterY-radius,Outer,Outer);
            LeftLiquid=new HudProtoRect(leftCenter-Liquid/2,OrbCenterY-Liquid/2,Liquid,Liquid);
            RightLiquid=new HudProtoRect(rightCenter-Liquid/2,OrbCenterY-Liquid/2,Liquid,Liquid);
            // Actual mock JS rail is inset18 from the nominal orb edges; layout_3840.svg is a schematic.
            Rail=new HudProtoRect(LeftFrame.X+18,baseY,RightFrame.Right-LeftFrame.X-36,14);
            float rowX=(width-x)/2,cy=plateY+(b?36:30);
            for(int i=0;i<13;i++){var r=slots[i];float lift=b&&(i==6||i==7)?8:0;slots[i]=new HudProtoRect(rowX+r.X,cy-lift-r.Height/2,r.Width,r.Height);}
        }
        public HudProtoRect Slot(int index){return slots[index];}
        public float ChipTop(int index){return slots[index].Bottom-8;}
        public int HitTest(float x,float y){for(int i=0;i<slots.Length;i++)if(slots[i].Contains(x,y))return i;return -1;}
    }
}
