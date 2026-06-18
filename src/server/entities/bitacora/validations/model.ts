import * as yup from 'yup';

export const bitacoraUpsertSchema = yup.object({
  id: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  peso: yup.number().nullable().positive().max(300),
  calificacion: yup.string().nullable().oneOf(['A', 'B', 'C', 'D', null]),
  nivel: yup.number().nullable().oneOf([1, 2, 3, null]),
  nota: yup.string().default(''),
  hasPictures: yup.boolean().default(false),
});

export const bitacoraDeleteSchema = yup.object({
  id: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
});

export const bitacoraGetByMonthSchema = yup.object({
  month: yup.number().min(0).max(11).required(),
  year: yup.number().min(2020).max(2100).required(),
});

export const bitacoraGetByRangeSchema = yup.object({
  from: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  to: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
});
