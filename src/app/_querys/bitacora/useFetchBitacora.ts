import { useEffect } from 'react';
import { api } from 'src/app/_providers/_trpc/react';
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';

export function useFetchBitacoraMonth() {
  const { currentMonth, currentYear, setEntries } = useBitacoraStore();

  const query = api.bitacora.getByMonth.useQuery(
    { month: currentMonth, year: currentYear }
  );

  useEffect(() => {
    if (query.data) setEntries(query.data);
  }, [query.data, setEntries]);

  return query;
}

export function useUpsertBitacora() {
  const utils = api.useUtils();
  const { currentMonth, currentYear } = useBitacoraStore();

  return api.bitacora.upsert.useMutation({
    onSuccess: () => {
      utils.bitacora.getByMonth.invalidate({ month: currentMonth, year: currentYear });
    },
  });
}

export function useDeleteBitacora() {
  const utils = api.useUtils();
  const { currentMonth, currentYear } = useBitacoraStore();

  return api.bitacora.delete.useMutation({
    onSuccess: () => {
      utils.bitacora.getByMonth.invalidate({ month: currentMonth, year: currentYear });
    },
  });
}
