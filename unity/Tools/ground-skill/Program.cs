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
            var tess=t.GetMethod("Tessellate");Check(tess!=null,"MISSING triangle-interior terrain contact at actual skill sizes");
            Func<object,string,object> field=(o,n)=>o.GetType().GetField(n).GetValue(o);
            Func<float,float,float> curved=(x,z)=>.35f*(float)Math.Sin(x*2.7)+.22f*(float)Math.Cos(z*3.1)+.3f*(float)Math.Sin(x*z*.4);
            Func<float,float,float> deck=(x,z)=>Math.Abs(x)<1.37&&Math.Abs(z)<3.11?1.4f+.03f*z:curved(x,z);
            Func<float,float,float> root=(x,z)=>curved(x,z)+(float)(.7*Math.Max(0,1-Math.Abs(x+.23)/.17));
            foreach(var ground in new[]{flat,slope,curved,deck,root})foreach(float diameter in new[]{1.12f,6f,10.4f,11.7f,18f}) {
                var clock=System.Diagnostics.Stopwatch.StartNew();
                object data=tess.Invoke(null,new object[]{0f,0f,-diameter/2,-diameter/2,diameter,diameter,.37,ground});
                long buildMs=clock.ElapsedMilliseconds;var vv=(Array)field(data,"Vertices");var tri=(int[])field(data,"Triangles");double area=0,worst=0;int large=0;
                Check(tri.Length>0&&tri.Length%3==0,"nonempty terrain footprint");
                for(int k=0;k<tri.Length;k+=3) {
                    var a=vv.GetValue(tri[k]);var b=vv.GetValue(tri[k+1]);var c=vv.GetValue(tri[k+2]);
                    double ax=read(a,"X"),az=read(a,"Z"),ay=read(a,"Y"),bx=read(b,"X"),bz=read(b,"Z"),by=read(b,"Y"),cx=read(c,"X"),cz=read(c,"Z"),cy=read(c,"Y");
                    area+=Math.Abs((bx-ax)*(cz-az)-(cx-ax)*(bz-az))*.5;
                    // Independent barycentric positions, distinct from the refinement probes.
                    for(int n=0;n<11;n++) {
                        double u=(n*.61803398875+.137)%1,w=(n*.41421356237+.281)%1;if(u+w>1){u=1-u;w=1-w;}
                        double x=ax+(bx-ax)*u+(cx-ax)*w,z=az+(bz-az)*u+(cz-az)*w;
                        double error=Math.Abs(ay+(by-ay)*u+(cy-ay)*w-ground((float)x,(float)z)-.025);
                        worst=Math.Max(worst,error);if(error>.02){large++;if(large<3)Console.WriteLine("BAD "+diameter+" at="+x+","+z+" tri="+ax+","+az+" / "+bx+","+bz+" / "+cx+","+cz+" error="+error);}
                    }
                }
                Check(area/(diameter*diameter)>.98,"preserve at least 98 percent footprint at support discontinuities");
                Check(large==0,"triangle interior exceeds 2cm contact: "+worst+" count="+large);
                Console.WriteLine("SURFACE diameter="+diameter+" vertices="+vv.Length+" triangles="+tri.Length/3+" coverage="+(area/(diameter*diameter)).ToString("F6")+" worst="+worst.ToString("F6")+" buildMs="+buildMs+" totalMs="+clock.ElapsedMilliseconds);
            }
            var mapping=t.GetMethod("TextureMap");Check(mapping!=null,"MISSING independent texture rotation on cached terrain surface");
            var extentMethod=t.GetMethod("FootprintExtent");
            float left=-2.7f,bottom=-1.3f,width=6.2f,height=4.1f;
            double extent=Convert.ToDouble(extentMethod.Invoke(null,new object[]{left,bottom,width,height}));
            for(int frame=0;frame<40;frame++)foreach(bool fx in new[]{false,true})foreach(bool fy in new[]{false,true}) {
                double angle=frame*.137;var map=mapping.Invoke(null,new object[]{left,bottom,width,height,angle,fx,fy});
                foreach(var corner in new[]{new[]{0f,0f},new[]{1f,0f},new[]{0f,1f},new[]{1f,1f},new[]{.37f,.63f}}) {
                    var pos=p(0,0,left+width*corner[0],bottom+height*corner[1],angle,flat,.025f);
                    double x=read(pos,"X"),z=read(pos,"Z");
                    Near(read(map,"Ux")*x+read(map,"Uz")*z+read(map,"Uo"),fx?1-corner[0]:corner[0],"texture U follows original animated rotation/flip");
                    Near(read(map,"Vx")*x+read(map,"Vz")*z+read(map,"Vo"),fy?1-corner[1]:corner[1],"texture V follows original animated rotation/flip");
                    Check(Math.Sqrt(x*x+z*z)<=extent+.00001,"cached terrain covers all rotating footprint corners");
                }
            }
            Console.WriteLine("GROUND_SKILL PASS "+checks+" checks; pure geometry, not Unity Player");return 0;
        } catch(Exception e){Console.Error.WriteLine("GROUND_SKILL FAIL after "+checks+": "+e.Message);return 1;}
    }
}
