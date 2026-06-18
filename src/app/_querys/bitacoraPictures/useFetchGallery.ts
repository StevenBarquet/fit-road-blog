import { api } from 'src/app/_providers/_trpc/react';
import { useGaleriaStore } from 'src/app/_store/galeria/galeriaStore';

export function useFetchGallery() {
  const { from, to, frequency, page } = useGaleriaStore();

  return api.bitacoraPictures.getGallery.useQuery(
    { from: from!, to: to!, frequency, page },
    { enabled: !!from && !!to },
  );
}
