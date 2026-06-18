'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Icon } from '@iconify/react';
// ---Config
import style from './EmptyState.module.scss';

interface Props {
  icon: string;
  text: string;
}

export function EmptyState({ icon, text }: Props): ReactElement {
  // -----------------------RENDER
  return (
    <div className={style.EmptyState}>
      <Icon icon={icon} width={48} />
      <p>{text}</p>
    </div>
  );
}
