using UnityEngine;

// UCH-03b. Verlet spring chains for the Warrior cape bones (Cape_{L,C,R}_{0,1,2}) with leg-capsule push-out.
// Fixed-dt sub-stepping => frame independent. Runs in LateUpdate; capture/test code calls Step(dt) manually.
namespace Exoduser.CharacterLab
{
    [DefaultExecutionOrder(100)]
    public class CapeSpring : MonoBehaviour
    {
        public float substep = 1f / 120f;
        public float stiffness0 = 700f, stiffness1 = 520f, stiffness2 = 380f; // pull toward "hanging behind the root" (1/s^2) per joint
        public float damping = 0.9925f;          // velocity kept per substep
        public float gravity = 9.8f;
        public float legRadius = 0.09f;          // leg capsule radius (spec ~0.09)
        public float clothThickness = 0.07f;    // extra clearance so cape vertices (offset from the joint line) stay outside the legs
        public int constraintIterations = 4;
        public float maxStep = 0.03f;            // per-substep travel clamp (m)
        public float widthStiffness = 0.4f;      // keeps neighbouring chains at their bind spacing
        public float tailLength = 0.28f;         // virtual tail past the last joint

        static readonly string[] Cols = { "L", "C", "R" };
        class Chain
        {
            public Transform[] bone = new Transform[3];
            public Vector3[] p = new Vector3[4], prev = new Vector3[4];  // p[0]=root(pinned) p[1..2]=joints p[3]=tail
            public Vector3[] restOffset = new Vector3[4];                 // offset from p0 in character-root space at bind
            public float[] len = new float[3];
            public bool init;
        }
        Chain[] chains;
        readonly Transform[] legA = new Transform[4], legB = new Transform[4];   // capsule endpoints (UpLeg->Leg, Leg->Foot) x L/R
        float acc;
        float[,] widthRest;
        Quaternion[] bindLocalRot;

        public int ChainCount { get { Setup(); return chains.Length; } }

        Transform FindBone(string n) { foreach (var t in GetComponentsInChildren<Transform>(true)) if (t.name == n) return t; return null; }

        void Setup()
        {
            if (chains != null) return;
            var list = new System.Collections.Generic.List<Chain>();
            foreach (var c in Cols)
            {
                var ch = new Chain();
                for (int k = 0; k < 3; k++) ch.bone[k] = FindBone($"Cape_{c}_{k}");
                if (ch.bone[0] == null || ch.bone[1] == null || ch.bone[2] == null) continue;
                for (int k = 0; k < 3; k++) ch.restOffset[k] = transform.InverseTransformVector(ch.bone[k].position - ch.bone[0].position);
                ch.restOffset[3] = ch.restOffset[2] + transform.InverseTransformVector(Vector3.down * tailLength);
                ch.len[0] = (ch.bone[1].position - ch.bone[0].position).magnitude;
                ch.len[1] = (ch.bone[2].position - ch.bone[1].position).magnitude;
                ch.len[2] = tailLength;
                list.Add(ch);
            }
            chains = list.ToArray();
            widthRest = new float[Mathf.Max(1, chains.Length), 3];
            for (int ci = 0; ci + 1 < chains.Length; ci++) for (int j = 0; j < 3; j++) widthRest[ci, j] = (chains[ci + 1].bone[j].position - chains[ci].bone[j].position).magnitude;
            string[,] legs = { { "LeftUpLeg", "LeftLeg" }, { "LeftLeg", "LeftFoot" }, { "RightUpLeg", "RightLeg" }, { "RightLeg", "RightFoot" } };
            for (int i = 0; i < 4; i++) { legA[i] = FindBone(legs[i, 0]); legB[i] = FindBone(legs[i, 1]); }
            bindLocalRot = new Quaternion[chains.Length * 3];
            for (int i = 0; i < chains.Length; i++) for (int k = 0; k < 3; k++) bindLocalRot[i * 3 + k] = chains[i].bone[k].localRotation;
        }

        public void ResetState() { Setup(); foreach (var ch in chains) ch.init = false; acc = 0f; }

        void LateUpdate() { Step(Time.deltaTime); }

        // advance by dt (sub-stepped at a fixed rate) and write bone rotations
        public void Step(float dt)
        {
            Setup();
            if (chains.Length == 0) return;
            for (int i = 0; i < chains.Length; i++)
                for (int k = 0; k < 3; k++) chains[i].bone[k].localRotation = bindLocalRot[i * 3 + k];
            foreach (var ch in chains)
            {
                if (ch.init) continue;
                var root = ch.bone[0].position;
                ch.p[0] = root;
                for (int k = 1; k < 4; k++) ch.p[k] = root + transform.TransformVector(ch.restOffset[k]);
                System.Array.Copy(ch.p, ch.prev, 4); ch.init = true;
            }
            acc += Mathf.Min(dt, 0.1f);
            var rootStart = new Vector3[chains.Length];
            for (int i = 0; i < chains.Length; i++) rootStart[i] = chains[i].p[0];
            int n = Mathf.FloorToInt(acc / substep + 1e-4f);
            if (n > 0)
            {
                for (int s = 1; s <= n; s++)
                {
                    float f = s / (float)n;
                    for (int i = 0; i < chains.Length; i++)
                        Integrate(chains[i], Vector3.Lerp(rootStart[i], chains[i].bone[0].position, f), substep);
                    for (int it = 0; it < constraintIterations; it++)
                    {
                        for (int i = 0; i < chains.Length; i++) Constrain(chains[i]);
                        Width();
                        CollideAll();
                    }
                }
                acc -= n * substep;
            }
            for (int i = 0; i < chains.Length; i++) Apply(chains[i]);
        }

