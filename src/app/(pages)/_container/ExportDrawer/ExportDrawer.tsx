'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Drawer, DatePicker, Button, message } from 'antd';
import { Icon } from '@iconify/react';
import dayjs, { type Dayjs } from 'dayjs';
import 'dayjs/locale/es';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Config
import { type BitacoraFromDB } from 'src/server/entities/bitacora/bitacoraTypes';
import style from './ExportDrawer.module.scss';

dayjs.locale('es');

const { RangePicker } = DatePicker;

interface Props {
  open: boolean;
  onClose: () => void;
}

function formatEntries(entries: BitacoraFromDB[]): string {
  const sorted = [...entries].sort((a, b) => a.id.localeCompare(b.id));

  return sorted.map((entry) => {
    const date = dayjs(entry.id).format('DD-MMMM-YYYY');
    const cal = entry.calificacion
      ? `${entry.calificacion}${entry.nivel ?? ''}`
      : 'NA';
    const peso = entry.peso ? `${entry.peso}kg` : 'NA';
    const nota = entry.nota ? `Nota: ${entry.nota}` : 'NA';
    return `${date}\n${cal}\n${peso}\n${nota}`;
  }).join('\n\n');
}

export function ExportDrawer({ open, onClose }: Props): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { entries } = useBitacoraStore();
  const [range, setRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(1, 'month'),
    dayjs(),
  ]);
  const [exportText, setExportText] = useState<string | null>(null);

  // -----------------------MAIN METHODS
  function handleRangeChange(dates: [Dayjs | null, Dayjs | null] | null) {
    if (dates) setRange(dates);
  }

  function handleExport() {
    if (!range[0] || !range[1]) return;
    const from = range[0].format('YYYY-MM-DD');
    const to = range[1].format('YYYY-MM-DD');

    const filtered = entries.filter((e) => e.id >= from && e.id <= to);
    const text = filtered.length > 0
      ? formatEntries(filtered)
      : 'Sin registros en este periodo.';

    setExportText(text);
  }

  async function handleCopy() {
    if (!exportText) return;
    await navigator.clipboard.writeText(exportText);
    message.success('Copiado al portapapeles');
  }

  function handleClose() {
    setExportText(null);
    onClose();
  }

  // -----------------------RENDER
  return (
    <Drawer
      open={open}
      onClose={handleClose}
      placement="bottom"
      height={exportText ? '80vh' : 'auto'}
      title="Exportar datos"
      className={style.ExportDrawer}
      destroyOnClose
    >
      <p className="subtitle">¿Qué periodo quieres exportar?</p>

      <div className="picker-wrapper">
        <RangePicker
          value={range}
          onChange={handleRangeChange}
          format="DD MMM YYYY"
          size="large"
          style={{ width: '100%' }}
        />
      </div>

      <div className="actions">
        <Button
          type="primary"
          block
          size="large"
          onClick={handleExport}
          disabled={!range[0] || !range[1]}
        >
          Exportar
        </Button>
      </div>

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
