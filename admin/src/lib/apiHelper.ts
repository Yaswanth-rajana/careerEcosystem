export async function fetchAdminApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data?.error || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }

  return data as T;
}
