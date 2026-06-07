import { setGlobalState } from "src/app/_utils/functions/storeUtils";


/** Calls a promise and add the global loading spinners */
export async function triggerFetch<T extends () => Promise<unknown>>(callback: T) {
  setGlobalState(true);
  const result = await callback();
  setGlobalState(false);

  return result as ReturnType<T>
}