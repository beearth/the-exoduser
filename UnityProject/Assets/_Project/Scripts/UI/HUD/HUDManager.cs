using UnityEngine;
using UnityEngine.UI;
using TMPro;
using Exoduser.Core;

namespace Exoduser.UI.HUD
{
    /// <summary>
    /// HUD Manager. Subscribes to <see cref="GameEvents"/> and updates
    /// UI elements (HP bar, energy bar, skill cooldowns, kill counter, damage flash).
    /// Attach to a Canvas GameObject.
    /// </summary>
    public class HUDManager : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Serialized — UI References
        // ──────────────────────────────────────────────

        [Header("Health")]
        [SerializeField, Tooltip("HP bar fill image (Image.type = Filled).")]
        private Image _hpBar;

        [Header("Energy")]
        [SerializeField, Tooltip("Energy bar fill image (Image.type = Filled).")]
        private Image _energyBar;

        [Header("Skills")]
        [SerializeField, Tooltip("Skill 1 cooldown overlay image (radial fill, clockwise).")]
        private Image _skill1CooldownOverlay;

        [Header("Kill Counter")]
        [SerializeField, Tooltip("TextMeshPro text showing total enemies killed.")]
        private TextMeshProUGUI _killCountText;

        [Header("Damage Flash")]
        [SerializeField, Tooltip("CanvasGroup used for the red damage flash overlay.")]
        private CanvasGroup _damageFlash;

        // ──────────────────────────────────────────────
        //  Serialized — Tuning
        // ──────────────────────────────────────────────

        [Header("Smoothing")]
        [SerializeField, Tooltip("Speed at which bars lerp toward their target fill.")]
        private float _barLerpSpeed = 8f;

        [Header("Damage Flash Settings")]
        [SerializeField, Tooltip("Peak alpha of the damage flash.")]
        private float _flashPeakAlpha = 0.5f;

        [SerializeField, Tooltip("Duration of the damage flash fade-out in seconds.")]
        private float _flashDuration = 0.3f;

        [Header("Skill Cooldown")]
        [SerializeField, Tooltip("Total cooldown time for skill 1 (seconds). Set from skill system.")]
        private float _skill1Cooldown = 5f;

        // ──────────────────────────────────────────────
        //  Runtime State
        // ──────────────────────────────────────────────

        // HP
        private float _targetHpFill = 1f;
        private float _currentHpFill = 1f;
        private float _maxHp = 100f;
        private float _currentHp = 100f;

        // Energy
        private float _targetEnergyFill = 1f;
        private float _currentEnergyFill = 1f;

        // Kill counter
        private int _killCount;

        // Damage flash
        private float _flashTimer;
        private bool _isFlashing;

        // Skill cooldown
        private float _skill1CooldownTimer;
        private bool _skill1OnCooldown;

        // ──────────────────────────────────────────────
        //  Unity Lifecycle
        // ──────────────────────────────────────────────

        private void OnEnable()
        {
            GameEvents.OnPlayerHit += HandlePlayerHit;
            GameEvents.OnEnergyChanged += HandleEnergyChanged;
            GameEvents.OnEnemyKilled += HandleEnemyKilled;
            GameEvents.OnSkillUsed += HandleSkillUsed;
        }

        private void OnDisable()
        {
            GameEvents.OnPlayerHit -= HandlePlayerHit;
            GameEvents.OnEnergyChanged -= HandleEnergyChanged;
            GameEvents.OnEnemyKilled -= HandleEnemyKilled;
            GameEvents.OnSkillUsed -= HandleSkillUsed;
        }

        private void Start()
        {
            // Initialize UI to full
            _killCount = 0;
            UpdateKillCountText();

            if (_damageFlash != null)
                _damageFlash.alpha = 0f;

            if (_skill1CooldownOverlay != null)
                _skill1CooldownOverlay.fillAmount = 0f;
        }

