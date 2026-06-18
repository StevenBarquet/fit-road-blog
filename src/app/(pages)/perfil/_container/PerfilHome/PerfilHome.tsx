'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Icon } from '@iconify/react';
// ---Config
import style from './PerfilHome.module.scss';

export function PerfilHome(): ReactElement {
  // -----------------------RENDER
  return (
    <div className={style.PerfilHome}>
      <header>
        <div className="brand">
          <span className="brand-icon">🔥</span>
          <div className="brand-text">
            <h1>Fit Road</h1>
            <span className="brand-sub">mi perfil</span>
          </div>
        </div>
      </header>

      <div className="empty-state">
        <Icon icon="mdi:account-circle-outline" width={48} />
        <p>Perfil en construcción</p>
      </div>
    </div>
  );
}
