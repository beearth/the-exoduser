export function buildPixelLabRequest({ baseUrl, apiKey, path, method = 'GET', body }) {
  if (!apiKey || !String(apiKey).trim()) {
    throw new Error('PixelLab API key is missing');
  }
  if (!baseUrl || !String(baseUrl).trim()) {
    throw new Error('PixelLab base url is missing');
  }
  if (!path || typeof path !== 'string' || !path.startsWith('/')) {
    throw new Error('path must start with /');
  }

  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.replace(/^\/+/, '');
  const url = new URL(normalizedPath, base).toString();
  const upperMethod = String(method || 'GET').toUpperCase();
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  const init = { method: upperMethod, headers };
  if (body !== undefined && upperMethod !== 'GET' && upperMethod !== 'HEAD') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
  }
  return { url, init };
}
