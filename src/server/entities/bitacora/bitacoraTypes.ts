export const CALIFICACIONES = ['A', 'B', 'C', 'D'] as const;
export type Calificacion = (typeof CALIFICACIONES)[number];

export const NIVELES = [1, 2, 3] as const;
export type Nivel = (typeof NIVELES)[number];

export interface ModelBitacora {
  peso: number | null;
  calificacion: Calificacion | null;
  nivel: Nivel | null;
  nota: string;
}

export interface BitacoraFromDB extends ModelBitacora {
  id: string; // YYYY-MM-DD (document ID = date)
}

export type UpsertBitacora = Partial<ModelBitacora> & { id: string };
