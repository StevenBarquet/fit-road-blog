'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Spin } from 'antd';
// ---Custom Hooks
import { useFetchBitacoraMonth } from 'src/app/_querys/bitacora/useFetchBitacora';
// ---Components
import { BitacoraCalendar } from '../BitacoraCalendar/BitacoraCalendar';
import { DaySummary } from '../DaySummary/DaySummary';
// ---Config
import style from './BitacoraHome.module.scss';

export function BitacoraHome(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { isLoading } = useFetchBitacoraMonth();

  // -----------------------RENDER
  return (
    <div className={style.BitacoraHome}>
      <h1>Bitácora Alimentación</h1>

      {isLoading ? (
        <div className="center-block">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <BitacoraCalendar />
          <DaySummary />
        </>
      )}
    </div>
  );
}
