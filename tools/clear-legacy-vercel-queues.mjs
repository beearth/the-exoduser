import { pathToFileURL } from 'node:url';

export const TEAM_ID = 'team_2BOa3cZFRrB3zZbZXIIdKhsf';
const LEGACY_PROJECTS = ['hell', 'hell-build'];
const ACTIVE_STATES = ['QUEUED', 'BUILDING', 'INITIALIZING'];

// Manual maintenance only: preserve completed deployments and the canonical project.
export async function clearLegacyQueues(request, token) {
  if (!token) throw new Error('VERCEL_TOKEN is required');
  const call = async (path, method, query = {}) => {
    const url = new URL(path, 'https://api.vercel.com');
    url.search = new URLSearchParams({ teamId: TEAM_ID, ...query });
    const response = await request(url, {
      method, headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) throw new Error(`Vercel ${method} failed (${response.status})`);
    return response.json();
  };
  const counts = {};
  for (const name of LEGACY_PROJECTS) {
    counts[name] = 0;
    for (const state of ACTIVE_STATES) {
      let emptied = false;
      for (let batch = 0; batch < 20; batch++) {
        const data = await call('/v7/deployments', 'GET', { projectId: name, state, limit: '100' });
        if (!Array.isArray(data.deployments)) throw new Error('Invalid deployment list');
        if (data.deployments.some(d => d.name !== name)) throw new Error('Unexpected project in deployment list');
        const pending = data.deployments.filter(d => ACTIVE_STATES.includes(d.state));
        if (!pending.length) { emptied = true; break; }
        for (const deployment of pending) {
          if (!/^dpl_[A-Za-z0-9]+$/.test(deployment.uid)) throw new Error('Invalid deployment identifier');
          const result = await call(`/v12/deployments/${deployment.uid}/cancel`, 'PATCH');
          if (result.readyState !== 'CANCELED') throw new Error('Cancellation was not confirmed');
          counts[name]++;
        }
      }
      if (!emptied) throw new Error(`Queue did not empty for ${name}/${state}`);
    }
  }
  return counts;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!process.argv.includes('--cancel')) throw new Error('Explicit --cancel is required');
  console.log(JSON.stringify(await clearLegacyQueues(fetch, process.env.VERCEL_TOKEN)));
}
