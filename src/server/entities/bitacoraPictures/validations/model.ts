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

export const galleryGetSchema = yup.object({
  from: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  to: yup.string().required().matches(/^\d{4}-\d{2}-\d{2}$/),
  frequency: yup.string().required().oneOf(['daily', 'weekly', 'monthly', 'yearly']),
  page: yup.number().required().min(1).integer(),
});
