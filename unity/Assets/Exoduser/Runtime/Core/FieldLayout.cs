using System;
using System.Globalization;

namespace Exoduser.UnityPort.Core
{
    // Development-only coordinates. Combat distances, arena and RNG stay unchanged.
    public sealed class FieldLayout
    {
        public static readonly FieldLayout Original = new FieldLayout(1, "keep", 1);
        public readonly double Scale;
        public readonly bool AreaEnemies;
        public readonly string EnemyMode;
        public readonly double EnemyMultiplier;
        public bool CustomEnemyCounts { get { return EnemyMode != "keep"; } }
        public bool IsOriginal { get { return Scale == 1; } }
        FieldLayout(double scale, string mode, double multiplier) { Scale=scale; EnemyMode=mode; AreaEnemies=mode=="area"; EnemyMultiplier=multiplier; }
        public static FieldLayout Create(double scale, bool area)
        {
            if(double.IsNaN(scale)||double.IsInfinity(scale)||scale<1||scale>2)
                throw new ArgumentOutOfRangeException(nameof(scale),"Field scale must be finite and between 1 and 2");
            return scale==1&&!area?Original:new FieldLayout(scale,area?"area":"keep",area?scale*scale:1);
        }
        public static FieldLayout FromArguments(string[] args)
        {
            double scale=1;string mode="keep";
            for(int i=0;i<args.Length;i++) {
                if(args[i]=="--field-scale") {
                    if(++i>=args.Length||!double.TryParse(args[i],NumberStyles.Float,CultureInfo.InvariantCulture,out scale))throw new ArgumentException("Invalid --field-scale");
                } else if(args[i]=="--field-enemies") {
                    if(++i>=args.Length)throw new ArgumentException("Invalid --field-enemies");
                    mode=args[i];
                }
            }
            var legacy=Create(scale,mode=="area"); // preserves validation and the k=1 default singleton
            if(mode=="keep"||mode=="area")return legacy;
            double multiplier;
            if(mode=="linear")multiplier=scale;
            else if(!double.TryParse(mode,NumberStyles.Float,CultureInfo.InvariantCulture,out multiplier)||
                double.IsNaN(multiplier)||double.IsInfinity(multiplier)||multiplier<1||multiplier>2)
                throw new ArgumentException("Invalid --field-enemies (keep, area, linear or multiplier 1..2)");
            return new FieldLayout(scale,mode=="linear"?mode:multiplier.ToString(CultureInfo.InvariantCulture),multiplier);
        }
        public double Coordinate(double value) { return value*Scale; }
        // Cumulative rounding apportions the exact total without extra RNG draws.
        public int PlannedCount(int count, int before)
        {
            if(!CustomEnemyCounts)return count;
            return (int)Math.Round((before+count)*EnemyMultiplier,MidpointRounding.AwayFromZero)-(int)Math.Round(before*EnemyMultiplier,MidpointRounding.AwayFromZero);
        }
    }
}
