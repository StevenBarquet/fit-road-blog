import { useEffect } from 'react';
import { api } from 'src/app/_providers/_trpc/react';
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';

export function useFetchBitacoraRange() {
  const { dateRange, setEntries } = useBitacoraStore();

  const query = api.bitacora.getByRange.useQuery(dateRange);

  useEffect(() => {
    if (query.data) setEntries(query.data);
  }, [query.data, setEntries]);

  return query;
}

export function useUpsertBitacora() {
  const utils = api.useUtils();
  const { dateRange } = useBitacoraStore();

  return api.bitacora.upsert.useMutation({
    onSuccess: () => {
      utils.bitacora.getByRange.invalidate(dateRange);
    },
  });
}

export function useDeleteBitacora() {
  const utils = api.useUtils();
  const { dateRange } = useBitacoraStore();

  return api.bitacora.delete.useMutation({
    onSuccess: () => {
      utils.bitacora.getByRange.invalidate(dateRange);
    },
  });
}
