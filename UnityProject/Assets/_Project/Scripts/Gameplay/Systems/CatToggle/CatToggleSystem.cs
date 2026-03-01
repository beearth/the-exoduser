using System;
using System.Collections.Generic;
using UnityEngine;
using Exoduser.Gameplay.Combat.Damage;

namespace Exoduser.Gameplay.Systems.CatToggle
{
    /// <summary>
    /// Black Cat Element Toggle system (검은 고양이 속성 토글).
    /// Manages the player's active element affinity and cycles through unlocked
    /// elements. Attach to the player GameObject.
    /// </summary>
    public class CatToggleSystem : MonoBehaviour
    {
        // ──────────────────────────────────────────────
        //  Events
        // ──────────────────────────────────────────────

        /// <summary>
        /// Fired when the active element changes.
        /// Parameters: (previousElement, newElement).
        /// </summary>
        public event Action<Element, Element> OnElementChanged;

        // ──────────────────────────────────────────────
        //  Serialized
        // ──────────────────────────────────────────────

        [Header("Element Configuration")]
        [SerializeField, Tooltip("The element the player starts with.")]
        private Element _startingElement = Element.Physical;

        [Header("Visual Feedback")]
        [SerializeField, Tooltip("Optional renderer whose material tint changes with element.")]
        private Renderer _playerRenderer;

        [SerializeField, Tooltip("Optional outline/sprite renderer for element color glow.")]
        private SpriteRenderer _outlineRenderer;

        [SerializeField, Tooltip("Material property name for tint color.")]
        private string _tintPropertyName = "_BaseColor";

        // ──────────────────────────────────────────────
        //  Element → Color Mapping
        // ──────────────────────────────────────────────

        /// <summary>
        /// Default color mapping for each element. Can be overridden from the Inspector
        /// by setting values in <see cref="_elementColorOverrides"/>.
        /// </summary>
        private static readonly Dictionary<Element, Color> DefaultElementColors = new()
        {
            { Element.Physical,  new Color(0.85f, 0.85f, 0.85f, 1f) }, // Silver-white
            { Element.Fire,      new Color(1.0f,  0.35f, 0.1f,  1f) }, // Orange-red
            { Element.Ice,       new Color(0.3f,  0.75f, 1.0f,  1f) }, // Light blue
            { Element.Dark,      new Color(0.4f,  0.1f,  0.6f,  1f) }, // Deep purple
            { Element.Lightning, new Color(1.0f,  0.95f, 0.3f,  1f) }, // Electric yellow
        };

        [Header("Color Overrides (optional)")]
        [SerializeField, Tooltip("Override colors for specific elements. Leave empty to use defaults.")]
        private ElementColorEntry[] _elementColorOverrides;

        /// <summary>
        /// Serializable entry for Inspector-editable element-to-color mapping.
        /// </summary>
        [Serializable]
        public struct ElementColorEntry
        {
            public Element Element;
            public Color Color;
        }

        // ──────────────────────────────────────────────
        //  Runtime State
        // ──────────────────────────────────────────────

        private Element _currentElement;
        private readonly List<Element> _availableElements = new();
        private int _currentIndex;

        // Resolved color map (defaults + overrides)
        private Dictionary<Element, Color> _elementColors;

        // Material property block for non-destructive tinting
        private MaterialPropertyBlock _propBlock;

        // ──────────────────────────────────────────────
        //  Public API
        // ──────────────────────────────────────────────

        /// <summary>The player's currently active element.</summary>
        public Element CurrentElement => _currentElement;

        /// <summary>Returns the current element. Alias for <see cref="CurrentElement"/>.</summary>
        public Element GetCurrentElement() => _currentElement;

        /// <summary>
        /// Read-only view of elements the player has unlocked.
        /// </summary>
        public IReadOnlyList<Element> AvailableElements => _availableElements;

        /// <summary>
        /// Cycles to the next available element in the unlock list.
        /// Wraps around at the end.
        /// </summary>
        public void ToggleElement()
        {
            if (_availableElements.Count <= 1) return;

            Element previous = _currentElement;
            _currentIndex = (_currentIndex + 1) % _availableElements.Count;
            _currentElement = _availableElements[_currentIndex];

            ApplyVisualFeedback();
            OnElementChanged?.Invoke(previous, _currentElement);
        }

        /// <summary>
        /// Sets the active element directly (must already be unlocked).
        /// </summary>
        /// <param name="element">The element to switch to.</param>
        /// <returns>True if the element was already unlocked and is now active.</returns>
        public bool SetElement(Element element)
        {
            int index = _availableElements.IndexOf(element);
            if (index < 0) return false;

            Element previous = _currentElement;
            _currentIndex = index;
            _currentElement = element;

            ApplyVisualFeedback();
            if (previous != _currentElement)
                OnElementChanged?.Invoke(previous, _currentElement);

            return true;
        }

        /// <summary>
        /// Unlocks a new element, making it available for toggling.
        /// No-op if the element is already unlocked.
        /// </summary>
        /// <param name="element">The element to unlock.</param>
        public void UnlockElement(Element element)
        {
            if (_availableElements.Contains(element)) return;

            _availableElements.Add(element);
        }

        /// <summary>
        /// Returns the color associated with the given element.
        /// </summary>
        public Color GetElementColor(Element element)
        {
            if (_elementColors != null && _elementColors.TryGetValue(element, out Color c))
                return c;

            if (DefaultElementColors.TryGetValue(element, out Color dc))
                return dc;

            return Color.white;
        }

        // ──────────────────────────────────────────────
        //  Unity Lifecycle
        // ──────────────────────────────────────────────

        private void Awake()
        {
            // Build resolved color map
            _elementColors = new Dictionary<Element, Color>(DefaultElementColors);
            if (_elementColorOverrides != null)
            {
                foreach (var entry in _elementColorOverrides)
                    _elementColors[entry.Element] = entry.Color;
            }

            _propBlock = new MaterialPropertyBlock();

            // Ensure starting element is always available
            if (!_availableElements.Contains(_startingElement))
                _availableElements.Insert(0, _startingElement);

            _currentElement = _startingElement;
            _currentIndex = _availableElements.IndexOf(_startingElement);
        }

        private void Start()
        {
            ApplyVisualFeedback();
        }

        // ──────────────────────────────────────────────
        //  Visual Feedback
        // ──────────────────────────────────────────────

        private void ApplyVisualFeedback()
        {
            Color color = GetElementColor(_currentElement);

            // Tint the main renderer via MaterialPropertyBlock (non-destructive)
            if (_playerRenderer != null)
            {
                _playerRenderer.GetPropertyBlock(_propBlock);
                _propBlock.SetColor(_tintPropertyName, color);
                _playerRenderer.SetPropertyBlock(_propBlock);
            }

            // Tint outline/sprite renderer directly
            if (_outlineRenderer != null)
            {
                _outlineRenderer.color = color;
            }
        }
    }
}
