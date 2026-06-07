'use client';

// ---Dependencies
import { type ReactElement, useState } from 'react';
import { Drawer } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
// ---Custom Hooks
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';
// ---Components
import { DayReadView } from './DayReadView/DayReadView';
import { DayForm } from '../DayForm/DayForm';
// ---Config
import style from './DayDrawer.module.scss';

dayjs.locale('es');

export function DayDrawer(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { drawerMode, setDrawerMode, selectedDate, getSelectedEntry } = useBitacoraStore();
  const entry = getSelectedEntry();
  const [isEditing, setIsEditing] = useState(false);

  const isOpen = drawerMode !== 'closed';
  const showForm = drawerMode === 'form' || isEditing;

  const title = selectedDate
    ? dayjs(selectedDate).format('dddd D [de] MMMM')
    : '';

  // -----------------------MAIN METHODS
  function handleClose() {
    setDrawerMode('closed');
    setIsEditing(false);
  }

  function handleEdit() {
    setIsEditing(true);
  }

  // -----------------------RENDER
  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}
      placement="bottom"
      height={showForm ? '70vh' : 'auto'}
      title={title}
      className={style.DayDrawer}
      destroyOnClose
    >
      {showForm ? (
        <DayForm />
      ) : entry ? (
        <DayReadView entry={entry} onEdit={handleEdit} />
      ) : null}
    </Drawer>
  );
}
