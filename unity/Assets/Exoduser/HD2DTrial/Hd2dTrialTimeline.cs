using UnityEngine;

namespace Exoduser.Hd2d
{
    // Isolated art direction trial. No NativeGame/Core/save entry point.
    public sealed class Hd2dTrialTimeline : MonoBehaviour
    {
        public Camera view;
        public Renderer hero;
        public Renderer[] enemies;
        public Transform[] shadows;
        public Transform slash;
        public Light impact;
        public Light[] torches;
        public Texture2D walkSheet, attackSheet, enemySheet;
        public Vector3[] anchors;
        public Vector3 cameraOrigin;
        public bool automatic = true;

        void Update() { if (automatic) SetTime(Time.time % 10f); }

        public void SetTime(float t)
        {
            Shader.SetGlobalFloat("_TrialTime", t);
            float step = view.orthographicSize * 2f / 1080f;
            // Whole-scene translation uses the same final pixel grid as the actors.
            view.transform.position = cameraOrigin + view.transform.right * (Mathf.Round(Mathf.Sin(t * .35f) * .22f / step) * step);
            float approach = Mathf.SmoothStep(0, 1, Mathf.Clamp01(t / 4f));
            Vector3 forward = anchors[1] - anchors[0]; forward.y = 0; forward.Normalize();
            Vector3 hp = anchors[0] + forward * approach * 1.4f;
            bool fighting = t >= 4f;
            float swing = Mathf.Repeat(t - 4f, 1.45f);
            Material hm = hero.sharedMaterial;
            if (fighting && swing < .72f)
            {
                int f = Mathf.Min(8, (int)(swing / .72f * 9));
                hm.SetTexture("_BaseMap", attackSheet);
                hm.SetVector("_UVRect", new Vector4(f * 80f / attackSheet.width, 1f - 4 * 80f / attackSheet.height, 80f / attackSheet.width, 80f / attackSheet.height));
                hm.SetFloat("_GridSize", 80);
                hero.transform.localScale = new Vector3(8, 8, 1);
                Place(hero.transform, hp + view.transform.up * 1.8f, step);
            }
            else
            {
                int f = fighting ? 0 : 2 + (int)(t * 8) % 8;
                hm.SetTexture("_BaseMap", walkSheet);
                hm.SetVector("_UVRect", new Vector4(f * 48f / walkSheet.width, 0, 48f / walkSheet.width, 1));
                hm.SetFloat("_GridSize", 48);
                hero.transform.localScale = new Vector3(4.8f, 4.8f, 1);
                Place(hero.transform, hp + view.transform.up * 1.8f, step);
            }
            hero.transform.rotation = view.transform.rotation;
            shadows[0].position = hp + Vector3.up * .025f;
            for (int i = 0; i < enemies.Length; i++)
            {
                Vector3 p = anchors[i + 1];
                if (fighting) p += (hp - p).normalized * (.35f + .1f * Mathf.Sin(t * 2 + i));
                p.y = anchors[i + 1].y;
                Place(enemies[i].transform, p + view.transform.up * (i == 1 ? 1.22f : 1.14f), step);
                enemies[i].transform.rotation = view.transform.rotation;
                enemies[i].sharedMaterial.SetColor("_Tint", fighting && swing > .33f && swing < .42f && i == 0 ? new Color(1.45f, 1.25f, 1.1f) : Color.white);
                shadows[i + 1].position = p + Vector3.up * .025f;
            }
            bool hit = fighting && swing > .27f && swing < .55f;
            slash.gameObject.SetActive(hit);
            slash.position = hp + forward * .8f + view.transform.up * 1.1f;
            slash.rotation = view.transform.rotation;
            impact.transform.position = hp + forward + Vector3.up * 1.3f;
            impact.intensity = hit ? 5 : 0;
            for (int i = 0; i < torches.Length; i++) torches[i].intensity = 4.5f + .25f * Mathf.Sin(t * 6 + i * 2) + .12f * Mathf.Sin(t * 11);
        }

        void Place(Transform tr, Vector3 p, float step)
        {
            Vector3 local = view.transform.InverseTransformPoint(p);
            local.x = Mathf.Round(local.x / step) * step;
            local.y = Mathf.Round(local.y / step) * step;
            tr.position = view.transform.TransformPoint(local);
        }
    }
}
