'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Drawer, DatePicker, Button, Checkbox, message } from 'antd';
import { Icon } from '@iconify/react';
import { FilterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
// ---Custom Hooks
import { useExportForm } from './useExportForm';
// ---Components
import { FToggleGrid } from 'src/app/_common/FormControl/Formik/FToggleGrid/FToggleGrid';
import { FRadioGroup } from 'src/app/_common/FormControl/Formik/FRadioGroup/FRadioGroup';
// ---Config
import style from './ExportDrawer.module.scss';

dayjs.locale('es');

const { RangePicker } = DatePicker;

const FIELD_OPTIONS = [
  { label: 'Peso', value: 'peso' },
  { label: 'Calificación', value: 'calificacion' },
  { label: 'Fotos', value: 'hasPictures' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ExportDrawer({ open, onClose }: Props): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const [panelOpen, setPanelOpen] = useState(true);
  const [exportText, setExportText] = useState<string | null>(null);

  const { formik, ALL_COMBOS, canSubmit } = useExportForm((text) => {
    setExportText(text);
    setPanelOpen(false);
  });

  const notasOptions = [
    {
      label: 'Ninguna',
      value: 'none',
      icon: <Icon icon="mdi:note-off-outline" />,
    },
    {
      label: 'Todas',
      value: 'all',
      icon: <Icon icon="mdi:note-check-outline" />,
    },
    {
      label: 'Notas específicas',
      value: 'filtered',
      icon: <Icon icon="mdi:note-search-outline" />,
      extra: (
        <FToggleGrid
          formik={formik}
          valueName="notasCalificaciones"
          options={ALL_COMBOS}
          columns={4}
          compact
        />
      ),
    },
  ];

  // -----------------------MAIN METHODS
  async function handleCopy() {
    if (!exportText) return;
    await navigator.clipboard.writeText(exportText);
    message.success('Copiado al portapapeles');
  }

  function handleClose() {
    setExportText(null);
    setPanelOpen(true);
    formik.resetForm();
    onClose();
  }

  // -----------------------RENDER
  return (
    <Drawer
      open={open}
      onClose={handleClose}
      placement="bottom"
      height={exportText ? '85vh' : 'auto'}
      title={
        <span className="drawer-title">
          <Icon icon="mdi:file-export-outline" /> Exportar datos
        </span>
      }
      className={style.ExportDrawer}
      destroyOnClose
    >
      <Button
        type="text"
        block
        onClick={() => setPanelOpen(!panelOpen)}
        icon={<FilterOutlined />}
        className="toggle-btn"
      >
        {panelOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
      </Button>

      {panelOpen && (
        <div className="filter-content">
          <section className="filter-section">
            <label className="section-label">
              <Icon icon="mdi:calendar-range" /> Periodo
            </label>
            <RangePicker
              value={formik.values.range}
              onChange={(dates) => {
                formik.setFieldValue('range', dates || [null, null]);
                formik.setFieldTouched('range', true);
              }}
              format="DD MMM YYYY"
              size="large"
              popupClassName={style.rangeDropdown}
              style={{ width: '100%' }}
            />
            {formik.touched.range && formik.errors.range && (
              <div className="customHelper">{String(formik.errors.range)}</div>
            )}
          </section>

          <section className="filter-section">
            <label className="section-label">
              <Icon icon="mdi:format-list-checks" /> Campos a exportar
            </label>
            <div className="fields-group">
              <Checkbox.Group
                value={formik.values.fields}
                onChange={(checked) => {
                  formik.setFieldValue('fields', checked);
                  formik.setFieldTouched('fields', true);
                }}
              >
                {FIELD_OPTIONS.map((opt) => (
                  <Checkbox key={opt.value} value={opt.value}>
                    {opt.label}
                  </Checkbox>
                ))}
              </Checkbox.Group>
            </div>
            {formik.touched.fields && formik.errors.fields && (
              <div className="customHelper">{String(formik.errors.fields)}</div>
            )}
          </section>

          <section className="filter-section">
            <FToggleGrid
              label="Filtrar por calificación"
              formik={formik}
              valueName="calificaciones"
              options={ALL_COMBOS}
              columns={4}
            />
          </section>

          <section className="filter-section">
            <FRadioGroup
              label="Notas"
              formik={formik}
              valueName="notasMode"
              options={notasOptions}
            />
          </section>

          <Button
            type="primary"
            block
            size="large"
            onClick={() => formik.handleSubmit()}
            disabled={!canSubmit}
            icon={<Icon icon="mdi:export" />}
            className="export-btn"
          >
            Generar exportación
          </Button>
        </div>
      )}

      {exportText && (
        <div className="export-result">
          <Button
            type="default"
            icon={<Icon icon="mdi:content-copy" />}
            onClick={handleCopy}
            className="copy-btn"
          >
            Copiar al portapapeles
          </Button>
          <pre className="export-block">{exportText}</pre>
        </div>
      )}
    </Drawer>
  );
}
