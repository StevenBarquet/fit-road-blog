import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { bitacoraPicturesRepo } from "src/server/entities/bitacoraPictures/db/documentModel";
import { bitacoraRepo } from "src/server/entities/bitacora/db/documentModel";
import {
  picturesGetByDateSchema,
  picturesUpsertSchema,
} from "src/server/entities/bitacoraPictures/validations/model";
import { type BitacoraPicturesFromDB } from "src/server/entities/bitacoraPictures/bitacoraPicturesTypes";

export const bitacoraPicturesRouter = createTRPCRouter({
  getByDate: publicProcedure
    .input(async (raw) => await picturesGetByDateSchema.validate(raw))
    .query(async ({ input }) => {
      const result = await bitacoraPicturesRepo.findById(input.id);
      if (!result) return null;
      return { id: result.id, ...result.data } as BitacoraPicturesFromDB;
    }),

  upsert: publicProcedure
    .input(async (raw) => await picturesUpsertSchema.validate(raw))
    .mutation(async ({ input }) => {
      const { id, images } = input;

      if (images.length === 0) {
        await bitacoraPicturesRepo.delete(id);
        await bitacoraRepo.upsert({ id, hasPictures: false });
      } else {
        await bitacoraPicturesRepo.upsert({ id, images });
        await bitacoraRepo.upsert({ id, hasPictures: true });
      }

      return { success: true, id };
    }),
});
