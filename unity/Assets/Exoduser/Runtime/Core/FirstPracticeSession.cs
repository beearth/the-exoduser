namespace Exoduser.UnityPort.Core
{
    // Keep the complete live world object, rather than a partial field snapshot.
    public sealed class FirstPracticeSession
    {
        public readonly Simulation Original,Arena;
        public bool Ended {get;private set;}
        public FirstPracticeSession(Simulation original,SimulationConfig arenaConfig)
        {
            if(object.ReferenceEquals(original.Config,arenaConfig))throw new System.ArgumentException("Arena requires an independent config.");
            Original=original;Arena=new Simulation(arenaConfig,SourceStarterFixture.Seed);PrepareTick();
        }
        public void PrepareTick()
        {
            Arena.Player.Hp=Original.Player.Hp;Arena.Player.Shield=Original.Player.Shield;
            Arena.Player.Mana=Arena.Player.MaxMana;Arena.Player.Stamina=Arena.Player.MaxStamina;
            Arena.Player.Iframes=0;Arena.Player.KnockbackX=Arena.Player.KnockbackY=0;
        }
        public Simulation End(){Ended=true;return Original;}
    }
}
