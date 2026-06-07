import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { bitacoraRepo } from "src/server/entities/bitacora/db/documentModel";
import {
  bitacoraUpsertSchema,
  bitacoraDeleteSchema,
  bitacoraGetByMonthSchema,
} from "src/server/entities/bitacora/validations/model";
import { type BitacoraFromDB, type UpsertBitacora } from "src/server/entities/bitacora/bitacoraTypes";

export const bitacoraRouter = createTRPCRouter({
  getByMonth: publicProcedure
    .input(async (raw) => await bitacoraGetByMonthSchema.validate(raw))
    .query(async ({ input }) => {
      const { month, year } = input;
      const monthStr = String(month + 1).padStart(2, '0');
      const prefix = `${year}-${monthStr}`;

      const result = await bitacoraRepo.find();
      const entries: BitacoraFromDB[] = result.results.filter(
        (entry) => entry.id.startsWith(prefix)
      );
      return entries;
    }),

  upsert: publicProcedure
    .input(async (raw) => await bitacoraUpsertSchema.validate(raw) as unknown as UpsertBitacora)
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await bitacoraRepo.upsert({ id, ...data });
      return { success: true, id };
    }),

  delete: publicProcedure
    .input(async (raw) => await bitacoraDeleteSchema.validate(raw))
    .mutation(async ({ input }) => {
      await bitacoraRepo.delete(input.id);
      return { success: true, id: input.id };
    }),
});
