'use client';

// ---Dependencies
import { type ReactElement, useRef } from 'react';
import { Input, Button, Upload } from 'antd';
import { CameraOutlined, PlusOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
// ---Custom Hooks
import { useDayForm } from './useDayForm';
// ---Config
import { CALIFICACIONES, NIVELES } from 'src/server/entities/bitacora/bitacoraTypes';
import { CALIFICACION_COLORS } from '../WeeklyCalendar/calendarUtils';
import { compressImageToBase64 } from 'src/app/_utils/compressImage';
import style from './DayForm.module.scss';

export function DayForm(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { formik, pictures, setPictures } = useDayForm();
  const { values, setFieldValue, isSubmitting, handleSubmit } = formik;

  const fileList: UploadFile[] = pictures.map((pic, i) => ({
    uid: `pic-${i}`,
    name: `foto-${i + 1}.jpg`,
    status: 'done',
    url: pic.base64,
  }));

  const cameraInputRef = useRef<HTMLInputElement>(null);

  // -----------------------MAIN METHODS
  async function handleUpload(file: File) {
    const base64 = await compressImageToBase64(file);
    const newPicture = { base64, createdAt: new Date().toISOString() };
    setPictures([...pictures, newPicture]);
  }

  function handleCameraCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) void handleUpload(file);
    e.target.value = '';
  }

  function handleRemove(file: UploadFile) {
    const index = fileList.findIndex((f) => f.uid === file.uid);
    if (index === -1) return;

    const newPictures = [...pictures];
    newPictures.splice(index, 1);
    setPictures(newPictures);
  }

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

        <div className="field-group">
          <label>Fotos</label>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            hidden
          />
          <Upload
            listType="picture-card"
            fileList={fileList}
            beforeUpload={(file) => {
              handleUpload(file);
              return false;
            }}
            onRemove={handleRemove}
            maxCount={3}
            accept="image/*"
          >
            {fileList.length < 3 && (
              <div>
                <PlusOutlined />
                <div className="upload-text">Galería</div>
              </div>
            )}
          </Upload>
          {fileList.length < 3 && (
            <Button
              icon={<CameraOutlined />}
              onClick={() => cameraInputRef.current?.click()}
              className="camera-btn"
            >
              Tomar foto
            </Button>
          )}
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
