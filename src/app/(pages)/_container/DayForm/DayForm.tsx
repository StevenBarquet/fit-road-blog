'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Input, Button } from 'antd';
// ---Custom Hooks
import { useDayForm } from './useDayForm';
// ---Config
import { CALIFICACIONES, NIVELES } from 'src/server/entities/bitacora/bitacoraTypes';
import { CALIFICACION_COLORS } from '../WeeklyCalendar/calendarUtils';
import style from './DayForm.module.scss';

export function DayForm(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { formik } = useDayForm();
  const { values, setFieldValue, isSubmitting, handleSubmit } = formik;

  // -----------------------RENDER
  return (
    <div className={style.DayForm}>
      <form onSubmit={handleSubmit}>
        <div className="field-group">
          <label>Peso (kg)</label>
          <Input
            type="number"
            step="0.1"
            placeholder="Ej: 78.5"
            value={values.peso ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              setFieldValue('peso', val === '' ? null : Number(val));
            }}
          />
        </div>

        <div className="field-group">
          <label>Calificación</label>
          <div className="radio-row">
            {CALIFICACIONES.map((cal) => (
              <button
                key={cal}
                type="button"
                className={`radio-btn ${values.calificacion === cal ? 'active' : ''}`}
                style={{
                  borderColor: CALIFICACION_COLORS[cal],
                  backgroundColor: values.calificacion === cal ? CALIFICACION_COLORS[cal] : 'transparent',
                }}
                onClick={() => setFieldValue('calificacion', values.calificacion === cal ? null : cal)}
              >
                {cal}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label>Nivel</label>
          <div className="radio-row">
            {NIVELES.map((niv) => (
              <button
                key={niv}
                type="button"
                className={`radio-btn nivel ${values.nivel === niv ? 'active' : ''}`}
                onClick={() => setFieldValue('nivel', values.nivel === niv ? null : niv)}
              >
                {niv}
              </button>
            ))}
          </div>
        </div>

        <div className="field-group">
          <label>Notas</label>
          <Input.TextArea
            rows={3}
            placeholder="Particularidades del día..."
            value={values.nota}
            onChange={(e) => setFieldValue('nota', e.target.value)}
          />
        </div>

        <div className="actions">
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            block
          >
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
}
