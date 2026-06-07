import { createTRPCClient, unstable_httpBatchStreamLink } from '@trpc/client';
import { getBaseTrcpUrl } from 'src/app/_providers/_trpc/react';
import { type AppRouter } from 'src/server/api/root';
import SuperJSON from 'superjson';

export const vanillaTRCP = createTRPCClient<AppRouter>({
  links: [
    unstable_httpBatchStreamLink({
      transformer: SuperJSON,
      url: getBaseTrcpUrl() + '/api/trpc',
      headers: () => {
        const headers = new Headers();
        headers.set('x-trpc-source', 'nextjs-react');
        return headers;
      },
    }),
  ],
});