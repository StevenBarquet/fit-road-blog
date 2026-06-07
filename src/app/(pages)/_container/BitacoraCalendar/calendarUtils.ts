import { type Calificacion } from 'src/server/entities/bitacora/bitacoraTypes';

export const CALIFICACION_COLORS: Record<Calificacion, string> = {
  A: '#52c41a',
  B: '#1890ff',
  C: '#faad14',
  D: '#ff4d4f',
};

export const CALIFICACION_LABELS: Record<Calificacion, string> = {
  A: 'Excelente',
  B: 'Bien',
  C: 'Regular',
  D: 'Mal',
};
