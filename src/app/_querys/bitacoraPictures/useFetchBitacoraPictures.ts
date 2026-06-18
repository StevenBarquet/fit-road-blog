import { api } from 'src/app/_providers/_trpc/react';

export function useFetchBitacoraPictures(dateId: string | null) {
  return api.bitacoraPictures.getByDate.useQuery(
    { id: dateId! },
    { enabled: !!dateId }
  );
}

export function useUpsertBitacoraPictures() {
  const utils = api.useUtils();

  return api.bitacoraPictures.upsert.useMutation({
    onSuccess: (_data, variables) => {
      utils.bitacoraPictures.getByDate.invalidate({ id: variables.id });
    },
  });
}
