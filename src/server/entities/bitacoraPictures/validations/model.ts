import * as yup from 'yup';

export const picturesGetByDateSchema = yup.object({
  id: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
});

export const picturesUpsertSchema = yup.object({
  id: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  images: yup.array().of(
    yup.object({
      base64: yup.string().required(),
      createdAt: yup.string().required(),
    })
  ).max(3).required(),
});
