using System;
using System.Globalization;

namespace Exoduser.UnityPort.Core
{
    // Development-only coordinates. Combat distances, arena and RNG stay unchanged.
    public sealed class FieldLayout
    {
        public static readonly FieldLayout Original = new FieldLayout(1, false);
        public readonly double Scale;
        public readonly bool AreaEnemies;
        public bool IsOriginal { get { return Scale == 1; } }
        FieldLayout(double scale, bool area) { Scale=scale; AreaEnemies=area; }
        public static FieldLayout Create(double scale, bool area)
        {
            if(double.IsNaN(scale)||double.IsInfinity(scale)||scale<1||scale>2)
                throw new ArgumentOutOfRangeException(nameof(scale),"Field scale must be finite and between 1 and 2");
            return scale==1&&!area?Original:new FieldLayout(scale,area);
        }
        public static FieldLayout FromArguments(string[] args)
        {
            double scale=1;bool area=false;
            for(int i=0;i<args.Length;i++) {
                if(args[i]=="--field-scale") {
                    if(++i>=args.Length||!double.TryParse(args[i],NumberStyles.Float,CultureInfo.InvariantCulture,out scale))throw new ArgumentException("Invalid --field-scale");
                } else if(args[i]=="--field-enemies") {
                    if(++i>=args.Length||(args[i]!="keep"&&args[i]!="area"))throw new ArgumentException("Invalid --field-enemies");
                    area=args[i]=="area";
                }
            }
            return Create(scale,area);
        }
        public double Coordinate(double value) { return value*Scale; }
        // Cumulative rounding apportions the exact area total without extra RNG draws.
        public int PlannedCount(int count, int before)
        {
            if(!AreaEnemies)return count;
            double area=Scale*Scale;
            return (int)Math.Round((before+count)*area,MidpointRounding.AwayFromZero)-(int)Math.Round(before*area,MidpointRounding.AwayFromZero);
        }
    }
}
