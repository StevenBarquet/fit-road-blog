'use client';

// ---Dependencies
import { type ReactElement } from 'react';
// ---Components
import { PageHeader } from 'src/app/_layout/PageHeader/PageHeader';
import { EmptyState } from 'src/app/_common/EmptyState/EmptyState';
// ---Config
import style from './GaleriaHome.module.scss';

export function GaleriaHome(): ReactElement {
  // -----------------------RENDER
  return (
    <div className={style.GaleriaHome}>
      <PageHeader subtitle="galería" />
      <EmptyState icon="mdi:image-multiple-outline" text="Galería en construcción" />
    </div>
  );
}
