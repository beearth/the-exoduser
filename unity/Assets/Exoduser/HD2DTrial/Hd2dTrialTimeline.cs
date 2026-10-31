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

        void OnEnable() { if(view && hero && enemies != null && enemies.Length == 3 && shadows != null && shadows.Length == 4 && anchors != null && anchors.Length == 4) SetTime(1); }

        void Update() { if (automatic) SetTime(Time.time % 10f); }

        public void SetTime(float t)
        {
            Shader.SetGlobalFloat("_TrialTime", t);
            float step = view.orthographicSize * 2f / 1080f;
            // Whole-scene translation uses the same final pixel grid as the actors.
            view.transform.position = cameraOrigin + view.transform.right * (Mathf.Round(Mathf.Sin(t * .35f) * .140625f / step) * step);
            Shader.SetGlobalVector("_TrialCameraOrigin",view.transform.position);
            Shader.SetGlobalVector("_TrialCameraRight",view.transform.right);Shader.SetGlobalVector("_TrialCameraUp",view.transform.up);
            Shader.SetGlobalVector("_TrialCameraForward",view.transform.forward);Shader.SetGlobalVector("_TrialOrtho",new Vector4(view.orthographicSize*2*view.aspect,view.orthographicSize*2,0,0));
            float approach = Mathf.SmoothStep(0, 1, Mathf.Clamp01(t / 4f));
            Vector3 forward = anchors[1] - anchors[0]; forward.y = 0; forward.Normalize();
            Vector3 hp = anchors[0] + forward * approach * 1.4f;
            hp = Ground(hp);
            bool fighting = t >= 4f;
            float swing = Mathf.Repeat(t - 4f, 1.45f);
            Material hm = hero.sharedMaterial;
            if (fighting && swing < .72f)
            {
                int f = Mathf.Min(8, (int)(swing / .72f * 9));
                hm.SetTexture("_BaseMap", attackSheet);
                hm.SetVector("_UVRect", new Vector4(f * 80f / attackSheet.width, 1f - 4 * 80f / attackSheet.height, 80f / attackSheet.width, 80f / attackSheet.height));
                hm.SetFloat("_GridSize", 80);
                hero.transform.localScale = new Vector3(5, 5, 1);
                Place(hero.transform, hp + view.transform.up * 1.1875f, step);
            }
            else
            {
                int f = fighting ? 0 : 2 + (int)(t * 8) % 8;
                hm.SetTexture("_BaseMap", walkSheet);
                hm.SetVector("_UVRect", new Vector4(f * 48f / walkSheet.width, 0, 48f / walkSheet.width, 1));
                hm.SetFloat("_GridSize", 48);
                hero.transform.localScale = new Vector3(3, 3, 1);
                Place(hero.transform, hp + view.transform.up * 1.1875f, step);
            }
            hero.transform.rotation = view.transform.rotation;
            shadows[0].position = hp + Vector3.up * .025f;
            for (int i = 0; i < enemies.Length; i++)
            {
                var em = enemies[i].sharedMaterial;
                em.SetTexture("_BaseMap",enemySheet); em.SetFloat("_GridSize",64);
                int cell = i == 0 ? 0 : i == 1 ? 1 : 9;
                em.SetVector("_UVRect",new Vector4(cell % 8 * 256f / enemySheet.width,1-(cell/8+1)*256f/enemySheet.height,256f/enemySheet.width,256f/enemySheet.height));
                Vector3 p = anchors[i + 1];
                if (fighting) p += (hp - p).normalized * (.35f + .1f * Mathf.Sin(t * 2 + i));
                p = Ground(p);
                // Source Point samples land on grid rows 47/48/47; align their lower pixel edges.
                Place(enemies[i].transform, p + view.transform.up * (i == 1 ? .796875f : .75f), step);
                enemies[i].transform.rotation = view.transform.rotation;
                enemies[i].sharedMaterial.SetColor("_Tint", fighting && swing > .33f && swing < .42f && i == 0 ? new Color(1.45f, 1.25f, 1.1f) : Color.white);
                shadows[i + 1].position = p + Vector3.up * .025f;
            }
            bool hit = fighting && swing > .27f && swing < .55f;
            slash.gameObject.SetActive(hit);
            slash.position = hp + forward * .8f + view.transform.up * .6875f;
            slash.rotation = view.transform.rotation;
            impact.transform.position = hp + forward + Vector3.up * .8125f;
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

        static Vector3 Ground(Vector3 p)
        {
            if (Physics.Raycast(new Vector3(p.x,100,p.z),Vector3.down,out var hit,200)) p.y=hit.point.y+.018f;
            return p;
        }
    }
}
