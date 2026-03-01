using System.Collections;
using UnityEngine;
using Exoduser.Core;

namespace Exoduser.Gameplay.Combat.Hit
{
    /// <summary>
    /// Centralized hit feedback system. Handles hit stop, screen shake, slow motion,
    /// and hit flash effects. Registered with ServiceLocator for global access.
    /// </summary>
    public class HitFx : MonoBehaviour
    {
        [Header("Hit Stop Defaults")]
        [SerializeField, Tooltip("Default hit stop duration in seconds.")]
        private float _defaultHitStopDuration = 0.05f;

        [Header("Screen Shake Defaults")]
        [SerializeField, Tooltip("Default screen shake intensity.")]
        private float _defaultShakeIntensity = 0.3f;

        [SerializeField, Tooltip("Default screen shake duration in seconds.")]
        private float _defaultShakeDuration = 0.15f;

        [Header("Slow Motion Defaults")]
        [SerializeField, Tooltip("Default slow motion time scale.")]
        private float _defaultSlowScale = 0.3f;

        [SerializeField, Tooltip("Default slow motion duration in real-time seconds.")]
        private float _defaultSlowDuration = 0.3f;

        [Header("Hit Flash Defaults")]
        [SerializeField, Tooltip("Default hit flash duration in seconds.")]
        private float _defaultFlashDuration = 0.1f;

        [SerializeField, Tooltip("Hit flash emission color.")]
        private Color _flashColor = Color.white;

        [Header("References")]
        [SerializeField, Tooltip("Cinemachine impulse source for camera shake. Auto-found if null.")]
        private Cinemachine.CinemachineImpulseSource _impulseSource;

        private float _originalFixedDeltaTime;
        private Coroutine _activeHitStop;
        private Coroutine _activeSlowMotion;

        private static readonly int EmissionColorId = Shader.PropertyToID("_EmissionColor");

        private void Awake()
        {
            _originalFixedDeltaTime = Time.fixedDeltaTime;
            ServiceLocator.Register(this);

            if (_impulseSource == null)
            {
                _impulseSource = GetComponent<Cinemachine.CinemachineImpulseSource>();
            }
        }

        private void OnDestroy()
        {
            // Ensure timeScale is restored if this object is destroyed mid-effect
            Time.timeScale = 1f;
            Time.fixedDeltaTime = _originalFixedDeltaTime;
            ServiceLocator.Deregister(this);
        }

        // ---------------------------------------------------------------
        // Hit Stop
        // ---------------------------------------------------------------

        /// <summary>
        /// Freezes time briefly to emphasize an impactful hit.
        /// </summary>
        /// <param name="duration">Duration of the freeze in real-time seconds.</param>
        public void DoHitStop(float duration = -1f)
        {
            if (duration < 0f) duration = _defaultHitStopDuration;

            if (_activeHitStop != null)
            {
                StopCoroutine(_activeHitStop);
                RestoreTimeScale();
            }

            _activeHitStop = StartCoroutine(HitStopCoroutine(duration));
        }

        private IEnumerator HitStopCoroutine(float duration)
        {
            Time.timeScale = 0f;
            Time.fixedDeltaTime = _originalFixedDeltaTime * 0f;

            yield return new WaitForSecondsRealtime(duration);

            // Only restore if no slow motion is pending
            if (_activeSlowMotion == null)
            {
                RestoreTimeScale();
            }
            else
            {
                // Let slow motion coroutine handle restoration
            }

            _activeHitStop = null;
        }

        // ---------------------------------------------------------------
        // Screen Shake
        // ---------------------------------------------------------------

        /// <summary>
        /// Triggers a camera shake effect via Cinemachine impulse.
        /// Falls back to manual transform shake if no impulse source is available.
        /// </summary>
        /// <param name="intensity">Shake intensity (impulse force magnitude).</param>
        /// <param name="duration">Shake duration in seconds.</param>
        public void DoScreenShake(float intensity = -1f, float duration = -1f)
        {
            if (intensity < 0f) intensity = _defaultShakeIntensity;
            if (duration < 0f) duration = _defaultShakeDuration;

            if (_impulseSource != null)
            {
                _impulseSource.m_DefaultVelocity = Random.insideUnitSphere.normalized * intensity;
                _impulseSource.GenerateImpulse(intensity);
            }
            else
            {
                StartCoroutine(ManualShakeCoroutine(intensity, duration));
            }
        }

