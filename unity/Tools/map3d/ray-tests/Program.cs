using System;
using Exoduser.UnityPort.Core;

// PC-MAP3D S2-0 ground-ray checks. The reference path is an explicit view/projection matrix unproject (Godot's Camera3D.project_ray_*),
// independent of the closed-form ray built in NativePerspectiveWorldMath.
class Program
{
    static int count, failures; static double maxCornerError, maxRoundTrip;
    static double Hypot(double a, double b) { return Math.Sqrt(a * a + b * b); }
    static void Check(bool ok, string name) { count++; if (!ok) failures++; Console.WriteLine((ok ? "PASS " : "FAIL ") + name); }

    // Row-major 4x4 helpers (doubles).
    static double[,] LookAt(double[] eye, double[] target, double[] up)
    {
        double[] f = Norm(Sub(target, eye)), r = Norm(Cross(f, up)), u = Cross(r, f);
        return new double[,] { { r[0], r[1], r[2], -Dot(r, eye) }, { u[0], u[1], u[2], -Dot(u, eye) }, { -f[0], -f[1], -f[2], Dot(f, eye) }, { 0, 0, 0, 1 } };
    }
    static double[,] Perspective(double fovY, double aspect, double near, double far)
    {
        double t = 1.0 / Math.Tan(fovY / 2);
        return new double[,] { { t / aspect, 0, 0, 0 }, { 0, t, 0, 0 }, { 0, 0, -(far + near) / (far - near), -2 * far * near / (far - near) }, { 0, 0, -1, 0 } };
    }
    static double[] Mul(double[,] m, double[] v) { var o = new double[4]; for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++) o[i] += m[i, j] * v[j]; return o; }
    static double[,] Inverse(double[,] m)
    {
        int n = 4; var a = new double[n, 2 * n];
        for (int i = 0; i < n; i++) { for (int j = 0; j < n; j++) a[i, j] = m[i, j]; a[i, n + i] = 1; }
        for (int c = 0; c < n; c++)
        {
            int p = c; for (int r = c + 1; r < n; r++) if (Math.Abs(a[r, c]) > Math.Abs(a[p, c])) p = r;
            for (int j = 0; j < 2 * n; j++) { double tmp = a[c, j]; a[c, j] = a[p, j]; a[p, j] = tmp; }
            double d = a[c, c]; for (int j = 0; j < 2 * n; j++) a[c, j] /= d;
            for (int r = 0; r < n; r++) if (r != c) { double f = a[r, c]; for (int j = 0; j < 2 * n; j++) a[r, j] -= f * a[c, j]; }
        }
        var inv = new double[n, n]; for (int i = 0; i < n; i++) for (int j = 0; j < n; j++) inv[i, j] = a[i, n + j]; return inv;
    }
    static double[] Sub(double[] a, double[] b) { return new[] { a[0] - b[0], a[1] - b[1], a[2] - b[2] }; }
    static double Dot(double[] a, double[] b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    static double[] Cross(double[] a, double[] b) { return new[] { a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] }; }
    static double[] Norm(double[] a) { double l = Math.Sqrt(Dot(a, a)); return new[] { a[0] / l, a[1] / l, a[2] / l }; }

    // Reference: unproject the screen point at the near and far clip planes with the inverse view-projection, intersect with y = planeHeight.
    static bool Reference(double fx, double fy, double sx, double sy, double w, double h, double planeY, out double px, out double py)
    {
        px = py = 0;
        double cx, cy, cz; NativePerspectiveWorldMath.CameraPosition(fx, fy, out cx, out cy, out cz);
        var view = LookAt(new[] { cx, cy, cz }, new[] { fx, 0.0, fy }, new[] { 0.0, 1.0, 0.0 });
        var proj = Perspective(NativePerspectiveWorldMath.VerticalFov(h), w / h, NativePerspectiveWorldMath.Near, NativePerspectiveWorldMath.Far);
        var inv = Inverse(Mul4(proj, view));
        double nx = sx / w * 2 - 1, ny = 1 - sy / h * 2;
        var a = Mul(inv, new[] { nx, ny, -1.0, 1.0 }); var b = Mul(inv, new[] { nx, ny, 1.0, 1.0 });
        double[] p0 = { a[0] / a[3], a[1] / a[3], a[2] / a[3] }, p1 = { b[0] / b[3], b[1] / b[3], b[2] / b[3] };
        double dy = p1[1] - p0[1]; if (dy >= -1e-12) return false;
        double t = (planeY - p0[1]) / dy; if (t < 0) return false;
        px = p0[0] + (p1[0] - p0[0]) * t; py = p0[2] + (p1[2] - p0[2]) * t; return true;
    }
    static double[,] Mul4(double[,] a, double[,] b) { var o = new double[4, 4]; for (int i = 0; i < 4; i++) for (int j = 0; j < 4; j++) for (int k = 0; k < 4; k++) o[i, j] += a[i, k] * b[k, j]; return o; }

    // Forward projection of a ground point to the screen (for the round trip).
    static bool Project(double fx, double fy, double gx, double gy, double w, double h, out double sx, out double sy)
    {
        sx = sy = 0; double cx, cy, cz; NativePerspectiveWorldMath.CameraPosition(fx, fy, out cx, out cy, out cz);
        var view = LookAt(new[] { cx, cy, cz }, new[] { fx, 0.0, fy }, new[] { 0.0, 1.0, 0.0 });
        var proj = Perspective(NativePerspectiveWorldMath.VerticalFov(h), w / h, NativePerspectiveWorldMath.Near, NativePerspectiveWorldMath.Far);
        var clip = Mul(Mul4(proj, view), new[] { gx, 0.0, gy, 1.0 }); if (clip[3] <= 0) return false;
        sx = (clip[0] / clip[3] * 0.5 + 0.5) * w; sy = (1 - (clip[1] / clip[3] * 0.5 + 0.5)) * h; return true;
    }

    static void Main()
    {
        double px, py, rx, ry;
        Check(Math.Abs(NativePerspectiveWorldMath.VerticalFov(1080) * 180 / Math.PI - 42.184679011655) < 1e-9, "vertical FOV for H=1080 is 42.184679 deg (Godot rule 2*atan(H/(2*d*zoom)))");
        foreach (var focus in new[] { new[] { 4020.0, 7420.0 }, new[] { 5900.0, 3900.0 }, new[] { 120.0, 80.0 } })
            foreach (var size in new[] { new[] { 1920.0, 1080.0 }, new[] { 1280.0, 720.0 }, new[] { 800.0, 1200.0 } })
            {
                bool hit = NativePerspectiveWorldMath.ScreenToGround(focus[0], focus[1], size[0] / 2, size[1] / 2, size[0], size[1], 0, out px, out py);
                Check(hit && Hypot(px - focus[0], py - focus[1]) <= 1.0, "screen centre -> focus within 1 px at (" + focus[0] + "," + focus[1] + ") " + size[0] + "x" + size[1] + " err=" + Hypot(px - focus[0], py - focus[1]).ToString("E2"));
            }
        // Corners: closed form vs matrix unproject (Godot-style) at the START focus.
        double[] fx = { 4020, 7420 };
        var corners = new[] { new[] { 0.0, 0.0 }, new[] { 1920.0, 0.0 }, new[] { 1920.0, 1080.0 }, new[] { 0.0, 1080.0 } };
        string[] names = { "top-left", "top-right", "bottom-right", "bottom-left" };
        for (int i = 0; i < 4; i++)
        {
            bool a = NativePerspectiveWorldMath.ScreenToGround(fx[0], fx[1], corners[i][0], corners[i][1], 1920, 1080, 0, out px, out py);
            bool b = Reference(fx[0], fx[1], corners[i][0], corners[i][1], 1920, 1080, 0, out rx, out ry);
            double err = Hypot(px - rx, py - ry); maxCornerError = Math.Max(maxCornerError, err);
            Console.WriteLine("  corner " + names[i] + ": ground=(" + px.ToString("F3") + "," + py.ToString("F3") + ") reference=(" + rx.ToString("F3") + "," + ry.ToString("F3") + ") err=" + err.ToString("E2"));
            Check(a && b && err <= 1.0, "corner " + names[i] + " equals the matrix-unproject reference within 1 px");
        }
        // Random sample + round trip (ground -> screen -> ground).
        var rng = new Random(20261026); double maxRef = 0;
        for (int i = 0; i < 2000; i++)
        {
            double sx = rng.NextDouble() * 1920, sy = rng.NextDouble() * 1080;
            bool a = NativePerspectiveWorldMath.ScreenToGround(fx[0], fx[1], sx, sy, 1920, 1080, 0, out px, out py), b = Reference(fx[0], fx[1], sx, sy, 1920, 1080, 0, out rx, out ry);
            if (a != b) { Check(false, "hit agreement at sample " + i); break; }
            maxRef = Math.Max(maxRef, Hypot(px - rx, py - ry));
            double bx, by; if (Project(fx[0], fx[1], px, py, 1920, 1080, out bx, out by)) maxRoundTrip = Math.Max(maxRoundTrip, Hypot(bx - sx, by - sy));
        }
        Check(maxRef <= 1e-3, "2000 random pixels: closed form == matrix unproject (max " + maxRef.ToString("E2") + " px)");
        Check(maxRoundTrip <= 1e-3, "round trip screen -> ground -> screen (max " + maxRoundTrip.ToString("E2") + " px)");
        // Symmetry about the focus column.
        bool l = NativePerspectiveWorldMath.ScreenToGround(fx[0], fx[1], 300, 700, 1920, 1080, 0, out px, out py), r = NativePerspectiveWorldMath.ScreenToGround(fx[0], fx[1], 1920 - 300, 700, 1920, 1080, 0, out rx, out ry);
        Check(l && r && Math.Abs((px - fx[0]) + (rx - fx[0])) < 1e-6 && Math.Abs(py - ry) < 1e-6, "left/right mirror points are symmetric about the focus");
        // No hit above the horizon (Godot: {"ready":false} -> the player keeps its facing).
        Check(!NativePerspectiveWorldMath.ScreenToGround(fx[0], fx[1], 960, -100000, 1920, 1080, 0, out px, out py), "pointer far above the horizon has no ground hit");
        Check(!NativePerspectiveWorldMath.ScreenToGround(fx[0], fx[1], double.NaN, 0, 1920, 1080, 0, out px, out py), "NaN pointer is rejected");
        // Plane height: aiming at height 40 moves the hit toward the camera (south) relative to height 0.
        bool h0 = NativePerspectiveWorldMath.ScreenToGround(fx[0], fx[1], 960, 300, 1920, 1080, 0, out px, out py), h40 = NativePerspectiveWorldMath.ScreenToGround(fx[0], fx[1], 960, 300, 1920, 1080, 40, out rx, out ry);
        Check(h0 && h40 && ry > py, "raising the plane moves the hit toward the camera");
        Console.WriteLine("MAP3D_RAY_RESULT " + count + " checks / " + failures + " failures; max corner error " + maxCornerError.ToString("E2") + " px; max reference error " + maxRef.ToString("E2") + " px; max round trip " + maxRoundTrip.ToString("E2") + " px");
        Environment.Exit(failures == 0 ? 0 : 1);
    }
}
