using System;
using System.Reflection;

static class Program
{
    static int checks;
    static void Check(bool ok,string name){if(!ok)throw new Exception(name);checks++;}
    static void Near(double value,double expected,string name){Check(Math.Abs(value-expected)<.00002,name+": "+value);}
    static int Main()
    {
        try {
            var t=typeof(Program).Assembly.GetType("Exoduser.UnityPort.NativeGroundSkillGeometry");
            Check(t!=null,"MISSING terrain-conforming ground skill placement");
            var place=t.GetMethod("Place");
            Func<float,float,float,float,double,Func<float,float,float>,float,object> p=(x,y,dx,dy,a,h,lift)=>place.Invoke(null,new object[]{x,y,dx,dy,a,h,lift});
            Func<object,string,double> read=(o,n)=>Convert.ToDouble(o.GetType().GetField(n).GetValue(o));
            Func<float,float,float> flat=(x,z)=>5;
            var v=p(120,340,0,0,0,flat,.025f);
            Near(read(v,"X"),1.2,"Core X to metres");Near(read(v,"Z"),-3.4,"Core Y to world Z");Near(read(v,"Y"),5.025,"height uses surface, no sprite foot lift");
            Func<float,float,float> slope=(x,z)=>.5f*x+.25f*z;
            for(int j=0;j<=16;j++)for(int i=0;i<=16;i++) {
                float dx=(i/16f-.5f)*3.5f,dy=(j/16f-.5f)*3.5f;
                v=p(120,340,dx,dy,.7,slope,.025f);
                double x=read(v,"X"),z=read(v,"Z");
                Near(read(v,"Y"),.5*x+.25*z+.025,"every grid vertex follows slope");
                Near(Math.Sqrt(Math.Pow(x-1.2,2)+Math.Pow(z+3.4,2)),Math.Sqrt(dx*dx+dy*dy),"rotation preserves radius");
            }
            v=p(0,0,2,0,Math.PI/2,flat,.025f);Near(read(v,"X"),0,"rotated ground X");Near(read(v,"Z"),2,"rotation is in ground XZ");Near(read(v,"Y"),5.025,"rotation never raises effect into air");
            for(int i=0;i<72;i++) {
                double a=i*Math.PI*2/72;v=p(0,0,(float)(Math.Cos(a)*1.75),(float)(Math.Sin(a)*1.75),0,slope,.03f);
                Near(read(v,"Y"),.5*read(v,"X")+.25*read(v,"Z")+.03,"ring follows surface per point");
            }
            Func<float,float,float> bridge=(x,z)=>Math.Abs(x)<.3&&Math.Abs(z)<1?2:0;
            v=p(0,0,0,0,0,bridge,.025f);Near(read(v,"Y"),2.025,"walkable bridge top sampled");
            v=p(0,0,1,0,0,bridge,.025f);Near(read(v,"Y"),.025,"surrounding ground sampled separately");
            Console.WriteLine("GROUND_SKILL PASS "+checks+" checks; pure geometry, not Unity Player");return 0;
        } catch(Exception e){Console.Error.WriteLine("GROUND_SKILL FAIL after "+checks+": "+e.Message);return 1;}
    }
}
