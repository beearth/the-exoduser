using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeBossView
    {
        struct ContactLight { public double X, Y; public int Born, Width, Life; }
        readonly List<ContactLight> druidContacts = new List<ContactLight>();
        internal int ActiveDruidContacts { get { return druidContacts.Count; } }

        internal void DruidContact(NativeDruidImpactClock.Contact contact, int tick)
        {
            if (contact.DrawHit) AddContact(contact.X, contact.Y, contact.Width, contact.Life, tick);
            if (contact.Slam) AddContact(contact.TipX, contact.TipY, 72, 8, tick);
        }

        void AddContact(double x, double y, int width, int life, int tick)
        {
            if (druidContacts.Count >= 4) druidContacts.RemoveAt(0);
            druidContacts.Add(new ContactLight { X = x, Y = y, Width = width, Life = life, Born = tick });
        }

        void DrawDruidContacts(int tick)
        {
            for (int i = 0; i < druidContacts.Count;)
            {
                var c = druidContacts[i]; int age = tick - c.Born;
                if (age < 0 || age >= c.Life) { druidContacts.RemoveAt(i); continue; }
                int frame = age * HitClip.Frames / c.Life;
                // 기존 원화의 국소 명중광만 사용한다. 탄막 위에 큰 흰 원/입자를 덮지 않는다.
                PutAdd(ClipSprite(HitClip, frame), c.X, c.Y, c.Width, c.Width * 543.0 / 362,
                    .45f * (1f - age / (float)c.Life), (int)c.Y + 12);
                i++;
            }
        }
    }
}
