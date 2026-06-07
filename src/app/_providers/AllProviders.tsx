import { type ReactNode } from 'react';
import { AntdProv } from './AntdProv/AntdProv';
import { TRPCReactProvider } from './_trpc/react';

export function AllProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <TRPCReactProvider>
        <AntdProv>{children}</AntdProv>
      </TRPCReactProvider>
    </>
  );
}
