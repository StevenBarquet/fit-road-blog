import { bitacoraRouter } from "src/server/api/routers/bitacoraRouter";
import { createCallerFactory, createTRPCRouter } from "src/server/api/trpc";

export const appRouter = createTRPCRouter({
  bitacora: bitacoraRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
