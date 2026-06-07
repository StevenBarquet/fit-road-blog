import 'src/app/_styles/_index.scss';
import { Inter } from 'next/font/google';
import { AllProviders } from '../_providers/AllProviders';
import { LayoutProvider } from '../_layout/LayoutProvider';

const inter = Inter({
  subsets: ['latin'],
});

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
      </body>
    </html>
  );
}