        void Integrate(Chain ch, Vector3 root, float h)
        {
            ch.p[0] = root; ch.prev[0] = root;
            for (int j = 1; j < 4; j++)
            {
                var target = root + transform.TransformVector(ch.restOffset[j]);
                var v = (ch.p[j] - ch.prev[j]) * damping;
                float kj = j == 1 ? stiffness0 : j == 2 ? stiffness1 : stiffness2;
                if (j == 3) kj *= 0.7f;
                var a = Vector3.down * gravity + (target - ch.p[j]) * kj;
                ch.prev[j] = ch.p[j];
                var step = v + a * (h * h); if (step.magnitude > maxStep) step = step.normalized * maxStep;
                ch.p[j] += step;
            }
        }

        void Constrain(Chain ch)
        {
            for (int j = 0; j < 3; j++)
            {
                var d = ch.p[j + 1] - ch.p[j]; float m = d.magnitude; if (m < 1e-6f) continue;
                var corr = d * ((m - ch.len[j]) / m);
                if (j == 0) ch.p[1] -= corr; else { ch.p[j] += corr * 0.5f; ch.p[j + 1] -= corr * 0.5f; }
            }
        }

        void Width()
        {
            for (int ci = 0; ci + 1 < chains.Length; ci++)
            {
                var A = chains[ci]; var B = chains[ci + 1];
                for (int j = 1; j < 4; j++)
                {
                    var d = B.p[j] - A.p[j]; float m = d.magnitude; if (m < 1e-6f) continue;
                    var corr = d * ((m - widthRest[ci, Mathf.Min(j, 2)]) / m) * 0.5f * widthStiffness;
                    A.p[j] += corr; B.p[j] -= corr;
                }
            }
        }

        // push the cloth sheet (particles + bilinear points across neighbouring chains and joint levels) out of the leg capsules
        void CollideAll()
        {
            float r = legRadius + clothThickness;
            var back = -transform.forward;
            foreach (var ch in chains)
                for (int j = 1; j < 4; j++)
                    for (int c = 0; c < 4; c++)
                        if (legA[c] != null && legB[c] != null) { var before = ch.p[j]; Push(ref ch.p[j], legA[c].position, legB[c].position, r, back); ch.prev[j] += (ch.p[j] - before) * 0.85f; }
            for (int ci = 0; ci + 1 < chains.Length; ci++)
            {
                var A = chains[ci]; var B = chains[ci + 1];
                for (int j = 1; j < 3; j++)
                    foreach (float u in sheetU)
                        foreach (float v in sheetV)
                        {
                            float w00 = (1 - u) * (1 - v), w10 = u * (1 - v), w01 = (1 - u) * v, w11 = u * v;
                            var pt = A.p[j] * w00 + B.p[j] * w10 + A.p[j + 1] * w01 + B.p[j + 1] * w11; var p0 = pt;
                            for (int c = 0; c < 4; c++) if (legA[c] != null && legB[c] != null) Push(ref pt, legA[c].position, legB[c].position, r, back);
                            var d = pt - p0; if (d.sqrMagnitude < 1e-12f) continue;
                            float den = w00 * w00 + w10 * w10 + w01 * w01 + w11 * w11;
                            var dA0 = d * (w00 / den); var dB0 = d * (w10 / den); var dA1 = d * (w01 / den); var dB1 = d * (w11 / den);
                            A.p[j] += dA0; B.p[j] += dB0; A.p[j + 1] += dA1; B.p[j + 1] += dB1;
                            A.prev[j] += dA0 * 0.85f; B.prev[j] += dB0 * 0.85f; A.prev[j + 1] += dA1 * 0.85f; B.prev[j + 1] += dB1 * 0.85f;
                        }
            }
        }
        static readonly float[] sheetU = { 0.25f, 0.5f, 0.75f }, sheetV = { 0f, 0.5f, 1f };

        static void Push(ref Vector3 p, Vector3 a, Vector3 b, float r, Vector3 fallback)
        {
            var ab = b - a; float t = Mathf.Clamp01(Vector3.Dot(p - a, ab) / Mathf.Max(1e-8f, ab.sqrMagnitude));
            var c = a + ab * t; var d = p - c; float m = d.magnitude;
            if (m >= r) return;
            // bias toward the back of the character: cloth hangs behind the legs, so a leg that swings through the sheet pushes it backward, not sideways
            var db = (m < 1e-5f ? Vector3.zero : d / m) + fallback * 1.0f; db.Normalize();
            p = c + db * r;
        }

        void Apply(Chain ch)
        {
            for (int k = 0; k < 3; k++)
            {
                var from = k < 2 ? ch.bone[k + 1].position - ch.bone[k].position : ch.bone[2].TransformDirection(Vector3.down);
                var to = ch.p[k + 1] - ch.bone[k].position;
                if (from.sqrMagnitude < 1e-10f || to.sqrMagnitude < 1e-10f) continue;
                ch.bone[k].rotation = Quaternion.FromToRotation(from, to) * ch.bone[k].rotation;
            }
        }
    }
}
