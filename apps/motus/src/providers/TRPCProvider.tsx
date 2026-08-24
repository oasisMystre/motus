import { format } from "util";
import superjson from "superjson";
import type { AppRouter } from "@motus/server";
import { getItemAsync } from "expo-secure-store";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import {
  defaultShouldDehydrateQuery,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
    dehydrate: {
      shouldDehydrateQuery(query) {
        return (
          defaultShouldDehydrateQuery(query) || query.state.status === "pending"
        );
      },
    },
  },
});
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: process.env.EXPO_PUBLIC_BASE_API_URL!,
      async headers() {
        const token = await getItemAsync("firebase.token");
        const sessionToken = await getItemAsync("firebase.session");

        const headers = new Headers();
        if (token) headers.set("authorization", format("Bearer %s", token));
        if (sessionToken) headers.set("x-session-token", sessionToken);
        return headers;
      },
    }),
  ],
});

export default function _TRPCProvider({ children }: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider
        trpcClient={trpcClient}
        queryClient={queryClient}
      >
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
