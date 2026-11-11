const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
export async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { accept: 'application/json', ...options.headers }, next: options.cache === 'no-store' ? undefined : { revalidate: 60 } });
  if (!response.ok) { if (response.status === 404) return null; throw new Error(`Showcase API returned ${response.status}`); }
  return (await response.json()).data;
}
export function imageUrl(media, width = 800) { return media?.secureUrl ? media.secureUrl.replace('/upload/', `/upload/f_auto,q_auto,w_${width},c_limit/`) : null; }
