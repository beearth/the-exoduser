using System;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.Core.Utils
{
    /// <summary>
    /// Opaque handle returned when scheduling a timer. Used to cancel, pause, or
    /// resume the timer later.
    /// </summary>
    public readonly struct TimerHandle : IEquatable<TimerHandle>
    {
        /// <summary>Unique identifier for this timer instance.</summary>
        public readonly int Id;

        internal TimerHandle(int id) => Id = id;

        /// <summary>A handle that refers to no timer.</summary>
        public static readonly TimerHandle None = new TimerHandle(0);

        /// <summary>Returns true if this handle refers to a valid (non-zero) timer.</summary>
        public bool IsValid => Id != 0;

        public bool Equals(TimerHandle other) => Id == other.Id;
        public override bool Equals(object obj) => obj is TimerHandle other && Equals(other);
        public override int GetHashCode() => Id;
        public static bool operator ==(TimerHandle a, TimerHandle b) => a.Id == b.Id;
        public static bool operator !=(TimerHandle a, TimerHandle b) => a.Id != b.Id;
        public override string ToString() => $"TimerHandle({Id})";
    }

    /// <summary>
    /// Lightweight Update-based timer manager. Attach to a persistent GameObject
    /// (e.g. the Bootstrap object). Avoids coroutine allocation overhead.
    /// </summary>
    /// <remarks>
    /// <code>
    /// TimerHandle h = timer.Schedule(2f, () => Debug.Log("Done!"));
    /// timer.Cancel(h);
    /// </code>
    /// </remarks>
    public class Timer : MonoBehaviour
    {
        /// <summary>
        /// Internal entry tracking a single scheduled timer.
        /// </summary>
        private class TimerEntry
        {
            public int Id;
            public float Remaining;
            public float Interval;
            public Action OnComplete;
            public Action OnTick;
            public int RepeatCount;   // -1 = infinite
            public int TicksRemaining;
            public bool IsPaused;
            public bool IsMarkedForRemoval;
        }

        private readonly List<TimerEntry> _timers = new List<TimerEntry>();
        private readonly List<TimerEntry> _pendingAdd = new List<TimerEntry>();
        private int _nextId = 1;

        /// <summary>
        /// Schedules a one-shot timer.
        /// </summary>
        /// <param name="duration">Seconds until <paramref name="onComplete"/> fires.</param>
        /// <param name="onComplete">Callback invoked when the timer elapses.</param>
        /// <returns>A handle that can be used to cancel, pause, or resume.</returns>
        public TimerHandle Schedule(float duration, Action onComplete)
        {
            if (onComplete == null)
            {
                Debug.LogWarning("[Timer] Schedule called with null callback.");
                return TimerHandle.None;
            }

            var entry = new TimerEntry
            {
                Id = _nextId++,
                Remaining = Mathf.Max(0f, duration),
                Interval = 0f,
                OnComplete = onComplete,
                OnTick = null,
                RepeatCount = 0,
                TicksRemaining = 0,
                IsPaused = false,
                IsMarkedForRemoval = false
            };

            _pendingAdd.Add(entry);
            return new TimerHandle(entry.Id);
        }

        /// <summary>
        /// Schedules a repeating timer.
        /// </summary>
        /// <param name="interval">Seconds between each tick.</param>
        /// <param name="onTick">Callback invoked on each tick.</param>
        /// <param name="repeatCount">
        /// Number of times to tick. Use -1 for infinite repetition.
        /// </param>
        /// <returns>A handle that can be used to cancel, pause, or resume.</returns>
        public TimerHandle ScheduleRepeating(float interval, Action onTick, int repeatCount = -1)
        {
            if (onTick == null)
            {
                Debug.LogWarning("[Timer] ScheduleRepeating called with null callback.");
                return TimerHandle.None;
            }

            var entry = new TimerEntry
            {
                Id = _nextId++,
                Remaining = Mathf.Max(0.001f, interval),
                Interval = Mathf.Max(0.001f, interval),
                OnComplete = null,
                OnTick = onTick,
                RepeatCount = repeatCount,
                TicksRemaining = repeatCount,
                IsPaused = false,
                IsMarkedForRemoval = false
            };

            _pendingAdd.Add(entry);
            return new TimerHandle(entry.Id);
        }

        /// <summary>
        /// Cancels a previously scheduled timer. Safe to call with an invalid handle.
        /// </summary>
        public void Cancel(TimerHandle handle)
        {
            if (!handle.IsValid) return;
            MarkForRemoval(handle.Id);
        }

        /// <summary>
        /// Pauses a running timer. Its remaining time is preserved.
        /// </summary>
        public void Pause(TimerHandle handle)
        {
            if (!handle.IsValid) return;
            SetPaused(handle.Id, true);
        }

        /// <summary>
        /// Resumes a paused timer.
        /// </summary>
        public void Resume(TimerHandle handle)
        {
            if (!handle.IsValid) return;
            SetPaused(handle.Id, false);
        }

        // ──────────────────────────────────────────────
        //  MonoBehaviour
        // ──────────────────────────────────────────────

        private void Update()
        {
            // Flush pending adds
            if (_pendingAdd.Count > 0)
            {
                _timers.AddRange(_pendingAdd);
                _pendingAdd.Clear();
            }

            float dt = Time.deltaTime;

            for (int i = _timers.Count - 1; i >= 0; i--)
            {
                TimerEntry t = _timers[i];

                if (t.IsMarkedForRemoval)
                {
                    _timers.RemoveAt(i);
                    continue;
                }

                if (t.IsPaused) continue;

                t.Remaining -= dt;

                if (t.Remaining <= 0f)
                {
                    if (t.Interval > 0f)
                    {
                        // Repeating timer
                        try { t.OnTick?.Invoke(); }
                        catch (Exception ex) { Debug.LogException(ex); }

                        if (t.RepeatCount > 0)
                        {
                            t.TicksRemaining--;
                            if (t.TicksRemaining <= 0)
                            {
                                t.IsMarkedForRemoval = true;
                                continue;
                            }
                        }
                        // Reset for next tick
                        t.Remaining += t.Interval;
                    }
                    else
                    {
                        // One-shot timer
                        try { t.OnComplete?.Invoke(); }
                        catch (Exception ex) { Debug.LogException(ex); }

                        t.IsMarkedForRemoval = true;
                    }
                }
            }
        }

        // ──────────────────────────────────────────────
        //  Internal helpers
        // ──────────────────────────────────────────────

        private void MarkForRemoval(int id)
        {
            for (int i = 0; i < _timers.Count; i++)
            {
                if (_timers[i].Id == id)
                {
                    _timers[i].IsMarkedForRemoval = true;
                    return;
                }
            }

            for (int i = 0; i < _pendingAdd.Count; i++)
            {
                if (_pendingAdd[i].Id == id)
                {
                    _pendingAdd[i].IsMarkedForRemoval = true;
                    return;
                }
            }
        }

        private void SetPaused(int id, bool paused)
        {
            for (int i = 0; i < _timers.Count; i++)
            {
                if (_timers[i].Id == id)
                {
                    _timers[i].IsPaused = paused;
                    return;
                }
            }

            for (int i = 0; i < _pendingAdd.Count; i++)
            {
                if (_pendingAdd[i].Id == id)
                {
                    _pendingAdd[i].IsPaused = paused;
                    return;
                }
            }
        }
    }
}
