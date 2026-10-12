const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export function getAdminApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_ADMIN_API_URL?.trim();

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api/admin`;
  }

  return '/api/admin';
}
