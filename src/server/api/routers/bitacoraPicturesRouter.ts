import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { bitacoraPicturesRepo } from "src/server/entities/bitacoraPictures/db/documentModel";
import { bitacoraRepo } from "src/server/entities/bitacora/db/documentModel";
import {
  picturesGetByDateSchema,
  picturesUpsertSchema,
  galleryGetSchema,
} from "src/server/entities/bitacoraPictures/validations/model";
import { type BitacoraPicturesFromDB } from "src/server/entities/bitacoraPictures/bitacoraPicturesTypes";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";

dayjs.extend(isoWeek);

const ITEMS_PER_PAGE = 10;

type Frequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

function sampleByFrequency(dates: string[], frequency: Frequency): string[] {
  if (frequency === 'daily') return dates;

  const groups = new Map<string, string[]>();

  for (const date of dates) {
    const d = dayjs(date);
    let key: string;

    if (frequency === 'weekly') {
      key = d.isoWeekday(1).format('YYYY-MM-DD');
    } else if (frequency === 'monthly') {
      key = d.format('YYYY-MM') + '-01';
    } else {
      key = d.format('YYYY') + '-01-01';
    }

    const group = groups.get(key) ?? [];
    group.push(date);
    groups.set(key, group);
  }

  const sampled: string[] = [];

  for (const [intervalStart, groupDates] of groups) {
    const target = dayjs(intervalStart);
    const closest = groupDates.reduce((best, current) => {
      const bestDiff = Math.abs(dayjs(best).diff(target, 'day'));
      const currentDiff = Math.abs(dayjs(current).diff(target, 'day'));
      return currentDiff < bestDiff ? current : best;
    });
    sampled.push(closest);
  }

  return sampled.sort();
}

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

  getGallery: publicProcedure
    .input(async (raw) => await galleryGetSchema.validate(raw))
    .query(async ({ input }) => {
      const { from, to, frequency, page } = input;

      const allEntries = await bitacoraRepo.find();
      const withPictures = allEntries.results.filter(
        (entry) => entry.id >= from && entry.id <= to && entry.hasPictures
      );

      const candidateDates = withPictures.map((e) => e.id).sort();
      const sampledDates = sampleByFrequency(candidateDates, frequency as Frequency);

      const totalPages = Math.max(1, Math.ceil(sampledDates.length / ITEMS_PER_PAGE));
      const currentPage = Math.min(page, totalPages);
      const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
      const pageDates = sampledDates.slice(startIdx, startIdx + ITEMS_PER_PAGE);

      const entryMap = new Map(withPictures.map((e) => [e.id, e]));

      const items = await Promise.all(
        pageDates.map(async (date) => {
          const entry = entryMap.get(date)!;
          const picDoc = await bitacoraPicturesRepo.findById(date);
          const images = picDoc ? (picDoc.data as { images: Array<{ base64: string; createdAt: string }> }).images : [];
          return { date, peso: entry.peso, images };
        })
      );

      return { items, totalPages, currentPage };
    }),
});
