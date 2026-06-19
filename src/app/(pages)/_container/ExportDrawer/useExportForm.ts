import { useFormik } from 'formik';
import * as yup from 'yup';
import dayjs, { type Dayjs } from 'dayjs';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Config
import {
  CALIFICACIONES,
  NIVELES,
  type BitacoraFromDB,
} from 'src/server/entities/bitacora/bitacoraTypes';

export type NotasMode = 'none' | 'all' | 'filtered';

export interface ExportFormValues {
  range: [Dayjs | null, Dayjs | null];
  fields: string[];
  calificaciones: string[];
  notasMode: NotasMode;
  notasCalificaciones: string[];
}

const ALL_COMBOS = CALIFICACIONES.flatMap((c) =>
  NIVELES.map((n) => `${c}${n}`)
);

const validationSchema = yup.object({
  range: yup
    .array()
    .of(yup.mixed().nullable())
    .test('range-complete', 'Selecciona un rango completo', (val) => {
      if (!val) return false;
      return val[0] != null && val[1] != null;
    }),
  fields: yup
    .array()
    .of(yup.string())
    .min(1, 'Selecciona al menos un campo'),
  calificaciones: yup
    .array()
    .of(yup.string())
    .min(1, 'Selecciona al menos una calificación'),
  notasMode: yup.string().oneOf(['none', 'all', 'filtered']),
  notasCalificaciones: yup
    .array()
    .of(yup.string())
    .when('notasMode', {
      is: 'filtered',
      then: (schema) => schema.min(1, 'Selecciona al menos una calificación para notas'),
    }),
});

export function useExportForm(onExport: (text: string) => void) {
  const { entries } = useBitacoraStore();

  const formik = useFormik<ExportFormValues>({
    initialValues: {
      range: [dayjs().subtract(1, 'month'), dayjs()],
      fields: ['peso', 'calificacion', 'hasPictures'],
      calificaciones: [...ALL_COMBOS],
      notasMode: 'all',
      notasCalificaciones: [],
    },
    validationSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      const text = buildExportText(entries, values);
      onExport(text);
    },
  });

  const canSubmit =
    formik.values.range[0] != null &&
    formik.values.range[1] != null &&
    formik.values.fields.length > 0 &&
    formik.values.calificaciones.length > 0 &&
    (formik.values.notasMode !== 'filtered' || formik.values.notasCalificaciones.length > 0);

  return { formik, ALL_COMBOS, canSubmit };
}

function buildExportText(entries: BitacoraFromDB[], values: ExportFormValues): string {
  const from = values.range[0]!.format('YYYY-MM-DD');
  const to = values.range[1]!.format('YYYY-MM-DD');

  const filtered = entries.filter((e) => {
    if (e.id < from || e.id > to) return false;
    const combo = e.calificacion ? `${e.calificacion}${e.nivel ?? ''}` : null;
    if (!combo) return false;
    return values.calificaciones.includes(combo);
  });

  if (filtered.length === 0) return 'Sin registros en este periodo con los filtros seleccionados.';

  const sorted = [...filtered].sort((a, b) => a.id.localeCompare(b.id));

  return sorted.map((entry) => {
    const lines: string[] = [dayjs(entry.id).format('DD-MMMM-YYYY')];

    if (values.fields.includes('calificacion')) {
      const cal = entry.calificacion
        ? `${entry.calificacion}${entry.nivel ?? ''}`
        : 'NA';
      lines.push(cal);
    }

    if (values.fields.includes('peso')) {
      lines.push(entry.peso ? `${entry.peso}kg` : 'NA');
    }

    if (values.fields.includes('hasPictures')) {
      lines.push(entry.hasPictures ? '📷 Sí' : '📷 No');
    }

    const nota = resolveNota(entry, values);
    if (nota !== null) {
      lines.push(nota);
    }

    return lines.join('\n');
  }).join('\n\n');
}

function resolveNota(entry: BitacoraFromDB, values: ExportFormValues): string | null {
  if (values.notasMode === 'none') return null;

  if (values.notasMode === 'all') {
    return entry.nota ? `Nota: ${entry.nota}` : null;
  }

  const combo = entry.calificacion ? `${entry.calificacion}${entry.nivel ?? ''}` : null;
  if (!combo || !values.notasCalificaciones.includes(combo)) return null;
  return entry.nota ? `Nota: ${entry.nota}` : null;
}
