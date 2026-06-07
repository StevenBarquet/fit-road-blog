import 'src/app/_styles/_index.scss';
import { type Metadata, type Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AllProviders } from '../_providers/AllProviders';
import { LayoutProvider } from '../_layout/LayoutProvider';
import { ServiceWorkerRegister } from '../_common/ServiceWorkerRegister/ServiceWorkerRegister';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Fit Road',
  description: 'Registro diario de alimentación y peso',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Fit Road',
  },
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#16a4ab',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AllProviders>
          <LayoutProvider>{children}</LayoutProvider>
        </AllProviders>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
