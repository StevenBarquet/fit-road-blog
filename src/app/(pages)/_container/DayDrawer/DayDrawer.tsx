'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Drawer } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Components
import { DayForm } from '../DayForm/DayForm';
// ---Config
import style from './DayDrawer.module.scss';

dayjs.locale('es');

export function DayDrawer(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { drawerOpen, setDrawerOpen, selectedDate } = useBitacoraStore();

  const title = selectedDate
    ? dayjs(selectedDate).format('dddd D [de] MMMM')
    : '';

  // -----------------------RENDER
  return (
    <Drawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      placement="bottom"
      height="70vh"
      title={title}
      className={style.DayDrawer}
      destroyOnClose
    >
      <DayForm />
    </Drawer>
  );
}
