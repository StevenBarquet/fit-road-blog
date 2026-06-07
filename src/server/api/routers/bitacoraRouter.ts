import { createTRPCRouter, publicProcedure } from "src/server/api/trpc";
import { type BitacoraFromDB, type Calificacion, type Nivel } from "src/server/entities/bitacora/bitacoraTypes";
import * as yup from 'yup';

const getByMonthSchema = yup.object({
  month: yup.number().min(0).max(11).required(),
  year: yup.number().min(2020).max(2030).required(),
});

const MOCK_ENTRIES: BitacoraFromDB[] = [
  { id: '1', fecha: '2026-06-01', peso: 78.5, calificacion: 'A', nivel: 2, nota: 'Día limpio, buena hidratación' },
  { id: '2', fecha: '2026-06-02', peso: 78.3, calificacion: 'B', nivel: 2, nota: 'Comí bien pero cené tarde' },
  { id: '3', fecha: '2026-06-03', peso: 78.6, calificacion: 'C', nivel: 1, nota: 'Evento social, exceso moderado' },
  { id: '4', fecha: '2026-06-04', peso: 78.8, calificacion: 'A', nivel: 3, nota: 'Día perfecto, entrené doble' },
  { id: '5', fecha: '2026-06-05', peso: 78.2, calificacion: 'B', nivel: 2, nota: 'Todo en orden' },
  { id: '6', fecha: '2026-06-06', peso: 78.0, calificacion: 'D', nivel: 1, nota: 'Comida chatarra y sin ejercicio' },
  { id: '7', fecha: '2026-06-07', peso: 78.4, calificacion: 'A', nivel: 2, nota: 'Recuperé el ritmo' },
];

export const bitacoraRouter = createTRPCRouter({
  getByMonth: publicProcedure
    .input(async (raw) => {
      return await getByMonthSchema.validate(raw);
    })
    .query(({ input }) => {
      const { month, year } = input;
      return MOCK_ENTRIES.filter((entry) => {
        const date = new Date(entry.fecha);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    }),
});
