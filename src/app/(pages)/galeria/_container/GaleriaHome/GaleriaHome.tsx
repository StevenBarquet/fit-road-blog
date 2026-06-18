'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { LoadingOutlined, PictureOutlined } from '@ant-design/icons';
// ---Custom Hooks
import { useGaleriaStore } from 'src/app/_store/galeria/galeriaStore';
import { useFetchGallery } from 'src/app/_querys/bitacoraPictures/useFetchGallery';
// ---Components
import { PageHeader } from 'src/app/_layout/PageHeader/PageHeader';
import { GaleriaFilters } from './GaleriaFilters/GaleriaFilters';
import { GaleriaTimeline } from './GaleriaTimeline/GaleriaTimeline';
import { GaleriaPagination } from './GaleriaPagination/GaleriaPagination';
// ---Config
import style from './GaleriaHome.module.scss';

export function GaleriaHome(): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { from } = useGaleriaStore();
  const galleryQuery = useFetchGallery();

  const hasSearched = !!from;
  const items = galleryQuery.data?.items ?? [];
  const totalPages = galleryQuery.data?.totalPages ?? 1;

  // -----------------------RENDER
  return (
    <div className={style.GaleriaHome}>
      <PageHeader subtitle="galería" />
      <GaleriaFilters />

      {hasSearched && (
        <div className="results-section">
          {galleryQuery.isLoading && (
            <p className="loading-text"><LoadingOutlined /> Cargando...</p>
          )}

          {galleryQuery.isSuccess && items.length === 0 && (
            <div className="empty-state">
              <PictureOutlined />
              <p>Sin fotos en este rango</p>
            </div>
          )}

          {galleryQuery.isSuccess && items.length > 0 && (
            <>
              <GaleriaTimeline items={items} />
              <GaleriaPagination totalPages={totalPages} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
