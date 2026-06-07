// ---Dependencies
import { ConfigProvider } from 'antd';
import React, { type ReactNode } from 'react';
import colors from './appColors.module.scss';

export const appColors = colors;

interface Props {
  children: ReactNode;
}

/**
 * AntdProv Component:  Descripción del comportamiento...
 * @param {Props} props - Parámetros del componente como: ...
 */
export function AntdProv({ children }: Props) {
  // -----------------------CONSTS, HOOKS, STATES
  // -----------------------MAIN METHODS
  // -----------------------AUX METHODS
  // -----------------------RENDER
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: colors.primaryColor || undefined,
          colorBgContainer: '#1a1a2e',
          colorBgElevated: '#1a1a2e',
          colorText: '#e8e8f0',
          colorTextSecondary: '#8888a0',
          colorBorder: '#2a2a3e',
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
