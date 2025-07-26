import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../../../api/src/trpc/appRouter';

// Create tRPC React Query hooks
export const trpc = createTRPCReact<AppRouter>();

// Create vanilla tRPC client for non-React usage
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3001/trpc',
      // Add headers if needed (like auth tokens in the future)
      headers() {
        return {
          // Future: Add authorization headers
        };
      },
    }),
  ],
});

// Export the AppRouter type for use in components
export type { AppRouter };