        private IEnumerator ManualShakeCoroutine(float intensity, float duration)
        {
            Camera cam = Camera.main;
            if (cam == null) yield break;

            Transform camTransform = cam.transform;
            Vector3 originalPos = camTransform.localPosition;
            float elapsed = 0f;

            while (elapsed < duration)
            {
                float t = elapsed / duration;
                float dampedIntensity = intensity * (1f - t); // Fade out
                Vector3 offset = Random.insideUnitSphere * dampedIntensity;
                offset.z = 0f; // Keep Z stable for isometric camera
                camTransform.localPosition = originalPos + offset;

                elapsed += Time.unscaledDeltaTime;
                yield return null;
            }

            camTransform.localPosition = originalPos;
        }

        // ---------------------------------------------------------------
        // Slow Motion
        // ---------------------------------------------------------------

        /// <summary>
        /// Temporarily slows time to emphasize a dramatic moment.
        /// </summary>
        /// <param name="scale">Time scale during slow motion (0-1).</param>
        /// <param name="duration">Duration in real-time seconds.</param>
        public void DoSlowMotion(float scale = -1f, float duration = -1f)
        {
            if (scale < 0f) scale = _defaultSlowScale;
            if (duration < 0f) duration = _defaultSlowDuration;

            if (_activeSlowMotion != null)
            {
                StopCoroutine(_activeSlowMotion);
                RestoreTimeScale();
            }

            _activeSlowMotion = StartCoroutine(SlowMotionCoroutine(scale, duration));
        }

        private IEnumerator SlowMotionCoroutine(float scale, float duration)
        {
            Time.timeScale = scale;
            Time.fixedDeltaTime = _originalFixedDeltaTime * scale;

            yield return new WaitForSecondsRealtime(duration);

            RestoreTimeScale();
            _activeSlowMotion = null;
        }

        // ---------------------------------------------------------------
        // Hit Flash
        // ---------------------------------------------------------------

        /// <summary>
        /// Briefly flashes a renderer's emission to white (or configured color)
        /// to indicate a hit.
        /// </summary>
        /// <param name="renderer">The renderer to flash.</param>
        /// <param name="duration">Duration of the flash in real-time seconds.</param>
        public void DoHitFlash(Renderer renderer, float duration = -1f)
        {
            if (renderer == null) return;
            if (duration < 0f) duration = _defaultFlashDuration;

            StartCoroutine(HitFlashCoroutine(renderer, duration));
        }

        private IEnumerator HitFlashCoroutine(Renderer renderer, float duration)
        {
            MaterialPropertyBlock block = new MaterialPropertyBlock();
            renderer.GetPropertyBlock(block);

            Color originalEmission = block.GetColor(EmissionColorId);

            // Set flash color
            block.SetColor(EmissionColorId, _flashColor * 3f); // HDR intensity
            renderer.SetPropertyBlock(block);

            yield return new WaitForSecondsRealtime(duration);

            // Restore original emission
            if (renderer != null)
            {
                block.SetColor(EmissionColorId, originalEmission);
                renderer.SetPropertyBlock(block);
            }
        }

        // ---------------------------------------------------------------
        // Combo (chained effects)
        // ---------------------------------------------------------------

        /// <summary>
        /// Plays a combination of hit stop followed by screen shake.
        /// Useful for melee combo hits.
        /// </summary>
        /// <param name="hitStopDur">Hit stop duration.</param>
        /// <param name="shakeDur">Screen shake duration.</param>
        /// <param name="shakeIntensity">Screen shake intensity.</param>
        public void PlayCombo(float hitStopDur, float shakeDur, float shakeIntensity)
        {
            StartCoroutine(ComboCoroutine(hitStopDur, shakeDur, shakeIntensity));
        }

        private IEnumerator ComboCoroutine(float hitStopDur, float shakeDur, float shakeIntensity)
        {
            // Hit stop first
            DoHitStop(hitStopDur);
            yield return new WaitForSecondsRealtime(hitStopDur);

            // Then screen shake
            DoScreenShake(shakeIntensity, shakeDur);
        }

        // ---------------------------------------------------------------
        // Internal
        // ---------------------------------------------------------------

        private void RestoreTimeScale()
        {
            Time.timeScale = 1f;
            Time.fixedDeltaTime = _originalFixedDeltaTime;
        }
    }
}
