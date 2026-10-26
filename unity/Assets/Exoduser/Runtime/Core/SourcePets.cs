using System;

namespace Exoduser.UnityPort.Core
{
    // Source game.html 9243-9270, 30800, 41422-41541. No combat/storage writes.
    public sealed class SourcePet
    {
        public double X,Y,T,Dx,Dy;
        public bool Moving;
        public int Direction {
            get { if(Dx==0&&Dy==0)return 2;
                return ((int)Math.Floor(Math.Atan2(Dy,Dx)/(Math.PI/4)+.5)%8+8)%8; }
        }
    }

    public sealed class SourcePets
    {
        public readonly SourcePet Crow=new SourcePet(), Cat=new SourcePet(), Xbow=new SourcePet(), Iris=new SourcePet();
        public bool IrisOff;
        public int IrisSize=20;
        public const int IrisGlow=250;
        EnemyState irisTarget;
        public EnemyState IrisTarget => irisTarget;
        int targetTicks;
        public void Reset(float x,float y,int catPhase)
        {
            Set(Crow,x,y-20,0);Set(Cat,x,y+10,catPhase);Set(Xbow,x-30,y-28,25);Set(Iris,x+20,y-34,50);
            irisTarget=null;targetTicks=0;IrisOff=false;IrisSize=20;
        }
        static void Set(SourcePet p,double x,double y,int t){p.X=x;p.Y=y;p.T=t;p.Dx=p.Dy=0;p.Moving=false;}
        static void Follow(SourcePet p,double x,double y,double tx,double ty,double speed,double ux,double uy)
        {
            double dx=tx-p.X,dy=ty-p.Y,d=Math.Sqrt(dx*dx+dy*dy);p.Dx=dx;p.Dy=dy;p.Moving=d>5;
            if(d>3){double s=Math.Min(speed,d*.12);p.X+=dx/d*s;p.Y+=dy/d*s;}else{p.X=tx;p.Y=ty;}
            dx=p.X-x;dy=p.Y-y;if(dx*dx+dy*dy>520*520){p.X=x+ux;p.Y=y+uy;}
        }
        public void Tick(Simulation simulation)
        {
            var p=simulation.Player;Crow.T++;Cat.T++;Xbow.T++;
            Follow(Crow,p.X,p.Y,p.X+Math.Cos(Crow.T*.025)*38,p.Y-22+Math.Sin(Crow.T*.035)*10,22,-24,-18);
            Follow(Cat,p.X,p.Y,p.X+Math.Cos(Cat.T*.018)*28,p.Y+32+Math.Sin(Cat.T*.022)*4,24,18,10);
            Follow(Xbow,p.X,p.Y,p.X+Math.Cos(Xbow.T*.02+Math.PI)*44,p.Y-28+Math.Sin(Xbow.T*.03+1.5)*8,18,-30,-28);
            if(IrisOff)return;
            Iris.T++;targetTicks++;
            if(irisTarget==null||!irisTarget.Alive||targetTicks%10==0){
                double best=800*800;irisTarget=null;
                foreach(var e in simulation.Enemies){if(!e.Alive)continue;double dx=e.X-p.X,dy=e.Y-p.Y,d=dx*dx+dy*dy;if(d<best){best=d;irisTarget=e;}}
            }
            if(irisTarget!=null&&irisTarget.Alive){
                double a=Iris.T*.03,tx=irisTarget.X+Math.Cos(a)*20,ty=irisTarget.Y-irisTarget.Radius-15+Math.Sin(a)*8;
                if(irisTarget.X>10||irisTarget.Y>10){Iris.X+=(tx-Iris.X)*.12;Iris.Y+=(ty-Iris.Y)*.12;}
            }else{double a=Iris.T*.02;Iris.X+=(p.X+Math.Cos(a)*55-Iris.X)*.15;Iris.Y+=(p.Y+Math.Sin(a)*55-Iris.Y)*.15;}
        }
        // Atan2 directions: E,SE,S,SW,W,NW,N,NE (source mapping, including NE->SW).
        public static int CatRunGroup(int direction){return direction==0||direction==4?2:direction==2||direction==6?0:1;}
        public static int CatIdleGroup(int direction){return direction==0||direction==1||direction==3||direction==4?1:0;}
        public static bool CatRunFlip(int direction){return direction==0||direction==1||direction==7;}
        public static bool CatIdleFlip(int direction){return direction==0||direction==1||direction==7;}
    }
    public sealed partial class Simulation
    {
        // Exact admitted hurtE/hurtP entry counters. Lesson actors bypass these in source.
        public int PetAttackCount {get;private set;}
        public int PetHitCount {get;private set;}
        public bool PetLessonActive;
        public event Action<Simulation> PetKilled;
    }
}
