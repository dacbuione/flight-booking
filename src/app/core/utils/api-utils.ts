import { apiConfig } from '../config/api.config';

/**
 * Resolve an API endpoint by replacing URL parameters
 * @param endpoint The endpoint template with parameters like {id}
 * @param params Object containing parameter values to replace
 * @returns The resolved endpoint with replaced parameters
 */
export function resolveEndpoint(endpoint: string, params?: Record<string, string | number>): string {
  if (!params) {
    return endpoint;
  }

  let resolvedEndpoint = endpoint;
  
  // Replace each parameter in the URL
  Object.entries(params).forEach(([key, value]) => {
    resolvedEndpoint = resolvedEndpoint.replace(`{${key}}`, String(value));
  });
  
  return resolvedEndpoint;
}

/**
 * Get a configured endpoint from the API config with parameters resolved
 * @param category The endpoint category (e.g., 'auth', 'flights')
 * @param name The endpoint name within the category
 * @param params Parameters to resolve in the URL
 * @returns The resolved endpoint
 */
export function getConfigEndpoint(
  category: keyof typeof apiConfig.endpoints,
  name: string,
  params?: Record<string, string | number>
): string {
  const endpoints = apiConfig.endpoints[category] as Record<string, string>;
  const endpoint = endpoints[name];
  
  if (!endpoint) {
    console.warn(`Endpoint ${category}.${name} not found in API config`);
    return '';
  }
  
  return resolveEndpoint(endpoint, params);
} 