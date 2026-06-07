'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Button } from 'antd';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
import { useDeleteBitacora } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Config
import { type BitacoraFromDB } from 'src/server/entities/bitacora/bitacoraTypes';
import { CALIFICACION_COLORS, CALIFICACION_LABELS } from '../../WeeklyCalendar/calendarUtils';
import { swalApiConfirm, swalApiError } from 'src/app/_utils/functions/alertUtils';
import style from './DayReadView.module.scss';

interface Props {
  entry: BitacoraFromDB;
  onEdit: () => void;
}

export function DayReadView({ entry, onEdit }: Props): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { setDrawerMode } = useBitacoraStore();
  const deleteMutation = useDeleteBitacora();

  // -----------------------MAIN METHODS
  async function handleDelete() {
    await swalApiConfirm({
      callback: async () => {
        try {
          await deleteMutation.mutateAsync({ id: entry.id });
          setDrawerMode('closed');
        } catch {
          await swalApiError('Error al eliminar el registro');
        }
      },
      confirmMsg: '¿Seguro que quieres eliminar el registro de este día?',
      successMsg: 'Registro eliminado',
    });
  }

  // -----------------------RENDER
  return (
    <div className={style.DayReadView}>
      {entry.calificacion && (
        <div className="calificacion-section">
          <span
            className="cal-badge"
            style={{ backgroundColor: CALIFICACION_COLORS[entry.calificacion] }}
          >
            {entry.calificacion}
          </span>
          <span className="cal-label">{CALIFICACION_LABELS[entry.calificacion]}</span>
          {entry.nivel && <span className="nivel">Nivel {entry.nivel}</span>}
        </div>
      )}

      {entry.peso && (
        <div className="peso-section">
          <span className="peso-value">{entry.peso}</span>
          <span className="peso-unit">kg</span>
        </div>
      )}

      {entry.nota && (
        <blockquote>{entry.nota}</blockquote>
      )}

      <div className="actions">
        <Button type="primary" block onClick={onEdit}>
          Editar
        </Button>
        <Button danger type="text" block onClick={handleDelete}>
          Eliminar registro
        </Button>
      </div>
    </div>
  );
}
