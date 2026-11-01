using System;
using System.Reflection;
using Exoduser.UnityPort.Core;

static class Program
{
    static int checks;
    static void Check(bool ok, string text) { if(!ok)throw new Exception(text); checks++; }
    static int Legacy(EnemyState e,PlayerState p,bool moving) {
        double a=e.Facing;if(!moving&&p.Hp>0&&Math.Sqrt((p.X-e.X)*(p.X-e.X)+(p.Y-e.Y)*(p.Y-e.Y))<800)a=Math.Atan2(p.Y-e.Y,p.X-e.X);
        return ((int)Math.Floor(a/(Math.PI/4)+.5)%8+8)%8;
    }
    static int Main()
    {
        try {
            var e=new EnemyState { X=100,Y=100,Facing=0,Web=new EnemySpawn { facing=Math.PI } };
            var p=new PlayerState { X=0,Y=100,Hp=100 };
            Check(Legacy(e,p,true)==0&&Legacy(e,p,false)==4,"reproduce installed moving/idle east-west writer conflict");
            var type=typeof(Program).Assembly.GetType("Exoduser.UnityPort.NativeEnemyVisualFacing");
            Check(type!=null,"MISSING stable visual-facing selector");
            var method=type.GetMethod("Direction");
            Func<int> select=()=> (int)method.Invoke(null,new object[]{e,p});
            for(int i=0;i<100;i++) { e.X=100+(i%2==0?.0001f:-.0001f);Check(select()==4,"small collision displacement keeps player look-at"); }
            e.X=e.Y=0;
            p.X=100;p.Y=0;Check(select()==0,"player passes to east: immediate east");
            p.X=0;p.Y=100;Check(select()==2,"player passes in front: immediate south");
            p.X=-100;p.Y=0;Check(select()==4,"player crosses to west: immediate west");
            p.X=0;p.Y=-100;Check(select()==6,"player north: north");
            for(int i=0;i<100;i++){e.X=i%2==0?.00001f:-.00001f;Check(select()==6,"vertical approach tolerates horizontal sign noise");}
            e.X=0;p.X=100;p.Y=0;
            e.State="attack";e.Web.facing=Math.PI/2;
            Check(select()==0,"ordinary attack preserves web nearby-player visual look-at");
            Check(e.State=="attack"&&e.Facing==0&&e.Web.facing==Math.PI/2,"view selection never changes combat state or either simulation facing");
            p.X=900;e.Web.facing=Math.PI;
            Check(select()==4,"outside look-at radius reads live Web facing instead of stale snapshot");
            p.X=10;p.Hp=0;Check(select()==4,"fallen player does not overwrite facing");
            e.Web=null;e.Facing=(float)(-Math.PI/2);Check(select()==6,"practice and non-Web enemies retain current facing fallback");
            p.Hp=100;p.X=0;p.Y=0;Check(select()==6,"coincident target keeps facing instead of arbitrary atan2 zero");
            for(int i=0;i<8;i++){e.Facing=(float)(i*Math.PI/4);p.Hp=0;Check(select()==i,"eight-direction atlas ordering "+i);}
            Console.WriteLine("ENEMY_VISUAL_FACING PASS "+checks+" checks; standalone only");return 0;
        } catch(Exception ex) { Console.Error.WriteLine("ENEMY_VISUAL_FACING FAIL after "+checks+": "+ex.Message);return 1; }
    }
}
