import { bitacoraRouter } from "src/server/api/routers/bitacoraRouter";
import { bitacoraPicturesRouter } from "src/server/api/routers/bitacoraPicturesRouter";
import { createCallerFactory, createTRPCRouter } from "src/server/api/trpc";

export const appRouter = createTRPCRouter({
  bitacora: bitacoraRouter,
  bitacoraPictures: bitacoraPicturesRouter,
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
