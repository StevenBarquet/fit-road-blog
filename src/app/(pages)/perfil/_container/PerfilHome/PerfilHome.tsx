'use client';

// ---Dependencies
import { type ReactElement } from 'react';
// ---Components
import { PageHeader } from 'src/app/_layout/PageHeader/PageHeader';
import { EmptyState } from 'src/app/_common/EmptyState/EmptyState';
// ---Config
import style from './PerfilHome.module.scss';

export function PerfilHome(): ReactElement {
  // -----------------------RENDER
  return (
    <div className={style.PerfilHome}>
      <PageHeader subtitle="mi perfil" />
      <EmptyState icon="mdi:account-circle-outline" text="Perfil en construcción" />
    </div>
  );
}
