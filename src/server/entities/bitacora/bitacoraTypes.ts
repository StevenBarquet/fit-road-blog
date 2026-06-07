export const CALIFICACIONES = ['A', 'B', 'C', 'D'] as const;
export type Calificacion = (typeof CALIFICACIONES)[number];

export const NIVELES = [1, 2, 3] as const;
export type Nivel = (typeof NIVELES)[number];

export interface ModelBitacora {
  fecha: string;
  peso: number;
  calificacion: Calificacion;
  nivel: Nivel;
  nota: string;
}

export interface BitacoraFromDB extends ModelBitacora {
  id: string;
}

export interface ModelBitacoraUpdate extends Partial<ModelBitacora> {
  id: string;
}

export type CreateBitacora = ModelBitacora;
