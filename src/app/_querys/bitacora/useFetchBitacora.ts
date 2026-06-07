import { api } from 'src/app/_providers/_trpc/react';
import { useBitacoraStore } from 'src/app/_store/bitacoraData/bitacoraStore';

export function useFetchBitacoraMonth() {
  const { currentMonth, currentYear, setEntries } = useBitacoraStore();

  return api.bitacora.getByMonth.useQuery(
    { month: currentMonth, year: currentYear },
    {
      onSuccess: (data) => {
        setEntries(data);
      },
    }
  );
}