        private void Update()
        {
            float dt = Time.deltaTime;

            UpdateHpBar(dt);
            UpdateEnergyBar(dt);
            UpdateDamageFlash(dt);
            UpdateSkillCooldown(dt);
        }

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary>
        /// Sets the HP values directly (e.g., on initialization or full heal).
        /// </summary>
        /// <param name="current">Current HP.</param>
        /// <param name="max">Maximum HP.</param>
        public void SetHp(float current, float max)
        {
            _currentHp = current;
            _maxHp = Mathf.Max(max, 1f);
            _targetHpFill = _currentHp / _maxHp;
        }

        /// <summary>
        /// Sets skill 1 cooldown duration for the radial overlay.
        /// </summary>
        public void SetSkill1Cooldown(float cooldownSeconds)
        {
            _skill1Cooldown = Mathf.Max(cooldownSeconds, 0.1f);
        }

        // ──────────────────────────────────────────────
        //  Event Handlers
        // ──────────────────────────────────────────────

        private void HandlePlayerHit(float damage)
        {
            _currentHp = Mathf.Max(_currentHp - damage, 0f);
            _targetHpFill = _currentHp / _maxHp;

            // Trigger damage flash
            TriggerDamageFlash();
        }

        private void HandleEnergyChanged(float current, float max)
        {
            float safeMax = Mathf.Max(max, 1f);
            _targetEnergyFill = current / safeMax;
        }

        private void HandleEnemyKilled(GameObject enemy)
        {
            _killCount++;
            UpdateKillCountText();
        }

        private void HandleSkillUsed(string skillName)
        {
            // For now, any skill triggers the skill1 cooldown overlay.
            // Extend with a skill name check for multiple skills.
            _skill1OnCooldown = true;
            _skill1CooldownTimer = _skill1Cooldown;
        }

        // ──────────────────────────────────────────────
        //  HP Bar
        // ──────────────────────────────────────────────

        private void UpdateHpBar(float dt)
        {
            if (_hpBar == null) return;

            _currentHpFill = Mathf.Lerp(_currentHpFill, _targetHpFill, _barLerpSpeed * dt);
            _hpBar.fillAmount = _currentHpFill;
        }

        // ──────────────────────────────────────────────
        //  Energy Bar
        // ──────────────────────────────────────────────

        private void UpdateEnergyBar(float dt)
        {
            if (_energyBar == null) return;

            _currentEnergyFill = Mathf.Lerp(_currentEnergyFill, _targetEnergyFill, _barLerpSpeed * dt);
            _energyBar.fillAmount = _currentEnergyFill;
        }

        // ──────────────────────────────────────────────
        //  Damage Flash
        // ──────────────────────────────────────────────

        private void TriggerDamageFlash()
        {
            _isFlashing = true;
            _flashTimer = _flashDuration;

            if (_damageFlash != null)
                _damageFlash.alpha = _flashPeakAlpha;
        }

        private void UpdateDamageFlash(float dt)
        {
            if (!_isFlashing || _damageFlash == null) return;

            _flashTimer -= dt;

            if (_flashTimer <= 0f)
            {
                _damageFlash.alpha = 0f;
                _isFlashing = false;
            }
            else
            {
                // Fade from peak toward 0 over the duration
                float t = _flashTimer / _flashDuration;
                _damageFlash.alpha = Mathf.Lerp(0f, _flashPeakAlpha, t);
            }
        }

        // ──────────────────────────────────────────────
        //  Skill Cooldown
        // ──────────────────────────────────────────────

        private void UpdateSkillCooldown(float dt)
        {
            if (!_skill1OnCooldown || _skill1CooldownOverlay == null) return;

            _skill1CooldownTimer -= dt;

            if (_skill1CooldownTimer <= 0f)
            {
                _skill1CooldownOverlay.fillAmount = 0f;
                _skill1OnCooldown = false;
            }
            else
            {
                // Radial fill from 1 → 0 as cooldown progresses
                _skill1CooldownOverlay.fillAmount = _skill1CooldownTimer / _skill1Cooldown;
            }
        }

        // ──────────────────────────────────────────────
        //  Kill Counter
        // ──────────────────────────────────────────────

        private void UpdateKillCountText()
        {
            if (_killCountText != null)
                _killCountText.text = _killCount.ToString();
        }
    }
}
