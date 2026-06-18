'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Button, Image } from 'antd';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
import { useDeleteBitacora } from 'src/app/_querys/bitacora/useFetchBitacora';
import { useFetchBitacoraPictures } from 'src/app/_querys/bitacoraPictures/useFetchBitacoraPictures';
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
  const picturesQuery = useFetchBitacoraPictures(entry.hasPictures ? entry.id : null);

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

      {picturesQuery.data && picturesQuery.data.images.length > 0 && (
        <div className="pictures-section">
          <Image.PreviewGroup>
            {picturesQuery.data.images.map((pic, i) => (
              <Image
                key={i}
                src={pic.base64}
                width={100}
                height={100}
                style={{ objectFit: 'cover', borderRadius: 8 }}
              />
            ))}
          </Image.PreviewGroup>
        </div>
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
