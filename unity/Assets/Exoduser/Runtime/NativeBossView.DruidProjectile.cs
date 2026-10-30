using System;
using UnityEngine;

namespace Exoduser.UnityPort
{
    public sealed partial class NativeBossView
    {
        Material druidProjectileMaterial;
        Sprite druidProjectileQuad;
        bool druidProjectileArtTried;
        readonly MaterialPropertyBlock druidProjectileBlock = new MaterialPropertyBlock();

        bool DrawDruidProjectile(double x, double y, double vx, double vy, double radius, double size, bool physical, bool large, bool friendly = false)
        {
            if (!druidProjectileArtTried)
            {
                druidProjectileArtTried = true;
                var shader = Resources.Load<Shader>("Shaders/DruidProjectile");
                if (shader != null)
                {
                    druidProjectileMaterial = new Material(shader);
                    druidProjectileQuad = Sprite.Create(Texture2D.whiteTexture, new Rect(0, 0, Texture2D.whiteTexture.width, Texture2D.whiteTexture.height), new Vector2(.5f, .5f), 100, 0, SpriteMeshType.FullRect);
                }
            }
            if (druidProjectileMaterial == null) return false;
            physical = physical && !friendly;
            double diameter = NativeDruidMotionClock.ProjectileDiameter(radius, size, large);
            if (physical) diameter = Math.Max(diameter, Math.Max(18, radius * 4));
            var r = Next(); r.sharedMaterial = druidProjectileMaterial; r.sprite = druidProjectileQuad; r.color = Color.white; r.sortingOrder = (int)y + 6;
            r.transform.position = Point(x, y); r.transform.rotation = Quaternion.Euler(0, 0, -(float)(Math.Atan2(vy, vx) * Mathf.Rad2Deg));
            r.transform.localScale = Vector3.one * (float)(diameter * 2 / druidProjectileQuad.rect.width);
            druidProjectileBlock.Clear(); druidProjectileBlock.SetFloat("_Thorn", physical ? 1 : 0); druidProjectileBlock.SetFloat("_Friendly", friendly ? 1 : 0); r.SetPropertyBlock(druidProjectileBlock);
            return true;
        }

        void DisposeDruidProjectileArt()
        {
            if (druidProjectileMaterial != null) UnityEngine.Object.Destroy(druidProjectileMaterial);
            if (druidProjectileQuad != null) UnityEngine.Object.Destroy(druidProjectileQuad);
        }
    }
}
