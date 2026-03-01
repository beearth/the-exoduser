using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace Exoduser.Core
{
    /// <summary>
    /// General-purpose GameObject pool. Manages multiple named pools, each backed
    /// by a prefab. Registered in <see cref="ServiceLocator"/> during bootstrap.
    /// </summary>
    /// <remarks>
    /// Usage:
    /// <code>
    /// var pool = ServiceLocator.Get&lt;ObjectPool&gt;();
    /// pool.CreatePool("Fireball", fireballPrefab, 20, vfxParent);
    /// GameObject fb = pool.Get("Fireball");
    /// pool.Return("Fireball", fb);
    /// </code>
    /// </remarks>
    public class ObjectPool
    {
        /// <summary>
        /// Internal metadata for a single named pool.
        /// </summary>
        private class PoolData
        {
            /// <summary>The prefab used to instantiate new objects.</summary>
            public GameObject Prefab;

            /// <summary>Parent transform for pooled (inactive) objects.</summary>
            public Transform Parent;

            /// <summary>Queue of currently inactive objects ready to be reused.</summary>
            public Queue<GameObject> Inactive;
        }

        private readonly Dictionary<string, PoolData> _pools = new Dictionary<string, PoolData>();

        /// <summary>
        /// Creates (or recreates) a named pool.
        /// </summary>
        /// <param name="key">Unique identifier for this pool.</param>
        /// <param name="prefab">The prefab to clone. Must not be null.</param>
        /// <param name="initialSize">Number of instances to pre-warm.</param>
        /// <param name="parent">
        /// Optional parent transform for inactive objects. Keeps the hierarchy tidy.
        /// </param>
        public void CreatePool(string key, GameObject prefab, int initialSize, Transform parent = null)
        {
            if (prefab == null)
            {
                Debug.LogError($"[ObjectPool] Cannot create pool '{key}' with a null prefab.");
                return;
            }

            var data = new PoolData
            {
                Prefab = prefab,
                Parent = parent,
                Inactive = new Queue<GameObject>(initialSize)
            };

            for (int i = 0; i < initialSize; i++)
            {
                GameObject obj = Object.Instantiate(prefab, parent);
                obj.SetActive(false);
                data.Inactive.Enqueue(obj);
            }

            _pools[key] = data;
        }

        /// <summary>
        /// Retrieves an object from the named pool, activating it and resetting
        /// its position to <see cref="Vector3.zero"/>.
        /// If the pool is empty, a new instance is created automatically.
        /// </summary>
        /// <param name="key">The pool identifier passed to <see cref="CreatePool"/>.</param>
        /// <returns>An active GameObject ready for use.</returns>
        public GameObject Get(string key)
        {
            if (!_pools.TryGetValue(key, out PoolData data))
            {
                Debug.LogError($"[ObjectPool] Pool '{key}' does not exist. Call CreatePool first.");
                return null;
            }

            GameObject obj;
            if (data.Inactive.Count > 0)
            {
                obj = data.Inactive.Dequeue();

                // Skip destroyed objects (scene unload, etc.)
                while (obj == null && data.Inactive.Count > 0)
                    obj = data.Inactive.Dequeue();

                if (obj == null)
                    obj = Expand(data);
            }
            else
            {
                obj = Expand(data);
            }

            obj.transform.position = Vector3.zero;
            obj.transform.rotation = Quaternion.identity;
            obj.SetActive(true);
            return obj;
        }

        /// <summary>
        /// Returns an object to the named pool, deactivating it immediately.
        /// </summary>
        /// <param name="key">The pool identifier.</param>
        /// <param name="obj">The GameObject to return. Must not be null.</param>
        public void Return(string key, GameObject obj)
        {
            if (obj == null) return;

            if (!_pools.TryGetValue(key, out PoolData data))
            {
                Debug.LogWarning($"[ObjectPool] Pool '{key}' not found. Destroying object instead.");
                Object.Destroy(obj);
                return;
            }

            obj.SetActive(false);
            if (data.Parent != null)
                obj.transform.SetParent(data.Parent);

            data.Inactive.Enqueue(obj);
        }

        /// <summary>
        /// Returns an object to the pool after a delay. Requires a MonoBehaviour
        /// host to run the coroutine on.
        /// </summary>
        /// <param name="key">The pool identifier.</param>
        /// <param name="obj">The GameObject to return.</param>
        /// <param name="delay">Seconds to wait before returning.</param>
        /// <param name="coroutineHost">
        /// A MonoBehaviour used to start the coroutine. If null, the object is
        /// returned immediately (no delay).
        /// </param>
        public void ReturnDelayed(string key, GameObject obj, float delay, MonoBehaviour coroutineHost)
        {
            if (coroutineHost == null || delay <= 0f)
            {
                Return(key, obj);
                return;
            }

            coroutineHost.StartCoroutine(ReturnDelayedCoroutine(key, obj, delay));
        }

        /// <summary>
        /// Returns true if a pool with the given key has been created.
        /// </summary>
        public bool HasPool(string key) => _pools.ContainsKey(key);

        /// <summary>
        /// Returns the number of inactive (available) objects in the named pool.
        /// Returns -1 if the pool does not exist.
        /// </summary>
        public int CountInactive(string key)
        {
            return _pools.TryGetValue(key, out PoolData data) ? data.Inactive.Count : -1;
        }

        // ──────────────────────────────────────────────
        //  Internal
        // ──────────────────────────────────────────────

        private GameObject Expand(PoolData data)
        {
            GameObject obj = Object.Instantiate(data.Prefab, data.Parent);
            obj.SetActive(false);
            return obj;
        }

        private IEnumerator ReturnDelayedCoroutine(string key, GameObject obj, float delay)
        {
            yield return new WaitForSeconds(delay);
            Return(key, obj);
        }
    }
}
