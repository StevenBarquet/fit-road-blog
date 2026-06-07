import * as yup from 'yup';

export const bitacoraSchema = yup.object({
  fecha: yup.string().required(),
  peso: yup.number().required().positive(),
  calificacion: yup.string().required(),
  nivel: yup.number().required().min(1).max(10),
  nota: yup.string().default(''),
});
