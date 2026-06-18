'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Spin } from 'antd';
import { Icon } from '@iconify/react';
// ---Custom Hooks
import { useFetchBitacoraRange } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Components
import { PageHeader } from 'src/app/_layout/PageHeader/PageHeader';
import { WeeklyCalendar } from '../WeeklyCalendar/WeeklyCalendar';
import { TimeNav } from './TimeNav/TimeNav';
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
      <PageHeader subtitle="bitácora alimentación" />

      <TimeNav />

      {isLoading ? (
        <div className="center-block">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <WeeklyCalendar />
          <button className="export-btn" onClick={() => setExportOpen(true)} type="button">
            <Icon icon="mdi:download" width={18} />
            <span>Exportar</span>
          </button>
        </>
      )}

      <DayDrawer />
      <ExportDrawer open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
