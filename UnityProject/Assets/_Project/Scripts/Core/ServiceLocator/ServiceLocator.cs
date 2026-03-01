using System;
using System.Collections.Generic;

namespace Exoduser.Core
{
    /// <summary>
    /// Simple static service locator. Stores services by type in a dictionary.
    /// Avoids the singleton anti-pattern while providing global access to shared services.
    /// </summary>
    /// <remarks>
    /// Register services during bootstrap. Retrieve them anywhere via
    /// <see cref="Get{T}"/> or <see cref="TryGet{T}"/>.
    /// Call <see cref="Clear"/> on application quit or between test runs.
    /// </remarks>
    public static class ServiceLocator
    {
        private static readonly Dictionary<Type, object> _services = new Dictionary<Type, object>();

        /// <summary>
        /// Registers a service instance. If a service of the same type already exists,
        /// it is silently overwritten.
        /// </summary>
        /// <typeparam name="T">The type used as the lookup key.</typeparam>
        /// <param name="service">The service instance to register. Must not be null.</param>
        /// <exception cref="ArgumentNullException">Thrown when <paramref name="service"/> is null.</exception>
        public static void Register<T>(T service)
        {
            if (service == null)
                throw new ArgumentNullException(nameof(service));

            _services[typeof(T)] = service;
        }

        /// <summary>
        /// Retrieves a previously registered service.
        /// </summary>
        /// <typeparam name="T">The type of the service to retrieve.</typeparam>
        /// <returns>The service instance.</returns>
        /// <exception cref="InvalidOperationException">
        /// Thrown when no service of type <typeparamref name="T"/> has been registered.
        /// </exception>
        public static T Get<T>()
        {
            if (_services.TryGetValue(typeof(T), out object service))
                return (T)service;

            throw new InvalidOperationException(
                $"[ServiceLocator] Service of type {typeof(T).Name} is not registered. " +
                "Did you forget to call Register<T>() in Bootstrap?");
        }

        /// <summary>
        /// Attempts to retrieve a registered service without throwing on failure.
        /// </summary>
        /// <typeparam name="T">The type of the service to retrieve.</typeparam>
        /// <param name="service">
        /// When this method returns, contains the service instance if found;
        /// otherwise, the default value for <typeparamref name="T"/>.
        /// </param>
        /// <returns><c>true</c> if the service was found; otherwise <c>false</c>.</returns>
        public static bool TryGet<T>(out T service)
        {
            if (_services.TryGetValue(typeof(T), out object obj))
            {
                service = (T)obj;
                return true;
            }

            service = default;
            return false;
        }

        /// <summary>
        /// Removes a specific service if it matches the currently registered instance.
        /// </summary>
        /// <typeparam name="T">The type of the service to remove.</typeparam>
        /// <param name="service">The service instance to deregister.</param>
        public static void Deregister<T>(T service)
        {
            if (_services.TryGetValue(typeof(T), out object current) && ReferenceEquals(current, service))
                _services.Remove(typeof(T));
        }

        /// <summary>
        /// Removes all registered services. Call on application quit or between test runs
        /// to prevent stale references.
        /// </summary>
        public static void Clear()
        {
            _services.Clear();
        }
    }
}
