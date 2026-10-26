using System;

namespace Exoduser.UnityPort.Core
{
    // Unity-free ground-ray math of the PC-MAP3D perspective world (unit-testable under .NET).
    // Godot source: native_perspective_view.gd:416-424 screen_to_world(screen, height): camera ray against Plane(UP, height), rejected when
    // the depth is outside [near, far] or no intersection exists; player.gd:151-158 keeps the facing when the pointer is not ready.
    // Camera: native_perspective_view.gd:153-164 (position = target + (sin yaw cos pitch, sin pitch, cos yaw cos pitch)*distance, look_at target,
    // vertical FOV = 2*atan(H/(2*distance*zoom)), KEEP_HEIGHT). Coordinates here are Godot/simulation px: X = px_x, Z = px_y, Y = height.
    public static class NativePerspectiveWorldMath
    {
        public const double Yaw = 0, Pitch = 0.85, Distance = 1400, Zoom = 1, Near = 32, Far = 16000;

        public static double VerticalFov(double viewportHeight) { return 2.0 * Math.Atan(viewportHeight / (2.0 * Distance * Zoom)); }

        public static void CameraPosition(double focusX, double focusY, out double x, out double y, out double z)
        {
            double cp = Math.Cos(Pitch);
            x = focusX + Math.Sin(Yaw) * cp * Distance; y = Math.Sin(Pitch) * Distance; z = focusY + Math.Cos(Yaw) * cp * Distance;
        }

        // screen: pixels, origin top-left, +y down. Returns false (like Godot {"ready":false}) when the ray misses the plane or leaves [near,far].
        public static bool ScreenToGround(double focusX, double focusY, double screenX, double screenY, double width, double height, double planeHeight, out double px, out double py)
        {
            px = py = 0;
            if (width <= 0 || height <= 0 || double.IsNaN(screenX) || double.IsNaN(screenY)) return false;
            double cx, cy, cz; CameraPosition(focusX, focusY, out cx, out cy, out cz);
            // forward = normalize(target - position), right = normalize(forward x up), up' = right x forward
            double fx = focusX - cx, fy = 0 - cy, fz = focusY - cz, fl = Math.Sqrt(fx * fx + fy * fy + fz * fz); fx /= fl; fy /= fl; fz /= fl;
            double rx = -fz, ry = 0, rz = fx, rl = Math.Sqrt(rx * rx + rz * rz); rx /= rl; rz /= rl; // forward x (0,1,0) = (-fz, 0, fx)
            double ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
            double th = Math.Tan(VerticalFov(height) / 2.0), aspect = width / height;
            double nx = screenX / width * 2.0 - 1.0, ny = 1.0 - screenY / height * 2.0;
            double dx = fx + rx * nx * th * aspect + ux * ny * th, dy = fy + ry * nx * th * aspect + uy * ny * th, dz = fz + rz * nx * th * aspect + uz * ny * th;
            if (dy >= -1e-12) return false; // at or above the horizon
            double t = (planeHeight - cy) / dy;
            if (!(t > 0)) return false;
            double hx = cx + dx * t, hy = cy + dy * t, hz = cz + dz * t;
            double depth = (hx - cx) * fx + (hy - cy) * fy + (hz - cz) * fz;
            if (depth < Near || depth > Far) return false;
            px = hx; py = hz;
            return true;
        }
    }
}
