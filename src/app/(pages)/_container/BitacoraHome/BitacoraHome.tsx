'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Spin } from 'antd';
import { Icon } from '@iconify/react';
// ---Custom Hooks
import { useFetchBitacoraRange } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Components
import { WeeklyCalendar } from '../WeeklyCalendar/WeeklyCalendar';
import { DayDrawer } from '../DayDrawer/DayDrawer';
import { ExportDrawer } from '../ExportDrawer/ExportDrawer';
// ---Config
import style from './BitacoraHome.module.scss';

export function BitacoraHome(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { isLoading } = useFetchBitacoraRange();
  const [exportOpen, setExportOpen] = useState(false);

  // -----------------------RENDER
  return (
    <div className={style.BitacoraHome}>
      <header>
        <div className="brand">
          <span className="brand-icon">🔥</span>
          <div className="brand-text">
            <h1>Fit Road</h1>
            <span className="brand-sub">bitácora alimentación</span>
          </div>
        </div>
        <button className="export-btn" onClick={() => setExportOpen(true)} type="button">
          <Icon icon="mdi:download" width={20} />
        </button>
      </header>

      {isLoading ? (
        <div className="center-block">
          <Spin size="large" />
        </div>
      ) : (
        <WeeklyCalendar />
      )}

      <DayDrawer />
      <ExportDrawer open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
