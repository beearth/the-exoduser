using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.UnityPort.Core;

namespace Exoduser.UnityPort
{
    // D01: ground view of the web worldItems (game.html 52582-52598): inventory art 34px with a 3px sine bob, plus the rune light pillar
    // (world_item_drop_beams_v3 atlas, additive, 60x160, two frames alternating every 180 ms). Pickup goes through Simulation.TryCollectLoot.
    public sealed partial class NativeGame
    {
        sealed class DropView { public SpriteRenderer icon, beam; }
        readonly Dictionary<int, DropView> drops = new Dictionary<int, DropView>();
        readonly Dictionary<Texture2D, Sprite> dropIcons = new Dictionary<Texture2D, Sprite>();
        readonly Dictionary<string, Sprite> beamTiles = new Dictionary<string, Sprite>();
        MaterialPropertyBlock beamProperties;
        static readonly int BeamOpacity = Shader.PropertyToID("_Opacity");
        Material beamMaterial, maskMaterial;
        public int DropViewCount => drops.Count;

        // _getWorldDropBeamTier: [none, green, blue, purple, gold, red][rarity] -> atlas tile (tier-1)
        static int BeamTier(int rarity) { return rarity >= 0 && rarity < 6 ? new[] { 0, 2, 3, 4, 5, 6 }[rarity] : 0; }

        Sprite DropIcon(InventoryItem item)
        {
            var tex = inventory.IconTexture(item);
            Sprite sprite;
            // 34px square on a 100 px/unit world
            if (!dropIcons.TryGetValue(tex, out sprite))
            {
                var art = tex.name.EndsWith("_cutout") ? tex : StripBackground(tex);
                sprite = Sprite.Create(art, new Rect(0, 0, art.width, art.height), new Vector2(.5f, .5f), art.width / .34f, 0, SpriteMeshType.FullRect); dropIcons.Add(tex, sprite);
            }
            return sprite;
        }

        // The generated (non-cutout) item art has an opaque dark backdrop of its own colour. The web's luminance mask (_maskWorldDropBlack) only clears light <= 24 and fades to 72,
        // so a backdrop around 35 (club_phys) stays a visible dark square on the ground. Here the backdrop is removed first: flood fill from the border through pixels close to the
        // border colour (and dark), then a half-alpha fringe; the shader mask still runs on what is left.
        static Texture2D StripBackground(Texture2D src)
        {
            int w = src.width, h = src.height;
            var rt = RenderTexture.GetTemporary(w, h, 0, RenderTextureFormat.ARGB32, RenderTextureReadWrite.sRGB);
            Graphics.Blit(src, rt); var prev = RenderTexture.active; RenderTexture.active = rt;
            var t = new Texture2D(w, h, TextureFormat.RGBA32, false); t.ReadPixels(new Rect(0, 0, w, h), 0, 0); RenderTexture.active = prev; RenderTexture.ReleaseTemporary(rt);
            var px = t.GetPixels32();
            int ring = Mathf.Max(2, w / 64); long sr = 0, sg = 0, sb = 0; int n = 0;
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) { if (x >= ring && x < w - ring && y >= ring && y < h - ring) { x = w - ring - 1; continue; } var c = px[y * w + x]; sr += c.r; sg += c.g; sb += c.b; n++; }
            int rr = (int)(sr / n), rg = (int)(sg / n), rb = (int)(sb / n);
            Func<Color32, bool> backdrop = c => Mathf.Abs(c.r - rr) <= 26 && Mathf.Abs(c.g - rg) <= 26 && Mathf.Abs(c.b - rb) <= 26 && Mathf.Max(c.r, Mathf.Max(c.g, c.b)) <= 84;
            var gone = new bool[w * h]; var queue = new Queue<int>();
            Action<int, int> seed = (x, y) => { int i = y * w + x; if (!gone[i] && backdrop(px[i])) { gone[i] = true; queue.Enqueue(i); } };
            for (int x = 0; x < w; x++) { seed(x, 0); seed(x, h - 1); } for (int y = 0; y < h; y++) { seed(0, y); seed(w - 1, y); }
            while (queue.Count > 0)
            {
                int i = queue.Dequeue(), x = i % w, y = i / w;
                if (x > 0) seed(x - 1, y); if (x < w - 1) seed(x + 1, y); if (y > 0) seed(x, y - 1); if (y < h - 1) seed(x, y + 1);
            }
            var outPx = new Color32[px.Length];
            for (int y = 0; y < h; y++) for (int x = 0; x < w; x++)
            {
                int i = y * w + x; var c = px[i];
                if (gone[i]) { outPx[i] = new Color32(c.r, c.g, c.b, 0); continue; }
                bool edge = false;
                for (int dy = -1; dy <= 1 && !edge; dy++) for (int dx = -1; dx <= 1; dx++) { int nx = x + dx, ny = y + dy; if (nx >= 0 && ny >= 0 && nx < w && ny < h && gone[ny * w + nx]) { edge = true; break; } }
                outPx[i] = new Color32(c.r, c.g, c.b, edge ? (byte)(c.a * .55f) : c.a);
            }
            var o = new Texture2D(w, h, TextureFormat.RGBA32, false) { name = src.name + "_stripped", filterMode = src.filterMode, wrapMode = TextureWrapMode.Clamp };
            o.SetPixels32(outPx); o.Apply(); Destroy(t);
            return o;
        }

