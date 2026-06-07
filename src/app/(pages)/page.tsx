import { type Metadata } from 'next';
import { BitacoraHome } from './_container/BitacoraHome/BitacoraHome';

export default BitacoraHome;

export const metadata: Metadata = {
  title: 'Bitácora',
  description: 'Bitácora diaria de seguimiento',
  icons: [{ rel: 'icon', url: '/favicon.png' }]
};
