import { useFormik } from 'formik';
import * as yup from 'yup';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
import { useUpsertBitacora } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Config
import { type BitacoraFromDB, type Calificacion, type Nivel } from 'src/server/entities/bitacora/bitacoraTypes';
import { swalApiConfirm, swalApiError } from 'src/app/_utils/functions/alertUtils';

const formSchema = yup.object({
  peso: yup.number().nullable().positive().max(300),
  calificacion: yup.string().nullable().oneOf(['A', 'B', 'C', 'D', null]),
  nivel: yup.number().nullable().oneOf([1, 2, 3, null]),
  nota: yup.string().default(''),
});

export interface DayFormValues {
  peso: number | null;
  calificacion: string | null;
  nivel: number | null;
  nota: string;
}

function getInitialValues(entry: BitacoraFromDB | undefined): DayFormValues {
  return {
    peso: entry?.peso ?? null,
    calificacion: entry?.calificacion ?? null,
    nivel: entry?.nivel ?? null,
    nota: entry?.nota ?? '',
  };
}

function hasOverwrittenFields(
  original: BitacoraFromDB | undefined,
  current: DayFormValues
): boolean {
  if (!original) return false;
  if (original.peso !== null && current.peso !== original.peso) return true;
  if (original.calificacion !== null && current.calificacion !== original.calificacion) return true;
  if (original.nivel !== null && current.nivel !== original.nivel) return true;
  if (original.nota && current.nota !== original.nota) return true;
  return false;
}

export function useDayForm() {
  const { selectedDate, getSelectedEntry, setDrawerMode } = useBitacoraStore();
  const upsertMutation = useUpsertBitacora();
  const entry = getSelectedEntry();

  const formik = useFormik<DayFormValues>({
    initialValues: getInitialValues(entry),
    validationSchema: formSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      if (!selectedDate) return;

      const doUpsert = async () => {
        try {
          await upsertMutation.mutateAsync({
            id: selectedDate,
            peso: values.peso,
            calificacion: values.calificacion as Calificacion | null,
            nivel: values.nivel ? Number(values.nivel) as Nivel : null,
            nota: values.nota,
          });
          setDrawerMode('closed');
        } catch {
          await swalApiError('Error al guardar el registro');
        }
      };

      if (hasOverwrittenFields(entry, values)) {
        await swalApiConfirm({
          callback: doUpsert,
          confirmMsg: 'Ya existe un registro de este día con datos que modificaste, ¿seguro que quieres continuar?',
          successMsg: 'Registro actualizado',
        });
      } else {
        await doUpsert();
      }
    },
  });

  return { formik };
}
