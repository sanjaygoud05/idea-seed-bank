import { useQuery, UseQueryOptions } from '@tanstack/react-query';

/**
 * Thin wrapper around `useQuery` for the mock services layer.
 * When services are wired to Express/GraphQL, callers stay unchanged.
 */
export function useMockQuery<T>(
  key: readonly unknown[],
  fetcher: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error, T, readonly unknown[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<T, Error, T, readonly unknown[]>({
    queryKey: key,
    queryFn: fetcher,
    staleTime: 60_000,
    ...options,
  });
}
