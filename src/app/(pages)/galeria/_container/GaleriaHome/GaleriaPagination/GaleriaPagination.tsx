'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Pagination } from 'antd';
// ---Custom Hooks
import { useGaleriaStore } from 'src/app/_store/galeria/galeriaStore';
// ---Config
import style from './GaleriaPagination.module.scss';

interface Props {
  totalPages: number;
}

export function GaleriaPagination({ totalPages }: Props): ReactElement {
  // -----------------------CONSTS, HOOKS, STATES
  const { page, setPage } = useGaleriaStore();

  // -----------------------RENDER
  return (
    <div className={style.GaleriaPagination}>
      <Pagination
        current={page}
        total={totalPages * 10}
        pageSize={10}
        onChange={setPage}
        showSizeChanger={false}
        size="default"
      />
    </div>
  );
}