        Sprite BeamTile(int frame, int tile)
        {
            string key = frame + ":" + tile;
            Sprite sprite;
            if (beamTiles.TryGetValue(key, out sprite)) return sprite;
            var tex = Resources.Load<Texture2D>("Art/vfx/world_item_drop_beams_v3_0" + (frame + 1));
            if (tex == null) return null;
            int side = tex.width / 2, col = tile % 2, row = tile / 2, rows = Mathf.RoundToInt((float)tex.height / side);
            if (row >= rows) return null;
            // 60x160 world px from a square tile: stretch via scale, so build the sprite at 1 unit == tile width
            sprite = Sprite.Create(tex, new Rect(col * side, tex.height - (row + 1) * side, side, side), new Vector2(.5f, 0f), side, 0, SpriteMeshType.FullRect);
            beamTiles.Add(key, sprite);
            return sprite;
        }

        void UpdateDropViews()
        {
            if (Simulation == null) return;
            float now = Time.unscaledTime * 1000f;
            var alive = new HashSet<int>();
            foreach (var loot in Simulation.Loot)
            {
                if (loot.Picked || loot.Item == null) continue;
                alive.Add(loot.Id);
                DropView v;
                if (!drops.TryGetValue(loot.Id, out v))
                {
                    v = new DropView { icon = CreateRenderer("Drop " + loot.Id), beam = CreateRenderer("Drop beam " + loot.Id) };
                    v.icon.sprite = DropIcon(loot.Item);
                    // the common cut-outs carry alpha; the other generated art has an opaque black background that the web masks to alpha
                    if (!v.icon.sprite.texture.name.EndsWith("_cutout")) { if (maskMaterial == null) maskMaterial = new Material(Resources.Load<Shader>("Shaders/DropIconMask")); v.icon.sharedMaterial = maskMaterial; }
                    if (beamMaterial == null) beamMaterial = new Material(Resources.Load<Shader>("Shaders/KiSlashAdditive"));
                    v.beam.sharedMaterial = beamMaterial;
                    drops.Add(loot.Id, v);
                }
                float bob = Mathf.Sin(now / 300f + loot.X) * 3f;
                // web: icon centre (x - 0.58*34 ... -> x-19.7, y-27.9+bob); beam bottom at y+bob, 60 wide, 160 tall
                v.icon.transform.position = Point(loot.X - 19.72f, loot.Y - 27.88f + bob);
                v.icon.sortingOrder = (int)loot.Y + 2;
                int tier = BeamTier(loot.Rarity);
                var beam = tier > 0 ? BeamTile((int)((now / 180f + loot.X) % 2), tier - 1) : null;
                v.beam.enabled = beam != null;
                if (beam != null)
                {
                    v.beam.sprite = beam;
                    v.beam.transform.position = Point(loot.X, loot.Y + bob);
                    v.beam.transform.localScale = new Vector3(.6f, 1.6f, 1f);
                    v.beam.sortingOrder = (int)loot.Y + 1;
                    if (beamProperties == null) beamProperties = new MaterialPropertyBlock();
                    v.beam.GetPropertyBlock(beamProperties); beamProperties.SetFloat(BeamOpacity, .46f + Mathf.Sin(now / 400f + loot.X) * .05f); v.beam.SetPropertyBlock(beamProperties);
                }
            }
            List<int> gone = null;
            foreach (var pair in drops) if (!alive.Contains(pair.Key)) (gone ?? (gone = new List<int>())).Add(pair.Key);
            if (gone != null) foreach (int id in gone) { Destroy(drops[id].icon.gameObject); Destroy(drops[id].beam.gameObject); drops.Remove(id); }
        }

        void ClearDropViews()
        {
            foreach (var pair in drops) { Destroy(pair.Value.icon.gameObject); Destroy(pair.Value.beam.gameObject); }
            drops.Clear();
        }

        static readonly string[] RarityNames = { "일반", "고급", "희귀", "영웅", "전설", "유니크" };
        // web pickupItem: bag only; toast "<rarity> <name> 획득!" (notify), or the bag-full notice
        bool CollectLoot(LootState loot)
        {
            string message;
            if (!inventory.Pickup(loot.Item, out message)) { Toast(message); return false; }
            sound?.PlayItemPickup();
            Toast(RarityNames[Mathf.Clamp(loot.Item.rarity, 0, 5)] + " " + loot.Item.name + " 획득!");
            return true;
        }
    }
}
