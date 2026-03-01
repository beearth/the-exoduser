using UnityEngine;
using UnityEngine.SceneManagement;

namespace Exoduser.Core
{
    /// <summary>
    /// Game bootstrap — runs once on Boot scene, initializes all core services,
    /// then loads the gameplay scene.
    /// Attach to a GameObject in Boot.unity. The GameObject is marked DontDestroyOnLoad
    /// so that services persist across scene transitions.
    /// </summary>
    public class Bootstrap : MonoBehaviour
    {
        /// <summary>
        /// Name of the gameplay scene to load after initialization.
        /// Must be added to Build Settings.
        /// </summary>
        [SerializeField] private string _gameplaySceneName = "Prototype_Combat";

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);

            // Register core services into the ServiceLocator
            ServiceLocator.Register(new ObjectPool());
            ServiceLocator.Register(new GameEvents());

            Debug.Log("[Bootstrap] Core services registered.");
        }

        private void Start()
        {
            // Transition to the gameplay scene
            if (!string.IsNullOrEmpty(_gameplaySceneName))
            {
                SceneManager.LoadScene(_gameplaySceneName, LoadSceneMode.Single);
            }
            else
            {
                Debug.LogWarning("[Bootstrap] No gameplay scene name configured.");
            }
        }
    }
}
