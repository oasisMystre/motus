import { format } from "util";
import superjson from "superjson";
import { getItemAsync } from "expo-secure-store";
import { type AppRouter, transformer } from "@motus/server";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  httpLink,
  splitLink,
} from "@trpc/client";

export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

const queryClient = new QueryClient();
const options = {
  transformer,
  url: process.env.EXPO_PUBLIC_BASE_API_URL!,
  async headers() {
    const token = await getItemAsync("firebase.token");
    const sessionToken = await getItemAsync("firebase.session");

    const headers = new Headers();
    if (token) headers.set("authorization", format("Bearer %s", token));
    if (sessionToken) headers.set("x-session-token", sessionToken);
    return headers;
  },
};
const trpcClient = createTRPCClient<AppRouter>({
  links: [
    splitLink({
      condition(op) {
        return false;
      },
      true: httpLink(options),
      false: httpBatchLink(options),
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
