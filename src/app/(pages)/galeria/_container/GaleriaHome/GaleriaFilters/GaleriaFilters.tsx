'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Button, DatePicker, Segmented } from 'antd';
import { CalendarOutlined, SearchOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
// ---Custom Hooks
import { useGaleriaStore } from 'src/app/_store/galeria/galeriaStore';
// ---Config
import style from './GaleriaFilters.module.scss';

const FREQUENCY_OPTIONS = [
  { label: 'Diario', value: 'daily' },
  { label: 'Semanal', value: 'weekly' },
  { label: 'Mensual', value: 'monthly' },
  { label: 'Anual', value: 'yearly' },
];

export function GaleriaFilters(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { from, to, frequency, panelOpen, setFilters, setPanelOpen } = useGaleriaStore();

  const [localFrom, setLocalFrom] = useState<Dayjs | null>(from ? dayjs(from) : null);
  const [localTo, setLocalTo] = useState<Dayjs | null>(to ? dayjs(to) : null);
  const [localFrequency, setLocalFrequency] = useState(frequency);

  // -----------------------MAIN METHODS
  function handleSearch() {
    if (!localFrom || !localTo) return;
    setFilters({
      from: localFrom.format('YYYY-MM-DD'),
      to: localTo.format('YYYY-MM-DD'),
      frequency: localFrequency,
    });
  }

  // -----------------------RENDER
  return (
    <div className={style.GaleriaFilters}>
      <Button
        type="text"
        block
        onClick={() => setPanelOpen(!panelOpen)}
        icon={<FilterOutlined />}
      >
        Filtros
      </Button>

      {panelOpen && (
        <div className="filter-content">
          <div className="date-row">
            <div className="date-field">
              <label><CalendarOutlined /> Desde</label>
              <DatePicker
                value={localFrom}
                onChange={setLocalFrom}
                format="DD-MMM-YYYY"
                placeholder="Inicio"
                size="middle"
              />
            </div>
            <div className="date-field">
              <label><CalendarOutlined /> Hasta</label>
              <DatePicker
                value={localTo}
                onChange={setLocalTo}
                format="DD-MMM-YYYY"
                placeholder="Fin"
                size="middle"
              />
            </div>
          </div>

          <div className="filter-row">
            <label>Frecuencia</label>
            <Segmented
              options={FREQUENCY_OPTIONS}
              value={localFrequency}
              onChange={(val) => setLocalFrequency(val as typeof localFrequency)}
              block
            />
          </div>

          <Button
            type="primary"
            block
            onClick={handleSearch}
            disabled={!localFrom || !localTo}
            icon={<SearchOutlined />}
            size="large"
          >
            Buscar
          </Button>
        </div>
      )}
    </div>
  );
}
